'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import { Leaf, ChevronLeft, ChevronRight, Sparkles, BookOpen, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const t = useTranslations('Blog');
  const locale = useLocale();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-emerald-950/20 dark:to-teal-950/20">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-400/10 blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex items-center justify-between mb-8">
            <Link href={`/${locale}`}>
              <Button variant="ghost" className="text-white/90 hover:bg-white/10 hover:text-white">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('backToHome')}
              </Button>
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              {t('title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            
            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{pagination.total}+</div>
                <div className="text-sm text-white/70">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-sm text-white/70">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{tags.length}</div>
                <div className="text-sm text-white/70">Topics</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-gray-50 dark:text-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="posts" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-white dark:bg-gray-800 shadow-lg border border-emerald-100 dark:border-emerald-900 rounded-xl p-1">
                <TabsTrigger 
                  value="posts" 
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="categories" 
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger 
                  value="tags" 
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <TagIcon className="w-4 h-4 mr-2" />
                  Tags
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="posts" className="space-y-8">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filter */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    <BlogFilter
                      categories={categories}
                      tags={tags}
                      onFilterChange={handleFilterChange}
                      initialFilters={filters}
                    />
                  </div>
                </div>

                {/* Posts List */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Results count */}
                  <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm text-muted-foreground">
                            {t('showingResults', {
                              start: pagination.skip + 1,
                              end: Math.min(pagination.skip + pagination.limit, pagination.total),
                              total: pagination.total
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <BlogPostList posts={posts} isLoading={isLoading} locale={locale} variant="featured" />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={pagination.skip === 0}
                            className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t('pagination.previous')}
                          </Button>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {t('pagination.page', { current: currentPage, total: totalPages })}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={pagination.skip + pagination.limit >= pagination.total}
                            className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Browse by Category
                </h2>
                <p className="text-center text-muted-foreground">
                  Find articles organized by topic
                </p>
              </div>
              <CategoryList categories={categories} locale={locale} />
            </TabsContent>

            <TabsContent value="tags">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Popular Topics
                  </h2>
                  <p className="text-muted-foreground">
                    Explore articles by keyword
                  </p>
                </div>
                <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 p-8">
                  <TagList tags={tags} locale={locale} variant="pill" />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
