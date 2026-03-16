import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const TaricCodeDisplay = ({ code, chapter, heading, subheading, description }) => {
  // Split code into pairs for display
  const codePairs = code ? [
    { value: code.slice(0, 2), label: "Capítulo", type: "chapter" },
    { value: code.slice(2, 4), label: "Partida", type: "heading" },
    { value: code.slice(4, 6), label: "Subpartida", type: "subheading" },
    { value: code.slice(6, 8), label: "NC", type: "nc" },
    { value: code.slice(8, 10), label: "TARIC", type: "taric" }
  ] : [];

  return (
    <div className="space-y-4">
      {/* Code Display */}
      <div className="flex flex-wrap items-center gap-1">
        <TooltipProvider>
          {codePairs.map((pair, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div 
                  className={`taric-code-segment ${pair.type}`}
                  data-testid={`taric-segment-${pair.type}`}
                >
                  {pair.value}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-medium">{pair.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-maritime rounded-sm"></div>
          <span className="text-slate-600">Capítulo ({chapter})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-trade-blue rounded-sm"></div>
          <span className="text-slate-600">Partida ({heading})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-200 rounded-sm"></div>
          <span className="text-slate-600">Subpartida ({subheading})</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Descripción Oficial
          </h4>
          <p className="text-maritime font-body leading-relaxed" data-testid="taric-description">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaricCodeDisplay;
