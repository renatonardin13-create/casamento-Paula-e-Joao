import React from 'react';
import { Heart, Settings, Database, ShieldCheck, Home } from 'lucide-react';

interface Props {
  view: 'public' | 'admin';
  onChangeView: (v: 'public' | 'admin') => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export function Navbar({ view, onChangeView, onOpenSupabaseModal, isSupabaseConnected }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChangeView('public')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Heart className="h-5 w-5 fill-amber-700/20 text-amber-700" />
          </div>
          <div>
            <span className="font-serif-display font-bold text-stone-900 text-lg">João & Paula</span>
            <span className="block text-[10px] tracking-wider uppercase text-stone-500">07 . 11 . 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isSupabaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            title="Status da Conexão Supabase"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isSupabaseConnected ? 'Supabase Conectado' : 'Configurar Supabase'}</span>
          </button>

          {view === 'public' ? (
            <button
              onClick={() => onChangeView('admin')}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Painel Admin</span>
            </button>
          ) : (
            <button
              onClick={() => onChangeView('public')}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Ver Convite Público</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
