# TaricAI - Product Requirements Document

## Original Problem Statement
Crear una aplicación SaaS donde se pueda leer el TARIC y con inteligencia artificial se pueda colocar simplemente una palabra del TARIC de mi producto y se pueda sacar la nomenclatura arancelaria con sitios oficiales del TARIC español o de la Unión Europea. Adicional a eso, créale el portal donde le bote de una vez los aranceles, todos los tributos y los documentos que necesita para poder traer ese producto, todo en un solo lugar y sacado de sitios oficiales de España y de la unión europea.

## Target Users
- Agencias de aduanas
- Importadores/Exportadores
- Empresas B2B de comercio internacional

## Core Requirements
1. ✅ Clasificación TARIC con IA (GPT-5.2)
2. ✅ Aranceles y tributos automáticos
3. ✅ Documentos requeridos para importación
4. ✅ Fuentes oficiales (UE, AEAT, MAPA)
5. ✅ País de origen y destino obligatorios
6. ✅ Detección de acuerdos comerciales

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

### Phase 3: Advanced AI Features ✅ COMPLETED (Dec 2025)
- **Image Classification**: Upload product photo → AI describes → Classify
- **Market Study with PESTEL**: Generate professional market reports, downloadable as PDF
- **AI Clarification Questions**: If description is vague, AI asks clarifying questions BEFORE classification
- **Internationalization (i18n)**: 5 languages (ES, EN, PT, FR, DE)
- **Country Selector with Search**: Searchable dropdown for better UX

### Bug Fixes (Dec 18, 2025)
1. ✅ **Image classification errors** - Fixed base64 encoding handling, improved error messages
2. ✅ **Clarification questions timing** - Now appear BEFORE classification (new endpoint `/api/taric/check-clarification`)
3. ✅ **Market study timeout** - Increased to 2 minutes with proper abort handling

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### TARIC Classification
- `POST /api/taric/search` - Main classification (requires origin/destination)
- `POST /api/taric/check-clarification` - **NEW** Pre-check if description needs clarification
- `GET /api/taric/history` - Get search history
- `GET /api/taric/result/{id}` - Get specific result
- `DELETE /api/taric/history/{id}` - Delete from history

### Advanced Features
- `POST /api/image/analyze` - Analyze product image with GPT-5.2 vision
- `POST /api/market/study` - Generate PESTEL market study

### Team Management
- `GET /api/team/members` - List team members
- `POST /api/team/invite` - Invite new member
- `DELETE /api/team/members/{id}` - Remove member
- `GET /api/team/stats` - Organization statistics

### Other
- `GET /api/alerts/regulatory` - Regulatory alerts
- `GET /api/documents/library` - Official documents database

---

## Key Files
- `/app/backend/server.py` - All backend logic (models, routes, AI functions)
- `/app/frontend/src/pages/DashboardPage.jsx` - Main dashboard
- `/app/frontend/src/components/ImageClassifier.jsx` - Image upload/analysis
- `/app/frontend/src/components/MarketStudyPanel.jsx` - PESTEL reports
- `/app/frontend/src/components/ClarificationQuestions.jsx` - AI questions UI
- `/app/frontend/src/components/CountrySearchSelect.jsx` - Searchable country dropdown
- `/app/frontend/src/config/i18n.js` - Translations (5 languages)

---

## Testing
- Backend tests: `/app/backend/tests/test_bug_fixes_iteration8.py`
- Test reports: `/app/test_reports/iteration_8.json`
- Test credentials: `test@test.com` / `Test123!`

---

## Future Tasks (Backlog)

### P1 - High Priority
- Monthly usage dashboard with graphs
- Export search history to Excel/CSV
- Batch classification (multiple products)

### P2 - Medium Priority
- ERP system integration
- Automatic checklist generator for forms
- Email notifications for regulatory alerts

### P3 - Nice to Have
- Mobile app (React Native)
- AI chatbot for customs questions
- Integration with logistics providers

---

## Known Limitations
- Market study occasionally has JSON parsing errors (retries work)
- Image classification requires clear product photos
- Clarification questions are AI-generated (quality varies)

## Performance Notes
- Market study takes ~30-60 seconds to generate
- Image analysis takes ~5-10 seconds
- Use ?w=400 suffix for Unsplash images to reduce download size
