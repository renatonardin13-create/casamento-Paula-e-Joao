import React, { useState, useEffect } from 'react';
import { WeddingSettings, GalleryItem, Wish, SpecialMessage } from '../types';
import { getGuests, createGuest, getWishes, createWish, getGallery, getSpecialMessages } from '../lib/dataService';
import { Calendar, Clock, MapPin, Heart, MessageCircle, Gift, Camera, Send, CheckCircle2, Navigation, Sparkles, Phone, User, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  settings: WeddingSettings;
  onDataRefreshNeeded: () => void;
  onOpenAdminLogin: () => void;
}

export function PublicInvitation({ settings, onDataRefreshNeeded, onOpenAdminLogin }: Props) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [specialMessages, setSpecialMessages] = useState<SpecialMessage[]>([]);
  
  // RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCompanions, setGuestCompanions] = useState(0);
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined'>('confirmed');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Wish Form State
  const [wishName, setWishName] = useState('');
  const [wishPhone, setWishPhone] = useState('');
  const [wishText, setWishText] = useState('');
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wishSuccess, setWishSuccess] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [gallery.length]);

  useEffect(() => {
    const targetDate = new Date(`${settings.wedding_date}T${settings.wedding_time}:00`);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.wedding_date, settings.wedding_time]);

  async function loadPublicData() {
    try {
      const [gal, wis, spec] = await Promise.all([
        getGallery(),
        getWishes(),
        getSpecialMessages()
      ]);
      setGallery(gal);
      setWishes(wis);
      setSpecialMessages(spec);
    } catch (e) {
      console.error('Error loading public data:', e);
    }
  }

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setRsvpSubmitting(true);
    try {
      await createGuest({
        name: guestName.trim(),
        phone: guestPhone.trim() || 'Não informado',
        companions: Number(guestCompanions),
        status: rsvpStatus
      });
      setRsvpSuccess(true);
      onDataRefreshNeeded();
      setTimeout(() => {
        setRsvpSuccess(false);
        setGuestName('');
        setGuestPhone('');
        setGuestCompanions(0);
      }, 4000);
    } catch (e) {
      console.error('RSVP error:', e);
      alert('Erro ao enviar RSVP. Tente novamente.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishText.trim()) return;
    setWishSubmitting(true);
    try {
      await createWish({
        guest_name: wishName.trim(),
        phone: wishPhone.trim() || 'Não informado',
        message: wishText.trim()
      });
      setWishSuccess(true);
      loadPublicData();
      onDataRefreshNeeded();
      setTimeout(() => {
        setWishSuccess(false);
        setWishName('');
        setWishPhone('');
        setWishText('');
      }, 4000);
    } catch (e) {
      console.error('Wish error:', e);
      alert('Erro ao enviar mensagem para o mural.');
    } finally {
      setWishSubmitting(false);
    }
  };

  const formatDateString = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-800 text-white px-4 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={settings.hero_image_url} 
            alt="Capa do Casamento"
            className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            style={{ 
              objectPosition: 'center 15%',
              opacity: settings.hero_opacity ?? 0.75 
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-stone-950/40" />

        <div className="relative z-10 max-w-2xl mx-auto text-center bg-stone-950/85 backdrop-blur-md border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <span className="inline-block font-sans text-xs uppercase tracking-[0.3em] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-1.5 rounded-full">
            Com a bênção de Deus e de nossos pais
          </span>

          <h1 className="font-romantic text-5xl sm:text-6xl md:text-7xl text-amber-100 tracking-wide drop-shadow-md">
            {settings.groom_name} <span className="text-amber-400 font-serif font-light text-3xl sm:text-4xl">&</span> {settings.bride_name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-stone-300 font-medium pt-1">
            <span className="flex items-center gap-1.5 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              {formatDateString(settings.wedding_date)}
            </span>
            <span className="flex items-center gap-1.5 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              {settings.wedding_time}h
            </span>
            <span className="flex items-center gap-1.5 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              {settings.venue_name}
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto pt-2">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 text-center shadow-md">
              <span className="block text-xl sm:text-2xl font-serif-display font-bold text-amber-300">{timeLeft.days}</span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Dias</span>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 text-center shadow-md">
              <span className="block text-xl sm:text-2xl font-serif-display font-bold text-amber-300">{timeLeft.hours}</span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Horas</span>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 text-center shadow-md">
              <span className="block text-xl sm:text-2xl font-serif-display font-bold text-amber-300">{timeLeft.minutes}</span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Min</span>
            </div>
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 text-center shadow-md">
              <span className="block text-xl sm:text-2xl font-serif-display font-bold text-amber-300">{timeLeft.seconds}</span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400">Seg</span>
            </div>
          </div>

          <div className="pt-2">
            <a 
              href="#rsvp" 
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-8 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-sm"
            >
              <Heart className="h-4 w-4 fill-stone-950" />
              <span>Confirmar Presença (RSVP)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Verse Section */}
      <section className="py-16 bg-white border-b border-stone-200 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <Sparkles className="h-6 w-6 text-amber-600 mx-auto" />
          <p className="font-serif-display italic text-lg sm:text-xl text-stone-700 leading-relaxed">
            {settings.verse_text}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200/80">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700">Nossa Jornada</span>
            <h2 className="text-3xl font-serif-display font-bold text-stone-900">Como Tudo Começou</h2>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              {settings.story_text}
            </p>
            <div className="pt-2 flex items-center gap-3 text-amber-800 font-medium text-sm">
              <Heart className="h-4 w-4 fill-amber-700" />
              <span>Para sempre juntos</span>
            </div>
          </div>
          <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-md">
            <img 
              src={settings.hero_image_url} 
              alt="Casal" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Special Messages / Dress Code (Synced from Central DB) */}
      {specialMessages.length > 0 && (
        <section className="py-12 px-4 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif-display font-bold text-stone-900">Informações Importantes</h2>
            <p className="text-xs text-stone-500 mt-1">Orientações centralizadas para os convidados</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {specialMessages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-2">
                <h3 className="font-serif-display font-bold text-amber-900 text-lg">{msg.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Venue & Map Section */}
      <section className="py-16 bg-stone-100 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700">Localização</span>
            <h2 className="text-3xl font-serif-display font-bold text-stone-900">{settings.venue_name}</h2>
            <p className="text-stone-600 max-w-md mx-auto text-sm">{settings.venue_address}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {settings.google_maps_url && (
              <a 
                href={settings.google_maps_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold px-6 py-3 rounded-xl shadow-xs transition-colors text-sm"
              >
                <MapPin className="h-4 w-4 text-red-600" />
                <span>Abrir no Google Maps</span>
              </a>
            )}
            {settings.waze_url && (
              <a 
                href={settings.waze_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-semibold px-6 py-3 rounded-xl shadow-xs transition-colors text-sm"
              >
                <Navigation className="h-4 w-4 text-cyan-600" />
                <span>Abrir no Waze</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 px-4 max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-stone-200">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700">Confirmação de Presença</span>
            <h2 className="text-3xl font-serif-display font-bold text-stone-900">RSVP</h2>
            <p className="text-sm text-stone-600">{settings.guest_message}</p>
          </div>

          {rsvpSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif-display font-bold text-emerald-900 text-lg">Presença Registrada com Sucesso!</h3>
              <p className="text-xs text-emerald-700">Seu status foi salvo na base central e já está visível para os noivos em qualquer dispositivo.</p>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Seu nome completo"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Número de Acompanhantes
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <select
                    value={guestCompanions}
                    onChange={(e) => setGuestCompanions(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                  >
                    <option value={0}>Apenas eu</option>
                    <option value={1}>1 Acompanhante</option>
                    <option value={2}>2 Acompanhantes</option>
                    <option value={3}>3 Acompanhantes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Confirmação
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('confirmed')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${rsvpStatus === 'confirmed' ? 'bg-amber-700 text-white border-amber-700 shadow-sm' : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'}`}
                  >
                    Sim, irei! 🎉
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('declined')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${rsvpStatus === 'declined' ? 'bg-rose-700 text-white border-rose-700 shadow-sm' : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'}`}
                  >
                    Não poderei ir 😢
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all mt-4 disabled:opacity-50"
              >
                {rsvpSubmitting ? 'Enviando...' : 'Enviar Confirmação'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Gallery Slideshow Section */}
      {gallery.length > 0 && (
        <section className="py-20 px-4 max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700">Álbuns & Momentos</span>
            <h2 className="text-3xl font-serif-display font-bold text-stone-900">Galeria de Fotos</h2>
            <p className="text-stone-500 text-sm">Momentos especiais da nossa história de amor</p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 aspect-[16/10] sm:aspect-[16/9] border border-stone-200">
            <div className="absolute inset-0">
              <img 
                src={gallery[currentSlide]?.image_url} 
                alt={gallery[currentSlide]?.caption || 'Foto do Casal'} 
                className="w-full h-full object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-center text-white space-y-2 z-10">
              <p className="font-serif-display text-lg sm:text-2xl font-medium tracking-wide text-amber-100">
                {gallery[currentSlide]?.caption || 'Nossos Momentos'}
              </p>
              <p className="text-xs text-stone-400">
                Foto {currentSlide + 1} de {gallery.length}
              </p>
            </div>

            {/* Navigation Buttons */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-lg z-20"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % gallery.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-lg z-20"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'}`}
                  aria-label={`Ir para foto ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Wishes / Mural Section */}
      <section className="py-20 bg-stone-100 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700">Livro de Visitas</span>
            <h2 className="text-3xl font-serif-display font-bold text-stone-900">Mural de Desejos</h2>
            <p className="text-stone-600 text-sm">Deixe sua mensagem de carinho para os noivos</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
            {wishSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs font-medium text-center">
                Mensagem enviada com sucesso ao mural central!
              </div>
            )}
            <form onSubmit={handleWishSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Seu Nome</label>
                  <input 
                    type="text" 
                    placeholder="Nome do convidado"
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Telefone (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999"
                    value={wishPhone}
                    onChange={(e) => setWishPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">Sua Mensagem</label>
                <textarea 
                  rows={3}
                  placeholder="Escreva seus votos de felicidade para o casal..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-600 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={wishSubmitting}
                className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Enviar Mensagem ao Mural</span>
              </button>
            </form>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {wishes.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif-display font-bold text-stone-900">{w.guest_name}</span>
                  <span className="text-[10px] text-stone-400">
                    {w.created_at ? new Date(w.created_at).toLocaleDateString('pt-BR') : 'Recentes'}
                  </span>
                </div>
                <p className="text-stone-600 text-sm italic leading-relaxed">"{w.message}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pix & Gift Registry */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 mx-auto">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="font-serif-display font-bold text-xl text-stone-900">Lista de Presentes</h3>
            <p className="text-sm text-stone-600">Preparamos uma lista carinhosa para nos ajudar na nossa lua de mel e nova casa.</p>
            {settings.gift_registry_url && (
              <a 
                href={settings.gift_registry_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Acessar Lista de Presentes
              </a>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-serif-display font-bold text-xl text-stone-900">Presente via PIX</h3>
            <p className="text-sm text-stone-600">Caso prefira nos presentear via PIX, utilize nossa chave abaixo ou o que Deus preparar:</p>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 font-mono text-xs text-stone-800 select-all">
              {settings.pix_key}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(settings.pix_key);
                alert('Chave PIX copiada para a área de transferência!');
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors"
            >
              Copiar Chave PIX
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12 px-4 text-center space-y-4">
        <h3 className="font-romantic text-4xl text-amber-200">{settings.groom_name} & {settings.bride_name}</h3>
        <p className="text-xs text-stone-400">07 de Novembro de 2026 • {settings.venue_name}</p>
        <div className="pt-4">
          <button
            onClick={onOpenAdminLogin}
            className="text-[11px] text-stone-500 hover:text-stone-300 underline transition-colors"
          >
            🔒 Acesso Restrito (Administrador)
          </button>
        </div>
      </footer>
    </div>
  );
}
