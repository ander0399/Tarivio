import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "./ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export const ExportPDF = ({ result }) => {
  const [exporting, setExporting] = useState(false);

  const generatePDF = async () => {
    if (!result) return;
    
    setExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Header
      doc.setFillColor(10, 15, 26);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(0, 212, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("TaricAI", 20, 25);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Clasificación Arancelaria Inteligente", 20, 32);
      
      yPos = 50;
      
      // Date and reference
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Fecha: ${new Date(result.created_at).toLocaleDateString('es-ES', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })}`, 20, yPos);
      
      if (result.client_reference) {
        doc.text(`Referencia: ${result.client_reference}`, pageWidth - 20 - doc.getTextWidth(`Referencia: ${result.client_reference}`), yPos);
      }
      
      yPos += 15;
      
      // Product description
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("PRODUCTO CLASIFICADO", 20, yPos);
      yPos += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const productLines = doc.splitTextToSize(result.product_description, pageWidth - 40);
      doc.text(productLines, 20, yPos);
      yPos += productLines.length * 5 + 5;
      
      if (result.origin_country) {
        doc.setTextColor(100, 100, 100);
        doc.text(`País de origen: ${result.origin_country}`, 20, yPos);
        yPos += 10;
      }
      
      // TARIC Code Section
      yPos += 5;
      doc.setFillColor(0, 212, 255);
      doc.rect(20, yPos, pageWidth - 40, 25, 'F');
      
      doc.setTextColor(10, 15, 26);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CÓDIGO TARIC", 25, yPos + 8);
      
      doc.setFontSize(18);
      doc.text(result.taric_code, 25, yPos + 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Confianza: ${result.ai_confidence}`, pageWidth - 25 - doc.getTextWidth(`Confianza: ${result.ai_confidence}`), yPos + 15);
      
      yPos += 35;
      
      // Description
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(result.taric_description, pageWidth - 40);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 5 + 10;
      
      // Code breakdown
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Capítulo: ${result.chapter} | Partida: ${result.heading} | Subpartida: ${result.subheading}`, 20, yPos);
      yPos += 15;
      
      // Tariffs Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("ARANCELES Y TRIBUTOS", 20, yPos);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      if (result.tariffs && result.tariffs.length > 0) {
        result.tariffs.forEach((tariff) => {
          doc.setTextColor(0, 0, 0);
          doc.text(`${tariff.duty_type}:`, 20, yPos);
          doc.setTextColor(0, 150, 200);
          doc.text(tariff.rate, pageWidth - 20 - doc.getTextWidth(tariff.rate), yPos);
          yPos += 5;
          
          if (tariff.description) {
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(8);
            doc.text(tariff.description, 25, yPos);
            yPos += 5;
          }
          doc.setFontSize(9);
        });
      }
      
      // Total estimate
      yPos += 5;
      doc.setFillColor(10, 15, 26);
      doc.rect(20, yPos - 3, pageWidth - 40, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("ESTIMACIÓN TOTAL:", 25, yPos + 4);
      doc.setTextColor(0, 212, 255);
      doc.text(result.total_duty_estimate, pageWidth - 25 - doc.getTextWidth(result.total_duty_estimate), yPos + 4);
      
      yPos += 20;
      
      // Preferential duties if available
      if (result.preferential_duties) {
        doc.setTextColor(0, 150, 0);
        doc.setFontSize(9);
        doc.text(`✓ Arancel preferencial disponible: ${result.preferential_duties}`, 20, yPos);
        yPos += 10;
      }
      
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      // Documents Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("DOCUMENTACIÓN REQUERIDA", 20, yPos);
      yPos += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      if (result.documents && result.documents.length > 0) {
        const requiredDocs = result.documents.filter(d => d.required);
        const optionalDocs = result.documents.filter(d => !d.required);
        
        if (requiredDocs.length > 0) {
          doc.setTextColor(200, 0, 0);
          doc.text("Obligatorios:", 20, yPos);
          yPos += 5;
          
          requiredDocs.forEach((doc_item) => {
            doc.setTextColor(0, 0, 0);
            doc.text(`• ${doc_item.name}`, 25, yPos);
            yPos += 4;
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            const docDesc = doc.splitTextToSize(doc_item.description, pageWidth - 50);
            doc.text(docDesc, 30, yPos);
            yPos += docDesc.length * 4 + 2;
            doc.setFontSize(9);
          });
        }
        
        if (optionalDocs.length > 0) {
          yPos += 3;
          doc.setTextColor(100, 100, 100);
          doc.text("Opcionales / Según caso:", 20, yPos);
          yPos += 5;
          
          optionalDocs.forEach((doc_item) => {
            doc.setTextColor(0, 0, 0);
            doc.text(`• ${doc_item.name}`, 25, yPos);
            yPos += 5;
          });
        }
      }
      
      yPos += 10;
      
      // Compliance Alerts
      if (result.compliance_alerts && result.compliance_alerts.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setTextColor(200, 100, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("⚠ ALERTAS DE COMPLIANCE", 20, yPos);
        yPos += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        result.compliance_alerts.forEach((alert) => {
          const alertColor = alert.severity === 'high' ? [200, 0, 0] : 
                            alert.severity === 'medium' ? [200, 100, 0] : [0, 150, 200];
          doc.setTextColor(...alertColor);
          doc.text(`[${alert.severity.toUpperCase()}] ${alert.type}:`, 20, yPos);
          yPos += 5;
          
          doc.setTextColor(0, 0, 0);
          const alertLines = doc.splitTextToSize(alert.message, pageWidth - 45);
          doc.text(alertLines, 25, yPos);
          yPos += alertLines.length * 4 + 5;
        });
      }
      
      // Footer with official sources
      const footerY = doc.internal.pageSize.getHeight() - 25;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text("Fuentes oficiales consultadas: TARIC UE (ec.europa.eu) | AEAT (agenciatributaria.es) | MAPA (mapa.gob.es)", 20, footerY);
      doc.text("Este documento es orientativo. Consulte siempre fuentes oficiales para datos definitivos.", 20, footerY + 5);
      doc.text(`Generado por TaricAI - ${new Date().toLocaleDateString('es-ES')}`, 20, footerY + 10);
      
      // Save the PDF
      const fileName = `TaricAI_${result.taric_code}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("PDF generado correctamente");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setExporting(false);
    }
  };

  if (!result) return null;

  return (
    <Button
      onClick={generatePDF}
      disabled={exporting}
      className="btn-cyber-outline h-10 px-4 text-sm"
      data-testid="export-pdf-btn"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </>
      )}
    </Button>
  );
};

export default ExportPDF;
