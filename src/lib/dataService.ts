import { getSupabase } from './supabase';
import { WeddingSettings, Guest, Wish, GalleryItem, SpecialMessage } from '../types';

export const DEFAULT_WEDDING_ID = 'joao-paula-2026';

export const DEFAULT_SETTINGS: WeddingSettings = {
  id: '1',
  wedding_id: DEFAULT_WEDDING_ID,
  groom_name: 'João Carlos Marques',
  bride_name: 'Paula Fortunato',
  wedding_date: '2026-11-07',
  wedding_time: '20:00',
  venue_name: 'Espaço Villa Bella & Jardins',
  venue_address: 'Alameda das Acácias, 500 - Jardim Botânico, São Paulo - SP',
  google_maps_url: 'https://maps.google.com/?q=Espaco+Villa+Bella+Jardins',
  waze_url: 'https://waze.com/ul?q=Espaco+Villa+Bella+Jardins',
  hero_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
  story_text: 'Tivemos a certeza de que queríamos passar o resto de nossas vidas juntos em uma noite inesquecível sob as estrelas. Desde então, nossa jornada tem sido repleta de amor, cumplicidade e sonhos compartilhados.',
  verse_text: '“O amor é paciente, o amor é benigno; o amor não arde em ciúmes, não se ufana, não se ensoberbece.” — 1 Coríntios 13:4',
  guest_message: 'Sua presença é o nosso maior presente! Por favor, confirme sua presença para que possamos celebrar juntos este momento tão especial.',
  pix_key: 'casamento@joaopaulamarques.com.br',
  gift_registry_url: 'https://noivos.exemplo.com/joao-e-paula',
  background_image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80',
  hero_opacity: 0.7,
  music_url: '',
  music_enabled: false,
  whatsapp_message_confirmed: 'Olá! Confirmo minha presença no casamento de João & Paula. Estamos muito felizes!',
  whatsapp_message_declined: 'Olá! Infelizmente não poderei comparecer, mas desejo toda a felicidade do mundo ao casal João & Paula.',
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString()
};

const DEFAULT_GALLERY: GalleryItem[] = [
  { id: '1', wedding_id: DEFAULT_WEDDING_ID, image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80', caption: 'Nosso Noivado', sort_order: 1 },
  { id: '2', wedding_id: DEFAULT_WEDDING_ID, image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80', caption: 'Ensaio Pré-Wedding', sort_order: 2 },
  { id: '3', wedding_id: DEFAULT_WEDDING_ID, image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80', caption: 'Momentos Felizes', sort_order: 3 },
  { id: '4', wedding_id: DEFAULT_WEDDING_ID, image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80', caption: 'Contagem Regressiva', sort_order: 4 }
];

const DEFAULT_GUESTS: Guest[] = [
  { id: '1', wedding_id: DEFAULT_WEDDING_ID, name: 'Mariana Silva', phone: '+55 11 98888-1111', companions: 1, status: 'confirmed' },
  { id: '2', wedding_id: DEFAULT_WEDDING_ID, name: 'Carlos Eduardo', phone: '+55 11 97777-2222', companions: 2, status: 'pending' }
];

const DEFAULT_WISHES: Wish[] = [
  { id: '1', wedding_id: DEFAULT_WEDDING_ID, guest_name: 'Ana Beatriz', phone: '+55 11 96666-3333', message: 'Que alegria ver vocês realizarem esse sonho! Muito amor e cumplicidade nesta nova jornada.' }
];

const DEFAULT_SPECIAL_MESSAGES: SpecialMessage[] = [
  { id: '1', wedding_id: DEFAULT_WEDDING_ID, title: 'Dress Code Sugerido', content: 'Esporte Fino / Passeio. Sugerimos tons pastéis para as madrinhas e terno sem gravata para os padrinhos.', is_active: true }
];

async function withTimeout<T>(queryFactory: () => PromiseLike<T>, timeoutMs = 5000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs);
  });
  try {
    const result = await Promise.race([queryFactory(), timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export async function getWeddingSettings(): Promise<WeddingSettings> {
  const sb = getSupabase();
  if (!sb) {
    console.warn('Supabase not configured. Using default settings.');
    return DEFAULT_SETTINGS;
  }

  const { data, error } = await withTimeout(() =>
    sb.from('wedding_settings').select('*').eq('wedding_id', DEFAULT_WEDDING_ID).maybeSingle()
  );

  if (error) {
    throw error;
  }

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  return data as WeddingSettings;
}

export async function updateWeddingSettings(settings: Partial<WeddingSettings>): Promise<WeddingSettings> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const current = await getWeddingSettings();
  const updated: WeddingSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await sb
    .from('wedding_settings')
    .select('id')
    .eq('wedding_id', DEFAULT_WEDDING_ID)
    .maybeSingle();

  if (existing && existing.id) {
    const { error } = await sb
      .from('wedding_settings')
      .update(updated)
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await sb
      .from('wedding_settings')
      .insert([{ ...updated, wedding_id: DEFAULT_WEDDING_ID }]);
    if (error) throw error;
  }

  return updated;
}

export async function getGuests(): Promise<Guest[]> {
  const sb = getSupabase();
  if (!sb) {
    return DEFAULT_GUESTS;
  }

  const { data, error } = await withTimeout(() =>
    sb.from('guests').select('*').eq('wedding_id', DEFAULT_WEDDING_ID).order('created_at', { ascending: false })
  );

  if (error) {
    throw error;
  }

  return (data && data.length > 0 ? data : DEFAULT_GUESTS) as Guest[];
}

export async function createGuest(guest: Omit<Guest, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>): Promise<Guest> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const newGuest: Guest = {
    id: 'g_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...guest,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await sb.from('guests').insert([newGuest]);
  if (error) throw error;

  return newGuest;
}

export async function updateGuestStatus(id: string, status: 'pending' | 'confirmed' | 'declined'): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const { error } = await sb
    .from('guests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteGuest(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const { error } = await sb.from('guests').delete().eq('id', id);
  if (error) throw error;
}

export async function getWishes(): Promise<Wish[]> {
  const sb = getSupabase();
  if (!sb) {
    return DEFAULT_WISHES;
  }

  const { data, error } = await withTimeout(() =>
    sb.from('wishes').select('*').eq('wedding_id', DEFAULT_WEDDING_ID).order('created_at', { ascending: false })
  );

  if (error) throw error;

  return (data && data.length > 0 ? data : DEFAULT_WISHES) as Wish[];
}

export async function createWish(wish: Omit<Wish, 'id' | 'wedding_id' | 'created_at'>): Promise<Wish> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const newWish: Wish = {
    id: 'w_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...wish,
    created_at: new Date().toISOString()
  };

  const { error } = await sb.from('wishes').insert([newWish]);
  if (error) throw error;

  return newWish;
}

export async function deleteWish(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const { error } = await sb.from('wishes').delete().eq('id', id);
  if (error) throw error;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const sb = getSupabase();
  if (!sb) {
    return DEFAULT_GALLERY;
  }

  const { data, error } = await withTimeout(() =>
    sb.from('gallery').select('*').eq('wedding_id', DEFAULT_WEDDING_ID).order('sort_order', { ascending: true })
  );

  if (error) throw error;

  return (data && data.length > 0 ? data : DEFAULT_GALLERY) as GalleryItem[];
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'wedding_id' | 'created_at'>): Promise<GalleryItem> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const newItem: GalleryItem = {
    id: 'gal_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...item,
    created_at: new Date().toISOString()
  };

  const { error } = await sb.from('gallery').insert([newItem]);
  if (error) throw error;

  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const { error } = await sb.from('gallery').delete().eq('id', id);
  if (error) throw error;
}

export async function getSpecialMessages(): Promise<SpecialMessage[]> {
  const sb = getSupabase();
  if (!sb) {
    return DEFAULT_SPECIAL_MESSAGES;
  }

  const { data, error } = await withTimeout(() =>
    sb.from('special_messages').select('*').eq('wedding_id', DEFAULT_WEDDING_ID)
  );

  if (error) throw error;

  return (data && data.length > 0 ? data : DEFAULT_SPECIAL_MESSAGES) as SpecialMessage[];
}

export async function saveSpecialMessage(msg: Omit<SpecialMessage, 'id' | 'wedding_id' | 'created_at'>): Promise<SpecialMessage> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const newMsg: SpecialMessage = {
    id: 'sm_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...msg,
    created_at: new Date().toISOString()
  };

  const { error } = await sb.from('special_messages').insert([newMsg]);
  if (error) throw error;

  return newMsg;
}

export async function deleteSpecialMessage(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado.');
  }

  const { error } = await sb.from('special_messages').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadImageToStorage(file: File, folder: string = 'images'): Promise<string> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  
  const { error: uploadError } = await sb.storage.from('wedding-assets').upload(fileName, file, {
    cacheControl: '3600',
    upsert: true
  });
  
  if (uploadError) {
    console.error('Supabase Storage Upload Error Details:', uploadError);
    throw new Error(`Erro no Storage do Supabase: ${uploadError.message || 'Falha ao enviar arquivo'}. Verifique se o bucket 'wedding-assets' existe e possui políticas RLS configuradas.`);
  }

  const { data } = sb.storage.from('wedding-assets').getPublicUrl(fileName);
  if (!data?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do arquivo enviado.');
  }

  return data.publicUrl;
}
