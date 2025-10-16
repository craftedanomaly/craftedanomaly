'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Filter, Search, Calendar, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectList } from '@/components/projects/project-list';

interface Project {
  id: string;
  slug: string;
  title_en: string;
  title_tr: string;
  blurb_en: string;
  blurb_tr: string;
  cover_image: string;
  year: number;
  role_en: string;
  role_tr: string;
  client: string;
  published_at: string;
  view_count: number;
}

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_tr: string;
  description_en: string;
  description_tr: string;
}

interface CategoryPageClientProps {
  category: Category;
  projects: Project[];
}

export function CategoryPageClient({ category, projects }: CategoryPageClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Get English content
  const categoryName = category.name_en;
  const categoryDescription = category.description_en;

  // Filter and sort projects
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterProjects(term, sortBy);
  };

  const handleSort = (sort: string) => {
    setSortBy(sort);
    filterProjects(searchTerm, sort);
  };

  const filterProjects = (search: string, sort: string) => {
    let filtered = [...projects];

    // Search filter
    if (search) {
      filtered = filtered.filter(project => {
        const title = project.title_en;
        const blurb = project.blurb_en;
        const role = project.role_en;
        
        return (
          title.toLowerCase().includes(search.toLowerCase()) ||
          blurb.toLowerCase().includes(search.toLowerCase()) ||
          role.toLowerCase().includes(search.toLowerCase()) ||
          project.client.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Sort
    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => {
          const titleA = a.title_en;
          const titleB = b.title_en;
          return titleA.localeCompare(titleB);
        });
        break;
      case 'year':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => b.view_count - a.view_count);
        break;
    }

    setFilteredProjects(filtered);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'BBH Sans Bartle, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {categoryDescription}
            </p>
          )}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              {projects.length} projects
            </span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    Newest First
                  </SelectItem>
                  <SelectItem value="oldest">
                    Oldest First
                  </SelectItem>
                  <SelectItem value="title">
                    Title A-Z
                  </SelectItem>
                  <SelectItem value="year">
                    Year
                  </SelectItem>
                  <SelectItem value="popular">
                    Most Popular
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-sm text-muted-foreground">
              Found {filteredProjects.length} projects matching "{searchTerm}"
            </p>
          </motion.div>
        )}

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {filteredProjects.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <ProjectList
                projects={filteredProjects}
              />
            )
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No projects found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
