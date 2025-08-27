import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import { trackVisitor } from './utils/visitorTracking';
import { saveUTMParameters } from "./utils/webhooks";
import Quiz from "./components/Quiz";
import LeadCapture from "./components/LeadCapture";
import Diagnosis from "./components/Diagnosis";
import Checkout from "./components/Checkout";
import ThankYou from "./components/ThankYou";
import AdminPanel from "./components/AdminPanel";

// Contexto para manejar el estado del funnel
export const FunnelContext = React.createContext();

function App() {
  const [funnelData, setFunnelData] = React.useState({
    answers: {},
    leadData: null,
    currentStep: 0,
    sessionId: null
  });

useEffect(() => {
    // Guardar parámetros UTM y fbclid al inicio de la app
    saveUTMParameters();
    // Generar sessionId único
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setFunnelData(prev => ({ ...prev, sessionId }));

    // Meta Pixel Code (versión corregida)
    if (typeof window.fbq === 'undefined') {
      const script = document.createElement('script');
      script.text = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;
          n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2591680064524614');
          fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

    // Limpieza al desmontar el componente
    return () => {
      const scripts = document.querySelectorAll('script[src*="fbevents.js"]');
      scripts.forEach(script => script.remove());
      delete window.fbq;
    };
  }, []);

  return (
    <FunnelContext.Provider value={{ funnelData, setFunnelData }}>
      <div className="App">
        <noscript>
          <img height="1" width="1" style={{display:'none'}} 
            src="https://www.facebook.com/tr?id=2591680064524614&ev=PageView&noscript=1"/>
        </noscript>
        <BrowserRouter>
          <TrackVisitor />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/lead-capture" element={<LeadCapture />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </div>
    </FunnelContext.Provider>
  );
}

function TrackVisitor() {
  const location = useLocation();

  useEffect(() => {
    trackVisitor(location);
  }, [location]);

  return null;
}

export default App;