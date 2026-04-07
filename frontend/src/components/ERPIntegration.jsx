import React, { useState } from 'react';
import { 
  Plug, Server, Database, Code, Copy, Check, ExternalLink, 
  Key, Shield, Zap, FileJson, Globe, ArrowRight, Info,
  ChevronDown, ChevronUp, BookOpen, Terminal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Ejemplos de código para diferentes lenguajes
const CODE_EXAMPLES = {
  python: `import requests

# Configuración
API_URL = "${API_URL}/api"
API_KEY = "tu_api_key_aquí"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Clasificación de producto
def classify_product(description, origin, destination):
    response = requests.post(
        f"{API_URL}/taric/search",
        headers=headers,
        json={
            "description": description,
            "origin_country": origin,
            "destination_country": destination
        }
    )
    return response.json()

# Cálculo de costos de importación
def calculate_import_costs(hs_code, fob_value, weight, origin, destination):
    response = requests.post(
        f"{API_URL}/import-cost/calculate",
        headers=headers,
        json={
            "hs_code": hs_code,
            "fob_value": fob_value,
            "weight_kg": weight,
            "origin_country": origin,
            "destination_country": destination
        }
    )
    return response.json()

# Ejemplo de uso
result = classify_product(
    "Cacao en grano crudo",
    "VE",  # Venezuela
    "CO"   # Colombia
)
print(f"Código HS: {result['taric_code']}")`,

  javascript: `// Usando fetch o axios
const API_URL = '${API_URL}/api';
const API_KEY = 'tu_api_key_aquí';

const headers = {
  'Authorization': \`Bearer \${API_KEY}\`,
  'Content-Type': 'application/json'
};

// Clasificación de producto
async function classifyProduct(description, origin, destination) {
  const response = await fetch(\`\${API_URL}/taric/search\`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      description,
      origin_country: origin,
      destination_country: destination
    })
  });
  return response.json();
}

// Cálculo de costos de importación
async function calculateImportCosts(hsCode, fobValue, weight, origin, destination) {
  const response = await fetch(\`\${API_URL}/import-cost/calculate\`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      hs_code: hsCode,
      fob_value: fobValue,
      weight_kg: weight,
      origin_country: origin,
      destination_country: destination
    })
  });
  return response.json();
}

// Ejemplo de uso
const result = await classifyProduct('Cacao en grano crudo', 'VE', 'CO');
console.log(\`Código HS: \${result.taric_code}\`);`,

  csharp: `using System.Net.Http;
using System.Text;
using System.Text.Json;

public class TaricAIClient
{
    private readonly HttpClient _client;
    private readonly string _apiUrl = "${API_URL}/api";
    
    public TaricAIClient(string apiKey)
    {
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    }
    
    public async Task<ClassificationResult> ClassifyProduct(
        string description, string origin, string destination)
    {
        var content = new StringContent(
            JsonSerializer.Serialize(new {
                description,
                origin_country = origin,
                destination_country = destination
            }),
            Encoding.UTF8,
            "application/json"
        );
        
        var response = await _client.PostAsync(
            $"{_apiUrl}/taric/search", content);
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ClassificationResult>(json);
    }
}

// Uso en tu aplicación
var client = new TaricAIClient("tu_api_key");
var result = await client.ClassifyProduct("Cacao en grano", "VE", "CO");`,

  php: `<?php
$apiUrl = '${API_URL}/api';
$apiKey = 'tu_api_key_aquí';

function classifyProduct($description, $origin, $destination) {
    global $apiUrl, $apiKey;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$apiUrl/taric/search");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'description' => $description,
        'origin_country' => $origin,
        'destination_country' => $destination
    ]));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Ejemplo de uso
$result = classifyProduct('Cacao en grano crudo', 'VE', 'CO');
echo "Código HS: " . $result['taric_code'];
?>`,
};

// Endpoints disponibles
const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/taric/search',
    description: 'Clasificación arancelaria de productos',
    params: ['description', 'origin_country', 'destination_country', 'language'],
    response: 'Código HS, descripción oficial, aranceles, documentos'
  },
  {
    method: 'POST',
    path: '/api/import-cost/calculate',
    description: 'Calcula costos totales de importación',
    params: ['hs_code', 'fob_value', 'weight_kg', 'origin_country', 'destination_country'],
    response: 'Desglose de costos, aranceles, IVA, total'
  },
  {
    method: 'POST',
    path: '/api/chat/message',
    description: 'Chat conversacional con IA',
    params: ['message', 'session_id', 'origin_country', 'destination_country'],
    response: 'Respuesta de IA con fuentes oficiales'
  },
  {
    method: 'GET',
    path: '/api/countries/list',
    description: 'Lista de países disponibles',
    params: [],
    response: 'Array de países con códigos ISO'
  },
  {
    method: 'GET',
    path: '/api/country/{code}',
    description: 'Información detallada de un país',
    params: ['code'],
    response: 'Autoridades, aranceles, requisitos'
  },
  {
    method: 'GET',
    path: '/api/trade-agreements/list',
    description: 'Lista de tratados comerciales',
    params: [],
    response: 'Array de tratados con miembros'
  },
  {
    method: 'POST',
    path: '/api/trade/country-info',
    description: 'Información comercial entre países',
    params: ['origin_country', 'destination_country'],
    response: 'Tratados aplicables, aranceles preferenciales'
  },
];

// ERP compatibles
const COMPATIBLE_ERPS = [
  { name: 'SAP', logo: '🔷', description: 'SAP S/4HANA, SAP Business One' },
  { name: 'Oracle', logo: '🔴', description: 'Oracle ERP Cloud, NetSuite' },
  { name: 'Microsoft Dynamics', logo: '🟦', description: 'Dynamics 365, Business Central' },
  { name: 'Odoo', logo: '🟣', description: 'Odoo ERP (Open Source)' },
  { name: 'Sage', logo: '🟢', description: 'Sage X3, Sage 100' },
  { name: 'Zoho', logo: '🟡', description: 'Zoho Books, Zoho Inventory' },
  { name: 'Custom ERP', logo: '⚙️', description: 'Cualquier sistema con API REST' },
];

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 px-2"
        onClick={copyCode}
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </Button>
      <pre className="bg-slate-950 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const EndpointCard = ({ endpoint }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Badge className={
            endpoint.method === 'GET' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-blue-500/20 text-blue-400'
          }>
            {endpoint.method}
          </Badge>
          <code className="text-cyan-400 text-sm">{endpoint.path}</code>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {expanded && (
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <p className="text-gray-300 mb-3">{endpoint.description}</p>
          
          {endpoint.params.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Parámetros:</p>
              <div className="flex flex-wrap gap-2">
                {endpoint.params.map(param => (
                  <code key={param} className="text-xs bg-slate-800 px-2 py-1 rounded text-amber-400">
                    {param}
                  </code>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Respuesta:</p>
            <p className="text-sm text-gray-400">{endpoint.response}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ERPIntegration({ token, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  
  const generateApiKey = async () => {
    setGeneratingKey(true);
    // Simular generación de API key
    setTimeout(() => {
      const newKey = `taric_${btoa(Date.now().toString()).substring(0, 32)}`;
      setApiKey(newKey);
      setGeneratingKey(false);
      toast.success('API Key generada correctamente');
    }, 1500);
  };
  
  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copiada al portapapeles');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-slate-950 border-cyan-500/20">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Plug className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Integración con Sistemas ERP</CardTitle>
                <CardDescription>
                  Conecta TaricAI con tu sistema de gestión empresarial
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <span className="text-2xl">&times;</span>
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="h-[calc(90vh-100px)]">
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 bg-slate-900">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="api-key">API Key</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                <TabsTrigger value="examples">Ejemplos de Código</TabsTrigger>
                <TabsTrigger value="erps">ERPs Compatibles</TabsTrigger>
              </TabsList>
              
              {/* TAB: RESUMEN */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-8 h-8 text-cyan-400" />
                        <h3 className="font-semibold text-white">API REST</h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        API RESTful completa para integración con cualquier sistema
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-green-400" />
                        <h3 className="font-semibold text-white">Seguridad</h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Autenticación JWT, HTTPS, rate limiting
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-8 h-8 text-purple-400" />
                        <h3 className="font-semibold text-white">65+ Países</h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Datos actualizados de aduanas de todo el mundo
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20 mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      ¿Qué puedes hacer con la API?
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <FileJson className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          <strong className="text-white">Clasificación automática:</strong> Envía descripciones de productos y recibe códigos HS/TARIC
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          <strong className="text-white">Cálculo de costos:</strong> Obtén aranceles, IVA y costos totales de importación
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Server className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          <strong className="text-white">Sincronización:</strong> Integra con tu ERP para actualizar datos automáticamente
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          <strong className="text-white">Documentación:</strong> Genera checklists de documentos requeridos
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* TAB: API KEY */}
              <TabsContent value="api-key">
                <Card className="bg-slate-900 border-slate-800 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Key className="w-6 h-6 text-amber-400" />
                      <h3 className="text-lg font-semibold text-white">Tu API Key</h3>
                    </div>
                    
                    <div className="bg-slate-950 rounded-lg p-4 mb-4">
                      {apiKey ? (
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-cyan-400 font-mono text-sm">
                            {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? 'Ocultar' : 'Mostrar'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={copyApiKey}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">No tienes una API Key generada</p>
                      )}
                    </div>
                    
                    <Button 
                      onClick={generateApiKey}
                      disabled={generatingKey}
                      className="bg-gradient-to-r from-amber-500 to-orange-500"
                    >
                      {generatingKey ? 'Generando...' : apiKey ? 'Regenerar API Key' : 'Generar API Key'}
                    </Button>
                    
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                          Guarda tu API Key en un lugar seguro. No la compartas y no la incluyas en código del frontend.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Uso de la API Key</h3>
                    <p className="text-gray-400 mb-4">
                      Incluye tu API Key en el header de cada petición:
                    </p>
                    <CodeBlock 
                      code={`Authorization: Bearer ${apiKey || 'tu_api_key_aquí'}`}
                      language="text"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* TAB: ENDPOINTS */}
              <TabsContent value="endpoints">
                <div className="mb-4">
                  <p className="text-gray-400">
                    Base URL: <code className="text-cyan-400">{API_URL}/api</code>
                  </p>
                </div>
                
                <div className="space-y-2">
                  {API_ENDPOINTS.map((endpoint, idx) => (
                    <EndpointCard key={idx} endpoint={endpoint} />
                  ))}
                </div>
              </TabsContent>
              
              {/* TAB: EJEMPLOS DE CÓDIGO */}
              <TabsContent value="examples">
                <Tabs defaultValue="python" className="w-full">
                  <TabsList className="mb-4 bg-slate-900">
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="csharp">C#</TabsTrigger>
                    <TabsTrigger value="php">PHP</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="python">
                    <CodeBlock code={CODE_EXAMPLES.python} language="python" />
                  </TabsContent>
                  
                  <TabsContent value="javascript">
                    <CodeBlock code={CODE_EXAMPLES.javascript} language="javascript" />
                  </TabsContent>
                  
                  <TabsContent value="csharp">
                    <CodeBlock code={CODE_EXAMPLES.csharp} language="csharp" />
                  </TabsContent>
                  
                  <TabsContent value="php">
                    <CodeBlock code={CODE_EXAMPLES.php} language="php" />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              {/* TAB: ERPs COMPATIBLES */}
              <TabsContent value="erps">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMPATIBLE_ERPS.map((erp, idx) => (
                    <Card key={idx} className="bg-slate-900 border-slate-800 hover:border-cyan-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{erp.logo}</span>
                          <div>
                            <h3 className="font-semibold text-white">{erp.name}</h3>
                            <p className="text-sm text-gray-400">{erp.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Card className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Terminal className="w-8 h-8 text-purple-400 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          ¿Necesitas ayuda con la integración?
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Nuestro equipo técnico puede ayudarte a integrar TaricAI con tu sistema ERP específico.
                        </p>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                          Contactar Soporte Técnico
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
