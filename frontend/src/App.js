import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
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

  React.useEffect(() => {
    // Guardar parámetros UTM y fbclid al inicio de la app
    saveUTMParameters();
    // Generar sessionId único
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setFunnelData(prev => ({ ...prev, sessionId }));
  }, []);

  return (
    <FunnelContext.Provider value={{ funnelData, setFunnelData }}>
      <div className="App">
        <BrowserRouter>
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

export default App;