# 🎯 AURA Fashion AI Funnel - Contratos de Integración

## 📋 Resumen del Sistema

Sistema completo de funnel quiz para diagnosticar rentabilidad en negocios de moda, con captura de leads y venta del Workshop "Moda Rentable con IA" ($15 USD).

### 🎨 Frontend Completado (con mocks)
- ✅ Landing page con hero section
- ✅ Quiz interactivo de 5 preguntas
- ✅ Captura de leads con validación
- ✅ Diagnóstico personalizado
- ✅ Checkout con simulación de Stripe
- ✅ Thank you page
- ✅ Panel de administración completo
- ✅ Tracking de eventos (simulado)

### 🔧 Datos Actualmente Mockeados (src/mock.js)

#### Quiz Questions
```javascript
5 preguntas configuradas:
1. Tipo de negocio (4 opciones)
2. Canales de venta (4 opciones, multi-select)
3. Principal costo alto (5 opciones)
4. Objetivo principal (4 opciones)  
5. Nivel uso de IA (4 opciones)
```

#### Diagnósticos
```javascript
5 templates por tipo de dolor:
- produccion: 25-40% reducción costos
- fotografia: 70-85% reducción contenido
- marketing: 50-75% mejor ROAS
- personal: 30-50% reducción horas
- inventario: 35-55% menos stock inmóvil
```

#### Leads Mock
```javascript
3 leads de ejemplo con:
- Datos personales completos
- Respuestas del quiz
- Etapas del funnel
- Timestamps
```

#### Métricas Dashboard
```javascript
Métricas simuladas:
- 1,247 visitantes totales
- 445 leads generados
- 89 compras
- 7.1% conversión
- Embudo completo por etapas
```

## 🔄 APIs a Implementar en Backend

### 1. **POST /api/track** - Tracking de Eventos
```javascript
// Request
{
  "session_id": "abc123",
  "event": "quiz_answer",
  "stage": "STEP_2",
  "visit_id": "uuid",
  "lead_id": null,
  "properties": {
    "question_id": "q2",
    "option_id": "pain_costos"
  }
}

// Response
{
  "success": true,
  "event_id": "uuid"
}
```

### 2. **POST /api/lead** - Creación de Lead
```javascript
// Request
{
  "visit_id": "uuid",
  "first_name": "María",
  "email": "maria@brand.com",
  "phone": "+34666777888",
  "consent_marketing": true,
  "locale": "es-ES",
  "quiz_answers": {
    "1": "marca-emergente",
    "2": ["ecommerce", "redes-sociales"],
    "3": "fotografia",
    "4": "reducir-costos",
    "5": "ocasionalmente"
  }
}

// Response
{
  "success": true,
  "lead_id": "uuid",
  "bucket_id": "fotografia",
  "stage": "LEAD"
}
```

### 3. **POST /api/diagnosis** - Generar Diagnóstico
```javascript
// Request
{
  "lead_id": "uuid"
}

// Response
{
  "bucket_id": "fotografia",
  "title": "Tu contenido visual está costando demasiado",
  "insights": [...],
  "savings_estimate": "70-85% de reducción en costos de contenido",
  "timeframe": "15 días"
}
```

### 4. **POST /api/checkout** - Procesar Pago
```javascript
// Request
{
  "lead_id": "uuid",
  "payment_method": "stripe",
  "stripe_token": "tok_xxx",
  "amount": 15,
  "currency": "USD"
}

// Response
{
  "success": true,
  "order_id": "ORDER_123",
  "payment_status": "completed",
  "access_links": {
    "workshop": "https://...",
    "community": "https://discord.gg/...",
    "resources": "https://..."
  }
}
```

### 5. **GET /api/admin/dashboard** - Métricas Admin
```javascript
// Query params: ?from=2024-01-01&to=2024-01-31

// Response
{
  "metrics": {
    "total_visitors": 1247,
    "quiz_starts": 892,
    "leads_generated": 445,
    "purchases": 89,
    "conversion_rate": 7.1,
    "revenue": 1335
  },
  "funnel_stats": {
    "step1": 892,
    "step5": 634,
    "lead_capture": 445,
    "diagnosis": 378,
    "checkout": 156,
    "purchased": 89
  }
}
```

### 6. **GET /api/admin/leads** - Lista de Leads
```javascript
// Query params: ?search=maria&stage=diagnosis&business_type=all&limit=50

// Response
{
  "leads": [
    {
      "id": "uuid",
      "name": "María García",
      "email": "maria@brand.com",
      "whatsapp": "+34666777888",
      "business_type": "marca-emergente",
      "main_cost": "fotografia",
      "objective": "reducir-costos",
      "ai_usage": "ocasionalmente",
      "stage": "purchased",
      "bucket_id": "fotografia",
      "created_at": "2024-01-15T10:30:00Z",
      "quiz_answers": {...}
    }
  ],
  "total": 445,
  "page": 1,
  "pages": 9
}
```

## 🗄️ Modelos de Base de Datos Requeridos

### Visits
```sql
- id (uuid, pk)
- session_id (string)
- fingerprint (string, optional)
- ip (string)
- user_agent (string)
- landing_path (string)
- referrer (string, optional)
- utm_source (string, optional)
- utm_medium (string, optional)
- utm_campaign (string, optional)
- utm_content (string, optional)
- utm_term (string, optional)
- ad_id (string, optional)
- adset_id (string, optional)
- campaign_id (string, optional)
- platform (string, optional)
- created_at (datetime)
```

### Leads
```sql
- id (uuid, pk)
- visit_id (uuid, fk)
- email (string, unique)
- first_name (string)
- phone (string, optional)
- consent_marketing (boolean)
- locale (string)
- bucket_id (string)
- score (float, default 0)
- stage (enum: LP, QUIZ_STARTED, STEP_1-5, LEAD, RESULT, CHECKOUT, PURCHASED)
- created_at (datetime)
- updated_at (datetime)
```

### Quiz_Answers
```sql
- id (uuid, pk)
- lead_id (uuid, fk, optional inicialmente)
- visit_id (uuid, fk)
- question_id (integer)
- option_ids (json) // Array para multi-select
- value_text (string, optional)
- step_index (integer)
- created_at (datetime)
```

### Events
```sql
- id (uuid, pk)
- visit_id (uuid, fk)
- lead_id (uuid, fk, optional)
- event_name (string)
- properties (json)
- stage (string) // snapshot de etapa
- created_at (datetime)
```

### Orders
```sql
- id (uuid, pk)
- lead_id (uuid, fk)
- order_number (string, unique)
- amount (decimal)
- currency (string)
- payment_status (enum: pending, completed, failed, refunded)
- payment_method (string)
- stripe_payment_intent_id (string, optional)
- created_at (datetime)
- completed_at (datetime, optional)
```

## 🔄 Flujo de Integración

### Remover Mocks del Frontend:
1. **Eliminar imports de mock.js** en todos los componentes
2. **Reemplazar trackEvent** por calls reales a `/api/track`
3. **Cambiar datos hardcoded** por llamadas a APIs
4. **Configurar manejo de errores** real vs simulado

### Endpoints Prioritarios:
1. **Tracking** - Fundamental para métricas
2. **Lead creation** - Core del funnel
3. **Diagnosis** - Diferenciador clave
4. **Admin dashboard** - Para gestión
5. **Checkout** - Monetización

## 🔧 Integraciones Externas Requeridas

### Stripe (Checkout)
- Configurar webhooks para confirmación de pago
- Manejar estados: pending, succeeded, failed
- Guardar payment_intent_id para referencias

### Tracking Pixels (Opcional)
- Meta Pixel: eventos Lead, CompleteRegistration, Purchase
- TikTok Pixel: similares eventos
- Google Analytics 4: custom events

### Email Marketing (Opcional)
- Klaviyo/Mailchimp para automations
- Segmentación por bucket y etapa

## 📊 Eventos de Tracking Implementados

```javascript
// Ya implementados en frontend:
- page_view
- quiz_start  
- quiz_step_view
- quiz_answer
- quiz_progress
- lead_form_view
- lead_submit_attempt
- lead_submitted
- result_view
- cta_click_buy
- checkout_start
- purchase_success
- purchase_fail
- thankyou_view
- community_join_click
```

## 🎯 Próximos Pasos de Desarrollo

1. **Implementar modelos MongoDB** según esquemas definidos
2. **Crear endpoints API** con validaciones apropiadas
3. **Configurar Stripe** para pagos reales
4. **Implementar lógica de bucketización** para diagnósticos
5. **Remover mocks** y conectar frontend real
6. **Testing** completo del flujo end-to-end
7. **Configurar tracking pixels** (opcional)

## 🔒 Consideraciones de Seguridad

- Validar TODOS los inputs del frontend
- Implementar rate limiting en APIs críticas
- Sanitizar datos antes de guardar en DB
- Manejar GDPR/CCPA para consentimientos
- Logs de auditoría para el panel admin

## 📈 Métricas de Éxito

- **Conversión objetivo**: 8% de visitantes a compra
- **Tiempo de completación**: < 3 minutos quiz
- **Abandono máximo**: < 35% por paso
- **Email deliverability**: > 95%
- **Uptime**: > 99.5%