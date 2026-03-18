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
  Globe
} from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

export const MarketStudyPanel = ({ 
  productDescription, 
  taricCode, 
  originCountry, 
  destinationCountry,
  onGenerateStudy
}) => {
  const { t, language } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [study, setStudy] = useState(null);
  const [error, setError] = useState(null);

  const generateStudy = async () => {
    if (!productDescription || !originCountry || !destinationCountry) {
      setError("Se requiere producto, origen y destino para generar el estudio");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/market/study`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_description: productDescription,
          taric_code: taricCode,
          origin_country: originCountry,
          destination_country: destinationCountry,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error("Error al generar el estudio de mercado");
      }

      const result = await response.json();
      setStudy(result);

      if (onGenerateStudy) {
        onGenerateStudy(result);
      }
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!study) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Helper function to add text with word wrap
    const addText = (text, size = 10, isBold = false, color = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentWidth);
      
      // Check if we need a new page
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
    doc.text("ESTUDIO DE MERCADO", margin, 25);
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text(`${study.product_name} | ${study.origin_country} → ${study.destination_country}`, margin, 35);
    
    yPos = 55;

    // Executive Summary
    doc.setTextColor(0, 212, 255);
    addText("RESUMEN EJECUTIVO", 14, true, [0, 212, 255]);
    addText(study.executive_summary, 10, false, [60, 60, 60]);
    yPos += 5;

    // PESTEL Analysis
    addText("ANÁLISIS PESTEL", 14, true, [0, 212, 255]);
    yPos += 3;

    const pestelItems = [
      { key: "political", label: "POLÍTICO", icon: "🏛️" },
      { key: "economic", label: "ECONÓMICO", icon: "💰" },
      { key: "social", label: "SOCIAL", icon: "👥" },
      { key: "technological", label: "TECNOLÓGICO", icon: "🔧" },
      { key: "environmental", label: "AMBIENTAL", icon: "🌱" },
      { key: "legal", label: "LEGAL", icon: "⚖️" }
    ];

    for (const item of pestelItems) {
      if (study.pestel[item.key]) {
        addText(`${item.icon} ${item.label}`, 11, true, [30, 30, 30]);
        addText(study.pestel[item.key], 10, false, [60, 60, 60]);
        yPos += 3;
      }
    }

    // Market Size
    if (study.market_size) {
      addText("TAMAÑO DEL MERCADO", 14, true, [0, 212, 255]);
      addText(study.market_size.description, 10, false, [60, 60, 60]);
      if (study.market_size.value) {
        addText(`Valor estimado: ${study.market_size.value}`, 10, true, [30, 30, 30]);
      }
      if (study.market_size.growth_rate) {
        addText(`Tasa de crecimiento: ${study.market_size.growth_rate}`, 10, false, [60, 60, 60]);
      }
      yPos += 3;
    }

    // Competition
    if (study.competitors && study.competitors.length > 0) {
      addText("ANÁLISIS DE COMPETENCIA", 14, true, [0, 212, 255]);
      study.competitors.forEach((comp, i) => {
        addText(`${i + 1}. ${comp.name}`, 11, true, [30, 30, 30]);
        if (comp.description) addText(comp.description, 10, false, [60, 60, 60]);
        if (comp.market_share) addText(`Cuota de mercado: ${comp.market_share}`, 10, false, [60, 60, 60]);
      });
      yPos += 3;
    }

    // Trends
    if (study.trends && study.trends.length > 0) {
      addText("TENDENCIAS DEL MERCADO", 14, true, [0, 212, 255]);
      study.trends.forEach((trend, i) => {
        addText(`• ${trend}`, 10, false, [60, 60, 60]);
      });
      yPos += 3;
    }

    // SWOT
    if (study.opportunities || study.threats) {
      addText("OPORTUNIDADES Y AMENAZAS", 14, true, [0, 212, 255]);
      
      if (study.opportunities && study.opportunities.length > 0) {
        addText("Oportunidades:", 11, true, [0, 150, 0]);
        study.opportunities.forEach(opp => {
          addText(`✓ ${opp}`, 10, false, [60, 60, 60]);
        });
      }
      
      if (study.threats && study.threats.length > 0) {
        addText("Amenazas:", 11, true, [200, 0, 0]);
        study.threats.forEach(threat => {
          addText(`⚠ ${threat}`, 10, false, [60, 60, 60]);
        });
      }
      yPos += 3;
    }

    // Recommendations
    if (study.recommendations && study.recommendations.length > 0) {
      addText("RECOMENDACIONES ESTRATÉGICAS", 14, true, [0, 212, 255]);
      study.recommendations.forEach((rec, i) => {
        addText(`${i + 1}. ${rec}`, 10, false, [60, 60, 60]);
      });
    }

    // Footer
    const now = new Date();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado por TaricAI | ${now.toLocaleDateString()} | Este estudio es orientativo y no constituye asesoría comercial formal.`,
      margin,
      290
    );

    // Download
    const fileName = `Estudio_Mercado_${study.product_name?.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
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

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {generating && (
        <div className="text-center py-12">
          <div className="spinner-cyber mx-auto mb-4" />
          <p className="text-gray-400">{t("marketStudy.generating")}</p>
          <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos segundos...</p>
        </div>
      )}

      {/* Study Results */}
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
                  <PestelCard
                    icon={Building2}
                    title={t("marketStudy.political")}
                    content={study.pestel.political}
                    color="bg-blue-500/20 text-blue-400"
                  />
                )}
                {study.pestel?.economic && (
                  <PestelCard
                    icon={DollarSign}
                    title={t("marketStudy.economic")}
                    content={study.pestel.economic}
                    color="bg-green-500/20 text-green-400"
                  />
                )}
                {study.pestel?.social && (
                  <PestelCard
                    icon={Users}
                    title={t("marketStudy.social")}
                    content={study.pestel.social}
                    color="bg-purple-500/20 text-purple-400"
                  />
                )}
                {study.pestel?.technological && (
                  <PestelCard
                    icon={Cpu}
                    title={t("marketStudy.technological")}
                    content={study.pestel.technological}
                    color="bg-cyan-500/20 text-cyan-400"
                  />
                )}
                {study.pestel?.environmental && (
                  <PestelCard
                    icon={Leaf}
                    title={t("marketStudy.environmental")}
                    content={study.pestel.environmental}
                    color="bg-emerald-500/20 text-emerald-400"
                  />
                )}
                {study.pestel?.legal && (
                  <PestelCard
                    icon={Scale}
                    title={t("marketStudy.legal")}
                    content={study.pestel.legal}
                    color="bg-amber-500/20 text-amber-400"
                  />
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
                      <p className="text-xs text-gray-500 uppercase">Crecimiento anual</p>
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
                        <span className="text-green-400 mt-0.5">✓</span>
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
                        <span className="text-red-400 mt-0.5">⚠</span>
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

      {/* Empty State */}
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
