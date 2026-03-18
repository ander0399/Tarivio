# TARIC AI - Product Requirements Document

## Descripción Original del Proyecto
Aplicación SaaS donde se pueda leer el TARIC y con inteligencia artificial se pueda colocar simplemente una palabra del TARIC de mi producto y se pueda sacar la nomenclatura arancelaria con sitios oficiales del TARIC español o de la Unión Europea. Portal que muestra aranceles, tributos y documentos fitosanitarios y no fitosanitarios necesarios para importar productos.

---

## Estado Actual: v2.5.0 - Funcionalidades Avanzadas

### ✅ Funcionalidades Implementadas

#### 1. Core - Clasificación TARIC con IA (MVP)
- [x] Búsqueda de productos con descripción en lenguaje natural
- [x] Clasificación automática con código TARIC de 10 dígitos
- [x] Análisis con GPT-5.2 via emergentintegrations
- [x] Nivel de confianza de la IA

#### 2. Origen y Destino OBLIGATORIOS
- [x] Selector de país de origen obligatorio
- [x] Selector de país de destino obligatorio
- [x] Lista completa de TODOS los países del mundo (200+)
- [x] Países organizados por región (UE, Europa, Norteamérica, Sudamérica, Asia, África, Oceanía)
- [x] Banderas de países en los selectores
- [x] Validación en frontend y backend

#### 3. Tratados Comerciales
- [x] Base de datos de tratados comerciales UE con terceros países (25+)
- [x] Detección automática de acuerdos aplicables
- [x] Panel de tratados comerciales en resultados
- [x] Tasas preferenciales según tratado vigente
- [x] Documentos requeridos para preferencia

#### 4. Sistema de Internacionalización COMPLETO (i18n) 🆕
- [x] Selector de idioma en header
- [x] **5 idiomas soportados**: Español, English, Português, Français, Deutsch
- [x] Traducciones completas para TODA la plataforma:
  - Stats cards
  - Tabs de navegación
  - Formularios y labels
  - Botones
  - Mensajes de error
  - Componentes de resultados
  - Panel de tratados
  - Gestión de equipo
  - Clasificador de imagen
  - Estudio de mercado
- [x] Persistencia de preferencia en localStorage
- [x] Detección automática del idioma del navegador

#### 5. Clasificación por IMAGEN 🆕
- [x] Componente ImageClassifier con drag & drop
- [x] Subida de imagen (JPG, PNG, WebP)
- [x] Análisis con GPT-5.2 Vision
- [x] Identificación automática del producto
- [x] Detección de componentes y materiales
- [x] Sugerencia de categoría TARIC
- [x] Botón "Usar para clasificar" que rellena el formulario

#### 6. Estudio de Mercado con PESTEL 🆕
- [x] Panel MarketStudyPanel integrado en resultados
- [x] Análisis PESTEL completo:
  - **P**olítico: Factores políticos entre países
  - **E**conómico: Aranceles, demanda, poder adquisitivo
  - **S**ocial: Tendencias de consumo
  - **T**ecnológico: Evolución del sector
  - **E**nvironmental (Ambiental): Regulaciones, sostenibilidad
  - **L**egal: Marco normativo, certificaciones
- [x] Tamaño del mercado estimado
- [x] Análisis de competencia
- [x] Tendencias del mercado
- [x] Oportunidades identificadas
- [x] Amenazas y riesgos
- [x] Recomendaciones estratégicas
- [x] **Descarga PDF profesional** con jsPDF

#### 7. Aranceles y Tributos
- [x] Desglose completo de aranceles (NMF, preferenciales)
- [x] IVA de importación
- [x] Derechos anti-dumping
- [x] Base legal de cada tributo

#### 8. Documentación Requerida
- [x] Lista de documentos obligatorios y opcionales
- [x] Tipos: Fitosanitario, Sanitario, Aduanero, CITES
- [x] Autoridad emisora y tiempo de tramitación
- [x] Enlaces a portales de tramitación online

#### 9. Suite B2B
- [x] Autenticación JWT
- [x] Organizaciones
- [x] Gestión de equipos (Admin, Operador, Consultor)
- [x] Historial de clasificaciones
- [x] Estadísticas de uso

#### 10. UI/UX
- [x] Diseño futurista oscuro (cyberpunk)
- [x] Responsive design
- [x] Animaciones con Framer Motion
- [x] Componentes Shadcn/UI

---

## Stack Tecnológico

### Backend
- **Framework**: FastAPI
- **Base de datos**: MongoDB
- **Autenticación**: JWT
- **IA**: OpenAI GPT-5.2 via emergentintegrations (texto + visión)

### Frontend
- **Framework**: React 18
- **Estilos**: Tailwind CSS
- **Componentes**: Shadcn/UI
- **Animaciones**: Framer Motion
- **PDF**: jsPDF

---

## Endpoints API Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Login (retorna JWT) |
| POST | /api/taric/search | Búsqueda TARIC con IA |
| POST | /api/image/analyze | Análisis de imagen con visión 🆕 |
| POST | /api/market/study | Estudio de mercado con PESTEL 🆕 |
| GET | /api/taric/history | Historial del usuario |

---

## Estructura de Archivos Principal

```
/app/
├── backend/
│   ├── server.py                    # FastAPI + endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageClassifier.jsx      # 🆕 Clasificación por imagen
│   │   │   ├── MarketStudyPanel.jsx     # 🆕 Estudio de mercado
│   │   │   ├── LanguageSelector.jsx     # Selector de idioma
│   │   │   ├── TradeAgreementsPanel.jsx
│   │   │   ├── DocumentChecklist.jsx
│   │   │   └── ...
│   │   ├── config/
│   │   │   ├── countries.js             # Lista de países
│   │   │   ├── tradeAgreements.js       # Tratados comerciales
│   │   │   └── i18n.js                  # Traducciones (5 idiomas)
│   │   ├── contexts/
│   │   │   └── LanguageContext.jsx
│   │   └── pages/
│   │       └── DashboardPage.jsx
│   └── package.json
└── memory/
    └── PRD.md
```

---

## Tareas Pendientes

### P1 - Alta Prioridad
- [ ] Mejorar búsqueda en dropdown de países (filtro por texto)
- [ ] Cache de resultados de estudios de mercado
- [ ] Exportar historial en CSV

### P2 - Media Prioridad
- [ ] Notificaciones email para alertas regulatorias
- [ ] Dashboard con gráficos de uso mensual
- [ ] Comparación de rutas comerciales

### P3 - Backlog
- [ ] Integración con sistemas ERP
- [ ] API pública para terceros
- [ ] App móvil nativa

---

## Testing

- **Backend**: 27/27 tests passed (100%)
- **Frontend**: Todas las funcionalidades verificadas
- **Test files**: `/app/backend/tests/`

---

## Credenciales de Prueba
- **Email**: newuser2025@test.com
- **Password**: Test123!

---

## Última Actualización
**Fecha**: 2025-12-18
**Versión**: 2.5.0

**Cambios v2.5.0**:
- Clasificación por imagen con GPT-5.2 Vision
- Estudio de mercado con análisis PESTEL completo
- Descarga de estudio en PDF profesional
- Sistema i18n completo (5 idiomas)
- Traducciones completas para toda la plataforma
