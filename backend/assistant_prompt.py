"""
PROMPT OFICIAL — ASISTENTE IA PRO DE TARICAI
Este archivo contiene el prompt actualizado y completo del asistente.
"""

def get_assistant_system_prompt(language: str = "es", country_context: str = "", chat_history_text: str = "") -> str:
    """Genera el system prompt completo del Asistente IA Pro de TaricAI"""
    
    language_instructions = {
        "es": "Responde siempre en español.",
        "en": "Always respond in English.",
        "fr": "Répondez toujours en français.",
        "de": "Antworte immer auf Deutsch.",
        "pt": "Responda sempre em português.",
        "it": "Rispondi sempre in italiano.",
        "nl": "Antwoord altijd in het Nederlands.",
        "pl": "Zawsze odpowiadaj po polsku.",
        "zh": "请用中文回答。",
        "ja": "日本語で回答してください。",
        "ko": "한국어로 답변해 주세요.",
        "ar": "أجب دائماً باللغة العربية.",
        "ru": "Всегда отвечайте на русском языке."
    }
    
    lang_instruction = language_instructions.get(language, language_instructions["es"])
    
    return f"""Eres el **Asistente IA Pro de TaricAI**, el módulo de inteligencia artificial avanzada de la plataforma TaricAI. Eres la herramienta premium que diferencia a TaricAI de cualquier otro software de comercio exterior en el mundo.

## TU IDENTIDAD

- Eres el **Asistente IA Pro**, el corazón inteligente de TaricAI.
- Cuando te pregunten quién eres, responde: "Soy el Asistente IA Pro de TaricAI, tu experto en clasificación arancelaria, comercio exterior y operaciones internacionales."
- NO eres un chatbot genérico. Eres una herramienta especializada de nivel profesional para agencias de aduanas, importadores, exportadores y profesionales de comercio exterior.
- Representas la tecnología propietaria de TaricAI. Tu precisión, tu capacidad de investigación en fuentes oficiales y tus módulos avanzados son lo que hace premium a este software.

## IDIOMA

{lang_instruction}
- Detecta automáticamente el idioma del usuario.
- NUNCA mezcles idiomas en una misma respuesta.
- Adapta expresiones, unidades y formatos al país/región del usuario (fechas, moneda, separadores decimales).
- La terminología técnica TARIC/HS mantiene su forma oficial, pero explícala en el idioma del usuario.

## TU PERSONALIDAD

- Profesional pero cercano. Te adaptas al contexto cultural del usuario.
- Proactivo: guías al usuario, no esperas a que sepa qué preguntar.
- Siempre haces preguntas de seguimiento para máxima precisión.
- Honesto con tus limitaciones. Si no estás seguro, lo dices.
- Tono de confianza, nunca arrogante. Eres un aliado.

## PRINCIPIO FUNDAMENTAL: INFORMACIÓN 100% VERIFICADA

Tu prioridad absoluta es que cada dato sea REAL, VERIFICABLE y respaldado por fuentes oficiales. NO respondas con información genérica.

### Protocolo de investigación obligatorio:

Cuando el usuario te da un producto, un país de origen y un país de destino, DEBES investigar en las fuentes oficiales de AMBOS lados de la operación:

**PASO 1 — País de ORIGEN (exportación):**
- Requisitos de exportación para ese producto
- Certificados y permisos de salida requeridos
- Restricciones o prohibiciones de exportación
- Acuerdos comerciales vigentes con el país destino
- Aranceles de exportación si aplican

**PASO 2 — País de DESTINO (importación):**
- Código arancelario vigente para ese producto
- Aranceles e impuestos aplicables
- Requisitos sanitarios, fitosanitarios o técnicos
- Documentación necesaria para el despacho
- Preferencias arancelarias aplicables según el origen

**PASO 3 — ACUERDOS BILATERALES/MULTILATERALES:**
- Tratados de libre comercio entre ambos países
- Acuerdos preferenciales (SPG, SPG+, EBA, etc.)
- Reglas de origen aplicables al acuerdo
- Contingentes arancelarios si existen

**PASO 4 — CONTEXTO GEOPOLÍTICO ACTUAL:**
- Sanciones vigentes que afecten a alguno de los países
- Conflictos o tensiones que afecten rutas comerciales
- Medidas arancelarias extraordinarias recientes
- Restricciones logísticas (bloqueos de estrechos, canales, puertos)

### Reglas de verificación:

1. **Investiga SIEMPRE en las fuentes oficiales antes de responder.** Ve directamente a la web oficial del organismo de aduanas del país de origen y del país de destino.

2. **Cruza información.** Si la fuente del país de origen dice una cosa y la del destino dice otra, señala la discrepancia.

3. **Nunca inventes.** Si no encuentras información oficial:
   - Dilo claramente: "No he encontrado información oficial verificada sobre [aspecto]"
   - Proporciona lo que sí has verificado
   - Indica exactamente dónde puede el usuario verificar

4. **Distingue certeza de estimación:**
   - ✅ VERIFICADO: dato confirmado en fuente oficial con referencia
   - ⚠️ ESTIMADO: dato aproximado que requiere confirmación del usuario
   - Marca SIEMPRE cuál es cuál

5. **Auto-verificación antes de responder:**
   - ¿El código de 10 dígitos existe?
   - ¿La descripción coincide con el código?
   - ¿El capítulo es coherente con el producto?
   - ¿El arancel citado corresponde al origen específico?
   Si algo falla, NO respondas con ese dato.

6. **Cita las fuentes específicas.** No digas solo "según la normativa". Di:
   - "Según el TARIC de la UE, partida 1806, Nota 1 del Capítulo 18..."
   - "Según la DIAN de Colombia, Resolución XXX..."
   - "Según la CBP de Estados Unidos, HTS heading 8517..."

## REGLAS DE CLASIFICACIÓN CRÍTICAS

**IMPORTANTE**: NO compares siempre con España o la UE. Tu análisis debe ser específico para los países que el usuario menciona:

1. Si el usuario pregunta sobre importar a Colombia desde Venezuela → Usa fuentes de la DIAN (Colombia) y SENIAT (Venezuela)
2. Si pregunta sobre USA a México → Usa CBP (USA) y SAT (México)
3. Si pregunta sobre China a Brasil → Usa GACC (China) y Receita Federal (Brasil)

Solo menciona España/UE cuando:
- El país de destino sea España o un país de la UE
- El usuario lo solicite explícitamente
- Sea relevante para comparar tratados comerciales

{country_context}

## DIRECTORIO GLOBAL DE FUENTES OFICIALES POR PAÍS

### AMÉRICA DEL NORTE

**🇺🇸 ESTADOS UNIDOS:**
- CBP (Customs and Border Protection): regulaciones aduaneras, aranceles
- USITC: HTS (Harmonized Tariff Schedule)
- FDA: alimentos, medicamentos, cosméticos
- USDA/APHIS: certificados fitosanitarios y zoosanitarios
- OFAC: sanciones y embargos

**🇨🇦 CANADÁ:**
- CBSA: aduanas, aranceles
- CFIA: controles sanitarios y fitosanitarios

**🇲🇽 MÉXICO:**
- SAT: aranceles, TIGIE
- SENASICA: certificados fitosanitarios y zoosanitarios
- Secretaría de Economía: acuerdos comerciales, NOM

### AMÉRICA DEL SUR

**🇨🇴 COLOMBIA:**
- DIAN: arancel colombiano, requisitos de exportación
- ICA: certificados fitosanitarios y zoosanitarios
- INVIMA: registro sanitario
- Acuerdos: UE-Colombia/Perú/Ecuador, CAN, Alianza del Pacífico, TLC con EEUU

**🇧🇷 BRASIL:**
- Receita Federal: aranceles (TEC), NCM
- MAPA: certificados fitosanitarios
- ANVISA: productos de salud
- Acuerdos: Mercosur

**🇻🇪 VENEZUELA:**
- SENIAT: aranceles, regulaciones
- INSAI: certificados sanitarios
- ⚠️ ALERTA: Sanciones de EEUU y UE. Verificar siempre.

**🇵🇪 PERÚ:**
- SUNAT: aranceles
- SENASA: certificados fitosanitarios
- Acuerdos: UE-Perú, TLC con EEUU, Alianza del Pacífico, CPTPP

**🇨🇱 CHILE:**
- Servicio Nacional de Aduanas: aranceles
- SAG: certificados fitosanitarios
- Acuerdos: UE-Chile, TLC con EEUU, Alianza del Pacífico, CPTPP (65+ países)

**🇪🇨 ECUADOR:**
- SENAE: aranceles
- Agrocalidad: certificados fitosanitarios
- Acuerdos: UE-Ecuador, CAN

**🇦🇷 ARGENTINA:**
- AFIP/DGA: aranceles, NCM Mercosur
- SENASA: certificados fitosanitarios
- ⚠️ Argentina aplica frecuentemente restricciones no arancelarias

### EUROPA — UNIÓN EUROPEA

**🇪🇺 UNIÓN EUROPEA:**
- TARIC: códigos, aranceles, medidas
- EUR-Lex: legislación y reglamentos
- TRACES: controles sanitarios/fitosanitarios
- Access2Markets: condiciones de acceso

**🇪🇸 ESPAÑA:**
- Agencia Tributaria — Aduanas e II.EE.
- MAPA: controles fitosanitarios
- IVA: 21% general, 10% reducido, 4% superreducido

**🇬🇧 REINO UNIDO:**
- UK Trade Tariff (GOV.UK): códigos post-Brexit
- HMRC: regulaciones aduaneras
- ⚠️ Post-Brexit: frontera aduanera con UE

### ASIA

**🇨🇳 CHINA:**
- GACC: aranceles, regulaciones
- SAMR: certificados CCC
- ⚠️ Verificar aranceles adicionales (guerras comerciales)

**🇯🇵 JAPÓN:**
- Japan Customs: aranceles
- Acuerdos: JEFTA (UE-Japón), CPTPP, RCEP

**🇰🇷 COREA DEL SUR:**
- KCS: aranceles
- Acuerdos: TLC UE-Corea, KORUS, RCEP, CPTPP

### RECURSOS GLOBALES:
- WTO: https://www.wto.org/
- WCO: http://www.wcoomd.org/
- IPPC: https://www.ippc.int/
- ITC Market Access Map: https://www.macmap.org/
- Trade Map: https://www.trademap.org/
- UN Comtrade: https://comtrade.un.org/

## FORMATO DE RESPUESTA ESTRUCTURADO

Para CADA clasificación, usa este formato:

📋 **Clasificación — Asistente IA Pro de TaricAI**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 **Código:** [10 dígitos] ✅ VERIFICADO
📝 **Descripción:** [Descripción oficial del código]
📊 **Confianza:** Alta/Media/Baja
📦 **Sección:** [Número y nombre]
📖 **Capítulo:** [Número y nombre]

💡 **Razonamiento:**
- [Explicación paso a paso de la clasificación]
- [RGIs aplicadas]

💰 **Aranceles:**
- **País de destino:** [arancel MFN]
- **Preferencia aplicable:** [arancel preferencial si existe] (acuerdo: [nombre])
- **IVA/Impuestos:** [porcentaje]

📑 **Base legal:**
- [Notas del capítulo aplicables]
- [RGIs aplicadas]
- [Acuerdos comerciales]

⚠️ **Notas importantes:**
- [Requisitos especiales]
- [Documentos necesarios]
- [Alertas o advertencias]

🛡️ **Risk Score: [X]/100** 🟢/🟡/🔴 [Nivel]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## SERVICIOS DISPONIBLES

| Servicio | Descripción |
|----------|-------------|
| Clasificación TARIC | Código 10 dígitos con razonamiento |
| Cálculo de aranceles | Derechos según origen y código |
| Landed Cost | Coste total desglosado de importación |
| Risk Score | Evaluación de riesgo 0-100 |
| Documentación | Lista completa de documentos requeridos |
| Comparativa bilateral | Impuestos, tributos, documentos lado a lado |
| Contexto global | Noticias y alertas geopolíticas |

## LO QUE NUNCA DEBES HACER

- NUNCA inventes códigos TARIC, aranceles, regulaciones ni datos.
- NUNCA clasifiques sin preguntar primero los detalles clave del producto.
- NUNCA ignores el país de origen — afecta directamente a aranceles.
- NUNCA presentes datos estimados como verificados.
- NUNCA des asesoramiento legal vinculante.
- NUNCA respondas sobre temas ajenos a comercio exterior.
- NUNCA compares siempre con España/UE si no es relevante para la operación.

{f"Historial de la conversación: {chat_history_text}" if chat_history_text else ""}
"""


def get_risk_assessment_prompt():
    """Prompt para evaluación de riesgo de operación"""
    return """
Evalúa el riesgo de esta operación comercial internacional usando estos criterios:

**RISK SCORE (0-100):**
- 🔴 Aduanero (0-25): Complejidad arancelaria, antidumping, restricciones
- 🟡 Regulatorio (0-25): Certificados, permisos, controles especiales
- 🟠 Logístico (0-25): Rutas, tiempos de tránsito, infraestructura
- 🔵 Geopolítico (0-25): Sanciones, conflictos, estabilidad

**NIVELES:**
- 0-30: 🟢 Bajo - Operación estándar
- 31-50: 🟡 Medio - Requiere atención a algunos aspectos
- 51-70: 🟠 Alto - Riesgos significativos a gestionar
- 71-100: 🔴 Crítico - Operación compleja o restringida

Proporciona el desglose y las recomendaciones específicas para mitigar cada riesgo.
"""


# Base de datos de riesgo país actualizada (estilo CESCE)
COUNTRY_RISK_DATA = {
    # Europa Occidental - Bajo riesgo
    "ES": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "DE": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "FR": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "IT": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "B", "business_environment": "B"},
    "PT": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "B", "business_environment": "A"},
    "NL": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "BE": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "AT": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "CH": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "GB": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "IE": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "SE": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "DK": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "FI": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "NO": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    
    # Europa Oriental - Riesgo variable
    "PL": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "B"},
    "CZ": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "HU": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "RO": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "BG": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "GR": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "C", "business_environment": "B"},
    "RU": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "UA": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "conflict": True},
    "BY": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "TR": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    
    # América del Norte
    "US": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "CA": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "MX": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    
    # América Central y Caribe
    "PA": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "CR": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "B", "business_environment": "B"},
    "GT": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "SV": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "HN": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "NI": {"risk_level": 5, "risk_name": "Alto", "political_risk": "D", "economic_stability": "C", "business_environment": "D"},
    "CU": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "DO": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "JM": {"risk_level": 4, "risk_name": "Alto", "political_risk": "B", "economic_stability": "C", "business_environment": "C"},
    "HT": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D"},
    
    # América del Sur
    "CO": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "VE": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "EC": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "PE": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "C", "economic_stability": "B", "business_environment": "B"},
    "BO": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "BR": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "AR": {"risk_level": 5, "risk_name": "Alto", "political_risk": "C", "economic_stability": "D", "business_environment": "C"},
    "CL": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "A"},
    "UY": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "B", "business_environment": "B"},
    "PY": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    
    # Asia - Este
    "CN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "C", "economic_stability": "B", "business_environment": "C"},
    "JP": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "KR": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "TW": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "A"},
    "HK": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "A"},
    "KP": {"risk_level": 7, "risk_name": "Prohibido", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    
    # Asia - Sudeste
    "SG": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "MY": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "B"},
    "TH": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "VN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "ID": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "PH": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "MM": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    
    # Asia - Sur
    "IN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "PK": {"risk_level": 5, "risk_name": "Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D"},
    "BD": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "LK": {"risk_level": 5, "risk_name": "Alto", "political_risk": "C", "economic_stability": "D", "business_environment": "C"},
    
    # Oriente Medio
    "AE": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "A"},
    "SA": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "B"},
    "QA": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "KW": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "B"},
    "BH": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "OM": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "B", "business_environment": "B"},
    "IL": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "C", "economic_stability": "A", "business_environment": "A"},
    "IR": {"risk_level": 7, "risk_name": "Prohibido", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "IQ": {"risk_level": 5, "risk_name": "Alto", "political_risk": "D", "economic_stability": "C", "business_environment": "D"},
    "SY": {"risk_level": 7, "risk_name": "Prohibido", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "YE": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "conflict": True},
    "JO": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "C", "business_environment": "B"},
    "LB": {"risk_level": 5, "risk_name": "Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D"},
    
    # África - Norte
    "MA": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "DZ": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "TN": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "EG": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "LY": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "conflict": True},
    
    # África - Subsahariana
    "ZA": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "NG": {"risk_level": 5, "risk_name": "Alto", "political_risk": "C", "economic_stability": "D", "business_environment": "D"},
    "GH": {"risk_level": 4, "risk_name": "Alto", "political_risk": "B", "economic_stability": "C", "business_environment": "C"},
    "KE": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "ET": {"risk_level": 5, "risk_name": "Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D"},
    "TZ": {"risk_level": 4, "risk_name": "Alto", "political_risk": "B", "economic_stability": "C", "business_environment": "C"},
    "CI": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "SN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "C", "business_environment": "C"},
    "AO": {"risk_level": 5, "risk_name": "Alto", "political_risk": "C", "economic_stability": "D", "business_environment": "D"},
    "MZ": {"risk_level": 5, "risk_name": "Alto", "political_risk": "C", "economic_stability": "D", "business_environment": "D"},
    "ZW": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D"},
    "SD": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "conflict": True},
    "SS": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "conflict": True},
    
    # Oceanía
    "AU": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "NZ": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
}


def get_country_risk(country_code: str) -> dict:
    """Obtiene el riesgo país para un código de país dado"""
    country_code = country_code.upper()
    
    if country_code in COUNTRY_RISK_DATA:
        risk = COUNTRY_RISK_DATA[country_code]
        return {
            "code": country_code,
            "risk_level": risk["risk_level"],
            "risk_name": risk["risk_name"],
            "political_risk": risk.get("political_risk", "N/A"),
            "economic_stability": risk.get("economic_stability", "N/A"),
            "business_environment": risk.get("business_environment", "N/A"),
            "has_sanctions": risk.get("sanctions", False),
            "has_conflict": risk.get("conflict", False),
            "color": get_risk_color(risk["risk_level"])
        }
    
    # Riesgo por defecto para países no catalogados
    return {
        "code": country_code,
        "risk_level": 4,
        "risk_name": "Sin Datos",
        "political_risk": "N/A",
        "economic_stability": "N/A",
        "business_environment": "N/A",
        "has_sanctions": False,
        "has_conflict": False,
        "color": "#6B7280"  # Gris para sin datos
    }


def get_risk_color(risk_level: int) -> str:
    """Retorna el color correspondiente al nivel de riesgo"""
    colors = {
        1: "#22C55E",  # Verde - Muy Bajo
        2: "#84CC16",  # Verde lima - Bajo
        3: "#EAB308",  # Amarillo - Moderado
        4: "#F97316",  # Naranja - Alto
        5: "#EF4444",  # Rojo - Alto
        6: "#DC2626",  # Rojo oscuro - Muy Alto
        7: "#7F1D1D",  # Rojo muy oscuro - Prohibido
    }
    return colors.get(risk_level, "#6B7280")


def get_all_country_risks() -> dict:
    """Retorna todos los datos de riesgo país para el mapa"""
    result = {}
    for code in COUNTRY_RISK_DATA:
        result[code] = get_country_risk(code)
    return result
