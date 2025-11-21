'use client';

import { useState } from 'react';
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
          <CardTitle className="text-lg">Filter Posts</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <IconX className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search posts..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter (Admin only) */}
        {showStatusFilter && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
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
            <Label htmlFor="tag">Tag</Label>
            <Select value={filters.tag || 'all'} onValueChange={handleTagChange}>
              <SelectTrigger id="tag">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
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
            <Label className="text-xs text-muted-foreground">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary">
                  Search: {filters.search}
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary">
                  Status: {filters.status}
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary">
                  Category: {categories.find((c) => c.slug === filters.category)?.name}
                </Badge>
              )}
              {filters.tag && (
                <Badge variant="secondary">
                  Tag: {tags.find((t) => t.slug === filters.tag)?.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
