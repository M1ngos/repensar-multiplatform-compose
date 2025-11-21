'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { blogApi } from '@/lib/api';
import type { BlogPostSummary, BlogCategory, BlogTag } from '@/lib/api/types';
import {
  BlogPostList,
  BlogFilter,
  CategoryList,
  TagList,
  type BlogFilterParams,
} from '@/components/blog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('Blog');
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilterParams>({});
  const [pagination, setPagination] = useState({ total: 0, skip: 0, limit: 9 });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.skip]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await blogApi.getPosts({
        ...filters,
        skip: pagination.skip,
        limit: pagination.limit,
      });
      setPosts(response.items);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        blogApi.getCategories({ limit: 50 }),
        blogApi.getTags({ limit: 100 }),
      ]);
      setCategories(categoriesRes.items);
      setTags(tagsRes.items);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const handleFilterChange = (newFilters: BlogFilterParams) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const handleNextPage = () => {
    if (pagination.skip + pagination.limit < pagination.total) {
      setPagination((prev) => ({ ...prev, skip: prev.skip + prev.limit }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (pagination.skip > 0) {
      setPagination((prev) => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <section className="bg-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/${params.locale}`}>
              <Button variant="ghost" className="text-white hover:bg-emerald-700">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('backToHome')}
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="w-12 h-12 text-emerald-200" />
            </div>
            <h1 className="text-5xl font-bold mb-4">{t('title')}</h1>
            <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="posts" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="posts">{t('tabs.posts')}</TabsTrigger>
              <TabsTrigger value="categories">{t('tabs.categories')}</TabsTrigger>
              <TabsTrigger value="tags">{t('tabs.tags')}</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-8">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filter */}
                <div className="lg:col-span-1">
                  <BlogFilter
                    categories={categories}
                    tags={tags}
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                  />
                </div>

                {/* Posts List */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Results count */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t('showingResults', {
                        start: pagination.skip + 1,
                        end: Math.min(pagination.skip + pagination.limit, pagination.total),
                        total: pagination.total
                      })}
                    </p>
                  </div>

                  <BlogPostList posts={posts} isLoading={isLoading} locale={params.locale} />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={pagination.skip === 0}
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t('pagination.previous')}
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {t('pagination.page', { current: currentPage, total: totalPages })}
                          </span>
                          <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={pagination.skip + pagination.limit >= pagination.total}
                          >
                            {t('pagination.next')}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <CategoryList categories={categories} locale={params.locale} />
            </TabsContent>

            <TabsContent value="tags">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <TagList tags={tags} locale={params.locale} variant="secondary" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
