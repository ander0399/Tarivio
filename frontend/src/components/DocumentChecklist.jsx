import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileCheck, Leaf, FileText, Shield, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

export const DocumentChecklist = ({ documents = [] }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case "fitosanitario":
        return <Leaf className="w-4 h-4" />;
      case "no_fitosanitario":
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "fitosanitario":
        return "doc-badge fitosanitario";
      case "no_fitosanitario":
        return "doc-badge no_fitosanitario";
      default:
        return "doc-badge aduanero";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "fitosanitario":
        return "Fitosanitario";
      case "no_fitosanitario":
        return "No Fitosanitario";
      default:
        return "Aduanero";
    }
  };

  return (
    <Card className="border-slate-200 rounded-sm h-full">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-maritime flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-trade-blue" />
          Documentos Requeridos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div 
                key={index}
                className={`p-3 rounded-sm border transition-colors ${
                  doc.required 
                    ? "bg-red-50 border-red-200" 
                    : "bg-slate-50 border-slate-200"
                }`}
                data-testid={`document-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {doc.required ? (
                        <AlertTriangle className="w-4 h-4 text-customs-amber" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium text-maritime text-sm">
                        {doc.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">
                      {doc.description}
                    </p>
                  </div>
                  <span className={getTypeBadgeClass(doc.type)}>
                    {getTypeIcon(doc.type)}
                    {getTypeLabel(doc.type)}
                  </span>
                </div>
                
                {doc.official_link && (
                  <a
                    href={doc.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 ml-6 text-xs text-trade-blue hover:underline"
                  >
                    Más información
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No se requieren documentos especiales
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2 font-medium">Leyenda:</p>
          <div className="flex flex-wrap gap-2">
            <span className="doc-badge fitosanitario">
              <Leaf className="w-3 h-3" />
              Fitosanitario
            </span>
            <span className="doc-badge no_fitosanitario">
              <Shield className="w-3 h-3" />
              No Fitosanitario
            </span>
            <span className="doc-badge aduanero">
              <FileText className="w-3 h-3" />
              Aduanero
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentChecklist;
