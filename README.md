# Aura Fashion AI Funnel - Migración a Supabase

## Configuración de Supabase

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y las API keys

### 2. Configurar las tablas
1. Ve a la sección SQL Editor en tu dashboard de Supabase
2. Ejecuta los archivos SQL en orden:
   - `supabase/migrations/create_status_checks_table.sql`
   - `supabase/migrations/create_lead_webhooks_table.sql`
   - `supabase/migrations/create_purchase_webhooks_table.sql`

### 3. Configurar variables de entorno

#### Backend (.env)
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
CORS_ORIGINS=http://localhost:3000,https://tu-dominio-frontend.com
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Instalar dependencias
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend (no cambia)
cd frontend
npm install
```

### 5. Ejecutar la aplicación
```bash
# Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
npm start
```

## Cambios principales

### Base de datos
- **MongoDB** → **Supabase (PostgreSQL)**
- Tablas: `lead_webhooks`, `purchase_webhooks`, `status_checks`
- Row Level Security (RLS) habilitado
- Índices para mejor performance

### Backend
- **pymongo/motor** → **supabase-py/asyncpg**
- Queries SQL en lugar de MongoDB queries
- Manejo de JSON con PostgreSQL JSONB
- Misma API, diferente implementación

### Frontend
- Sin cambios necesarios
- Mismas URLs de API
- Misma funcionalidad

## Ventajas de Supabase

1. **Escalabilidad**: PostgreSQL es más escalable que MongoDB para este caso
2. **SQL**: Queries más eficientes y familiares
3. **Real-time**: Supabase ofrece subscripciones en tiempo real
4. **Auth**: Sistema de autenticación integrado
5. **Dashboard**: Interface web para administrar datos
6. **Backups**: Backups automáticos
7. **Edge Functions**: Serverless functions si las necesitas

## Migración de datos existentes

Si tienes datos en MongoDB, puedes migrarlos:

1. Exporta los datos de MongoDB:
```bash
mongoexport --collection=lead_webhooks --db=tu_db --out=leads.json
mongoexport --collection=purchase_webhooks --db=tu_db --out=purchases.json
```

2. Transforma y carga en Supabase usando el dashboard o scripts Python

## Testing

El sistema mantiene la misma funcionalidad:
- ✅ Webhooks de lead capture y purchase
- ✅ Panel de administración completo
- ✅ Exportación CSV
- ✅ Métricas y analytics
- ✅ Configuración de webhooks