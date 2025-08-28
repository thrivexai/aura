// D:\Aura\frontend\src\utils\visitorTracking.js
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// ==============================
// Helpers de sesión (cookie)
// ==============================
export const getSessionId = () => {
  const pairs = document.cookie.split(';');
  for (const p of pairs) {
    const cookie = p.trim();
    if (cookie.startsWith('sessionId=')) return cookie.slice('sessionId='.length);
  }
  return null;
};

export const setSessionId = (sessionId) => {
  // Persiste en cookie de SESIÓN (sin expires). Ajusta SameSite/Secure en prod HTTPS.
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sessionId=${sessionId}; path=/; SameSite=Lax${secure}`;
};

export const getOrInitSessionId = () => {
  let sid = getSessionId();
  if (!sid) {
    sid = uuidv4();
    setSessionId(sid);
    console.warn('[visitorTracking] No había sessionId; se creó uno nuevo:', sid);
  }
  return sid;
};

// ======================================
/* Geo cacheado por sesión (IP + país)
   - Usa sessionStorage para “una vez por sesión/pestaña”.
   - Dedupe en memoria para evitar fetchs concurrentes. */
// ======================================
const GEO_CACHE_KEY = (sid) => `geo_by_session:${sid}`;
const inflightGeoBySid = new Map(); // sid -> Promise

const getCachedGeo = (sid) => {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY(sid));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveGeoCache = (sid, geo) => {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY(sid), JSON.stringify(geo));
  } catch {}
};

// Timeout helper
const withTimeout = (ms, promise) =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms);
    promise
      .then((res) => {
        clearTimeout(id);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });

const fetchGeoFromIpapi = async () => {
  try {
    const resp = await withTimeout(3500, fetch('https://ipapi.co/json/'));
    if (!resp.ok) throw new Error(`ipapi status ${resp.status}`);
    const j = await resp.json();
    return {
      ip: j?.ip || null,
      // ipapi usa "country" (ISO-2). Algunos wrappers exponen "country_code".
      country_code: j?.country_code || j?.country || null,
      country_name: j?.country_name || null,
      source: 'ipapi',
      ts: Date.now(),
    };
  } catch (e) {
    console.error('[visitorTracking] ipapi.co fallo:', e);
    return {
      ip: null,
      country_code: null,
      country_name: null,
      source: 'fallback',
      ts: Date.now(),
    };
  }
};

/** Devuelve { ip, country_code } desde cache o hace 1 fetch por sesión (con dedupe) */
export const getOrFetchGeo = async (sessionId) => {
  const sid = sessionId || getOrInitSessionId();

  // 1) Cache de sesión
  const cached = getCachedGeo(sid);
  if (cached && (cached.ip || cached.country_code)) return cached;

  // 2) Si ya hay un fetch en vuelo para este sid, reutilizarlo
  if (inflightGeoBySid.has(sid)) {
    return inflightGeoBySid.get(sid);
  }

  // 3) Lanzar fetch y cachearlo
  const p = (async () => {
    const geo = await fetchGeoFromIpapi();
    saveGeoCache(sid, geo);
    inflightGeoBySid.delete(sid);
    return geo;
  })();

  inflightGeoBySid.set(sid, p);
  return p;
};

/** Prefetch cómodo para Landing (garantiza que quede cacheado) */
export const ensureGeoCached = async (sessionId) => {
  const sid = sessionId || getOrInitSessionId();
  const cached = getCachedGeo(sid);
  if (cached && (cached.ip || cached.country_code)) return cached;
  return getOrFetchGeo(sid);
};

// ======================================
// Tracking principal de visitante
// ======================================
export const trackVisitor = async (location) => {
  // 1) session_id estable (cookie)
  const sessionId = getOrInitSessionId();

  const userAgent = navigator.userAgent || '';
  const referrer = document.referrer || '';
  const currentPath = location?.pathname || window.location.pathname || '';
  const search = location?.search || window.location.search || '';

  // UTM en snake_case
  const urlParams = new URLSearchParams(search);
  const utm_source   = urlParams.get('utm_source')   || '';
  const utm_medium   = urlParams.get('utm_medium')   || '';
  const utm_campaign = urlParams.get('utm_campaign') || '';
  const utm_content  = urlParams.get('utm_content')  || '';
  const utm_term     = urlParams.get('utm_term')     || '';

  // 2) GEO cacheado por sessionId (solo 1 fetch por sesión)
  const { ip: client_ip, country_code } = await getOrFetchGeo(sessionId);

  // 3) Lee el visitor actual para conocer page_views
  let currentViews = 0;
  try {
    const { data: existing, error: selError } = await supabase
      .from('visitors')
      .select('page_views')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (selError) {
      console.error('Error selecting visitor:', selError);
    } else if (existing?.page_views) {
      currentViews = Number(existing.page_views) || 0;
    }
  } catch (e) {
    console.error('Unexpected select error:', e);
  }

  const nowIso = new Date().toISOString();

  // 4) UPSERT (crea si no existe, actualiza si existe)
  try {
    const payload = {
      session_id: sessionId,
      client_ip,
      user_agent: userAgent,
      referrer,
      current_path: currentPath,
      first_visit: nowIso,   // Mantén el primero con trigger si prefieres
      last_visit: nowIso,
      page_views: currentViews + 1,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      country_code,
    };

    const { error: upsertError } = await supabase
      .from('visitors')
      .upsert(payload, { onConflict: 'session_id' })
      .select();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
    }
  } catch (e) {
    console.error('Unexpected upsert error:', e);
  }
};