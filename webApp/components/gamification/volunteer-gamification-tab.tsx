"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import { gamificationApi } from "@/lib/api/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Award, Flame, TrendingUp } from "lucide-react";
import { BadgeShowcase } from "./badges/badge-showcase";
import { BadgeGrid } from "./badges/badge-grid";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface VolunteerGamificationTabProps {
  volunteerId: number;
}

export function VolunteerGamificationTab({ volunteerId }: VolunteerGamificationTabProps) {
  const t = useTranslations("Gamification");
  const tPoints = useTranslations("Gamification.points");
  const tBadges = useTranslations("Gamification.badges");
  const tAchievements = useTranslations("Gamification.achievements");
  const tStreak = useTranslations("Gamification.streak");

  // Fetch data
  const { data: badges, isLoading: badgesLoading } = useSWR(
    ["volunteer-badges", volunteerId],
    () => gamificationApi.badges.getVolunteerBadges(volunteerId)
  );

  const { data: achievements, isLoading: achievementsLoading } = useSWR(
    ["volunteer-achievements", volunteerId],
    () => gamificationApi.achievements.getVolunteerAchievements(volunteerId)
  );

  const { data: points, isLoading: pointsLoading } = useSWR(
    ["volunteer-points", volunteerId],
    () => gamificationApi.points.getSummary(volunteerId)
  );

  const { data: leaderboardPositions, isLoading: leaderboardLoading } = useSWR(
    ["volunteer-leaderboard", volunteerId],
    () => gamificationApi.leaderboards.getVolunteerPositions(volunteerId)
  );

  const isLoading = badgesLoading || achievementsLoading || pointsLoading || leaderboardLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      {points && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {tPoints("totalPoints")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {points.total_points.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                {tPoints("rank")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{points.rank}</div>
              <p className="text-xs text-muted-foreground">
                {tPoints("topPercent", { percent: (100 - points.rank_percentile).toFixed(1) })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                {tStreak("current")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{points.current_streak_days}</div>
              <p className="text-xs text-muted-foreground">
                {tStreak("days", { count: points.current_streak_days })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                {tBadges("totalBadges")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{badges?.total_badges || 0}</div>
              <p className="text-xs text-muted-foreground">
                {badges?.showcased_badges.length || 0} {tBadges("showcased").toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Showcased Badges */}
      {badges && badges.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              {tBadges("showcased")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeShowcase badges={badges.badges} maxShow={8} />
          </CardContent>
        </Card>
      )}

      {/* Achievement Progress */}
      {achievements && achievements.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                {tAchievements("title")}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {achievements.completed} / {achievements.total_achievements} {tAchievements("completed")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.achievements
                .filter(a => !a.is_completed || a.times_completed > 0)
                .slice(0, 5)
                .map((achievement) => (
                  <div key={achievement.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {achievement.points_reward} pts
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>
                          {achievement.current_progress} / {achievement.target_progress}
                        </span>
                        <span className="font-medium">
                          {achievement.progress_percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={achievement.progress_percentage}
                        className="h-2"
                      />
                    </div>
                    {achievement.is_completed && achievement.completed_at && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ {tAchievements("completedOn")} {format(new Date(achievement.completed_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Badges */}
      {badges && badges.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {tBadges("title")} ({badges.total_badges})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeGrid badges={badges.badges} />
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Positions */}
      {leaderboardPositions && leaderboardPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("leaderboards.yourPosition")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {leaderboardPositions.map((position) => (
                <div
                  key={`${position.leaderboard_type}-${position.timeframe}`}
                  className="p-3 bg-muted/50 rounded-lg"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {t(`leaderboards.types.${position.leaderboard_type}`)} •{" "}
                    {t(`leaderboards.timeframes.${position.timeframe}`)}
                  </div>
                  <div className="text-xl font-bold">#{position.rank}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("leaderboards.outOfTotal", { total: position.total_participants })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
