-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  full_name character varying,
  role character varying DEFAULT 'admin'::character varying,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  auth_user_id uuid,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  icon character varying,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  active boolean DEFAULT true,
  cover_image text,
  video_url text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL,
  subject character varying,
  message text NOT NULL,
  status character varying DEFAULT 'unread'::character varying CHECK (status::text = ANY (ARRAY['unread'::character varying, 'read'::character varying, 'replied'::character varying, 'archived'::character varying]::text[])),
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.external_links (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  label_en character varying NOT NULL,
  label_tr character varying,
  url character varying NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT external_links_pkey PRIMARY KEY (id),
  CONSTRAINT external_links_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.hero_slides (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type character varying CHECK (type::text = ANY (ARRAY['image'::character varying, 'video'::character varying]::text[])),
  url character varying NOT NULL,
  thumbnail_url character varying,
  title character varying,
  subtitle text,
  cta_text_en character varying,
  cta_text_tr character varying,
  cta_link character varying,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hero_slides_pkey PRIMARY KEY (id)
);
CREATE TABLE public.media (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  type character varying CHECK (type::text = ANY (ARRAY['image'::character varying, 'video'::character varying, 'document'::character varying]::text[])),
  url character varying NOT NULL,
  thumbnail_url character varying,
  title character varying,
  caption_en text,
  caption_tr text,
  display_order integer DEFAULT 0,
  size_bytes bigint,
  mime_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  media_type character varying CHECK (media_type::text = ANY (ARRAY['image'::character varying, 'video'::character varying, 'document'::character varying, 'before_after'::character varying]::text[])),
  before_url character varying,
  after_url character varying,
  layout text DEFAULT 'masonry'::text CHECK (layout = ANY (ARRAY['single'::text, 'masonry'::text])),
  CONSTRAINT media_pkey PRIMARY KEY (id),
  CONSTRAINT media_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.project_categories (
  project_id uuid NOT NULL,
  category_id uuid NOT NULL,
  display_order integer DEFAULT 0,
  CONSTRAINT project_categories_pkey PRIMARY KEY (project_id, category_id),
  CONSTRAINT project_categories_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.project_content_blocks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  block_type character varying NOT NULL CHECK (block_type::text = ANY (ARRAY['text'::character varying, 'image'::character varying, 'video'::character varying, 'gallery'::character varying, 'quote'::character varying, 'code'::character varying, 'embed'::character varying]::text[])),
  media_url character varying,
  media_urls ARRAY,
  metadata jsonb,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  content text,
  CONSTRAINT project_content_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT project_content_blocks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.project_tags (
  project_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT project_tags_pkey PRIMARY KEY (project_id, tag_id),
  CONSTRAINT project_tags_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug character varying NOT NULL UNIQUE,
  category_id uuid,
  title character varying NOT NULL,
  blurb text NOT NULL,
  content_en text,
  content_tr text,
  cover_image character varying,
  year integer,
  role_en character varying,
  role_tr character varying,
  client character varying,
  status character varying DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'published'::character varying]::text[])),
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  cover_video_url text,
  testimonials jsonb,
  display_order integer DEFAULT 0,
  project_type character varying,
  layout_type character varying DEFAULT 'default'::character varying,
  background_color character varying DEFAULT '#ffffff'::character varying,
  text_color character varying DEFAULT '#ffffff'::character varying,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text,
  setting_type character varying DEFAULT 'text'::character varying,
  category character varying DEFAULT 'general'::character varying,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  logo_light_url text,
  logo_dark_url text,
  carousel_autoplay boolean DEFAULT true,
  carousel_interval integer DEFAULT 5000,
  video_autoplay boolean DEFAULT true,
  site_name text,
  site_description text,
  company_name text,
  company_tagline text,
  contact_email text,
  contact_phone text,
  contact_address text,
  logo_url text,
  logo_alt text,
  favicon_url text,
  about_title text,
  about_text text,
  about_image_url text,
  footer_explore_title text,
  footer_contact_title text,
  footer_bottom_text text,
  footer_copyright_text text,
  contact_page_title text,
  contact_page_subtitle text,
  contact_info_title text,
  contact_info_description text,
  working_hours_title text,
  working_hours_monday_friday text,
  working_hours_saturday text,
  working_hours_sunday text,
  contact_consent_text text,
  homepage_fields_title text,
  homepage_fields_subtitle text,
  social_instagram text,
  social_twitter text,
  social_linkedin text,
  social_behance text,
  social_dribbble text,
  social_youtube text,
  admin_email character varying DEFAULT 'admin@craftedanomaly.com'::character varying,
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tech_stack (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  name character varying NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tech_stack_pkey PRIMARY KEY (id),
  CONSTRAINT tech_stack_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);