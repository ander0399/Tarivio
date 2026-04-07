import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Anchor, 
  Ship, 
  Globe, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Warehouse,
  ArrowRight,
  Loader2,
  Info,
  Snowflake,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Lista de países con puertos disponibles
const COUNTRIES_WITH_PORTS = [
  { code: 'ES', name: 'España' },
  { code: 'CO', name: 'Colombia' },
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CN', name: 'China' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'DE', name: 'Alemania' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'AE', name: 'Emiratos Árabes' },
  { code: 'SG', name: 'Singapur' },
  { code: 'JP', name: 'Japón' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'MA', name: 'Marruecos' },
];

const CongestionBadge = ({ level }) => {
  const config = {
    low: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', text: 'Baja' },
    medium: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', text: 'Media' },
    high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Alta' }
  };
  const cfg = config[level] || config.medium;
  return <Badge className={`${cfg.color} border text-xs`}>{cfg.text}</Badge>;
};

const EfficiencyStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-3 h-3 ${i < fullStars ? 'text-amber-400 fill-amber-400' : i === fullStars && hasHalf ? 'text-amber-400 fill-amber-400/50' : 'text-slate-600'}`} 
        />
      ))}
      <span className="ml-1 text-xs text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
};

const PortCard = ({ port, isRecommended, containerType, isRefrigerated }) => {
  const costs = containerType === '20ft' ? port.costs_20ft : port.costs_40ft;
  const totalWithReefer = isRefrigerated ? costs.total_estimated + (port.reefer_surcharge_day * 3) : costs.total_estimated;
  
  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${isRecommended ? 'ring-2 ring-cyan-500/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" />
              {port.name}
              {isRecommended && (
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 border text-xs ml-2">
                  Recomendado
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              {port.country_name} • Código: {port.code}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-400">${totalWithReefer}</div>
            <div className="text-xs text-slate-500">USD / {containerType}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <Clock className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <div className="text-white font-medium">{port.avg_dwell_time_days}d</div>
            <div className="text-slate-500">Espera</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <EfficiencyStars rating={port.efficiency_rating} />
            <div className="text-slate-500">Eficiencia</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <CongestionBadge level={port.congestion_level} />
            <div className="text-slate-500 mt-1">Congestión</div>
          </div>
        </div>

        {/* Desglose de costos */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs font-medium text-slate-300 mb-2">Desglose de costos</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">THC (Terminal Handling)</span>
              <span className="text-white">${costs.thc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Muellaje</span>
              <span className="text-white">${costs.wharfage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gate-in/Gate-out</span>
              <span className="text-white">${costs.gate_in_out}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inspección Aduanera</span>
              <span className="text-white">${costs.inspection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Documentación</span>
              <span className="text-white">${costs.documentation}</span>
            </div>
            {isRefrigerated && (
              <div className="flex justify-between text-cyan-400">
                <span className="flex items-center gap-1">
                  <Snowflake className="w-3 h-3" /> Reefer (3 días)
                </span>
                <span>${port.reefer_surcharge_day * 3}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-700 font-medium">
              <span className="text-slate-300">Total</span>
              <span className="text-emerald-400">${totalWithReefer}</span>
            </div>
          </div>
        </div>

        {/* Zona Franca */}
        {port.has_free_zone && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <Warehouse className="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-amber-400">{port.free_zone_name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{port.free_zone_benefits}</div>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="text-xs text-slate-500 flex items-start gap-1.5">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {port.notes}
        </div>
      </CardContent>
    </Card>
  );
};

export default function PortCostsPanel({ token, originCountry, destinationCountry }) {
  const [origin, setOrigin] = useState(originCountry || '');
  const [destination, setDestination] = useState(destinationCountry || '');
  const [containerType, setContainerType] = useState('40ft');
  const [isRefrigerated, setIsRefrigerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const fetchRouteData = async () => {
    if (!origin || !destination) {
      toast.error('Selecciona país de origen y destino');
      return;
    }

    setLoading(true);
    try {
      const cargoType = isRefrigerated ? 'reefer' : 'general';
      const response = await axios.get(
        `${API_URL}/api/ports/route/${origin}/${destination}?cargo_type=${cargoType}`
      );
      setRouteData(response.data);
    } catch (error) {
      console.error('Error fetching port data:', error);
      toast.error('Error al obtener datos de puertos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      fetchRouteData();
    }
  }, [origin, destination, isRefrigerated]);

  const calculateTotalCosts = () => {
    if (!routeData) return null;
    
    const originPort = routeData.origin.recommended;
    const destPort = routeData.destination.recommended;
    
    if (!originPort || !destPort) return null;

    const originCosts = containerType === '20ft' ? originPort.costs_20ft : originPort.costs_40ft;
    const destCosts = containerType === '20ft' ? destPort.costs_20ft : destPort.costs_40ft;
    
    let total = originCosts.total_estimated + destCosts.total_estimated;
    
    if (isRefrigerated) {
      total += (originPort.reefer_surcharge_day * 2) + (destPort.reefer_surcharge_day * 3);
    }
    
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Ship className="w-5 h-5 text-cyan-400" />
            Análisis de Costos Portuarios
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Compara puertos, zonas francas y costos de tu ruta comercial
          </p>
        </div>
      </div>

      {/* Selectores */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">País Origen (Exportador)</label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {COUNTRIES_WITH_PORTS.map(c => (
                    <SelectItem key={c.code} value={c.code} className="text-white hover:bg-slate-800">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">País Destino (Importador)</label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {COUNTRIES_WITH_PORTS.map(c => (
                    <SelectItem key={c.code} value={c.code} className="text-white hover:bg-slate-800">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Contenedor</label>
              <Select value={containerType} onValueChange={setContainerType}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="20ft" className="text-white hover:bg-slate-800">20' Standard</SelectItem>
                  <SelectItem value="40ft" className="text-white hover:bg-slate-800">40' Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Tipo de Carga</label>
              <Select value={isRefrigerated ? 'reefer' : 'general'} onValueChange={(v) => setIsRefrigerated(v === 'reefer')}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="general" className="text-white hover:bg-slate-800">Carga General</SelectItem>
                  <SelectItem value="reefer" className="text-white hover:bg-slate-800">
                    <span className="flex items-center gap-1">
                      <Snowflake className="w-3 h-3" /> Refrigerada
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={fetchRouteData} 
                disabled={!origin || !destination || loading}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analizar Ruta'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {routeData && !loading && (
        <>
          {/* Resumen de Ruta */}
          <Card className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-cyan-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {COUNTRIES_WITH_PORTS.find(c => c.code === origin)?.name || origin}
                    </div>
                    <div className="text-xs text-slate-400">
                      {routeData.origin.recommended?.name || 'Sin puerto'}
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-cyan-400" />
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {COUNTRIES_WITH_PORTS.find(c => c.code === destination)?.name || destination}
                    </div>
                    <div className="text-xs text-slate-400">
                      {routeData.destination.recommended?.name || 'Sin puerto'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Costo Portuario Total ({containerType})</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${calculateTotalCosts()?.toLocaleString() || '---'}
                    <span className="text-sm font-normal text-slate-400 ml-1">USD</span>
                  </div>
                  {isRefrigerated && (
                    <div className="text-xs text-cyan-400 flex items-center gap-1 justify-end">
                      <Snowflake className="w-3 h-3" /> Incluye recargo refrigerado
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparativa de Puertos */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Puerto Origen */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Puerto de Origen (Exportación)
              </h3>
              {routeData.origin.available_ports?.length > 0 ? (
                <div className="space-y-3">
                  {routeData.origin.available_ports.map(port => (
                    <PortCard 
                      key={port.code} 
                      port={port} 
                      isRecommended={routeData.origin.recommended?.code === port.code}
                      containerType={containerType}
                      isRefrigerated={isRefrigerated}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-slate-400">No hay puertos disponibles para este país</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Puerto Destino */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Puerto de Destino (Importación)
              </h3>
              {routeData.destination.available_ports?.length > 0 ? (
                <div className="space-y-3">
                  {routeData.destination.available_ports.map(port => (
                    <PortCard 
                      key={port.code} 
                      port={port} 
                      isRecommended={routeData.destination.recommended?.code === port.code}
                      containerType={containerType}
                      isRefrigerated={isRefrigerated}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-slate-400">No hay puertos disponibles para este país</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Zonas Francas */}
          {(routeData.free_zones?.origin || routeData.free_zones?.destination) && (
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-400 flex items-center gap-2">
                  <Warehouse className="w-4 h-4" />
                  Zonas Francas Disponibles
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Beneficios fiscales y aduaneros en tu ruta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {routeData.origin.recommended?.has_free_zone && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="font-medium text-white mb-1">
                        {routeData.origin.recommended.free_zone_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {routeData.origin.recommended.free_zone_benefits}
                      </div>
                    </div>
                  )}
                  {routeData.destination.recommended?.has_free_zone && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="font-medium text-white mb-1">
                        {routeData.destination.recommended.free_zone_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {routeData.destination.recommended.free_zone_benefits}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nota informativa */}
          <div className="text-xs text-slate-500 flex items-start gap-2 bg-slate-800/30 rounded-lg p-3">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Nota:</strong> Los costos mostrados son estimaciones basadas en tarifas promedio de 2025-2026. 
              Los valores finales pueden variar según el agente de aduanas, temporada, tipo de mercancía y condiciones específicas. 
              No incluye flete marítimo, seguro de carga ni gastos de despacho de aduanas.
            </div>
          </div>
        </>
      )}

      {/* Estado inicial */}
      {!routeData && !loading && (
        <Card className="bg-slate-800/30 border-slate-700 border-dashed">
          <CardContent className="py-12 text-center">
            <Ship className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              Selecciona país de origen y destino para ver el análisis de costos portuarios
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
