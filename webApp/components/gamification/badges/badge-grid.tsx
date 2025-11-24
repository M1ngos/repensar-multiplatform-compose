"use client";

import { VolunteerBadge, Badge } from "@/lib/api/types";
import { BadgeCard } from "./badge-card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BadgeGridProps {
  badges: (Badge | VolunteerBadge)[];
  earnedBadges?: number[];
  onShowcaseToggle?: (badgeId: number) => void;
  className?: string;
}

export function BadgeGrid({
  badges,
  earnedBadges = [],
  onShowcaseToggle,
  className
}: BadgeGridProps) {
  const t = useTranslations("Gamification.badges");

  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-lg font-medium mb-2">{t("noBadges")}</h3>
        <p className="text-sm text-muted-foreground">{t("noBadgesDesc")}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        className
      )}
    >
      {badges.map((badge) => {
        const badgeId = "badge" in badge ? badge.badge.id : badge.id;
        const earned = "earned_at" in badge || earnedBadges.includes(badgeId);

        return (
          <BadgeCard
            key={badgeId}
            badge={badge}
            earned={earned}
            onShowcaseToggle={
              onShowcaseToggle
                ? () => onShowcaseToggle(badgeId)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
