# TaricAI - Análisis de Costos Operativos
## Documento Actualizado: Diciembre 2025

---

## RESUMEN EJECUTIVO

| Escenario | Costo Mensual | Costo Anual |
|-----------|---------------|-------------|
| **MVP / Lanzamiento** | **$85 - $150** | **$1,020 - $1,800** |
| **Crecimiento (500 usuarios)** | **$250 - $400** | **$3,000 - $4,800** |
| **Escala (2,000+ usuarios)** | **$600 - $1,200** | **$7,200 - $14,400** |

---

## 1. COSTOS FIJOS MENSUALES

### 1.1 Infraestructura de Hosting

| Componente | Opción Económica | Opción Profesional | Notas |
|------------|------------------|-------------------|-------|
| **Frontend (React)** | Vercel Pro: $20/mes | Vercel Pro: $20/mes | Incluye 1TB bandwidth, 10M requests |
| **Backend (FastAPI)** | Railway Hobby: $5/mes | Railway Pro: $20/mes | Incluye créditos de uso |
| **Alternativa AWS** | EC2 t3.micro: $10/mes | EC2 t3.small: $20/mes | Más configuración manual |

**Subtotal Hosting: $25 - $40/mes**

---

### 1.2 Base de Datos (MongoDB Atlas)

| Tier | Especificaciones | Costo Mensual |
|------|------------------|---------------|
| **M0 (Gratis)** | 512 MB, shared | $0 (solo para desarrollo) |
| **M10 (Producción mínima)** | 2 GB RAM, 10-128 GB storage | **$57/mes** |
| **M20 (Recomendado)** | 4 GB RAM, 20-256 GB storage | **$147/mes** |

**Recomendación inicial: M10 = $57/mes**

---

### 1.3 Dominio y SSL

| Componente | Costo |
|------------|-------|
| **Dominio .com** | $15/año (~$1.25/mes) |
| **Dominio .io** (alternativa premium) | $50/año (~$4.17/mes) |
| **SSL Certificate** | $0 (Let's Encrypt gratuito) |

**Subtotal Dominio: ~$1.25/mes**

---

### 1.4 Email Transaccional (SendGrid)

| Plan | Volumen | Costo Mensual |
|------|---------|---------------|
| **Free** | 100/día (3,000/mes) | $0 |
| **Essentials 50K** | 50,000/mes | $19.95/mes |
| **Essentials 100K** | 100,000/mes | $34.95/mes |

**Recomendación inicial: Free → Essentials cuando escales = $0-20/mes**

---

## 2. COSTOS VARIABLES (USO DE IA)

### 2.1 OpenAI GPT-5.2 (via Emergent LLM Key)

**Este es tu costo variable más significativo.**

| Operación | Tokens Estimados | Costo por Operación |
|-----------|------------------|---------------------|
| **Clasificación por texto** | ~2,000 input + ~1,000 output | ~$0.017 |
| **Clasificación por imagen** | ~3,000 input + ~1,500 output | ~$0.026 |
| **Estudio de mercado** | ~2,500 input + ~3,000 output | ~$0.046 |
| **Preguntas de clarificación** | ~1,000 input + ~500 output | ~$0.009 |

#### Precios GPT-5.2 (Diciembre 2025):
- **Input**: $1.75 / millón de tokens
- **Output**: $14.00 / millón de tokens

#### Proyección de Costos por Volumen de Usuarios:

| Usuarios Activos | Consultas/mes | Costo IA Estimado |
|------------------|---------------|-------------------|
| 50 usuarios | 500 consultas | **$15 - $25/mes** |
| 200 usuarios | 2,000 consultas | **$50 - $80/mes** |
| 500 usuarios | 5,000 consultas | **$125 - $200/mes** |
| 1,000 usuarios | 10,000 consultas | **$250 - $400/mes** |
| 2,000 usuarios | 20,000 consultas | **$500 - $800/mes** |

---

## 3. RESUMEN TOTAL DE COSTOS

### 3.1 Escenario LANZAMIENTO (0-100 usuarios)

| Concepto | Costo Mensual |
|----------|---------------|
| Hosting (Vercel + Railway) | $25 |
| MongoDB Atlas M10 | $57 |
| Dominio .com | $1.25 |
| SSL | $0 |
| Email (SendGrid Free) | $0 |
| **IA (GPT-5.2)** | $15 - $50 |
| **TOTAL** | **$98 - $133/mes** |

---

### 3.2 Escenario CRECIMIENTO (100-500 usuarios)

| Concepto | Costo Mensual |
|----------|---------------|
| Hosting (Vercel + Railway Pro) | $40 |
| MongoDB Atlas M20 | $147 |
| Dominio | $1.25 |
| SSL | $0 |
| Email (SendGrid Essentials) | $20 |
| **IA (GPT-5.2)** | $80 - $200 |
| **TOTAL** | **$288 - $408/mes** |

---

### 3.3 Escenario ESCALA (500-2,000 usuarios)

| Concepto | Costo Mensual |
|----------|---------------|
| Hosting (Vercel + AWS) | $80 |
| MongoDB Atlas M30 | $300 |
| Dominio | $1.25 |
| SSL | $0 |
| Email (SendGrid Pro) | $90 |
| **IA (GPT-5.2)** | $300 - $800 |
| **TOTAL** | **$771 - $1,271/mes** |

---

## 4. COSTOS OPCIONALES / FUTUROS

| Servicio | Propósito | Costo |
|----------|-----------|-------|
| **Sentry** | Monitoreo de errores | $26/mes |
| **Analytics (Mixpanel)** | Métricas de usuario | $0-28/mes |
| **CDN (CloudFlare Pro)** | Rendimiento global | $20/mes |
| **Backup adicional** | Redundancia | $20-50/mes |
| **Soporte AWS** | SLA garantizado | $29+/mes |

---

## 5. OPTIMIZACIÓN DE COSTOS - RECOMENDACIONES

### 5.1 Reducir Costos de IA (Mayor Impacto)

1. **Usar GPT-4o-mini para tareas simples**: $0.15/M input vs $1.75/M
   - Ahorro potencial: **60-70%** en consultas básicas
   
2. **Implementar caché de resultados**:
   - Productos ya clasificados no requieren nueva llamada
   - Ahorro potencial: **30-40%**

3. **Batch API de OpenAI**:
   - 50% descuento para procesamientos no urgentes

### 5.2 Reducir Costos de Infraestructura

1. **Usar Render en lugar de Railway**: Similar precio, incluye SSL
2. **MongoDB Serverless**: Pago por operación, ideal para tráfico variable
3. **Fly.io**: Alternativa económica con edge computing

---

## 6. COMPARATIVA CON COMPETIDORES

Para contexto, competidores como Digicust cobran:
- **Desde €99/mes** por funcionalidades similares
- **Planes enterprise**: €500-2,000/mes

**Tu margen bruto potencial**:
- Si cobras €49/mes y tu costo por usuario es ~€2-5 → **Margen: 90%+**
- Si cobras €99/mes → **Margen: 95%+**

---

## 7. PUNTO DE EQUILIBRIO (BREAK-EVEN)

| Precio/Usuario | Costos Fijos | Costo Variable/Usuario | Break-Even |
|----------------|--------------|------------------------|------------|
| €29/mes | €100/mes | €2 | **4 usuarios** |
| €49/mes | €100/mes | €3 | **3 usuarios** |
| €99/mes | €100/mes | €5 | **2 usuarios** |

**Conclusión**: El modelo es altamente escalable. Con solo 5-10 clientes de pago, cubres todos los costos operativos.

---

## 8. INVERSIÓN INICIAL ÚNICA

| Concepto | Costo |
|----------|-------|
| Dominio (primer año) | $15 |
| Configuración MongoDB | $0 |
| Configuración Hosting | $0 |
| **TOTAL INVERSIÓN INICIAL** | **~$15** |

*Nota: El desarrollo ya está hecho. No hay costos de desarrollo adicionales.*

---

## CONCLUSIÓN

**TaricAI tiene un modelo de costos muy eficiente:**

- **Costos fijos bajos**: ~$85-100/mes para operar
- **Costos variables controlables**: El uso de IA escala con ingresos
- **Alto margen**: 85-95% de margen bruto posible
- **Break-even rápido**: 3-5 clientes cubren costos

**El mayor costo variable es la IA (GPT-5.2)**, pero esto escala proporcionalmente con los ingresos de usuarios activos.

---

*Documento generado: Diciembre 2025*
*Precios sujetos a cambios según proveedores*
