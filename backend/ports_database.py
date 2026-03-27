"""
Base de datos de puertos principales del mundo con costos estimados 2025-2026
Incluye: THC, muellaje, gate-in/out, inspección, zonas francas
"""

# Costos en USD - Valores aproximados 2025-2026 para contenedor 20'/40'
PORTS_DATABASE = {
    # ═══════════════════════════════════════════════════════════════
    # ESPAÑA
    # ═══════════════════════════════════════════════════════════════
    "ESVLC": {
        "name": "Puerto de Valencia",
        "country": "ES",
        "country_name": "España",
        "type": "maritime",
        "efficiency_rating": 4.5,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "ZAL Valencia (Zona de Actividades Logísticas)",
        "free_zone_benefits": "Diferimiento de IVA y aranceles, simplificación aduanera",
        "costs_20ft": {
            "thc": 185,
            "wharfage": 45,
            "gate_in_out": 35,
            "inspection": 120,
            "documentation": 50,
            "total_estimated": 435
        },
        "costs_40ft": {
            "thc": 280,
            "wharfage": 70,
            "gate_in_out": 50,
            "inspection": 150,
            "documentation": 50,
            "total_estimated": 600
        },
        "reefer_surcharge_day": 85,
        "notes": "Principal puerto de España. Excelente conexión ferroviaria. Líder en tráfico de contenedores del Mediterráneo occidental."
    },
    "ESBCN": {
        "name": "Puerto de Barcelona",
        "country": "ES",
        "country_name": "España",
        "type": "maritime",
        "efficiency_rating": 4.3,
        "avg_dwell_time_days": 2.5,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca de Barcelona",
        "free_zone_benefits": "Exención arancelaria para mercancías en tránsito, diferimiento fiscal",
        "costs_20ft": {
            "thc": 195,
            "wharfage": 50,
            "gate_in_out": 40,
            "inspection": 125,
            "documentation": 55,
            "total_estimated": 465
        },
        "costs_40ft": {
            "thc": 295,
            "wharfage": 75,
            "gate_in_out": 55,
            "inspection": 155,
            "documentation": 55,
            "total_estimated": 635
        },
        "reefer_surcharge_day": 90,
        "notes": "Segundo puerto de España. Hub mediterráneo. Mayor congestión que Valencia pero más conexiones directas con Asia."
    },
    "ESALG": {
        "name": "Puerto de Algeciras",
        "country": "ES",
        "country_name": "España",
        "type": "maritime",
        "efficiency_rating": 4.4,
        "avg_dwell_time_days": 1.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca de Algeciras",
        "free_zone_benefits": "Hub de transbordo, costos competitivos",
        "costs_20ft": {
            "thc": 165,
            "wharfage": 40,
            "gate_in_out": 30,
            "inspection": 110,
            "documentation": 45,
            "total_estimated": 390
        },
        "costs_40ft": {
            "thc": 250,
            "wharfage": 60,
            "gate_in_out": 45,
            "inspection": 140,
            "documentation": 45,
            "total_estimated": 540
        },
        "reefer_surcharge_day": 80,
        "notes": "Principal hub de transbordo del Mediterráneo. Costos más bajos pero menos servicios de valor añadido."
    },
    "ESBIO": {
        "name": "Puerto de Bilbao",
        "country": "ES",
        "country_name": "España",
        "type": "maritime",
        "efficiency_rating": 4.2,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": False,
        "free_zone_name": None,
        "free_zone_benefits": None,
        "costs_20ft": {
            "thc": 175,
            "wharfage": 42,
            "gate_in_out": 32,
            "inspection": 115,
            "documentation": 48,
            "total_estimated": 412
        },
        "costs_40ft": {
            "thc": 265,
            "wharfage": 65,
            "gate_in_out": 48,
            "inspection": 145,
            "documentation": 48,
            "total_estimated": 571
        },
        "reefer_surcharge_day": 82,
        "notes": "Principal puerto del norte de España. Buenas conexiones con norte de Europa."
    },

    # ═══════════════════════════════════════════════════════════════
    # COLOMBIA
    # ═══════════════════════════════════════════════════════════════
    "COBUN": {
        "name": "Puerto de Buenaventura",
        "country": "CO",
        "country_name": "Colombia",
        "type": "maritime",
        "efficiency_rating": 3.5,
        "avg_dwell_time_days": 4,
        "congestion_level": "high",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca del Pacífico",
        "free_zone_benefits": "Tarifa única de renta 20%, exención de IVA y aranceles para bienes de capital",
        "costs_20ft": {
            "thc": 220,
            "wharfage": 55,
            "gate_in_out": 45,
            "inspection": 90,
            "documentation": 40,
            "total_estimated": 450
        },
        "costs_40ft": {
            "thc": 340,
            "wharfage": 85,
            "gate_in_out": 65,
            "inspection": 120,
            "documentation": 40,
            "total_estimated": 650
        },
        "reefer_surcharge_day": 95,
        "notes": "Principal puerto del Pacífico colombiano. Alta congestión. Conexión directa con Asia. Riesgos de seguridad en la zona."
    },
    "COCTG": {
        "name": "Puerto de Cartagena",
        "country": "CO",
        "country_name": "Colombia",
        "type": "maritime",
        "efficiency_rating": 4.2,
        "avg_dwell_time_days": 2.5,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca de Cartagena / Zona Franca La Candelaria",
        "free_zone_benefits": "Impuesto de renta 20%, exención de IVA, infraestructura moderna",
        "costs_20ft": {
            "thc": 200,
            "wharfage": 48,
            "gate_in_out": 38,
            "inspection": 85,
            "documentation": 38,
            "total_estimated": 409
        },
        "costs_40ft": {
            "thc": 310,
            "wharfage": 75,
            "gate_in_out": 55,
            "inspection": 110,
            "documentation": 38,
            "total_estimated": 588
        },
        "reefer_surcharge_day": 88,
        "notes": "Puerto más moderno de Colombia. Hub del Caribe. Mejor eficiencia que Buenaventura. Conexiones con Europa y EEUU."
    },
    "COBAQ": {
        "name": "Puerto de Barranquilla",
        "country": "CO",
        "country_name": "Colombia",
        "type": "maritime",
        "efficiency_rating": 3.8,
        "avg_dwell_time_days": 3,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca de Barranquilla",
        "free_zone_benefits": "Impuesto de renta 20%, exención arancelaria para insumos",
        "costs_20ft": {
            "thc": 190,
            "wharfage": 45,
            "gate_in_out": 35,
            "inspection": 80,
            "documentation": 35,
            "total_estimated": 385
        },
        "costs_40ft": {
            "thc": 290,
            "wharfage": 70,
            "gate_in_out": 52,
            "inspection": 105,
            "documentation": 35,
            "total_estimated": 552
        },
        "reefer_surcharge_day": 85,
        "notes": "Puerto fluvial-marítimo. Costos más bajos pero limitaciones de calado para buques grandes."
    },

    # ═══════════════════════════════════════════════════════════════
    # ESTADOS UNIDOS
    # ═══════════════════════════════════════════════════════════════
    "USLAX": {
        "name": "Puerto de Los Ángeles",
        "country": "US",
        "country_name": "Estados Unidos",
        "type": "maritime",
        "efficiency_rating": 4.0,
        "avg_dwell_time_days": 4,
        "congestion_level": "high",
        "has_free_zone": True,
        "free_zone_name": "Foreign Trade Zone #202",
        "free_zone_benefits": "Diferimiento de aranceles, reducción de inventario duty-paid",
        "costs_20ft": {
            "thc": 450,
            "wharfage": 85,
            "gate_in_out": 75,
            "inspection": 200,
            "documentation": 80,
            "total_estimated": 890
        },
        "costs_40ft": {
            "thc": 650,
            "wharfage": 130,
            "gate_in_out": 110,
            "inspection": 280,
            "documentation": 80,
            "total_estimated": 1250
        },
        "reefer_surcharge_day": 150,
        "notes": "Mayor puerto de EEUU. Alta congestión crónica. Costos elevados pero acceso directo al mercado californiano."
    },
    "USLGB": {
        "name": "Puerto de Long Beach",
        "country": "US",
        "country_name": "Estados Unidos",
        "type": "maritime",
        "efficiency_rating": 4.1,
        "avg_dwell_time_days": 3.5,
        "congestion_level": "high",
        "has_free_zone": True,
        "free_zone_name": "Foreign Trade Zone #50",
        "free_zone_benefits": "Diferimiento arancelario, zona de manufactura",
        "costs_20ft": {
            "thc": 440,
            "wharfage": 82,
            "gate_in_out": 72,
            "inspection": 195,
            "documentation": 78,
            "total_estimated": 867
        },
        "costs_40ft": {
            "thc": 635,
            "wharfage": 125,
            "gate_in_out": 105,
            "inspection": 275,
            "documentation": 78,
            "total_estimated": 1218
        },
        "reefer_surcharge_day": 145,
        "notes": "Segundo puerto más grande de EEUU. Similar a Los Ángeles pero ligeramente más eficiente."
    },
    "USNYC": {
        "name": "Puerto de Nueva York/Nueva Jersey",
        "country": "US",
        "country_name": "Estados Unidos",
        "type": "maritime",
        "efficiency_rating": 4.2,
        "avg_dwell_time_days": 3,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "Foreign Trade Zone #49",
        "free_zone_benefits": "Hub de distribución costa este, diferimiento fiscal",
        "costs_20ft": {
            "thc": 420,
            "wharfage": 78,
            "gate_in_out": 68,
            "inspection": 185,
            "documentation": 75,
            "total_estimated": 826
        },
        "costs_40ft": {
            "thc": 610,
            "wharfage": 120,
            "gate_in_out": 100,
            "inspection": 260,
            "documentation": 75,
            "total_estimated": 1165
        },
        "reefer_surcharge_day": 140,
        "notes": "Principal puerto de la costa este. Mejor eficiencia que puertos de California."
    },
    "USMIA": {
        "name": "Puerto de Miami",
        "country": "US",
        "country_name": "Estados Unidos",
        "type": "maritime",
        "efficiency_rating": 4.3,
        "avg_dwell_time_days": 2.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Foreign Trade Zone #281",
        "free_zone_benefits": "Hub para Latinoamérica, perecederos",
        "costs_20ft": {
            "thc": 380,
            "wharfage": 70,
            "gate_in_out": 60,
            "inspection": 170,
            "documentation": 70,
            "total_estimated": 750
        },
        "costs_40ft": {
            "thc": 560,
            "wharfage": 108,
            "gate_in_out": 88,
            "inspection": 240,
            "documentation": 70,
            "total_estimated": 1066
        },
        "reefer_surcharge_day": 130,
        "notes": "Hub para comercio con Latinoamérica. Excelente para perecederos. Puerto eficiente."
    },

    # ═══════════════════════════════════════════════════════════════
    # CHINA
    # ═══════════════════════════════════════════════════════════════
    "CNSHA": {
        "name": "Puerto de Shanghái",
        "country": "CN",
        "country_name": "China",
        "type": "maritime",
        "efficiency_rating": 4.7,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Shanghai Free Trade Zone (Yangshan)",
        "free_zone_benefits": "Liberalización comercial, simplificación aduanera, financiamiento preferencial",
        "costs_20ft": {
            "thc": 120,
            "wharfage": 25,
            "gate_in_out": 20,
            "inspection": 45,
            "documentation": 30,
            "total_estimated": 240
        },
        "costs_40ft": {
            "thc": 180,
            "wharfage": 40,
            "gate_in_out": 30,
            "inspection": 60,
            "documentation": 30,
            "total_estimated": 340
        },
        "reefer_surcharge_day": 55,
        "notes": "Puerto más grande del mundo. Altamente automatizado. Costos muy competitivos."
    },
    "CNSHE": {
        "name": "Puerto de Shenzhen (Yantian)",
        "country": "CN",
        "country_name": "China",
        "type": "maritime",
        "efficiency_rating": 4.6,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Shenzhen Free Trade Zone",
        "free_zone_benefits": "Cercanía a fábricas de Guangdong, despacho rápido",
        "costs_20ft": {
            "thc": 115,
            "wharfage": 23,
            "gate_in_out": 18,
            "inspection": 42,
            "documentation": 28,
            "total_estimated": 226
        },
        "costs_40ft": {
            "thc": 175,
            "wharfage": 38,
            "gate_in_out": 28,
            "inspection": 58,
            "documentation": 28,
            "total_estimated": 327
        },
        "reefer_surcharge_day": 52,
        "notes": "Principal puerto de exportación del sur de China. Ideal para productos electrónicos y manufactura."
    },
    "CNNBO": {
        "name": "Puerto de Ningbo-Zhoushan",
        "country": "CN",
        "country_name": "China",
        "type": "maritime",
        "efficiency_rating": 4.5,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Ningbo Free Trade Zone",
        "free_zone_benefits": "Costos más bajos que Shanghái, buena conectividad",
        "costs_20ft": {
            "thc": 110,
            "wharfage": 22,
            "gate_in_out": 17,
            "inspection": 40,
            "documentation": 26,
            "total_estimated": 215
        },
        "costs_40ft": {
            "thc": 165,
            "wharfage": 35,
            "gate_in_out": 26,
            "inspection": 55,
            "documentation": 26,
            "total_estimated": 307
        },
        "reefer_surcharge_day": 50,
        "notes": "Tercer puerto más grande del mundo. Alternativa económica a Shanghái."
    },

    # ═══════════════════════════════════════════════════════════════
    # PAÍSES BAJOS / BÉLGICA
    # ═══════════════════════════════════════════════════════════════
    "NLRTM": {
        "name": "Puerto de Róterdam",
        "country": "NL",
        "country_name": "Países Bajos",
        "type": "maritime",
        "efficiency_rating": 4.8,
        "avg_dwell_time_days": 1.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Distripark / Europoort",
        "free_zone_benefits": "Hub de distribución europeo, diferimiento aduanero UE",
        "costs_20ft": {
            "thc": 220,
            "wharfage": 48,
            "gate_in_out": 38,
            "inspection": 95,
            "documentation": 55,
            "total_estimated": 456
        },
        "costs_40ft": {
            "thc": 335,
            "wharfage": 75,
            "gate_in_out": 58,
            "inspection": 130,
            "documentation": 55,
            "total_estimated": 653
        },
        "reefer_surcharge_day": 95,
        "notes": "Mayor puerto de Europa. Altamente automatizado. Puerta de entrada a la UE."
    },
    "BEANR": {
        "name": "Puerto de Amberes",
        "country": "BE",
        "country_name": "Bélgica",
        "type": "maritime",
        "efficiency_rating": 4.7,
        "avg_dwell_time_days": 1.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Antwerp Free Zone",
        "free_zone_benefits": "Hub químico y farmacéutico, diferimiento fiscal UE",
        "costs_20ft": {
            "thc": 215,
            "wharfage": 46,
            "gate_in_out": 36,
            "inspection": 92,
            "documentation": 52,
            "total_estimated": 441
        },
        "costs_40ft": {
            "thc": 325,
            "wharfage": 72,
            "gate_in_out": 55,
            "inspection": 125,
            "documentation": 52,
            "total_estimated": 629
        },
        "reefer_surcharge_day": 92,
        "notes": "Segundo puerto de Europa. Especializado en químicos y farmacéuticos."
    },

    # ═══════════════════════════════════════════════════════════════
    # ALEMANIA
    # ═══════════════════════════════════════════════════════════════
    "DEHAM": {
        "name": "Puerto de Hamburgo",
        "country": "DE",
        "country_name": "Alemania",
        "type": "maritime",
        "efficiency_rating": 4.5,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Freihafen Hamburg",
        "free_zone_benefits": "Acceso al mercado alemán y Europa central",
        "costs_20ft": {
            "thc": 240,
            "wharfage": 52,
            "gate_in_out": 42,
            "inspection": 105,
            "documentation": 58,
            "total_estimated": 497
        },
        "costs_40ft": {
            "thc": 365,
            "wharfage": 82,
            "gate_in_out": 65,
            "inspection": 145,
            "documentation": 58,
            "total_estimated": 715
        },
        "reefer_surcharge_day": 100,
        "notes": "Principal puerto de Alemania. Excelente conexión ferroviaria con Europa central."
    },

    # ═══════════════════════════════════════════════════════════════
    # MÉXICO
    # ═══════════════════════════════════════════════════════════════
    "MXMAN": {
        "name": "Puerto de Manzanillo",
        "country": "MX",
        "country_name": "México",
        "type": "maritime",
        "efficiency_rating": 4.0,
        "avg_dwell_time_days": 3,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "Zona Libre de Manzanillo",
        "free_zone_benefits": "Diferimiento arancelario, acceso al Bajío industrial",
        "costs_20ft": {
            "thc": 180,
            "wharfage": 42,
            "gate_in_out": 35,
            "inspection": 75,
            "documentation": 40,
            "total_estimated": 372
        },
        "costs_40ft": {
            "thc": 275,
            "wharfage": 65,
            "gate_in_out": 52,
            "inspection": 100,
            "documentation": 40,
            "total_estimated": 532
        },
        "reefer_surcharge_day": 78,
        "notes": "Principal puerto del Pacífico mexicano. Gateway para comercio con Asia."
    },
    "MXVER": {
        "name": "Puerto de Veracruz",
        "country": "MX",
        "country_name": "México",
        "type": "maritime",
        "efficiency_rating": 3.8,
        "avg_dwell_time_days": 3.5,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "Recinto Fiscalizado Estratégico Veracruz",
        "free_zone_benefits": "Diferimiento fiscal, manufactura para reexportación",
        "costs_20ft": {
            "thc": 170,
            "wharfage": 40,
            "gate_in_out": 32,
            "inspection": 70,
            "documentation": 38,
            "total_estimated": 350
        },
        "costs_40ft": {
            "thc": 260,
            "wharfage": 62,
            "gate_in_out": 48,
            "inspection": 95,
            "documentation": 38,
            "total_estimated": 503
        },
        "reefer_surcharge_day": 75,
        "notes": "Principal puerto del Golfo. Conexión con Europa y costa este EEUU."
    },
    "MXLZC": {
        "name": "Puerto de Lázaro Cárdenas",
        "country": "MX",
        "country_name": "México",
        "type": "maritime",
        "efficiency_rating": 4.2,
        "avg_dwell_time_days": 2.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Zona Económica Especial Lázaro Cárdenas",
        "free_zone_benefits": "Incentivos fiscales, infraestructura moderna",
        "costs_20ft": {
            "thc": 165,
            "wharfage": 38,
            "gate_in_out": 30,
            "inspection": 68,
            "documentation": 36,
            "total_estimated": 337
        },
        "costs_40ft": {
            "thc": 250,
            "wharfage": 58,
            "gate_in_out": 45,
            "inspection": 90,
            "documentation": 36,
            "total_estimated": 479
        },
        "reefer_surcharge_day": 72,
        "notes": "Puerto más eficiente del Pacífico mexicano. Menor congestión que Manzanillo."
    },

    # ═══════════════════════════════════════════════════════════════
    # BRASIL
    # ═══════════════════════════════════════════════════════════════
    "BRSSZ": {
        "name": "Puerto de Santos",
        "country": "BR",
        "country_name": "Brasil",
        "type": "maritime",
        "efficiency_rating": 3.8,
        "avg_dwell_time_days": 4,
        "congestion_level": "high",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca de Santos / EADI",
        "free_zone_benefits": "Diferimiento tributario, cercanía a São Paulo",
        "costs_20ft": {
            "thc": 280,
            "wharfage": 65,
            "gate_in_out": 55,
            "inspection": 130,
            "documentation": 60,
            "total_estimated": 590
        },
        "costs_40ft": {
            "thc": 420,
            "wharfage": 100,
            "gate_in_out": 82,
            "inspection": 180,
            "documentation": 60,
            "total_estimated": 842
        },
        "reefer_surcharge_day": 110,
        "notes": "Mayor puerto de Sudamérica. Alta congestión. Costos elevados pero acceso directo al mercado brasileño."
    },

    # ═══════════════════════════════════════════════════════════════
    # CHILE
    # ═══════════════════════════════════════════════════════════════
    "CLSAI": {
        "name": "Puerto de San Antonio",
        "country": "CL",
        "country_name": "Chile",
        "type": "maritime",
        "efficiency_rating": 4.3,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": False,
        "free_zone_name": None,
        "free_zone_benefits": None,
        "costs_20ft": {
            "thc": 160,
            "wharfage": 38,
            "gate_in_out": 28,
            "inspection": 65,
            "documentation": 35,
            "total_estimated": 326
        },
        "costs_40ft": {
            "thc": 245,
            "wharfage": 58,
            "gate_in_out": 42,
            "inspection": 88,
            "documentation": 35,
            "total_estimated": 468
        },
        "reefer_surcharge_day": 70,
        "notes": "Principal puerto de Chile. Muy eficiente. Conexiones con Asia y EEUU."
    },
    "CLVAP": {
        "name": "Puerto de Valparaíso",
        "country": "CL",
        "country_name": "Chile",
        "type": "maritime",
        "efficiency_rating": 4.0,
        "avg_dwell_time_days": 2.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Zona Franca de Valparaíso (ZOFRI)",
        "free_zone_benefits": "Exención de IVA e impuestos para mercancías en tránsito",
        "costs_20ft": {
            "thc": 155,
            "wharfage": 36,
            "gate_in_out": 26,
            "inspection": 62,
            "documentation": 33,
            "total_estimated": 312
        },
        "costs_40ft": {
            "thc": 235,
            "wharfage": 55,
            "gate_in_out": 40,
            "inspection": 85,
            "documentation": 33,
            "total_estimated": 448
        },
        "reefer_surcharge_day": 68,
        "notes": "Segundo puerto de Chile. Cercanía a Santiago."
    },

    # ═══════════════════════════════════════════════════════════════
    # PERÚ
    # ═══════════════════════════════════════════════════════════════
    "PECLL": {
        "name": "Puerto del Callao",
        "country": "PE",
        "country_name": "Perú",
        "type": "maritime",
        "efficiency_rating": 4.0,
        "avg_dwell_time_days": 3,
        "congestion_level": "medium",
        "has_free_zone": True,
        "free_zone_name": "ZOFRATACNA / Depósitos Francos",
        "free_zone_benefits": "Diferimiento arancelario, cercanía a Lima",
        "costs_20ft": {
            "thc": 175,
            "wharfage": 40,
            "gate_in_out": 32,
            "inspection": 70,
            "documentation": 38,
            "total_estimated": 355
        },
        "costs_40ft": {
            "thc": 265,
            "wharfage": 62,
            "gate_in_out": 48,
            "inspection": 95,
            "documentation": 38,
            "total_estimated": 508
        },
        "reefer_surcharge_day": 75,
        "notes": "Principal puerto de Perú. Hub del Pacífico sudamericano."
    },

    # ═══════════════════════════════════════════════════════════════
    # EMIRATOS ÁRABES / MEDIO ORIENTE
    # ═══════════════════════════════════════════════════════════════
    "AEJEA": {
        "name": "Puerto de Jebel Ali (Dubái)",
        "country": "AE",
        "country_name": "Emiratos Árabes Unidos",
        "type": "maritime",
        "efficiency_rating": 4.9,
        "avg_dwell_time_days": 1.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "JAFZA (Jebel Ali Free Zone)",
        "free_zone_benefits": "0% impuestos corporativos, 100% propiedad extranjera, repatriación total de beneficios",
        "costs_20ft": {
            "thc": 140,
            "wharfage": 30,
            "gate_in_out": 25,
            "inspection": 55,
            "documentation": 35,
            "total_estimated": 285
        },
        "costs_40ft": {
            "thc": 210,
            "wharfage": 48,
            "gate_in_out": 38,
            "inspection": 75,
            "documentation": 35,
            "total_estimated": 406
        },
        "reefer_surcharge_day": 65,
        "notes": "Uno de los puertos más eficientes del mundo. Hub de transbordo global. Zona franca de clase mundial."
    },

    # ═══════════════════════════════════════════════════════════════
    # SINGAPUR
    # ═══════════════════════════════════════════════════════════════
    "SGSIN": {
        "name": "Puerto de Singapur",
        "country": "SG",
        "country_name": "Singapur",
        "type": "maritime",
        "efficiency_rating": 5.0,
        "avg_dwell_time_days": 1,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Free Trade Zone (FTZ) Singapur",
        "free_zone_benefits": "Puerto libre, 0% aranceles en casi todos los productos",
        "costs_20ft": {
            "thc": 130,
            "wharfage": 28,
            "gate_in_out": 22,
            "inspection": 50,
            "documentation": 32,
            "total_estimated": 262
        },
        "costs_40ft": {
            "thc": 195,
            "wharfage": 45,
            "gate_in_out": 35,
            "inspection": 70,
            "documentation": 32,
            "total_estimated": 377
        },
        "reefer_surcharge_day": 60,
        "notes": "Puerto más eficiente del mundo. Hub de transbordo global. Sin aranceles para la mayoría de productos."
    },

    # ═══════════════════════════════════════════════════════════════
    # JAPÓN
    # ═══════════════════════════════════════════════════════════════
    "JPYOK": {
        "name": "Puerto de Yokohama",
        "country": "JP",
        "country_name": "Japón",
        "type": "maritime",
        "efficiency_rating": 4.6,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Yokohama Free Trade Zone",
        "free_zone_benefits": "Diferimiento arancelario, cercanía a Tokio",
        "costs_20ft": {
            "thc": 320,
            "wharfage": 70,
            "gate_in_out": 55,
            "inspection": 140,
            "documentation": 65,
            "total_estimated": 650
        },
        "costs_40ft": {
            "thc": 480,
            "wharfage": 108,
            "gate_in_out": 85,
            "inspection": 195,
            "documentation": 65,
            "total_estimated": 933
        },
        "reefer_surcharge_day": 120,
        "notes": "Principal puerto de Japón para contenedores. Costos altos pero eficiencia excelente."
    },
    "JPOSA": {
        "name": "Puerto de Osaka",
        "country": "JP",
        "country_name": "Japón",
        "type": "maritime",
        "efficiency_rating": 4.5,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Osaka Free Trade Zone",
        "free_zone_benefits": "Acceso a Kansai industrial",
        "costs_20ft": {
            "thc": 310,
            "wharfage": 68,
            "gate_in_out": 52,
            "inspection": 135,
            "documentation": 62,
            "total_estimated": 627
        },
        "costs_40ft": {
            "thc": 465,
            "wharfage": 105,
            "gate_in_out": 80,
            "inspection": 190,
            "documentation": 62,
            "total_estimated": 902
        },
        "reefer_surcharge_day": 115,
        "notes": "Segundo puerto de Japón. Acceso a la región industrial de Kansai."
    },

    # ═══════════════════════════════════════════════════════════════
    # COREA DEL SUR
    # ═══════════════════════════════════════════════════════════════
    "KRPUS": {
        "name": "Puerto de Busan",
        "country": "KR",
        "country_name": "Corea del Sur",
        "type": "maritime",
        "efficiency_rating": 4.7,
        "avg_dwell_time_days": 1.5,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Busan Free Economic Zone",
        "free_zone_benefits": "Hub de transbordo Asia-Pacífico, incentivos fiscales",
        "costs_20ft": {
            "thc": 145,
            "wharfage": 32,
            "gate_in_out": 26,
            "inspection": 58,
            "documentation": 38,
            "total_estimated": 299
        },
        "costs_40ft": {
            "thc": 220,
            "wharfage": 50,
            "gate_in_out": 40,
            "inspection": 80,
            "documentation": 38,
            "total_estimated": 428
        },
        "reefer_surcharge_day": 68,
        "notes": "Quinto puerto más grande del mundo. Hub de transbordo. Muy eficiente y competitivo."
    },

    # ═══════════════════════════════════════════════════════════════
    # MARRUECOS
    # ═══════════════════════════════════════════════════════════════
    "MAPTM": {
        "name": "Puerto de Tánger Med",
        "country": "MA",
        "country_name": "Marruecos",
        "type": "maritime",
        "efficiency_rating": 4.5,
        "avg_dwell_time_days": 2,
        "congestion_level": "low",
        "has_free_zone": True,
        "free_zone_name": "Tanger Med Free Zone / Zona Franca de Tánger",
        "free_zone_benefits": "0% impuestos primeros 5 años, cercanía a Europa (14 km de España)",
        "costs_20ft": {
            "thc": 130,
            "wharfage": 28,
            "gate_in_out": 22,
            "inspection": 48,
            "documentation": 30,
            "total_estimated": 258
        },
        "costs_40ft": {
            "thc": 195,
            "wharfage": 45,
            "gate_in_out": 35,
            "inspection": 68,
            "documentation": 30,
            "total_estimated": 373
        },
        "reefer_surcharge_day": 58,
        "notes": "Puerto más moderno de África. Hub de transbordo Atlántico-Mediterráneo. Costos muy competitivos."
    },
}


def get_ports_by_country(country_code: str) -> list:
    """Retorna todos los puertos de un país"""
    country_code = country_code.upper()
    return [
        {"code": code, **port}
        for code, port in PORTS_DATABASE.items()
        if port["country"] == country_code
    ]


def get_port_info(port_code: str) -> dict:
    """Retorna información de un puerto específico"""
    port_code = port_code.upper()
    if port_code in PORTS_DATABASE:
        return {"code": port_code, **PORTS_DATABASE[port_code]}
    return None


def get_all_ports() -> list:
    """Retorna todos los puertos"""
    return [
        {"code": code, **port}
        for code, port in PORTS_DATABASE.items()
    ]


def compare_ports(port_codes: list) -> list:
    """Compara múltiples puertos"""
    result = []
    for code in port_codes:
        port = get_port_info(code)
        if port:
            result.append(port)
    return sorted(result, key=lambda x: x["costs_40ft"]["total_estimated"])


def get_recommended_port(country_code: str, cargo_type: str = "general") -> dict:
    """Recomienda el mejor puerto para un país según tipo de carga"""
    ports = get_ports_by_country(country_code)
    if not ports:
        return None
    
    # Para carga refrigerada, priorizar eficiencia
    if cargo_type == "reefer":
        return max(ports, key=lambda x: x["efficiency_rating"])
    
    # Para carga general, balance costo/eficiencia
    for port in ports:
        port["score"] = port["efficiency_rating"] * 0.4 + (5 - port["costs_40ft"]["total_estimated"] / 300) * 0.6
    
    return max(ports, key=lambda x: x.get("score", 0))
