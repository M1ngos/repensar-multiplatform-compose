"use client";

import { PointsSummary } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Trophy, TrendingUp, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PointsWidgetProps {
  points: PointsSummary | null;
  isLoading?: boolean;
  className?: string;
}

export function PointsWidget({ points, isLoading, className }: PointsWidgetProps) {
  const t = useTranslations("Gamification.points");
  const tStreak = useTranslations("Gamification.streak");

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!points) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Points */}
        <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {points.total_points.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">{t("totalPoints")}</div>
        </div>

        {/* Rank & Percentile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">{t("rank")}</span>
            </div>
            <div className="text-xl font-bold">#{points.rank}</div>
            <div className="text-xs text-muted-foreground">
              {t("topPercent", { percent: (100 - points.rank_percentile).toFixed(1) })}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">{tStreak("current")}</span>
            </div>
            <div className="text-xl font-bold">{points.current_streak_days}</div>
            <div className="text-xs text-muted-foreground">
              {tStreak("days", { count: points.current_streak_days })}
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        {points.longest_streak_days > 0 && (
          <div className="text-xs text-center text-muted-foreground border-t pt-3">
            {tStreak("longest")}: <span className="font-semibold">{points.longest_streak_days} {tStreak("days", { count: points.longest_streak_days })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
