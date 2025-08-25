import React, { useContext, useEffect } from 'react';
import { Button } from './ui/button';
import { CheckCircle, Calendar, MessageSquare, Download, ArrowRight, Clock } from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent, workshopContent } from '../mock';

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
      platform: 'whatsapp',
      lead_email: funnelData.leadData?.email
    });
    // Redirigir a WhatsApp
    window.open(workshopContent.schedule.whatsappGroup, '_blank');
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
              Hola {funnelData.leadData?.name}, ya tienes acceso confirmado al Workshop "Moda Rentable con IA". 
              Es un evento EN VIVO que se realizará {workshopContent.schedule.days} a las {workshopContent.schedule.time} {workshopContent.schedule.timezone}.
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
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 mb-2">
                    🔥 URGENTE: Únete al grupo de WhatsApp
                  </h3>
                  <p className="text-stone-600 mb-3">
                    Recibirás el enlace de conexión para las sesiones en vivo + recordatorios importantes.
                  </p>
                  <Button 
                    onClick={handleJoinCommunity}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Unirse al grupo de WhatsApp
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 mb-2">
                    📅 Agenda las fechas del workshop
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Horario del Workshop:</span>
                    </div>
                    <div className="text-blue-800">
                      <div>📅 {workshopContent.schedule.days}</div>
                      <div>🕰️ {workshopContent.schedule.time} {workshopContent.schedule.timezone}</div>
                      <div>🎥 Evento EN VIVO (no es grabación)</div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCalendarAccess}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agregar a mi calendario
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 mb-2">
                    📚 Descarga los recursos incluidos
                  </h3>
                  <p className="text-stone-600 mb-3">
                    {workshopContent.includes.join(', ').toLowerCase()}.
                  </p>
                  <Button 
                    onClick={handleDownloadResources}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
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
              Hemos enviado toda la información de acceso a <strong>{funnelData.leadData?.email}</strong>.
              <br />
              <strong>¡IMPORTANTE!</strong> También debes unirte al grupo de WhatsApp para recibir el enlace de las sesiones en vivo.
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