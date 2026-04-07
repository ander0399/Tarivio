import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
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
  ChevronRight,
  Zap,
  BarChart3,
  Clock,
  Users,
  Leaf,
  LogIn,
  Building2,
  AlertTriangle,
  Lock,
  TrendingUp,
  Award,
  HeadphonesIcon,
  Scale
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentExample, setCurrentExample] = useState(0);
  
  const examples = [
    "Aceite de oliva virgen extra...",
    "Componentes electrónicos...",
    "Textiles de algodón 100%...",
    "Maquinaria industrial..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const features = [
    {
      icon: Globe,
      title: "COMERCIO INTERNACIONAL 360°",
      description: "Información comercial completa de 65 países: aranceles, requisitos fitosanitarios, barreras de entrada, y autoridades aduaneras oficiales.",
      stats: [
        { label: "PAÍSES", value: "65+" },
        { label: "FUENTES", value: "130+" }
      ]
    },
    {
      icon: Zap,
      title: "CLASIFICACIÓN IA AVANZADA",
      description: "Motor de clasificación arancelaria potenciado por GPT-5.2. Clasifica por texto, imagen o chat conversacional.",
      stats: [
        { label: "PRECISIÓN", value: "94%" },
        { label: "CÓDIGOS", value: "21K+" }
      ]
    },
    {
      icon: Scale,
      title: "TRATADOS COMERCIALES",
      description: "Detecta automáticamente tratados aplicables: USMCA, RCEP, CPTPP, Alianza del Pacífico, MERCOSUR y más.",
      stats: [
        { label: "TRATADOS", value: "10+" },
        { label: "ACUERDOS", value: "40+" }
      ]
    },
    {
      icon: Shield,
      title: "COMPLIANCE AUTOMATIZADO",
      description: "Alertas en tiempo real sobre anti-dumping, sanciones, restricciones fitosanitarias, certificaciones HALAL y normativas.",
      badge: "COMPLIANCE GLOBAL"
    }
  ];

  const problems = [
    {
      icon: AlertTriangle,
      problem: "Errores de clasificación",
      solution: "IA entrenada con la nomenclatura combinada oficial",
      impact: "Evita sanciones y retrasos en aduanas"
    },
    {
      icon: Clock,
      problem: "Procesos lentos y manuales",
      solution: "Clasificación automática en segundos",
      impact: "Reduce el tiempo de despacho un 70%"
    },
    {
      icon: Scale,
      problem: "Compliance complejo",
      solution: "Alertas automáticas de anti-dumping y restricciones",
      impact: "Cumplimiento normativo garantizado"
    },
    {
      icon: Users,
      problem: "Gestión de equipos dispersa",
      solution: "Panel centralizado con roles y permisos",
      impact: "Control total de tu organización"
    }
  ];

  const officialSources = [
    { name: "TARIC UE", logo: "🇪🇺", desc: "Comisión Europea" },
    { name: "CBP USA", logo: "🇺🇸", desc: "US Customs" },
    { name: "DIAN", logo: "🇨🇴", desc: "Colombia" },
    { name: "SAT", logo: "🇲🇽", desc: "México" },
    { name: "GACC", logo: "🇨🇳", desc: "China Customs" },
    { name: "WTO", logo: "🌐", desc: "Organización Mundial" }
  ];

  const stats = [
    { number: "65+", label: "Países Cubiertos", icon: Globe },
    { number: "10+", label: "Tratados Comerciales", icon: Scale },
    { number: "21K+", label: "Códigos Arancelarios", icon: BarChart3 },
    { number: "<3s", label: "Tiempo Respuesta", icon: Clock }
  ];

  const plans = [
    {
      name: "STARTER",
      price: "249",
      description: "Para agencias que inician su transformación digital",
      features: [
        "5 usuarios",
        "200 consultas/mes",
        "Clasificación TARIC con IA",
        "Cálculo de aranceles",
        "Soporte por email"
      ]
    },
    {
      name: "PROFESSIONAL",
      price: "599",
      popular: true,
      description: "Para agencias con volumen medio-alto de operaciones",
      features: [
        "15 usuarios",
        "Consultas ilimitadas",
        "Todo de Starter",
        "Control fitosanitario",
        "Documentación automática",
        "Soporte prioritario",
        "API access"
      ]
    },
    {
      name: "ENTERPRISE",
      price: "1,499",
      description: "Solución completa para grandes operadores",
      features: [
        "Usuarios ilimitados",
        "Consultas ilimitadas",
        "Todo de Professional",
        "Integraciones custom",
        "SLA garantizado",
        "Account manager dedicado",
        "Onboarding personalizado"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="glass-dark fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="w-10 h-10 bg-[#0d1424] border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <Container className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-heading font-bold text-xl">
              Taric<span className="text-cyan-400">AI</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#soluciones" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">
              Soluciones
            </a>
            <a href="#fuentes" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">
              Fuentes Oficiales
            </a>
            <a href="#precios" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider">
              Precios
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="btn-cyber h-10 px-5 text-sm"
                data-testid="dashboard-btn"
              >
                Dashboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Link to="/login">
                <Button 
                  className="btn-cyber-outline h-10 px-5 text-sm flex items-center gap-2"
                  data-testid="login-btn"
                >
                  <LogIn className="w-4 h-4" />
                  ACCESO
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0a0f1a] to-[#0d1424]" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full mb-8">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                  Plataforma Global para Comercio Internacional
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4" data-testid="hero-title">
                COMERCIO
                <br />
                <span className="text-cyan-400">GLOBAL</span>
                <br />
                <span className="text-3xl md:text-4xl text-gray-400">CON IA</span>
              </h1>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold tracking-wider">
                  65+ PAÍSES · FUENTES OFICIALES · TRATADOS COMERCIALES
                </span>
              </div>
              
              <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
                La plataforma de inteligencia comercial más completa para 
                <strong className="text-white"> agencias de aduanas, importadores y exportadores</strong> de todos los tamaños. 
                Clasificación arancelaria, requisitos fitosanitarios, tratados comerciales y 
                <strong className="text-cyan-400"> documentación oficial de 65 países</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button 
                  onClick={() => navigate(user ? "/dashboard" : "/register")}
                  className="btn-cyber h-14 px-8 text-base"
                  data-testid="cta-primary"
                >
                  SOLICITAR DEMO
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => document.getElementById('soluciones').scrollIntoView({ behavior: 'smooth' })}
                  className="btn-cyber-outline h-14 px-8 text-base"
                  data-testid="cta-secondary"
                >
                  VER SOLUCIONES
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-6 border-t border-cyan-500/10">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Datos de:</span>
                {officialSources.slice(0, 3).map((source, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>{source.logo}</span>
                    <span>{source.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right - Live Monitor */}
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="monitor-display relative">
                <div className="monitor-header">
                  <div className="monitor-dots">
                    <div className="monitor-dot red" />
                    <div className="monitor-dot yellow" />
                    <div className="monitor-dot green" />
                  </div>
                  <span className="text-cyan-400 text-xs uppercase tracking-wider ml-auto">
                    Live Classification Monitor
                  </span>
                </div>
                
                {/* Animated wave */}
                <div className="h-32 mb-6 relative overflow-hidden">
                  <svg viewBox="0 0 400 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.05" />
                        <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50"
                      stroke="#00d4ff"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <path
                      d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50 V100 H0 Z"
                      fill="url(#waveGradient)"
                    />
                  </svg>
                </div>

                {/* Live typing example */}
                <div className="bg-[#0a0f1a] border border-cyan-500/20 rounded-lg p-4 mb-6">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block mb-2">Clasificando:</span>
                  <motion.p 
                    key={currentExample}
                    className="text-cyan-400 font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {examples[currentExample]}
                  </motion.p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="label-cyber block mb-1">Precisión</span>
                    <span className="text-3xl font-bold text-cyan-400 font-mono">94.0%</span>
                  </div>
                  <div>
                    <span className="label-cyber block mb-1">Códigos TARIC</span>
                    <span className="text-3xl font-bold text-cyan-400 font-mono">21,457</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-[#0d1424] border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white font-mono">{stat.number}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="label-cyber mb-4 block">PROBLEMAS QUE RESOLVEMOS</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Desafíos del <span className="text-cyan-400">Sector Aduanero</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Identificamos las principales falencias de las agencias de aduanas y ofrecemos soluciones tecnológicas concretas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                className="cyber-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-400 mb-1">Problema: {item.problem}</h3>
                    <p className="text-gray-400 text-sm mb-3">{item.solution}</p>
                    <div className="flex items-center gap-2 text-cyan-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{item.impact}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Solutions */}
      <section id="soluciones" className="py-24 bg-[#0d1424]/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="label-cyber mb-4 block">CAPACIDADES DE LA PLATAFORMA</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Todo lo que tu Agencia Necesita
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tecnología diseñada específicamente para automatizar y optimizar el despacho aduanero.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="cyber-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                data-testid={`feature-card-${index}`}
              >
                {feature.badge && (
                  <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full mb-4">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>
                )}
                
                <div className="icon-box mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                {feature.stats && (
                  <div className="flex gap-6 pt-4 border-t border-cyan-500/10">
                    {feature.stats.map((stat, i) => (
                      <div key={i}>
                        <span className="label-cyber block text-[10px] mb-1">{stat.label}</span>
                        <span className="text-xl font-bold text-white font-mono">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Team Management Card */}
            <motion.div 
              className="cyber-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="icon-box mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">
                GESTIÓN DE EQUIPOS
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Panel de administración con roles (Admin, Operador, Consultor), historial de actividad y control de accesos.
              </p>
              <div className="flex gap-6 pt-4 border-t border-cyan-500/10">
                <div>
                  <span className="label-cyber block text-[10px] mb-1">ROLES</span>
                  <span className="text-xl font-bold text-white font-mono">3</span>
                </div>
                <div>
                  <span className="label-cyber block text-[10px] mb-1">USUARIOS</span>
                  <span className="text-xl font-bold text-white font-mono">∞</span>
                </div>
              </div>
            </motion.div>

            {/* Global Coverage */}
            <motion.div 
              className="cyber-card p-6 flex flex-col justify-center items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Globe className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 uppercase">Cobertura Global</h3>
              <span className="text-4xl font-bold text-cyan-400 font-mono">184</span>
              <span className="text-gray-400 text-sm">PAÍSES ORIGEN</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Official Sources Section */}
      <section id="fuentes" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="label-cyber mb-4 block">100% FUENTES OFICIALES</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Datos <span className="text-cyan-400">Verificados</span> y Actualizados
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Toda nuestra información proviene exclusivamente de bases de datos oficiales de la 
              <strong className="text-white"> Unión Europea</strong> y el 
              <strong className="text-white"> Gobierno de España</strong>. 
              Sin intermediarios, sin interpretaciones: datos directos de la fuente.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                name: "TARIC - Comisión Europea",
                authority: "DG TAXUD",
                desc: "Base de datos oficial del arancel integrado",
                url: "ec.europa.eu/taxation_customs",
                icon: "🇪🇺"
              },
              {
                name: "Agencia Tributaria",
                authority: "AEAT",
                desc: "Consulta arancelaria oficial de España",
                url: "agenciatributaria.es",
                icon: "🇪🇸"
              },
              {
                name: "Ministerio de Agricultura",
                authority: "MAPA",
                desc: "Requisitos fitosanitarios",
                url: "mapa.gob.es",
                icon: "🌿"
              },
              {
                name: "EUR-Lex",
                authority: "DOUE",
                desc: "Legislación y normativa UE",
                url: "eur-lex.europa.eu",
                icon: "⚖️"
              }
            ].map((source, index) => (
              <motion.a
                key={index}
                href={`https://${source.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-card p-6 text-center hover:border-cyan-500/50 transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{source.icon}</div>
                <h3 className="font-bold text-white mb-1">{source.name}</h3>
                <p className="text-cyan-400 text-sm mb-2">{source.authority}</p>
                <p className="text-gray-500 text-xs">{source.desc}</p>
                <div className="mt-4 text-gray-600 text-xs group-hover:text-cyan-400 transition-colors">
                  {source.url} →
                </div>
              </motion.a>
            ))}
          </div>

          {/* Trust statement */}
          <motion.div 
            className="cyber-card p-8 text-center max-w-3xl mx-auto border-cyan-500/30"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Lock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Compromiso de Fiabilidad</h3>
            <p className="text-gray-400 leading-relaxed">
              TaricAI no inventa ni interpreta datos. Nuestro sistema está conectado 
              directamente a las APIs y bases de datos oficiales de la UE y España. 
              Cada clasificación, arancel y requisito documental está respaldado 
              por su referencia normativa oficial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 bg-[#0d1424]/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="label-cyber mb-4 block">PLANES B2B</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Precio Justo, <span className="text-cyan-400">Valor Real</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Cada plan incluye acceso completo a nuestra IA de clasificación TARIC con datos oficiales verificados.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`cyber-card p-8 relative ${plan.popular ? 'border-cyan-500/50' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-cyan-500 text-[#0a0f1a] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Popular
                    </span>
                  </div>
                )}
                
                <h3 className="label-cyber text-lg mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">€{plan.price}</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={plan.popular ? "btn-cyber w-full" : "btn-cyber-outline w-full"}
                  onClick={() => navigate("/register")}
                >
                  EMPEZAR
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5" />
        <motion.div 
          className="max-w-4xl mx-auto px-6 text-center relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Ship className="w-16 h-16 text-cyan-400 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Modernizar tu Agencia?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Únete a las agencias de aduanas que ya confían en TaricAI para sus 
            clasificaciones arancelarias. Demo personalizada sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              className="btn-cyber h-14 px-10 text-base"
              data-testid="cta-bottom"
            >
              SOLICITAR DEMO GRATUITA
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              className="btn-cyber-outline h-14 px-10 text-base"
            >
              <HeadphonesIcon className="w-5 h-5 mr-2" />
              CONTACTAR VENTAS
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#0d1424] border border-cyan-500/30 rounded-lg flex items-center justify-center">
                  <Container className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-heading font-bold">
                  Taric<span className="text-cyan-400">AI</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Clasificación arancelaria inteligente para agencias de aduanas profesionales.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Producto</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#soluciones" className="hover:text-cyan-400 transition-colors">Clasificación IA</a></li>
                <li><a href="#soluciones" className="hover:text-cyan-400 transition-colors">Cálculo de Aranceles</a></li>
                <li><a href="#soluciones" className="hover:text-cyan-400 transition-colors">Compliance</a></li>
                <li><a href="#precios" className="hover:text-cyan-400 transition-colors">Precios</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Fuentes Oficiales</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="https://ec.europa.eu/taxation_customs/dds2/taric/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">TARIC UE</a></li>
                <li><a href="https://www.agenciatributaria.es/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Agencia Tributaria</a></li>
                <li><a href="https://www.mapa.gob.es/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">MAPA</a></li>
                <li><a href="https://eur-lex.europa.eu/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">EUR-Lex</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Empresa</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © 2024 TaricAI. Todos los derechos reservados.
            </p>
            <p className="text-gray-600 text-xs">
              Datos provenientes de fuentes oficiales de la UE y el Gobierno de España.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
