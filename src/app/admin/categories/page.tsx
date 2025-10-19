'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddCategoryForm } from '@/components/admin/add-category-form';
import { EditCategoryForm } from '@/components/admin/edit-category-form';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

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
    fetchCategories(); // Refresh the list
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowEditForm(true);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    setShowEditForm(false);
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setCategories(items);

    // Update display_order in database
    try {
      const updates = items.map((category, index) => ({
        id: category.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Category order updated successfully!');
    } catch (error) {
      console.error('Error updating category order:', error);
      toast.error('Failed to update category order');
      // Revert local state on error
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

  // Show add form if requested
  if (showAddForm) {
    return (
      <AddCategoryForm 
        onCategoryAdded={handleCategoryAdded}
        onBack={() => setShowAddForm(false)}
      />
    );
  }

  // Show edit form if requested
  if (showEditForm && editingCategory) {
    return (
      <EditCategoryForm 
        category={editingCategory}
        onCategoryUpdated={handleCategoryUpdated}
        onBack={() => {
          setShowEditForm(false);
          setEditingCategory(null);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Manage your portfolio categories
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid with Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style || undefined}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={snapshot.isDragging ? 'z-50' : ''}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-foreground transition-colors">
                                  {category.name}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground mt-1">
                                  /{category.slug}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {category.active ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {category.description || 'No description provided'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(category.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No categories found</p>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Category
          </Button>
        </div>
      )}
    </div>
  );
}
