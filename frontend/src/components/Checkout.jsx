import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Users, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  PlayCircle,
  Shield,
  Calendar,
  Target
} from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent, diagnosisTemplates, workshopContent, testimonials } from '../mock';
import { sendPurchaseWebhook, getClientInfo } from '../utils/webhooks';
import { savePurchase } from '../lib/supabaseClient';

/* ================================
   HELPERS: Pre-popular Hotmart
   ================================ */
const stripNonDigitsPlus = (s='') => (s || '').replace(/[^\d+]/g, '');
const stripNonDigits = (s='') => (s || '').replace(/\D/g, '');

/** Devuelve solo el número local (sin código país) para usar en ?phonenumber= */
const getLocalPhone = (lead) => {
  const e164Raw = stripNonDigitsPlus(lead?.whatsapp);           // ej. +51984045554
  const dial = stripNonDigits(lead?.whatsapp_dial_code);        // ej. "51" (de react-phone-input-2)

  if (!e164Raw) return '';
  let digits = e164Raw.startsWith('+') ? e164Raw.slice(1) : e164Raw; // 51984045554

  // Normalizar prefijos tipo "00"
  if (digits.startsWith('00')) digits = digits.replace(/^00+/, '');

  // Si tenemos dial, lo removemos (todas las repeticiones iniciales por seguridad)
  if (dial) {
    while (digits.startsWith(dial)) digits = digits.slice(dial.length);
  }

  // Limpieza final
  const local = stripNonDigits(digits);
  return local;
};

const buildHotmartUrl = (baseUrl, lead = {}, funnelData = {}) => {
  const url = new URL(baseUrl);

  // Solo estos tres campos:
  if (lead.name) url.searchParams.set('name', lead.name);
  if (lead.email) url.searchParams.set('email', lead.email);

  const localPhone = getLocalPhone(lead);
  if (localPhone) url.searchParams.set('phonenumber', localPhone);

  // (Opcional) UTM / fbclid / Meta cookies si las guardas
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','_fbc','_fbp'];
  utmKeys.forEach((k) => {
    const v = funnelData?.[k] ?? funnelData?.leadData?.[k];
    if (v) url.searchParams.set(k, v);
  });

  return url.toString();
};

const isMobileUA = () =>
  typeof navigator !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/* ============ FIN HELPERS ============ */

const SalesPage = () => {
  const navigate = useNavigate();
  const { funnelData } = useContext(FunnelContext);
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 horas en segundos
  const [hotmartLoaded, setHotmartLoaded] = useState(false);

  // Obtener datos personalizados basados en las respuestas o usar defaults
  const bucketId = funnelData?.answers?.[3] || 'fotografia';
  const diagnosis = diagnosisTemplates[bucketId] || diagnosisTemplates.fotografia;
  const businessType = funnelData?.answers?.[1] || 'marca-emergente';

  // Datos del lead o datos mock para desarrollo
  const lead = funnelData?.leadData || {};
  const leadName = lead?.name || 'María García';
  const leadEmail = lead?.email || 'maria@test.com';

  // Construir HotLink con pre-llenado (memo)
  const HOTMART_BASE = 'https://pay.hotmart.com/B101346536X?checkoutMode=2';
  const checkoutUrl = useMemo(() => buildHotmartUrl(HOTMART_BASE, lead, {
    utm_source: funnelData?.utm_source,
    utm_medium: funnelData?.utm_medium,
    utm_campaign: funnelData?.utm_campaign,
    utm_content: funnelData?.utm_content,
    utm_term: funnelData?.utm_term,
    fbclid: funnelData?.fbclid || funnelData?.leadData?.fbclid,
    _fbc: funnelData?.leadData?._fbc,
    _fbp: funnelData?.leadData?._fbp,
  }), [HOTMART_BASE, lead, funnelData]);

  // Detectar móvil una sola vez
  const mobile = useMemo(() => isMobileUA(), []);

  useEffect(() => {
    trackEvent('checkout_start', {
      offer_id: 'workshop-15usd',
      lead_email: leadEmail,
      bucket_id: bucketId
    });

    // Cargar el widget de Hotmart (solo útil en desktop)
    const loadHotmart = () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://static.hotmart.com/checkout/widget.min.js';
        script.onload = () => {
          console.log('Hotmart script loaded successfully');
          setHotmartLoaded(true);
        };
        script.onerror = (error) => {
          console.error('Error loading Hotmart script:', error);
          setHotmartLoaded(false);
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
        link.onerror = (error) => {
          console.error('Error loading Hotmart CSS:', error);
        };
        document.head.appendChild(link);
      } catch (error) {
        console.error('Error setting up Hotmart:', error);
        setHotmartLoaded(false);
      }
    };

    loadHotmart();
  }, [bucketId, leadEmail]);

  // Contador regresivo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDesktopWidgetClick = () => {
    trackEvent('purchase_attempt', {
      order_id: `ORDER_${Date.now()}`,
      value: 15,
      currency: 'USD',
      lead_email: leadEmail,
      payment_method: 'hotmart'
    });
  };

  const handleMobileRedirect = (e) => {
    e?.preventDefault?.();
    trackEvent('purchase_attempt', {
      order_id: `ORDER_${Date.now()}`,
      value: 15,
      currency: 'USD',
      lead_email: leadEmail,
      payment_method: 'hotmart_mobile'
    });
    window.location.assign(checkoutUrl);
  };

  // Listener para detectar compra completada
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin === 'https://pay.hotmart.com' || event.origin === 'https://static.hotmart.com') {
        if (event.data && (
          event.data.type === 'HOTMART_PURCHASE_SUCCESS' || 
          event.data.type === 'purchase' ||
          event.data.status === 'success'
        )) {
          const purchaseData = {
            transactionId: event.data.transaction_id || event.data.transactionId || `ORDER_${Date.now()}`,
            orderId: event.data.order_id || event.data.orderId,
            status: 'completed',
            paymentMethod: 'hotmart',
            ...event.data
          };

          const webhookResult = await sendPurchaseWebhook(
            { name: leadName, email: leadEmail, whatsapp: lead?.whatsapp },
            purchaseData
          );

          const clientInfo = getClientInfo();
          const supabaseResult = await savePurchase(
            { 
              name: leadName, 
              email: leadEmail, 
              whatsapp: lead?.whatsapp,
              client_ip: lead?.client_ip 
            },
            {
              ...purchaseData,
              quizAnswers: funnelData?.answers || {}
            },
            clientInfo
          );

          trackEvent('purchase_success', {
            order_id: purchaseData.transactionId,
            value: 15,
            currency: 'USD',
            lead_email: leadEmail,
            payment_method: 'hotmart',
            webhook_sent: Boolean(webhookResult?.success)
          });

          setTimeout(() => {
            navigate('/thank-you');
          }, 1000);
        }
      }
    };

    const handleHotmartCallback = async (customEvent) => {
      if (customEvent.detail && customEvent.detail.purchase_success) {
        const purchaseData = customEvent.detail;
        
        const webhookResult = await sendPurchaseWebhook(
          { name: leadName, email: leadEmail, whatsapp: lead?.whatsapp },
          purchaseData
        );

        const clientInfo = getClientInfo();
        const supabaseResult = await savePurchase(
          { 
            name: leadName, 
            email: leadEmail, 
            whatsapp: lead?.whatsapp,
            client_ip: lead?.client_ip 
          },
          {
            ...purchaseData,
            quizAnswers: funnelData?.answers || {}
          },
          clientInfo
        );

        trackEvent('purchase_success', {
          order_id: purchaseData?.transactionId || `ORDER_${Date.now()}`,
          value: 15,
          currency: 'USD',
          lead_email: leadEmail,
          payment_method: 'hotmart_callback',
          webhook_sent: Boolean(webhookResult?.success)
        });

        navigate('/thank-you');
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('hotmart_purchase_success', handleHotmartCallback);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('hotmart_purchase_success', handleHotmartCallback);
    };
  }, [navigate, leadEmail, leadName, lead, funnelData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header fijo con urgencia */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto filter invert"
            />
            <div>
              <div className="font-semibold">Workshop Moda Rentable con IA</div>
              <div className="text-stone-300 text-sm">Evento en vivo • {leadName}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{formatTime(timeLeft)}</div>
            <div className="text-stone-300 text-sm">Oferta expira en</div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Hero personalizado */}
          <section className="text-center mb-16">
            <Badge className="mb-6 bg-amber-100 text-amber-800 border-amber-300">
              🎯 Diagnóstico personalizado para {businessType.replace('-', ' ')}
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6 leading-tight">
              {leadName}, descubriste que{' '}
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {diagnosis.pain}
              </span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {workshopContent.puv}
            </p>

            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-6 py-3 mb-8">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800 font-medium">
                Más de 500 marcas de moda ya están ahorrando con estos métodos
              </span>
            </div>
          </section>

          {/* Video/Imagen hero */}
          {false && (
          <section className="mb-16">
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-white text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlayCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Mira exactamente lo que vas a aprender
              </h2>
              <p className="text-stone-300 mb-6">
                3 minutos que pueden transformar tu marca para siempre
              </p>
              <Button 
                size="lg" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4"
              >
                ▶ Ver video del workshop
              </Button>
            </div>
          </section>
          )}

          {/* Contenido del workshop */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-stone-900 mb-12">
              Lo que aprenderás en cada sesión
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {workshopContent.days.map((day, index) => {
                const iconColors = [
                  "from-red-100 to-red-200 text-red-600",
                  "from-blue-100 to-blue-200 text-blue-600", 
                  "from-amber-100 to-amber-200 text-amber-600"
                ];
                const icons = [Target, Zap, Users];
                const IconComponent = icons[index];

                return (
                  <div key={day.id} className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className={`w-16 h-16 bg-gradient-to-br ${iconColors[index]} rounded-2xl flex items-center justify-center mb-6`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-4">
                      {day.title}
                    </h3>
                    <ul className="space-y-3 text-stone-600">
                      {day.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Testimonios */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-stone-900 mb-12">
              Resultados reales de marcas como la tuya
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.slice(0, 2).map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-stone-200">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-stone-200 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-stone-900">{testimonial.name}</div>
                      <div className="text-sm text-stone-600">{testimonial.brand}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Lo que incluye el workshop */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-stone-900 mb-4">
                  🎯 Lo que incluye tu workshop
                </h2>
                <p className="text-stone-600">
                  Evento en vivo • {workshopContent.schedule.days} • {workshopContent.schedule.time} {workshopContent.schedule.timezone}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {workshopContent.includes.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 mb-2">{item}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing y CTA */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-6">
                Inversión para transformar tu marca
              </h2>

              <div className="mb-8">
                <div className="text-stone-400 mb-2">Precio regular del workshop:</div>
                <div className="text-2xl text-stone-400 line-through mb-4">$97 USD</div>
                
                <div className="text-6xl font-bold text-amber-400 mb-2">$15</div>
                <div className="text-stone-300">Un solo pago • Sin recurrencia • Acceso inmediato</div>
              </div>

              <div className="mb-6">
                {/* Desktop: widget Hotmart. Móvil: redirección directa con URL completa */}
                {!mobile && hotmartLoaded ? (
                  <a
                    href={checkoutUrl}
                    className="hotmart-fb hotmart__button-checkout block w-full"
                    onClick={handleDesktopWidgetClick}
                    target="_self"
                    rel="noopener"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-4 text-xl rounded-xl transition-all duration-200 hover:transform hover:scale-105 shadow-2xl text-center font-semibold cursor-pointer">
                      SÍ, QUIERO ACCESO AL WORKSHOP
                      <div className="inline-block ml-2">
                        <ArrowRight className="w-5 h-5 inline" />
                      </div>
                    </div>
                  </a>
                ) : (
                  <button
                    onClick={handleMobileRedirect}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white px-12 py-4 text-xl rounded-xl transition-all duration-200 hover:transform hover:scale-105 shadow-2xl font-semibold"
                    type="button"
                  >
                    SÍ, QUIERO ACCESO AL WORKSHOP
                    <ArrowRight className="ml-2 inline w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-stone-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Garantía 30 días</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Evento en vivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>+500 marcas</span>
                </div>
              </div>
            </div>
          </section>

          {/* Urgencia final */}
          <section className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <Clock className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h3 className="text-2xl font-bold text-red-900 mb-4">
                ⚠️ Esta oferta expira en {formatTime(timeLeft)}
              </h3>
              <p className="text-red-700 mb-6">
                Después de este tiempo, el workshop volverá a su precio regular de $97 USD.
              </p>
              <p className="text-stone-600 text-sm">
                Solo aceptamos 50 personas en esta promoción para garantizar atención personalizada.
                <br />
                <strong>Quedan 7 cupos disponibles.</strong>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SalesPage;