"use client";

import { VolunteerBadge } from "@/lib/api/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BadgeShowcaseProps {
  badges: VolunteerBadge[];
  maxShow?: number;
  className?: string;
}

export function BadgeShowcase({
  badges,
  maxShow = 5,
  className
}: BadgeShowcaseProps) {
  const t = useTranslations("Gamification.badges");

  // Filter showcased badges
  const showcasedBadges = badges.filter(vb => vb.is_showcased).slice(0, maxShow);

  if (showcasedBadges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {showcasedBadges.map((volunteerBadge) => (
        <div
          key={volunteerBadge.id}
          className="relative group"
          title={volunteerBadge.badge.name}
        >
          <div
            className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
            style={{
              backgroundColor: `${volunteerBadge.badge.color}20`,
              border: `2px solid ${volunteerBadge.badge.color}`
            }}
          >
            {volunteerBadge.badge.icon_url ? (
              <img
                src={volunteerBadge.badge.icon_url}
                alt={volunteerBadge.badge.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: volunteerBadge.badge.color }}
              >
                {volunteerBadge.badge.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
              <div className="font-semibold">{volunteerBadge.badge.name}</div>
              <div className="text-muted-foreground">
                {t(`rarities.${volunteerBadge.badge.rarity}`)}
              </div>
            </div>
            <div className="w-2 h-2 bg-popover rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
          </div>

          {/* Showcase Star Indicator */}
          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow">
            <span className="text-white text-xs">★</span>
          </div>
        </div>
      ))}

      {badges.filter(vb => vb.is_showcased).length > maxShow && (
        <Badge variant="secondary" className="text-xs">
          +{badges.filter(vb => vb.is_showcased).length - maxShow}
        </Badge>
      )}
    </div>
  );
}
