import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Lock, KeyRound, Mail, X, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (password === '978512') {
      sessionStorage.setItem('admin_auth', 'true');
      setLoading(false);
      setPassword('');
      onSuccess();
      onClose();
      return;
    }

    const sb = getSupabase();
    if (sb) {
      try {
        // Try admin email with this password if configured in supabase auth
        const { data, error } = await sb.auth.signInWithPassword({ email: 'admin@joaopaulamarques.com.br', password });
        if (!error && data.session) {
          sessionStorage.setItem('admin_auth', 'true');
          setPassword('');
          onSuccess();
          onClose();
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    setLoading(false);
    setErrorMsg('Senha incorreta. Utilize a senha 978512.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#123D2C]/10 text-[#123D2C]">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900">Acesso Administrativo</h3>
            <p className="text-xs text-stone-500">Digite a senha de acesso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input 
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-3 text-sm focus:border-[#123D2C] focus:outline-none focus:ring-1 focus:ring-[#123D2C] font-mono tracking-widest"
                autoFocus
                required
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#123D2C] hover:bg-[#0B241B] text-white font-semibold py-3 text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? 'Entrando...' : 'Entrar no Painel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
