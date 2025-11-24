'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { blogApi } from '@/lib/api';
import type { BlogPost, BlogPostUpdate, BlogCategory, BlogTag } from '@/lib/api/types';
import { BlogPostForm } from '@/components/blog';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const locale = useLocale();
    const t = useTranslations('Blog.Admin');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);

    const postId = parseInt(params?.id || '0');

    useEffect(() => {
        fetchData();
    }, [postId]);

    const fetchData = async () => {
        try {
            setIsFetching(true);
            const [postData, categoriesRes, tagsRes] = await Promise.all([
                blogApi.getPost(postId),
                blogApi.getCategories({ limit: 100 }),
                blogApi.getTags({ limit: 200 }),
            ]);
            setPost(postData);
            setCategories(categoriesRes.items);
            setTags(tagsRes.items);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load blog post');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (data: BlogPostUpdate) => {
        try {
            setIsLoading(true);
            await blogApi.updatePost(postId, data);
            toast.success(t('postUpdated'));
            router.push(`/${locale}/portal/blog`);
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error(t('saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${locale}/portal/blog`);
    };

    if (isFetching) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Post not found</p>
                    <Link href={`/${locale}/portal/blog`}>
                        <Button className="mt-4">Back to Blog Posts</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Convert post to initial data format
    const initialData: BlogPostUpdate = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        status: post.status,
        featured_image_url: post.featured_image_url || '',
        category_ids: post.categories.map((c) => c.id),
        tag_ids: post.tags.map((t) => t.id),
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('editPost')}</h1>
                    <p className="text-muted-foreground">{post.title}</p>
                </div>
            </div>

            {/* Form */}
            <BlogPostForm
                initialData={initialData}
                categories={categories}
                tags={tags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                mode="edit"
            />
        </div>
    );
}
