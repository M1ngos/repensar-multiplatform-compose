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
import { IconSearch, IconX } from '@tabler/icons-react';

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
  const [filters, setFilters] = useState<BlogFilterParams>(initialFilters);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('title')}</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <IconX className="mr-1 h-3 w-3" />
              {t('clear')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">{t('search')}</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('searchPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter (Admin only) */}
        {showStatusFilter && (
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="published">{t('../published')}</SelectItem>
                <SelectItem value="draft">{t('../draft')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="category">{t('category')}</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                    {category.post_count !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({category.post_count})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="tag">{t('filter.tag')}</Label>
            <Select value={filters.tag || 'all'} onValueChange={handleTagChange}>
              <SelectTrigger id="tag">
                <SelectValue placeholder={t('filter.allTags')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.allTags')}</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.slug}>
                    #{tag.name}
                    {tag.post_count !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({tag.post_count})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs text-muted-foreground">{t('filter.activeFilters')}</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary">
                  {t('filter.searchLabel')} {filters.search}
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary">
                  {t('filter.statusLabel')} {filters.status}
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary">
                  {t('filter.categoryLabel')} {categories.find((c) => c.slug === filters.category)?.name}
                </Badge>
              )}
              {filters.tag && (
                <Badge variant="secondary">
                  {t('filter.tagLabel')} {tags.find((t) => t.slug === filters.tag)?.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
