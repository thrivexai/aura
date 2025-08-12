// Mock data para el funnel de moda con IA

// Preguntas del quiz
export const quizQuestions = [
  {
    id: 1,
    title: "¿Qué tipo de negocio de moda tienes?",
    subtitle: "Ayúdanos a entender tu perfil",
    options: [
      {
        id: "diseñador-independiente",
        label: "Diseñador independiente",
        description: "Creaciones propias, producción pequeña",
        icon: "Palette"
      },
      {
        id: "marca-emergente", 
        label: "Marca emergente",
        description: "1-3 años en el mercado, creciendo",
        icon: "TrendingUp"
      },
      {
        id: "marca-establecida",
        label: "Marca establecida", 
        description: "Más de 3 años, posicionada",
        icon: "Crown"
      },
      {
        id: "tienda-multimarca",
        label: "Tienda multimarca",
        description: "Vendes múltiples marcas",
        icon: "Store"
      }
    ]
  },
  {
    id: 2,
    title: "¿Por cuáles canales vendes actualmente?",
    subtitle: "Selecciona todos los que uses",
    multiSelect: true,
    options: [
      {
        id: "tienda-fisica",
        label: "Tienda física",
        description: "Showroom o local comercial",
        icon: "MapPin"
      },
      {
        id: "ecommerce",
        label: "E-commerce",
        description: "Tienda online propia",
        icon: "Monitor"
      },
      {
        id: "redes-sociales",
        label: "Redes sociales",
        description: "Instagram, Facebook, TikTok",
        icon: "Instagram"
      },
      {
        id: "marketplaces",
        label: "Marketplaces",
        description: "Amazon, MercadoLibre, etc.",
        icon: "ShoppingBag"
      }
    ]
  },
  {
    id: 3,
    title: "¿Cuál es tu principal costo alto?",
    subtitle: "El que más impacta tu rentabilidad",
    options: [
      {
        id: "produccion",
        label: "Producción",
        description: "Materiales, manufactura, calidad",
        icon: "Scissors"
      },
      {
        id: "fotografia",
        label: "Fotografía",
        description: "Sesiones, modelos, edición",
        icon: "Camera"
      },
      {
        id: "marketing",
        label: "Marketing",
        description: "Publicidad, redes, promoción",
        icon: "Megaphone"
      },
      {
        id: "personal",
        label: "Personal",
        description: "Sueldos, freelancers, equipo",
        icon: "Users"
      },
      {
        id: "inventario",
        label: "Inventario",
        description: "Stock inmóvil, storage",
        icon: "Package"
      }
    ]
  },
  {
    id: 4,
    title: "¿Cuál es tu objetivo principal?",
    subtitle: "Lo que más necesitas lograr ahora",
    options: [
      {
        id: "reducir-costos",
        label: "Reducir costos",
        description: "Optimizar gastos operativos",
        icon: "TrendingDown"
      },
      {
        id: "aumentar-ventas",
        label: "Aumentar ventas",
        description: "Más ingresos y facturación",
        icon: "TrendingUp"
      },
      {
        id: "mejorar-visibilidad",
        label: "Mejorar visibilidad",
        description: "Más alcance y reconocimiento",
        icon: "Eye"
      },
      {
        id: "optimizar-procesos",
        label: "Optimizar procesos",
        description: "Automatizar y ser más eficiente",
        icon: "Zap"
      }
    ]
  },
  {
    id: 5,
    title: "¿Qué tanto usas IA actualmente?",
    subtitle: "En cualquier aspecto de tu negocio",
    options: [
      {
        id: "nunca",
        label: "Nunca",
        description: "No he usado herramientas de IA",
        icon: "X"
      },
      {
        id: "ocasionalmente",
        label: "Ocasionalmente", 
        description: "Lo he probado algunas veces",
        icon: "Play"
      },
      {
        id: "regularmente",
        label: "Regularmente",
        description: "Uso algunas herramientas básicas",
        icon: "RotateCcw"
      },
      {
        id: "avanzado",
        label: "Avanzado",
        description: "Integrado en varios procesos",
        icon: "Cpu"
      }
    ]
  }
];

// Diagnósticos por tipo de dolor principal
export const diagnosisTemplates = {
  "produccion": {
    title: "Estás pagando de más en producción",
    insights: [
      "Tu proceso de diseño y prototipado podría ser 60% más rápido con IA",
      "Los ajustes y cambios en patterns cuestan 3x más de lo necesario",
      "Podrías reducir desperdicios de material hasta un 40% con optimización IA"
    ],
    savingsEstimate: "25-40% de reducción en costos de producción",
    timeframe: "30 días"
  },
  "fotografia": {
    title: "Tu contenido visual está costando demasiado",
    insights: [
      "Generar variaciones de producto con IA reduce costos 80%", 
      "Las sesiones fotográficas pueden optimizarse con pre-visualización IA",
      "El styling automático puede crear 10x más variaciones por sesión"
    ],
    savingsEstimate: "70-85% de reducción en costos de contenido",
    timeframe: "15 días"
  },
  "marketing": {
    title: "Tu marketing no está optimizado para conversión",
    insights: [
      "La segmentación con IA puede mejorar el ROAS hasta 300%",
      "El copy personalizado automático aumenta CTR 2.5x",
      "Las creatividades generadas con IA reducen el CPM 40%"
    ],
    savingsEstimate: "50-75% mejor ROAS en publicidad",
    timeframe: "21 días"
  },
  "personal": {
    title: "Puedes automatizar gran parte del trabajo manual",
    insights: [
      "La gestión de inventario automática libera 15 horas/semana",
      "El customer service con IA reduce la carga 70%",
      "La planificación de colecciones puede ser semi-automática"
    ],
    savingsEstimate: "30-50% de reducción en horas-persona",
    timeframe: "45 días"
  },
  "inventario": {
    title: "Tu inventario no está optimizado",
    insights: [
      "La predicción de demanda con IA reduce stock inmóvil 60%",
      "El análisis de tendencias puede anticipar qué producir",
      "La rotación inteligente mejora el cash flow 40%"
    ],
    savingsEstimate: "35-55% menos stock inmóvil",
    timeframe: "60 días"
  }
};

// Mock leads para el admin panel
export const mockLeads = [
  {
    id: "1",
    name: "María García",
    email: "maria@modaboutique.com",
    whatsapp: "+34 666 777 888",
    businessType: "marca-emergente",
    channels: ["ecommerce", "redes-sociales"],
    mainCost: "fotografia",
    objective: "reducir-costos",
    aiUsage: "ocasionalmente",
    stage: "purchased",
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:45:00Z"
  },
  {
    id: "2", 
    name: "Carlos Mendoza",
    email: "carlos@luxfashion.mx",
    whatsapp: "+52 55 1234 5678",
    businessType: "marca-establecida",
    channels: ["tienda-fisica", "ecommerce"],
    mainCost: "produccion",
    objective: "optimizar-procesos",
    aiUsage: "nunca",
    stage: "diagnosis",
    createdAt: "2024-01-14T16:20:00Z",
    lastActivity: "2024-01-14T16:35:00Z"
  },
  {
    id: "3",
    name: "Ana Rodríguez", 
    email: "ana@anapersonal.com",
    whatsapp: "",
    businessType: "diseñador-independiente",
    channels: ["redes-sociales"],
    mainCost: "marketing",
    objective: "aumentar-ventas",
    aiUsage: "regularmente",
    stage: "quiz_step_3",
    createdAt: "2024-01-14T09:15:00Z",
    lastActivity: "2024-01-14T09:22:00Z"
  }
];

// Mock métricas para el dashboard
export const mockMetrics = {
  totalVisitors: 1247,
  quizStarts: 892,
  quizCompletions: 634,
  leadsGenerated: 445,
  diagnosisViewed: 378,
  checkoutClicks: 156,
  purchases: 89,
  conversionRate: 7.1,
  abandonmentByStep: {
    step1: 12,
    step2: 18,
    step3: 25,
    step4: 15,
    step5: 8,
    leadCapture: 22,
    diagnosis: 35,
    checkout: 43
  }
};

// UTM tracking mock
export const trackEvent = (eventName, properties = {}) => {
  console.log(`🔍 Track Event: ${eventName}`, properties);
  
  // Simular envío a Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // Simular envío a Meta Pixel  
  if (window.fbq) {
    window.fbq('track', eventName, properties);
  }
  
  // Simular envío a TikTok Pixel
  if (window.ttq) {
    window.ttq.track(eventName, properties);
  }
  
  // Guardar en localStorage para desarrollo
  const events = JSON.parse(localStorage.getItem('aura_events') || '[]');
  events.push({
    event: eventName,
    properties,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('aura_events', JSON.stringify(events));
};