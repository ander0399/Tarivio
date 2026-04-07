import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle, 
  AlertTriangle, Download, Package, Trash2, Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { exportHistoryToExcel } from '../utils/excelExport';

const API = process.env.REACT_APP_BACKEND_URL;

// Componente para agregar productos manualmente
const ProductForm = ({ onAdd, disabled }) => {
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('ES');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Ingresa una descripción del producto');
      return;
    }
    onAdd({
      description: description.trim(),
      origin_country: origin.toUpperCase() || undefined,
      destination_country: destination.toUpperCase() || 'ES'
    });
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción del producto..."
        className="flex-1 min-w-[200px] bg-slate-800 border-slate-700 text-white"
        disabled={disabled}
      />
      <Input
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder="Origen (ej: CN)"
        className="w-24 bg-slate-800 border-slate-700 text-white"
        disabled={disabled}
      />
      <Input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Destino"
        className="w-24 bg-slate-800 border-slate-700 text-white"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !description.trim()}
        className="bg-cyan-500 hover:bg-cyan-600"
      >
        <Plus className="w-4 h-4 mr-1" />
        Agregar
      </Button>
    </form>
  );
};

// Componente de resultado de clasificación
const ClassificationResult = ({ result, index }) => {
  const isSuccess = result.status === 'success';
  const isPartial = result.status === 'partial';
  const isError = result.status === 'error';

  return (
    <div className={`p-4 rounded-lg border ${
      isSuccess ? 'bg-green-500/10 border-green-500/30' :
      isPartial ? 'bg-amber-500/10 border-amber-500/30' :
      'bg-red-500/10 border-red-500/30'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-green-500/20 text-green-400' :
            isPartial ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {isSuccess ? <CheckCircle className="w-4 h-4" /> :
             isPartial ? <AlertTriangle className="w-4 h-4" /> :
             <XCircle className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-sm text-white font-medium">
              {result.product_description || `Producto ${index + 1}`}
            </p>
            {isSuccess && (
              <div className="mt-1">
                <span className="text-cyan-400 font-mono text-lg">{result.taric_code}</span>
                {result.taric_description && (
                  <p className="text-xs text-gray-400 mt-1">{result.taric_description}</p>
                )}
                {result.confidence && (
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                    result.confidence === 'Alta' ? 'bg-green-500/20 text-green-400' :
                    result.confidence === 'Media' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Confianza: {result.confidence}
                  </span>
                )}
              </div>
            )}
            {isPartial && result.raw_response && (
              <p className="text-xs text-amber-400 mt-1">
                Respuesta parcial: {result.raw_response}
              </p>
            )}
            {isError && (
              <p className="text-xs text-red-400 mt-1">{result.error}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">#{index + 1}</span>
      </div>
    </div>
  );
};

export default function BatchClassificationPanel({ token }) {
  const [products, setProducts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addProduct = (product) => {
    if (products.length >= 50) {
      toast.error('Máximo 50 productos por lote');
      return;
    }
    setProducts(prev => [...prev, product]);
    toast.success('Producto agregado');
  };

  const removeProduct = (index) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setProducts([]);
    setResults(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo de archivo
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Solo se aceptan archivos CSV o TXT');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const newProducts = lines.slice(0, 50).map(line => {
        const parts = line.split(/[,;\t]/).map(p => p.trim());
        return {
          description: parts[0] || '',
          origin_country: parts[1] || undefined,
          destination_country: parts[2] || 'ES'
        };
      }).filter(p => p.description);

      if (newProducts.length === 0) {
        toast.error('No se encontraron productos válidos en el archivo');
        return;
      }

      setProducts(prev => [...prev, ...newProducts].slice(0, 50));
      toast.success(`${newProducts.length} productos cargados`);
    } catch (error) {
      toast.error('Error al leer el archivo');
    }
  };

  const processProducts = async () => {
    if (products.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    setProcessing(true);
    setProgress({ current: 0, total: products.length });
    setResults(null);

    try {
      const response = await axios.post(
        `${API}/api/taric/batch-classify`,
        { products, notify_on_complete: false },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 300000 // 5 minutos timeout
        }
      );

      setResults(response.data);
      toast.success(`Clasificación completada: ${response.data.successful} exitosos, ${response.data.failed} fallidos`);
    } catch (error) {
      console.error('Batch classification error:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar el lote');
    } finally {
      setProcessing(false);
    }
  };

  const exportResults = () => {
    if (!results?.results) return;

    const exportData = results.results.map((r, idx) => ({
      id: idx + 1,
      product_description: r.product_description || '',
      taric_code: r.taric_code || '',
      status: r.status,
      confidence: r.confidence || '',
      error: r.error || '',
      created_at: new Date().toISOString()
    }));

    exportHistoryToExcel(exportData, 'TaricAI_Batch_Results');
    toast.success('Resultados exportados a Excel');
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
          Clasificación por Lotes
        </CardTitle>
        <CardDescription className="text-gray-400">
          Clasifica múltiples productos de una vez (máximo 50 por lote)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulario para agregar productos */}
        <ProductForm onAdd={addProduct} disabled={processing} />

        {/* Carga de archivo */}
        <div className="mb-6">
          <label 
            htmlFor="batch-file" 
            className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              processing 
                ? 'border-slate-700 bg-slate-800/50 cursor-not-allowed' 
                : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Cargar archivo CSV/TXT (descripción, origen, destino)
            </span>
            <input
              id="batch-file"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={processing}
            />
          </label>
        </div>

        {/* Lista de productos a procesar */}
        {products.length > 0 && !results && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">
                Productos a clasificar ({products.length}/50)
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-red-400 hover:text-red-300"
                disabled={processing}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpiar todo
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-white">{product.description}</p>
                      <p className="text-xs text-gray-500">
                        {product.origin_country || '?'} → {product.destination_country || 'ES'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(idx)}
                    className="h-8 w-8 text-gray-400 hover:text-red-400"
                    disabled={processing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de procesar */}
        {products.length > 0 && !results && (
          <Button
            onClick={processProducts}
            disabled={processing}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando {progress.current}/{progress.total}...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Clasificar {products.length} Productos
              </>
            )}
          </Button>
        )}

        {/* Resultados */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  {results.successful} exitosos
                </span>
                {results.failed > 0 && (
                  <span className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    {results.failed} fallidos
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportResults}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Exportar Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="border-slate-600 text-gray-400"
                >
                  Nueva Clasificación
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.results.map((result, idx) => (
                <ClassificationResult key={idx} result={result} index={idx} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
