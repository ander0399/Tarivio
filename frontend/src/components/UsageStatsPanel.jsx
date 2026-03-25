import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, Globe, Package, Users, Calendar,
  Loader2, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Componente de gráfico de barras simple usando CSS
const SimpleBarChart = ({ data, label, color = 'cyan' }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-4">Sin datos disponibles</p>;
  }

  const maxValue = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-2">
      {data.slice(0, 8).map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-20 text-xs text-gray-400 truncate" title={item.date || item.code || item.country}>
            {item.date || item.code || item.country}
          </div>
          <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${
                color === 'cyan' ? 'from-cyan-500 to-blue-500' :
                color === 'green' ? 'from-green-500 to-emerald-500' :
                color === 'purple' ? 'from-purple-500 to-pink-500' :
                'from-amber-500 to-orange-500'
              } transition-all duration-500`}
              style={{ width: `${(item.count / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-sm font-mono text-white">
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de top items (productos, países)
const TopItemsList = ({ items, type = 'product' }) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-4">Sin datos disponibles</p>;
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item, idx) => (
        <div 
          key={idx}
          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">
              {idx + 1}
            </span>
            <div>
              <p className="text-sm text-white font-medium">
                {type === 'product' ? item.code : item.country}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          <span className="text-cyan-400 font-mono text-sm">{item.count}</span>
        </div>
      ))}
    </div>
  );
};

export default function UsageStatsPanel({ token }) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, summaryRes] = await Promise.all([
        axios.get(`${API}/api/stats/usage?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/api/stats/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de período */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Panel de Estadísticas
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="daily">Últimos 30 días</option>
            <option value="weekly">Últimas 12 semanas</option>
            <option value="monthly">Últimos 12 meses</option>
            <option value="yearly">Este año</option>
          </select>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStats}
            className="text-gray-400 hover:text-cyan-400"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Este Mes</p>
                  <p className="text-2xl font-bold text-white">{summary.month_searches}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Clasificaciones
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Histórico</p>
                  <p className="text-2xl font-bold text-white">{summary.total_searches}</p>
                </div>
                <Package className="w-8 h-8 text-green-400 opacity-50" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Clasificaciones totales</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Códigos Únicos</p>
                  <p className="text-2xl font-bold text-white">{summary.unique_codes}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
              <p className="text-xs text-gray-400 mt-2">HS/TARIC diferentes</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Estudios</p>
                  <p className="text-2xl font-bold text-white">{summary.total_studies}</p>
                </div>
                <Users className="w-8 h-8 text-amber-400 opacity-50" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Estudios de mercado</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad por período */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Actividad por Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={stats.searches_timeline} 
                label="Clasificaciones"
                color="cyan"
              />
            </CardContent>
          </Card>

          {/* Top productos */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-green-400" />
                Productos Más Clasificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopItemsList items={stats.top_products} type="product" />
            </CardContent>
          </Card>

          {/* Países de origen */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Países de Origen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={stats.origin_countries} 
                label="Consultas"
                color="purple"
              />
            </CardContent>
          </Card>

          {/* Países de destino */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                Países de Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={stats.destination_countries} 
                label="Consultas"
                color="amber"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
