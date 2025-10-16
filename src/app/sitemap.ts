import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://craftedanomaly.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  // Category pages
  const categories = [
    'visual-design',
    'spatial-design', 
    'films',
    'games',
    'books'
  ]

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic project pages (guard envs at build-time)
  let projectPages: any[] = []
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (SUPABASE_URL && SUPABASE_ANON) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
      const { data: projects } = await supabase
        .from('projects')
        .select('slug, updated_at')
        .eq('status', 'published')

      if (projects) {
        projectPages = projects.map((project: { slug: string; updated_at: string }) => ({
          url: `${baseUrl}/projects/${project.slug}`,
          lastModified: new Date(project.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      }
    } catch (error) {
      console.error('Error fetching projects for sitemap:', error)
    }
  } else {
    // Env vars not present at build-time; skip dynamic entries
    // Build will still succeed with static + category pages
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...projectPages,
  ]
}
