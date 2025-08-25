// Utilidades para webhooks y tracking de Facebook/Meta
import { getWebhookUrls, buildWebhookUrl, sendWebhookWithProxy } from './webhookConfig';

// Función para obtener información del cliente
export const getClientInfo = () => {
  const userAgent = navigator.userAgent;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Obtener IP del cliente (se hace en el backend)
  // Obtener fbclid de URL
  const fbclid = urlParams.get('fbclid') || localStorage.getItem('fbclid') || null;
  
  // Obtener cookies de Facebook (_fbc, _fbp)
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const _fbc = getCookie('_fbc');
  const _fbp = getCookie('_fbp');
  
  // UTM parameters
  const utmSource = urlParams.get('utm_source') || localStorage.getItem('utm_source');
  const utmMedium = urlParams.get('utm_medium') || localStorage.getItem('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign') || localStorage.getItem('utm_campaign');
  const utmContent = urlParams.get('utm_content') || localStorage.getItem('utm_content');
  const utmTerm = urlParams.get('utm_term') || localStorage.getItem('utm_term');

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
    sessionId: sessionStorage.getItem('session_id') || generateSessionId()
  };
};

// Generar session ID único
const generateSessionId = () => {
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
};

// Webhook para Lead Capture (InitiateCheckout)
export const sendLeadCaptureWebhook = async (leadData, quizAnswers) => {
  const clientInfo = getClientInfo();
  const webhookUrls = getWebhookUrls();
  
  const webhookData = {
    // Datos del lead
    name: leadData.name,
    email: leadData.email,
    whatsapp: leadData.whatsapp || null,
    
    // Datos de tracking
    ...clientInfo,
    
    // Datos del quiz
    quizAnswers,
    bucketId: quizAnswers[3] || 'unknown', // Dolor principal
    businessType: quizAnswers[1] || 'unknown',
    
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
    leadSource: clientInfo.utmSource || 'direct'
  };

  try {
    // Usar la URL configurada para lead capture
    const webhookUrls = getWebhookUrls();
    const webhookUrl = buildWebhookUrl(webhookUrls.leadCapture);
    
    console.log('📤 Enviando lead capture webhook a:', webhookUrl);
    console.log('📄 Datos:', webhookData);
    
    // Usar función con proxy automático
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
    return { success: false, error: error.message, url: webhookUrls.leadCapture };
  }
};

// Webhook para Purchase
export const sendPurchaseWebhook = async (leadData, purchaseData) => {
  const clientInfo = getClientInfo();
  const webhookUrls = getWebhookUrls();
  
  const webhookData = {
    // Datos del lead
    name: leadData.name,
    email: leadData.email,
    whatsapp: leadData.whatsapp || null,
    
    // Datos de tracking
    ...clientInfo,
    
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
    // Usar la URL configurada para purchase
    const webhookUrls = getWebhookUrls();
    const webhookUrl = buildWebhookUrl(webhookUrls.purchase);
    
    console.log('📤 Enviando purchase webhook a:', webhookUrl);
    console.log('📄 Datos:', webhookData);
    
    // Usar función con proxy automático
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
    return { success: false, error: error.message, url: webhookUrls.purchase };
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