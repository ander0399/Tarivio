import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, BellOff, Mail, Plus, Trash2, Loader2, 
  CheckCircle, AlertTriangle, Globe, Package
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AlertSubscriptionPanel({ token }) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [hsCodes, setHsCodes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [newHsCode, setNewHsCode] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API}/api/alerts/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.subscription) {
        setSubscription(response.data.subscription);
        setHsCodes(response.data.subscription.hs_codes || []);
        setCountries(response.data.subscription.countries || []);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubscription();
    }
  }, [token]);

  const addHsCode = () => {
    const code = newHsCode.trim().toUpperCase();
    if (!code) return;
    if (hsCodes.includes(code)) {
      toast.error('Este código ya está en la lista');
      return;
    }
    setHsCodes(prev => [...prev, code]);
    setNewHsCode('');
  };

  const removeHsCode = (code) => {
    setHsCodes(prev => prev.filter(c => c !== code));
  };

  const addCountry = () => {
    const country = newCountry.trim().toUpperCase();
    if (!country) return;
    if (countries.includes(country)) {
      toast.error('Este país ya está en la lista');
      return;
    }
    setCountries(prev => [...prev, country]);
    setNewCountry('');
  };

  const removeCountry = (country) => {
    setCountries(prev => prev.filter(c => c !== country));
  };

  const saveSubscription = async () => {
    if (hsCodes.length === 0 && countries.length === 0) {
      toast.error('Agrega al menos un código HS o país para monitorear');
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${API}/api/alerts/subscribe`,
        {
          hs_codes: hsCodes,
          countries: countries,
          email_notifications: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Suscripción a alertas guardada');
      fetchSubscription();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar suscripción');
    } finally {
      setSaving(false);
    }
  };

  const unsubscribe = async () => {
    try {
      await axios.delete(`${API}/api/alerts/unsubscribe`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(null);
      setHsCodes([]);
      setCountries([]);
      toast.success('Suscripción cancelada');
    } catch (error) {
      toast.error('Error al cancelar suscripción');
    }
  };

  const sendTestEmail = async () => {
    setSendingTest(true);
    try {
      const response = await axios.post(
        `${API}/api/alerts/test-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        toast.success('Email de prueba enviado. Revisa tu bandeja de entrada.');
      } else {
        toast.warning(response.data.message || 'El servicio de email no está configurado');
      }
    } catch (error) {
      toast.error('Error al enviar email de prueba');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Alertas de Cambios Arancelarios
        </CardTitle>
        <CardDescription className="text-gray-400">
          Recibe notificaciones por email cuando cambien los aranceles de tus productos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Estado de la suscripción */}
        {subscription?.active && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Alertas Activas</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={unsubscribe}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <BellOff className="w-4 h-4 mr-1" />
                Desactivar
              </Button>
            </div>
          </div>
        )}

        {/* Códigos HS a monitorear */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Package className="w-4 h-4 text-cyan-400" />
            Códigos HS a Monitorear
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newHsCode}
              onChange={(e) => setNewHsCode(e.target.value)}
              placeholder="Ej: 1801.00.00"
              className="flex-1 bg-slate-800 border-slate-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && addHsCode()}
            />
            <Button onClick={addHsCode} className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {hsCodes.map((code, idx) => (
              <Badge 
                key={idx} 
                className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 flex items-center gap-2"
              >
                <span className="font-mono">{code}</span>
                <button onClick={() => removeHsCode(code)} className="hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {hsCodes.length === 0 && (
              <span className="text-gray-500 text-sm">No hay códigos seleccionados</span>
            )}
          </div>
        </div>

        {/* Países a monitorear */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Globe className="w-4 h-4 text-purple-400" />
            Países de Interés
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder="Ej: ES, US, CN"
              className="flex-1 bg-slate-800 border-slate-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && addCountry()}
            />
            <Button onClick={addCountry} className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {countries.map((country, idx) => (
              <Badge 
                key={idx} 
                className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 flex items-center gap-2"
              >
                <span>{country}</span>
                <button onClick={() => removeCountry(country)} className="hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {countries.length === 0 && (
              <span className="text-gray-500 text-sm">No hay países seleccionados</span>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="mb-1">Recibirás notificaciones cuando:</p>
              <ul className="list-disc list-inside text-xs text-amber-200/80 space-y-1">
                <li>Cambien los aranceles de los códigos HS monitoreados</li>
                <li>Se modifiquen requisitos de importación en los países seleccionados</li>
                <li>Entren en vigor nuevos tratados comerciales</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={saveSubscription}
            disabled={saving || (hsCodes.length === 0 && countries.length === 0)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                {subscription?.active ? 'Actualizar Alertas' : 'Activar Alertas'}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={sendTestEmail}
            disabled={sendingTest}
            className="border-slate-600 text-gray-300 hover:bg-slate-800"
          >
            {sendingTest ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email de Prueba
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
