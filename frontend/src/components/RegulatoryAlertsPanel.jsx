import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  X, 
  ChevronRight, 
  ExternalLink,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "./ui/button";

export const RegulatoryAlertsPanel = ({ alerts = [], onRefresh, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(alerts.length);
  }, [alerts]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true;
    return alert.type === filter;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case "anti_dumping":
        return <Shield className="w-4 h-4" />;
      case "restriction":
        return <AlertTriangle className="w-4 h-4" />;
      case "sanction":
        return <Shield className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "anti_dumping":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "restriction":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "sanction":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg bg-[#0d1424] border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
        data-testid="alerts-bell"
      >
        <Bell className="w-5 h-5 text-cyan-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0f1a] border-l border-cyan-500/20 z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-cyan-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Alertas Regulatorias</h2>
                      <p className="text-xs text-gray-500">Cambios que afectan a tus operaciones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "Todas" },
                    { value: "anti_dumping", label: "Anti-Dumping" },
                    { value: "restriction", label: "Restricciones" }
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        filter === tab.value
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No hay alertas activas</p>
                    <p className="text-xs text-gray-600 mt-1">Tu compliance está al día</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                      data-testid={`regulatory-alert-${index}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase font-semibold tracking-wider">
                              {alert.type.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="font-semibold text-white text-sm mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-xs text-gray-400 leading-relaxed mb-3">
                            {alert.description}
                          </p>
                          
                          {/* Affected codes */}
                          {alert.affected_codes && alert.affected_codes.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-500 block mb-1">Códigos afectados:</span>
                              <div className="flex flex-wrap gap-1">
                                {alert.affected_codes.map((code, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-[#0d1424] rounded text-xs font-mono text-cyan-400"
                                  >
                                    {code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              Efectivo: {formatDate(alert.effective_date)}
                            </div>
                            <a
                              href="#"
                              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                            >
                              {alert.source}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-cyan-500/10">
                <Button
                  onClick={onRefresh}
                  disabled={loading}
                  className="btn-cyber-outline w-full h-10 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar Alertas
                </Button>
                <p className="text-center text-xs text-gray-600 mt-3">
                  Fuente: DOUE, BOE, Comisión Europea
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RegulatoryAlertsPanel;
