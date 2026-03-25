# TaricAI - PRD (Product Requirements Document)
## Plataforma de Comercio Internacional con IA

**Última actualización:** 25 de Marzo, 2026

---

## 1. Visión del Producto

TaricAI es una plataforma SaaS de comercio internacional impulsada por IA que permite a empresas, agentes de aduanas e importadores/exportadores:

- Clasificar productos usando códigos HS/TARIC con IA
- Obtener información arancelaria de 65+ países
- Acceder a requisitos fitosanitarios y documentación necesaria
- Simular costos de importación
- Consultar tratados comerciales vigentes
- Evaluar el riesgo país de operaciones comerciales

---

## 2. Características Implementadas

### 2.1 Core (Completado)
- ✅ Autenticación JWT con roles (admin/user)
- ✅ Clasificación arancelaria por texto con GPT-5.2
- ✅ Clasificación por imagen
- ✅ Historial de clasificaciones
- ✅ Sistema multi-organización

### 2.2 Módulos Internacionales (Completado)
- ✅ Base de datos de 65+ países con normativas aduaneras
- ✅ Información de tratados comerciales (UE, CAN, Mercosur, CPTPP, etc.)
- ✅ Requisitos fitosanitarios por país
- ✅ Enlaces a autoridades oficiales

### 2.3 Chat Conversacional IA (Completado - Actualizado 25/03/2026)
- ✅ Asistente IA Pro con prompt profesional completo
- ✅ Preguntas de clarificación con opciones múltiples
- ✅ Soporte multi-idioma (13 idiomas)
- ✅ Contexto de conversación persistente
- ✅ Ya NO compara siempre con España/UE - usa fuentes específicas del país
- ✅ Formato de respuesta estructurado con Risk Score

### 2.4 Mapa Mundial Interactivo (Completado - Actualizado 25/03/2026)
- ✅ Visualización por regiones (Europa, América, Asia, África, Oceanía)
- ✅ **NUEVO: Modo Riesgo País (estilo CESCE)**
  - Niveles 1-7 con colores distintivos
  - Alertas de sanciones y conflictos
  - Recomendaciones de operación
- ✅ Panel de información detallada por país
- ✅ Selección rápida de origen/destino

### 2.5 Simulador de Costos de Importación (Completado)
- ✅ Cálculo de valor CIF
- ✅ Desglose de aranceles e impuestos
- ✅ Costos adicionales (agente aduanal, almacenaje, documentación)
- ✅ Exportación de resultados

### 2.6 Dashboard de Estadísticas (Completado)
- ✅ Gráficos de actividad por período (diario, semanal, mensual)
- ✅ Top productos clasificados
- ✅ Países de origen/destino más consultados
- ✅ Resumen de uso mensual

### 2.7 Clasificación por Lotes (Completado)
- ✅ Hasta 50 productos por lote
- ✅ Carga desde CSV/TXT
- ✅ Resultados exportables a Excel
- ✅ Indicadores de confianza

### 2.8 Sistema de Alertas (Completado)
- ✅ Suscripción a cambios arancelarios
- ✅ Monitoreo por códigos HS y países
- ✅ Integración con Resend para emails
- ✅ Email de prueba para verificación

### 2.9 Exportación a Excel (Completado)
- ✅ Exportación de clasificaciones con fórmulas visibles
- ✅ Exportación de historial completo
- ✅ Desglose de costos con cálculos

### 2.10 Integración ERP (Completado - Interfaz)
- ✅ Panel de configuración para SAP, Oracle, Microsoft Dynamics
- ✅ Opciones de autenticación (API Key, OAuth 2.0)
- ✅ Mapeo de campos configurable
- ⚠️ NOTA: Requiere configuración del cliente para funcionar

### 2.11 Documentación de Negocio (Completado)
- ✅ Pitch Deck (PDF y Word)
- ✅ Plan Financiero
- ✅ Análisis de Costos Operativos

---

## 3. Arquitectura Técnica

### Backend (FastAPI)
```
/app/backend/
├── server.py              # API principal (~2800 líneas)
├── assistant_prompt.py    # Prompt del Asistente IA Pro + Riesgo País
├── customs_database.py    # Base de datos de 65+ países
├── documents_database.py  # Documentos oficiales
├── notifications.py       # Sistema de emails con Resend
└── requirements.txt
```

### Frontend (React)
```
/app/frontend/src/
├── pages/
│   ├── DashboardPage.jsx        # Dashboard principal
│   ├── InternationalChatPage.jsx # Chat IA con clarificación
│   └── LandingPage.jsx          # Landing internacional
├── components/
│   ├── WorldTradeMap.jsx        # Mapa con modo riesgo
│   ├── ImportCostSimulator.jsx  # Simulador de costos
│   ├── UsageStatsPanel.jsx      # Gráficos de uso
│   ├── BatchClassificationPanel.jsx # Clasificación por lotes
│   ├── AlertSubscriptionPanel.jsx   # Alertas arancelarias
│   └── ERPIntegration.jsx       # Configuración ERP
├── utils/
│   └── excelExport.js           # Exportación con fórmulas
└── config/
    ├── countries.js             # Configuración de países
    └── i18n.js                  # Traducciones (13 idiomas)
```

### Integraciones
- **OpenAI GPT-5.2** via Emergent LLM Key
- **Resend** para notificaciones por email
- **MongoDB** para persistencia
- **react-simple-maps** para visualización geográfica
- **xlsx (SheetJS)** para exportación Excel

---

## 4. Endpoints Principales

### Clasificación
- `POST /api/taric/classify` - Clasificación por texto
- `POST /api/taric/classify-image` - Clasificación por imagen
- `POST /api/taric/batch-classify` - Clasificación por lotes

### Chat
- `POST /api/chat/message` - Mensaje al Asistente IA Pro

### Riesgo País
- `GET /api/risk/country/{code}` - Riesgo de un país
- `GET /api/risk/all-countries` - Todos los países
- `GET /api/risk/compare/{origin}/{destination}` - Comparar países

### Estadísticas
- `GET /api/stats/usage` - Estadísticas de uso
- `GET /api/stats/summary` - Resumen del mes

### Alertas
- `POST /api/alerts/subscribe` - Suscribirse a alertas
- `GET /api/alerts/subscription` - Ver suscripción
- `DELETE /api/alerts/unsubscribe` - Cancelar alertas

---

## 5. Backlog y Próximas Funcionalidades

### P1 - Próximas
- [ ] Dashboard de análisis predictivo de aranceles
- [ ] Integración con APIs de comercio (Trade Map, UN Comtrade)
- [ ] Notificaciones push para móvil
- [ ] Módulo de certificados de origen digital

### P2 - Futuras
- [ ] App móvil nativa (iOS/Android)
- [ ] Integración con blockchain para trazabilidad
- [ ] Módulo de logística y tracking
- [ ] Marketplace de servicios aduaneros

---

## 6. Métricas de Éxito

- **Precisión de clasificación:** >94%
- **Tiempo de respuesta:** <3 segundos
- **Uptime:** >99.5%
- **Satisfacción del usuario:** >4.5/5

---

## 7. Contacto

- **Plataforma:** https://arancelai.preview.emergentagent.com
- **Soporte técnico:** Asistente IA Pro integrado
