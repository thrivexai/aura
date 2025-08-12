import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Gift, Shield, ArrowRight } from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent } from '../mock';

const LeadCapture = () => {
  const navigate = useNavigate();
  const { funnelData, setFunnelData } = useContext(FunnelContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    consent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    trackEvent('lead_form_view', {
      quiz_completed: Object.keys(funnelData.answers).length > 0
    });
  }, [funnelData.answers]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.consent) {
      newErrors.consent = 'Debes aceptar la política de privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      trackEvent('lead_submit_attempt', {
        success: false,
        errors: Object.keys(errors)
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular envío a backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Guardar datos del lead en el contexto
      setFunnelData(prev => ({
        ...prev,
        leadData: formData,
        currentStep: 2
      }));

      trackEvent('lead_submitted', {
        success: true,
        has_whatsapp: Boolean(formData.whatsapp),
        quiz_answers_count: Object.keys(funnelData.answers).length
      });

      navigate('/diagnosis');
      
    } catch (error) {
      trackEvent('lead_submit_attempt', {
        success: false,
        error: error.message
      });
      setErrors({ submit: 'Hubo un error. Por favor intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
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
              Casi terminamos...
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
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
              Recibe tu análisis personalizado y una plantilla de IA gratuita para empezar a optimizar tu marca hoy mismo.
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-amber-600 font-semibold">✨ Diagnóstico</div>
                <div className="text-sm text-stone-600">Personalizado</div>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-amber-600 font-semibold">🎁 Plantilla IA</div>
                <div className="text-sm text-stone-600">Valor $47 USD</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

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
                  className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-stone-700 font-medium">
                  WhatsApp (opcional)
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="+34 666 777 888"
                  className="mt-2"
                />
                <p className="text-sm text-stone-500 mt-1">
                  Para enviarte tips adicionales y recordatorios
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => handleInputChange('consent', checked)}
                  className={errors.consent ? 'border-red-500' : ''}
                />
                <div className="flex-1">
                  <Label htmlFor="consent" className="text-sm text-stone-600 leading-relaxed cursor-pointer">
                    Acepto recibir mi diagnóstico y contenido relacionado con optimización de moda con IA. 
                    Puedo darme de baja en cualquier momento.
                  </Label>
                  {errors.consent && (
                    <p className="text-red-500 text-sm mt-1">{errors.consent}</p>
                  )}
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

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
              <div className="text-sm text-stone-600">
                🔒 SSL Encrypted
              </div>
              <div className="text-sm text-stone-600">
                📧 Sin spam
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadCapture;