import { AlertTriangle, Shield, AlertCircle, Info, ExternalLink } from "lucide-react";

export const ComplianceAlerts = ({ alerts = [] }) => {
  if (alerts.length === 0) return null;

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: AlertTriangle,
          iconColor: "text-red-400",
          textColor: "text-red-400"
        };
      case "medium":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          icon: AlertCircle,
          iconColor: "text-amber-400",
          textColor: "text-amber-400"
        };
      default:
        return {
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          icon: Info,
          iconColor: "text-cyan-400",
          textColor: "text-cyan-400"
        };
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "anti_dumping":
        return "Anti-Dumping";
      case "sanction":
        return "Sanción Comercial";
      case "restriction":
        return "Restricción";
      case "cites":
        return "CITES";
      default:
        return "Alerta";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-amber-400" />
        <h3 className="label-cyber text-amber-400">Alertas de Compliance</h3>
      </div>
      
      {alerts.map((alert, index) => {
        const styles = getSeverityStyles(alert.severity);
        const IconComponent = styles.icon;
        
        return (
          <div
            key={index}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4`}
            data-testid={`compliance-alert-${index}`}
          >
            <div className="flex items-start gap-3">
              <IconComponent className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs uppercase font-semibold tracking-wider ${styles.textColor}`}>
                    {getTypeLabel(alert.type)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${styles.bg} ${styles.textColor} uppercase`}>
                    {alert.severity === "high" ? "Alta prioridad" : 
                     alert.severity === "medium" ? "Media" : "Informativa"}
                  </span>
                </div>
                <p className="text-white text-sm mb-2">{alert.message}</p>
                {alert.official_reference && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Ref: {alert.official_reference}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplianceAlerts;
