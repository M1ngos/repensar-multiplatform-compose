'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BlogPostCreate, BlogPostUpdate, BlogCategory, BlogTag, BlogPostStatus } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePicker } from '@/components/ui/image-picker';
import { FileCategory } from '@/lib/api/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconX, IconPlus, IconFileText, IconTag, IconFolder } from '@tabler/icons-react';
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
import { cn } from '@/lib/utils';

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
  const tBlog = useTranslations('Blog');
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
      {/* Basic Info Card */}
      <Card className="border-emerald-100 dark:border-emerald-900 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-2">
              <IconFileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle>{mode === 'create' ? t('createTitle') : t('editTitle')}</CardTitle>
              <CardDescription>Fill in the basic information for your blog post</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              {t('title')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('titlePlaceholder')}
              required
              className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-sm font-medium">{t('excerpt')}</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder={t('excerptPlaceholder')}
              rows={3}
              className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 resize-none"
            />
            <p className="text-xs text-muted-foreground">A brief summary that will appear in post listings</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              {t('content')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('contentPlaceholder')}
              rows={12}
              required
              className="font-mono text-sm border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
            />
            <p className="text-xs text-muted-foreground">Supports HTML/Markdown formatting</p>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('featuredImage')}</Label>
            <ImagePicker
              value={formData.featured_image_url}
              onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
              category={FileCategory.OTHER}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">{t('status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: BlogPostStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status" className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    {tBlog('draft')}
                  </div>
                </SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {tBlog('published')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories & Tags Card */}
      <Card className="border-emerald-100 dark:border-emerald-900 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-100 dark:bg-teal-900/50 p-2">
              <IconTag className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Categorize and tag your post for better discoverability</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <IconFolder className="h-4 w-4 text-emerald-600" />
              {t('categories')}
            </Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-start text-left font-normal border-emerald-200 dark:border-emerald-800",
                    selectedCategories.length === 0 && "text-muted-foreground"
                  )}
                >
                  <IconPlus className="mr-2 h-4 w-4 text-emerald-600" />
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : t('selectCategories')
                  }
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
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                              formData.category_ids.includes(category.id)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-muted-foreground'
                            )}
                          >
                            {formData.category_ids.includes(category.id) && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
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
                  <Badge 
                    key={category.id} 
                    variant="secondary" 
                    className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0"
                  >
                    <IconFolder className="h-3 w-3" />
                    {category.name}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="ml-1 hover:text-destructive transition-colors"
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
            <Label className="text-sm font-medium flex items-center gap-2">
              <IconTag className="h-4 w-4 text-teal-600" />
              {t('tags')}
            </Label>
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-start text-left font-normal border-emerald-200 dark:border-emerald-800",
                    selectedTags.length === 0 && "text-muted-foreground"
                  )}
                >
                  <IconPlus className="mr-2 h-4 w-4 text-teal-600" />
                  {selectedTags.length > 0
                    ? `${selectedTags.length} selected`
                    : t('selectTags')
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('searchTags')} />
                  <CommandEmpty>{t('noTagsFound')}</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {tags.map((tag) => (
                      <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)} className="cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                              formData.tag_ids.includes(tag.id)
                                ? 'bg-teal-500 border-teal-500'
                                : 'border-muted-foreground'
                            )}
                          >
                            {formData.tag_ids.includes(tag.id) && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
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
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="gap-1.5 bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="ml-1 hover:text-destructive transition-colors"
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
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="border-emerald-200 dark:border-emerald-800"
          >
            {t('cancel')}
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
        >
          {isLoading ? t('saving') : mode === 'create' ? t('createButton') : t('updateButton')}
        </Button>
      </div>
    </form>
  );
}
