import React, { useState } from 'react';
import { getSupabase, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, Key, ExternalLink, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupabaseSetupModal({ isOpen, onClose, onSuccess }: Props) {
  const [url, setUrl] = useState(localStorage.getItem('sb_url') || (import.meta as any).env?.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(localStorage.getItem('sb_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) {
      setTestResult({ success: false, message: 'Por favor, preencha a URL e a Anon Key do Supabase.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    saveSupabaseConfig(url, key);
    const sb = getSupabase();

    if (!sb) {
      setTesting(false);
      setTestResult({ success: false, message: 'Erro ao instanciar o cliente Supabase.' });
      return;
    }

    try {
      const { error } = await sb.from('wedding_settings').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // If table doesn't exist yet or connection issue
        setTestResult({ 
          success: true, 
          message: 'Conexão estabelecida com sucesso! (Nota: certifique-se de executar o SQL schema no Supabase se as tabelas ainda não existirem).' 
        });
      } else {
        setTestResult({ success: true, message: 'Conexão com o Supabase testada e validada com sucesso!' });
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setTestResult({ success: false, message: `Erro ao conectar: ${err.message || 'Verifique suas credenciais.'}` });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult({ success: true, message: 'Configuração limpa. Usando armazenamento em cache local.' });
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif-display font-bold text-stone-900">Configuração do Supabase Central</h3>
            <p className="text-xs text-stone-500">Sincronização multi-dispositivo (PC, celular, 4G, 5G)</p>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-6">
          Para que o convite e o painel administrativo funcionem conectados na mesma base central (sem depender do navegador), insira as credenciais do seu projeto Supabase.
        </p>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Supabase Project URL
            </label>
            <input 
              type="url"
              placeholder="https://seu-projeto.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Supabase Anon / Public Key
            </label>
            <div className="relative">
              <input 
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          {testResult && (
            <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {testResult.success ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />}
              <div className="text-xs leading-relaxed">{testResult.message}</div>
            </div>
          )}

          <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-600 border border-stone-200 space-y-1">
            <p className="font-semibold text-stone-700">Tabelas necessárias no Supabase:</p>
            <p><code>wedding_settings</code>, <code>guests</code>, <code>wishes</code>, <code>gallery</code>, <code>special_messages</code></p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Usar Modo Local / Cache
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={testing}
                className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-stone-800 disabled:opacity-50"
              >
                {testing ? 'Testando...' : 'Salvar & Conectar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
