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