import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { 
  Search, 
  FileCheck, 
  Calculator, 
  Globe, 
  Shield, 
  ArrowRight,
  Container,
  Ship,
  FileText,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: "Búsqueda Inteligente",
      description: "Encuentra códigos TARIC con solo describir tu producto. Nuestra IA analiza tu descripción y sugiere la clasificación arancelaria correcta."
    },
    {
      icon: Calculator,
      title: "Cálculo de Aranceles",
      description: "Obtén un desglose completo de todos los tributos aplicables: derechos de aduana, IVA, y cualquier otro gravamen específico."
    },
    {
      icon: FileCheck,
      title: "Documentación Requerida",
      description: "Lista completa de certificados y documentos necesarios: fitosanitarios, CITES, CE y todos los requisitos para tu importación."
    },
    {
      icon: Globe,
      title: "Fuentes Oficiales",
      description: "Toda la información proviene directamente del TARIC de la UE y la Agencia Tributaria de España. 100% actualizado y verificable."
    }
  ];

  const stats = [
    { number: "21,000+", label: "Códigos TARIC" },
    { number: "99%", label: "Precisión IA" },
    { number: "27", label: "Países UE" },
    { number: "24/7", label: "Disponibilidad" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="w-10 h-10 bg-maritime rounded-sm flex items-center justify-center">
              <Container className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-maritime">TARIC AI</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-maritime hover:bg-slate-800 text-white h-11 px-6 rounded-sm font-medium"
                data-testid="dashboard-btn"
              >
                Ir al Dashboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="text-slate-600 hover:text-maritime font-medium"
                    data-testid="login-btn"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="bg-trade-blue hover:bg-blue-700 text-white h-11 px-6 rounded-sm font-medium"
                    data-testid="register-btn"
                  >
                    Crear Cuenta
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg min-h-[90vh] flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-fade-in-up">
              <Shield className="w-4 h-4 text-trade-blue" />
              <span className="text-white/90 text-sm font-medium">Fuentes Oficiales UE + España</span>
            </div>
            
            <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tighter mb-6 animate-fade-in-up stagger-1" data-testid="hero-title">
              Clasifica tus productos con{" "}
              <span className="text-trade-blue">Inteligencia Artificial</span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl font-body mb-10 max-w-2xl animate-fade-in-up stagger-2">
              Consulta el TARIC, calcula aranceles y obtén todos los documentos necesarios 
              para tu importación en un solo lugar. Rápido, preciso y actualizado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-3">
              <Button 
                onClick={() => navigate(user ? "/dashboard" : "/register")}
                className="btn-ai-gradient h-14 px-8 text-lg rounded-sm"
                data-testid="cta-primary"
              >
                <Search className="w-5 h-5 mr-2" />
                Comenzar Ahora
              </Button>
              <Button 
                variant="outline"
                className="h-14 px-8 text-lg rounded-sm bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                data-testid="cta-secondary"
              >
                Ver Características
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-maritime mb-4">
              Todo lo que necesitas para importar
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-body">
              Una plataforma completa para consultar clasificaciones arancelarias, 
              calcular tributos y gestionar documentación.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-trade-blue/10 rounded-sm flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-trade-blue" />
                </div>
                <h3 className="font-heading text-xl font-bold text-maritime mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 font-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-maritime mb-4">
              Cómo Funciona
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-body">
              Tres simples pasos para obtener toda la información de importación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe tu Producto",
                description: "Escribe una descripción de lo que quieres importar. Nuestra IA entiende lenguaje natural.",
                icon: FileText
              },
              {
                step: "02",
                title: "Análisis con IA",
                description: "El sistema analiza tu descripción y busca en la base de datos oficial del TARIC.",
                icon: Search
              },
              {
                step: "03",
                title: "Resultados Completos",
                description: "Obtén el código arancelario, aranceles, IVA y todos los documentos necesarios.",
                icon: CheckCircle2
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-8xl font-heading font-bold text-slate-100 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-12 pl-4">
                  <div className="w-14 h-14 bg-maritime rounded-sm flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-maritime mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 font-body">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-maritime">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Ship className="w-16 h-16 text-trade-blue mx-auto mb-8" />
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Empieza a clasificar hoy
          </h2>
          <p className="text-slate-300 text-lg mb-10 font-body max-w-2xl mx-auto">
            Únete a importadores y agentes aduaneros que ya confían en TARIC AI 
            para sus consultas arancelarias.
          </p>
          <Button 
            onClick={() => navigate(user ? "/dashboard" : "/register")}
            className="btn-ai-gradient h-14 px-10 text-lg rounded-sm"
            data-testid="cta-bottom"
          >
            {user ? "Ir al Dashboard" : "Crear Cuenta Gratis"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-trade-blue rounded-sm flex items-center justify-center">
                <Container className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-white">TARIC AI</span>
            </div>
            
            <div className="flex items-center gap-6 text-slate-400 text-sm font-body">
              <a href="https://ec.europa.eu/taxation_customs/dds2/taric/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                TARIC UE
              </a>
              <a href="https://www.agenciatributaria.es/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Agencia Tributaria
              </a>
            </div>
            
            <p className="text-slate-500 text-sm font-body">
              © 2024 TARIC AI. Datos de fuentes oficiales.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
