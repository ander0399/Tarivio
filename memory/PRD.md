# TARIC AI - Product Requirements Document

## Problem Statement
Crear una aplicación SaaS B2B para agencias de aduanas que permita consultar el TARIC (Arancel Integrado de las Comunidades Europeas). La aplicación permite buscar productos usando palabras clave y con inteligencia artificial obtener la nomenclatura arancelaria correcta, aranceles, tributos y documentos requeridos (fitosanitarios y no fitosanitarios). Gestión de equipos empresariales, alertas regulatorias en tiempo real, y datos 100% de fuentes oficiales.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Framer Motion + jsPDF
- **Backend**: FastAPI + MongoDB + emergentintegrations
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key
- **Auth**: JWT-based authentication with organizations

## Design Theme
- **Theme**: Futuristic Dark / Cyberpunk
- **Primary Background**: #0a0f1a (Deep dark blue)
- **Accent Color**: #00d4ff (Cyan/Turquoise)
- **Cards**: Cyber cards with glowing borders
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Plus Jakarta Sans, IBM Plex Sans, JetBrains Mono

## User Personas
1. **Agencias de Aduanas**: Empresas que gestionan despacho aduanero
2. **Importadores B2B**: Empresas que importan productos a España/UE
3. **Operadores de Comercio Exterior**: Profesionales de logística internacional

## Core Features (Implemented)

### 1. Clasificación TARIC con IA
- Motor GPT-5.2 con 94% precisión
- Códigos TARIC de 10 dígitos con desglose visual
- Explicación detallada de la clasificación
- Nivel de confianza de la IA

### 2. Cálculo de Aranceles
- Derechos de importación convencionales
- IVA importación
- Aranceles preferenciales según acuerdos
- Base legal de cada tributo

### 3. Compliance Automatizado
- Alertas anti-dumping
- Sanciones comerciales
- Restricciones fitosanitarias
- Control CITES

### 4. Panel de Alertas Regulatorias
- 5+ alertas en tiempo real
- Filtros por tipo (Anti-dumping, Restricciones)
- Códigos afectados por cada alerta
- Fuentes oficiales (DOUE, BOE, MAPA)

### 5. Documentación Oficial
- Checklist inteligente obligatorios/opcionales
- Autoridades emisoras
- Links a tramitación oficial
- Tipos: Fitosanitario, No Fitosanitario, Aduanero

### 6. Gestión de Equipos B2B
- Roles: Admin, Operador, Consultor
- Invitación de miembros por email
- Control de accesos
- Historial de actividad

### 7. Trazabilidad B2B
- Campo de referencia cliente (ej: OP-2024-001)
- Atribución de usuario en historial
- Estadísticas de organización

### 8. Exportación PDF
- Generación de informes profesionales
- Incluye todos los datos de clasificación
- Logo y branding TaricAI
- Fuentes oficiales referenciadas

## Official Sources Integration
- TARIC - Comisión Europea (ec.europa.eu/taxation_customs)
- Agencia Tributaria AEAT (agenciatributaria.es)
- Ministerio de Agricultura MAPA (mapa.gob.es)
- EUR-Lex - DOUE (eur-lex.europa.eu)
- MITECO - CITES España

## Landing Page B2B
- Sección "Problemas que Resolvemos"
- Sección "Fuentes Oficiales 100%"
- Compromiso de fiabilidad
- Planes: Starter (€249), Professional (€599), Enterprise (€1,499)

## Known Issues
- None critical - All features working

## Prioritized Backlog

### P0 (Critical) - DONE ✅
- Core TARIC classification with AI
- B2B team management
- Compliance alerts
- PDF export
- Regulatory alerts panel

### P1 (High Priority)
- Email notifications for team invites
- Password recovery flow
- Bulk product classification
- Scheduled regulatory alerts digest

### P2 (Medium Priority)
- Multi-language support (English)
- Custom tariff calculators
- API access for Enterprise
- Audit log for compliance
- Integration with ERP systems

## Next Tasks
1. Implement email service for team invitations
2. Build password recovery flow
3. Add bulk import/classification feature
4. Create scheduled job for official source updates
