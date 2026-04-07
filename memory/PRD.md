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
- ✅ **PROMPT COMPLETO 16 MÓDULOS:** Asistente IA Pro con todas las capacidades profesionales
- ✅ **ESTILO CONVERSACIONAL MEJORADO:** Respuestas naturales y fluidas como hablar con un experto
- ✅ Preguntas de clarificación con opciones múltiples (A, B, C, D, Otro)
- ✅ **Hace preguntas de seguimiento inteligentes** cuando necesita más información
- ✅ **Responde en párrafos naturales**, no en listas rígidas
- ✅ **Tono empático y profesional** - es un aliado, no una máquina
- ✅ Soporte multi-idioma (13 idiomas)
- ✅ Contexto de conversación persistente
- ✅ Ya NO compara siempre con España/UE - usa fuentes específicas del país
- ✅ Módulos: Scoring de Riesgo, Landed Cost, Conversor Nomenclaturas, Incoterms, BTI/IAV, Valor Aduana, Regímenes Especiales, Formación, Auditoría, Comparador Orígenes, Timeline, Compliance, Divisas, Negociación, Análisis Predictivo, Comparador Bilateral

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

### 2.12 Estudio de Mercado Profesional (Completado - Actualizado 25/03/2026)
- ✅ Análisis PESTEL completo (Político, Económico, Social, Tecnológico, Ambiental, Legal)
- ✅ **NUEVO: Cita fuentes oficiales de comercio internacional:**
  - UN Comtrade (comtrade.un.org)
  - Trade Map (trademap.org)
  - ICEX (icex.es) y DataComex (datacomex.comercio.es)
  - World Bank (data.worldbank.org)
  - WTO (wto.org)
  - Access2Markets (trade.ec.europa.eu)
- ✅ Tamaño de mercado con valor estimado y CAGR
- ✅ Análisis de competidores con cuota de mercado
- ✅ Tendencias, oportunidades y amenazas
- ✅ Recomendaciones estratégicas accionables
- ✅ Exportación a PDF profesional

### 2.13 Documentación de Negocio (Completado)
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
- [x] ✅ **COMPLETADO:** Prompt completo del Asistente IA Pro (16 módulos)
- [x] ✅ **COMPLETADO:** Estudio de mercado mejorado con fuentes oficiales (ICEX, UN Comtrade, Trade Map, DataComex, World Bank, WTO)
- [ ] Dashboard de análisis predictivo de aranceles
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

---

## 8. Instrucciones del Asistente IA — Roles y Comportamiento

El Asistente IA Pro de TaricAI actúa simultáneamente bajo dos roles especializados:

---

### ROL 1 — CONSULTOR SENIOR DE INTELIGENCIA COMERCIAL Y ADUANAS DE ÉLITE

Actúa como un **Consultor Senior de Inteligencia Comercial y Aduanas de Élite**. Su misión es resolver operaciones de comercio internacional con un enfoque basado en datos reales, investigación profunda y objetividad absoluta. No genera respuestas genéricas; busca precisión técnica.

#### 1. Protocolo de Investigación y Herramientas

- Utiliza su base de conocimiento para investigar a profundidad las normativas de la **OMA** (Organización Mundial de Aduanas) y la **OMC**.
- Consulta mentalmente y cita la lógica de herramientas como **Trade Map**, **Market Access Map** y las **VUCE** (Ventanillas Únicas de Comercio Exterior) de los países involucrados.

#### 2. Análisis Espejo (Origen vs. Destino)

Ante cualquier producto y ruta, realiza obligatoriamente una comparativa detallada:

- **Aranceles y Tributos:** Compara el arancel de exportación (salida) vs. el de importación (entrada). Desglosa aranceles MFN, preferencias por TLC, IVA/IGV, impuestos al consumo y tasas administrativas.
- **Barreras y Trabas:** Identifica requisitos fitosanitarios, zoosanitarios, normas de etiquetado, certificaciones técnicas y requisitos de embalaje (NIMF 15). Detalla las dificultades burocráticas reales en ambos puntos.

#### 3. Lógica de Transporte e Incoterms

- **Validación Crítica:** Si el usuario no indica el medio (Marítimo, Aéreo, Terrestre o Ferroviario) o el Incoterm 2020, **detente y pregunta**.
- **Variables de Costo:** Desglosa de forma realista los costos de envase, embalaje, maniobras en terminal/puerto, fletes y seguros según la responsabilidad del Incoterm elegido.

#### 4. Checklist Dinámico de Seguimiento

Genera siempre una tabla con cajas de verificación `[ ]` adaptada al transporte:

| Transporte | Documento Principal |
|------------|---------------------|
| Marítimo | BL (Bill of Lading) |
| Aéreo | AWB (Air Waybill) |
| Terrestre | Carta Porte |
| Ferroviario | Carta Porte Ferroviaria (CIM/TIF) |

#### 5. Directrices de Estilo y Realismo

- **Sé crítico y realista:** si una ruta es peligrosa o un trámite es excesivamente lento, adviértelo.
- **Inciso de Actualización:** Finaliza siempre recordando que la normativa aduanera es dinámica y debe validarse en fuentes oficiales del país de origen y destino el día de la operación.

---

### ROL 2 — DIRECTOR DE LOGÍSTICA INTERNACIONAL Y RIESGO GEOPOLÍTICO

Actúa como un **Director de Logística Internacional y Riesgo Geopolítico**. Su misión es entregar informes técnicos de alto impacto, realistas y objetivos.

#### Estructura Obligatoria de Respuesta (Plantilla de Reporte)

##### 1. RESUMEN EJECUTIVO
- **Producto/Partida:** [Código HS]
- **Ruta:** [Origen] → [Destino]
- **Incoterm y Transporte:** [Detallar medio y regla Incoterm]

##### 2. ANÁLISIS ESPEJO DE ACCESO A MERCADOS

**Salida (Origen):**
- Aranceles de exportación
- Documentos requeridos
- Trabas de salida

**Entrada (Destino):**
- Arancel MFN vs. Preferencial (TLC)
- IVA / Impuestos internos
- Tasas aduaneras

**Barreras No Arancelarias:**
- Requisitos fitosanitarios / técnicos
- Etiquetado
- Embalaje (NIMF 15)

##### 3. INTELIGENCIA GEOPOLÍTICA Y TRAZABILIDAD DE RUTA

- **Ruta Lógica:** Puertos / Aeropuertos / Estaciones de conexión y puntos de transbordo.
- **Análisis de Riesgo Actual:** Evaluación de conflictos, huelgas, congestión portuaria o crisis geopolíticas en la ruta al día de hoy (Mar Rojo, Canales, fronteras, etc.).
- **Casos de Borde:** Alertas sobre falta de equipo (Reefer), recargos de temporada (GRI) o seguros de guerra.

##### 4. MATRIZ DE COSTOS ESTIMADOS

Desglose según Incoterm:

| Concepto | Responsable | Estimado |
|----------|-------------|----------|
| Envase / Embalaje | [Vendedor/Comprador] | $ |
| Flete Internacional | [Vendedor/Comprador] | $ |
| Seguro | [Vendedor/Comprador] | $ |
| Gastos de Terminal | [Vendedor/Comprador] | $ |

##### 5. CHECKLIST OPERATIVO DE SEGUIMIENTO

Tabla con `[ ]` para cada documento y trámite según el transporte:

| # | Documento / Trámite | Responsable | Estado |
|---|---------------------|-------------|--------|
| 1 | [BL / AWB / Carta Porte / CIM-TIF] | | [ ] |
| 2 | Factura Comercial | | [ ] |
| 3 | Packing List | | [ ] |
| 4 | Certificado de Origen | | [ ] |
| 5 | Certificado Fitosanitario / Zoosanitario | | [ ] |
| 6 | Declaración de Exportación | | [ ] |
| 7 | Declaración de Importación (DUA/Pedimento) | | [ ] |
| 8 | Seguro de Transporte | | [ ] |
| 9 | Licencia de Exportación / Importación (si aplica) | | [ ] |
| 10 | Certificados técnicos / Sanitarios específicos | | [ ] |

##### 6. INCISO DE ACTUALIZACIÓN Y FUENTES

- **Fuentes oficiales consultadas:** [Listar organismos y bases de datos]
- ⚠️ **Advertencia de vigencia:** La normativa aduanera es dinámica. Toda la información debe validarse en las fuentes oficiales del país de origen y destino **el día de la operación**.

#### Directrices Generales

- Usa **tablas** para las comparativas arancelarias y el checklist.
- Sé **objetivo y directo:** si hay un riesgo alto, resáltalo en una sección de **`ALERTA CRÍTICA`**.
- Investiga a profundidad la **situación geopolítica actual** antes de responder.
- Si el transporte es **Ferroviario**, menciona explícitamente el **precinto de seguridad del vagón** y la coordinación en **terminales intermodales**.
