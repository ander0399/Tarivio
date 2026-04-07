import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Bell,
  Shield,
  Settings,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Download,
  Plug,
  Map,
  Ship
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import TaricCodeDisplay from "../components/TaricCodeDisplay";
import DutyCalculatorCard from "../components/DutyCalculatorCard";
import DocumentChecklist from "../components/DocumentChecklist";
import ComplianceAlerts from "../components/ComplianceAlerts";
import RegulatoryAlertsPanel from "../components/RegulatoryAlertsPanel";
import TradeAgreementsPanel from "../components/TradeAgreementsPanel";
import LanguageSelector from "../components/LanguageSelector";
import ImageClassifier from "../components/ImageClassifier";
import MarketStudyPanel from "../components/MarketStudyPanel";
import CountrySearchSelect from "../components/CountrySearchSelect";
import ClarificationQuestions from "../components/ClarificationQuestions";
import InternationalChatPage from "./InternationalChatPage";
import WorldTradeMap from "../components/WorldTradeMap";
import ImportCostSimulator from "../components/ImportCostSimulator";
import ERPIntegration from "../components/ERPIntegration";
import UsageStatsPanel from "../components/UsageStatsPanel";
import BatchClassificationPanel from "../components/BatchClassificationPanel";
import AlertSubscriptionPanel from "../components/AlertSubscriptionPanel";
import PortCostsPanel from "../components/PortCostsPanel";
import { exportToExcel, exportHistoryToExcel } from "../utils/excelExport";
import { COUNTRIES, getCountriesByRegion, REGION_ORDER, getCountryByCode } from "../config/countries";
import { findApplicableAgreements } from "../config/tradeAgreements";
import { MessageSquare, Calculator } from "lucide-react";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("ES"); // Default to Spain
  const [clientReference, setClientReference] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [tradeAgreements, setTradeAgreements] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const [stats, setStats] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", name: "", role: "operator" });
  const [inviting, setInviting] = useState(false);
  const [regulatoryAlerts, setRegulatoryAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  
  // New state for clarification flow
  const [checkingClarification, setCheckingClarification] = useState(false);
  const [pendingClarification, setPendingClarification] = useState(null);
  const [clarificationAnswers, setClarificationAnswers] = useState({});
  
  // State for import cost simulator
  const [showCostSimulator, setShowCostSimulator] = useState(false);
  
  // State for ERP Integration modal
  const [showERPIntegration, setShowERPIntegration] = useState(false);

  // Group countries by region for better UX
  const countriesByRegion = getCountriesByRegion();

  const examples = [
    "Cacao en grano crudo de Venezuela",
    "Café verde arábica de Colombia",
    "Textiles de algodón de China",
    "Maquinaria industrial de Alemania"
  ];

  useEffect(() => {
    fetchHistory();
    fetchStats();
    fetchRegulatoryAlerts();
    if (user?.role === "admin") {
      fetchTeamMembers();
    }
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

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/team/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data);
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  };

  const fetchRegulatoryAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const response = await axios.get(`${API}/alerts/regulatory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegulatoryAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleSearch = async (e, skipClarification = false, clarifiedQuery = null) => {
    if (e) e.preventDefault();
    
    // Validate required fields
    if (!originCountry) {
      toast.error(t("messages.originRequired"));
      return;
    }
    
    if (!destinationCountry) {
      toast.error(t("messages.destinationRequired"));
      return;
    }
    
    const queryToUse = clarifiedQuery || searchQuery;
    
    if (!queryToUse.trim()) {
      toast.error(t("messages.productRequired"));
      return;
    }

    // Step 1: Check if clarification is needed (unless skipping)
    if (!skipClarification && !clarifiedQuery) {
      setCheckingClarification(true);
      try {
        const clarifyResponse = await axios.post(
          `${API}/taric/check-clarification`,
          { product_description: queryToUse },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (clarifyResponse.data.needs_clarification && clarifyResponse.data.clarification_questions?.length > 0) {
          // Store pending clarification and show questions
          setPendingClarification({
            questions: clarifyResponse.data.clarification_questions,
            originalQuery: queryToUse
          });
          setCheckingClarification(false);
          return; // Stop here, wait for user to answer questions
        }
      } catch (error) {
        console.error("Clarification check failed, proceeding with search:", error);
      }
      setCheckingClarification(false);
    }

    // Step 2: Perform the actual search
    setSearching(true);
    setSearchResult(null);
    setTradeAgreements([]);
    setPendingClarification(null);
    
    try {
      // Find applicable trade agreements
      const agreements = findApplicableAgreements(originCountry, destinationCountry);
      setTradeAgreements(agreements);
      
      const response = await axios.post(
        `${API}/taric/search`,
        {
          product_description: queryToUse,
          origin_country: originCountry,
          destination_country: destinationCountry,
          client_reference: clientReference || null,
          trade_agreements: agreements.map(a => a.name)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSearchResult(response.data);
      fetchHistory();
      fetchStats();
      toast.success(t("messages.searchSuccess"));
    } catch (error) {
      const detail = error.response?.data?.detail;
      const status = error.response?.status;
      if (detail === 'BUDGET_EXCEEDED' || status === 503) {
        if (!localStorage.getItem('taricai_budget_exceeded_at')) {
          localStorage.setItem('taricai_budget_exceeded_at', Date.now().toString());
        }
        const exceededAt = parseInt(localStorage.getItem('taricai_budget_exceeded_at'));
        const availableAt = new Date(exceededAt + 3600 * 1000);
        const hh = String(availableAt.getHours()).padStart(2, '0');
        const mm = String(availableAt.getMinutes()).padStart(2, '0');
        toast.error(`Servicio de IA temporalmente no disponible. Vuelve a las ${hh}:${mm}.`, { duration: 8000 });
      } else {
        toast.error(detail || t("messages.searchError"));
      }
    } finally {
      setSearching(false);
    }
  };

  // Handle clarification answers
  const handleClarificationAnswer = (clarifiedDescription) => {
    setSearchQuery(clarifiedDescription);
    setPendingClarification(null);
    // Trigger search with clarified description, skipping clarification check
    handleSearch(null, true, clarifiedDescription);
  };

  const handleSkipClarification = () => {
    setPendingClarification(null);
    // Proceed with original search, skipping clarification
    handleSearch(null, true, searchQuery);
  };

  const loadFromHistory = async (resultId) => {
    try {
      const response = await axios.get(`${API}/taric/result/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResult(response.data);
      setSearchQuery(response.data.product_description);
      setOriginCountry(response.data.origin_country || "");
      setDestinationCountry(response.data.destination_country || "ES");
      setClientReference(response.data.client_reference || "");
      
      // Recalculate trade agreements
      if (response.data.origin_country && response.data.destination_country) {
        const agreements = findApplicableAgreements(
          response.data.origin_country, 
          response.data.destination_country
        );
        setTradeAgreements(agreements);
      }
      
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
      fetchStats();
      toast.success("Búsqueda eliminada");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleInviteMember = async () => {
    if (!inviteData.email || !inviteData.name) {
      toast.error("Completa todos los campos");
      return;
    }

    setInviting(true);
    try {
      await axios.post(
        `${API}/team/invite`,
        inviteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Invitación enviada a ${inviteData.email}`);
      setShowInviteDialog(false);
      setInviteData({ email: "", name: "", role: "operator" });
      fetchTeamMembers();
    } catch (error) {
      const message = error.response?.data?.detail || "Error al invitar";
      toast.error(message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`${API}/team/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Miembro eliminado");
      fetchTeamMembers();
    } catch (error) {
      toast.error("Error al eliminar miembro");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle product identification from image
  const handleProductFromImage = (description) => {
    setSearchQuery(description);
    // Scroll to search form
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(t("imageClassifier.identifiedProduct"));
  };

  const setExampleSearch = (example) => {
    setSearchQuery(example);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] grid-bg">
      {/* Header */}
      <header className="glass-dark fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0d1424] border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <Container className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="font-heading font-bold text-xl block">
                Taric<span className="text-cyan-400">AI</span>
              </span>
              {user?.company && (
                <span className="text-xs text-gray-500">{user.company}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="hidden md:flex items-center gap-2 text-gray-400 bg-[#0d1424] px-3 py-2 rounded-lg border border-cyan-500/10">
              <User className="w-4 h-4" />
              <span className="text-sm">{user?.name}</span>
              <span className="text-xs text-cyan-400 uppercase">{user?.role}</span>
            </div>
            <RegulatoryAlertsPanel 
              alerts={regulatoryAlerts} 
              onRefresh={fetchRegulatoryAlerts}
              loading={loadingAlerts}
            />
            <div className="flex items-center gap-2">
              <div className="status-dot" />
              <span className="text-xs text-green-400 uppercase tracking-wider hidden sm:inline">{t("dashboard.operational")}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
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
          {/* Stats Cards */}
          {stats && (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="cyber-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span className="label-cyber text-[10px]">{t("dashboard.thisMonth")}</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{stats.searches_this_month}</div>
                <div className="text-xs text-gray-500">{t("dashboard.classifications")}</div>
              </div>
              <div className="cyber-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="label-cyber text-[10px]">{t("dashboard.total")}</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{stats.total_searches}</div>
                <div className="text-xs text-gray-500">{t("dashboard.historicalSearches")}</div>
              </div>
              <div className="cyber-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="label-cyber text-[10px]">{t("dashboard.teamMembers")}</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{stats.team_members}</div>
                <div className="text-xs text-gray-500">{t("dashboard.activeMembers")}</div>
              </div>
              <div className="cyber-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span className="label-cyber text-[10px]">{t("dashboard.compliance")}</span>
                </div>
                <div className="text-2xl font-bold text-green-400 font-mono">{t("dashboard.ok")}</div>
                <div className="text-xs text-gray-500">{t("dashboard.noCriticalAlerts")}</div>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "search" 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
              }`}
              data-testid="tab-search"
            >
              <Zap className="w-4 h-4" />
              {t("dashboard.search")}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "chat" 
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-blue-500/30"
              }`}
              data-testid="tab-chat"
            >
              <MessageSquare className="w-4 h-4" />
              Asistente IA
              <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">PRO</span>
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "map" 
                  ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-emerald-500/30"
              }`}
              data-testid="tab-map"
            >
              <Map className="w-4 h-4" />
              Mapa Global
              <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full">NUEVO</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "history" 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
              }`}
              data-testid="tab-history"
            >
              <History className="w-4 h-4" />
              {t("dashboard.history")} ({history.length})
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => setActiveTab("team")}
                className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === "team" 
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                    : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
                }`}
                data-testid="tab-team"
              >
                <Users className="w-4 h-4" />
                {t("dashboard.team")} ({teamMembers.length})
              </button>
            )}
            {/* Nuevos tabs */}
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "stats" 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
              }`}
              data-testid="tab-stats"
            >
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "batch" 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
              }`}
              data-testid="tab-batch"
            >
              <FileText className="w-4 h-4" />
              Lotes
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "alerts" 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
              }`}
              data-testid="tab-alerts"
            >
              <Bell className="w-4 h-4" />
              Alertas
            </button>
            <button
              onClick={() => setActiveTab("ports")}
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "ports" 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                  : "bg-[#0d1424] text-gray-400 border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/30"
              }`}
              data-testid="tab-ports"
            >
              <Ship className="w-4 h-4" />
              Puertos
            </button>
          </div>

          {/* Map Tab - World Trade Map */}
          {activeTab === "map" && (
            <div className="space-y-6">
              <WorldTradeMap 
                token={token}
                onSelectOrigin={(country) => {
                  // El código ya viene del objeto country
                  const countryCode = Object.entries(COUNTRIES).find(([code, c]) => c.name === country.name)?.[0] || country.code;
                  if (countryCode) setOriginCountry(countryCode);
                  setActiveTab("chat");
                  toast.success(`País de origen seleccionado: ${country.name}`);
                }}
                onSelectDestination={(country) => {
                  const countryCode = Object.entries(COUNTRIES).find(([code, c]) => c.name === country.name)?.[0] || country.code;
                  if (countryCode) setDestinationCountry(countryCode);
                  setActiveTab("chat");
                  toast.success(`País de destino seleccionado: ${country.name}`);
                }}
              />
            </div>
          )}

          {/* Chat Tab - International Assistant */}
          {activeTab === "chat" && (
            <InternationalChatPage token={token} />
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-8">
              {/* Image Classifier Section */}
              <ImageClassifier 
                onUseForClassification={handleProductFromImage}
              />

              {/* Search Form */}
              <motion.div 
                className="cyber-card p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Search className="w-6 h-6 text-cyan-400" />
                    {t("dashboard.classifier")}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{t("dashboard.status")}</span>
                    <div className="status-dot" />
                    <span className="text-xs text-green-400 uppercase font-semibold">{t("dashboard.operational")}</span>
                  </div>
                </div>
                
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("dashboard.classifierDesc")}
                      className="input-cyber min-h-[120px] resize-none pr-16"
                      data-testid="search-input"
                    />
                    <button
                      type="submit"
                      disabled={searching}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                      data-testid="search-submit-icon"
                    >
                      {searching ? (
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-cyan-400 rotate-[-45deg]" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-500 text-sm mr-2 uppercase tracking-wider">Ejemplos:</span>
                    {examples.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setExampleSearch(example)}
                        className="example-tag"
                        data-testid={`example-${index}`}
                      >
                        {example.length > 35 ? example.slice(0, 35) + "..." : example}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-cyan-500/10">
                    {/* Origin Country - REQUIRED with search */}
                    <CountrySearchSelect
                      value={originCountry}
                      onChange={setOriginCountry}
                      label={t("dashboard.origin")}
                      placeholder={t("dashboard.selectCountry")}
                      required={true}
                      error={!originCountry}
                      testId="origin-country-select"
                    />
                    
                    {/* Destination Country - REQUIRED with search */}
                    <CountrySearchSelect
                      value={destinationCountry}
                      onChange={setDestinationCountry}
                      label={t("dashboard.destination")}
                      placeholder={t("dashboard.selectCountry")}
                      required={true}
                      error={!destinationCountry}
                      testId="destination-country-select"
                    />
                  </div>

                  {/* Second row: Reference and Submit */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-cyber block mb-2">
                        {t("dashboard.clientReference")}
                      </label>
                      <input
                        type="text"
                        value={clientReference}
                        onChange={(e) => setClientReference(e.target.value)}
                        placeholder="Ej: OP-2024-001"
                        className="input-cyber h-12"
                        data-testid="client-reference"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        className="btn-cyber w-full h-12"
                        disabled={searching || checkingClarification || !originCountry || !destinationCountry}
                        data-testid="search-submit"
                      >
                        {checkingClarification ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : searching ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t("dashboard.analyzing")}
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            {t("dashboard.classify")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </motion.div>

              {/* Clarification Questions - Show BEFORE search results */}
              {pendingClarification && (
                <ClarificationQuestions
                  questions={pendingClarification.questions}
                  productDescription={pendingClarification.originalQuery}
                  onAnswer={handleClarificationAnswer}
                  onSkip={handleSkipClarification}
                />
              )}

              {/* Search Result */}
              {searchResult && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Header with confidence and route info */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-xl font-bold">{t("results.title")}</h3>
                    <div className="flex items-center gap-4">
                      {/* Route indicator */}
                      {originCountry && destinationCountry && (
                        <div className="flex items-center gap-2 bg-[#0d1424] px-3 py-2 rounded-lg border border-cyan-500/20">
                          <span className="text-sm">{getCountryByCode(originCountry)?.flag}</span>
                          <span className="text-gray-400 text-sm">{getCountryByCode(originCountry)?.name}</span>
                          <ArrowRight className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm">{getCountryByCode(destinationCountry)?.flag}</span>
                          <span className="text-gray-400 text-sm">{getCountryByCode(destinationCountry)?.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase">{t("results.confidence")}</span>
                        <span className="text-cyan-400 font-mono font-bold">{searchResult.ai_confidence}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Alerts (if any) */}
                  {searchResult.compliance_alerts && searchResult.compliance_alerts.length > 0 && (
                    <ComplianceAlerts alerts={searchResult.compliance_alerts} />
                  )}

                  {/* Trade Agreements Panel - NEW */}
                  <TradeAgreementsPanel 
                    agreements={tradeAgreements}
                    originCountry={originCountry}
                    destinationCountry={destinationCountry}
                  />

                  {/* TARIC Code */}
                  <div className="cyber-card p-6">
                    <h3 className="label-cyber mb-4">{t("results.taricCode")}</h3>
                    <TaricCodeDisplay 
                      code={searchResult.taric_code}
                      chapter={searchResult.chapter}
                      heading={searchResult.heading}
                      subheading={searchResult.subheading}
                      description={searchResult.taric_description}
                    />
                  </div>

                  {/* AI Explanation */}
                  {searchResult.ai_explanation && (
                    <div className="cyber-card p-6 border-l-4 border-l-cyan-400">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="label-cyber mb-2">{t("results.analysis")}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {searchResult.ai_explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bento Grid */}
                  <div className="bento-grid">
                    {/* Duties */}
                    <div className="bento-wide">
                      <DutyCalculatorCard 
                        tariffs={searchResult.tariffs}
                        totalEstimate={searchResult.total_duty_estimate}
                        vatRate={searchResult.vat_rate}
                        preferentialDuties={searchResult.preferential_duties}
                      />
                    </div>

                    {/* Documents */}
                    <div>
                      <DocumentChecklist documents={searchResult.documents} />
                    </div>

                    {/* Official Sources */}
                    <div className="cyber-card p-6">
                      <h3 className="label-cyber mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t("results.sources")}
                      </h3>
                      <div className="space-y-3">
                        {(searchResult.official_sources || []).map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-[#0a0f1a] rounded-lg border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/50 transition-colors group"
                            data-testid={`source-link-${index}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {source.name}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                            </div>
                            <p className="text-xs text-cyan-400 mt-1">
                              {source.authority}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Market Study Panel */}
                  <MarketStudyPanel 
                    productDescription={searchResult.product_description}
                    taricCode={searchResult.taric_code}
                    originCountry={originCountry}
                    destinationCountry={destinationCountry}
                    token={token}
                  />
                  
                  {/* Import Cost Simulator Button */}
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowCostSimulator(true)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-4 text-lg"
                      data-testid="open-cost-simulator"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calcular Costos de Importación
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Simula aranceles, IVA y costos totales para tu operación
                    </p>
                  </div>
                  
                  {/* Import Cost Simulator Modal */}
                  {showCostSimulator && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                      <div className="max-h-[90vh] overflow-y-auto">
                        <ImportCostSimulator
                          token={token}
                          hsCode={searchResult.taric_code}
                          productDescription={searchResult.product_description}
                          originCountry={originCountry}
                          destinationCountry={destinationCountry}
                          onClose={() => setShowCostSimulator(false)}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Botones de Exportación y ERP */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Botón Exportar a Excel */}
                    <Button
                      onClick={() => {
                        try {
                          const exportData = {
                            productDescription: searchResult.product_description,
                            hsCode: searchResult.taric_code,
                            originCountry: getCountryByCode(originCountry)?.name || originCountry,
                            destinationCountry: getCountryByCode(destinationCountry)?.name || destinationCountry,
                            sources: searchResult.official_sources,
                            costBreakdown: {
                              valor_fob: 10000,
                              flete_estimado: 1000,
                              seguro_estimado: 100,
                              arancel_porcentaje: parseFloat(searchResult.tariffs?.[0]?.rate?.replace('%', '') || '5'),
                              iva_porcentaje: parseFloat(searchResult.vat_rate?.replace('%', '') || '21'),
                              otros_costos: {
                                agente_aduanal: 150,
                                almacenaje_estimado: 100,
                                documentacion: 50
                              }
                            },
                            documents: searchResult.documents,
                            tradeAgreements: tradeAgreements,
                            countryInfo: getCountryByCode(destinationCountry)
                          };
                          exportToExcel(exportData, `TaricAI_${searchResult.taric_code}`);
                          toast.success('Archivo Excel exportado correctamente con fórmulas');
                        } catch (err) {
                          console.error('Error exporting:', err);
                          toast.error('Error al exportar a Excel');
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4"
                      data-testid="export-excel-btn"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Exportar a Excel (con fórmulas)
                    </Button>
                    
                    {/* Botón Integración ERP */}
                    <Button
                      onClick={() => setShowERPIntegration(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4"
                      data-testid="open-erp-integration"
                    >
                      <Plug className="w-5 h-5 mr-2" />
                      Integración con ERP
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Exporta resultados con fórmulas visibles o conecta con tu sistema de gestión
                  </p>
                  
                  {/* ERP Integration Modal */}
                  {showERPIntegration && (
                    <ERPIntegration 
                      token={token}
                      onClose={() => setShowERPIntegration(false)}
                    />
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <motion.div 
              className="cyber-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="label-cyber flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historial de Clasificaciones
                </h3>
                {history.length > 0 && (
                  <Button
                    onClick={() => {
                      try {
                        exportHistoryToExcel(history, 'TaricAI_Historial');
                        toast.success('Historial exportado a Excel');
                      } catch (err) {
                        toast.error('Error al exportar historial');
                      }
                    }}
                    className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 h-10 px-4 text-sm"
                    data-testid="export-history-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Historial
                  </Button>
                )}
              </div>
              
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner-cyber" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No hay clasificaciones anteriores</p>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("search")}
                    className="text-cyan-400 mt-2"
                  >
                    Realizar primera clasificación
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      onClick={() => loadFromHistory(item.id)}
                      className="flex items-center justify-between p-4 bg-[#0a0f1a] rounded-lg border border-[rgba(0,212,255,0.1)] hover:border-cyan-500/50 cursor-pointer transition-all group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      data-testid={`history-item-${index}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="font-mono text-sm text-cyan-400">{item.taric_code}</span>
                          {item.client_reference && (
                            <span className="text-xs text-gray-500 bg-[#0d1424] px-2 py-0.5 rounded">
                              {item.client_reference}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString('es-ES')}
                          </span>
                          {item.user_name && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              {item.user_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteFromHistory(item.id, e)}
                          className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          data-testid={`delete-history-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && user?.role === "admin" && (
            <motion.div 
              className="cyber-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="label-cyber flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Gestión del Equipo
                </h3>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button className="btn-cyber h-10 px-4 text-sm" data-testid="invite-member-btn">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invitar Miembro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0d1424] border-cyan-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-white">Invitar nuevo miembro</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Añade un nuevo usuario a tu organización
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="label-cyber">Nombre</Label>
                        <Input
                          value={inviteData.name}
                          onChange={(e) => setInviteData(prev => ({ ...prev, name: e.target.value }))}
                          className="input-cyber mt-2"
                          placeholder="Nombre completo"
                          data-testid="invite-name"
                        />
                      </div>
                      <div>
                        <Label className="label-cyber">Email</Label>
                        <Input
                          type="email"
                          value={inviteData.email}
                          onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                          className="input-cyber mt-2"
                          placeholder="email@empresa.com"
                          data-testid="invite-email"
                        />
                      </div>
                      <div>
                        <Label className="label-cyber">Rol</Label>
                        <Select value={inviteData.role} onValueChange={(val) => setInviteData(prev => ({ ...prev, role: val }))}>
                          <SelectTrigger className="input-cyber mt-2" data-testid="invite-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d1424] border-cyan-500/30">
                            <SelectItem value="admin" className="text-white">Admin - Acceso total</SelectItem>
                            <SelectItem value="operator" className="text-white">Operador - Clasificaciones</SelectItem>
                            <SelectItem value="viewer" className="text-white">Consultor - Solo lectura</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="btn-cyber w-full"
                        onClick={handleInviteMember}
                        disabled={inviting}
                        data-testid="send-invite"
                      >
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Enviar Invitación
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-[#0a0f1a] rounded-lg border border-[rgba(0,212,255,0.1)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    data-testid={`team-member-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs uppercase px-2 py-1 rounded ${
                        member.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' :
                        member.role === 'operator' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {member.role}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <div className={`w-2 h-2 rounded-full ${member.member_status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`} />
                        {member.member_status}
                      </span>
                      {member.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-500 hover:text-red-400"
                          data-testid={`remove-member-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats Tab - Usage Statistics Dashboard */}
          {activeTab === "stats" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cyber-card p-6"
            >
              <UsageStatsPanel token={token} />
            </motion.div>
          )}

          {/* Batch Tab - Batch Classification */}
          {activeTab === "batch" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BatchClassificationPanel token={token} />
            </motion.div>
          )}

          {/* Alerts Tab - Alert Subscriptions */}
          {activeTab === "alerts" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertSubscriptionPanel token={token} />
            </motion.div>
          )}

          {/* Ports Tab - Port Costs Analysis */}
          {activeTab === "ports" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PortCostsPanel 
                token={token} 
                originCountry={originCountry}
                destinationCountry={destinationCountry}
              />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
