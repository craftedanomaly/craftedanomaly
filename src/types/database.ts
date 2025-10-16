export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          category_id: string | null;
          title_en: string;
          title_tr: string | null;
          blurb_en: string;
          blurb_tr: string | null;
          content_en: string | null;
          content_tr: string | null;
          cover_image: string | null;
          year: number | null;
          role_en: string | null;
          role_tr: string | null;
          client: string | null;
          status: 'draft' | 'published';
          featured: boolean;
          view_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category_id?: string | null;
          title_en: string;
          title_tr?: string | null;
          blurb_en: string;
          blurb_tr?: string | null;
          content_en?: string | null;
          content_tr?: string | null;
          cover_image?: string | null;
          year?: number | null;
          role_en?: string | null;
          role_tr?: string | null;
          client?: string | null;
          status?: 'draft' | 'published';
          featured?: boolean;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          category_id?: string | null;
          title_en?: string;
          title_tr?: string | null;
          blurb_en?: string;
          blurb_tr?: string | null;
          content_en?: string | null;
          content_tr?: string | null;
          cover_image?: string | null;
          year?: number | null;
          role_en?: string | null;
          role_tr?: string | null;
          client?: string | null;
          status?: 'draft' | 'published';
          featured?: boolean;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_tr: string;
          description_en: string | null;
          description_tr: string | null;
          icon: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
      };
      media: {
        Row: {
          id: string;
          project_id: string | null;
          type: 'image' | 'video' | 'document';
          url: string;
          thumbnail_url: string | null;
          title: string | null;
          caption_en: string | null;
          caption_tr: string | null;
          display_order: number;
          size_bytes: number | null;
          mime_type: string | null;
          created_at: string;
        };
      };
    };
  };
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Media = Database['public']['Tables']['media']['Row'];
