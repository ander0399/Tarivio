import { useState } from "react";
import { 
  TrendingUp, 
  Download, 
  Loader2, 
  Building2, 
  DollarSign, 
  Users, 
  Cpu, 
  Leaf, 
  Scale,
  BarChart3,
  Target,
  AlertTriangle,
  Lightbulb,
  FileText,
  Globe,
  RefreshCw
} from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export const MarketStudyPanel = ({ 
  productDescription, 
  taricCode, 
  originCountry, 
  destinationCountry,
  onGenerateStudy
}) => {
  const { t, language } = useLanguage();
  const { token } = useAuth(); // Get token from context
  const [generating, setGenerating] = useState(false);
  const [study, setStudy] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const generateStudy = async () => {
    if (!productDescription || !originCountry || !destinationCountry) {
      setError("Se requiere producto, origen y destino para generar el estudio");
      return;
    }

    // Check token
    if (!token) {
      setError("Sesión expirada. Por favor recarga la página e inicia sesión de nuevo.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await axios({
        method: 'POST',
        url: `${API}/api/market/study`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          product_description: productDescription,
          taric_code: taricCode,
          origin_country: originCountry,
          destination_country: destinationCountry,
          language: language
        },
        timeout: 180000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor recarga la página e inicia sesión de nuevo.");
      }

      if (response.status >= 400) {
        const errorMsg = response.data?.detail || response.data?.message || "Error del servidor";
        throw new Error(errorMsg);
      }

      if (!response.data?.executive_summary && !response.data?.pestel) {
        console.error("Invalid market study response:", response.data);
        throw new Error("El estudio no contiene datos válidos. Intenta de nuevo.");
      }

      setStudy(response.data);
      setRetryCount(0);

      if (onGenerateStudy) {
        onGenerateStudy(response.data);
      }
    } catch (err) {
      console.error("Market study error:", err);
      
      let errorMessage = "Error al generar el estudio de mercado.";
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = "La generación tardó demasiado. Intenta de nuevo.";
      } else if (err.message?.includes('Network Error')) {
        errorMessage = "Error de conexión. Verifica tu internet.";
      } else if (err.response?.status === 401 || err.message?.includes('Sesión expirada')) {
        errorMessage = "Sesión expirada. Por favor recarga la página e inicia sesión de nuevo.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setGenerating(false);
    }
  };

  const handleRetry = () => {
    generateStudy();
  };

  const downloadPDF = () => {
    if (!study) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Language-specific labels
    const labels = {
      es: {
        title: "ESTUDIO DE MERCADO",
        executive: "RESUMEN EJECUTIVO",
        pestel: "ANALISIS PESTEL",
        political: "POLITICO",
        economic: "ECONOMICO",
        social: "SOCIAL",
        technological: "TECNOLOGICO",
        environmental: "AMBIENTAL",
        legal: "LEGAL",
        marketSize: "TAMANO DEL MERCADO",
        estimatedValue: "Valor estimado",
        growthRate: "Tasa de crecimiento",
        competitors: "ANALISIS DE COMPETENCIA",
        marketShare: "Cuota de mercado",
        trends: "TENDENCIAS DEL MERCADO",
        opportunities: "OPORTUNIDADES",
        threats: "AMENAZAS",
        recommendations: "RECOMENDACIONES ESTRATEGICAS",
        footer: "Generado por TaricAI - Este estudio es orientativo"
      },
      en: {
        title: "MARKET STUDY",
        executive: "EXECUTIVE SUMMARY",
        pestel: "PESTEL ANALYSIS",
        political: "POLITICAL",
        economic: "ECONOMIC",
        social: "SOCIAL",
        technological: "TECHNOLOGICAL",
        environmental: "ENVIRONMENTAL",
        legal: "LEGAL",
        marketSize: "MARKET SIZE",
        estimatedValue: "Estimated value",
        growthRate: "Growth rate",
        competitors: "COMPETITION ANALYSIS",
        marketShare: "Market share",
        trends: "MARKET TRENDS",
        opportunities: "OPPORTUNITIES",
        threats: "THREATS",
        recommendations: "STRATEGIC RECOMMENDATIONS",
        footer: "Generated by TaricAI - This study is indicative"
      },
      pt: {
        title: "ESTUDO DE MERCADO",
        executive: "RESUMO EXECUTIVO",
        pestel: "ANALISE PESTEL",
        political: "POLITICO",
        economic: "ECONOMICO",
        social: "SOCIAL",
        technological: "TECNOLOGICO",
        environmental: "AMBIENTAL",
        legal: "LEGAL",
        marketSize: "TAMANHO DO MERCADO",
        estimatedValue: "Valor estimado",
        growthRate: "Taxa de crescimento",
        competitors: "ANALISE DA CONCORRENCIA",
        marketShare: "Participacao de mercado",
        trends: "TENDENCIAS DO MERCADO",
        opportunities: "OPORTUNIDADES",
        threats: "AMEACAS",
        recommendations: "RECOMENDACOES ESTRATEGICAS",
        footer: "Gerado por TaricAI - Este estudo e indicativo"
      },
      fr: {
        title: "ETUDE DE MARCHE",
        executive: "RESUME EXECUTIF",
        pestel: "ANALYSE PESTEL",
        political: "POLITIQUE",
        economic: "ECONOMIQUE",
        social: "SOCIAL",
        technological: "TECHNOLOGIQUE",
        environmental: "ENVIRONNEMENTAL",
        legal: "LEGAL",
        marketSize: "TAILLE DU MARCHE",
        estimatedValue: "Valeur estimee",
        growthRate: "Taux de croissance",
        competitors: "ANALYSE DE LA CONCURRENCE",
        marketShare: "Part de marche",
        trends: "TENDANCES DU MARCHE",
        opportunities: "OPPORTUNITES",
        threats: "MENACES",
        recommendations: "RECOMMANDATIONS STRATEGIQUES",
        footer: "Genere par TaricAI - Cette etude est indicative"
      },
      de: {
        title: "MARKTSTUDIE",
        executive: "ZUSAMMENFASSUNG",
        pestel: "PESTEL-ANALYSE",
        political: "POLITISCH",
        economic: "WIRTSCHAFTLICH",
        social: "SOZIAL",
        technological: "TECHNOLOGISCH",
        environmental: "UMWELT",
        legal: "RECHTLICH",
        marketSize: "MARKTGROSSE",
        estimatedValue: "Geschatzter Wert",
        growthRate: "Wachstumsrate",
        competitors: "WETTBEWERBSANALYSE",
        marketShare: "Marktanteil",
        trends: "MARKTTRENDS",
        opportunities: "CHANCEN",
        threats: "RISIKEN",
        recommendations: "STRATEGISCHE EMPFEHLUNGEN",
        footer: "Erstellt von TaricAI - Diese Studie ist indikativ"
      }
    };

    const l = labels[language] || labels.es;

    const addText = (text, size = 10, isBold = false, color = [0, 0, 0]) => {
      if (!text) return;
      doc.setFontSize(size);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text), contentWidth);
      
      if (yPos + (lines.length * size * 0.4) > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(lines, margin, yPos);
      yPos += lines.length * size * 0.4 + 5;
    };

    // Title
    doc.setFillColor(13, 20, 36);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(0, 212, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(l.title, margin, 25);
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text(`${study.product_name || ''} | ${study.origin_country || ''} -> ${study.destination_country || ''}`, margin, 35);
    
    yPos = 55;

    // Executive Summary
    addText(l.executive, 14, true, [0, 212, 255]);
    addText(study.executive_summary, 10, false, [60, 60, 60]);
    yPos += 5;

    // PESTEL Analysis
    addText(l.pestel, 14, true, [0, 212, 255]);
    yPos += 3;

    if (study.pestel) {
      const pestelItems = [
        { key: "political", label: l.political },
        { key: "economic", label: l.economic },
        { key: "social", label: l.social },
        { key: "technological", label: l.technological },
        { key: "environmental", label: l.environmental },
        { key: "legal", label: l.legal }
      ];

      for (const item of pestelItems) {
        if (study.pestel[item.key]) {
          addText(`[${item.key[0].toUpperCase()}] ${item.label}`, 11, true, [30, 30, 30]);
          addText(study.pestel[item.key], 10, false, [60, 60, 60]);
          yPos += 2;
        }
      }
    }

    // Market Size
    if (study.market_size) {
      addText(l.marketSize, 14, true, [0, 212, 255]);
      addText(study.market_size.description, 10, false, [60, 60, 60]);
      if (study.market_size.value) {
        addText(`${l.estimatedValue}: ${study.market_size.value}`, 10, true, [30, 30, 30]);
      }
      if (study.market_size.growth_rate) {
        addText(`${l.growthRate}: ${study.market_size.growth_rate}`, 10, false, [60, 60, 60]);
      }
      yPos += 3;
    }

    // Competition
    if (study.competitors && study.competitors.length > 0) {
      addText(l.competitors, 14, true, [0, 212, 255]);
      study.competitors.forEach((comp, i) => {
        addText(`${i + 1}. ${comp.name}`, 11, true, [30, 30, 30]);
        if (comp.description) addText(comp.description, 10, false, [60, 60, 60]);
        if (comp.market_share) addText(`${l.marketShare}: ${comp.market_share}`, 10, false, [60, 60, 60]);
      });
      yPos += 3;
    }

    // Trends
    if (study.trends && study.trends.length > 0) {
      addText(l.trends, 14, true, [0, 212, 255]);
      study.trends.forEach((trend) => {
        addText(`- ${trend}`, 10, false, [60, 60, 60]);
      });
      yPos += 3;
    }

    // Opportunities
    if (study.opportunities && study.opportunities.length > 0) {
      addText(l.opportunities, 11, true, [0, 150, 0]);
      study.opportunities.forEach(opp => {
        addText(`+ ${opp}`, 10, false, [60, 60, 60]);
      });
    }
    
    // Threats
    if (study.threats && study.threats.length > 0) {
      addText(l.threats, 11, true, [200, 0, 0]);
      study.threats.forEach(threat => {
        addText(`- ${threat}`, 10, false, [60, 60, 60]);
      });
      yPos += 3;
    }

    // Recommendations
    if (study.recommendations && study.recommendations.length > 0) {
      addText(l.recommendations, 14, true, [0, 212, 255]);
      study.recommendations.forEach((rec, i) => {
        addText(`${i + 1}. ${rec}`, 10, false, [60, 60, 60]);
      });
    }

    // Footer
    const now = new Date();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${l.footer} | ${now.toLocaleDateString()}`, margin, 290);

    // Download
    const fileName = `${l.title.replace(/\s+/g, '_')}_${(study.product_name || 'producto').replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const PestelCard = ({ icon: Icon, title, content, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a0f1a] rounded-lg p-4 border border-cyan-500/10"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{content}</p>
    </motion.div>
  );

  return (
    <div className="cyber-card p-6" data-testid="market-study-panel">
      <div className="flex items-center justify-between mb-6">
        <h3 className="label-cyber flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {t("marketStudy.title")}
        </h3>
        {!study && (
          <Button
            type="button"
            className="btn-cyber h-10 px-4 text-sm"
            onClick={generateStudy}
            disabled={generating || !productDescription}
            data-testid="generate-study-btn"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("marketStudy.generating")}
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                {t("marketStudy.generate")}
              </>
            )}
          </Button>
        )}
        {study && (
          <Button
            type="button"
            className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 h-10 px-4 text-sm"
            onClick={downloadPDF}
            data-testid="download-study-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("marketStudy.download")}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
          <p className="text-red-400 text-sm mb-2">{error}</p>
          {retryCount < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleRetry}
              disabled={generating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar ({3 - retryCount} intentos restantes)
            </Button>
          )}
        </div>
      )}

      {generating && (
        <div className="text-center py-12">
          <div className="spinner-cyber mx-auto mb-4" />
          <p className="text-gray-400">{t("marketStudy.generating")}</p>
          <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos segundos...</p>
        </div>
      )}

      <AnimatePresence>
        {study && !generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-400 p-4 rounded-r-lg">
              <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("marketStudy.executive")}
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{study.executive_summary}</p>
            </div>

            {/* PESTEL Analysis */}
            <div>
              <h4 className="label-cyber mb-4">{t("marketStudy.pestel")}</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {study.pestel?.political && (
                  <PestelCard icon={Building2} title={t("marketStudy.political")} content={study.pestel.political} color="bg-blue-500/20 text-blue-400" />
                )}
                {study.pestel?.economic && (
                  <PestelCard icon={DollarSign} title={t("marketStudy.economic")} content={study.pestel.economic} color="bg-green-500/20 text-green-400" />
                )}
                {study.pestel?.social && (
                  <PestelCard icon={Users} title={t("marketStudy.social")} content={study.pestel.social} color="bg-purple-500/20 text-purple-400" />
                )}
                {study.pestel?.technological && (
                  <PestelCard icon={Cpu} title={t("marketStudy.technological")} content={study.pestel.technological} color="bg-cyan-500/20 text-cyan-400" />
                )}
                {study.pestel?.environmental && (
                  <PestelCard icon={Leaf} title={t("marketStudy.environmental")} content={study.pestel.environmental} color="bg-emerald-500/20 text-emerald-400" />
                )}
                {study.pestel?.legal && (
                  <PestelCard icon={Scale} title={t("marketStudy.legal")} content={study.pestel.legal} color="bg-amber-500/20 text-amber-400" />
                )}
              </div>
            </div>

            {/* Market Size */}
            {study.market_size && (
              <div className="bg-[#0a0f1a] rounded-lg p-4 border border-cyan-500/10">
                <h4 className="label-cyber mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t("marketStudy.marketSize")}
                </h4>
                <p className="text-gray-300 text-sm mb-3">{study.market_size.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  {study.market_size.value && (
                    <div className="bg-[#0d1424] p-3 rounded">
                      <p className="text-xs text-gray-500 uppercase">Valor estimado</p>
                      <p className="text-lg font-bold text-cyan-400">{study.market_size.value}</p>
                    </div>
                  )}
                  {study.market_size.growth_rate && (
                    <div className="bg-[#0d1424] p-3 rounded">
                      <p className="text-xs text-gray-500 uppercase">Crecimiento</p>
                      <p className="text-lg font-bold text-green-400">{study.market_size.growth_rate}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Competitors */}
            {study.competitors && study.competitors.length > 0 && (
              <div>
                <h4 className="label-cyber mb-3">{t("marketStudy.competitors")}</h4>
                <div className="space-y-2">
                  {study.competitors.map((comp, i) => (
                    <div key={i} className="bg-[#0a0f1a] rounded-lg p-3 border border-cyan-500/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{comp.name}</p>
                          <p className="text-gray-400 text-sm">{comp.description}</p>
                        </div>
                        {comp.market_share && (
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                            {comp.market_share}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities & Threats */}
            <div className="grid md:grid-cols-2 gap-4">
              {study.opportunities && study.opportunities.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t("marketStudy.opportunities")}
                  </h4>
                  <ul className="space-y-2">
                    {study.opportunities.map((opp, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">+</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {study.threats && study.threats.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t("marketStudy.threats")}
                  </h4>
                  <ul className="space-y-2">
                    {study.threats.map((threat, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">-</span>
                        {threat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {study.recommendations && study.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-400 p-4 rounded-r-lg">
                <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {t("marketStudy.recommendations")}
                </h4>
                <ol className="space-y-2">
                  {study.recommendations.map((rec, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-3">
                      <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {i + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Download Reminder */}
            <div className="text-center pt-4 border-t border-cyan-500/10">
              <Button
                type="button"
                className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 h-12 px-8"
                onClick={downloadPDF}
              >
                <Download className="w-5 h-5 mr-2" />
                {t("marketStudy.download")}
              </Button>
              <p className="text-gray-500 text-xs mt-3">
                El estudio se descargará en formato PDF profesional
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!study && !generating && (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            Genera un estudio de mercado profesional con análisis PESTEL
          </p>
          <p className="text-gray-600 text-sm">
            Incluye tamaño de mercado, competencia, tendencias y recomendaciones estratégicas
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketStudyPanel;
