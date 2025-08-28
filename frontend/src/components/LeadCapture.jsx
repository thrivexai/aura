/* eslint-disable react-hooks/exhaustive-deps */
// D:\Aura\frontend\src\components\LeadCapture.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Gift, Shield, ArrowRight } from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent } from '../mock';
import { sendLeadCaptureWebhook, saveUTMParameters, getClientInfo } from '../utils/webhooks';
import { saveLeadCapture } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import { getOrInitSessionId, getOrFetchGeo } from '../utils/visitorTracking';

// Teléfono con buscador de países
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const LeadCapture = () => {
  const navigate = useNavigate();
  const { funnelData, setFunnelData } = useContext(FunnelContext);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',                 // +E164 idealmente
    whatsapp_country_iso2: '',    // ej. "pe", "mx"
    whatsapp_dial_code: '',       // ej. "51", "52"
    consent: false,
    client_ip: ''                 // IP pública detectada (cache por sesión)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [defaultCountry, setDefaultCountry] = useState('us');

  // 1) Al montar: guardar UTM y establecer sessionId unificado
  useEffect(() => {
    saveUTMParameters();
    const sid = getOrInitSessionId();
    console.log('[LeadCapture] Session ID:', sid);

    if (sid && (!funnelData?.sessionId || funnelData.sessionId !== sid)) {
      console.log('[LeadCapture] Updating session ID in funnel data');
      setFunnelData(prev => ({ ...prev, sessionId: sid }));
    }
    trackEvent('lead_form_view', {
      quiz_completed: Object.keys(funnelData?.answers || {}).length > 0
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) GEO cacheado por sesión (usa ipapi solo si no está en cache)
  useEffect(() => {
    const setupGeo = async () => {
      const sid = getOrInitSessionId();
      console.log('[LeadCapture] Using session ID for geo:', sid);
      const { ip, country_code } = await getOrFetchGeo(sid);

      if (ip) setFormData(prev => ({ ...prev, client_ip: ip }));
      if (country_code) setDefaultCountry(String(country_code).toLowerCase());
    };
    setupGeo();
  }, [funnelData?.sessionId]);

  // 3) Marcar quiz_completed apenas haya un sessionId
  useEffect(() => {
    const sessionId = getOrInitSessionId();
    console.log('[LeadCapture] Using session ID for quiz completion:', sessionId);

    if (!sessionId) {
      console.warn('[quiz_tracking] No se pudo obtener sessionId -> se omite upsert.');
      return;
    }

    if (!funnelData?.sessionId || funnelData.sessionId !== sessionId) {
      setFunnelData(prev => ({ ...prev, sessionId }));
    }

    let cancelled = false;

    (async () => {
      console.log('[quiz_tracking] Upserting quiz_completed=true para session:', sessionId);
      const { data, error } = await supabase
        .from('quiz_tracking')
        .upsert(
          { session_id: sessionId, quiz_completed: true },
          { onConflict: 'session_id' }
        )
        .select();

      if (cancelled) return;

      if (error) {
        console.error('[quiz_tracking] Error en upsert:', error);
      } else if (!data || data.length === 0) {
        console.warn('[quiz_tracking] Upsert no devolvió filas (¿RLS/PK?):', data);
      } else {
        console.log('[quiz_tracking] OK upsert:', data);
      }
    })();

    return () => { cancelled = true; };
  }, [funnelData?.sessionId]);

  // Normaliza teléfono a +E164
  const normalizeIntlPhone = (val) => {
    const digits = (val || '').replace(/[^\d+]/g, '');
    return digits.startsWith('+') ? digits : (digits ? `+${digits}` : '');
  };

  // Validación
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.consent) newErrors.consent = 'Debes aceptar la política de privacidad';

    setErrors(newErrors);
    return { valid: Object.keys(newErrors).length === 0, newErrors };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // === Sesión unificada para TODO (webhook + supabase) ===
    const sessionId = getOrInitSessionId();
    console.log('[LeadCapture] Using session ID for form submission:', sessionId);

    if (!sessionId) {
      console.error('[LeadCapture] No se pudo obtener sessionId para el envío del formulario');
      return;
    }

    const { valid, newErrors } = validateForm();
    if (!valid) {
      trackEvent('lead_submit_attempt', { success: false, errors: Object.keys(newErrors) });
      return;
    }

    setIsLoading(true);

    try {
      // Asegura tener IP por si aún no la capturó el effect (sin re-fetch redundante si ya está cacheado)
      if (!formData.client_ip) {
        const geo = await getOrFetchGeo(sessionId);
        if (geo?.ip) {
          // ⭐ CAMBIO: Garantizamos client_ip antes de enviar
          setFormData(prev => ({ ...prev, client_ip: geo.ip }));
        }
      }

      // Simular envío a backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Normalización de teléfono previa a guardar/enviar
      const normalizedFormData = {
        ...formData,
        whatsapp: normalizeIntlPhone(formData.whatsapp)
      };

      // Guardar datos del lead en el contexto
      setFunnelData(prev => ({
        ...prev,
        leadData: normalizedFormData,
        currentStep: 2
      }));

      // Cliente/Device info
      const clientInfo = getClientInfo();

      // === WEBHOOK EXTERNO ===
      // ⭐ CAMBIO: Aseguramos que el webhook reciba el MISMO session_id + UTM + clientInfo
      const webhookPayload = {
        ...normalizedFormData,
        session_id: sessionId,
        utm_source: funnelData.utm_source,
        utm_medium: funnelData.utm_medium,
        utm_campaign: funnelData.utm_campaign,
        utm_content: funnelData.utm_content,
        utm_term: funnelData.utm_term,
        client_info: {
          ...clientInfo,
          sessionId // redundante pero útil si tu receptor lo espera con otra key
        }
      };

      console.log('Calling sendLeadCaptureWebhook', webhookPayload, funnelData?.answers);
      const webhookResult = await sendLeadCaptureWebhook(
        webhookPayload,                  // ⭐ CAMBIO: enviamos payload unificado con session_id
        funnelData?.answers || {}
      );
      if (webhookResult.success) {
        console.log('✅ Webhook externo enviado exitosamente:', webhookResult.data);
      } else {
        console.error('⚠️ Error en webhook externo:', webhookResult.error);
      }

      // === SUPABASE ===
      // ⭐ Mantiene el mismo session_id también aquí
      const leadData = {
        session_id: sessionId,
        ...normalizedFormData,
        utm_source: funnelData.utm_source,
        utm_medium: funnelData.utm_medium,
        utm_campaign: funnelData.utm_campaign,
        utm_content: funnelData.utm_content,
        utm_term: funnelData.utm_term,
      };

      const response = await saveLeadCapture(
        leadData,
        JSON.stringify(funnelData.answers || {}),
        {
          ...clientInfo,
          sessionId // ya venía en webhook; aquí también lo enviamos por consistencia
        }
      );

      if (response.success) {
        console.log('✅ Datos guardados en Supabase exitosamente:', response.data);
      } else {
        console.error('⚠️ Error guardando en Supabase:', response.error);
      }

      trackEvent('lead_submitted', {
        success: true,
        has_whatsapp: Boolean(normalizedFormData.whatsapp),
        quiz_answers_count: Object.keys(funnelData?.answers || {}).length,
        webhook_sent: webhookResult.success,
        whatsapp_country_iso2: normalizedFormData.whatsapp_country_iso2 || defaultCountry,
        client_ip: normalizedFormData.client_ip
      });

      navigate('/diagnosis');
    } catch (error) {
      trackEvent('lead_submit_attempt', {
        success: false,
        error: error?.message
      });
      setErrors({ submit: 'Hubo un error. Por favor intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <img
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto"
            />
            <div className="text-stone-600 text-sm">Casi terminamos...</div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-amber-600" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              ¡Tu diagnóstico está listo!
            </h1>

            <p className="text-lg text-stone-600 mb-6">
              Recibe tu análisis personalizado con recomendaciones específicas para tu marca de moda.
            </p>

            <div className="grid md:grid-cols-1 gap-4 max-w-lg mx-auto">
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-amber-600 font-semibold">✨ Diagnóstico</div>
                <div className="text-sm text-stone-600">Personalizado y gratuito</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="text-stone-700 font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: María García"
                  autoComplete="name"
                  className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-stone-700 font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* WhatsApp con buscador y formato internacional */}
              <div>
                <Label htmlFor="whatsapp" className="text-stone-700 font-medium">
                  WhatsApp (opcional)
                </Label>
                <div className="mt-2">
                  <PhoneInput
                    key={defaultCountry}
                    country={defaultCountry}
                    enableSearch
                    value={formData.whatsapp}
                    onChange={(value, country) => {
                      handleInputChange('whatsapp', value);
                      handleInputChange('whatsapp_country_iso2', country?.countryCode || '');
                      handleInputChange('whatsapp_dial_code', country?.dialCode || '');
                    }}
                    inputProps={{ name: 'whatsapp', id: 'whatsapp', autoComplete: 'tel' }}
                    containerClass="!w-full"
                    inputClass="!w-full !h-10 !bg-white !text-stone-900 !border-stone-300 !rounded-md"
                    buttonClass="!bg-white !border-stone-300 !rounded-l-md"
                    dropdownClass="!bg-white !text-stone-900"
                    searchClass="!bg-white !text-stone-900"
                  />
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  Para enviarte tips adicionales y recordatorios
                </p>
                {errors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
                )}
              </div>

              {/* Consentimiento */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => handleInputChange('consent', Boolean(checked))}
                  className={errors.consent ? 'border-red-500' : ''}
                />
                <div className="flex-1">
                  <Label htmlFor="consent" className="text-sm text-stone-600 leading-relaxed cursor-pointer">
                    Acepto recibir mi diagnóstico personalizado y comunicaciones relacionadas.
                    Puedo darme de baja en cualquier momento.
                  </Label>
                  {errors.consent && (
                    <p className="text-red-500 text-sm mt-1">{errors.consent}</p>
                  )}
                </div>
              </div>

              {/* Mensaje de error de submit */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Botón */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 text-lg rounded-xl transition-all duration-200 hover:transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generando diagnóstico...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Ver mi diagnóstico gratuito</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-stone-200">
              <div className="flex items-center space-x-2 text-sm text-stone-600">
                <Shield className="w-4 h-4" />
                <span>100% Seguro</span>
              </div>
              <div className="text-sm text-stone-600">🔒 SSL Encrypted</div>
              <div className="text-sm text-stone-600">📧 Sin spam</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadCapture;