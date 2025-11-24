'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BlogPostCreate, BlogPostUpdate, BlogCategory, BlogTag, BlogPostStatus } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconX, IconPlus } from '@tabler/icons-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface BlogPostFormProps {
  initialData?: Partial<BlogPostCreate | BlogPostUpdate>;
  categories: BlogCategory[];
  tags: BlogTag[];
  onSubmit: (data: BlogPostCreate | BlogPostUpdate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function BlogPostForm({
  initialData,
  categories,
  tags,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}: BlogPostFormProps) {
  const t = useTranslations('Blog.form');
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    status: (initialData?.status || 'draft') as BlogPostStatus,
    featured_image_url: initialData?.featured_image_url || '',
    category_ids: initialData?.category_ids || [],
    tag_ids: initialData?.tag_ids || [],
  });

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleCategory = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const selectedCategories = categories.filter((cat) =>
    formData.category_ids.includes(cat.id)
  );
  const selectedTags = tags.filter((tag) => formData.tag_ids.includes(tag.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? t('createTitle') : t('editTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('title')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('titlePlaceholder')}
              required
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">{t('excerpt')}</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder={t('excerptPlaceholder')}
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {t('content')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('contentPlaceholder')}
              rows={15}
              required
              className="font-mono text-sm"
            />
          </div>

          {/* Featured Image URL */}
          <div className="space-y-2">
            <Label htmlFor="featured_image_url">{t('featuredImage')}</Label>
            <Input
              id="featured_image_url"
              type="url"
              value={formData.featured_image_url}
              onChange={(e) =>
                setFormData({ ...formData, featured_image_url: e.target.value })
              }
              placeholder={t('featuredImagePlaceholder')}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: BlogPostStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('../draft')}</SelectItem>
                <SelectItem value="published">{t('../published')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>{t('categories')}</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t('selectCategories')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('searchCategories')} />
                  <CommandEmpty>{t('noCategoriesFound')}</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        onSelect={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded border ${
                              formData.category_ids.includes(category.id)
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}
                          />
                          <span>{category.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedCategories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t('tags')}</Label>
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t('selectTags')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('searchTags')} />
                  <CommandEmpty>{t('noTagsFound')}</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {tags.map((tag) => (
                      <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded border ${
                              formData.tag_ids.includes(tag.id)
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}
                          />
                          <span>#{tag.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('saving') : mode === 'create' ? t('createButton') : t('updateButton')}
        </Button>
      </div>
    </form>
  );
}
