'use client';

import useSWR from 'swr';
import { IconTrendingUp, IconUsers, IconListCheck, IconClock, IconTargetArrow, IconChartBar } from "@tabler/icons-react";
import { projectsApi, tasksApi, volunteersApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionCards() {
  // Fetch stats from all APIs
  const { data: projectStats, isLoading: projectsLoading } = useSWR('project-stats', () => projectsApi.getProjectsStats());
  const { data: taskStats, isLoading: tasksLoading } = useSWR('task-stats', () => tasksApi.getTasksStats());
  const { data: volunteerStats, isLoading: volunteersLoading } = useSWR('volunteer-stats', () => volunteersApi.getVolunteerStats());

  const isLoading = projectsLoading || tasksLoading || volunteersLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionRate = taskStats ? Math.round((taskStats.completed / (taskStats.total_tasks || 1)) * 100) : 0;
  const projectCompletionRate = projectStats ? Math.round(((projectStats.completed_projects || 0) / (projectStats.total_projects || 1)) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Projects Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Projects
          </CardTitle>
          <IconTargetArrow className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {projectStats?.total_projects || 0}
          </div>
          <div className="mt-4 space-y-2">
            <Progress value={projectCompletionRate} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{projectCompletionRate}% completed</span>
              <Badge variant="secondary" className="text-xs">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                {projectStats?.active_projects || 0} active
              </Badge>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Completed</div>
              <div className="font-semibold text-emerald-600">
                {projectStats?.completed_projects || 0}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Budget</div>
              <div className="font-semibold">
                ${((projectStats?.total_budget || 0) / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Volunteers
          </CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {volunteerStats?.active_volunteers || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            of {volunteerStats?.total_volunteers || 0} total volunteers
          </p>
          <Separator className="my-3" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Hours Contributed</span>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {Math.round(volunteerStats?.total_hours || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average: {Math.round((volunteerStats?.total_hours || 0) / (volunteerStats?.active_volunteers || 1))} hrs/volunteer
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Task Completion
          </CardTitle>
          <IconListCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            {completionRate}%
          </div>
          <div className="mt-4 space-y-2">
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {taskStats?.completed || 0} of {taskStats?.total_tasks || 0} tasks completed
            </p>
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">To Do</div>
              <div className="font-semibold text-gray-600">
                {taskStats?.not_started || 0}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Doing</div>
              <div className="font-semibold text-blue-600">
                {taskStats?.in_progress || 0}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Done</div>
              <div className="font-semibold text-emerald-600">
                {taskStats?.completed || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Hours Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Project Budget
          </CardTitle>
          <IconChartBar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">
            ${((projectStats?.total_budget || 0) / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total allocated budget
          </p>
          <div className="mt-4 space-y-2">
            <Progress
              value={((projectStats?.total_spent || 0) / (projectStats?.total_budget || 1)) * 100}
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                ${((projectStats?.total_spent || 0) / 1000).toFixed(1)}k spent
              </span>
              <span className="font-medium">
                {Math.round(((projectStats?.total_spent || 0) / (projectStats?.total_budget || 1)) * 100)}%
              </span>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Volunteer Hours Value</span>
            <span className="font-semibold">
              {Math.round(projectStats?.total_volunteer_hours || 0).toLocaleString()}h
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
