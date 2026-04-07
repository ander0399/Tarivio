import { Calculator, TrendingUp, Tag, Scale } from "lucide-react";

export const DutyCalculatorCard = ({ tariffs = [], totalEstimate, vatRate, preferentialDuties }) => {
  return (
    <div className="cyber-card p-6 h-full">
      <h3 className="label-cyber mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        Desglose de Aranceles y Tributos
      </h3>
      
      <div className="bg-[#0a0f1a] rounded-lg border border-[rgba(0,212,255,0.1)] overflow-hidden">
        {tariffs.length > 0 ? (
          <>
            {tariffs.map((tariff, index) => (
              <div key={index} className="duty-line" data-testid={`tariff-line-${index}`}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{tariff.duty_type}</p>
                  <p className="text-xs text-gray-500">{tariff.description}</p>
                  {tariff.legal_base && (
                    <p className="text-xs text-cyan-400/70 mt-1 flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {tariff.legal_base}
                    </p>
                  )}
                </div>
                <span className="font-mono font-semibold text-cyan-400 text-lg">
                  {tariff.rate}
                </span>
              </div>
            ))}
            
            {/* Preferential duties if available */}
            {preferentialDuties && (
              <div className="duty-line bg-green-500/5 border-t border-green-500/20">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="font-medium text-sm text-green-400">Arancel Preferencial</p>
                    <p className="text-xs text-gray-500">{preferentialDuties}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Total */}
            <div className="duty-line duty-total">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">Estimación Total</span>
              </div>
              <span className="font-mono font-bold text-lg" data-testid="total-estimate">
                {totalEstimate}
              </span>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            No se encontraron aranceles específicos
          </div>
        )}
      </div>

      {/* Legal disclaimer */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-400">
          <strong>Aviso legal:</strong> Las tasas mostradas son orientativas basadas en el TARIC oficial. 
          Los aranceles finales pueden variar según acuerdos comerciales, certificados de origen 
          y regulaciones específicas. Consulte siempre fuentes oficiales para datos definitivos.
        </p>
      </div>

      {/* Official source reference */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span>Fuente:</span>
        <a 
          href="https://ec.europa.eu/taxation_customs/dds2/taric/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          TARIC - Comisión Europea
        </a>
      </div>
    </div>
  );
};

export default DutyCalculatorCard;
