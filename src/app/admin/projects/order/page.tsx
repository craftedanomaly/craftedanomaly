'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { SortableList } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  cover_image: string;
  category_id: string;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProjectOrderPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin');
      } else {
        fetchCategories();
      }
    };
    checkAuth();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('active', true)
        .order('display_order');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const formattedCategories = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name || 'Unnamed',
        slug: cat.slug || ''
      }));

      setCategories(formattedCategories);
      if (formattedCategories.length > 0) {
        setSelectedCategory(formattedCategories[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchProjects();
    }
  }, [selectedCategory]);

  const fetchProjects = async () => {
    if (!selectedCategory) return;

    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select(`
          project_id,
          category_id,
          display_order,
          projects (
            id,
            title,
            cover_image
          )
        `)
        .eq('category_id', selectedCategory)
        .order('display_order');

      if (error) throw error;

      const formattedProjects = data.map((pc: any) => ({
        id: pc.project_id,
        title: pc.projects?.title || 'Untitled',
        cover_image: pc.projects?.cover_image,
        category_id: pc.category_id,
        display_order: pc.display_order || 0
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleReorder = (reorderedProjects: Project[]) => {
    setProjects(reorderedProjects);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update display_order in project_categories junction table
      const updates = projects.map((project, index) => ({
        project_id: project.id,
        category_id: selectedCategory,
        display_order: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('project_categories')
          .update({ display_order: update.display_order })
          .eq('project_id', update.project_id)
          .eq('category_id', update.category_id);

        if (error) throw error;
      }

      // Trigger on-demand revalidation for affected pages
      const categorySlug = categories.find(c => c.id === selectedCategory)?.slug;
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: ['/', categorySlug ? `/${categorySlug}` : '/'] })
      }).catch(() => {});

      toast.success('Project order saved successfully');
    } catch (error) {
      console.error('Error saving project order:', error);
      toast.error('Failed to save project order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Reorder Projects</h1>
        <p className="text-muted-foreground">
          Drag and drop projects to change their display order within each category
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded-lg bg-background"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No projects in this category</p>
        </div>
      ) : (
        <>
          <SortableList
            items={projects}
            onReorder={handleReorder}
            renderItem={(project) => (
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  {project.cover_image ? (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{project.title}</h3>
                </div>
              </div>
            )}
          />

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
