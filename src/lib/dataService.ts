import { getSupabase } from './supabase';
import { WeddingSettings, Guest, Wish, GalleryItem, SpecialMessage } from '../types';

const DEFAULT_WEDDING_ID = 'joao-paula-2026';

const DEFAULT_SETTINGS: WeddingSettings = {
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

// Helper for localStorage fallback
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(`wedding_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`wedding_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

export async function getWeddingSettings(): Promise<WeddingSettings> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('wedding_settings')
        .select('*')
        .eq('wedding_id', DEFAULT_WEDDING_ID)
        .single();
      if (data && !error) {
        setLocal('settings', data);
        return data as WeddingSettings;
      }
    } catch (e) {
      console.warn('Supabase fetch settings failed, falling back to local/cache:', e);
    }
  }
  return getLocal('settings', DEFAULT_SETTINGS);
}

export async function updateWeddingSettings(settings: Partial<WeddingSettings>): Promise<WeddingSettings> {
  const current = await getWeddingSettings();
  const updated: WeddingSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString()
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb
        .from('wedding_settings')
        .upsert({ ...updated, wedding_id: DEFAULT_WEDDING_ID }, { onConflict: 'wedding_id' });
      if (error) throw error;
    } catch (e) {
      console.error('Supabase update settings error:', e);
      throw e;
    }
  }
  setLocal('settings', updated);
  return updated;
}

export async function getGuests(): Promise<Guest[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('guests')
        .select('*')
        .eq('wedding_id', DEFAULT_WEDDING_ID)
        .order('created_at', { ascending: false });
      if (data && !error) {
        setLocal('guests', data);
        return data as Guest[];
      }
    } catch (e) {
      console.warn('Supabase fetch guests failed:', e);
    }
  }
  return getLocal('guests', DEFAULT_GUESTS);
}

export async function createGuest(guest: Omit<Guest, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>): Promise<Guest> {
  const newGuest: Guest = {
    id: 'g_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...guest,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('guests').insert([newGuest]);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase create guest error:', e);
    }
  }

  const current = await getGuests();
  const updated = [newGuest, ...current];
  setLocal('guests', updated);
  return newGuest;
}

export async function updateGuestStatus(id: string, status: 'pending' | 'confirmed' | 'declined'): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('guests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    } catch (e) {
      console.error('Supabase update guest error:', e);
    }
  }
  const current = await getGuests();
  const updated = current.map(g => g.id === id ? { ...g, status, updated_at: new Date().toISOString() } : g);
  setLocal('guests', updated);
}

export async function deleteGuest(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('guests').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete guest error:', e);
    }
  }
  const current = await getGuests();
  const updated = current.filter(g => g.id !== id);
  setLocal('guests', updated);
}

export async function getWishes(): Promise<Wish[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('wishes')
        .select('*')
        .eq('wedding_id', DEFAULT_WEDDING_ID)
        .order('created_at', { ascending: false });
      if (data && !error) {
        setLocal('wishes', data);
        return data as Wish[];
      }
    } catch (e) {
      console.warn('Supabase fetch wishes failed:', e);
    }
  }
  return getLocal('wishes', DEFAULT_WISHES);
}

export async function createWish(wish: Omit<Wish, 'id' | 'wedding_id' | 'created_at'>): Promise<Wish> {
  const newWish: Wish = {
    id: 'w_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...wish,
    created_at: new Date().toISOString()
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('wishes').insert([newWish]);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase create wish error:', e);
    }
  }

  const current = await getWishes();
  const updated = [newWish, ...current];
  setLocal('wishes', updated);
  return newWish;
}

export async function deleteWish(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('wishes').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete wish error:', e);
    }
  }
  const current = await getWishes();
  const updated = current.filter(w => w.id !== id);
  setLocal('wishes', updated);
}

export async function getGallery(): Promise<GalleryItem[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('gallery')
        .select('*')
        .eq('wedding_id', DEFAULT_WEDDING_ID)
        .order('sort_order', { ascending: true });
      if (data && !error) {
        setLocal('gallery', data);
        return data as GalleryItem[];
      }
    } catch (e) {
      console.warn('Supabase fetch gallery failed:', e);
    }
  }
  return getLocal('gallery', DEFAULT_GALLERY);
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'wedding_id' | 'created_at'>): Promise<GalleryItem> {
  const newItem: GalleryItem = {
    id: 'gal_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...item,
    created_at: new Date().toISOString()
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('gallery').insert([newItem]);
      if (error) throw error;
    } catch (e) {
      console.error('Supabase add gallery error:', e);
    }
  }

  const current = await getGallery();
  const updated = [...current, newItem];
  setLocal('gallery', updated);
  return newItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('gallery').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete gallery error:', e);
    }
  }
  const current = await getGallery();
  const updated = current.filter(g => g.id !== id);
  setLocal('gallery', updated);
}

export async function getSpecialMessages(): Promise<SpecialMessage[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('special_messages')
        .select('*')
        .eq('wedding_id', DEFAULT_WEDDING_ID);
      if (data && !error) {
        setLocal('special_messages', data);
        return data as SpecialMessage[];
      }
    } catch (e) {
      console.warn('Supabase fetch special messages failed:', e);
    }
  }
  return getLocal('special_messages', DEFAULT_SPECIAL_MESSAGES);
}

export async function saveSpecialMessage(msg: Omit<SpecialMessage, 'id' | 'wedding_id' | 'created_at'>): Promise<SpecialMessage> {
  const newMsg: SpecialMessage = {
    id: 'sm_' + Math.random().toString(36).substring(2, 9),
    wedding_id: DEFAULT_WEDDING_ID,
    ...msg,
    created_at: new Date().toISOString()
  };
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('special_messages').insert([newMsg]);
    } catch (e) {
      console.error('Supabase save special message error:', e);
    }
  }
  const current = await getSpecialMessages();
  const updated = [newMsg, ...current];
  setLocal('special_messages', updated);
  return newMsg;
}

export async function deleteSpecialMessage(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('special_messages').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete special message error:', e);
    }
  }
  const current = await getSpecialMessages();
  const updated = current.filter(m => m.id !== id);
  setLocal('special_messages', updated);
}

// Upload file to Supabase Storage bucket ('wedding-assets') with fallback to data URL if storage isn't configured yet
export async function uploadImageToStorage(file: File, folder: string = 'images'): Promise<string> {
  const sb = getSupabase();
  if (sb) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await sb.storage.from('wedding-assets').upload(fileName, file);
      if (!uploadError) {
        const { data } = sb.storage.from('wedding-assets').getPublicUrl(fileName);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error (bucket might need creation):', uploadError);
      }
    } catch (e) {
      console.warn('Supabase storage upload exception:', e);
    }
  }

  // Fallback: convert to base64 / object URL for immediate display if storage bucket is not yet set up
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
