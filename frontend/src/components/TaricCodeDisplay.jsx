import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const TaricCodeDisplay = ({ code, chapter, heading, subheading, description }) => {
  const codePairs = code ? [
    { value: code.slice(0, 2), label: "Capítulo", type: "chapter" },
    { value: code.slice(2, 4), label: "Partida", type: "heading" },
    { value: code.slice(4, 6), label: "Subpartida", type: "subheading" },
    { value: code.slice(6, 8), label: "NC", type: "nc" },
    { value: code.slice(8, 10), label: "TARIC", type: "taric" }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Code Display */}
      <div className="flex flex-wrap items-center gap-0">
        <TooltipProvider>
          {codePairs.map((pair, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div 
                  className={`taric-segment ${pair.type} ${index === codePairs.length - 1 ? 'last' : ''}`}
                  data-testid={`taric-segment-${pair.type}`}
                >
                  {pair.value}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#0d1424] border-cyan-500/30 text-white">
                <p className="font-medium">{pair.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400 rounded"></div>
          <span className="text-gray-400">Capítulo ({chapter})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400/30 border border-cyan-400 rounded"></div>
          <span className="text-gray-400">Partida ({heading})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#0d1424] border border-[rgba(0,212,255,0.2)] rounded"></div>
          <span className="text-gray-400">Subpartida ({subheading})</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="pt-4 border-t border-[rgba(0,212,255,0.1)]">
          <span className="label-cyber block mb-2">Descripción Oficial</span>
          <p className="text-white leading-relaxed" data-testid="taric-description">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaricCodeDisplay;
