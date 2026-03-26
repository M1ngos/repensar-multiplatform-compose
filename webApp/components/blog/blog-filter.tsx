'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BlogCategory, BlogTag, BlogPostStatus } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconSearch, IconX, IconFilter } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface BlogFilterParams {
  search?: string;
  status?: BlogPostStatus;
  category?: string;
  tag?: string;
}

interface BlogFilterProps {
  categories?: BlogCategory[];
  tags?: BlogTag[];
  showStatusFilter?: boolean;
  onFilterChange: (filters: BlogFilterParams) => void;
  initialFilters?: BlogFilterParams;
}

export function BlogFilter({
  categories = [],
  tags = [],
  showStatusFilter = false,
  onFilterChange,
  initialFilters = {},
}: BlogFilterProps) {
  const t = useTranslations('Blog.filter');
  const tBlog = useTranslations('Blog');
  const [filters, setFilters] = useState<BlogFilterParams>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value === 'all' ? undefined : (value as BlogPostStatus),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = {
      ...filters,
      category: value === 'all' ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagChange = (value: string) => {
    const newFilters = {
      ...filters,
      tag: value === 'all' ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-1.5">
              <IconFilter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <IconX className="mr-1 h-3 w-3" />
                {t('clear')}
              </Button>
            )}
            {(categories.length > 0 || tags.length > 0 || showStatusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="md:hidden h-8"
              >
                {isExpanded ? 'Less' : 'More'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search - Always visible */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">{t('search')}</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('searchPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Expandable filters for mobile */}
        <div className={cn("space-y-4", !isExpanded && "hidden md:block")}>
          {/* Status Filter (Admin only) */}
          {showStatusFilter && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">{t('status')}</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status" className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="published">{tBlog('published')}</SelectItem>
                  <SelectItem value="draft">{tBlog('draft')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">{t('category')}</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category" className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        {category.post_count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({category.post_count})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tag Filter */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-sm font-medium">{t('tag')}</Label>
              <Select value={filters.tag || 'all'} onValueChange={handleTagChange}>
                <SelectTrigger id="tag" className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                  <SelectValue placeholder={t('allTags')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTags')}</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      <div className="flex items-center gap-2">
                        <span>#{tag.name}</span>
                        {tag.post_count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({tag.post_count})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-2 border-t border-emerald-100 dark:border-emerald-900">
            <Label className="text-xs text-muted-foreground font-medium">{t('activeFilters')}</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">{t('searchLabel')}</span>
                  <span className="font-medium">{filters.search}</span>
                  <button 
                    onClick={() => handleSearchChange('')}
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">{t('statusLabel')}</span>
                  <span className="font-medium capitalize">{filters.status}</span>
                  <button 
                    onClick={() => handleStatusChange('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">{t('categoryLabel')}</span>
                  <span className="font-medium">
                    {categories.find((c) => c.slug === filters.category)?.name}
                  </span>
                  <button 
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.tag && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">{t('tagLabel')}</span>
                  <span className="font-medium">#{tags.find((t) => t.slug === filters.tag)?.name}</span>
                  <button 
                    onClick={() => handleTagChange('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
