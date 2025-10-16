export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_tr: string;
  desc_en?: string;
  desc_tr?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  poster_url?: string;
  alt_en?: string;
  alt_tr?: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  label_en: string;
  label_tr: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title_en: string;
  title_tr: string;
  blurb_en?: string;
  blurb_tr?: string;
  year?: number;
  role_en?: string;
  role_tr?: string;
  client?: string;
  category_id: string;
  cover_media_id?: string;
  gallery_media_ids: string[];
  tags: string[];
  tech_stack: string[];
  external_links: Array<{
    label: string;
    url: string;
  }>;
  is_published: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category;
  cover_media?: Media;
  gallery_media?: Media[];
}

export interface HeroSlide {
  id: string;
  scope: 'home' | 'category';
  category_id?: string;
  media_id: string;
  title_en?: string;
  title_tr?: string;
  cta_label_en?: string;
  cta_label_tr?: string;
  cta_href?: string;
  order: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  media?: Media;
  category?: Category;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface MenuItem {
  label_en: string;
  label_tr: string;
  href: string;
}

export interface Menu {
  id: string;
  key: string;
  items: MenuItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
  updated_at: string;
}

export interface I18nEntry {
  id: string;
  ns: string;
  key: string;
  en: string;
  tr: string;
  created_at: string;
  updated_at: string;
}
