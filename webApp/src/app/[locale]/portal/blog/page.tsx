'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Plus, Search, Filter, FileText, Eye, Trash2, Edit, Globe, Lock } from 'lucide-react';
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

const POST_STATUSES = ['draft', 'published'] as const;

export default function BlogPostsPage() {
    const t = useTranslations('Blog.Admin');
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
        } catch (error) {
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
        } catch (error) {
            toast.error(t('statusUpdateError'));
        }
    };

    const getStatusColor = (status: BlogPostStatus) => {
        switch (status) {
            case 'published':
                return 'bg-growth/10 text-growth border-growth/20';
            case 'draft':
                return 'bg-muted text-muted-foreground border-border';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/${locale}/portal/blog/categories`}>
                        <Button variant="outline">{t('categoriesButton')}</Button>
                    </Link>
                    <Link href={`/${locale}/portal/blog/tags`}>
                        <Button variant="outline">{t('tagsButton')}</Button>
                    </Link>
                    <Link href={`/${locale}/portal/blog/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('newPost')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('../searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BlogPostStatus | 'all')}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={t('../status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('../allStatuses')}</SelectItem>
                        {POST_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                                {t(`../${status}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Posts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="@container/card">
                            <CardHeader>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : error ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">{t('errorLoading')}</p>
                    </div>
                ) : !posts || posts.length === 0 ? (
                    <div className="col-span-full">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FileText />
                                </EmptyMedia>
                                <EmptyTitle>{t('noPosts')}</EmptyTitle>
                                <EmptyDescription>
                                    {t('noPostsDesc')}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Link href={`/${locale}/portal/blog/new`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('newPost')}
                                    </Button>
                                </Link>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="h-full hover:bg-accent/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        {post.categories.length > 0 && (
                                            <CardDescription className="mb-1">
                                                {post.categories[0].name}
                                            </CardDescription>
                                        )}
                                        <CardTitle className="text-lg @[250px]/card:text-xl line-clamp-2">
                                            {post.title}
                                        </CardTitle>
                                    </div>
                                    <CardAction>
                                        <Badge className={getStatusColor(post.status)} variant="secondary">
                                            {post.status === 'published' ? (
                                                <><Globe className="mr-1 h-3 w-3" /> {t('../published')}</>
                                            ) : (
                                                <><Lock className="mr-1 h-3 w-3" /> {t('../draft')}</>
                                            )}
                                        </Badge>
                                    </CardAction>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Excerpt */}
                                {post.excerpt && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                )}

                                {/* Tags */}
                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag.id} variant="outline" className="text-xs">
                                                #{tag.name}
                                            </Badge>
                                        ))}
                                        {post.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{post.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                                    <div>
                                        <div className="text-muted-foreground">Created</div>
                                        <div className="font-medium">
                                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Author</div>
                                        <div className="font-medium line-clamp-1">
                                            {post.author_name || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2">
                                <Link href={`/${locale}/blog/${post.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('view')}
                                    </Button>
                                </Link>
                                <Link href={`/${locale}/portal/blog/${post.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
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
                                >
                                    {post.status === 'published' ? t('unpublish') : t('publish')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPostToDelete(post.id);
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPostToDelete(null)}>
                            {t('form.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePost}>
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
