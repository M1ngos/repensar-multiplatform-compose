'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, FileText, Eye, Trash2, Edit, Globe, Lock, Leaf, Folder, Tag } from 'lucide-react';
import { blogApi } from '@/lib/api';
import type { BlogPostStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const POST_STATUSES = ['draft', 'published'] as const;

export default function BlogPostsPage() {
    const t = useTranslations('Blog.Admin');
    const tBlog = useTranslations('Blog');
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'all'>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    // Build query params
    const params = {
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
    };

    // Fetch blog posts with SWR
    const { data: response, error, isLoading, mutate } = useSWR(
        ['blog-posts', params],
        () => blogApi.getPosts(params)
    );

    const posts = response?.items || [];

    const handleDeletePost = async () => {
        if (!postToDelete) return;

        try {
            await blogApi.deletePost(postToDelete);
            toast.success(t('deleteSuccess'));
            mutate();
        } catch (_error) {
            toast.error(t('deleteError'));
        } finally {
            setDeleteDialogOpen(false);
            setPostToDelete(null);
        }
    };

    const handleTogglePublish = async (postId: number, currentStatus: BlogPostStatus) => {
        try {
            if (currentStatus === 'published') {
                await blogApi.unpublishPost(postId);
                toast.success(t('unpublishSuccess'));
            } else {
                await blogApi.publishPost(postId);
                toast.success(t('publishSuccess'));
            }
            mutate();
        } catch (_error) {
            toast.error(t('statusUpdateError'));
        }
    };

    const getStatusColor = (status: BlogPostStatus) => {
        switch (status) {
            case 'published':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0';
            case 'draft':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0';
            default:
                return 'bg-muted text-muted-foreground border-0';
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg shadow-emerald-500/20">
                        <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/${locale}/portal/blog/categories`}>
                        <Button variant="outline" className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                            <Folder className="mr-2 h-4 w-4 text-emerald-600" />
                            {t('categoriesButton')}
                        </Button>
                    </Link>
                    <Link href={`/${locale}/portal/blog/tags`}>
                        <Button variant="outline" className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                            <Tag className="mr-2 h-4 w-4 text-teal-600" />
                            {t('tagsButton')}
                        </Button>
                    </Link>
                    <Link href={`/${locale}/portal/blog/new`}>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('newPost')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                            <Input
                                placeholder={tBlog('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BlogPostStatus | 'all')}>
                            <SelectTrigger className="w-full sm:w-[180px] border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                                <Filter className="mr-2 h-4 w-4 text-emerald-600" />
                                <SelectValue placeholder={tBlog('status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{tBlog('allStatuses')}</SelectItem>
                                {POST_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        <span className="capitalize">{tBlog(status)}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Posts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="@container/card overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-emerald-300 to-teal-300 opacity-50" />
                            <CardHeader className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-16 w-full" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : error ? (
                    <div className="col-span-full">
                        <Card className="border-destructive/50">
                            <CardContent className="py-12 text-center">
                                <p className="text-destructive">{t('errorLoading')}</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : !posts || posts.length === 0 ? (
                    <div className="col-span-full">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-4">
                                        <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </EmptyMedia>
                                <EmptyTitle className="text-emerald-600">{t('noPosts')}</EmptyTitle>
                                <EmptyDescription>
                                    {t('noPostsDesc')}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Link href={`/${locale}/portal/blog/new`}>
                                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('newPost')}
                                    </Button>
                                </Link>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card 
                            key={post.id} 
                            className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 group"
                        >
                            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        {post.categories.length > 0 && (
                                            <CardDescription className="mb-1 flex items-center gap-1">
                                                <Folder className="h-3 w-3 text-emerald-600" />
                                                {post.categories[0].name}
                                            </CardDescription>
                                        )}
                                        <CardTitle className="text-lg @[250px]/card:text-xl line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {post.title}
                                        </CardTitle>
                                    </div>
                                    <CardAction>
                                        <Badge className={cn("font-medium", getStatusColor(post.status))}>
                                            {post.status === 'published' ? (
                                                <><Globe className="mr-1 h-3 w-3" /> {tBlog('published')}</>
                                            ) : (
                                                <><Lock className="mr-1 h-3 w-3" /> {tBlog('draft')}</>
                                            )}
                                        </Badge>
                                    </CardAction>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Excerpt */}
                                {post.excerpt && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                )}

                                {/* Tags */}
                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag.id} variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                                #{tag.name}
                                            </Badge>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                +{post.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-100 dark:border-emerald-900">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            Created
                                        </div>
                                        <div className="font-medium text-sm">
                                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                                            Author
                                        </div>
                                        <div className="font-medium text-sm line-clamp-1">
                                            {post.author?.full_name || '-'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
                                <Link href={`/${locale}/blog/${post.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                                        <Eye className="mr-2 h-4 w-4 text-emerald-600" />
                                        {t('view')}
                                    </Button>
                                </Link>
                                <Link href={`/${locale}/portal/blog/${post.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                                        <Edit className="mr-2 h-4 w-4 text-teal-600" />
                                        {t('edit')}
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleTogglePublish(post.id, post.status);
                                    }}
                                    className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                >
                                    {post.status === 'published' ? (
                                        <Lock className="h-4 w-4 text-amber-600" />
                                    ) : (
                                        <Globe className="h-4 w-4 text-emerald-600" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPostToDelete(post.id);
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-emerald-100 dark:border-emerald-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-emerald-900 dark:text-emerald-100">{t('deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPostToDelete(null)}>
                            {t('form.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeletePost}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
