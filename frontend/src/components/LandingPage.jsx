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
      {/* Header (restaurado) */}
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
      <section className="px-4 sm:px-6 pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-amber-800">
              Usado por +500 marcas de moda
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-stone-900 mb-4 sm:mb-6 leading-[1.2] sm:leading-[1.15]">
            En 2 minutos sabrás cuánto{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              dinero y tiempo
            </span>{" "}
            tu marca está{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              dejando en la mesa
            </span>{" "}
            por no usar IA.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-stone-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Responde 5 preguntas rápidas y descubre tu diagnóstico personalizado: dónde se
            escapa tu rentabilidad y qué pasos seguir para recuperar el control de tu
            negocio de moda.
          </p>

          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Descubrir mi diagnóstico ahora 🚀
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-stone-500">
            ⏱️ Solo 2 minutos • 🔒 100% confidencial • 📱 Sin tarjeta requerida
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-stone-900 mb-8 sm:mb-12">
            Qué descubrirás en tu diagnóstico
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="text-center p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-2 sm:mb-3">
                Potencial de ahorro
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                Descubre cuánto dinero estás perdiendo HOY y cómo recuperarlo.
              </p>
            </div>

            <div className="text-center p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-2 sm:mb-3">
                Procesos a automatizar
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                Libérate de tareas repetitivas y gana más horas creativas cada semana.
              </p>
            </div>

            <div className="text-center p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-all duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mb-2 sm:mb-3">
                Plan de acción 30 días
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                Recibe un plan paso a paso listo para aplicar en tu marca y ver resultados inmediatos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof con logos */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-stone-900 mb-6 sm:mb-8">
            Marcas que ya están optimizando con IA
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {[{l:'L',n:'Lebrel'},{l:'L',n:'Lalá'},{l:'B',n:'Baffi'},{l:'+',n:'497 más'}].map((m,i)=>(
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-200">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-stone-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-stone-600 font-bold text-base sm:text-lg">{m.l}</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-stone-700">{m.n}</div>
              </div>
            ))}
          </div>
          <div className="text-sm sm:text-base text-stone-600">
            <strong>Más de 500 marcas de moda</strong> ya están ahorrando en promedio <strong>65% en costos</strong> con estos métodos
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-7 sm:h-8 w-auto invert"
            />
            <span className="text-white font-medium">AURA</span>
          </div>
          <p className="text-xs sm:text-sm">
            © 2024 AURA AI Fashion Assistant. Transformando la industria de la moda con inteligencia artificial.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;