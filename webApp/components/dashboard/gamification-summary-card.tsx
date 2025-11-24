"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Trophy, Award, Flame, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useSWR from "swr";
import { gamificationApi } from "@/lib/api/gamification";
import { useAuth } from "@/lib/hooks/useAuth";

export function GamificationSummaryCard() {
  const t = useTranslations("Gamification.widgets.summary");
  const tPoints = useTranslations("Gamification.points");
  const tBadges = useTranslations("Gamification.badges");
  const tAchievements = useTranslations("Gamification.achievements");

  const { user } = useAuth();

  // Fetch gamification summary
  const { data: summary, error, isLoading } = useSWR(
    user ? ['gamification-summary', user.id] : null,
    () => user ? gamificationApi.stats.getVolunteerSummary(user.id) : null
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return null; // Hide widget if gamification data is not available
  }

  const stats = [
    {
      icon: Trophy,
      label: tPoints("title"),
      value: summary.points.total_points.toLocaleString(),
      subtext: `${tPoints("rankBadge", { rank: summary.points.rank })}`,
      color: "text-yellow-500"
    },
    {
      icon: Award,
      label: tBadges("title"),
      value: summary.badges_earned,
      subtext: tBadges("showcased"),
      color: "text-blue-500"
    },
    {
      icon: Star,
      label: tAchievements("title"),
      value: `${summary.achievements_completed}/${summary.achievement_progress.length}`,
      subtext: tAchievements("completed"),
      color: "text-purple-500"
    },
    {
      icon: Flame,
      label: "Streak",
      value: summary.points.current_streak_days,
      subtext: "days",
      color: "text-orange-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t("title")}
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/profile">
              {t("viewDetails")}
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.subtext}</div>
            </div>
          ))}
        </div>

        {/* Recent Badges */}
        {summary.recent_badges.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">Recent Badges</div>
            <div className="flex flex-wrap gap-2">
              {summary.recent_badges.slice(0, 5).map((vb) => (
                <div
                  key={vb.id}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: `${vb.badge.color}20`,
                    border: `2px solid ${vb.badge.color}`
                  }}
                  title={vb.badge.name}
                >
                  {vb.badge.icon_url ? (
                    <img
                      src={vb.badge.icon_url}
                      alt={vb.badge.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span style={{ color: vb.badge.color }} className="text-xs font-bold">
                      {vb.badge.name.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
