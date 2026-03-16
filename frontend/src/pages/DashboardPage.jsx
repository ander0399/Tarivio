import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import {
  Search,
  Container,
  History,
  LogOut,
  User,
  Loader2,
  FileText,
  Trash2,
  Clock,
  Globe,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import TaricCodeDisplay from "../components/TaricCodeDisplay";
import DutyCalculatorCard from "../components/DutyCalculatorCard";
import DocumentChecklist from "../components/DocumentChecklist";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState("search");

  const countries = [
    { code: "", name: "Seleccionar país (opcional)" },
    { code: "CN", name: "China" },
    { code: "US", name: "Estados Unidos" },
    { code: "MX", name: "México" },
    { code: "BR", name: "Brasil" },
    { code: "IN", name: "India" },
    { code: "JP", name: "Japón" },
    { code: "KR", name: "Corea del Sur" },
    { code: "TW", name: "Taiwán" },
    { code: "VN", name: "Vietnam" },
    { code: "TH", name: "Tailandia" },
    { code: "TR", name: "Turquía" },
    { code: "GB", name: "Reino Unido" },
    { code: "OTHER", name: "Otro país" }
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/taric/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Por favor describe el producto que quieres clasificar");
      return;
    }

    setSearching(true);
    setSearchResult(null);
    
    try {
      const response = await axios.post(
        `${API}/taric/search`,
        {
          product_description: searchQuery,
          origin_country: originCountry || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSearchResult(response.data);
      fetchHistory(); // Refresh history
      toast.success("Análisis completado");
    } catch (error) {
      const message = error.response?.data?.detail || "Error al realizar la búsqueda";
      toast.error(message);
    } finally {
      setSearching(false);
    }
  };

  const loadFromHistory = async (resultId) => {
    try {
      const response = await axios.get(`${API}/taric/result/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResult(response.data);
      setSearchQuery(response.data.product_description);
      setOriginCountry(response.data.origin_country || "");
      setActiveTab("search");
    } catch (error) {
      toast.error("Error al cargar el resultado");
    }
  };

  const deleteFromHistory = async (resultId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/taric/history/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(item => item.id !== resultId));
      toast.success("Búsqueda eliminada");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-maritime rounded-sm flex items-center justify-center">
              <Container className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-maritime">TARIC AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4" />
              <span className="font-body text-sm hidden sm:inline">{user?.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={activeTab === "search" ? "default" : "outline"}
              onClick={() => setActiveTab("search")}
              className={`rounded-sm ${activeTab === "search" ? "bg-maritime" : ""}`}
              data-testid="tab-search"
            >
              <Search className="w-4 h-4 mr-2" />
              Nueva Búsqueda
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "outline"}
              onClick={() => setActiveTab("history")}
              className={`rounded-sm ${activeTab === "history" ? "bg-maritime" : ""}`}
              data-testid="tab-history"
            >
              <History className="w-4 h-4 mr-2" />
              Historial ({history.length})
            </Button>
          </div>

          {activeTab === "search" && (
            <div className="space-y-8">
              {/* Search Form */}
              <Card className="border-slate-200 rounded-sm shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="font-heading text-2xl text-maritime flex items-center gap-2">
                    <Search className="w-6 h-6 text-trade-blue" />
                    Clasificar Producto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descripción del producto
                      </label>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej: Manzanas frescas de Chile, Camisetas de algodón 100%, Teléfonos móviles Samsung..."
                        className="search-input-main"
                        data-testid="search-input"
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          País de origen (opcional)
                        </label>
                        <Select value={originCountry} onValueChange={setOriginCountry}>
                          <SelectTrigger className="h-12 rounded-sm" data-testid="country-select">
                            <SelectValue placeholder="Seleccionar país" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="submit"
                          className="btn-ai-gradient w-full h-12 rounded-sm"
                          disabled={searching}
                          data-testid="search-submit"
                        >
                          {searching ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Analizando con IA...
                            </>
                          ) : (
                            <>
                              <Search className="w-5 h-5 mr-2" />
                              Buscar en TARIC
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Search Result */}
              {searchResult && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* TARIC Code */}
                  <Card className="border-slate-200 rounded-sm">
                    <CardHeader>
                      <CardTitle className="font-heading text-xl text-maritime">
                        Código TARIC Sugerido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TaricCodeDisplay 
                        code={searchResult.taric_code}
                        chapter={searchResult.chapter}
                        heading={searchResult.heading}
                        subheading={searchResult.subheading}
                        description={searchResult.taric_description}
                      />
                    </CardContent>
                  </Card>

                  {/* AI Explanation */}
                  {searchResult.ai_explanation && (
                    <Card className="border-slate-200 rounded-sm border-l-4 border-l-trade-blue">
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <AlertCircle className="w-5 h-5 text-trade-blue flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-heading font-semibold text-maritime mb-2">
                              Análisis de la IA
                            </h4>
                            <p className="text-slate-600 font-body text-sm leading-relaxed">
                              {searchResult.ai_explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bento Grid for Results */}
                  <div className="bento-grid">
                    {/* Duties Card */}
                    <div className="bento-item-wide">
                      <DutyCalculatorCard 
                        tariffs={searchResult.tariffs}
                        totalEstimate={searchResult.total_duty_estimate}
                        vatRate={searchResult.vat_rate}
                      />
                    </div>

                    {/* Documents Card */}
                    <div>
                      <DocumentChecklist documents={searchResult.documents} />
                    </div>

                    {/* Official Sources */}
                    <div>
                      <Card className="border-slate-200 rounded-sm h-full">
                        <CardHeader>
                          <CardTitle className="font-heading text-lg text-maritime flex items-center gap-2">
                            <Globe className="w-5 h-5 text-trade-blue" />
                            Fuentes Oficiales
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {searchResult.official_sources.map((source, index) => (
                            <a
                              key={index}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 bg-slate-50 rounded-sm hover:bg-slate-100 transition-colors group"
                              data-testid={`source-link-${index}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-maritime text-sm">
                                  {source.name}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-trade-blue transition-colors" />
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {source.description}
                              </p>
                            </a>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <Card className="border-slate-200 rounded-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-maritime flex items-center gap-2">
                  <History className="w-5 h-5 text-trade-blue" />
                  Historial de Búsquedas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-trade-blue" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-body">
                      No tienes búsquedas anteriores
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("search")}
                      className="text-trade-blue mt-2"
                    >
                      Realizar primera búsqueda
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => loadFromHistory(item.id)}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-sm hover:bg-slate-100 cursor-pointer transition-colors group animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                        data-testid={`history-item-${index}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-maritime truncate">
                            {item.product_description}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-mono text-sm text-trade-blue">
                              {item.taric_code}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-trade-blue transition-colors" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteFromHistory(item.id, e)}
                            className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`delete-history-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
