import React from 'react';
import { Heart, Home, Database } from 'lucide-react';

interface Props {
  view: 'public' | 'admin';
  onChangeView: (v: 'public' | 'admin') => void;
  onOpenAdminLogin: () => void;
  isSupabaseConnected: boolean;
  isAdminAuthenticated: boolean;
  onLogoutAdmin: () => void;
}

export function Navbar({ 
  view, 
  onChangeView, 
  isSupabaseConnected, 
  isAdminAuthenticated,
  onLogoutAdmin 
}: Props) {
  // If public view, render a clean, minimalist header without admin or supabase config buttons for the public
  if (view === 'public') {
    return (
      <header className="sticky top-0 z-40 bg-[#F8F5EF]/95 backdrop-blur-md border-b border-[#C7A45A]/20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123D2C]/10 text-[#123D2C] border border-[#C7A45A]/30">
              <Heart className="h-5 w-5 fill-[#123D2C]/20 text-[#123D2C]" />
            </div>
            <div>
              <span className="font-serif font-bold text-[#123D2C] text-lg tracking-wide">João & Paula</span>
              <span className="block text-[10px] tracking-widest uppercase text-[#123D2C]/70">07 . 11 . 2026</span>
            </div>
          </div>
          {/* Public view has zero admin/supabase buttons visible */}
          <div className="text-xs text-[#123D2C]/60 font-serif italic">
            Convite Oficial
          </div>
        </div>
      </header>
    );
  }

  // Admin view header
  return (
    <header className="sticky top-0 z-40 bg-[#0B241B] text-[#F8F5EF] border-b border-[#123D2C] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChangeView('public')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7A45A]/20 text-[#C7A45A] border border-[#C7A45A]/40">
            <Heart className="h-5 w-5 fill-[#C7A45A]/20 text-[#C7A45A]" />
          </div>
          <div>
            <span className="font-serif font-bold text-white text-lg tracking-wide">Painel Administrativo</span>
            <span className="block text-[10px] tracking-widest uppercase text-[#C7A45A]">João & Paula</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isSupabaseConnected 
              ? 'bg-[#123D2C] text-emerald-300 border-emerald-800' 
              : 'bg-amber-950 text-amber-300 border-amber-800'
          }`}>
            <Database className="h-3.5 w-3.5" />
            <span>{isSupabaseConnected ? 'Supabase Conectado (Env)' : 'Supabase Desconectado'}</span>
          </div>

          <button
            onClick={() => onChangeView('public')}
            className="flex items-center gap-2 bg-[#C7A45A] hover:bg-[#b5934e] text-[#0B241B] px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Ver Convite</span>
          </button>

          <button
            onClick={onLogoutAdmin}
            className="bg-[#123D2C] hover:bg-[#1a5540] text-[#F8F5EF] px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-[#C7A45A]/30"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
