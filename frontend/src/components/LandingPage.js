import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { trackEvent } from '../mock';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('page_view', { page: 'landing' });
  }, []);

  const handleStartQuiz = () => {
    trackEvent('quiz_start', { source: 'landing_cta' });
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA AI Fashion Assistant"
              className="h-10 w-auto"
            />
            <div className="text-stone-600 text-sm font-medium">
              AI Fashion Assistant
            </div>
          </div>
          <div className="text-sm text-stone-600">
            Diagnóstico gratuito
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Usado por +500 marcas de moda
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 mb-6 leading-tight">
            Descubre cuánto podrías
            <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ahorrar y ganar
            </span>
            con IA en tu marca de moda
          </h1>
          
          <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Responde 5 preguntas simples y recibe tu diagnóstico personalizado sobre los puntos de fuga de rentabilidad en tu negocio de moda.
          </p>

          <Button 
            onClick={handleStartQuiz}
            size="lg"
            className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 text-lg rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Comenzar diagnóstico gratuito
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="mt-8 text-sm text-stone-500">
            ⏱️ Solo 2 minutos • 🔒 100% confidencial • 📱 Sin tarjeta requerida
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-900 mb-12">
            Qué descubrirás en tu diagnóstico
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">
                Potencial de ahorro
              </h3>
              <p className="text-stone-600">
                Cuánto dinero podrías ahorrar mensualmente optimizando tus procesos con IA
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">
                Procesos a automatizar
              </h3>
              <p className="text-stone-600">
                Qué tareas específicas de tu negocio pueden ser automatizadas para ganar tiempo
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">
                Plan de acción 30 días
              </h3>
              <p className="text-stone-600">
                Pasos concretos para implementar IA en tu marca y ver resultados inmediatos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof con logos */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-stone-900 mb-8">
            Marcas que ya están optimizando con IA
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <img 
                src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/5n10m5bu_image.png"
                alt="Lebrel"
                className="h-12 w-auto mx-auto mb-2 object-contain"
              />
              <div className="text-sm font-medium text-stone-700">Lebrel</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <img 
                src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/a2tm8ozh_image.png"
                alt="Lalá"
                className="h-12 w-auto mx-auto mb-2 object-contain"
              />
              <div className="text-sm font-medium text-stone-700">Lalá</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <div className="h-12 w-12 bg-stone-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-stone-600 font-bold text-lg">B</span>
              </div>
              <div className="text-sm font-medium text-stone-700">Baffi</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <div className="h-12 w-12 bg-stone-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-stone-600 font-bold text-lg">+</span>
              </div>
              <div className="text-sm font-medium text-stone-700">497 más</div>
            </div>
          </div>
          <div className="text-stone-600">
            <strong>Más de 500 marcas de moda</strong> ya están ahorrando en promedio <strong>65% en costos</strong> con estos métodos
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto filter invert"
            />
            <span className="text-white font-medium">AURA</span>
          </div>
          <p className="text-sm">
            © 2024 AURA AI Fashion Assistant. Transformando la industria de la moda con inteligencia artificial.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;