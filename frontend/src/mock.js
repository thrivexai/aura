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

// Contenido del workshop actualizado
export const workshopContent = {
  puv: "En 3 sesiones vas a descubrir cómo reducir drásticamente los costos de tu marca de moda y aumentar tu rentabilidad usando IA, sin perder calidad y sin depender de agencias costosas.",
  days: [
    {
      id: 1,
      title: "Día 1: Identificar fugas de dinero y cómo cerrarlas",
      content: [
        "Por qué las marcas rentables no son las más grandes",
        "Las 5 fugas de dinero más comunes en moda",
        "Casos reales de ahorro del 50-70% en costos",
        "El nuevo mindset: rentabilidad antes que tamaño"
      ]
    },
    {
      id: 2,
      title: "Día 2: El método para producir más gastando menos",
      content: [
        "Caso real: de 3 meses y $5,000 a 2 semanas y $500",
        "Los 3 pilares del método: Collections, Marketer, Pictures",
        "Ejemplo en vivo con una prenda real",
        "Conceptualización rápida con IA"
      ]
    },
    {
      id: 3,
      title: "Día 3: El sistema completo para hacerlo de forma continua",
      content: [
        "Presentación de Aura X-Tyle + X-Chool",
        "Sistema completo de automatización",
        "Cómo mantener la calidad mientras reduces costos",
        "Plan de implementación paso a paso"
      ]
    }
  ],
  includes: [
    "Grabación completa de los tres días",
    "Guía completa de prompts para IA",
    "Todos los recursos utilizados durante el workshop",
    "Acceso al grupo exclusivo de WhatsApp"
  ],
  schedule: {
    days: "Lunes, Martes y Miércoles",
    time: "7:00 PM",
    timezone: "Hora Colombia",
    whatsappGroup: "https://chat.whatsapp.com/F5rbmNKuMLtK0g3fylTSH2"
  }
};

// Mock leads para el admin panel
export const mockLeads = [
  {
    id: "1",
    name: "María García",
    email: "maria@lebrel.com",
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
    email: "carlos@lala.mx",
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
    email: "ana@baffi.com",
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

// Testimonios con marcas reales
export const testimonials = [
  {
    name: "Carolina de la Torre",
    brand: "Lebrel",
    location: "",
    quote: "Reducimos nuestros costos de fotografía en un 78%. Lo que antes nos costaba $2,000 por sesión, ahora lo hacemos por $450 con mejor calidad.",
    rating: 5
  },
  {
    name: "Laura González", 
    brand: "Lalá",
    location: "",
    quote: "En 3 semanas implementamos todo. Nuestro ROAS subió de 2.1x a 4.7x. Ya recuperamos la inversión 15 veces.",
    rating: 5
  },
  {
    name: "Ana Rodríguez",
    brand: "Baffi", 
    location: "Colombia",
    quote: "El workshop nos cambió la perspectiva. Ahora producimos el doble de contenido en la mitad del tiempo y con mejor resultado.",
    rating: 5
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

// UTM tracking mock (filtrado por plataforma)
const META_ALLOWED_EVENTS = new Set(['quiz_start']); 
// ↑ Solo estos eventos se enviarán a Meta (fbq). Déjalo vacío para NO enviar ninguno.
// Ej: new Set()  -> no manda nada a Meta
// Ej: new Set(['quiz_start']) -> solo manda quiz_start

// Si quieres restringir también GA o TikTok, cambia null por un Set([...])
const GA_ALLOWED_EVENTS = null; // null = permitir todos a GA
const TT_ALLOWED_EVENTS = null; // null = permitir todos a TikTok

export const trackEvent = (eventName, properties = {}) => {
  // 1) Log interno / debug
  try {
    console.log(`🔍 Track Event: ${eventName}`, properties);
  } catch (e) {
    // no-op
  }

  // 2) Google Analytics (gtag)
  try {
    if (window.gtag && (!GA_ALLOWED_EVENTS || GA_ALLOWED_EVENTS.has(eventName))) {
      window.gtag('event', eventName, properties);
    }
  } catch (e) {
    console.warn('GA track suppressed/error:', e);
  }

  // 3) Meta Pixel (fbq): **solo** si el evento está permitido
  try {
    if (window.fbq && process.env.NODE_ENV === 'production' && META_ALLOWED_EVENTS.has(eventName)) {
      window.fbq('trackCustom', eventName, properties);
    }
  } catch (e) {
    console.warn('Meta fbq suppressed/error:', e);
  }

  // 4) TikTok Pixel (ttq)
  try {
    if (window.ttq && (!TT_ALLOWED_EVENTS || TT_ALLOWED_EVENTS.has(eventName))) {
      window.ttq.track(eventName, properties);
    }
  } catch (e) {
    console.warn('TikTok track suppressed/error:', e);
  }

  // 5) Persistencia local para debug (opcional)
  try {
    const events = JSON.parse(localStorage.getItem('aura_events') || '[]');
    events.push({
      event: eventName,
      properties,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('aura_events', JSON.stringify(events));
  } catch (e) {
    // no-op
  }
};