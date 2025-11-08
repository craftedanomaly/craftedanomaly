'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Video,
  Image as ImageIcon,
  LayoutGrid,
  List,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddCategoryForm } from '@/components/admin/add-category-form';
import { EditCategoryForm } from '@/components/admin/edit-category-form';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover_image?: string | null;
  video_url?: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'list' | 'grid';

interface CategoryMediaPreviewProps {
  coverImage?: string | null;
  videoUrl?: string | null;
  name: string;
  className?: string;
  children?: ReactNode;
}

function CategoryMediaPreview({ coverImage, videoUrl, name, className, children }: CategoryMediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    if (videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        /* autoplay guard */
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={cn('group relative h-full w-full overflow-hidden bg-muted', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="100vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      {videoUrl && (
        <>
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <source src={videoUrl} />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </>
      )}
      {children}
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(true);
  const editingFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategoryId && editingFormRef.current) {
      editingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingCategoryId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryAdded = (newCategory: Category) => {
    setCategories([newCategory, ...categories]);
    setShowAddForm(false);
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setShowAddForm(false);
    setEditingCategoryId(category.id);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(categories.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    setEditingCategoryId(null);
    fetchCategories();
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx === -1) return;
    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const items = Array.from(categories);
    const [moved] = items.splice(idx, 1);
    items.splice(newIndex, 0, moved);

    // Update local order for instant feedback
    setCategories(items);

    // Persist new display_order
    try {
      for (let i = 0; i < items.length; i++) {
        const cat = items[i];
        if (cat.display_order !== i) {
          await supabase
            .from('categories')
            .update({ display_order: i })
            .eq('id', cat.id);
        }
      }
      toast.success('Order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      fetchCategories();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const editingCategory = editingCategoryId
    ? categories.find((category) => category.id === editingCategoryId) || null
    : null;

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Kategori Yönetimi</h1>
          <p className="text-muted-foreground">
            Vitrinde yer alan kategori kartlarını düzenleyin, sıralayın ve medya içeriklerini güncelleyin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-border/60 p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
              Liste
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setShowAddForm((prev) => !prev)}>
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Formu Gizle' : 'Yeni Kategori Ekle'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <AddCategoryForm
          className="shadow-sm"
          onCategoryAdded={handleCategoryAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingCategory && (
        <div ref={editingFormRef}>
          <Card className="border-accent/40">
            <CardHeader className="pb-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Kategori Düzenle</CardTitle>
                  <CardDescription>Seçili kategoriyi inline olarak güncelleyin.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setEditingCategoryId(null)}>
                  Kapat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <EditCategoryForm
                category={editingCategory}
                onCategoryUpdated={handleCategoryUpdated}
                onCancel={() => setEditingCategoryId(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div
        className={cn(
          'grid gap-5',
          viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
        )}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            {viewMode === 'grid' ? (
              <Card className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-lg">
                <CategoryMediaPreview
                  coverImage={category.cover_image}
                  videoUrl={category.video_url || undefined}
                  name={category.name}
                  className="aspect-[16/10]"
                >
                  <div className="absolute left-3 top-3">
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      #{category.display_order + 1}
                    </Badge>
                  </div>
                  {category.video_url && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="outline" className="gap-1 text-[11px]">
                        <Video className="h-3 w-3" /> Hover Video
                      </Badge>
                    </div>
                  )}
                </CategoryMediaPreview>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {category.name}
                        </CardTitle>
                        <Badge variant={category.active ? 'default' : 'secondary'}>
                          {category.active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCategory(category.id, 'up')}
                        disabled={index === 0}
                        title="Sırayı yukarı taşı"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveCategory(category.id, 'down')}
                        disabled={index === categories.length - 1}
                        title="Sırayı aşağı taşı"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      {category.active ? (
                        <Eye className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {category.description?.trim() || 'Henüz bir açıklama eklenmemiş.'}
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Oluşturulma:</span>
                      <span>{new Date(category.created_at).toLocaleDateString()}</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span>Güncelleme:</span>
                      <span>{new Date(category.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-3 w-3" />
                          Düzenle
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-none md:w-64">
                    <CategoryMediaPreview
                      coverImage={category.cover_image}
                      videoUrl={category.video_url || undefined}
                      name={category.name}
                      className="h-48 w-full md:h-full md:min-h-[220px] md:rounded-r-none"
                    >
                      <div className="absolute left-3 top-3">
                        <Badge variant="secondary" className="font-mono text-[11px]">
                          #{category.display_order + 1}
                        </Badge>
                      </div>
                      {category.video_url && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="outline" className="gap-1 text-[11px]">
                            <Video className="h-3 w-3" /> Hover Video
                          </Badge>
                        </div>
                      )}
                    </CategoryMediaPreview>
                  </div>
                  <div className="flex flex-1 flex-col gap-5 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl font-semibold text-foreground">
                            {category.name}
                          </CardTitle>
                          <Badge variant={category.active ? 'default' : 'secondary'}>
                            {category.active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveCategory(category.id, 'up')}
                          disabled={index === 0}
                          title="Sırayı yukarı taşı"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveCategory(category.id, 'down')}
                          disabled={index === categories.length - 1}
                          title="Sırayı aşağı taşı"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        {category.active ? (
                          <Eye className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {category.description?.trim() || 'Henüz bir açıklama eklenmemiş.'}
                    </p>

                    <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Oluşturulma:</span>
                        <span>{new Date(category.created_at).toLocaleDateString()}</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span>Güncelleme:</span>
                        <span>{new Date(category.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-3 w-3" />
                          Düzenle
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">Henüz bir kategori eklenmemiş. Yeni bir kategori oluşturarak başlayın.</p>
          <Button className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            İlk Kategorini Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
