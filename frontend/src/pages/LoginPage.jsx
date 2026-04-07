import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Container, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("¡Bienvenido de vuelta!");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.detail || "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] grid-bg flex items-center justify-center p-6 relative">
      {/* Background effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 font-medium transition-colors"
          data-testid="back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="cyber-card p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#0d1424] border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <Container className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">
                Taric<span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-gray-500 text-sm">Acceso al Sistema</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="label-cyber">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-cyber pl-12"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-cyber">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-cyber pl-12"
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="btn-cyber w-full h-12 mt-2"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  INICIANDO...
                </>
              ) : (
                "INICIAR SESIÓN"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(0,212,255,0.1)] text-center">
            <p className="text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link 
                to="/register" 
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                data-testid="register-link"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
