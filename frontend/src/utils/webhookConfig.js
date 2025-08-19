// Configuración de webhooks - URLs editables desde admin panel

export const getWebhookUrls = () => {
  const defaultUrls = {
    leadCapture: '/api/webhooks/lead-capture',
    purchase: '/api/webhooks/purchase'
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
  // Si es una URL relativa, usar el backend URL base
  if (url.startsWith('/')) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    return `${backendUrl}${url}`;
  }
  
  // Si es una URL completa, usarla tal como está
  return url;
};

// Función para determinar si usar proxy o envío directo
export const shouldUseProxy = (url) => {
  // Usar proxy para URLs externas que no sean del mismo dominio
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return !url.includes(window.location.hostname);
  }
  return false;
};

// Función para enviar webhook usando proxy si es necesario
export const sendWebhookWithProxy = async (url, data) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  if (shouldUseProxy(url)) {
    // Usar proxy del backend para URLs externas
    console.log('🔄 Usando proxy del backend para webhook externo:', url);
    
    return fetch(`${backendUrl}/api/proxy-webhook`, {
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
    // Envío directo para URLs internas
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