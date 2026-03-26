'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Edit, Trash2, ChevronLeft, Tag, Hash } from 'lucide-react';
import { blogApi } from '@/lib/api';
import type { BlogTagCreate, BlogTagUpdate } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

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
    });

    // Fetch tags with SWR
    const { data: response, error, isLoading, mutate } = useSWR(
        'blog-tags',
        () => blogApi.getTags({ limit: 100 })
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
                });
                setEditingTag(tagId);
            }
        } else {
            setFormData({ name: '' });
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
            setFormData({ name: '' });
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/portal/blog`}>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                            <ChevronLeft className="h-4 w-4 text-emerald-600" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 shadow-lg shadow-teal-500/20">
                            <Tag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                {t('title')}
                            </h1>
                            <p className="text-muted-foreground">{t('subtitle')}</p>
                        </div>
                    </div>
                </div>
                <Button 
                    onClick={() => handleOpenDialog()} 
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newTag')}
                </Button>
            </div>

            {/* Search */}
            <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
                <CardHeader className="pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 border-emerald-200 dark:border-emerald-800 focus:border-teal-500 dark:focus:border-teal-400"
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Tags Display */}
            <div>
                {isLoading ? (
                    <div className="flex flex-wrap gap-3">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-28 rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <Card className="border-destructive/50">
                        <CardHeader className="py-8 text-center">
                            <p className="text-destructive">{t('errorLoading')}</p>
                        </CardHeader>
                    </Card>
                ) : filteredTags.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <div className="rounded-full bg-teal-100 dark:bg-teal-900/50 p-4">
                                    <Tag className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                                </div>
                            </EmptyMedia>
                            <EmptyTitle className="text-teal-600">{t('noTags')}</EmptyTitle>
                            <EmptyDescription>{t('noTagsDesc')}</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button 
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {t('newTag')}
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {filteredTags.map((tag, index) => (
                            <Card 
                                key={tag.id} 
                                className={cn(
                                    "transition-all duration-300 hover:shadow-md hover:scale-[1.02] group",
                                    "border-emerald-100 dark:border-emerald-900"
                                )}
                            >
                                <CardHeader className="p-3 flex-row items-center gap-3">
                                    <div className={cn(
                                        "rounded-lg p-2 transition-colors",
                                        index % 4 === 0 ? "bg-emerald-100 dark:bg-emerald-900/50" :
                                        index % 4 === 1 ? "bg-teal-100 dark:bg-teal-900/50" :
                                        index % 4 === 2 ? "bg-cyan-100 dark:bg-cyan-900/50" :
                                        "bg-sky-100 dark:bg-sky-900/50"
                                    )}>
                                        <Hash className={cn(
                                            "h-4 w-4",
                                            index % 4 === 0 ? "text-emerald-600" :
                                            index % 4 === 1 ? "text-teal-600" :
                                            index % 4 === 2 ? "text-cyan-600" :
                                            "text-sky-600"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Badge variant="secondary" className={cn(
                                            "font-medium",
                                            index % 4 === 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0" :
                                            index % 4 === 1 ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-0" :
                                            index % 4 === 2 ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-0" :
                                            "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-0"
                                        )}>
                                            {tag.name}
                                        </Badge>
                                        <CardDescription className="text-xs mt-1 truncate">
                                            {tag.slug}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="p-3 pt-0 flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenDialog(tag.id)}
                                        className="h-8 px-2 text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setTagToDelete(tag.id);
                                            setDeleteDialogOpen(true);
                                        }}
                                        className="h-8 px-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Tag Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="border-emerald-100 dark:border-emerald-900">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-teal-100 dark:bg-teal-900/50 p-2">
                                    <Tag className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <DialogTitle>{editingTag ? t('editTag') : t('createTag')}</DialogTitle>
                                    <DialogDescription>{t('subtitle')}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">{t('name')}</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="pl-9 border-emerald-200 dark:border-emerald-800 focus:border-teal-500 dark:focus:border-teal-400"
                                        placeholder="e.g., sustainability"
                                    />
                                </div>
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
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                            >
                                {isSubmitting ? t('saving') : editingTag ? t('update') : t('createTag')}
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
                        <AlertDialogCancel onClick={() => setTagToDelete(null)}>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t('deleteTag')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
