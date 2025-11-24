'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Edit, Trash2, ChevronLeft, Folder } from 'lucide-react';
import { blogApi } from '@/lib/api';
import type { BlogCategoryCreate, BlogCategoryUpdate } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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

export default function BlogCategoriesPage() {
    const t = useTranslations('Blog.Admin.categories');
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    // Fetch categories with SWR
    const { data: response, error, isLoading, mutate } = useSWR(
        'blog-categories',
        () => blogApi.getCategories({ limit: 100 })
    );

    const categories = response?.items || [];
    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (categoryId?: number) => {
        if (categoryId) {
            const category = categories.find((c) => c.id === categoryId);
            if (category) {
                setFormData({
                    name: category.name,
                    slug: category.slug,
                    description: category.description || '',
                });
                setEditingCategory(categoryId);
            }
        } else {
            setFormData({ name: '', slug: '', description: '' });
            setEditingCategory(null);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingCategory) {
                await blogApi.updateCategory(editingCategory, formData as BlogCategoryUpdate);
                toast.success(t('categoryUpdated'));
            } else {
                await blogApi.createCategory(formData as BlogCategoryCreate);
                toast.success(t('categoryCreated'));
            }
            mutate();
            setDialogOpen(false);
            setFormData({ name: '', slug: '', description: '' });
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(t('saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await blogApi.deleteCategory(categoryToDelete);
            toast.success(t('categoryDeleted'));
            mutate();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(t('saveError'));
        } finally {
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
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
                    {t('newCategory')}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Categories Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                        </Card>
                    ))
                ) : error ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">Error loading categories</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="col-span-full">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Folder />
                                </EmptyMedia>
                                <EmptyTitle>{t('noCategories')}</EmptyTitle>
                                <EmptyDescription>{t('noCategoriesDesc')}</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => handleOpenDialog()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('newCategory')}
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <Card key={category.id} className="hover:bg-accent/50 transition-colors">
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                                <CardDescription>{category.slug}</CardDescription>
                            </CardHeader>
                            {category.description && (
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {category.description}
                                    </p>
                                </CardContent>
                            )}
                            <CardFooter className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDialog(category.id)}
                                    className="flex-1"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('editCategory')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCategoryToDelete(category.id);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {/* Category Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? t('editCategory') : t('createCategory')}
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
                            <div className="space-y-2">
                                <Label htmlFor="description">{t('description')}</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
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
                                {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
                        <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
