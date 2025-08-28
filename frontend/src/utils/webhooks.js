// D:\Aura\frontend\src\utils\webhooks.js

// Utilidades para webhooks y tracking de Facebook/Meta
import { getWebhookUrls, buildWebhookUrl, sendWebhookWithProxy } from './webhookConfig';
// 🚩 Usa SIEMPRE el mismo sessionId de visitorTracking
import { getOrInitSessionId } from './visitorTracking';

// Función para obtener información del cliente
export const getClientInfo = () => {
  const userAgent = navigator.userAgent;
  const urlParams = new URLSearchParams(window.location.search);

  // fbclid de URL o cache
  const fbclid = urlParams.get('fbclid') || localStorage.getItem('fbclid') || null;

  // Cookies de Facebook (_fbc, _fbp)
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const _fbc = getCookie('_fbc');
  const _fbp = getCookie('_fbp');

  // UTM parameters (URL -> localStorage)
  const utmSource   = urlParams.get('utm_source')   || localStorage.getItem('utm_source');
  const utmMedium   = urlParams.get('utm_medium')   || localStorage.getItem('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign') || localStorage.getItem('utm_campaign');
  const utmContent  = urlParams.get('utm_content')  || localStorage.getItem('utm_content');
  const utmTerm     = urlParams.get('utm_term')     || localStorage.getItem('utm_term');

  // 🔐 Session unificada (de cookie) — ¡nada de generar nuevas!
  const sid = getOrInitSessionId();

  return {
    userAgent,
    fbclid,
    _fbc,
    _fbp,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrer: document.referrer,
    currentUrl: window.location.href,
    timestamp: new Date().toISOString(),
    // Enviamos ambos formatos por compatibilidad
    sessionId: sid,
    session_id: sid,
  };
};

// Webhook para Lead Capture (InitiateCheckout)
export const sendLeadCaptureWebhook = async (leadData, quizAnswers) => {
  console.log('sendLeadCaptureWebhook called', leadData, quizAnswers);

  // Info de cliente (incluye session unificada)
  const clientInfo = getClientInfo();

  // Si el caller trae session_id (desde LeadCapture.jsx), lo priorizamos
  const normalizedSessionId = leadData.session_id || clientInfo.session_id;

  const ip = leadData.client_ip || null;
  const urls = getWebhookUrls();

  const webhookData = {
    // Datos del lead
    name: leadData.name,
    email: leadData.email,
    whatsapp: leadData.whatsapp || null,

    // Datos de tracking base
    ...clientInfo,

    // ⛳ Forzar la sesión unificada (snake y camel) para que NO se sobreescriba
    sessionId: normalizedSessionId,

    // IP (ya viene normalizada de visitorTracking cache)
    ip,

    // Datos del quiz
    quizAnswers,
    bucketId: quizAnswers?.[3] || 'unknown', // Dolor principal
    businessType: quizAnswers?.[1] || 'unknown',

    // Evento de Facebook
    eventType: 'InitiateCheckout',
    eventTime: Math.floor(Date.now() / 1000),

    // Valor del producto
    value: 15,
    currency: 'USD',

    // Datos adicionales para FB Pixel
    contentName: 'Workshop Moda Rentable con IA',
    contentCategory: 'workshop',
    contentIds: ['workshop-15usd'],

    // Información del funnel
    funnelStep: 'lead_capture',
    leadSource: clientInfo.utmSource || 'direct',
  };

  try {
    const webhookUrl = buildWebhookUrl(urls.leadCapture);
    console.log('📤 Enviando lead capture webhook a:', webhookUrl);
    console.log('📄 Datos:', webhookData);

    const response = await sendWebhookWithProxy(webhookUrl, webhookData);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Lead capture webhook enviado exitosamente');
      console.log('📥 Respuesta:', result);
      return { success: true, data: webhookData, url: webhookUrl, response: result };
    } else {
      console.error('❌ Error en respuesta del webhook:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, url: webhookUrl };
    }
  } catch (error) {
    console.error('❌ Error enviando lead capture webhook:', error);
    return { success: false, error: error.message, url: urls.leadCapture };
  }
};

// Webhook para Purchase
export const sendPurchaseWebhook = async (leadData, purchaseData) => {
  const clientInfo = getClientInfo();
  const urls = getWebhookUrls();

  // Igual que arriba: prioriza session del caller si la trae
  const normalizedSessionId = leadData.session_id || clientInfo.session_id;

  const webhookData = {
    // Datos del lead
    name: leadData.name,
    email: leadData.email,
    whatsapp: leadData.whatsapp || null,

    // Datos de tracking
    ...clientInfo,

    // ⛳ Forzar sesión unificada (snake y camel)
    sessionId: normalizedSessionId,

    // Datos de compra
    transactionId: purchaseData.transactionId || `ORDER_${Date.now()}`,
    orderId: purchaseData.orderId || purchaseData.transactionId,

    // Evento de Facebook
    eventType: 'Purchase',
    eventTime: Math.floor(Date.now() / 1000),

    // Valor del producto
    value: 15,
    currency: 'USD',

    // Datos adicionales para FB Pixel
    contentName: 'Workshop Moda Rentable con IA',
    contentCategory: 'workshop',
    contentIds: ['workshop-15usd'],

    // Información del funnel
    funnelStep: 'purchase_completed',
    paymentMethod: 'hotmart',

    // Datos específicos de Hotmart
    hotmartData: purchaseData
  };

  try {
    const webhookUrl = buildWebhookUrl(urls.purchase);
    console.log('📤 Enviando purchase webhook a:', webhookUrl);
    console.log('📄 Datos:', webhookData);

    const response = await sendWebhookWithProxy(webhookUrl, webhookData);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Purchase webhook enviado exitosamente');
      console.log('📥 Respuesta:', result);
      return { success: true, data: webhookData, url: webhookUrl, response: result };
    } else {
      console.error('❌ Error en respuesta del webhook:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, url: webhookUrl };
    }
  } catch (error) {
    console.error('❌ Error enviando purchase webhook:', error);
    return { success: false, error: error.message, url: urls.purchase };
  }
};

// Función para obtener IP del cliente (se ejecuta en el backend)
export const getClientIP = async () => {
  try {
    const response = await fetch('/api/get-client-ip');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error obteniendo IP:', error);
    return null;
  }
};

// Guardar UTM parameters en localStorage para persistencia
export const saveUTMParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

  utmParams.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      localStorage.setItem(param, value);
    }
  });
};