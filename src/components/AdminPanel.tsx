import React, { useState, useEffect } from 'react';
import { WeddingSettings, Guest, Wish, GalleryItem, SpecialMessage } from '../types';
import { 
  getWeddingSettings, updateWeddingSettings, 
  getGuests, updateGuestStatus, deleteGuest, 
  getWishes, deleteWish, 
  getGallery, addGalleryItem, deleteGalleryItem, 
  getSpecialMessages, saveSpecialMessage, deleteSpecialMessage,
  uploadImageToStorage 
} from '../lib/dataService';
import { 
  Users, Settings, Image as ImageIcon, MessageSquare, Sparkles, 
  Save, Trash2, CheckCircle2, XCircle, Clock, Plus, Upload, Database, Shield, RefreshCw 
} from 'lucide-react';

interface Props {
  initialSettings: WeddingSettings;
  onSettingsUpdated: (newSettings: WeddingSettings) => void;
  onOpenSupabaseModal: () => void;
}

export function AdminPanel({ initialSettings, onSettingsUpdated, onOpenSupabaseModal }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'settings' | 'gallery' | 'wishes' | 'special'>('dashboard');
  
  // Settings Form State
  const [settings, setSettings] = useState<WeddingSettings>(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Guests List State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestFilter, setGuestFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');

  // Gallery State
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [newCaption, setNewCaption] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Wishes State
  const [wishes, setWishes] = useState<Wish[]>([]);

  // Special Messages State
  const [specialMessages, setSpecialMessages] = useState<SpecialMessage[]>([]);
  const [newSmTitle, setNewSmTitle] = useState('');
  const [newSmContent, setNewSmContent] = useState('');

  // Loading state
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoadingData(true);
    try {
      const [sets, gsts, wshs, gal, sm] = await Promise.all([
        getWeddingSettings(),
        getGuests(),
        getWishes(),
        getGallery(),
        getSpecialMessages()
      ]);
      setSettings(sets);
      setGuests(gsts);
      setWishes(wshs);
      setGallery(gal);
      setSpecialMessages(sm);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const updated = await updateWeddingSettings(settings);
      setSettings(updated);
      onSettingsUpdated(updated);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (e) {
      console.error('Error saving settings:', e);
      alert('Erro ao salvar configurações no Supabase.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToStorage(file, 'hero');
      setSettings(prev => ({ ...prev, hero_image_url: url }));
    } catch (err) {
      console.error('Upload hero error:', err);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToStorage(file, 'bg');
      setSettings(prev => ({ ...prev, background_image_url: url }));
    } catch (err) {
      console.error('Upload background error:', err);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToStorage(file, 'gallery');
      await addGalleryItem({
        image_url: url,
        caption: newCaption || 'Momento Especial',
        sort_order: gallery.length + 1
      });
      setNewCaption('');
      const updatedGal = await getGallery();
      setGallery(updatedGal);
    } catch (err) {
      console.error('Gallery upload error:', err);
      alert('Erro ao enviar imagem para a galeria.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSpecialMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmTitle || !newSmContent) return;
    try {
      await saveSpecialMessage({
        title: newSmTitle,
        content: newSmContent,
        is_active: true
      });
      setNewSmTitle('');
      setNewSmContent('');
      const updatedSm = await getSpecialMessages();
      setSpecialMessages(updatedSm);
    } catch (e) {
      console.error('Error saving special message:', e);
    }
  };

  const filteredGuests = guests.filter(g => {
    if (guestFilter === 'confirmed') return g.status === 'confirmed';
    if (guestFilter === 'pending') return g.status === 'pending';
    if (guestFilter === 'declined') return g.status === 'declined';
    return true;
  });

  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;
  const totalCompanions = guests
    .filter(g => g.status === 'confirmed')
    .reduce((acc, curr) => acc + 1 + Number(curr.companions || 0), 0);

  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white py-8 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold">
              <Shield className="h-4 w-4" />
              <span>Painel Administrativo Centralizado</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold mt-1">
              {settings.groom_name} & {settings.bride_name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Sincronizar Dados</span>
            </button>
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Configurar Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex overflow-x-auto space-x-2 sm:space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: RefreshCw },
            { id: 'guests', label: `Convidados (${guests.length})`, icon: Users },
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'gallery', label: `Galeria (${gallery.length})`, icon: ImageIcon },
            { id: 'wishes', label: `Mural (${wishes.length})`, icon: MessageSquare },
            { id: 'special', label: 'Mensagens Especiais', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-amber-600 text-amber-700' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Confirmados (Total)</p>
                  <p className="text-3xl font-serif-display font-bold text-emerald-700 mt-1">{totalCompanions} pessoas</p>
                  <p className="text-xs text-stone-400 mt-1">{confirmedCount} registros principais</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Pendentes</p>
                  <p className="text-3xl font-serif-display font-bold text-amber-600 mt-1">{pendingCount}</p>
                  <p className="text-xs text-stone-400 mt-1">Aguardando resposta</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Não poderão ir</p>
                  <p className="text-3xl font-serif-display font-bold text-rose-600 mt-1">{declinedCount}</p>
                  <p className="text-xs text-stone-400 mt-1">Ausências confirmadas</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Mural de Desejos</p>
                  <p className="text-3xl font-serif-display font-bold text-stone-900 mt-1">{wishes.length}</p>
                  <p className="text-xs text-stone-400 mt-1">Mensagens de carinho</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
              <h3 className="font-serif-display font-bold text-xl text-stone-900">Garantia de Sincronização Centralizada</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Este painel administra a fonte oficial de dados no Supabase PostgreSQL. Qualquer alteração feita aqui ou no convite público por qualquer dispositivo (celular, tablet, outro computador, 4G/5G) é instantaneamente persistida no banco central, garantindo que o estado seja idêntico para todos os visitantes.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <span className="block font-semibold text-stone-800 text-sm">Banco de Dados</span>
                  <span className="text-xs text-stone-500">Tabelas `wedding_settings`, `guests`, `wishes`, `gallery`</span>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <span className="block font-semibold text-stone-800 text-sm">Supabase Storage</span>
                  <span className="text-xs text-stone-500">Armazenamento oficial de imagens em nuvem</span>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <span className="block font-semibold text-stone-800 text-sm">Independência de IP</span>
                  <span className="text-xs text-stone-500">Funciona em qualquer rede ou operador sem cache local</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GUESTS TAB */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-display font-bold text-xl text-stone-900">Lista de Convidados & RSVP</h3>
                <p className="text-xs text-stone-500 mt-1">Gerencie as confirmações recebidas de qualquer dispositivo</p>
              </div>
              <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
                {(['all', 'confirmed', 'pending', 'declined'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setGuestFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      guestFilter === f ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'confirmed' ? 'Confirmados' : f === 'pending' ? 'Pendentes' : 'Recusados'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500 font-semibold">
                    <th className="py-4 px-6">Nome do Convidado</th>
                    <th className="py-4 px-6">Telefone</th>
                    <th className="py-4 px-6">Acompanhantes</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-sm">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">Nenhum convidado encontrado nesta categoria.</td>
                    </tr>
                  ) : (
                    filteredGuests.map(g => (
                      <tr key={g.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6 font-medium text-stone-900">{g.name}</td>
                        <td className="py-4 px-6 text-stone-600">{g.phone}</td>
                        <td className="py-4 px-6 text-stone-600">+{g.companions}</td>
                        <td className="py-4 px-6">
                          <select
                            value={g.status}
                            onChange={async (e) => {
                              await updateGuestStatus(g.id, e.target.value as any);
                              const updated = await getGuests();
                              setGuests(updated);
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                              g.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              g.status === 'declined' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                              'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="confirmed">Confirmado</option>
                            <option value="pending">Pendente</option>
                            <option value="declined">Recusado</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={async () => {
                              if (confirm(`Deseja excluir o convidado ${g.name}?`)) {
                                await deleteGuest(g.id);
                                const updated = await getGuests();
                                setGuests(updated);
                              }
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Excluir Convidado"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif-display font-bold text-xl text-stone-900">Configurações Centrais do Casamento</h3>
                <p className="text-xs text-stone-500 mt-1">Alterações salvas aqui serão refletidas instantaneamente em todos os dispositivos</p>
              </div>
              {settingsSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold border border-emerald-200 animate-pulse">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Salvo com sucesso no Supabase!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Nome do Noivo</label>
                  <input 
                    type="text" 
                    value={settings.groom_name}
                    onChange={(e) => setSettings({ ...settings, groom_name: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Nome da Noiva</label>
                  <input 
                    type="text" 
                    value={settings.bride_name}
                    onChange={(e) => setSettings({ ...settings, bride_name: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Data do Casamento</label>
                  <input 
                    type="date" 
                    value={settings.wedding_date}
                    onChange={(e) => setSettings({ ...settings, wedding_date: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Horário</label>
                  <input 
                    type="text" 
                    value={settings.wedding_time}
                    onChange={(e) => setSettings({ ...settings, wedding_time: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Nome do Local</label>
                  <input 
                    type="text" 
                    value={settings.venue_name}
                    onChange={(e) => setSettings({ ...settings, venue_name: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Endereço do Local</label>
                  <input 
                    type="text" 
                    value={settings.venue_address}
                    onChange={(e) => setSettings({ ...settings, venue_address: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Google Maps URL</label>
                  <input 
                    type="url" 
                    value={settings.google_maps_url}
                    onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Waze URL</label>
                  <input 
                    type="url" 
                    value={settings.waze_url}
                    onChange={(e) => setSettings({ ...settings, waze_url: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hero Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Fotografia Principal (Hero Image) - Supabase Storage
                </label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="text" 
                    value={settings.hero_image_url}
                    onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                    className="flex-1 rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none font-mono text-xs"
                  />
                  <label className="cursor-pointer bg-stone-900 hover:bg-stone-800 text-white font-semibold px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? 'Enviando...' : 'Fazer Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Chave PIX</label>
                  <input 
                    type="text" 
                    value={settings.pix_key}
                    onChange={(e) => setSettings({ ...settings, pix_key: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">URL Lista de Presentes</label>
                  <input 
                    type="url" 
                    value={settings.gift_registry_url}
                    onChange={(e) => setSettings({ ...settings, gift_registry_url: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Texto da História</label>
                <textarea 
                  rows={3}
                  value={settings.story_text}
                  onChange={(e) => setSettings({ ...settings, story_text: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Versículo</label>
                <input 
                  type="text" 
                  value={settings.verse_text}
                  onChange={(e) => setSettings({ ...settings, verse_text: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingSettings ? 'Salvando no Supabase...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <h3 className="font-serif-display font-bold text-xl text-stone-900 mb-4">Adicionar Foto à Galeria Central</h3>
              <div className="grid sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Legenda da Foto</label>
                  <input 
                    type="text"
                    placeholder="Ex: Ensaio Pré-Wedding"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Selecionar Imagem (Supabase Storage)</label>
                  <label className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? 'Enviando imagem...' : 'Escolher Arquivo & Enviar'}</span>
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 group">
                  <div className="relative aspect-video">
                    <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover" />
                    <button
                      onClick={async () => {
                        if (confirm('Deseja excluir esta foto da galeria?')) {
                          await deleteGalleryItem(item.id);
                          setGallery(await getGallery());
                        }
                      }}
                      className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-xl shadow opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-stone-800 text-sm">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WISHES TAB */}
        {activeTab === 'wishes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
            <div>
              <h3 className="font-serif-display font-bold text-xl text-stone-900">Mural de Desejos (Mensagens dos Convidados)</h3>
              <p className="text-xs text-stone-500 mt-1">Mensagens enviadas de qualquer dispositivo aparecem aqui instantaneamente</p>
            </div>

            <div className="space-y-4">
              {wishes.length === 0 ? (
                <p className="text-stone-400 text-center py-8">Nenhuma mensagem no mural ainda.</p>
              ) : (
                wishes.map(w => (
                  <div key={w.id} className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-display font-bold text-stone-900 text-base">{w.guest_name}</span>
                        <span className="text-xs text-stone-400">({w.phone})</span>
                      </div>
                      <p className="text-stone-700 text-sm italic">"{w.message}"</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Deseja remover esta mensagem?')) {
                          await deleteWish(w.id);
                          setWishes(await getWishes());
                        }
                      }}
                      className="text-stone-400 hover:text-rose-600 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SPECIAL MESSAGES TAB (NEW FEATURE TEST) */}
        {activeTab === 'special' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <h3 className="font-serif-display font-bold text-xl text-stone-900 mb-2">Adicionar Mensagem Especial / Dress Code</h3>
              <p className="text-xs text-stone-500 mb-6">Recurso dinâmico sincronizado centralmente com a base de dados</p>

              <form onSubmit={handleAddSpecialMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Título</label>
                  <input 
                    type="text"
                    placeholder="Ex: Sugestão de Traje"
                    value={newSmTitle}
                    onChange={(e) => setNewSmTitle(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Conteúdo</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalhes ou instruções para os convidados..."
                    value={newSmContent}
                    onChange={(e) => setNewSmContent(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-xs transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publicar Mensagem Especial</span>
                </button>
              </form>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {specialMessages.map(sm => (
                <div key={sm.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-display font-bold text-stone-900 text-lg">{sm.title}</h4>
                    <button
                      onClick={async () => {
                        await deleteSpecialMessage(sm.id);
                        setSpecialMessages(await getSpecialMessages());
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{sm.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
