import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Globe, ExternalLink, RefreshCw, MessageSquare, Trash2, ChevronDown, Loader2, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Lista de países principales para el selector
const MAIN_COUNTRIES = [
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'AE', name: 'Emiratos Árabes', flag: '🇦🇪' },
  { code: 'SA', name: 'Arabia Saudita', flag: '🇸🇦' },
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬' },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷' },
];

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-md' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'
      }`}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium mb-2 opacity-70">Fuentes oficiales:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.slice(0, 4).map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 rounded-full px-2 py-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {source.name.length > 25 ? source.name.substring(0, 25) + '...' : source.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  );
};

const SuggestedQuestions = ({ questions, onSelect }) => {
  if (!questions || questions.length === 0) return null;
  
  return (
    <div className="mb-4">
      <p className="text-xs text-slate-500 mb-2">Preguntas sugeridas:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(question)}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1.5 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function InternationalChatPage({ token }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [context, setContext] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
    // Mensaje de bienvenida
    setMessages([{
      role: 'assistant',
      content: `¡Hola! Soy TaricAI, tu asistente experto en comercio internacional. 🌍

Puedo ayudarte con:
• **Clasificación arancelaria** de productos (códigos HS/TARIC)
• **Aranceles e impuestos** entre países
• **Requisitos fitosanitarios** y regulaciones
• **Tratados comerciales** que pueden reducir tus costos
• **Documentación** necesaria para importar/exportar

Para comenzar, selecciona el **país de origen** y **destino** de tu operación, o simplemente hazme una pregunta.

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
      sources: []
    }]);
    
    setSuggestedQuestions([
      '¿Cuáles son los requisitos para exportar de Colombia a España?',
      '¿Qué tratados comerciales tiene México con la Unión Europea?',
      '¿Cuál es el arancel para importar textiles de China a USA?',
      '¿Qué documentos necesito para exportar alimentos a Alemania?'
    ]);
  }, []);

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
      setContext(response.data.context || {});
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
    setMessages([{
      role: 'assistant',
      content: `¡Nueva conversación iniciada! 🆕

Selecciona los países de origen y destino, o hazme una pregunta sobre comercio internacional.`,
      timestamp: new Date().toISOString(),
      sources: []
    }]);
    setOriginCountry('');
    setDestinationCountry('');
    setContext({});
    setSuggestedQuestions([
      '¿Cuáles son los requisitos para exportar de Colombia a España?',
      '¿Qué tratados comerciales tiene México con la Unión Europea?',
      '¿Cuál es el arancel para importar textiles de China a USA?'
    ]);
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
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
          language: 'es'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        sources: response.data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.data.session_id);
      setSuggestedQuestions(response.data.suggested_questions || []);
      setContext(response.data.context || {});
      
      // Actualizar lista de sesiones
      loadSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje. Intenta de nuevo.');
      
      // Remover mensaje del usuario si falló
      setMessages(prev => prev.filter(m => m !== userMessage));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Sidebar de sesiones */}
      {showSidebar && (
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <Button 
              onClick={startNewChat} 
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Nueva conversación
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    sessionId === session.session_id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => loadSession(session.session_id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.context?.origin_country && session.context?.destination_country 
                        ? `${session.context.origin_country} → ${session.context.destination_country}`
                        : 'Consulta general'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {new Date(session.updated_at || session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.session_id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {sessions.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No hay conversaciones previas
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col">
        {/* Header con selectores de país */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Origen:</span>
              <Select value={originCountry} onValueChange={setOriginCountry}>
                <SelectTrigger className="w-[180px]" data-testid="origin-country-select">
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {MAIN_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <ChevronDown className="w-5 h-5 text-slate-400 rotate-[-90deg]" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Destino:</span>
              <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                <SelectTrigger className="w-[180px]" data-testid="destination-country-select">
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {MAIN_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {originCountry && destinationCountry && (
              <Badge variant="outline" className="ml-auto">
                <Info className="w-3 h-3 mr-1" />
                Contexto: {originCountry} → {destinationCountry}
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
              />
            ))}
            
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analizando tu consulta...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Preguntas sugeridas y input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto">
            <SuggestedQuestions 
              questions={suggestedQuestions} 
              onSelect={(q) => sendMessage(q)} 
            />
            
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta sobre comercio internacional..."
                className="flex-1"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={!inputMessage.trim() || isLoading}
                data-testid="chat-send-button"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-slate-400 mt-2 text-center">
              TaricAI proporciona información de fuentes oficiales. Verifica siempre con las autoridades competentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
