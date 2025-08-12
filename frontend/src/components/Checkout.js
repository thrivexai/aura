import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { CreditCard, Lock, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { FunnelContext } from '../App';
import { trackEvent } from '../mock';

const Checkout = () => {
  const navigate = useNavigate();
  const { funnelData } = useContext(FunnelContext);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos en segundos

  useEffect(() => {
    trackEvent('checkout_start', {
      offer_id: 'workshop-15usd',
      lead_email: funnelData.leadData?.email,
      bucket_id: funnelData.answers[3]
    });
  }, [funnelData]);

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      trackEvent('purchase_success', {
        order_id: `ORDER_${Date.now()}`,
        value: 15,
        currency: 'USD',
        lead_email: funnelData.leadData?.email,
        payment_method: 'card'
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

  const handleBack = () => {
    navigate('/diagnosis');
  };

  if (!funnelData.leadData) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto"
            />
            <div className="text-stone-600 text-sm">
              Checkout seguro
            </div>
          </div>
          <div className="flex items-center space-x-2 text-amber-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Resumen del producto */}
            <div>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 text-stone-600 hover:text-stone-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al diagnóstico
              </Button>

              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">
                  Workshop: Moda Rentable con IA
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-stone-900">Acceso inmediato al workshop</div>
                      <div className="text-sm text-stone-600">2 horas de contenido práctico</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-stone-900">Plantillas y recursos</div>
                      <div className="text-sm text-stone-600">Valor $247 USD incluido</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-stone-900">Comunidad exclusiva</div>
                      <div className="text-sm text-stone-600">Discord con +500 marcas</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-stone-900">Garantía 30 días</div>
                      <div className="text-sm text-stone-600">100% satisfacción garantizada</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex justify-between text-stone-600">
                    <span>Workshop (precio regular $97 USD)</span>
                    <span className="line-through">$97.00</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Descuento lanzamiento</span>
                    <span className="text-emerald-600">-$82.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-stone-900">
                    <span>Total hoy</span>
                    <span>$15.00 USD</span>
                  </div>
                </div>

                {timeLeft > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm text-amber-800">
                      ⏰ <strong>Oferta limitada:</strong> Este precio especial expira en {formatTime(timeLeft)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de pago */}
            <div>
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-stone-900">Pago seguro</h3>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Información del lead */}
                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="text-sm text-stone-600 mb-1">Facturación a:</div>
                    <div className="font-medium text-stone-900">{funnelData.leadData.name}</div>
                    <div className="text-stone-600">{funnelData.leadData.email}</div>
                  </div>

                  {/* Datos de tarjeta */}
                  <div>
                    <Label htmlFor="cardName" className="text-stone-700 font-medium">
                      Nombre en la tarjeta
                    </Label>
                    <Input
                      id="cardName"
                      type="text"
                      value={paymentData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      placeholder="Nombre completo"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-stone-700 font-medium">
                      Número de tarjeta
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="cardNumber"
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="pl-10"
                        required
                      />
                      <CreditCard className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-stone-700 font-medium">
                        MM/AA
                      </Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="12/28"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-stone-700 font-medium">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className="mt-2"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 text-lg rounded-xl transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando pago...</span>
                      </div>
                    ) : (
                      <span>Completar compra • $15.00 USD</span>
                    )}
                  </Button>
                </form>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <div className="flex items-center justify-center space-x-4 text-sm text-stone-600">
                    <div className="flex items-center space-x-1">
                      <Lock className="w-4 h-4" />
                      <span>SSL Secure</span>
                    </div>
                    <div>256-bit encryption</div>
                    <div>🔒 PCI Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;