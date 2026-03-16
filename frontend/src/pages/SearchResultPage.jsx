import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import {
  Container,
  ArrowLeft,
  Loader2,
  Globe,
  ChevronRight,
  AlertCircle,
  User,
  LogOut
} from "lucide-react";
import TaricCodeDisplay from "../components/TaricCodeDisplay";
import DutyCalculatorCard from "../components/DutyCalculatorCard";
import DocumentChecklist from "../components/DocumentChecklist";

export default function SearchResultPage() {
  const { id } = useParams();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(`${API}/taric/result/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (error) {
      toast.error("No se pudo cargar el resultado");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-trade-blue" />
          <p className="text-slate-600 font-body">Cargando resultado...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <div className="w-10 h-10 bg-maritime rounded-sm flex items-center justify-center">
                <Container className="w-5 h-5 text-white" />
              </div>
            </Link>
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
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6 text-slate-600 hover:text-maritime"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          {/* Product Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-maritime mb-2">
              {result.product_description}
            </h1>
            {result.origin_country && (
              <p className="text-slate-500 font-body">
                País de origen: {result.origin_country}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {/* TARIC Code */}
            <Card className="border-slate-200 rounded-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-maritime">
                  Código TARIC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaricCodeDisplay 
                  code={result.taric_code}
                  chapter={result.chapter}
                  heading={result.heading}
                  subheading={result.subheading}
                  description={result.taric_description}
                />
              </CardContent>
            </Card>

            {/* AI Explanation */}
            {result.ai_explanation && (
              <Card className="border-slate-200 rounded-sm border-l-4 border-l-trade-blue">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-trade-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-semibold text-maritime mb-2">
                        Análisis de la IA
                      </h4>
                      <p className="text-slate-600 font-body text-sm leading-relaxed">
                        {result.ai_explanation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bento Grid */}
            <div className="bento-grid">
              {/* Duties */}
              <div className="bento-item-wide">
                <DutyCalculatorCard 
                  tariffs={result.tariffs}
                  totalEstimate={result.total_duty_estimate}
                  vatRate={result.vat_rate}
                />
              </div>

              {/* Documents */}
              <div>
                <DocumentChecklist documents={result.documents} />
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
                    {result.official_sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-slate-50 rounded-sm hover:bg-slate-100 transition-colors group"
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
        </div>
      </main>
    </div>
  );
}
