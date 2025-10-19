export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          category_id: string | null;
          title: string;
          blurb: string;
          content: string | null;
          cover_image: string | null;
          year: number | null;
          role: string | null;
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
          title: string;
          blurb: string;
          content?: string | null;
          cover_image?: string | null;
          year?: number | null;
          role?: string | null;
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
          title?: string;
          blurb?: string;
          content?: string | null;
          cover_image?: string | null;
          year?: number | null;
          role?: string | null;
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
          name: string;
          description: string | null;
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
          caption: string | null;
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
