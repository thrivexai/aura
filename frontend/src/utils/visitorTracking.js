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
  // Persiste en cookie; ajusta SameSite/Secure según tu dominio/https
  document.cookie = `sessionId=${sessionId}; path=/; SameSite=Lax`;
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
// Geo cacheado por sesión (IP + país)
// ======================================
const GEO_CACHE_KEY = (sid) => `geo_by_session:${sid}`;

/**
 * Devuelve { ip, country_code } cacheado por sessionId.
 * Si no hay cache, llama a ipapi.co UNA sola vez por sessionId y lo guarda.
 */
export const getOrFetchGeo = async (sessionId) => {
  try {
    const cached = localStorage.getItem(GEO_CACHE_KEY(sessionId));
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.ip || parsed.country_code)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[visitorTracking] Error leyendo geo cache:', e);
  }

  // No hay cache -> fetch a ipapi.co (una sola vez por sessionId)
  let result = { ip: null, country_code: null };
  try {
    const resp = await fetch('https://ipapi.co/json/');
    if (resp.ok) {
      const json = await resp.json();
      result.ip = json?.ip || null;
      result.country_code = json?.country_code || null;
    }
  } catch (e) {
    console.error('[visitorTracking] ipapi.co fallo:', e);
  }

  try {
    localStorage.setItem(GEO_CACHE_KEY(sessionId), JSON.stringify(result));
  } catch (e) {
    console.warn('[visitorTracking] Error guardando geo cache:', e);
  }

  return result;
};

// ======================================
// Tracking principal de visitante
// ======================================
export const trackVisitor = async (location) => {
  // 1) session_id estable (cookie)
  const sessionId = getOrInitSessionId();

  const userAgent = navigator.userAgent || '';
  const referrer = document.referrer || '';
  const currentPath = location?.pathname || '';
  const search = location?.search || '';

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
      first_visit: nowIso,   // en DB puedes mantener el primero con trigger
      last_visit: nowIso,
      page_views: currentViews + 1,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      country_code,          // útil si deseas guardarlo
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