import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Users, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  PlayCircle,
  Gift,
  Shield,
  Calendar,
  Target
} from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent, diagnosisTemplates } from '../mock';

const SalesPage = () => {
  const navigate = useNavigate();
  const { funnelData } = useContext(FunnelContext);
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 horas en segundos
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener datos personalizados basados en las respuestas o usar defaults
  const bucketId = funnelData?.answers?.[3] || 'fotografia';
  const diagnosis = diagnosisTemplates[bucketId] || diagnosisTemplates.fotografia;
  const businessType = funnelData?.answers?.[1] || 'marca-emergente';
  const objective = funnelData?.answers?.[4] || 'reducir-costos';
  
  // Datos del lead o datos mock para desarrollo
  const leadName = funnelData?.leadData?.name || 'María García';
  const leadEmail = funnelData?.leadData?.email || 'maria@test.com';

  useEffect(() => {
    trackEvent('checkout_start', {
      offer_id: 'workshop-15usd',
      lead_email: funnelData.leadData?.email,
      bucket_id: bucketId
    });
  }, [funnelData, bucketId]);

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

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      trackEvent('purchase_success', {
        order_id: `ORDER_${Date.now()}`,
        value: 15,
        currency: 'USD',
        lead_email: funnelData.leadData?.email,
        payment_method: 'checkout'
      });

      navigate('/thank-you');
      
    } catch (error) {
      trackEvent('purchase_fail', {
        reason: error.message,
        lead_email: funnelData.leadData?.email
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Personalización según el tipo de negocio y dolor
  const getPersonalizedContent = () => {
    const personalizations = {
      'produccion': {
        pain: 'los altos costos de producción están matando tu margen',
        solution: 'optimizar tu cadena de producción con IA',
        savings: 'hasta 40% en costos de producción',
        timeframe: '30 días'
      },
      'fotografia': {
        pain: 'el contenido visual te está costando una fortuna',
        solution: 'generar contenido profesional con IA',
        savings: 'hasta 85% en costos de contenido',
        timeframe: '15 días'
      },
      'marketing': {
        pain: 'tu marketing no convierte como debería',
        solution: 'automatizar y optimizar tus campañas',
        savings: 'hasta 75% mejor ROAS',
        timeframe: '21 días'
      },
      'personal': {
        pain: 'el trabajo manual te consume todo el tiempo',
        solution: 'automatizar procesos repetitivos',
        savings: 'hasta 50% menos horas-persona',
        timeframe: '45 días'
      },
      'inventario': {
        pain: 'el stock inmóvil está matando tu cash flow',
        solution: 'predecir demanda con inteligencia artificial',
        savings: 'hasta 55% menos stock inmóvil',
        timeframe: '60 días'
      }
    };

    return personalizations[bucketId] || personalizations.produccion;
  };

  const personalizedContent = getPersonalizedContent();

  // Mock data para testing cuando no hay datos del funnel
  if (!funnelData.leadData) {
    // Solo para pruebas - normalmente redirectiría a home
    const mockFunnelData = {
      leadData: { name: "María García", email: "maria@test.com" },
      answers: { 1: "marca-emergente", 3: "fotografia", 4: "reducir-costos" }
    };
    
    // Para desarrollo, usar mock data
    if (process.env.NODE_ENV === 'development') {
      console.log("🔧 Usando datos mock para testing de la página de ventas");
    } else {
      navigate('/');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header con urgencia */}
      <header className="px-6 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto filter invert"
            />
            <div>
              <div className="font-semibold">Workshop Moda Rentable con IA</div>
              <div className="text-stone-300 text-sm">Oferta especial para {funnelData.leadData.name}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{formatTime(timeLeft)}</div>
            <div className="text-stone-300 text-sm">Oferta expira en</div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero personalizado */}
          <section className="text-center mb-16">
            <Badge className="mb-6 bg-amber-100 text-amber-800 border-amber-300">
              🎯 Diagnóstico personalizado para {businessType.replace('-', ' ')}
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6 leading-tight">
              {funnelData.leadData.name}, descubriste que{' '}
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {personalizedContent.pain}
              </span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              En 3 sesiones intensivas vas a aprender exactamente cómo {personalizedContent.solution}{' '}
              y conseguir {personalizedContent.savings} en solo {personalizedContent.timeframe}.
            </p>

            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-6 py-3 mb-8">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800 font-medium">
                Más de 500 marcas ya están ahorrando con este método
              </span>
            </div>
          </section>

          {/* Video/Imagen hero */}
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

          {/* Contenido del workshop */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-stone-900 mb-12">
              Lo que aprenderás en cada sesión
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Día 1 */}
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-4">
                  Día 1: Del Dolor al Deseo
                </h3>
                <ul className="space-y-3 text-stone-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Por qué las marcas rentables no son las más grandes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Identificar las 5 fugas de dinero más comunes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Casos reales de ahorro del 50-70% en costos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>El mindset de marca rentable vs marca grande</span>
                  </li>
                </ul>
              </div>

              {/* Día 2 */}
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-4">
                  Día 2: El Plan de Viaje
                </h3>
                <ul className="space-y-3 text-stone-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Caso real: de 3 meses y $5,000 a 2 semanas y $500</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Los 3 pilares: Collections, Marketer, Pictures</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Ejemplo en vivo con una prenda real</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Conceptualización rápida con IA</span>
                  </li>
                </ul>
              </div>

              {/* Día 3 */}
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-4">
                  Día 3: El Vehículo Completo
                </h3>
                <ul className="space-y-3 text-stone-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Presentación de Aura X-Tyle + X-Chool</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Sistema TMS de publicación y ventas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Acceso a comunidad X-Chool</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Plantillas exclusivas incluidas</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Testimonios */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center text-stone-900 mb-12">
              Resultados reales de marcas como la tuya
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-stone-200">
                <div className="flex items-center space-x-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 mb-4">
                  "Reducimos nuestros costos de fotografía en un 78%. Lo que antes nos costaba $2,000 
                  por sesión, ahora lo hacemos por $450 con mejor calidad."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-stone-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-stone-900">Sofia Martínez</div>
                    <div className="text-sm text-stone-600">Marca Emergente, México</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-stone-200">
                <div className="flex items-center space-x-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 mb-4">
                  "En 3 semanas implementamos todo. Nuestro ROAS subió de 2.1x a 4.7x. 
                  Ya recuperamos la inversión 15 veces."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-stone-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-stone-900">Carlos Ruiz</div>
                    <div className="text-sm text-stone-600">Marca Establecida, España</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bonos */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
              <div className="text-center mb-8">
                <Gift className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                <h2 className="text-3xl font-bold text-stone-900 mb-4">
                  Bonos exclusivos (solo por 48 horas)
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-800 font-bold">01</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-2">Pack de 50+ Plantillas IA</h3>
                    <p className="text-stone-600 text-sm mb-2">
                      Prompts listos para usar en diseño, marketing y producción
                    </p>
                    <p className="text-amber-700 font-semibold">Valor: $97</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-800 font-bold">02</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-2">Acceso X-Chool (3 meses)</h3>
                    <p className="text-stone-600 text-sm mb-2">
                      Comunidad exclusiva + formación continua
                    </p>
                    <p className="text-amber-700 font-semibold">Valor: $147</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-800 font-bold">03</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-2">Sesión Q&A exclusiva</h3>
                    <p className="text-stone-600 text-sm mb-2">
                      1 hora de preguntas y respuestas personalizadas
                    </p>
                    <p className="text-amber-700 font-semibold">Valor: $197</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-800 font-bold">04</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-2">Checklist de implementación</h3>
                    <p className="text-stone-600 text-sm mb-2">
                      Paso a paso para no perderte nada
                    </p>
                    <p className="text-amber-700 font-semibold">Valor: $47</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <div className="text-stone-600 mb-2">Valor total de los bonos:</div>
                <div className="text-3xl font-bold text-amber-700 line-through">$488 USD</div>
                <div className="text-emerald-600 font-bold text-lg">¡INCLUIDO GRATIS!</div>
              </div>
            </div>
          </section>

          {/* Pricing y CTA */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-6">
                Inversión hoy (solo por 48 horas)
              </h2>

              <div className="mb-8">
                <div className="text-stone-400 mb-2">Precio regular del workshop:</div>
                <div className="text-2xl text-stone-400 line-through mb-2">$97 USD</div>
                <div className="text-stone-400 mb-2">Valor con todos los bonos:</div>
                <div className="text-2xl text-stone-400 line-through mb-4">$585 USD</div>
                
                <div className="text-6xl font-bold text-amber-400 mb-2">$15</div>
                <div className="text-stone-300">Un solo pago • Sin recurrencia</div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-4 text-xl rounded-xl mb-6 transition-all duration-200 hover:transform hover:scale-105 shadow-2xl"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>SÍ, QUIERO ACCESO INMEDIATO</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              <div className="flex items-center justify-center space-x-8 text-sm text-stone-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Garantía 30 días</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Acceso inmediato</span>
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
                Después de este tiempo, el workshop volverá a su precio regular de $97 USD 
                y los bonos por valor de $488 USD ya no estarán incluidos.
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