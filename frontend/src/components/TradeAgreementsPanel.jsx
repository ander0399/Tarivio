import { Handshake, ExternalLink, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { getAgreementStatusColor, getAgreementTypeLabel } from "../config/tradeAgreements";

export const TradeAgreementsPanel = ({ agreements = [], originCountry, destinationCountry }) => {
  if (!originCountry || !destinationCountry) {
    return null;
  }

  const hasAgreements = agreements.length > 0;

  return (
    <div className="cyber-card p-6">
      <h3 className="label-cyber mb-4 flex items-center gap-2">
        <Handshake className="w-4 h-4" />
        Tratados Comerciales Aplicables
      </h3>

      {hasAgreements ? (
        <div className="space-y-4">
          {agreements.map((agreement, index) => {
            const statusColors = getAgreementStatusColor(agreement.status);
            
            return (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${statusColors.border} ${statusColors.bg}`}
                data-testid={`trade-agreement-${index}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white">
                        {agreement.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                        {agreement.status === "active" ? "Vigente" : 
                         agreement.status === "pending" ? "Pendiente" : "Negociando"}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-400">
                      {getAgreementTypeLabel(agreement.type)}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Beneficios:</p>
                  <p className="text-sm text-gray-300">{agreement.benefits}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {/* Preferential Rate */}
                  <div className="bg-[#0a0f1a] rounded p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tasa Preferencial</p>
                    <p className="text-lg font-bold text-green-400 font-mono">
                      {agreement.preferentialRate}
                    </p>
                  </div>
                  
                  {/* Effective Date */}
                  {agreement.effectiveDate && (
                    <div className="bg-[#0a0f1a] rounded p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vigente desde</p>
                      <p className="text-sm text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(agreement.effectiveDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Required Documents */}
                {agreement.documents && agreement.documents.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Documentos para preferencia:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agreement.documents.map((doc, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Link */}
                {agreement.officialLink && (
                  <a
                    href={agreement.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver información oficial en ec.europa.eu
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 bg-[#0a0f1a] rounded-lg border border-amber-500/20">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-amber-400 font-medium mb-2">
            Sin acuerdos preferenciales
          </p>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            No se encontraron tratados comerciales vigentes entre el origen y destino seleccionados. 
            Se aplicarán los aranceles NMF (Nación Más Favorecida) estándar.
          </p>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-4 pt-4 border-t border-cyan-500/10">
        <p className="text-xs text-gray-500">
          Datos de tratados comerciales basados en la Comisión Europea (DG TRADE). 
          <a 
            href="https://ec.europa.eu/trade/policy/countries-and-regions/agreements/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline ml-1"
          >
            Ver todos los acuerdos UE
          </a>
        </p>
      </div>
    </div>
  );
};

export default TradeAgreementsPanel;
