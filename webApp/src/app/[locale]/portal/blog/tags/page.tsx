'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Edit, Trash2, ChevronLeft, Tag } from 'lucide-react';
import { blogApi } from '@/lib/api';
import type { BlogTagCreate, BlogTagUpdate } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function BlogTagsPage() {
    const t = useTranslations('Blog.Admin.tags');
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<number | null>(null);
    const [tagToDelete, setTagToDelete] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
    });

    // Fetch tags with SWR
    const { data: response, error, isLoading, mutate } = useSWR(
        'blog-tags',
        () => blogApi.getTags({ limit: 200 })
    );

    const tags = response?.items || [];
    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (tagId?: number) => {
        if (tagId) {
            const tag = tags.find((t) => t.id === tagId);
            if (tag) {
                setFormData({
                    name: tag.name,
                    slug: tag.slug,
                });
                setEditingTag(tagId);
            }
        } else {
            setFormData({ name: '', slug: '' });
            setEditingTag(null);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingTag) {
                await blogApi.updateTag(editingTag, formData as BlogTagUpdate);
                toast.success(t('tagUpdated'));
            } else {
                await blogApi.createTag(formData as BlogTagCreate);
                toast.success(t('tagCreated'));
            }
            mutate();
            setDialogOpen(false);
            setFormData({ name: '', slug: '' });
        } catch (error) {
            console.error('Error saving tag:', error);
            toast.error(t('saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!tagToDelete) return;
        try {
            await blogApi.deleteTag(tagToDelete);
            toast.success(t('tagDeleted'));
            mutate();
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error(t('saveError'));
        } finally {
            setDeleteDialogOpen(false);
            setTagToDelete(null);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/${locale}/portal/blog`}>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newTag')}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Tags Display */}
            <div>
                {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-24" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Error loading tags</p>
                    </div>
                ) : filteredTags.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Tag />
                            </EmptyMedia>
                            <EmptyTitle>{t('noTags')}</EmptyTitle>
                            <EmptyDescription>{t('noTagsDesc')}</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('newTag')}
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {filteredTags.map((tag) => (
                            <Card key={tag.id} className="hover:bg-accent/50 transition-colors">
                                <CardHeader className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm">
                                            #{tag.name}
                                        </Badge>
                                        <CardDescription className="text-xs">
                                            {tag.slug}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="p-4 pt-0 flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenDialog(tag.id)}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setTagToDelete(tag.id);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Tag Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingTag ? t('editTag') : t('createTag')}
                            </DialogTitle>
                            <DialogDescription>{t('subtitle')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('name')}</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">{t('slug')}</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : editingTag ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTagToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
