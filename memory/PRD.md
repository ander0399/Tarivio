# TaricAI - Product Requirements Document
## Última actualización: 22 Marzo 2026

## Original Problem Statement
Crear una aplicación SaaS donde se pueda leer el TARIC y con inteligencia artificial se pueda colocar simplemente una palabra del TARIC de mi producto y se pueda sacar la nomenclatura arancelaria con sitios oficiales del TARIC español o de la Unión Europea. Adicional a eso, créale el portal donde le bote de una vez los aranceles, todos los tributos y los documentos que necesita para poder traer ese producto, todo en un solo lugar y sacado de sitios oficiales de España y de la unión europea.

**Actualización (Marzo 2026):** Hacer TaricAI internacional, con información de régimen arancelario entre países, requisitos fitosanitarios, barreras de entrada, tratados comerciales, y una interfaz conversacional tipo chat.

## Target Users
- Agencias de aduanas
- Importadores/Exportadores
- Empresas B2B de comercio internacional
- Consultores de comercio exterior

## Tech Stack
- **Backend**: FastAPI, Python, MongoDB
- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **AI**: emergentintegrations (GPT-5.2 para texto y visión)
- **Auth**: JWT tokens

---

## Implementation Status

### Phase 1: MVP ✅ COMPLETED
- User authentication (register/login/JWT)
- Basic TARIC search with AI
- Official sources integration
- Tariffs and document checklist

### Phase 2: B2B Features ✅ COMPLETED
- Organization/Team management
- Search history per organization
- Client reference tracking
- Trade agreements detection

### Phase 3: Advanced AI Features ✅ COMPLETED
- **Image Classification**: Upload product photo → AI describes → Classify
- **Market Study with PESTEL**: Generate professional market reports, downloadable as PDF
- **AI Clarification Questions**: If description is vague, AI asks BEFORE classification
- **Internationalization (i18n)**: 38+ languages

### Phase 4: Multi-Language Expansion ✅ COMPLETED (Dec 2025)
- **Expanded Language Support**: 38+ languages
- **Multi-language AI Responses**
- **Improved Language Selector** with search

### Phase 5: International Trade Platform ✅ COMPLETED (Mar 2026)
#### 5.1 Base de Datos Mundial de Aduanas
- **65 países** con información detallada:
  - Autoridades aduaneras oficiales
  - Bases de datos arancelarias
  - Autoridades fitosanitarias
  - Requisitos de importación
  - IVA/VAT rates
  - Moneda y notas especiales
- **Regiones cubiertas**: Europa (UE y no UE), América del Norte, Latinoamérica, Asia, Medio Oriente, África, Oceanía

#### 5.2 Tratados Comerciales
- **10 tratados principales** con detalles:
  - EU Single Market, USMCA, RCEP, CPTPP, AfCFTA, MERCOSUR, Pacific Alliance, ASEAN, GCC, EFTA
- Detección automática de tratados aplicables entre países

#### 5.3 Chat Conversacional Internacional
- Interfaz tipo Claude/ChatGPT para consultas
- Selección de país origen y destino
- Historial de conversaciones por sesión
- Preguntas sugeridas contextuales
- Fuentes oficiales en cada respuesta
- Soporte multi-idioma

#### 5.4 Mapa Mundial Interactivo ✅ NEW
- Mapa SVG interactivo con 65+ países
- Colores por región (Europa, América, Asia, África, Oceanía)
- Click en país para ver información comercial detallada
- Panel lateral con:
  - Autoridad aduanera y enlace oficial
  - Base de datos arancelaria
  - Autoridad fitosanitaria
  - Información fiscal (IVA, moneda)
  - Requisitos de importación
  - Tratados comerciales
  - Notas especiales
- Controles de zoom y navegación
- Leyenda de regiones

#### 5.5 Landing Page Profesional
- Enfoque en comercio internacional global
- Estadísticas: 65+ países, 10+ tratados, 21K+ códigos
- Fuentes oficiales: TARIC UE, CBP USA, DIAN, SAT, GACC, WTO
- Mensaje dirigido a agencias de aduanas, importadores y exportadores de todos los tamaños

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### TARIC Classification
- `POST /api/taric/search` - Main classification
- `POST /api/taric/check-clarification` - Pre-check clarification
- `GET /api/taric/history` - Get search history
- `GET /api/taric/result/{id}` - Get specific result
- `DELETE /api/taric/history/{id}` - Delete from history

### Advanced Features
- `POST /api/image/analyze` - Analyze product image
- `POST /api/market/study` - Generate PESTEL market study

### International Trade (NEW)
- `POST /api/chat/message` - Chat conversacional
- `GET /api/chat/sessions` - Listar sesiones de chat
- `GET /api/chat/session/{id}` - Obtener sesión específica
- `DELETE /api/chat/session/{id}` - Eliminar sesión
- `POST /api/trade/country-info` - Info comercial entre países
- `GET /api/countries/list` - Listar todos los países
- `GET /api/country/{code}` - Detalles de un país
- `GET /api/trade-agreements/list` - Listar tratados comerciales

### Team Management
- `GET /api/team/members` - List team members
- `POST /api/team/invite` - Invite new member
- `DELETE /api/team/members/{id}` - Remove member
- `GET /api/team/stats` - Organization statistics

### Documents
- `GET /api/documents/list` - Listar documentos descargables
- `GET /api/documents/download/{id}` - Descargar documento

---

## Key Files
- `/app/backend/server.py` - Backend principal
- `/app/backend/customs_database.py` - Base de datos de 65 países
- `/app/frontend/src/pages/DashboardPage.jsx` - Dashboard principal
- `/app/frontend/src/pages/InternationalChatPage.jsx` - Chat conversacional
- `/app/frontend/src/pages/LandingPage.jsx` - Landing page profesional
- `/app/frontend/src/components/WorldTradeMap.jsx` - Mapa mundial interactivo (NEW)
- `/app/frontend/src/components/ImageClassifier.jsx` - Clasificación por imagen
- `/app/frontend/src/components/MarketStudyPanel.jsx` - Estudios de mercado

---

## Documentos Generados
- `/app/TaricAI_PitchDeck_Inversores.pdf` - Presentación para inversores
- `/app/TaricAI_PitchDeck_Inversores.docx` - Presentación Word
- `/app/TaricAI_Plan_Financiero_Profesional.md` - Plan financiero 5 años
- `/app/TaricAI_Analisis_Costos_Operativos.md` - Análisis de costos

---

## Países Soportados (65)

### Europa - UE (24)
ES (España), DE (Alemania), FR (Francia), IT (Italia), PT (Portugal), NL (Países Bajos), BE (Bélgica), PL (Polonia), SE (Suecia), AT (Austria), GR (Grecia), CZ (República Checa), RO (Rumania), HU (Hungría), IE (Irlanda), DK (Dinamarca), FI (Finlandia)

### Europa - No UE (5)
GB (Reino Unido), CH (Suiza), NO (Noruega), RU (Rusia), UA (Ucrania), TR (Turquía)

### América del Norte (3)
US (Estados Unidos), CA (Canadá), MX (México)

### Latinoamérica (12)
CO (Colombia), BR (Brasil), AR (Argentina), CL (Chile), PE (Perú), EC (Ecuador), UY (Uruguay), PY (Paraguay), BO (Bolivia), VE (Venezuela), PA (Panamá), CR (Costa Rica), GT (Guatemala), DO (República Dominicana), JM (Jamaica)

### Asia (15)
CN (China), JP (Japón), KR (Corea del Sur), TW (Taiwán), HK (Hong Kong), SG (Singapur), TH (Tailandia), VN (Vietnam), ID (Indonesia), MY (Malasia), PH (Filipinas), IN (India)

### Medio Oriente (4)
AE (Emiratos Árabes), SA (Arabia Saudita), IL (Israel), QA (Catar)

### África (6)
ZA (Sudáfrica), NG (Nigeria), EG (Egipto), MA (Marruecos), KE (Kenia), GH (Ghana)

### Oceanía (2)
AU (Australia), NZ (Nueva Zelanda)

---

## Próximas Tareas (Backlog)

### P0 - Alta Prioridad
1. **Notificaciones por email para cambios en aranceles** - Aprobado
   - Usar SendGrid o Resend
   - Trigger inmediato tras detección
   - Seguimiento de productos clasificados

### P1 - Media Prioridad
2. Dashboard con gráficos de uso mensual
3. Clasificación de productos por lotes (batch)
4. Exportar resultados a Excel

### P2 - Baja Prioridad
5. Integración con sistemas ERP
6. App móvil

---

## Known Issues
1. ~~Token inválido en clasificación por imagen~~ - RESUELTO (pasar token via props)
2. Verificar que el usuario cierre sesión y vuelva a entrar para limpiar tokens antiguos

---

## Costos Operativos Estimados
- **MVP/Lanzamiento**: $85-150/mes
- **Crecimiento (500 usuarios)**: $250-400/mes
- **Escala (2,000+ usuarios)**: $600-1,200/mes
- **Break-even**: 3-5 clientes pagando €49/mes
