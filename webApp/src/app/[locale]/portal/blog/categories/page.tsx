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
import { cn } from '@/lib/utils';

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
                    description: category.description || '',
                });
                setEditingCategory(categoryId);
            }
        } else {
            setFormData({ name: '', description: '' });
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
            setFormData({ name: '', description: '' });
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/portal/blog`}>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                            <ChevronLeft className="h-4 w-4 text-emerald-600" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/20">
                            <Folder className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {t('title')}
                            </h1>
                            <p className="text-muted-foreground">{t('subtitle')}</p>
                        </div>
                    </div>
                </div>
                <Button 
                    onClick={() => handleOpenDialog()} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newCategory')}
                </Button>
            </div>

            {/* Search */}
            <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
                <CardHeader className="pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Categories Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-emerald-300 to-teal-300" />
                            <CardHeader className="space-y-3">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                        </Card>
                    ))
                ) : error ? (
                    <Card className="col-span-full border-destructive/50">
                        <CardHeader className="py-8 text-center">
                            <p className="text-destructive">{t('errorLoading')}</p>
                        </CardHeader>
                    </Card>
                ) : filteredCategories.length === 0 ? (
                    <div className="col-span-full">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-4">
                                        <Folder className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </EmptyMedia>
                                <EmptyTitle className="text-emerald-600">{t('noCategories')}</EmptyTitle>
                                <EmptyDescription>{t('noCategoriesDesc')}</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button 
                                    onClick={() => handleOpenDialog()}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('newCategory')}
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    filteredCategories.map((category, index) => (
                        <Card 
                            key={category.id} 
                            className={cn(
                                "h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 group",
                                "border-emerald-100 dark:border-emerald-900"
                            )}
                        >
                            <div className={cn(
                                "h-1 bg-gradient-to-r transition-all",
                                index % 3 === 0 ? "from-emerald-400 to-teal-500" :
                                index % 3 === 1 ? "from-teal-400 to-cyan-500" :
                                "from-cyan-400 to-emerald-500"
                            )} />
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "rounded-lg p-2 transition-colors",
                                            index % 3 === 0 ? "bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800" :
                                            index % 3 === 1 ? "bg-teal-100 dark:bg-teal-900/50 group-hover:bg-teal-200 dark:group-hover:bg-teal-800" :
                                            "bg-cyan-100 dark:bg-cyan-900/50 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800"
                                        )}>
                                            <Folder className={cn(
                                                "h-4 w-4",
                                                index % 3 === 0 ? "text-emerald-600" :
                                                index % 3 === 1 ? "text-teal-600" :
                                                "text-cyan-600"
                                            )} />
                                        </div>
                                        <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {category.name}
                                        </CardTitle>
                                    </div>
                                </div>
                                <CardDescription className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs">{category.slug}</span>
                                </CardDescription>
                            </CardHeader>
                            {category.description && (
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {category.description}
                                    </p>
                                </CardContent>
                            )}
                            <CardFooter className="flex gap-2 p-4 pt-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDialog(category.id)}
                                    className="flex-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 group/btn"
                                >
                                    <Edit className="mr-2 h-4 w-4 text-emerald-600 group-hover/btn:text-emerald-700" />
                                    {t('editCategory')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCategoryToDelete(category.id);
                                        setDeleteDialogOpen(true);
                                    }}
                                    className="border-emerald-200 dark:border-emerald-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
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
                <DialogContent className="border-emerald-100 dark:border-emerald-900">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-2">
                                    <Folder className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <DialogTitle>{editingCategory ? t('editCategory') : t('createCategory')}</DialogTitle>
                                    <DialogDescription>{t('subtitle')}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">{t('name')}</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                                    placeholder="e.g., Environmental Education"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">{t('description')}</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 resize-none"
                                    placeholder="Brief description of this category..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={isSubmitting}
                                className="border-emerald-200 dark:border-emerald-800"
                            >
                                {t('cancel')}
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                            >
                                {isSubmitting ? t('saving') : editingCategory ? t('update') : t('createCategory')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-emerald-100 dark:border-emerald-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-emerald-900 dark:text-emerald-100">{t('deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t('deleteCategory')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
