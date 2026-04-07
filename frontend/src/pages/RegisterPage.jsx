import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Container, Loader2, Mail, Lock, User, Building2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: ""
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.detail || "Error al crear la cuenta";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] grid-bg flex items-center justify-center p-6 relative">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
      
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
            <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center">
              <Container className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Crear Cuenta</h1>
              <p className="text-gray-500 text-sm">Empieza a clasificar con IA</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="label-cyber">
                Nombre completo *
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  name="name"
                  type="text"
                  placeholder="Juan García"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-cyber pl-12"
                  data-testid="name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-cyber">
                Correo electrónico *
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  name="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-cyber pl-12"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-cyber">
                Empresa (opcional)
              </Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  name="company"
                  type="text"
                  placeholder="Tu Empresa S.L."
                  value={formData.company}
                  onChange={handleChange}
                  className="input-cyber pl-12"
                  data-testid="company-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-cyber">
                Contraseña *
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-cyber pl-12"
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="btn-cyber w-full h-12 mt-2"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  CREANDO...
                </>
              ) : (
                "CREAR CUENTA"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(0,212,255,0.1)] text-center">
            <p className="text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                data-testid="login-link"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
