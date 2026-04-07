// Complete list of all countries with ISO codes and Spanish names
// Organized by region for better UX

export const COUNTRIES = [
  // European Union
  { code: "ES", name: "España", region: "UE", flag: "🇪🇸" },
  { code: "DE", name: "Alemania", region: "UE", flag: "🇩🇪" },
  { code: "FR", name: "Francia", region: "UE", flag: "🇫🇷" },
  { code: "IT", name: "Italia", region: "UE", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", region: "UE", flag: "🇵🇹" },
  { code: "NL", name: "Países Bajos", region: "UE", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", region: "UE", flag: "🇧🇪" },
  { code: "AT", name: "Austria", region: "UE", flag: "🇦🇹" },
  { code: "PL", name: "Polonia", region: "UE", flag: "🇵🇱" },
  { code: "SE", name: "Suecia", region: "UE", flag: "🇸🇪" },
  { code: "DK", name: "Dinamarca", region: "UE", flag: "🇩🇰" },
  { code: "FI", name: "Finlandia", region: "UE", flag: "🇫🇮" },
  { code: "IE", name: "Irlanda", region: "UE", flag: "🇮🇪" },
  { code: "GR", name: "Grecia", region: "UE", flag: "🇬🇷" },
  { code: "CZ", name: "República Checa", region: "UE", flag: "🇨🇿" },
  { code: "RO", name: "Rumanía", region: "UE", flag: "🇷🇴" },
  { code: "HU", name: "Hungría", region: "UE", flag: "🇭🇺" },
  { code: "SK", name: "Eslovaquia", region: "UE", flag: "🇸🇰" },
  { code: "BG", name: "Bulgaria", region: "UE", flag: "🇧🇬" },
  { code: "HR", name: "Croacia", region: "UE", flag: "🇭🇷" },
  { code: "SI", name: "Eslovenia", region: "UE", flag: "🇸🇮" },
  { code: "LT", name: "Lituania", region: "UE", flag: "🇱🇹" },
  { code: "LV", name: "Letonia", region: "UE", flag: "🇱🇻" },
  { code: "EE", name: "Estonia", region: "UE", flag: "🇪🇪" },
  { code: "CY", name: "Chipre", region: "UE", flag: "🇨🇾" },
  { code: "LU", name: "Luxemburgo", region: "UE", flag: "🇱🇺" },
  { code: "MT", name: "Malta", region: "UE", flag: "🇲🇹" },
  
  // Rest of Europe
  { code: "GB", name: "Reino Unido", region: "Europa", flag: "🇬🇧" },
  { code: "CH", name: "Suiza", region: "Europa", flag: "🇨🇭" },
  { code: "NO", name: "Noruega", region: "Europa", flag: "🇳🇴" },
  { code: "IS", name: "Islandia", region: "Europa", flag: "🇮🇸" },
  { code: "UA", name: "Ucrania", region: "Europa", flag: "🇺🇦" },
  { code: "RS", name: "Serbia", region: "Europa", flag: "🇷🇸" },
  { code: "BA", name: "Bosnia y Herzegovina", region: "Europa", flag: "🇧🇦" },
  { code: "ME", name: "Montenegro", region: "Europa", flag: "🇲🇪" },
  { code: "MK", name: "Macedonia del Norte", region: "Europa", flag: "🇲🇰" },
  { code: "AL", name: "Albania", region: "Europa", flag: "🇦🇱" },
  { code: "MD", name: "Moldavia", region: "Europa", flag: "🇲🇩" },
  { code: "BY", name: "Bielorrusia", region: "Europa", flag: "🇧🇾" },
  { code: "RU", name: "Rusia", region: "Europa", flag: "🇷🇺" },
  { code: "TR", name: "Turquía", region: "Europa", flag: "🇹🇷" },
  
  // North America
  { code: "US", name: "Estados Unidos", region: "Norteamérica", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", region: "Norteamérica", flag: "🇨🇦" },
  { code: "MX", name: "México", region: "Norteamérica", flag: "🇲🇽" },
  
  // Central America & Caribbean
  { code: "GT", name: "Guatemala", region: "Centroamérica", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", region: "Centroamérica", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", region: "Centroamérica", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", region: "Centroamérica", flag: "🇳🇮" },
  { code: "CR", name: "Costa Rica", region: "Centroamérica", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", region: "Centroamérica", flag: "🇵🇦" },
  { code: "BZ", name: "Belice", region: "Centroamérica", flag: "🇧🇿" },
  { code: "CU", name: "Cuba", region: "Caribe", flag: "🇨🇺" },
  { code: "DO", name: "República Dominicana", region: "Caribe", flag: "🇩🇴" },
  { code: "JM", name: "Jamaica", region: "Caribe", flag: "🇯🇲" },
  { code: "HT", name: "Haití", region: "Caribe", flag: "🇭🇹" },
  { code: "PR", name: "Puerto Rico", region: "Caribe", flag: "🇵🇷" },
  { code: "TT", name: "Trinidad y Tobago", region: "Caribe", flag: "🇹🇹" },
  
  // South America
  { code: "BR", name: "Brasil", region: "Sudamérica", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", region: "Sudamérica", flag: "🇦🇷" },
  { code: "CL", name: "Chile", region: "Sudamérica", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", region: "Sudamérica", flag: "🇨🇴" },
  { code: "PE", name: "Perú", region: "Sudamérica", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", region: "Sudamérica", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", region: "Sudamérica", flag: "🇪🇨" },
  { code: "BO", name: "Bolivia", region: "Sudamérica", flag: "🇧🇴" },
  { code: "PY", name: "Paraguay", region: "Sudamérica", flag: "🇵🇾" },
  { code: "UY", name: "Uruguay", region: "Sudamérica", flag: "🇺🇾" },
  { code: "GY", name: "Guyana", region: "Sudamérica", flag: "🇬🇾" },
  { code: "SR", name: "Surinam", region: "Sudamérica", flag: "🇸🇷" },
  
  // Asia - East
  { code: "CN", name: "China", region: "Asia Oriental", flag: "🇨🇳" },
  { code: "JP", name: "Japón", region: "Asia Oriental", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", region: "Asia Oriental", flag: "🇰🇷" },
  { code: "KP", name: "Corea del Norte", region: "Asia Oriental", flag: "🇰🇵" },
  { code: "TW", name: "Taiwán", region: "Asia Oriental", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", region: "Asia Oriental", flag: "🇭🇰" },
  { code: "MO", name: "Macao", region: "Asia Oriental", flag: "🇲🇴" },
  { code: "MN", name: "Mongolia", region: "Asia Oriental", flag: "🇲🇳" },
  
  // Asia - Southeast
  { code: "VN", name: "Vietnam", region: "Sudeste Asiático", flag: "🇻🇳" },
  { code: "TH", name: "Tailandia", region: "Sudeste Asiático", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", region: "Sudeste Asiático", flag: "🇮🇩" },
  { code: "MY", name: "Malasia", region: "Sudeste Asiático", flag: "🇲🇾" },
  { code: "SG", name: "Singapur", region: "Sudeste Asiático", flag: "🇸🇬" },
  { code: "PH", name: "Filipinas", region: "Sudeste Asiático", flag: "🇵🇭" },
  { code: "MM", name: "Myanmar", region: "Sudeste Asiático", flag: "🇲🇲" },
  { code: "KH", name: "Camboya", region: "Sudeste Asiático", flag: "🇰🇭" },
  { code: "LA", name: "Laos", region: "Sudeste Asiático", flag: "🇱🇦" },
  { code: "BN", name: "Brunéi", region: "Sudeste Asiático", flag: "🇧🇳" },
  { code: "TL", name: "Timor Oriental", region: "Sudeste Asiático", flag: "🇹🇱" },
  
  // Asia - South
  { code: "IN", name: "India", region: "Asia del Sur", flag: "🇮🇳" },
  { code: "PK", name: "Pakistán", region: "Asia del Sur", flag: "🇵🇰" },
  { code: "BD", name: "Bangladés", region: "Asia del Sur", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", region: "Asia del Sur", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", region: "Asia del Sur", flag: "🇳🇵" },
  { code: "BT", name: "Bután", region: "Asia del Sur", flag: "🇧🇹" },
  { code: "MV", name: "Maldivas", region: "Asia del Sur", flag: "🇲🇻" },
  { code: "AF", name: "Afganistán", region: "Asia del Sur", flag: "🇦🇫" },
  
  // Middle East
  { code: "SA", name: "Arabia Saudita", region: "Oriente Medio", flag: "🇸🇦" },
  { code: "AE", name: "Emiratos Árabes Unidos", region: "Oriente Medio", flag: "🇦🇪" },
  { code: "IL", name: "Israel", region: "Oriente Medio", flag: "🇮🇱" },
  { code: "IR", name: "Irán", region: "Oriente Medio", flag: "🇮🇷" },
  { code: "IQ", name: "Irak", region: "Oriente Medio", flag: "🇮🇶" },
  { code: "JO", name: "Jordania", region: "Oriente Medio", flag: "🇯🇴" },
  { code: "LB", name: "Líbano", region: "Oriente Medio", flag: "🇱🇧" },
  { code: "SY", name: "Siria", region: "Oriente Medio", flag: "🇸🇾" },
  { code: "KW", name: "Kuwait", region: "Oriente Medio", flag: "🇰🇼" },
  { code: "QA", name: "Catar", region: "Oriente Medio", flag: "🇶🇦" },
  { code: "BH", name: "Baréin", region: "Oriente Medio", flag: "🇧🇭" },
  { code: "OM", name: "Omán", region: "Oriente Medio", flag: "🇴🇲" },
  { code: "YE", name: "Yemen", region: "Oriente Medio", flag: "🇾🇪" },
  
  // Central Asia
  { code: "KZ", name: "Kazajistán", region: "Asia Central", flag: "🇰🇿" },
  { code: "UZ", name: "Uzbekistán", region: "Asia Central", flag: "🇺🇿" },
  { code: "TM", name: "Turkmenistán", region: "Asia Central", flag: "🇹🇲" },
  { code: "KG", name: "Kirguistán", region: "Asia Central", flag: "🇰🇬" },
  { code: "TJ", name: "Tayikistán", region: "Asia Central", flag: "🇹🇯" },
  { code: "AZ", name: "Azerbaiyán", region: "Asia Central", flag: "🇦🇿" },
  { code: "GE", name: "Georgia", region: "Asia Central", flag: "🇬🇪" },
  { code: "AM", name: "Armenia", region: "Asia Central", flag: "🇦🇲" },
  
  // Africa - North
  { code: "MA", name: "Marruecos", region: "Norte de África", flag: "🇲🇦" },
  { code: "EG", name: "Egipto", region: "Norte de África", flag: "🇪🇬" },
  { code: "DZ", name: "Argelia", region: "Norte de África", flag: "🇩🇿" },
  { code: "TN", name: "Túnez", region: "Norte de África", flag: "🇹🇳" },
  { code: "LY", name: "Libia", region: "Norte de África", flag: "🇱🇾" },
  { code: "SD", name: "Sudán", region: "Norte de África", flag: "🇸🇩" },
  
  // Africa - West
  { code: "NG", name: "Nigeria", region: "África Occidental", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", region: "África Occidental", flag: "🇬🇭" },
  { code: "CI", name: "Costa de Marfil", region: "África Occidental", flag: "🇨🇮" },
  { code: "SN", name: "Senegal", region: "África Occidental", flag: "🇸🇳" },
  { code: "ML", name: "Malí", region: "África Occidental", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", region: "África Occidental", flag: "🇧🇫" },
  { code: "NE", name: "Níger", region: "África Occidental", flag: "🇳🇪" },
  { code: "BJ", name: "Benín", region: "África Occidental", flag: "🇧🇯" },
  { code: "TG", name: "Togo", region: "África Occidental", flag: "🇹🇬" },
  { code: "GM", name: "Gambia", region: "África Occidental", flag: "🇬🇲" },
  { code: "GN", name: "Guinea", region: "África Occidental", flag: "🇬🇳" },
  { code: "SL", name: "Sierra Leona", region: "África Occidental", flag: "🇸🇱" },
  { code: "LR", name: "Liberia", region: "África Occidental", flag: "🇱🇷" },
  { code: "MR", name: "Mauritania", region: "África Occidental", flag: "🇲🇷" },
  { code: "CV", name: "Cabo Verde", region: "África Occidental", flag: "🇨🇻" },
  
  // Africa - East
  { code: "KE", name: "Kenia", region: "África Oriental", flag: "🇰🇪" },
  { code: "ET", name: "Etiopía", region: "África Oriental", flag: "🇪🇹" },
  { code: "TZ", name: "Tanzania", region: "África Oriental", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", region: "África Oriental", flag: "🇺🇬" },
  { code: "RW", name: "Ruanda", region: "África Oriental", flag: "🇷🇼" },
  { code: "BI", name: "Burundi", region: "África Oriental", flag: "🇧🇮" },
  { code: "SO", name: "Somalia", region: "África Oriental", flag: "🇸🇴" },
  { code: "DJ", name: "Yibuti", region: "África Oriental", flag: "🇩🇯" },
  { code: "ER", name: "Eritrea", region: "África Oriental", flag: "🇪🇷" },
  { code: "SS", name: "Sudán del Sur", region: "África Oriental", flag: "🇸🇸" },
  { code: "MG", name: "Madagascar", region: "África Oriental", flag: "🇲🇬" },
  { code: "MU", name: "Mauricio", region: "África Oriental", flag: "🇲🇺" },
  { code: "SC", name: "Seychelles", region: "África Oriental", flag: "🇸🇨" },
  { code: "KM", name: "Comoras", region: "África Oriental", flag: "🇰🇲" },
  
  // Africa - Central
  { code: "CD", name: "Rep. Dem. del Congo", region: "África Central", flag: "🇨🇩" },
  { code: "AO", name: "Angola", region: "África Central", flag: "🇦🇴" },
  { code: "CM", name: "Camerún", region: "África Central", flag: "🇨🇲" },
  { code: "GA", name: "Gabón", region: "África Central", flag: "🇬🇦" },
  { code: "CG", name: "Rep. del Congo", region: "África Central", flag: "🇨🇬" },
  { code: "CF", name: "Rep. Centroafricana", region: "África Central", flag: "🇨🇫" },
  { code: "TD", name: "Chad", region: "África Central", flag: "🇹🇩" },
  { code: "GQ", name: "Guinea Ecuatorial", region: "África Central", flag: "🇬🇶" },
  { code: "ST", name: "Santo Tomé y Príncipe", region: "África Central", flag: "🇸🇹" },
  
  // Africa - South
  { code: "ZA", name: "Sudáfrica", region: "África Austral", flag: "🇿🇦" },
  { code: "ZW", name: "Zimbabue", region: "África Austral", flag: "🇿🇼" },
  { code: "ZM", name: "Zambia", region: "África Austral", flag: "🇿🇲" },
  { code: "BW", name: "Botsuana", region: "África Austral", flag: "🇧🇼" },
  { code: "NA", name: "Namibia", region: "África Austral", flag: "🇳🇦" },
  { code: "MZ", name: "Mozambique", region: "África Austral", flag: "🇲🇿" },
  { code: "MW", name: "Malaui", region: "África Austral", flag: "🇲🇼" },
  { code: "LS", name: "Lesoto", region: "África Austral", flag: "🇱🇸" },
  { code: "SZ", name: "Esuatini", region: "África Austral", flag: "🇸🇿" },
  
  // Oceania
  { code: "AU", name: "Australia", region: "Oceanía", flag: "🇦🇺" },
  { code: "NZ", name: "Nueva Zelanda", region: "Oceanía", flag: "🇳🇿" },
  { code: "PG", name: "Papúa Nueva Guinea", region: "Oceanía", flag: "🇵🇬" },
  { code: "FJ", name: "Fiyi", region: "Oceanía", flag: "🇫🇯" },
  { code: "WS", name: "Samoa", region: "Oceanía", flag: "🇼🇸" },
  { code: "TO", name: "Tonga", region: "Oceanía", flag: "🇹🇴" },
  { code: "VU", name: "Vanuatu", region: "Oceanía", flag: "🇻🇺" },
  { code: "SB", name: "Islas Salomón", region: "Oceanía", flag: "🇸🇧" },
  { code: "NC", name: "Nueva Caledonia", region: "Oceanía", flag: "🇳🇨" },
  { code: "PF", name: "Polinesia Francesa", region: "Oceanía", flag: "🇵🇫" },
];

// Get countries grouped by region
export const getCountriesByRegion = () => {
  const grouped = {};
  COUNTRIES.forEach(country => {
    if (!grouped[country.region]) {
      grouped[country.region] = [];
    }
    grouped[country.region].push(country);
  });
  return grouped;
};

// Get country by code
export const getCountryByCode = (code) => {
  return COUNTRIES.find(c => c.code === code);
};

// Common EU destinations for quick selection
export const EU_DESTINATIONS = COUNTRIES.filter(c => c.region === "UE");

// Default destination for Spanish customs
export const DEFAULT_DESTINATION = "ES";

// Region order for display
export const REGION_ORDER = [
  "UE",
  "Europa", 
  "Norteamérica",
  "Centroamérica",
  "Caribe",
  "Sudamérica",
  "Asia Oriental",
  "Sudeste Asiático",
  "Asia del Sur",
  "Oriente Medio",
  "Asia Central",
  "Norte de África",
  "África Occidental",
  "África Oriental",
  "África Central",
  "África Austral",
  "Oceanía"
];
