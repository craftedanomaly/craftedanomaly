# Crafted Anomaly Portfolio

A bilingual (EN/TR), mobile-first, museum-grade portfolio website for Crafted Anomaly design studio built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

- **Bilingual Support**: English and Turkish with next-intl
- **Modern Stack**: Next.js 15 (App Router), TypeScript, TailwindCSS v4
- **Design System**: shadcn/ui components with custom Crafted Anomaly branding
- **Responsive**: Mobile-first design with full responsive layout
- **Animations**: Framer Motion for smooth page transitions and micro-interactions
- **CMS**: Supabase for content management with admin panel
- **Typography**: Poppins font (400/500/700 weights)
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support

## 🎨 Brand Colors

- **Background**: `#0b0b0c`
- **Foreground**: `#e6e6e6`
- **Accent**: `#e8ff3a`
- **Card**: `#151517`
- **Muted**: `#9aa0a6`
- **Ruby**: `#b80f26`
- **Ocean**: `#00796b`
- **Gold**: `#c9a74a`
- **Indigo**: `#1f3a5f`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   ├── globals.css        # Global styles with custom CSS variables
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer, Navigation
│   └── home/             # Home page specific components
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── i18n/
│   └── request.ts        # next-intl configuration
└── messages/
    ├── en.json           # English translations
    └── tr.json           # Turkish translations
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Internationalization**: next-intl
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod validation
- **Email**: Resend
- **Font**: Poppins via next/font/google

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account (for production)

### Local Development

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd craftedwebsite
npm install
```

2. **Set up environment variables**:
```bash
cp env.example .env.local
```

Fill in your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_INTL_DEFAULT_LOCALE=en
RESEND_API_KEY=your_resend_api_key
```

3. **Set up Supabase** (optional for local development):
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db reset
```

4. **Start development server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Routes

- `/` - Home page with hero carousel and field accordion
- `/films` - Films portfolio
- `/mekan-tasarimi` - Spatial design portfolio  
- `/gorsel-tasarim` - Visual design portfolio
- `/afis-jenerik` - Poster & title design portfolio
- `/uygulama-tasarimi` - App design portfolio
- `/games` - Games portfolio
- `/books` - Books portfolio
- `/contact` - Contact page
- `/admin` - Admin panel (protected)

## 🗄️ Database Schema

Key tables:
- `categories` - Portfolio categories
- `projects` - Individual projects with media galleries
- `media` - Images and videos with metadata
- `tags` - Project tags for filtering
- `hero_slides` - Homepage and category hero carousels
- `contact_messages` - Contact form submissions
- `admin_users` - Admin authentication

## 🎯 Current Progress

### ✅ Completed
- [x] Project initialization with Next.js 15 + TypeScript
- [x] TailwindCSS v4 setup with custom Crafted Anomaly brand colors
- [x] shadcn/ui component library integration
- [x] next-intl bilingual support (EN/TR)
- [x] Supabase schema and database structure
- [x] Core layout components (Header, Footer, Navigation)
- [x] Home page with Hero Carousel and Field Accordion components
- [x] Responsive design with mobile-first approach
- [x] Framer Motion animations

### 🚧 In Progress
- [ ] Category pages with filtering and masonry grid
- [ ] Project detail pages with media galleries
- [ ] Admin panel with CRUD operations
- [ ] Contact form with Supabase integration

### 📋 Upcoming
- [ ] SEO optimization and OG image generation
- [ ] Performance optimizations
- [ ] Seed data and sample content
- [ ] Production deployment guide
- [ ] Testing setup

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://craftedanomaly.com
NEXT_INTL_DEFAULT_LOCALE=en
RESEND_API_KEY=your_resend_api_key
```

## 🤝 Contributing

This is a custom project for Crafted Anomaly. For any modifications or improvements, please follow the established patterns and maintain the brand consistency.

## 📄 License

Private project for Crafted Anomaly design studio.
