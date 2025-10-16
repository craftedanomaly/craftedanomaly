import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

  // Dynamic project pages
  let projectPages: any[] = []
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at, categories(slug)')
      .eq('status', 'published')

    if (projects) {
      projectPages = projects.map(project => ({
        url: `${baseUrl}/projects/${project.slug}`,
        lastModified: new Date(project.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error)
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...projectPages,
  ]
}
