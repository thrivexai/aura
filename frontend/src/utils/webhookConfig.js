// src/utils/webhookConfig.js
// Configuración de webhooks - URLs editables desde admin panel

// Base de API desde env (sin barra final)
const API_BASE = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

export const getWebhookUrls = () => {
  // Si hay API_BASE, define defaults ABSOLUTAS hacia ese backend.
  // Si no hay API_BASE, deja rutas relativas (útil si usas Functions/proxy en el mismo dominio).
  const defaultUrls = API_BASE ? {
    leadCapture: 'https://webhooks.kadimapro.com/webhook/fa736ea2-50ce-43c5-bf69-8571f5db5a25',
    purchase:   `${API_BASE}/api/webhooks/purchase`,
  } : {
    leadCapture: 'https://webhooks.kadimapro.com/webhook/fa736ea2-50ce-43c5-bf69-8571f5db5a25',
    purchase:   '/api/webhooks/purchase',
  };

  try {
    const savedWebhooks = localStorage.getItem('aura_webhook_urls');
    if (savedWebhooks) {
      const parsed = JSON.parse(savedWebhooks);
      return {
        leadCapture: parsed.leadCapture || defaultUrls.leadCapture,
        purchase: parsed.purchase || defaultUrls.purchase
      };
    }
  } catch (e) {
    console.error('Error reading webhook URLs from localStorage:', e);
  }

  return defaultUrls;
};

export const updateWebhookUrls = (urls) => {
  try {
    localStorage.setItem('aura_webhook_urls', JSON.stringify(urls));
    return true;
  } catch (e) {
    console.error('Error saving webhook URLs to localStorage:', e);
    return false;
  }
};

// Función para construir URL completa si es necesario
export const buildWebhookUrl = (url) => {
  // Si es relativa y hay API_BASE, convierte a absoluta. Si no, déjala (para Functions locales).
  if (url.startsWith('/')) {
    return API_BASE ? `${API_BASE}${url}` : url;
  }
  // Si es una URL completa, usarla tal como está
  return url;
};

// Función para determinar si usar proxy o envío directo
export const shouldUseProxy = (url) => {
  // Usar proxy para URLs EXTERNAS (distinto origin)
  try {
    const target = new URL(url);
    return target.origin !== window.location.origin;
  } catch {
    // Si no es URL absoluta (relativa), no usar proxy
    return false;
  }
};

// Función para enviar webhook usando proxy si es necesario
export const sendWebhookWithProxy = async (url, data) => {
  if (shouldUseProxy(url) && API_BASE) {
    // Usar proxy del backend para URLs externas (sólo si hay API_BASE configurada)
    console.log('🔄 Usando proxy del backend para webhook externo:', url);
    return fetch(`${API_BASE}/api/proxy-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        _target_url: url
      })
    });
  } else {
    // Envío directo para URLs internas o si no hay API_BASE
    console.log('📡 Envío directo a webhook interno:', url);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }
};