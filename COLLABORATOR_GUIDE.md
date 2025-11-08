# Collaborator Guide - Crafted Anomaly Portfolio

## 🎯 Welcome!

This guide is for external collaborators working on the frontend of the Crafted Anomaly portfolio website.

## 🔒 Security & Access

### Environment Variables

This project uses environment variables to store sensitive information like API keys and database credentials. These are **NEVER** stored in Git.

#### Setup Process

1. After cloning the repository, copy the example file:
   ```bash
   cp env.example .env.local
   ```

2. Contact the project owner to receive the actual values for all environment variables

3. Fill in your `.env.local` file with the provided credentials

4. **NEVER** commit `.env.local` to Git (it's already in `.gitignore`)

#### Required Environment Variables

- **Supabase**: Database and authentication
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

- **Resend**: Email service for contact form
  - `RESEND_API_KEY`

- **Cloudflare R2**: File storage and CDN
  - `NEXT_PUBLIC_R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `NEXT_PUBLIC_R2_BUCKET_NAME`
  - `NEXT_PUBLIC_R2_CDN_URL`

### Security Rules

❌ **NEVER DO THIS:**
- Commit `.env.local` or any file with real API keys
- Hardcode API keys or secrets in the code
- Share credentials in chat, email, or public channels
- Push sensitive data to Git history

✅ **ALWAYS DO THIS:**
- Use `process.env.VARIABLE_NAME` to access environment variables
- Keep `.env.local` only on your local machine
- Update `env.example` if you add new variables (with placeholder values only)
- Ask the project owner if you need additional credentials

## 🛠️ Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install

# Set up environment variables (see above)
cp env.example .env.local

# Start development server
npm run dev
```

### Working with Git

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: description of your changes"

# Push to your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### Code Style

- **TypeScript**: All code must be properly typed
- **Formatting**: Use Prettier (runs automatically)
- **Components**: Follow existing patterns in `/src/components`
- **Naming**: Use descriptive names, follow existing conventions

### Testing Your Changes

Before submitting a PR:

1. Test on desktop and mobile viewports
2. Check both English and Turkish languages
3. Verify all interactive elements work
4. Check console for errors
5. Test with different browsers if possible

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [category]/        # Dynamic category pages
│   ├── projects/          # Project detail pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer, Navigation
│   ├── home/              # Homepage components
│   ├── category/          # Category page components
│   ├── projects/          # Project detail components
│   └── admin/             # Admin panel components
├── lib/
│   ├── supabase.ts        # Database client (uses env vars)
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utility functions
└── messages/
    ├── en.json            # English translations
    └── tr.json            # Turkish translations
```

## 🎨 Design System

### Colors

The project uses custom Crafted Anomaly brand colors defined in `globals.css`:

- **Background**: `#0b0b0c` (dark)
- **Foreground**: `#e6e6e6` (light text)
- **Accent**: `#e8ff3a` (yellow/lime)
- **Card**: `#151517` (slightly lighter than background)
- **Ruby**: `#b80f26` (red accent)
- **Ocean**: `#00796b` (teal accent)
- **Gold**: `#c9a74a` (gold accent)
- **Indigo**: `#1f3a5f` (blue accent)

### Typography

- **Font**: Poppins (400, 500, 700 weights)
- Use semantic HTML headings (h1, h2, h3)
- Follow existing text size patterns

### Components

- Use shadcn/ui components from `/src/components/ui`
- Follow existing component patterns
- Keep components small and focused
- Use TypeScript interfaces for props

## 🌐 Internationalization

The site supports English and Turkish:

- Translations are in `/src/messages/en.json` and `/src/messages/tr.json`
- Use `useTranslations()` hook from next-intl
- Always add translations for both languages
- Test language switching

## 🐛 Common Issues

### "Supabase connection error"
- Check your `.env.local` file has correct credentials
- Verify you've received credentials from project owner

### "Module not found"
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next` and restart dev server

### "Type errors"
- Check `/src/lib/types.ts` for type definitions
- Ensure all props are properly typed

## 📞 Getting Help

If you encounter issues:

1. Check this guide and README.md
2. Review existing code for patterns
3. Check Git history for similar implementations
4. Contact the project owner

## ✅ Pre-PR Checklist

Before submitting a Pull Request:

- [ ] Code follows existing patterns and style
- [ ] No console errors or warnings
- [ ] Tested on mobile and desktop
- [ ] Both languages (EN/TR) work correctly
- [ ] No hardcoded values or secrets
- [ ] TypeScript types are correct
- [ ] `.env.local` is NOT committed
- [ ] Commit messages are descriptive

## 🚀 Deployment

You don't need to worry about deployment - the project owner handles this. Just focus on:

- Writing clean, working code
- Following the patterns in this guide
- Testing your changes thoroughly
- Creating clear Pull Requests

---

**Remember**: This is a production website for a design studio. Quality and attention to detail matter!
