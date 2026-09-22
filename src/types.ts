export interface WeddingSettings {
  id: string;
  wedding_id: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  wedding_time: string;
  venue_name: string;
  venue_address: string;
  google_maps_url: string;
  waze_url: string;
  hero_image_url: string;
  story_text: string;
  verse_text: string;
  guest_message: string;
  pix_key: string;
  gift_registry_url: string;
  background_image_url: string;
  music_url: string;
  music_enabled: boolean;
  whatsapp_message_confirmed: string;
  whatsapp_message_declined: string;
  updated_at?: string;
  created_at?: string;
}

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  phone: string;
  companions: number;
  status: 'pending' | 'confirmed' | 'declined';
  created_at?: string;
  updated_at?: string;
}

export interface Wish {
  id: string;
  wedding_id: string;
  guest_name: string;
  phone: string;
  message: string;
  created_at?: string;
}

export interface GalleryItem {
  id: string;
  wedding_id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at?: string;
}

export interface SpecialMessage {
  id: string;
  wedding_id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at?: string;
}
