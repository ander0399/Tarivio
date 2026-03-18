import { FileCheck, Leaf, FileText, Shield, CheckCircle2, AlertTriangle, ExternalLink, Building, Clock } from "lucide-react";

export const DocumentChecklist = ({ documents = [] }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case "fitosanitario":
        return <Leaf className="w-4 h-4" />;
      case "no_fitosanitario":
        return <Shield className="w-4 h-4" />;
      case "cites":
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "fitosanitario":
        return "doc-badge-cyber fitosanitario";
      case "no_fitosanitario":
        return "doc-badge-cyber no_fitosanitario";
      case "cites":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30 border";
      default:
        return "doc-badge-cyber aduanero";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "fitosanitario":
        return "Fito";
      case "no_fitosanitario":
        return "Sanitario";
      case "cites":
        return "CITES";
      default:
        return "Aduanero";
    }
  };

  const requiredDocs = documents.filter(d => d.required);
  const optionalDocs = documents.filter(d => !d.required);

  const renderDocumentCard = (doc, index, isRequired) => (
    <div 
      key={index}
      className={`p-4 rounded-lg border ${
        isRequired 
          ? "bg-red-500/10 border-red-500/20" 
          : "bg-[#0a0f1a] border-[rgba(0,212,255,0.1)]"
      }`}
      data-testid={`document-${isRequired ? 'required' : 'optional'}-${index}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isRequired ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
            <span className="font-medium text-sm text-white">
              {doc.name}
            </span>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {doc.description}
          </p>
        </div>
        <span className={`${getTypeBadgeClass(doc.type)} doc-badge-cyber flex items-center gap-1 text-[10px] px-2 py-1 rounded-full`}>
          {getTypeIcon(doc.type)}
          {getTypeLabel(doc.type)}
        </span>
      </div>

      {/* Authority and timing info */}
      <div className="ml-6 mb-3 space-y-1">
        {doc.issuing_authority && (
          <p className="text-xs text-cyan-400 flex items-center gap-1">
            <Building className="w-3 h-3" />
            {doc.issuing_authority}
          </p>
        )}
        {doc.processing_time && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Tiempo: {doc.processing_time}
          </p>
        )}
        {doc.validity_days > 0 && (
          <p className="text-xs text-gray-500">
            Validez: {doc.validity_days} días
          </p>
        )}
      </div>

      {/* Official Link only - no PDF downloads */}
      <div className="ml-6 flex flex-wrap gap-2">
        {doc.official_link && (
          <a
            href={doc.official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1424] border border-[rgba(0,212,255,0.2)] rounded text-xs text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Información oficial
          </a>
        )}
        {doc.online_portal && (
          <a
            href={doc.online_portal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400 hover:bg-green-500/30 transition-colors"
            data-testid={`online-portal-${index}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tramitar Online
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="cyber-card p-6 h-full">
      <h3 className="label-cyber mb-4 flex items-center gap-2">
        <FileCheck className="w-4 h-4" />
        Documentación Requerida
      </h3>
      
      {documents.length > 0 ? (
        <div className="space-y-4">
          {/* Required documents */}
          {requiredDocs.length > 0 && (
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Obligatorios ({requiredDocs.length})
              </p>
              <div className="space-y-3">
                {requiredDocs.map((doc, index) => renderDocumentCard(doc, index, true))}
              </div>
            </div>
          )}

          {/* Optional documents */}
          {optionalDocs.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Opcionales / Según caso ({optionalDocs.length})
              </p>
              <div className="space-y-3">
                {optionalDocs.map((doc, index) => renderDocumentCard(doc, index, false))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No se requieren documentos especiales
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.1)]">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Tipos de documento:</p>
        <div className="flex flex-wrap gap-2">
          <span className="doc-badge-cyber fitosanitario inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full">
            <Leaf className="w-3 h-3" />
            Fitosanitario
          </span>
          <span className="doc-badge-cyber no_fitosanitario inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            Sanitario
          </span>
          <span className="doc-badge-cyber aduanero inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            Aduanero
          </span>
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            CITES
          </span>
        </div>
      </div>

      {/* Official sources */}
      <div className="mt-3 text-xs text-gray-500">
        <span>Fuentes oficiales: </span>
        <a href="https://www.mapa.gob.es/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">MAPA</a>
        {" · "}
        <a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">AEAT</a>
        {" · "}
        <a href="https://www.miteco.gob.es/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">MITECO</a>
        {" · "}
        <a href="https://www.aesan.gob.es/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">AESAN</a>
      </div>
    </div>
  );
};

export default DocumentChecklist;
