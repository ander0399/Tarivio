// Trade Agreements Database - EU with third countries
// Based on official EU trade agreements: https://ec.europa.eu/trade/policy/countries-and-regions/agreements/

export const TRADE_AGREEMENTS = {
  // Free Trade Agreements (FTA)
  "EU-Chile": {
    name: "Acuerdo de Asociación UE-Chile",
    type: "FTA",
    countries: ["CL"],
    status: "active",
    effectiveDate: "2003-02-01",
    benefits: "Eliminación de aranceles para productos industriales. Contingentes preferenciales para productos agrícolas.",
    preferentialRate: "0%",
    documents: ["EUR.1", "Declaración en factura"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/chile/"
  },
  "EU-Mexico": {
    name: "Acuerdo Global UE-México",
    type: "FTA",
    countries: ["MX"],
    status: "active",
    effectiveDate: "2000-07-01",
    benefits: "Liberalización del comercio de bienes y servicios. Arancel 0% para productos industriales.",
    preferentialRate: "0%",
    documents: ["EUR.1", "Declaración en factura"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/mexico/"
  },
  "EU-Canada-CETA": {
    name: "CETA - Acuerdo Económico y Comercial Global",
    type: "FTA",
    countries: ["CA"],
    status: "active",
    effectiveDate: "2017-09-21",
    benefits: "Eliminación del 98% de los aranceles. Acceso a contratación pública. Protección de indicaciones geográficas.",
    preferentialRate: "0%",
    documents: ["Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/in-focus/ceta/"
  },
  "EU-Japan-EPA": {
    name: "Acuerdo de Asociación Económica UE-Japón",
    type: "FTA",
    countries: ["JP"],
    status: "active",
    effectiveDate: "2019-02-01",
    benefits: "Eliminación de aranceles sobre el 97% de las importaciones de Japón. Acceso a servicios y contratación pública.",
    preferentialRate: "0%",
    documents: ["Declaración de origen", "Sistema REX"],
    officialLink: "https://ec.europa.eu/trade/policy/in-focus/eu-japan-economic-partnership-agreement/"
  },
  "EU-Korea": {
    name: "Acuerdo de Libre Comercio UE-Corea del Sur",
    type: "FTA",
    countries: ["KR"],
    status: "active",
    effectiveDate: "2011-07-01",
    benefits: "Eliminación del 98.7% de los aranceles. Liberalización de servicios. Protección de PI.",
    preferentialRate: "0%",
    documents: ["Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/south-korea/"
  },
  "EU-Singapore": {
    name: "Acuerdo de Libre Comercio UE-Singapur",
    type: "FTA",
    countries: ["SG"],
    status: "active",
    effectiveDate: "2019-11-21",
    benefits: "Eliminación de todos los aranceles de Singapur. Acceso mejorado a servicios.",
    preferentialRate: "0%",
    documents: ["Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/singapore/"
  },
  "EU-Vietnam": {
    name: "Acuerdo de Libre Comercio UE-Vietnam",
    type: "FTA",
    countries: ["VN"],
    status: "active",
    effectiveDate: "2020-08-01",
    benefits: "Eliminación del 99% de los aranceles en 10 años. Acceso a contratación pública.",
    preferentialRate: "Reducido",
    documents: ["EUR.1", "Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/vietnam/"
  },
  "EU-UK-TCA": {
    name: "Acuerdo de Comercio y Cooperación UE-Reino Unido",
    type: "FTA",
    countries: ["GB"],
    status: "active",
    effectiveDate: "2021-01-01",
    benefits: "Aranceles 0% y cuotas 0% para mercancías que cumplan reglas de origen.",
    preferentialRate: "0%",
    documents: ["Declaración de origen"],
    officialLink: "https://ec.europa.eu/info/relations-united-kingdom/eu-uk-trade-and-cooperation-agreement_en"
  },
  "EU-Switzerland": {
    name: "Acuerdo de Libre Comercio UE-Suiza",
    type: "FTA",
    countries: ["CH"],
    status: "active",
    effectiveDate: "1973-01-01",
    benefits: "Libre circulación de productos industriales. Acuerdos sectoriales adicionales.",
    preferentialRate: "0%",
    documents: ["EUR.1", "Declaración en factura"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/switzerland/"
  },
  "EU-Norway-EEA": {
    name: "Acuerdo EEE (Espacio Económico Europeo)",
    type: "EEA",
    countries: ["NO", "IS"],
    status: "active",
    effectiveDate: "1994-01-01",
    benefits: "Libre circulación de mercancías, personas, servicios y capitales.",
    preferentialRate: "0%",
    documents: ["EUR.1", "Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/norway/"
  },
  
  // Mediterranean Agreements
  "EU-Morocco": {
    name: "Acuerdo de Asociación UE-Marruecos",
    type: "Association",
    countries: ["MA"],
    status: "active",
    effectiveDate: "2000-03-01",
    benefits: "Zona de libre comercio para productos industriales. Preferencias para productos agrícolas.",
    preferentialRate: "0-Reducido",
    documents: ["EUR.1", "EUR-MED"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/morocco/"
  },
  "EU-Tunisia": {
    name: "Acuerdo de Asociación UE-Túnez",
    type: "Association",
    countries: ["TN"],
    status: "active",
    effectiveDate: "1998-03-01",
    benefits: "Libre comercio de productos industriales. Concesiones agrícolas.",
    preferentialRate: "0-Reducido",
    documents: ["EUR.1", "EUR-MED"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/tunisia/"
  },
  "EU-Egypt": {
    name: "Acuerdo de Asociación UE-Egipto",
    type: "Association",
    countries: ["EG"],
    status: "active",
    effectiveDate: "2004-06-01",
    benefits: "Zona de libre comercio para productos industriales. Preferencias agrícolas.",
    preferentialRate: "0-Reducido",
    documents: ["EUR.1", "EUR-MED"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/egypt/"
  },
  "EU-Israel": {
    name: "Acuerdo de Asociación UE-Israel",
    type: "Association",
    countries: ["IL"],
    status: "active",
    effectiveDate: "2000-06-01",
    benefits: "Libre comercio de productos industriales. Concesiones recíprocas agrícolas.",
    preferentialRate: "0-Reducido",
    documents: ["EUR.1", "EUR-MED"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/israel/"
  },
  "EU-Turkey": {
    name: "Unión Aduanera UE-Turquía",
    type: "Customs Union",
    countries: ["TR"],
    status: "active",
    effectiveDate: "1996-01-01",
    benefits: "Unión aduanera para productos industriales. Turquía aplica el AEC de la UE a terceros países.",
    preferentialRate: "0%",
    documents: ["A.TR", "EUR.1"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/turkey/"
  },
  
  // South America - MERCOSUR
  "EU-Mercosur": {
    name: "Acuerdo UE-Mercosur (pendiente ratificación)",
    type: "FTA",
    countries: ["BR", "AR", "PY", "UY"],
    status: "pending",
    effectiveDate: null,
    benefits: "Eliminación de aranceles industriales. Cuotas para productos agrícolas sensibles.",
    preferentialRate: "Pendiente",
    documents: ["Pendiente definición"],
    officialLink: "https://ec.europa.eu/trade/policy/in-focus/eu-mercosur-association-agreement/"
  },
  "EU-Peru-Colombia-Ecuador": {
    name: "Acuerdo Comercial UE-Perú/Colombia/Ecuador",
    type: "FTA",
    countries: ["PE", "CO", "EC"],
    status: "active",
    effectiveDate: "2013-03-01",
    benefits: "Liberalización arancelaria progresiva. Acceso preferencial para productos agrícolas.",
    preferentialRate: "0-Reducido",
    documents: ["EUR.1", "Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/regions/andean-community/"
  },
  "EU-Central-America": {
    name: "Acuerdo de Asociación UE-Centroamérica",
    type: "Association",
    countries: ["GT", "HN", "SV", "NI", "CR", "PA"],
    status: "active",
    effectiveDate: "2013-08-01",
    benefits: "Eliminación de aranceles para productos industriales. Cuotas para productos sensibles.",
    preferentialRate: "0-Reducido",
    documents: ["EUR.1", "Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/regions/central-america/"
  },
  
  // Asia-Pacific
  "EU-Australia": {
    name: "Acuerdo de Libre Comercio UE-Australia (negociando)",
    type: "FTA",
    countries: ["AU"],
    status: "negotiating",
    effectiveDate: null,
    benefits: "En negociación",
    preferentialRate: "MFN vigente",
    documents: ["Certificado de origen estándar"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/australia/"
  },
  "EU-New-Zealand": {
    name: "Acuerdo de Libre Comercio UE-Nueva Zelanda",
    type: "FTA",
    countries: ["NZ"],
    status: "active",
    effectiveDate: "2024-05-01",
    benefits: "Eliminación del 91% de aranceles desde entrada en vigor. Acceso a contratación pública.",
    preferentialRate: "0-Reducido",
    documents: ["Declaración de origen"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/countries/new-zealand/"
  },
  
  // GSP - Sistema de Preferencias Generalizadas
  "EU-GSP": {
    name: "Sistema de Preferencias Generalizadas (SPG)",
    type: "GSP",
    countries: ["BD", "KH", "NP", "MM", "PK", "LK", "BO", "PH", "ID", "IN", "KE", "NG", "GH", "VN"],
    status: "active",
    effectiveDate: "2014-01-01",
    benefits: "Reducción o eliminación de aranceles para países en desarrollo.",
    preferentialRate: "0-Reducido",
    documents: ["Formulario A", "Declaración REX"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/development/generalised-scheme-of-preferences/"
  },
  
  // GSP+ (incentive arrangement)
  "EU-GSP-Plus": {
    name: "SPG+ (Régimen especial de estímulo)",
    type: "GSP+",
    countries: ["BO", "EC", "PK", "PH", "LK", "KG", "MN"],
    status: "active",
    effectiveDate: "2014-01-01",
    benefits: "Arancel 0% para productos sensibles y no sensibles a cambio de ratificar convenios internacionales.",
    preferentialRate: "0%",
    documents: ["Formulario A", "Declaración REX"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/development/generalised-scheme-of-preferences/gsp-plus/"
  },
  
  // EBA - Everything But Arms
  "EU-EBA": {
    name: "EBA - Todo Menos Armas",
    type: "EBA",
    countries: ["AF", "BD", "BJ", "BF", "BI", "KH", "CF", "TD", "KM", "CD", "DJ", "GQ", "ER", "ET", "GM", "GN", "GW", "HT", "KI", "LA", "LS", "LR", "MG", "MW", "ML", "MR", "MZ", "MM", "NP", "NE", "RW", "ST", "SN", "SL", "SB", "SO", "SS", "SD", "TZ", "TL", "TG", "TV", "UG", "VU", "YE", "ZM"],
    status: "active",
    effectiveDate: "2001-03-05",
    benefits: "Arancel 0% y sin cuotas para todos los productos excepto armas de países menos adelantados.",
    preferentialRate: "0%",
    documents: ["Formulario A", "Declaración REX"],
    officialLink: "https://ec.europa.eu/trade/policy/countries-and-regions/development/generalised-scheme-of-preferences/everything-but-arms/"
  }
};

// Function to find applicable trade agreements between origin and destination
export const findApplicableAgreements = (originCountry, destinationCountry) => {
  const agreements = [];
  
  // Check if destination is EU (Spain or other EU country)
  const euCountries = ["ES", "DE", "FR", "IT", "PT", "NL", "BE", "AT", "PL", "SE", "DK", "FI", "IE", "GR", "CZ", "RO", "HU", "SK", "BG", "HR", "SI", "LT", "LV", "EE", "CY", "LU", "MT"];
  
  // If both are EU countries, it's intra-EU trade (no tariffs)
  if (euCountries.includes(originCountry) && euCountries.includes(destinationCountry)) {
    return [{
      name: "Comercio Intra-UE",
      type: "Intra-EU",
      benefits: "Libre circulación de mercancías sin aranceles ni controles aduaneros.",
      preferentialRate: "0%",
      documents: ["Ningún documento aduanero requerido"],
      status: "active"
    }];
  }
  
  // If destination is EU, check origin country agreements
  if (euCountries.includes(destinationCountry)) {
    for (const [key, agreement] of Object.entries(TRADE_AGREEMENTS)) {
      if (agreement.countries.includes(originCountry)) {
        agreements.push({
          ...agreement,
          agreementId: key
        });
      }
    }
  }
  
  // If origin is EU, check destination country agreements (for exports)
  if (euCountries.includes(originCountry)) {
    for (const [key, agreement] of Object.entries(TRADE_AGREEMENTS)) {
      if (agreement.countries.includes(destinationCountry)) {
        agreements.push({
          ...agreement,
          agreementId: key
        });
      }
    }
  }
  
  return agreements;
};

// Get agreement status badge color
export const getAgreementStatusColor = (status) => {
  switch (status) {
    case "active":
      return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" };
    case "pending":
      return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" };
    case "negotiating":
      return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" };
    default:
      return { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" };
  }
};

// Get agreement type label in Spanish
export const getAgreementTypeLabel = (type) => {
  const labels = {
    "FTA": "Tratado de Libre Comercio",
    "Association": "Acuerdo de Asociación",
    "EEA": "Espacio Económico Europeo",
    "Customs Union": "Unión Aduanera",
    "GSP": "Sistema de Preferencias Generalizadas",
    "GSP+": "SPG+ (Régimen de Estímulo)",
    "EBA": "Todo Menos Armas (PMA)",
    "Intra-EU": "Comercio Intra-UE"
  };
  return labels[type] || type;
};

export default TRADE_AGREEMENTS;
