"use client";

import { Badge, BadgeRarity, VolunteerBadge } from "@/lib/api/types";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badge: Badge | VolunteerBadge;
  earned?: boolean;
  earnedAt?: string;
  isShowcased?: boolean;
  onShowcaseToggle?: () => void;
  className?: string;
}

const rarityColors: Record<BadgeRarity, string> = {
  common: "from-green-500/20 to-green-600/20 border-green-500",
  rare: "from-blue-500/20 to-blue-600/20 border-blue-500",
  epic: "from-purple-500/20 to-purple-600/20 border-purple-500",
  legendary: "from-yellow-500/20 to-yellow-600/20 border-yellow-500"
};

const rarityGlow: Record<BadgeRarity, string> = {
  common: "shadow-green-500/50",
  rare: "shadow-blue-500/50",
  epic: "shadow-purple-500/50",
  legendary: "shadow-yellow-500/50"
};

export function BadgeCard({
  badge,
  earned = false,
  earnedAt,
  isShowcased = false,
  onShowcaseToggle,
  className
}: BadgeCardProps) {
  const t = useTranslations("Gamification.badges");

  // Handle both Badge and VolunteerBadge types
  const badgeData = "badge" in badge ? badge.badge : badge;
  const badgeEarnedAt = earnedAt || ("earned_at" in badge ? badge.earned_at : undefined);
  const badgeShowcased = isShowcased || ("is_showcased" in badge ? badge.is_showcased : false);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        earned
          ? `bg-gradient-to-br ${rarityColors[badgeData.rarity]} ${earned && rarityGlow[badgeData.rarity]} shadow-lg hover:shadow-xl`
          : "bg-muted/50 opacity-60 hover:opacity-80",
        className
      )}
    >
      <div className="p-4">
        {/* Badge Icon */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          {badgeData.icon_url ? (
            <img
              src={badgeData.icon_url}
              alt={badgeData.name}
              className={cn(
                "w-full h-full object-contain",
                !earned && "grayscale"
              )}
            />
          ) : (
            <div
              className={cn(
                "w-full h-full rounded-full flex items-center justify-center text-3xl",
                earned ? "bg-gradient-to-br" : "bg-muted"
              )}
              style={{
                backgroundColor: earned ? badgeData.color : undefined
              }}
            >
              {badgeData.name.charAt(0)}
            </div>
          )}

          {/* Showcase Star */}
          {earned && onShowcaseToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowcaseToggle();
              }}
              className="absolute -top-1 -right-1 bg-background rounded-full p-1 shadow-md hover:scale-110 transition-transform"
              title={badgeShowcased ? t("showcase.remove") : t("showcase.add")}
            >
              <span className={cn(
                "text-lg",
                badgeShowcased ? "text-yellow-500" : "text-muted-foreground"
              )}>
                ★
              </span>
            </button>
          )}
        </div>

        {/* Badge Name */}
        <h3 className="text-center font-semibold text-sm mb-1 line-clamp-2">
          {badgeData.name}
        </h3>

        {/* Rarity */}
        <div className="text-center mb-2">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              earned ? "font-medium" : ""
            )}
            style={{
              backgroundColor: earned ? `${badgeData.color}20` : undefined,
              color: earned ? badgeData.color : undefined
            }}
          >
            {t(`rarities.${badgeData.rarity}`)}
          </span>
        </div>

        {/* Points */}
        <div className="text-center text-sm text-muted-foreground mb-2">
          {badgeData.points_value} {t("../points.title").toLowerCase()}
        </div>

        {/* Earned Date */}
        {earned && badgeEarnedAt && (
          <div className="text-xs text-center text-muted-foreground">
            {t("earnedOn")} {format(new Date(badgeEarnedAt), "MMM d, yyyy")}
          </div>
        )}

        {/* Not Earned Yet */}
        {!earned && (
          <div className="text-xs text-center text-muted-foreground italic">
            {t("notEarned")}
          </div>
        )}
      </div>

      {/* Rarity Border Gradient */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: earned
            ? `linear-gradient(135deg, ${badgeData.color}15, transparent)`
            : undefined
        }}
      />
    </Card>
  );
}
