import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { CheckCircle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { FunnelContext } from '../App';
import { diagnosisTemplates, trackEvent } from '../mock';

const Diagnosis = () => {
  const navigate = useNavigate();
  const { funnelData } = useContext(FunnelContext);
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    // Determinar el diagnóstico basado en las respuestas
    const mainCost = funnelData.answers[3]; // Pregunta 3: principal costo alto
    const selectedDiagnosis = diagnosisTemplates[mainCost] || diagnosisTemplates['produccion'];
    
    setDiagnosis(selectedDiagnosis);
    
    trackEvent('result_view', {
      bucket_id: mainCost,
      lead_name: funnelData.leadData?.name,
      quiz_answers: Object.keys(funnelData.answers).length
    });
  }, [funnelData]);

  const handleWorkshopClick = () => {
    trackEvent('cta_click_buy', {
      offer_id: 'workshop-15usd',
      bucket_id: funnelData.answers[3],
      lead_email: funnelData.leadData?.email
    });
    navigate('/checkout');
  };

  const handleDownloadTemplate = () => {
    trackEvent('template_download', {
      bucket_id: funnelData.answers[3],
      lead_email: funnelData.leadData?.email
    });
    // Simular descarga
    alert('¡Tu plantilla se ha enviado a tu email!');
  };

  if (!diagnosis || !funnelData.leadData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Generando tu diagnóstico personalizado...</p>
        </div>
      </div>
    );
  }

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
              Diagnóstico personalizado para {funnelData.leadData.name}
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Result */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              {diagnosis.title}
            </h1>
            
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-4 py-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Potencial: {diagnosis.savingsEstimate}
              </span>
            </div>
          </div>

          {/* Insights */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {diagnosis.insights.map((insight, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                </div>
                <p className="text-stone-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>

          {/* Plan de Acción */}
          <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-stone-900">
                Plan de Acción - Próximos {diagnosis.timeframe}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Lo que implementarás:</h3>
                <ul className="space-y-2 text-stone-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Configuración de herramientas IA específicas para tu tipo de negocio</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Automatización de procesos que más te cuestan tiempo y dinero</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Sistema de métricas para medir el ROI de cada implementación</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Resultados esperados:</h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-emerald-700">{diagnosis.savingsEstimate}</div>
                    <div className="text-sm text-emerald-600">En ahorros/optimización</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-700">15-25 horas/semana</div>
                    <div className="text-sm text-blue-600">Tiempo liberado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              ¿Listo para implementar todo esto?
            </h2>
            <p className="text-stone-300 mb-6 max-w-2xl mx-auto">
              En nuestro Workshop "Moda Rentable con IA" te guiamos paso a paso para implementar 
              estas optimizaciones en tu marca. Acceso inmediato por solo $15 USD.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleWorkshopClick}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-200 hover:transform hover:scale-105"
              >
                Reservar mi plaza al Workshop ($15)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-6 py-4 rounded-xl"
              >
                <Download className="mr-2 w-4 h-4" />
                Descargar plantilla gratuita
              </Button>
            </div>
            
            <div className="mt-6 text-sm text-stone-400">
              ✅ Acceso inmediato • 💰 Garantía 30 días • 👥 Comunidad exclusiva
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-stone-600 mb-4">Únete a más de 500 marcas que ya optimizan con IA</p>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-amber-400 text-xl">⭐</span>
              ))}
              <span className="ml-2 text-stone-600 font-medium">4.9/5 (127 reseñas)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Diagnosis;