'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { IconExternalLink, IconUsers, IconClock, IconArrowRight } from "@tabler/icons-react";
import { projectsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

export function RecentProjects() {
  const locale = useLocale();
  const t = useTranslations('Dashboard.recentProjects');
  const { data: projects, isLoading } = useSWR('projects-dashboard', () => projectsApi.getProjectsDashboard());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'reforestation': return '🌳';
      case 'environmental_education': return '📚';
      case 'waste_management': return '♻️';
      case 'conservation': return '🦋';
      case 'research': return '🔬';
      case 'community_engagement': return '🤝';
      case 'climate_action': return '🌍';
      case 'biodiversity': return '🌿';
      default: return '📋';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </div>
          <Link href={`/${locale}/portal/projects`}>
            <Button variant="ghost" size="sm" className="gap-1">
              {t('viewAll')}
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconExternalLink className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('noProjects')}</EmptyTitle>
              <EmptyDescription>{t('noProjectsDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href={`/${locale}/portal/projects`}>
                <Button variant="outline">
                  {t('createFirst')}
                </Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project, index) => (
              <div key={project.id}>
                <Link href={`/${locale}/portal/projects/${project.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getCategoryEmoji(project.category)}</span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {project.name}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {project.category.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <Badge className={getStatusColor(project.status)} variant="outline">
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconUsers className="h-4 w-4" />
                          <span>{project.team_size}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconClock className="h-4 w-4" />
                          <span>{Math.round(project.volunteer_hours)}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {index < Math.min(projects.length - 1, 4) && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
