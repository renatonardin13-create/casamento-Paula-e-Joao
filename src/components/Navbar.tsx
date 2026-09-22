import React from 'react';
import { Heart, Settings, Database, ShieldCheck, Home } from 'lucide-react';

interface Props {
  view: 'public' | 'admin';
  onChangeView: (v: 'public' | 'admin') => void;
  onOpenSupabaseModal: () => void;
  onOpenAdminLogin: () => void;
  isSupabaseConnected: boolean;
  isAdminAuthenticated: boolean;
  onLogoutAdmin: () => void;
}

export function Navbar({ 
  view, 
  onChangeView, 
  onOpenSupabaseModal, 
  onOpenAdminLogin,
  isSupabaseConnected, 
  isAdminAuthenticated,
  onLogoutAdmin 
}: Props) {
  // If public view, render a clean, minimalist header without admin or supabase config buttons for the public
  if (view === 'public') {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Heart className="h-5 w-5 fill-amber-700/20 text-amber-700" />
            </div>
            <div>
              <span className="font-serif-display font-bold text-stone-900 text-lg">João & Paula</span>
              <span className="block text-[10px] tracking-wider uppercase text-stone-500">07 . 11 . 2026</span>
            </div>
          </div>
          {/* Public view has zero admin/supabase buttons visible */}
          <div className="text-xs text-stone-400 font-medium">
            Convite Oficial
          </div>
        </div>
      </header>
    );
  }

  // Admin view header
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChangeView('public')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Heart className="h-5 w-5 fill-amber-400/20 text-amber-400" />
          </div>
          <div>
            <span className="font-serif-display font-bold text-white text-lg">Painel Administrativo</span>
            <span className="block text-[10px] tracking-wider uppercase text-amber-400">João & Paula</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isSupabaseConnected 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900' 
                : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 animate-pulse'
            }`}
            title="Status da Conexão Supabase"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isSupabaseConnected ? 'Supabase Conectado' : 'Configurar Supabase'}</span>
          </button>

          <button
            onClick={() => onChangeView('public')}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Ver Convite Público</span>
          </button>

          <button
            onClick={onLogoutAdmin}
            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
