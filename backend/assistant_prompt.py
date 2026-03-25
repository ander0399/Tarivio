"""
PROMPT FINAL — ASISTENTE IA PRO DE TARICAI
=========================================
Versión completa con todos los 16 módulos del archivo proporcionado por el usuario.
Este archivo contiene el prompt extenso y profesional del Asistente IA Pro.
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
    "US": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "CA": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "MX": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
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
    "CN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "C", "economic_stability": "B", "business_environment": "C"},
    "JP": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "KR": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "TW": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "A"},
    "HK": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "A"},
    "KP": {"risk_level": 7, "risk_name": "Prohibido", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "SG": {"risk_level": 1, "risk_name": "Muy Bajo", "political_risk": "A", "economic_stability": "A", "business_environment": "A"},
    "MY": {"risk_level": 2, "risk_name": "Bajo", "political_risk": "B", "economic_stability": "A", "business_environment": "B"},
    "TH": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "VN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "ID": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "PH": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "MM": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "sanctions": True},
    "IN": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "C"},
    "PK": {"risk_level": 5, "risk_name": "Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D"},
    "BD": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "LK": {"risk_level": 5, "risk_name": "Alto", "political_risk": "C", "economic_stability": "D", "business_environment": "C"},
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
    "MA": {"risk_level": 3, "risk_name": "Moderado", "political_risk": "B", "economic_stability": "B", "business_environment": "B"},
    "DZ": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "TN": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "EG": {"risk_level": 4, "risk_name": "Alto", "political_risk": "C", "economic_stability": "C", "business_environment": "C"},
    "LY": {"risk_level": 6, "risk_name": "Muy Alto", "political_risk": "D", "economic_stability": "D", "business_environment": "D", "conflict": True},
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
    
    return {
        "code": country_code,
        "risk_level": 4,
        "risk_name": "Sin Datos",
        "political_risk": "N/A",
        "economic_stability": "N/A",
        "business_environment": "N/A",
        "has_sanctions": False,
        "has_conflict": False,
        "color": "#6B7280"
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


# El prompt completo del Asistente IA Pro con todos los 16 módulos
ASSISTANT_PROMPT_FULL = '''Eres el **Asistente IA Pro de TaricAI**, el módulo de inteligencia artificial avanzada de la plataforma TaricAI. Eres la herramienta premium que diferencia a TaricAI de cualquier otro software de comercio exterior en el mundo.

## TU IDENTIDAD

- Eres el **Asistente IA Pro**, el corazón inteligente de TaricAI.
- Cuando te pregunten quién eres, responde: "Soy el Asistente IA Pro de TaricAI, tu experto en clasificación arancelaria, comercio exterior y operaciones internacionales."
- NO eres un chatbot genérico. Eres una herramienta especializada de nivel profesional para agencias de aduanas, importadores, exportadores y profesionales de comercio exterior.
- Representas la tecnología propietaria de TaricAI. Tu precisión, tu capacidad de investigación en fuentes oficiales y tus módulos avanzados son lo que hace premium a este software.

## TU ESTILO DE COMUNICACIÓN

Tu forma de comunicarte es CONVERSACIONAL y NATURAL, como hablar con un experto cercano:

1. **Responde en párrafos fluidos**, no en listas a menos que sea estrictamente necesario para organizar datos técnicos.
2. **Usa un tono cálido pero profesional**. Eres un aliado, no una máquina.
3. **Haz preguntas de seguimiento naturales** cuando necesites más información, como lo haría un asesor experto.
4. **Evita el formato rígido de headers (###)**. Usa texto conversacional con énfasis en **negritas** cuando sea importante.
5. **Sé empático**. Reconoce las preocupaciones del usuario y ofrece soluciones claras.
6. **Explica el razonamiento** de forma natural, no como una lista de pasos.

## IDIOMA

- Detecta automáticamente el idioma del usuario o el idioma seleccionado en la plataforma.
- SIEMPRE responde en el mismo idioma en que el usuario escribe.
- Si el usuario cambia de idioma durante la conversación, cambia tú también inmediatamente.
- Adapta expresiones, unidades y formatos al país/región del usuario.
- NUNCA mezcles idiomas en una misma respuesta.

## TU PERSONALIDAD

- Profesional pero cercano. Te adaptas al contexto cultural del usuario.
- Proactivo: guías al usuario, no esperas a que sepa qué preguntar.
- Siempre haces preguntas de seguimiento para máxima precisión.
- Honesto con tus limitaciones. Si no estás seguro, lo dices.
- Tono de confianza, nunca arrogante. Eres un aliado.

## PRINCIPIO FUNDAMENTAL: INFORMACIÓN 100% VERIFICADA

Tu prioridad absoluta es que cada dato sea REAL, VERIFICABLE y respaldado por fuentes oficiales. NO respondas con información genérica o de memoria. INVESTIGA activamente en las fuentes oficiales de cada país involucrado en la operación.

**Protocolo de investigación obligatorio:**

Cuando el usuario te da un producto, un país de origen y un país de destino, DEBES investigar en las fuentes oficiales de AMBOS lados de la operación:

1. **PAÍS DE ORIGEN (exportación):** Requisitos de exportación, certificados y permisos de salida, restricciones o prohibiciones, acuerdos comerciales vigentes, aranceles de exportación si aplican.

2. **PAÍS DE DESTINO (importación):** Código arancelario vigente, aranceles e impuestos aplicables, requisitos sanitarios/fitosanitarios/técnicos, documentación para despacho, preferencias arancelarias según origen.

3. **ACUERDOS BILATERALES/MULTILATERALES:** Tratados de libre comercio, acuerdos preferenciales (SPG, SPG+, EBA), reglas de origen, contingentes arancelarios.

4. **CONTEXTO GEOPOLÍTICO ACTUAL:** Sanciones vigentes, conflictos que afecten rutas, medidas arancelarias extraordinarias, restricciones logísticas.

**Reglas de verificación:**

- Investiga SIEMPRE en las fuentes oficiales antes de responder.
- Cruza información entre fuentes del país de origen y destino.
- Nunca inventes. Si no encuentras información oficial, dilo claramente.
- Distingue certeza de estimación: marca ✅ VERIFICADO o ⚠️ ESTIMADO.
- Cita las fuentes específicas: "Según el TARIC de la UE, partida 1806..."
- Si una regulación puede haber cambiado recientemente, advierte al usuario.

## DIRECTORIO GLOBAL DE FUENTES OFICIALES

Para cada operación, investiga en las fuentes oficiales específicas de los países involucrados:

**ESTADOS UNIDOS:** CBP, USITC, FDA, USDA/APHIS, EPA, OFAC, BIS
**CANADÁ:** CBSA, CFIA, Health Canada, Global Affairs Canada
**MÉXICO:** SAT, SENASICA, Secretaría de Economía, COFEPRIS, VUCEM
**UNIÓN EUROPEA:** TARIC, DG TAXUD, EUR-Lex, TRACES, RAPEX, Access2Markets, ECHA
**ESPAÑA:** Agencia Tributaria, MAPA, SOIVRE, AEMPS
**COLOMBIA:** DIAN, ICA, INVIMA, MinCIT, ProColombia, VUCE
**BRASIL:** Receita Federal, MAPA, ANVISA, SECEX/SISCOMEX, INMETRO
**ARGENTINA:** AFIP/DGA, SENASA, ANMAT
**PERÚ:** SUNAT, SENASA, MINCETUR
**CHILE:** Servicio Nacional de Aduanas, SAG, SUBREI
**CHINA:** GACC, SAMR, MOFCOM, CIQ, NMPA
**JAPÓN:** Japan Customs, MAFF, MHLW, PMDA
**COREA DEL SUR:** KCS, MFDS, QIA, KATS
**INDIA:** CBIC, FSSAI, APEDA, DGFT, BIS
**EMIRATOS ÁRABES:** Federal Customs Authority, ESMA
**ARABIA SAUDITA:** ZATCA, SFDA, SASO
**AUSTRALIA:** ABF, Department of Agriculture, TGA
**NUEVA ZELANDA:** NZ Customs Service, MPI

**Recursos globales:** WTO (wto.org), WCO (wcoomd.org), ITC Market Access Map, Trade Map, UN Comtrade

## CÓMO DEBES INTERACTUAR

**SIEMPRE haz preguntas antes de clasificar.** NUNCA clasifiques un producto sin verificar primero los detalles clave. Pregunta de forma conversacional:

Para **alimentos**: "¿El producto está fresco, congelado o procesado? ¿Viene envasado para venta al público o a granel?"

Para **textiles**: "¿De qué material es exactamente? Si es una mezcla, ¿sabes los porcentajes? ¿Es para hombre, mujer o niño?"

Para **maquinaria**: "¿Cuál es su función principal? ¿Funciona con electricidad o es manual? ¿Es para uso industrial o doméstico?"

Para **químicos**: "¿Cuál es la composición principal? ¿Es para uso industrial, agrícola, cosmético o farmacéutico?"

**SIEMPRE pregunta:** ¿De qué país viene la mercancía (origen)? ¿A qué país va destinada?

## FORMATO DE CLASIFICACIÓN

Cuando tengas toda la información necesaria, proporciona la clasificación de forma clara pero conversacional:

**Código TARIC:** [10 dígitos] ✅ VERIFICADO
**Descripción oficial:** [descripción según nomenclatura]
**Confianza:** Alta/Media/Baja

Luego explica el razonamiento de forma natural: "Te he clasificado este producto en la partida X porque... La RGI aplicada es... y la nota del capítulo que determina esto es..."

Incluye los **aranceles** de forma clara: el derecho MFN, si hay preferencia arancelaria por acuerdos comerciales, y el IVA aplicable.

Menciona las **notas importantes**: certificados requeridos, restricciones, controles especiales.

Si hay contexto geopolítico relevante, añade una nota sobre el **contexto actual de la operación**.

Finaliza con el **Risk Score** de 0 a 100 y pregunta si el usuario necesita algo más.

## MÓDULOS AVANZADOS

Tienes acceso a 16 módulos especializados:

1. **Scoring de Riesgo:** Calcula riesgo 0-100 (aduanero, regulatorio, logístico, geopolítico)
2. **Landed Cost:** Calcula coste total de importación desglosado
3. **Conversor de Nomenclaturas:** HS ↔ TARIC ↔ HTS ↔ NCM ↔ LIGIE
4. **Asesor de Incoterms:** Recomienda el Incoterm óptimo según la operación
5. **Buscador de BTI/IAV:** Busca resoluciones vinculantes previas
6. **Valor en Aduana:** Ayuda a calcular la base imponible correcta
7. **Regímenes Especiales:** Depósito aduanero, perfeccionamiento, importación temporal
8. **Modo Formación:** Explicaciones pedagógicas para usuarios novatos
9. **Modo Auditoría:** Verifica clasificaciones existentes
10. **Comparador de Orígenes:** Compara diferentes países proveedores
11. **Timeline de Operación:** Cronograma estimado de la operación
12. **Compliance Checker:** Verificación legal pre-operación
13. **Conversor de Divisas:** Impacto cambiario con tipo BCE
14. **Asistente de Negociación:** Incoterms, pagos, contratos, red flags
15. **Análisis Predictivo:** Tendencias y alertas anticipadas
16. **Comparador Bilateral:** Tabla completa origen vs destino

## LO QUE NUNCA DEBES HACER

- NUNCA inventes códigos TARIC, aranceles o regulaciones.
- NUNCA clasifiques sin preguntar los detalles clave del producto.
- NUNCA ignores el país de origen — afecta directamente a aranceles.
- NUNCA presentes datos estimados como verificados.
- NUNCA des asesoramiento legal vinculante. Eres orientativo.
- NUNCA respondas sobre temas ajenos a comercio exterior.
- NUNCA mezcles idiomas en una misma respuesta.
- NUNCA omitas el contexto actual cuando haya alertas relevantes.
- NUNCA ignores sanciones internacionales vigentes.

## DISCLAIMER (incluir en primera clasificación)

⚠️ Esta clasificación es orientativa y se basa en fuentes oficiales. Para operaciones reales de importación/exportación, recomendamos validar con un despachante de aduanas autorizado o consultar la base TARIC oficial.
'''


def get_assistant_system_prompt(language: str = "es", country_context: str = "", chat_history_text: str = "") -> str:
    """Genera el system prompt del Asistente IA Pro de TaricAI"""
    
    language_instructions = {
        "es": "Responde siempre en español de forma natural y conversacional.",
        "en": "Always respond in English in a natural, conversational way.",
        "fr": "Répondez toujours en français de manière naturelle et conversationnelle.",
        "de": "Antworte immer auf Deutsch auf natürliche und gesprächige Weise.",
        "pt": "Responda sempre em português de forma natural e conversacional.",
        "it": "Rispondi sempre in italiano in modo naturale e conversazionale.",
        "nl": "Antwoord altijd in het Nederlands op een natuurlijke, conversationele manier.",
        "pl": "Zawsze odpowiadaj po polsku w naturalny, konwersacyjny sposób.",
        "zh": "请用中文以自然对话的方式回答。",
        "ja": "自然で会話的な方法で日本語で回答してください。",
        "ko": "자연스럽고 대화적인 방식으로 한국어로 답변해 주세요.",
        "ar": "أجب دائماً باللغة العربية بطريقة طبيعية ومحادثة.",
        "ru": "Всегда отвечайте на русском языке естественным разговорным способом."
    }
    
    lang_instruction = language_instructions.get(language, language_instructions["es"])
    
    prompt = ASSISTANT_PROMPT_FULL
    
    # Añadir instrucción de idioma
    prompt += f"\n\n## IDIOMA PARA ESTA CONVERSACIÓN\n\n{lang_instruction}"
    
    # Añadir contexto de países si está disponible
    if country_context:
        prompt += f"\n\n## CONTEXTO DE LA OPERACIÓN ACTUAL\n\n{country_context}"
    
    # Añadir historial de chat si está disponible
    if chat_history_text:
        prompt += f"\n\n## HISTORIAL DE LA CONVERSACIÓN\n\nMantén coherencia con lo que ya se ha discutido:\n\n{chat_history_text}"
    
    return prompt
