import React, { useContext, useEffect } from 'react';
import { Button } from './ui/button';
import { CheckCircle, Calendar, MessageSquare, Download, ArrowRight } from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent } from '../mock';

const ThankYou = () => {
  const { funnelData } = useContext(FunnelContext);

  useEffect(() => {
    trackEvent('thankyou_view', {
      order_value: 15,
      lead_email: funnelData.leadData?.email
    });
  }, [funnelData]);

  const handleJoinCommunity = () => {
    trackEvent('community_join_click', {
      platform: 'discord',
      lead_email: funnelData.leadData?.email
    });
    // Simular redirección a Discord
    alert('Te redirigimos a nuestra comunidad de Discord...');
  };

  const handleCalendarAccess = () => {
    trackEvent('calendar_access_click', {
      lead_email: funnelData.leadData?.email
    });
    // Simular acceso al calendario
    alert('Accediendo a tu agenda del workshop...');
  };

  const handleDownloadResources = () => {
    trackEvent('resources_download_click', {
      lead_email: funnelData.leadData?.email
    });
    // Simular descarga de recursos
    alert('Descargando todos tus recursos...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto"
            />
            <div className="text-stone-600 text-sm">
              ¡Bienvenido/a al workshop!
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Hero */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
              ¡Pago completado exitosamente!
            </h1>
            
            <p className="text-xl text-stone-600 mb-6">
              Hola {funnelData.leadData?.name}, ya tienes acceso completo al Workshop "Moda Rentable con IA"
            </p>

            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-6 py-3">
              <span className="text-emerald-800 font-medium">
                Pedido #ORDER_{Date.now().toString().slice(-6)} • $15.00 USD
              </span>
            </div>
          </div>

          {/* Pasos siguientes */}
          <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">
              Tus próximos pasos:
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 mb-2">
                    Accede al contenido del workshop
                  </h3>
                  <p className="text-stone-600 mb-3">
                    Ya tienes acceso inmediato a todas las 2 horas de contenido práctico.
                  </p>
                  <Button 
                    onClick={handleCalendarAccess}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Acceder al workshop
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 mb-2">
                    Únete a la comunidad exclusiva
                  </h3>
                  <p className="text-stone-600 mb-3">
                    Conéctate con más de 500 marcas de moda que ya están optimizando con IA.
                  </p>
                  <Button 
                    onClick={handleJoinCommunity}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Unirse a Discord
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 mb-2">
                    Descarga todos los recursos
                  </h3>
                  <p className="text-stone-600 mb-3">
                    Plantillas, checklist y herramientas por valor de $247 USD incluidas.
                  </p>
                  <Button 
                    onClick={handleDownloadResources}
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar recursos
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Email confirmación */}
          <div className="bg-gradient-to-r from-stone-50 to-slate-50 rounded-2xl p-6 border border-stone-200 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center">
                <span className="text-stone-600">📧</span>
              </div>
              <h3 className="font-semibold text-stone-900">
                Revisa tu email
              </h3>
            </div>
            <p className="text-stone-600">
              Hemos enviado toda la información de acceso y recursos a <strong>{funnelData.leadData?.email}</strong>. 
              Si no lo ves, revisa tu carpeta de spam.
            </p>
          </div>

          {/* Bonus */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              🎁 Bonus exclusivo para ti
            </h2>
            <p className="text-emerald-100 mb-6">
              Como acabas de unirte, tienes acceso prioritario a nuestras próximas masterclasses 
              y un descuento del 30% en nuestra consultoría personalizada.
            </p>
            
            <Button 
              className="bg-white text-emerald-900 hover:bg-emerald-50"
            >
              Conocer más beneficios
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Support */}
          <div className="text-center mt-8">
            <p className="text-stone-600 mb-2">
              ¿Tienes alguna pregunta o necesitas ayuda?
            </p>
            <p className="text-stone-500 text-sm">
              Escríbenos a <strong>soporte@aura-ai.com</strong> o únete a nuestro Discord para soporte inmediato
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThankYou;