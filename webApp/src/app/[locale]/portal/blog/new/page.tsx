'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { blogApi } from '@/lib/api';
import type { BlogPostCreate, BlogCategory, BlogTag } from '@/lib/api/types';
import { BlogPostForm } from '@/components/blog';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewBlogPostPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Blog.Admin');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [categoriesRes, tagsRes] = await Promise.all([
                blogApi.getCategories({ limit: 100 }),
                blogApi.getTags({ limit: 200 }),
            ]);
            setCategories(categoriesRes.items);
            setTags(tagsRes.items);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const handleSubmit = async (data: BlogPostCreate) => {
        try {
            setIsLoading(true);
            const newPost = await blogApi.createPost(data);
            toast.success(t('postCreated'));
            router.push(`/${locale}/portal/blog/${newPost.id}`);
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error(t('saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${locale}/portal/blog`);
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
                    <h1 className="text-3xl font-bold tracking-tight">{t('createPost')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Form */}
            <BlogPostForm
                categories={categories}
                tags={tags}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                mode="create"
            />
        </div>
    );
}
