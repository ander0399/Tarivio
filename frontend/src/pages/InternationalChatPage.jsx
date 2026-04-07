import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Send, Bot, User, Globe, ExternalLink, MessageSquare, Trash2,
  Loader2, Info, ChevronRight, Package, FileText, Scale,
  DollarSign, AlertTriangle, CheckCircle, Search, X, ArrowRight,
  HelpCircle, Sparkles, Clock, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Lista COMPLETA de países (65 países)
const ALL_COUNTRIES = [
  // Europa - UE
  { code: 'ES', name: 'España', flag: '🇪🇸', region: 'Europa' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', region: 'Europa' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', region: 'Europa' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', region: 'Europa' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europa' },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', region: 'Europa' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', region: 'Europa' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱', region: 'Europa' },
  { code: 'SE', name: 'Suecia', flag: '🇸🇪', region: 'Europa' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'Europa' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷', region: 'Europa' },
  { code: 'CZ', name: 'República Checa', flag: '🇨🇿', region: 'Europa' },
  { code: 'RO', name: 'Rumania', flag: '🇷🇴', region: 'Europa' },
  { code: 'HU', name: 'Hungría', flag: '🇭🇺', region: 'Europa' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪', region: 'Europa' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰', region: 'Europa' },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮', region: 'Europa' },
  // Europa - No UE
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', region: 'Europa' },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭', region: 'Europa' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴', region: 'Europa' },
  { code: 'RU', name: 'Rusia', flag: '🇷🇺', region: 'Europa' },
  { code: 'UA', name: 'Ucrania', flag: '🇺🇦', region: 'Europa' },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷', region: 'Europa' },
  // América del Norte
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', region: 'América' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', region: 'América' },
  { code: 'MX', name: 'México', flag: '🇲🇽', region: 'América' },
  // Latinoamérica
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'América' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', region: 'América' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'América' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'América' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', region: 'América' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', region: 'América' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', region: 'América' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', region: 'América' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', region: 'América' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', region: 'América' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦', region: 'América' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', region: 'América' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', region: 'América' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', region: 'América' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', region: 'América' },
  // Asia
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', region: 'Asia' },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷', region: 'Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'TW', name: 'Taiwán', flag: '🇹🇼', region: 'Asia' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', region: 'Asia' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭', region: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾', region: 'Asia' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭', region: 'Asia' },
  // Medio Oriente
  { code: 'AE', name: 'Emiratos Árabes', flag: '🇦🇪', region: 'Medio Oriente' },
  { code: 'SA', name: 'Arabia Saudita', flag: '🇸🇦', region: 'Medio Oriente' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Medio Oriente' },
  { code: 'QA', name: 'Catar', flag: '🇶🇦', region: 'Medio Oriente' },
  // África
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦', region: 'África' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'África' },
  { code: 'EG', name: 'Egipto', flag: '🇪🇬', region: 'África' },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦', region: 'África' },
  { code: 'KE', name: 'Kenia', flag: '🇰🇪', region: 'África' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', region: 'África' },
  // Oceanía
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceanía' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', region: 'Oceanía' },
];

// Agrupar países por región
const COUNTRIES_BY_REGION = ALL_COUNTRIES.reduce((acc, country) => {
  if (!acc[country.region]) acc[country.region] = [];
  acc[country.region].push(country);
  return acc;
}, {});

// Componente de selector de país con búsqueda
const CountrySelector = ({ value, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const filteredCountries = search
    ? ALL_COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_COUNTRIES;

  const selectedCountry = ALL_COUNTRIES.find(c => c.code === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-cyan-500/50 transition-colors"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2 text-white">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>
          </div>
          <ScrollArea className="h-60">
            <div className="p-2">
              {search ? (
                // Mostrar resultados de búsqueda
                filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        onChange(country.code);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-slate-800 transition-colors ${
                        value === country.code ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                      }`}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{country.region}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No se encontraron países</p>
                )
              ) : (
                // Mostrar por regiones
                Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => (
                  <div key={region} className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">{region}</p>
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          onChange(country.code);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-slate-800 transition-colors ${
                          value === country.code ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                        }`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.name}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

// Componente para opciones de clarificación (selección múltiple)
const ClarificationOptions = ({ options, allowCustom, customPlaceholder, onSelect }) => {
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleOptionClick = (option) => {
    onSelect(option.label, option.value);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onSelect(customValue, customValue);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, idx) => (
          <button
            key={option.id || idx}
            onClick={() => handleOptionClick(option)}
            className="flex items-center justify-start gap-2 px-4 py-3 bg-slate-800 text-gray-200 rounded-xl text-sm font-medium transition-all hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50 border border-slate-700 text-left"
            data-testid={`clarification-option-${idx}`}
          >
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold flex-shrink-0">
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      
      {allowCustom && (
        <div className="pt-2 border-t border-slate-700">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-gray-400 rounded-xl text-sm font-medium transition-all hover:bg-slate-800 hover:text-white border border-dashed border-slate-700"
            >
              <HelpCircle className="w-4 h-4" />
              Otro (escribir respuesta personalizada)
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={customPlaceholder || "Escribe tu respuesta..."}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                autoFocus
                data-testid="clarification-custom-input"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customValue.trim()}
                className="px-4 py-3 bg-cyan-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para opciones de respuesta rápida
const QuickOptions = ({ options, onSelect, type = 'button' }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(option)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            type === 'primary'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          {option.icon && <span>{option.icon}</span>}
          {option.label || option}
        </button>
      ))}
    </div>
  );
};

// Componente de mensaje del chat
const ChatMessage = ({ message, isUser, onOptionSelect, onClarificationSelect }) => {
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? '' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md shadow-lg' 
            : message.isClarification
              ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/20 text-gray-100 rounded-bl-md border border-cyan-500/30'
              : 'bg-slate-800 text-gray-100 rounded-bl-md border border-slate-700'
        }`}>
          {message.isClarification && (
            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3 h-3" />
              TaricAI pregunta
            </div>
          )}
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
            prose-p:my-2 prose-p:leading-relaxed
            prose-strong:text-cyan-300 prose-strong:font-semibold
            prose-em:text-gray-300
            prose-ul:my-2 prose-ul:pl-4
            prose-ol:my-2 prose-ol:pl-4
            prose-li:my-0.5
            prose-headings:text-gray-100 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2
            prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
            prose-code:bg-slate-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-cyan-300 prose-code:text-xs
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg
            prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-cyan-500 prose-blockquote:bg-slate-800/50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r
          ">
            {isUser ? (
              message.content
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        </div>
        
        {/* Opciones de clarificación con selección múltiple */}
        {!isUser && message.isClarification && message.clarificationOptions && (
          <ClarificationOptions
            options={message.clarificationOptions}
            allowCustom={message.allowCustom}
            customPlaceholder={message.customPlaceholder}
            onSelect={onClarificationSelect}
          />
        )}
        
        {/* Opciones de respuesta rápida (preguntas sugeridas) */}
        {!isUser && !message.isClarification && message.options && (
          <QuickOptions 
            options={message.options} 
            onSelect={onOptionSelect}
            type={message.optionType}
          />
        )}
        
        {/* Fuentes */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.slice(0, 3).map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-800/50 px-2 py-1 rounded-lg"
              >
                <ExternalLink className="w-3 h-3" />
                {source.name?.length > 20 ? source.name.substring(0, 20) + '...' : source.name}
              </a>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

// Componente principal
export default function InternationalChatPage({ token }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [conversationStep, setConversationStep] = useState('welcome');
  const [productInfo, setProductInfo] = useState({});
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(null); // seconds until retry
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sendingRef = useRef(false); // Lock to prevent double-send race condition
  const retryTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
    startWelcomeFlow();
    checkAiStatus();
  }, []);

  // Countdown timer when AI is unavailable
  useEffect(() => {
    if (resetCountdown === null) return;
    if (resetCountdown <= 0) {
      setAiUnavailable(false);
      setResetCountdown(null);
      localStorage.removeItem('taricai_budget_exceeded_at');
      return;
    }
    retryTimerRef.current = setTimeout(() => setResetCountdown(s => s - 1), 1000);
    return () => clearTimeout(retryTimerRef.current);
  }, [resetCountdown]);

  const startWelcomeFlow = () => {
    setMessages([{
      role: 'assistant',
      content: `¡Hola! 👋 Soy TaricAI, tu asistente de comercio internacional.

Puedo ayudarte con:
• Clasificación arancelaria de productos
• Cálculo de aranceles e impuestos
• Requisitos de importación/exportación
• Tratados comerciales entre países
• Documentación necesaria

¿Qué tipo de operación quieres realizar?`,
      options: [
        { label: '📦 Importar un producto', value: 'import', icon: '📦' },
        { label: '🚢 Exportar un producto', value: 'export', icon: '🚢' },
        { label: '📊 Consultar aranceles', value: 'tariffs', icon: '📊' },
        { label: '📋 Ver tratados comerciales', value: 'agreements', icon: '📋' },
        { label: '❓ Tengo otra pregunta', value: 'other', icon: '❓' },
      ],
      optionType: 'button'
    }]);
    setConversationStep('welcome');
  };

  const checkAiStatus = () => {
    // Check if a previous session recorded a budget exceeded error
    const budgetExceededAt = localStorage.getItem('taricai_budget_exceeded_at');
    if (budgetExceededAt) {
      const elapsed = Math.floor((Date.now() - parseInt(budgetExceededAt)) / 1000);
      const RESET_AFTER = 3600; // 1 hour estimated reset window
      const remaining = RESET_AFTER - elapsed;
      if (remaining > 0) {
        setAiUnavailable(true);
        setResetCountdown(remaining);
      } else {
        // Reset window passed — clear flag and let the user try again
        localStorage.removeItem('taricai_budget_exceeded_at');
      }
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSession = async (sid) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/session/${sid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionId(sid);
      setMessages(response.data.messages || []);
      if (response.data.context?.origin_country) {
        setOriginCountry(response.data.context.origin_country);
      }
      if (response.data.context?.destination_country) {
        setDestinationCountry(response.data.context.destination_country);
      }
    } catch (error) {
      toast.error('Error al cargar la sesión');
    }
  };

  const deleteSession = async (sid) => {
    try {
      await axios.delete(`${API_URL}/api/chat/session/${sid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(sessions.filter(s => s.session_id !== sid));
      if (sessionId === sid) {
        startNewChat();
      }
      toast.success('Sesión eliminada');
    } catch (error) {
      toast.error('Error al eliminar la sesión');
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setOriginCountry('');
    setDestinationCountry('');
    setProductInfo({});
    startWelcomeFlow();
  };

  const handleOptionSelect = (option) => {
    // Añadir el mensaje del usuario visualmente (para flujos welcome que no usan sendMessage)
    const messageText = typeof option === 'string' ? option : option.label || option;
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setTimeout(() => {
      processOption(option);
    }, 100);
  };

  // Manejar selección de opciones de clarificación generadas por Claude
  const handleClarificationSelect = (label, value) => {
    // Mostrar la selección del usuario en el chat, luego enviar sin re-añadir
    setMessages(prev => [...prev, { role: 'user', content: label }]);
    sendMessage(label, value, false);
  };

  const processOption = (option) => {
    const value = typeof option === 'object' ? option.value : option;

    switch (conversationStep) {
      case 'welcome':
        if (value === 'import' || value === 'export') {
          const isImport = value === 'import';
          setProductInfo(prev => ({ ...prev, operationType: value }));
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: isImport 
              ? `Perfecto, vamos a configurar tu importación. 🌍

Primero necesito saber: ¿De qué país vas a importar?`
              : `Perfecto, vamos a configurar tu exportación. 🌍

Primero necesito saber: ¿A qué país vas a exportar?`,
            options: []
          }]);
          setConversationStep(isImport ? 'select_origin' : 'select_destination');
        } else if (value === 'tariffs') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Para consultar aranceles, necesito algunos datos:

¿Entre qué países quieres consultar los aranceles?`,
            options: []
          }]);
          setConversationStep('select_origin');
        } else if (value === 'agreements') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Los principales tratados comerciales son:

🇪🇺 **Unión Europea** - Mercado único con 27 países
🌎 **USMCA/T-MEC** - USA, México, Canadá
🌏 **RCEP** - 15 países de Asia-Pacífico
🌎 **Alianza del Pacífico** - Chile, Colombia, México, Perú
🌎 **MERCOSUR** - Argentina, Brasil, Paraguay, Uruguay
🌏 **CPTPP** - 11 países del Pacífico

¿Quieres saber más sobre alguno de estos tratados?`,
            options: [
              { label: 'Unión Europea', value: 'eu' },
              { label: 'USMCA/T-MEC', value: 'usmca' },
              { label: 'RCEP', value: 'rcep' },
              { label: 'Alianza del Pacífico', value: 'pacific' },
              { label: 'MERCOSUR', value: 'mercosur' },
              { label: 'Hacer otra consulta', value: 'other' },
            ]
          }]);
          setConversationStep('agreements');
        } else {
          // handleOptionSelect ya añadió el mensaje — addToChat=false para no duplicar
          const text = typeof option === 'string' ? option : (option.label || 'Tengo una pregunta general');
          sendMessage(text, null, false);
        }
        break;

      case 'select_product_type':
        setProductInfo(prev => ({ ...prev, productType: value }));
        askProductDetails();
        break;

      default:
        // El mensaje ya fue añadido por handleOptionSelect — addToChat=false para evitar duplicado
        sendMessage(typeof option === 'string' ? option : option.label, null, false);
        break;
    }
  };

  const askProductDetails = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `¿Puedes describir tu producto con más detalle?

Por ejemplo:
• Material de fabricación
• Uso o función principal
• Características específicas

Cuanta más información me des, más precisa será la clasificación.`,
      options: []
    }]);
    setConversationStep('product_details');
  };

  const handleCountrySelect = (country, type) => {
    if (type === 'origin') {
      setOriginCountry(country);
      const countryInfo = ALL_COUNTRIES.find(c => c.code === country);
      setMessages(prev => [...prev, {
        role: 'user',
        content: `${countryInfo?.flag} ${countryInfo?.name}`
      }]);

      setTimeout(() => {
        if (productInfo.operationType === 'import' || !productInfo.operationType) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `${countryInfo?.flag} ${countryInfo?.name} como origen. ¡Perfecto!

¿A qué país vas a importar/enviar?`,
            options: []
          }]);
          setConversationStep('select_destination');
        } else {
          askProductType(country, destinationCountry);
        }
      }, 500);
    } else {
      setDestinationCountry(country);
      const countryInfo = ALL_COUNTRIES.find(c => c.code === country);
      setMessages(prev => [...prev, {
        role: 'user',
        content: `${countryInfo?.flag} ${countryInfo?.name}`
      }]);

      setTimeout(() => {
        askProductType(originCountry, country);
      }, 500);
    }
  };

  const askProductType = (overrideOrigin, overrideDest) => {
    const origin = overrideOrigin || originCountry;
    const dest = overrideDest || destinationCountry;
    const originInfo = ALL_COUNTRIES.find(c => c.code === origin);
    const destInfo = ALL_COUNTRIES.find(c => c.code === dest);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Operación: ${originInfo?.flag || ''} ${originInfo?.name || origin} → ${destInfo?.flag || ''} ${destInfo?.name || dest}

¿Qué tipo de producto quieres clasificar?`,
      options: [
        { label: '🍫 Alimentos y bebidas', value: 'food' },
        { label: '👕 Textiles y ropa', value: 'textiles' },
        { label: '📱 Electrónicos', value: 'electronics' },
        { label: '🔧 Maquinaria', value: 'machinery' },
        { label: '💊 Productos químicos/farmacéuticos', value: 'chemicals' },
        { label: '📦 Otro tipo de producto', value: 'other' },
      ]
    }]);
    setConversationStep('select_product_type');
  };

  const sendMessage = async (messageText = inputMessage, selectedOption = null, addToChat = true) => {
    if (!messageText.trim() || isLoading || sendingRef.current) return;

    sendingRef.current = true;
    if (addToChat) {
      setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    }
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/message`,
        {
          message: messageText,
          session_id: sessionId,
          origin_country: originCountry || undefined,
          destination_country: destinationCountry || undefined,
          language: 'es',
          selected_option: selectedOption || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Verificar si se necesita clarificación
      if (response.data.needs_clarification && response.data.clarification_request) {
        const clarification = response.data.clarification_request;
        // El texto explicativo va antes de la pregunta (solo si hay texto)
        const explanationText = (response.data.response || '').trim();
        const fullContent = explanationText
          ? `${explanationText}\n\n**${clarification.question}**`
          : `**${clarification.question}**`;
        const assistantMessage = {
          role: 'assistant',
          content: fullContent,
          isClarification: true,
          clarificationOptions: clarification.options,
          allowCustom: clarification.allow_custom,
          customPlaceholder: clarification.custom_placeholder
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          sources: response.data.sources,
          options: response.data.suggested_questions?.length > 0 
            ? response.data.suggested_questions.slice(0, 4)
            : null
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Actualizar contexto si viene en la respuesta
      if (response.data.context) {
        if (response.data.context.origin_country && !originCountry) {
          setOriginCountry(response.data.context.origin_country);
        }
        if (response.data.context.destination_country && !destinationCountry) {
          setDestinationCountry(response.data.context.destination_country);
        }
      }

      setSessionId(response.data.session_id);
      setConversationStep('chat'); // Entering free-chat mode; disable welcome-flow branch logic
      loadSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      const detail = error.response?.data?.detail || '';
      const status = error.response?.status;

      if (detail === 'BUDGET_EXCEEDED' || status === 503) {
        // Persist timestamp so banner survives page reloads
        if (!localStorage.getItem('taricai_budget_exceeded_at')) {
          localStorage.setItem('taricai_budget_exceeded_at', Date.now().toString());
        }
        setAiUnavailable(true);
        setResetCountdown(3600);
      } else if (status === 429) {
        toast.error('Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.');
      } else if (status === 504) {
        toast.error('La consulta tardó demasiado. Intenta con una pregunta más corta.');
      } else {
        const errMsg = detail || 'Error al enviar el mensaje. Intenta de nuevo.';
        toast.error(errMsg);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ ${errMsg}`,
          isError: true
        }]);
      }
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getCountryName = (code) => {
    const country = ALL_COUNTRIES.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  return (
    <div className="flex h-[calc(100vh-150px)] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Sidebar de sesiones */}
      {showSidebar && (
        <div className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <Button 
              onClick={startNewChat} 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Nueva conversación
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    sessionId === session.session_id 
                      ? 'bg-cyan-500/20 border border-cyan-500/30' 
                      : 'hover:bg-slate-800'
                  }`}
                  onClick={() => loadSession(session.session_id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {session.context?.origin_country && session.context?.destination_country 
                        ? `${getCountryName(session.context.origin_country)} → ${getCountryName(session.context.destination_country)}`
                        : 'Consulta general'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(session.updated_at || session.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.session_id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No hay conversaciones previas</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col">
        {/* Header con selectores de país */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4 flex-wrap">
            <CountrySelector
              value={originCountry}
              onChange={(code) => handleCountrySelect(code, 'origin')}
              label="País de Origen"
              placeholder="Seleccionar..."
            />
            
            <div className="flex items-center">
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </div>
            
            <CountrySelector
              value={destinationCountry}
              onChange={(code) => handleCountrySelect(code, 'destination')}
              label="País de Destino"
              placeholder="Seleccionar..."
            />
            
            {originCountry && destinationCountry && (
              <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 ml-auto">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ruta configurada
              </Badge>
            )}
          </div>
        </div>

        {/* Mensajes */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            {messages.map((message, idx) => (
              <ChatMessage 
                key={idx} 
                message={message} 
                isUser={message.role === 'user'}
                onOptionSelect={handleOptionSelect}
                onClarificationSelect={handleClarificationSelect}
              />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analizando tu consulta...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* AI Unavailable Banner */}
        {aiUnavailable && (
          <div className="border-t border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-amber-950/80 backdrop-blur-sm px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                  <p className="text-amber-300 font-semibold text-sm whitespace-nowrap">
                    Asistente IA no disponible
                  </p>
                  <p className="text-amber-400/60 text-xs hidden sm:block">
                    El cupo del período actual se ha agotado. Se restablece automáticamente.
                  </p>
                </div>

                {/* Time badge */}
                {resetCountdown !== null && resetCountdown > 0 && (() => {
                  const availableAt = new Date(Date.now() + resetCountdown * 1000);
                  const hh = String(availableAt.getHours()).padStart(2, '0');
                  const mm = String(availableAt.getMinutes()).padStart(2, '0');
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono font-bold text-amber-200 whitespace-nowrap flex-shrink-0">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Vuelve a las {hh}:{mm}
                    </span>
                  );
                })()}

                {/* Dismiss */}
                <button
                  onClick={() => {
                    setAiUnavailable(false);
                    setResetCountdown(null);
                    localStorage.removeItem('taricai_budget_exceeded_at');
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500/40 hover:text-amber-300 hover:bg-amber-500/10 flex-shrink-0 transition-all"
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={aiUnavailable ? "Servicio temporalmente no disponible..." : "Escribe tu pregunta sobre comercio internacional..."}
                  className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 pr-4 py-6 rounded-xl focus:border-cyan-500"
                  disabled={isLoading || aiUnavailable}
                  data-testid="chat-input"
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading || aiUnavailable}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-auto px-6 rounded-xl"
                data-testid="chat-send-button"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              TaricAI proporciona información de fuentes oficiales. Verifica siempre con las autoridades competentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
