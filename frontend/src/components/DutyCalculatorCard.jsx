import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calculator, TrendingUp } from "lucide-react";

export const DutyCalculatorCard = ({ tariffs = [], totalEstimate, vatRate }) => {
  return (
    <Card className="border-slate-200 rounded-sm h-full">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-maritime flex items-center gap-2">
          <Calculator className="w-5 h-5 text-trade-blue" />
          Desglose de Aranceles y Tributos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="duty-receipt">
          {tariffs.length > 0 ? (
            <>
              {tariffs.map((tariff, index) => (
                <div key={index} className="duty-receipt-line" data-testid={`tariff-line-${index}`}>
                  <div>
                    <p className="font-medium text-maritime text-sm">{tariff.duty_type}</p>
                    <p className="text-xs text-slate-500">{tariff.description}</p>
                  </div>
                  <span className="font-mono font-semibold text-trade-blue">
                    {tariff.rate}
                  </span>
                </div>
              ))}
              
              {/* Total */}
              <div className="duty-receipt-line duty-receipt-total">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Estimación Total</span>
                </div>
                <span className="font-mono font-bold text-lg" data-testid="total-estimate">
                  {totalEstimate}
                </span>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">
              No se encontraron aranceles específicos
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
          <p className="text-xs text-amber-800">
            <strong>Nota:</strong> Las tasas mostradas son orientativas. 
            Los aranceles finales pueden variar según acuerdos comerciales, 
            preferencias y regulaciones específicas. Consulte fuentes oficiales para datos definitivos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DutyCalculatorCard;
