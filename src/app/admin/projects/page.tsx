'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { AddProjectForm } from '@/components/admin/add-project-form';
import { EditProjectForm } from '@/components/admin/edit-project-form';
import { DeleteProjectDialog } from '@/components/admin/delete-project-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from 'sonner';

// Sample projects data
const sampleProjects = [
  {
    id: '1',
    title: 'Cinematic Journey',
    category: 'Films',
    status: 'published',
    date: 'Jan 15, 2024',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Puzzle Master',
    category: 'Games',
    status: 'published',
    date: 'Jan 10, 2024',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Mystery Tales',
    category: 'Books',
    status: 'draft',
    date: 'Jan 5, 2024',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
  },
];

export default function AdminProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin');
      } else {
        fetchProjects();
      }
    };
    checkAuth();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_categories (
            categories (
              id,
              slug,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match UI format
      const formattedProjects = data.map((project: any) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        category: project.project_categories?.[0]?.categories?.name || 'Uncategorized',
        categoryId: project.project_categories?.[0]?.categories?.id,
        blurb: project.blurb,
        year: project.year,
        role: project.role_en,
        client: project.client,
        image: project.cover_image,
        status: project.status,
        date: new Date(project.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectAdded = (newProject: any) => {
    setProjects([newProject, ...projects]);
  };

  const handleProjectUpdated = (updatedProject: any) => {
    setProjects(projects.map((p) => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const handleEditClick = async (projectId: string) => {
    setLoadingEdit(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (data) {
        setEditingProject({
          ...data,
          role: data.role ?? data.role_en ?? '',
        });
      }
    } catch (error) {
      console.error('Error loading project for edit:', error);
      toast.error('Failed to load project for editing');
    } finally {
      setLoadingEdit(false);
    }
  };

  if (editingProject) {
    return (
      <EditProjectForm 
        project={editingProject}
        onProjectUpdated={(updatedProject) => {
          handleProjectUpdated(updatedProject);
          setEditingProject(null);
          fetchProjects();
        }}
        onBack={() => {
          setEditingProject(null);
          fetchProjects();
        }}
      />
    );
  }

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show add form if requested
  if (showAddForm) {
    return (
      <AddProjectForm 
        onProjectAdded={handleProjectAdded}
        onBack={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Manage your portfolio projects
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Project
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <span className="font-medium text-foreground">
                          {project.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground">{project.category}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'published'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-orange-500/10 text-orange-500'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground text-sm">
                        {project.date}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="icon" title="View (coming soon)">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(project.id)}
                          title="Edit project"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteProjectDialog 
                          project={project}
                          onProjectDeleted={handleProjectDeleted}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProjects.length === 0 && !loading && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No projects found</p>
              </div>
            )}
          </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
            <p className="text-2xl font-bold text-foreground">{projects.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Published</p>
            <p className="text-2xl font-bold text-green-500">
              {projects.filter((p) => p.status === 'published').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Drafts</p>
            <p className="text-2xl font-bold text-orange-500">
              {projects.filter((p) => p.status === 'draft').length}
            </p>
          </div>
        </div>
    </div>
  );
}
