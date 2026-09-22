import React, { useState, useEffect } from 'react';
import { WeddingSettings } from './types';
import { getWeddingSettings } from './lib/dataService';
import { getSupabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { PublicInvitation } from './components/PublicInvitation';
import { AdminPanel } from './components/AdminPanel';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Heart } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const checkConnection = () => {
    const sb = getSupabase();
    setIsSupabaseConnected(!!sb);
  };

  const checkAuth = () => {
    const auth = sessionStorage.getItem('admin_auth') === 'true';
    setIsAdminAuthenticated(auth);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWeddingSettings();
      setSettings(data);
    } catch (e) {
      console.error('Error loading wedding settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    checkAuth();
    loadData();
  }, []);

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 animate-pulse border border-amber-300">
          <Heart className="h-8 w-8 fill-amber-700/20 text-amber-700" />
        </div>
        <p className="font-serif-display text-lg text-stone-700">Carregando convite de João & Paula...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans-text">
      <Navbar 
        view={view} 
        onChangeView={(v) => {
          if (v === 'admin' && !isAdminAuthenticated) {
            setIsAdminLoginOpen(true);
          } else {
            setView(v);
          }
        }} 
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={() => {
          sessionStorage.removeItem('admin_auth');
          setIsAdminAuthenticated(false);
          setView('public');
        }}
      />

      {view === 'public' || !isAdminAuthenticated ? (
        <PublicInvitation 
          settings={settings} 
          onDataRefreshNeeded={loadData} 
        />
      ) : (
        <AdminPanel 
          initialSettings={settings} 
          onSettingsUpdated={(newSets) => setSettings(newSets)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      )}

      <SupabaseSetupModal 
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSuccess={() => {
          checkConnection();
          loadData();
        }}
      />

      <AdminLoginModal 
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setView('admin');
        }}
      />
    </div>
  );
}
