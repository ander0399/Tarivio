import React, { useState } from 'react';
import axios from 'axios';
import { 
  Calculator, 
  DollarSign, 
  Package, 
  Truck, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Info,
  Globe,
  Scale,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const INCOTERMS = [
  { value: 'EXW', label: 'EXW - Ex Works', description: 'El comprador asume todos los costos desde fábrica' },
  { value: 'FOB', label: 'FOB - Free On Board', description: 'El vendedor entrega en el puerto de origen' },
  { value: 'FCA', label: 'FCA - Free Carrier', description: 'El vendedor entrega al transportista' },
  { value: 'CFR', label: 'CFR - Cost and Freight', description: 'El vendedor paga el flete hasta destino' },
  { value: 'CIF', label: 'CIF - Cost, Insurance & Freight', description: 'El vendedor paga flete y seguro' },
  { value: 'CIP', label: 'CIP - Carriage and Insurance Paid', description: 'Similar a CIF para cualquier transporte' },
  { value: 'DAP', label: 'DAP - Delivered at Place', description: 'Entregado en lugar de destino' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid', description: 'Entregado con impuestos pagados' },
];

const UNITS = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'litros', label: 'Litros' },
  { value: 'metros', label: 'Metros' },
  { value: 'pares', label: 'Pares' },
  { value: 'docenas', label: 'Docenas' },
  { value: 'cajas', label: 'Cajas' },
  { value: 'contenedores', label: 'Contenedores' },
];

export default function ImportCostSimulator({ 
  token, 
  hsCode, 
  productDescription, 
  originCountry, 
  destinationCountry,
  onClose 
}) {
  const [formData, setFormData] = useState({
    hs_code: hsCode || '',
    product_description: productDescription || '',
    origin_country: originCountry || '',
    destination_country: destinationCountry || '',
    fob_value: '',
    weight_kg: '',
    quantity: '1',
    unit: 'unidades',
    incoterm: 'FOB',
    freight_cost: '',
    insurance_cost: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1); // 1: Datos básicos, 2: Detalles, 3: Resultados

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCosts = async () => {
    if (!formData.fob_value || !formData.weight_kg) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/import-cost/calculate`,
        {
          ...formData,
          fob_value: parseFloat(formData.fob_value),
          weight_kg: parseFloat(formData.weight_kg),
          quantity: parseInt(formData.quantity),
          freight_cost: formData.freight_cost ? parseFloat(formData.freight_cost) : null,
          insurance_cost: formData.insurance_cost ? parseFloat(formData.insurance_cost) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setResult(response.data);
      setStep(3);
    } catch (error) {
      console.error('Error calculating costs:', error);
      toast.error('Error al calcular los costos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currency = 'USD') => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Producto a Importar</h3>
        </div>
        <p className="text-sm text-gray-300">{formData.product_description || 'Sin descripción'}</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{formData.hs_code || 'Sin código HS'}</Badge>
          <Badge variant="outline">{formData.origin_country} → {formData.destination_country}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fob_value" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Valor FOB (USD) *
          </Label>
          <Input
            id="fob_value"
            type="number"
            placeholder="10000.00"
            value={formData.fob_value}
            onChange={(e) => handleChange('fob_value', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
          <p className="text-xs text-gray-500">Valor en puerto de origen, sin flete ni seguro</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight_kg" className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            Peso Bruto (kg) *
          </Label>
          <Input
            id="weight_kg"
            type="number"
            placeholder="1000"
            value={formData.weight_kg}
            onChange={(e) => handleChange('weight_kg', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
          <p className="text-xs text-gray-500">Peso total incluyendo embalaje</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidad de Medida</Label>
          <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue placeholder="Seleccionar unidad" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={() => setStep(2)} 
        className="w-full"
        disabled={!formData.fob_value || !formData.weight_kg}
      >
        Continuar
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="incoterm" className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            Incoterm de la Operación
          </Label>
          <Select value={formData.incoterm} onValueChange={(value) => handleChange('incoterm', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue placeholder="Seleccionar Incoterm" />
            </SelectTrigger>
            <SelectContent>
              {INCOTERMS.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  <div className="flex flex-col">
                    <span>{term.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {INCOTERMS.find(t => t.value === formData.incoterm)?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="freight_cost">
              Costo del Flete (USD) - Opcional
            </Label>
            <Input
              id="freight_cost"
              type="number"
              placeholder="Si lo conoces..."
              value={formData.freight_cost}
              onChange={(e) => handleChange('freight_cost', e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
            <p className="text-xs text-gray-500">Déjalo vacío para estimarlo automáticamente</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance_cost">
              Costo del Seguro (USD) - Opcional
            </Label>
            <Input
              id="insurance_cost"
              type="number"
              placeholder="Si lo conoces..."
              value={formData.insurance_cost}
              onChange={(e) => handleChange('insurance_cost', e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
            <p className="text-xs text-gray-500">Déjalo vacío para estimarlo automáticamente</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-200 font-medium">Información importante</p>
            <p className="text-xs text-amber-200/70 mt-1">
              Los cálculos son estimaciones basadas en información oficial. Para valores exactos, 
              consulta con un agente aduanal certificado en el país de destino.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Atrás
        </Button>
        <Button 
          onClick={calculateCosts} 
          className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Costos
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (!result) return null;
    
    const breakdown = result.breakdown || {};
    
    return (
      <div className="space-y-6">
        {/* Resumen Principal */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Costo Total de Importación</h3>
            {result.summary?.has_fta && (
              <Badge className="bg-emerald-500">Con TLC</Badge>
            )}
          </div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">
            {formatCurrency(breakdown.costo_total_importacion || 0)}
          </div>
          <p className="text-sm text-gray-400">
            {result.summary?.origin} → {result.summary?.destination}
          </p>
          
          {result.summary?.trade_agreements?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.summary.trade_agreements.map((agreement, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {agreement}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Desglose de Costos */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              Desglose de Costos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-gray-400">Valor FOB</span>
                <span className="text-white font-medium">{formatCurrency(breakdown.valor_fob)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-gray-400">Flete Internacional</span>
                <span className="text-white font-medium">{formatCurrency(breakdown.flete_estimado)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-gray-400">Seguro</span>
                <span className="text-white font-medium">{formatCurrency(breakdown.seguro_estimado)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800 bg-slate-800/50 px-2 rounded">
                <span className="text-cyan-400 font-medium">Valor CIF</span>
                <span className="text-cyan-400 font-medium">{formatCurrency(breakdown.valor_cif)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-gray-400">Arancel ({breakdown.arancel_porcentaje}%)</span>
                <span className="text-amber-400 font-medium">{formatCurrency(breakdown.arancel_monto)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-gray-400">IVA ({breakdown.iva_porcentaje}%)</span>
                <span className="text-amber-400 font-medium">{formatCurrency(breakdown.iva_monto)}</span>
              </div>
              
              {breakdown.otros_costos && (
                <>
                  <div className="text-sm text-gray-500 mt-2">Otros costos estimados:</div>
                  {Object.entries(breakdown.otros_costos).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 pl-4">
                      <span className="text-gray-500 text-sm">{key.replace(/_/g, ' ')}</span>
                      <span className="text-gray-400 text-sm">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </>
              )}
              
              <div className="flex justify-between py-3 mt-2 bg-emerald-500/10 px-3 rounded-lg">
                <span className="text-emerald-400 font-bold">TOTAL</span>
                <span className="text-emerald-400 font-bold text-xl">{formatCurrency(breakdown.costo_total_importacion)}</span>
              </div>
              
              {breakdown.precio_unitario_final && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-400">Precio unitario final</span>
                  <span className="text-white">{formatCurrency(breakdown.precio_unitario_final)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documentos Requeridos */}
        {result.documents_required?.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Documentos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.documents_required.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Advertencias */}
        {result.warnings?.length > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Consideraciones Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-200">{warning}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Fuentes */}
        {result.sources?.length > 0 && (
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs text-gray-500 mb-2">Fuentes oficiales:</p>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-800 px-2 py-1 rounded"
                >
                  <ExternalLink className="w-3 h-3" />
                  {source.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Nueva Simulación
          </Button>
          {onClose && (
            <Button onClick={onClose} className="flex-1">
              Cerrar
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-slate-950 border-cyan-500/20 shadow-2xl max-w-2xl mx-auto">
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-white">Simulador de Costos de Importación</CardTitle>
            <CardDescription>
              Calcula aranceles, impuestos y costos totales de tu operación
            </CardDescription>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-cyan-500' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
          <span>Mercancía</span>
          <span>Transporte</span>
          <span>Resultados</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </CardContent>
    </Card>
  );
}
