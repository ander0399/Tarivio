import React, { useState, useEffect, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Globe, 
  ExternalLink, 
  Building2, 
  FileText, 
  Leaf, 
  DollarSign,
  Info,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// TopoJSON del mundo - usando CDN estable
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapeo de nombres de países a códigos ISO (world-atlas usa nombres diferentes)
const COUNTRY_NAME_TO_CODE = {
  // Europa
  "Spain": "ES", "Germany": "DE", "France": "FR", "Italy": "IT", "Portugal": "PT",
  "Netherlands": "NL", "Belgium": "BE", "Poland": "PL", "Sweden": "SE", "Austria": "AT",
  "Greece": "GR", "Czech Republic": "CZ", "Czechia": "CZ", "Romania": "RO", "Hungary": "HU",
  "Ireland": "IE", "Denmark": "DK", "Finland": "FI", "United Kingdom": "GB",
  "Switzerland": "CH", "Norway": "NO", "Russia": "RU", "Ukraine": "UA", "Turkey": "TR",
  // América del Norte
  "United States of America": "US", "United States": "US", "USA": "US",
  "Canada": "CA", "Mexico": "MX",
  // Latinoamérica
  "Colombia": "CO", "Brazil": "BR", "Argentina": "AR", "Chile": "CL", "Peru": "PE",
  "Ecuador": "EC", "Uruguay": "UY", "Paraguay": "PY", "Bolivia": "BO", "Venezuela": "VE",
  "Panama": "PA", "Costa Rica": "CR", "Guatemala": "GT", 
  "Dominican Republic": "DO", "Dominican Rep.": "DO",
  "Jamaica": "JM",
  // Asia
  "China": "CN", "Japan": "JP", 
  "South Korea": "KR", "Korea": "KR", "Korea, Republic of": "KR", "Rep. Korea": "KR",
  "Taiwan": "TW", "Hong Kong": "HK", "Singapore": "SG", 
  "Thailand": "TH", "Vietnam": "VN", "Viet Nam": "VN",
  "Indonesia": "ID", "Malaysia": "MY", "Philippines": "PH", "India": "IN",
  // Medio Oriente
  "United Arab Emirates": "AE", "Saudi Arabia": "SA", "Israel": "IL", "Qatar": "QA",
  // África
  "South Africa": "ZA", "Nigeria": "NG", "Egypt": "EG", "Morocco": "MA", 
  "Kenya": "KE", "Ghana": "GH",
  // Oceanía
  "Australia": "AU", "New Zealand": "NZ"
};

// Colores por región
const REGION_COLORS = {
  "Europa": "#3B82F6",      // Blue
  "América": "#10B981",     // Green
  "Asia": "#F59E0B",        // Amber
  "África": "#8B5CF6",      // Purple
  "Oceanía": "#EC4899",     // Pink
  "default": "#64748B"      // Slate
};

const CountryInfoPanel = ({ country, onClose, onSelectAsOrigin, onSelectAsDestination }) => {
  if (!country) return null;
  
  return (
    <Card className="absolute right-4 top-4 w-96 z-50 shadow-2xl border-2 border-cyan-500/30 bg-slate-900/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            {country.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {country.region} • {country.subregion}
          </Badge>
          {country.eu_member && (
            <Badge className="bg-blue-600 text-xs">Miembro UE</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[300px] pr-4">
          {/* Autoridad Aduanera */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4" />
              Autoridad Aduanera
            </h4>
            <p className="text-sm text-gray-300 mb-1">{country.customs_authority}</p>
            {country.customs_website && (
              <a 
                href={country.customs_website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Sitio oficial
              </a>
            )}
          </div>

          {/* Base Arancelaria */}
          {country.tariff_database && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Base de Datos Arancelaria
              </h4>
              <a 
                href={country.tariff_database} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Consultar aranceles
              </a>
            </div>
          )}

          {/* Autoridad Fitosanitaria */}
          {country.phytosanitary_authority && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4" />
                Autoridad Fitosanitaria
              </h4>
              <p className="text-sm text-gray-300 mb-1">{country.phytosanitary_authority}</p>
              {country.phytosanitary_website && (
                <a 
                  href={country.phytosanitary_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Sitio oficial
                </a>
              )}
            </div>
          )}

          {/* Información Fiscal */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" />
              Información Fiscal
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-800 rounded p-2">
                <span className="text-gray-400 text-xs">Moneda</span>
                <p className="text-white font-medium">{country.currency}</p>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <span className="text-gray-400 text-xs">IVA/VAT</span>
                <p className="text-white font-medium">{country.vat_rate}%</p>
              </div>
            </div>
          </div>

          {/* Sistema HS */}
          {country.hs_system && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" />
                Sistema Arancelario
              </h4>
              <p className="text-sm text-gray-300">{country.hs_system}</p>
            </div>
          )}

          {/* Requisitos de Importación */}
          {country.import_requirements && country.import_requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Requisitos de Importación
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {country.import_requirements.slice(0, 5).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tratados Comerciales */}
          {country.trade_agreements && country.trade_agreements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                Tratados Comerciales
              </h4>
              <div className="flex flex-wrap gap-1">
                {country.trade_agreements.map((agreement, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {agreement}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notas Especiales */}
          {country.special_notes && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Notas Importantes
              </h4>
              <p className="text-sm text-gray-300 bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                {country.special_notes}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => onSelectAsOrigin(country)}
          >
            Origen
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs bg-cyan-600 hover:bg-cyan-700"
            onClick={() => onSelectAsDestination(country)}
          >
            Destino
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const WorldTradeMap = memo(({ token, onSelectOrigin, onSelectDestination }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countryRisks, setCountryRisks] = useState({});
  const [viewMode, setViewMode] = useState('region'); // 'region' o 'risk'

  // Cargar datos de riesgo país
  React.useEffect(() => {
    const fetchCountryRisks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/risk/all-countries`);
        setCountryRisks(response.data);
      } catch (error) {
        console.log('Risk data not available');
      }
    };
    fetchCountryRisks();
  }, []);

  // Cargar lista de países disponibles
  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/countries/list`);
        setAvailableCountries(response.data.countries.map(c => c.code));
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  const handleCountryClick = async (geo) => {
    const countryName = geo.properties.name;
    const countryCode = COUNTRY_NAME_TO_CODE[countryName];
    
    if (!countryCode || !availableCountries.includes(countryCode)) {
      return; // País no disponible en nuestra base de datos
    }

    setSelectedCountry(countryCode);
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/country/${countryCode}`);
      setCountryData(response.data);
    } catch (error) {
      console.error('Error fetching country data:', error);
      setCountryData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const getCountryColor = (geo) => {
    const countryName = geo.properties.name;
    const countryCode = COUNTRY_NAME_TO_CODE[countryName];
    
    if (!countryCode || !availableCountries.includes(countryCode)) {
      return "#1e293b"; // País no disponible - gris oscuro
    }

    if (selectedCountry === countryCode) {
      return "#06b6d4"; // País seleccionado - cyan
    }

    if (hoveredCountry === countryName) {
      return "#0891b2"; // País hover - cyan más oscuro
    }

    // Modo de vista: Riesgo País
    if (viewMode === 'risk' && countryRisks[countryCode]) {
      return countryRisks[countryCode].color || "#6B7280";
    }

    // Color por región (modo por defecto)
    const regionMap = {
      "ES": "Europa", "DE": "Europa", "FR": "Europa", "IT": "Europa", "PT": "Europa",
      "NL": "Europa", "BE": "Europa", "PL": "Europa", "SE": "Europa", "AT": "Europa",
      "GR": "Europa", "CZ": "Europa", "RO": "Europa", "HU": "Europa", "IE": "Europa",
      "DK": "Europa", "FI": "Europa", "GB": "Europa", "CH": "Europa", "NO": "Europa",
      "RU": "Europa", "UA": "Europa", "TR": "Europa",
      "US": "América", "CA": "América", "MX": "América", "CO": "América", "BR": "América",
      "AR": "América", "CL": "América", "PE": "América", "EC": "América", "UY": "América",
      "PY": "América", "BO": "América", "VE": "América", "PA": "América", "CR": "América",
      "GT": "América", "DO": "América", "JM": "América",
      "CN": "Asia", "JP": "Asia", "KR": "Asia", "TW": "Asia", "HK": "Asia", "SG": "Asia",
      "TH": "Asia", "VN": "Asia", "ID": "Asia", "MY": "Asia", "PH": "Asia", "IN": "Asia",
      "AE": "Asia", "SA": "Asia", "IL": "Asia", "QA": "Asia",
      "ZA": "África", "NG": "África", "EG": "África", "MA": "África", "KE": "África", "GH": "África",
      "AU": "Oceanía", "NZ": "Oceanía"
    };

    const region = regionMap[countryCode] || "default";
    return REGION_COLORS[region] || REGION_COLORS.default;
  };

  // Obtener información de riesgo para tooltip
  const getCountryRiskInfo = (countryCode) => {
    if (countryRisks[countryCode]) {
      return countryRisks[countryCode];
    }
    return null;
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/20">
      {/* Header */}
      <div className="absolute top-4 left-4 z-40">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-cyan-400" />
          Mapa Mundial de Comercio
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Haz clic en un país para ver información comercial detallada
        </p>
        {/* Selector de modo de vista */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setViewMode('region')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              viewMode === 'region' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Por Región
          </button>
          <button
            onClick={() => setViewMode('risk')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              viewMode === 'risk' 
                ? 'bg-amber-500 text-white' 
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Riesgo País
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomIn}
          className="bg-slate-900/80 border-cyan-500/30 hover:bg-slate-800"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomOut}
          className="bg-slate-900/80 border-cyan-500/30 hover:bg-slate-800"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleReset}
          className="bg-slate-900/80 border-cyan-500/30 hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-40 bg-slate-900/90 rounded-lg p-3 border border-cyan-500/20">
        {viewMode === 'region' ? (
          <>
            <p className="text-xs font-semibold text-gray-400 mb-2">Regiones</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: REGION_COLORS.Europa }}></div>
                <span className="text-gray-300">Europa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: REGION_COLORS.América }}></div>
                <span className="text-gray-300">América</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: REGION_COLORS.Asia }}></div>
                <span className="text-gray-300">Asia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: REGION_COLORS.África }}></div>
                <span className="text-gray-300">África</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: REGION_COLORS.Oceanía }}></div>
                <span className="text-gray-300">Oceanía</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-500"></div>
                <span className="text-gray-300">Seleccionado</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-amber-400 mb-2">Riesgo País (estilo CESCE)</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22C55E" }}></div>
                <span className="text-gray-300">Muy Bajo (1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#84CC16" }}></div>
                <span className="text-gray-300">Bajo (2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#EAB308" }}></div>
                <span className="text-gray-300">Moderado (3)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#F97316" }}></div>
                <span className="text-gray-300">Alto (4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#EF4444" }}></div>
                <span className="text-gray-300">Muy Alto (5-6)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#7F1D1D" }}></div>
                <span className="text-gray-300">Prohibido (7)</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Basado en datos de CESCE y fuentes globales</p>
          </>
        )}
        <p className="text-[10px] text-gray-500 mt-2">65+ países con datos comerciales</p>
      </div>

      {/* Hovered Country Name with Risk Info */}
      {hoveredCountry && (
        <div className="absolute top-24 left-4 z-40 bg-slate-900/90 px-3 py-2 rounded-lg border border-cyan-500/30">
          <span className="text-sm text-cyan-400 font-semibold">{hoveredCountry}</span>
          {COUNTRY_NAME_TO_CODE[hoveredCountry] && availableCountries.includes(COUNTRY_NAME_TO_CODE[hoveredCountry]) && (
            <>
              {viewMode === 'risk' && getCountryRiskInfo(COUNTRY_NAME_TO_CODE[hoveredCountry]) && (
                <div className="mt-1 text-xs">
                  <span 
                    className="px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: getCountryRiskInfo(COUNTRY_NAME_TO_CODE[hoveredCountry]).color }}
                  >
                    Riesgo: {getCountryRiskInfo(COUNTRY_NAME_TO_CODE[hoveredCountry]).risk_name}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-400 ml-2">• Datos disponibles</span>
            </>
          )}
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30]
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const countryCode = COUNTRY_NAME_TO_CODE[countryName];
                const isAvailable = countryCode && availableCountries.includes(countryCode);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => isAvailable && handleCountryClick(geo)}
                    onMouseEnter={() => setHoveredCountry(countryName)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: {
                        fill: getCountryColor(geo),
                        stroke: "#0f172a",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isAvailable ? "pointer" : "default",
                        transition: "fill 0.2s ease"
                      },
                      hover: {
                        fill: isAvailable ? "#0891b2" : "#1e293b",
                        stroke: isAvailable ? "#06b6d4" : "#0f172a",
                        strokeWidth: isAvailable ? 1 : 0.5,
                        outline: "none",
                        cursor: isAvailable ? "pointer" : "default"
                      },
                      pressed: {
                        fill: "#06b6d4",
                        stroke: "#0f172a",
                        strokeWidth: 0.5,
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Country Info Panel */}
      {countryData && (
        <CountryInfoPanel
          country={countryData}
          onClose={() => {
            setSelectedCountry(null);
            setCountryData(null);
          }}
          onSelectAsOrigin={(country) => {
            if (onSelectOrigin) onSelectOrigin(country);
            setSelectedCountry(null);
            setCountryData(null);
          }}
          onSelectAsDestination={(country) => {
            if (onSelectDestination) onSelectDestination(country);
            setSelectedCountry(null);
            setCountryData(null);
          }}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-cyan-500/30">
            <span className="text-cyan-400">Cargando información...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default WorldTradeMap;
