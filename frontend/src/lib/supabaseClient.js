import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ktcxuiexzdtwjnhnppoj.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y3h1aWV4emR0d2puaG5wcG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwOTM3MzQsImV4cCI6MjA3MTY2OTczNH0.bAqgwkaQ9XVMv8NoxjzTJw1oiUbcSgF30axYksX5IPc'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para guardar lead capture en Supabase
export const saveLeadCapture = async (leadData, quizAnswers, clientInfo) => {
  try {
    const leadCaptureData = {
      session_id: clientInfo.sessionId,
      name: leadData.name,
      email: leadData.email,
      whatsapp: leadData.whatsapp || null,
      user_agent: clientInfo.userAgent,
      fbclid: clientInfo.fbclid,
      _fbc: clientInfo._fbc,
      _fbp: clientInfo._fbp,
      utm_source: clientInfo.utmSource,
      utm_medium: clientInfo.utmMedium,
      utm_campaign: clientInfo.utmCampaign,
      utm_content: clientInfo.utmContent,
      utm_term: clientInfo.utmTerm,
      referrer: clientInfo.referrer,
      current_url: clientInfo.currentUrl,
      quiz_answers: quizAnswers || {},
      bucket_id: quizAnswers[3] || 'unknown',
      event_type: 'InitiateCheckout',
      value: 15.0,
      currency: 'USD',
      client_ip: leadData.client_ip,
      timestamp: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('lead_webhooks')
      .insert([leadCaptureData])
      .select()

    if (error) {
      console.error('Error guardando en Supabase:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Datos guardados en Supabase:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error en saveLeadCapture:', error)
    return { success: false, error: error.message }
  }
}

// Función para guardar purchase en Supabase
export const savePurchase = async (leadData, purchaseData, clientInfo) => {
  try {
    const purchaseWebhookData = {
      session_id: clientInfo.sessionId,
      name: leadData.name,
      email: leadData.email,
      whatsapp: leadData.whatsapp || null,
      transaction_id: purchaseData.transactionId,
      order_id: purchaseData.orderId || purchaseData.transactionId,
      user_agent: clientInfo.userAgent,
      fbclid: clientInfo.fbclid,
      _fbc: clientInfo._fbc,
      _fbp: clientInfo._fbp,
      utm_source: clientInfo.utmSource,
      utm_medium: clientInfo.utmMedium,
      utm_campaign: clientInfo.utmCampaign,
      utm_content: clientInfo.utmContent,
      utm_term: clientInfo.utmTerm,
      referrer: clientInfo.referrer,
      current_url: clientInfo.currentUrl,
      quiz_answers: purchaseData.quizAnswers || {},
      event_type: 'Purchase',
      value: 15.0,
      currency: 'USD',
      payment_method: 'hotmart',
      client_ip: leadData.client_ip,
      timestamp: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('purchase_webhooks')
      .insert([purchaseWebhookData])
      .select()

    if (error) {
      console.error('Error guardando compra en Supabase:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Compra guardada en Supabase:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error en savePurchase:', error)
    return { success: false, error: error.message }
  }
}

// Función para obtener leads desde Supabase
export const getLeadsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('lead_webhooks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error obteniendo leads:', error)
      return { success: false, error: error.message, leads: [] }
    }

    return { success: true, leads: data }
  } catch (error) {
    console.error('Error en getLeadsFromSupabase:', error)
    return { success: false, error: error.message, leads: [] }
  }
}

// Función para obtener purchases desde Supabase
export const getPurchasesFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('purchase_webhooks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error obteniendo purchases:', error)
      return { success: false, error: error.message, purchases: [] }
    }

    return { success: true, purchases: data }
  } catch (error) {
    console.error('Error en getPurchasesFromSupabase:', error)
    return { success: false, error: error.message, purchases: [] }
  }
}

// Función para obtener métricas desde Supabase
export const getMetricsFromSupabase = async () => {
  try {
    const [leadsResult, purchasesResult] = await Promise.all([
      supabase.from('lead_webhooks').select('id', { count: 'exact' }),
      supabase.from('purchase_webhooks').select('id', { count: 'exact' })
    ])

    const totalLeads = leadsResult.count || 0
    const totalPurchases = purchasesResult.count || 0

    // Obtener el número total de visitantes desde la tabla 'visitors'
    const { data: visitorsData, error: visitorsError } = await supabase
      .from('visitors')
      .select('id', { count: 'exact' });

    if (visitorsError) {
      console.error('Error obteniendo el número de visitantes:', visitorsError);
    }

    const totalVisitors = visitorsData ? visitorsData.length : 0;
    
    // Calcular métricas básicas
    const conversionRate = totalLeads > 0 ? (totalPurchases / totalLeads) * 100 : 0

    const metrics = {
      totalVisitors: totalVisitors,
      leadsGenerated: totalLeads,
      purchases: totalPurchases,
      conversionRate: Math.round(conversionRate * 10) / 10,
      quizStarts: Math.floor(totalLeads * 1.5),
      quizCompletions: totalLeads,
      diagnosisViewed: Math.floor(totalLeads * 0.8),
      checkoutClicks: Math.floor(totalLeads * 0.4)
    }

    return { success: true, metrics }
  } catch (error) {
    console.error('Error obteniendo métricas:', error)
    return { 
      success: false, 
      error: error.message,
      metrics: {
        totalVisitors: 0,
        leadsGenerated: 0,
        purchases: 0,
        conversionRate: 0,
        quizStarts: 0,
        quizCompletions: 0,
        diagnosisViewed: 0,
        checkoutClicks: 0
      }
    }
  }
}
