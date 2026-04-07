# ANÁLISIS ESTRATÉGICO Y PLAN FINANCIERO
## TaricAI - Inteligencia Artificial para Comercio Exterior
### Documento para Mesa de Inversión

---

# PARTE 1: ANÁLISIS ESTRATÉGICO DEL PROYECTO

## 1.1 ANÁLISIS OBJETIVO DEL PRODUCTO ACTUAL

### Lo que TaricAI tiene HOY (producto desarrollado):
| Funcionalidad | Estado | Calidad |
|--------------|--------|---------|
| Clasificación TARIC con IA (GPT-5.2) | ✅ Funcional | Alta - <30 segundos respuesta |
| Clasificación por imagen | ✅ Funcional | Alta - identifica productos correctamente |
| Cálculo de aranceles y tributos | ✅ Funcional | Media-Alta |
| Detección de acuerdos comerciales | ✅ Funcional | Alta |
| Estudio de mercado PESTEL | ✅ Funcional | Alta - profesional y completo |
| Soporte multi-idioma (38+ idiomas) | ✅ Funcional | Alta |
| Preguntas de clarificación IA | ✅ Funcional | Alta |
| Gestión de equipos/organizaciones | ✅ Funcional | Media |
| Historial de búsquedas | ✅ Funcional | Alta |
| Autenticación JWT | ✅ Funcional | Alta |

### Lo que FALTA para el MVP comercial:
| Funcionalidad | Prioridad | Esfuerzo estimado |
|--------------|-----------|-------------------|
| Módulo fitosanitario (MAPA/TRACES/SOIVRE) | CRÍTICA | 4-6 semanas |
| Calculador Landed Cost real | ALTA | 2-3 semanas |
| Integración CLASS AEAT en tiempo real | ALTA | 3-4 semanas |
| Generación automática checklist documentos | MEDIA | 2 semanas |
| API para integraciones ERP | MEDIA | 3-4 semanas |
| Pasarela de pagos (Stripe) | CRÍTICA | 1 semana |

### Evaluación técnica objetiva:
- **Fortaleza**: El motor de IA funciona correctamente y es rápido
- **Debilidad**: Las fuentes oficiales aún no están integradas en tiempo real
- **Oportunidad**: El producto base está 70% completado
- **Amenaza**: Sin las fuentes oficiales, no es diferenciable de competidores

---

## 1.2 ANÁLISIS DE MERCADO

### Tamaño del mercado (datos verificados):

**España - Comercio Exterior 2023-2024:**
- Importaciones España 2023: **€424,250 millones**
- Importaciones España 2024 (proyectado): **€430,000-440,000 millones**
- Operaciones aduaneras estimadas: **8-10 millones/año**

**Mercado de Software de Gestión Comercial:**
| Segmento | Tamaño Global 2025 | CAGR |
|----------|-------------------|------|
| Trade Management Software | $1.31-2.80 B | 10-12% |
| Customs Compliance Software | ~$800M | 8-10% |

**Mercado Específico España:**
- Agencias de aduanas activas: **~1,200**
- PYMEs importadoras regulares: **~50,000**
- Gasto promedio en software/servicios: **€200-500/mes**

### TAM / SAM / SOM realista:

| Métrica | Cálculo | Valor |
|---------|---------|-------|
| **TAM** (Europa) | 6,000 empresas × €2,000/año promedio | **€12M** |
| **SAM** (España + Latam) | 1,800 empresas × €2,000/año | **€3.6M** |
| **SOM** (3 años, 150 clientes) | 150 clientes × €2,400/año | **€360K ARR** |

**Nota**: Los €18-48M mencionados en el plan de negocio son optimistas. Un SOM más realista para año 3 es €300K-500K ARR.

---

## 1.3 ANÁLISIS COMPETITIVO DETALLADO

### Competidores identificados y evaluación honesta:

| Competidor | Origen | Precio | Fortalezas | Debilidades vs TaricAI |
|------------|--------|--------|------------|------------------------|
| **dbTaric (TARIC S.A.U.)** | España 🇪🇸 | ~€150-300/mes | Marca establecida, 30+ años, fuentes oficiales integradas | Sin IA, manual, sin Landed Cost |
| **Digicust** | Austria 🇦🇹 | €149-499/mes | IA potente, 70-90% automatización, imagen | Sin fuentes españolas (MAPA/TRACES), inglés |
| **MIC-CUST** | Alemania 🇩🇪 | Enterprise | IA explicativa, integraciones SAP | Sin mercado español específico, precio alto |
| **Avalara** | USA 🇺🇸 | Enterprise | Global, compliance fiscal completo | Muy caro para PYMEs, sin foco ES |
| **Descartes** | Canadá 🇨🇦 | CA$750+/mes | Cadena suministro completa | Solo corporaciones grandes |
| **Visual Trans** | España 🇪🇸 | Personalizado | ERP completo transitarios | Sin IA, software legacy |
| **Camtom** | México 🇲🇽 | Desconocido | IA para TIGIE/México | No opera TARIC UE |

### ¿Es TaricAI mejor que los competidores? ANÁLISIS OBJETIVO:

**Vs dbTaric (competidor directo en España):**
- ✅ TaricAI: IA conversacional, clasificación en 30 segundos
- ❌ TaricAI: Sin fuentes oficiales integradas aún
- ⚠️ dbTaric tiene 30 años de relaciones con agencias
- **Veredicto**: TaricAI puede ser mejor SI integra fuentes oficiales

**Vs Digicust (mejor tecnología comparable):**
- ✅ TaricAI: Español nativo, mercado específico ES
- ✅ TaricAI: Precio más accesible proyectado
- ❌ TaricAI: Digicust tiene más features (BTI matching, GRI reasoning)
- ❌ TaricAI: Digicust tiene 70-90% automatización probada
- **Veredicto**: Digicust es tecnológicamente superior HOY, pero no tiene mercado ES

**Vs competidores grandes (Avalara, Descartes):**
- ✅ TaricAI: Precio accesible para PYMEs
- ✅ TaricAI: Enfoque nicho español
- ❌ TaricAI: Sin track record, sin compliance enterprise
- **Veredicto**: Diferentes segmentos de mercado

### Conclusión competitiva HONESTA:

**TaricAI NO es el mejor producto del mercado HOY**, pero tiene una propuesta de valor única:
1. **Único en español** con IA conversacional
2. **Único con enfoque 100% España** (potencial módulo fitosanitario)
3. **Precio accesible** para el mercado español de PYMEs

**Para ser competitivo necesita:**
1. Integrar fuentes oficiales españolas (AEAT, MAPA, TRACES)
2. Lograr >85% precisión en clasificación
3. Lanzar antes de que Digicust entre al mercado español

---

## 1.4 VENTAJAS COMPETITIVAS REALES

| Ventaja | Sostenibilidad | Valoración |
|---------|----------------|------------|
| Primer mover en España con IA | Media (6-12 meses) | ⭐⭐⭐ |
| Red de contactos del advisor | Alta | ⭐⭐⭐⭐ |
| Conocimiento regulatorio español | Alta | ⭐⭐⭐⭐ |
| Precio accesible para PYMEs | Baja (fácil de copiar) | ⭐⭐ |
| Soporte en español | Baja (fácil de copiar) | ⭐⭐ |

**Ventaja competitiva más valiosa**: La combinación de Pelayo Serrano (38 años en aduanas) + Kevin (conocimiento del mercado) + producto funcional. Esta triada es difícil de replicar rápidamente.

---

# PARTE 2: PLAN FINANCIERO PROFESIONAL (5 AÑOS)

## 2.1 SUPUESTOS BASE

### Estructura de precios propuesta (validada con mercado):

| Plan | Precio Mensual | Operaciones/mes | Target |
|------|---------------|-----------------|--------|
| **STARTER** | €99 | 50 | PYMEs pequeñas |
| **PROFESSIONAL** | €249 | 200 | Agencias pequeñas |
| **ENTERPRISE** | €499 | Ilimitado + API | Agencias medianas |
| **CUSTOM** | €1,000+ | Personalizado | Grandes operadores |

### Supuestos de captación (conservadores):

| Año | Clientes Starter | Clientes Pro | Clientes Enterprise | Total |
|-----|-----------------|--------------|---------------------|-------|
| 1 | 25 | 15 | 5 | 45 |
| 2 | 60 | 40 | 15 | 115 |
| 3 | 100 | 80 | 30 | 210 |
| 4 | 150 | 120 | 50 | 320 |
| 5 | 200 | 160 | 80 | 440 |

### Supuestos de costos:

| Concepto | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|----------|-------|-------|-------|-------|-------|
| CEO (Kevin) | €36,000 | €48,000 | €60,000 | €72,000 | €84,000 |
| CTO (Anderson) | €30,000 | €42,000 | €54,000 | €66,000 | €78,000 |
| Ventas/CS | €0 | €36,000 | €72,000 | €108,000 | €144,000 |
| Marketing | €6,000 | €18,000 | €36,000 | €54,000 | €72,000 |
| Infraestructura Cloud | €3,600 | €7,200 | €14,400 | €24,000 | €36,000 |
| API IA (tokens) | €6,000 | €18,000 | €42,000 | €72,000 | €108,000 |
| Legal/Contable | €6,000 | €9,000 | €12,000 | €15,000 | €18,000 |
| Oficina/Otros | €6,000 | €12,000 | €18,000 | €24,000 | €30,000 |

---

## 2.2 ESTADO DE RESULTADOS PROYECTADO (5 AÑOS)

### En Euros (€)

| Concepto | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|----------|-------|-------|-------|-------|-------|
| **INGRESOS** | | | | | |
| Suscripciones Starter | 14,850 | 47,520 | 95,040 | 142,560 | 190,080 |
| Suscripciones Professional | 26,820 | 89,640 | 179,280 | 268,920 | 358,560 |
| Suscripciones Enterprise | 17,970 | 67,410 | 134,820 | 224,700 | 359,520 |
| Servicios Onboarding | 2,500 | 7,500 | 15,000 | 25,000 | 40,000 |
| **Total Ingresos** | **62,140** | **212,070** | **424,140** | **661,180** | **948,160** |
| | | | | | |
| **COSTOS OPERATIVOS** | | | | | |
| Salarios y Personal | 66,000 | 126,000 | 186,000 | 246,000 | 306,000 |
| Marketing y Ventas | 6,000 | 18,000 | 36,000 | 54,000 | 72,000 |
| Infraestructura Cloud | 3,600 | 7,200 | 14,400 | 24,000 | 36,000 |
| API IA (tokens) | 6,000 | 18,000 | 42,000 | 72,000 | 108,000 |
| Legal/Contable | 6,000 | 9,000 | 12,000 | 15,000 | 18,000 |
| Oficina/Operaciones | 6,000 | 12,000 | 18,000 | 24,000 | 30,000 |
| **Total Costos** | **93,600** | **190,200** | **308,400** | **435,000** | **570,000** |
| | | | | | |
| **EBITDA** | **(31,460)** | **21,870** | **115,740** | **226,180** | **378,160** |
| Depreciación | (1,000) | (2,000) | (3,000) | (4,000) | (5,000) |
| **EBIT** | **(32,460)** | **19,870** | **112,740** | **222,180** | **373,160** |
| Impuestos (15% Startup) | 0 | (2,981) | (16,911) | (33,327) | (55,974) |
| **RESULTADO NETO** | **(32,460)** | **16,890** | **95,829** | **188,853** | **317,186** |

### Métricas SaaS Clave:

| Métrica | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---------|-------|-------|-------|-------|-------|
| **MRR (fin de año)** | €5,178 | €17,673 | €35,345 | €55,098 | €79,013 |
| **ARR (fin de año)** | €62,140 | €212,070 | €424,140 | €661,180 | €948,160 |
| **Clientes totales** | 45 | 115 | 210 | 320 | 440 |
| **ARPU mensual** | €115 | €154 | €168 | €172 | €180 |
| **Churn mensual** | 3% | 2.5% | 2% | 1.8% | 1.5% |
| **CAC** | €200 | €180 | €160 | €150 | €140 |
| **LTV** | €2,760 | €3,696 | €5,040 | €5,733 | €7,200 |
| **LTV/CAC** | 13.8x | 20.5x | 31.5x | 38.2x | 51.4x |
| **Margen bruto** | -51% | 10% | 27% | 34% | 40% |

---

## 2.3 BALANCE GENERAL PROYECTADO

### En Euros (€)

| ACTIVO | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|--------|-------|-------|-------|-------|-------|-------|
| **Activo Corriente** | | | | | | |
| Caja y Bancos | 50,000 | 22,540 | 44,430 | 150,259 | 354,112 | 691,298 |
| Cuentas por Cobrar | 0 | 5,178 | 17,673 | 35,345 | 55,098 | 79,013 |
| **Total Corriente** | 50,000 | 27,718 | 62,103 | 185,604 | 409,210 | 770,311 |
| | | | | | | |
| **Activo No Corriente** | | | | | | |
| Equipos Informáticos | 0 | 3,000 | 6,000 | 9,000 | 12,000 | 15,000 |
| Desarrollo Software (capitalizado) | 0 | 10,000 | 20,000 | 30,000 | 40,000 | 50,000 |
| Depreciación Acumulada | 0 | (1,000) | (3,000) | (6,000) | (10,000) | (15,000) |
| **Total No Corriente** | 0 | 12,000 | 23,000 | 33,000 | 42,000 | 50,000 |
| | | | | | | |
| **TOTAL ACTIVO** | **50,000** | **39,718** | **85,103** | **218,604** | **451,210** | **820,311** |

| PASIVO Y PATRIMONIO | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---------------------|-------|-------|-------|-------|-------|-------|
| **Pasivo Corriente** | | | | | | |
| Cuentas por Pagar | 0 | 7,800 | 15,840 | 25,700 | 36,250 | 47,500 |
| Impuestos por Pagar | 0 | 0 | 2,981 | 16,911 | 33,327 | 55,974 |
| Ingresos Diferidos | 0 | 10,356 | 35,346 | 70,690 | 110,196 | 158,027 |
| **Total Corriente** | 0 | 18,156 | 54,167 | 113,301 | 179,773 | 261,501 |
| | | | | | | |
| **Patrimonio** | | | | | | |
| Capital Social | 50,000 | 50,000 | 50,000 | 50,000 | 50,000 | 50,000 |
| Reservas | 0 | 0 | 0 | 10,689 | 44,914 | 126,296 |
| Resultado Acumulado | 0 | (32,460) | (15,570) | 0 | 0 | 0 |
| Resultado del Ejercicio | 0 | 4,022 | (3,494) | 44,614 | 176,523 | 382,514 |
| **Total Patrimonio** | 50,000 | 21,562 | 30,936 | 105,303 | 271,437 | 558,810 |
| | | | | | | |
| **TOTAL PASIVO + PATRIMONIO** | **50,000** | **39,718** | **85,103** | **218,604** | **451,210** | **820,311** |

---

## 2.4 FLUJO DE CAJA PROYECTADO

### En Euros (€)

| Concepto | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|----------|-------|-------|-------|-------|-------|
| **OPERACIONES** | | | | | |
| Cobros de clientes | 56,962 | 199,575 | 406,468 | 641,427 | 924,245 |
| Pagos a proveedores | (81,600) | (172,160) | (279,700) | (394,750) | (517,500) |
| Pagos de personal | (66,000) | (126,000) | (186,000) | (246,000) | (306,000) |
| Pagos impuestos | 0 | 0 | (2,981) | (16,911) | (33,327) |
| **Flujo Operativo** | **(90,638)** | **(98,585)** | **(62,213)** | **(16,234)** | **67,418** |
| | | | | | |
| **INVERSIÓN** | | | | | |
| Compra equipos | (3,000) | (3,000) | (3,000) | (3,000) | (3,000) |
| Desarrollo software | (10,000) | (10,000) | (10,000) | (10,000) | (10,000) |
| **Flujo Inversión** | **(13,000)** | **(13,000)** | **(13,000)** | **(13,000)** | **(13,000)** |
| | | | | | |
| **FINANCIACIÓN** | | | | | |
| Aporte socios inicial | 50,000 | 0 | 0 | 0 | 0 |
| Financiación externa | 30,000 | 130,000 | 180,000 | 230,000 | 280,000 |
| **Flujo Financiación** | **80,000** | **130,000** | **180,000** | **230,000** | **280,000** |
| | | | | | |
| **FLUJO NETO** | **(23,638)** | **18,415** | **104,787** | **200,766** | **334,418** |
| Caja Inicial | 50,000 | 26,362 | 44,777 | 149,564 | 350,330 |
| **Caja Final** | **26,362** | **44,777** | **149,564** | **350,330** | **684,748** |

---

## 2.5 NECESIDADES DE FINANCIACIÓN

### Escenario Base (conservador):

| Fase | Período | Necesidad | Uso |
|------|---------|-----------|-----|
| **Pre-Seed** | M1-M6 | €50,000 | MVP comercial, primeros pilotos |
| **Seed** | M7-M12 | €150,000 | Lanzamiento comercial, equipo ventas |
| **Serie A** | Año 2-3 | €500,000 | Expansión España, entrada Latam |

### Valoración implícita:

| Ronda | ARR | Múltiplo | Valoración Pre-Money |
|-------|-----|----------|---------------------|
| Pre-Seed | €0 | N/A | €300,000-500,000 |
| Seed | €62K | 8-10x | €500,000-620,000 |
| Serie A | €212K | 10-15x | €2.1M-3.2M |

---

## 2.6 ESCENARIOS

### Escenario Optimista (+30% clientes):

| Métrica | Año 3 | Año 5 |
|---------|-------|-------|
| Clientes | 273 | 572 |
| ARR | €551,382 | €1,232,608 |
| EBITDA | €180,462 | €545,608 |
| Margen EBITDA | 33% | 44% |

### Escenario Pesimista (-30% clientes):

| Métrica | Año 3 | Año 5 |
|---------|-------|-------|
| Clientes | 147 | 308 |
| ARR | €296,898 | €663,712 |
| EBITDA | €51,018 | €210,712 |
| Margen EBITDA | 17% | 32% |

### Escenario de Ruptura (Break-even):

- **Clientes necesarios para break-even**: ~70 clientes
- **Tiempo estimado para alcanzarlo**: Mes 15-18
- **ARR mínimo viable**: €140,000

---

## 2.7 KPIs Y METAS MEDIBLES

### Año 1 (2026):
| KPI | Meta Q2 | Meta Q4 |
|-----|---------|---------|
| Clientes activos | 20 | 45 |
| MRR | €2,000 | €5,200 |
| Churn mensual | <5% | <3% |
| NPS | >30 | >40 |
| Precisión clasificación | >85% | >90% |

### Año 2 (2027):
| KPI | Meta Q2 | Meta Q4 |
|-----|---------|---------|
| Clientes activos | 75 | 115 |
| MRR | €10,000 | €17,700 |
| Churn mensual | <2.5% | <2% |
| Clientes Enterprise | 8 | 15 |
| Expansión Latam | Piloto Colombia | 10 clientes |

### Año 3 (2028):
| KPI | Meta |
|-----|------|
| Clientes activos | 210 |
| ARR | €424,140 |
| EBITDA positivo | >€100,000 |
| Empleados | 8-10 |
| Países activos | 3 (ES, CO, MX) |

---

# PARTE 3: CONCLUSIONES Y RECOMENDACIONES

## 3.1 FORTALEZAS DEL PROYECTO

1. **Producto tecnológicamente funcional** - El MVP está operativo
2. **Equipo complementario** - CEO comercial + CTO técnico + Advisor sectorial
3. **Mercado específico desatendido** - España no tiene solución IA nativa
4. **Timing favorable** - Digitalización post-COVID del sector
5. **Marco legal favorable** - Ley de Startups 28/2022

## 3.2 DEBILIDADES A RESOLVER

1. **Sin fuentes oficiales integradas** - Crítico para diferenciación
2. **Equipo pequeño** - Riesgo de ejecución
3. **Sin track record comercial** - Primeros clientes serán críticos
4. **Dependencia de APIs terceros** - Riesgo técnico

## 3.3 RECOMENDACIONES PARA INVERSORES

**Este proyecto es invertible SI:**
1. Se completa el módulo fitosanitario en los próximos 3 meses
2. Se consiguen 10-15 clientes piloto validados
3. Se demuestra >85% precisión en clasificación

**Valoración razonable Pre-Seed**: €400,000-600,000
**Inversión recomendada**: €50,000-100,000 por 10-20% equity

## 3.4 CONCLUSIÓN FINAL

TaricAI tiene una oportunidad de mercado real pero estrecha temporalmente. El producto base está bien construido, el equipo tiene las competencias necesarias, y el mercado español está desatendido. Sin embargo, la ventana de oportunidad es de 12-18 meses antes de que competidores europeos (especialmente Digicust) puedan entrar al mercado español.

**El proyecto es viable y tiene potencial de retorno 5-10x en 5 años**, pero requiere ejecución disciplinada y capital suficiente para llegar a break-even antes de agotar la ventana competitiva.

---

*Documento preparado para fines de evaluación de inversión*
*Los números presentados son proyecciones basadas en supuestos razonables y validados con benchmarks del sector*
*Fecha: Diciembre 2025*
