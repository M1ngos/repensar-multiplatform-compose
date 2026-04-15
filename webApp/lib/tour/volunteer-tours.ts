export type TourId =
    // Volunteer pages
    | 'my-tasks'
    | 'available-tasks'
    | 'my-hours'
    | 'achievements'
    | 'dashboard'
    // Admin / PM / Staff pages
    | 'projects'
    | 'tasks'
    | 'volunteers'
    | 'resources'
    | 'approvals'
    | 'reports'
    | 'analytics'
    | 'users'
    | 'team'
    | 'gamification'
    | 'my-projects';

const TOUR_SEEN_KEY = (tourId: TourId) => `tour_seen_${tourId}`;

export function isTourSeen(tourId: TourId): boolean {
    if (typeof window === 'undefined') return true;
    try {
        return localStorage.getItem(TOUR_SEEN_KEY(tourId)) === 'true';
    } catch {
        return true;
    }
}

export function markTourSeen(tourId: TourId): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(TOUR_SEEN_KEY(tourId), 'true');
    } catch {
        // localStorage unavailable — ignore
    }
}

type TourStepDef = {
    element: string;
    popover: {
        titleKey: string;
        descriptionKey: string;
        side?: 'top' | 'bottom' | 'left' | 'right';
    };
};

export const TOUR_STEPS: Record<TourId, TourStepDef[]> = {
    // ── Volunteer ──────────────────────────────────────────────────────────────
    dashboard: [
        {
            element: '[data-tour="stat-cards"]',
            popover: { titleKey: 'statCards.title', descriptionKey: 'statCards.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="quick-actions"]',
            popover: { titleKey: 'quickActions.title', descriptionKey: 'quickActions.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="current-tasks"]',
            popover: { titleKey: 'currentTasks.title', descriptionKey: 'currentTasks.desc', side: 'right' },
        },
        {
            element: '[data-tour="recent-badges"]',
            popover: { titleKey: 'recentBadges.title', descriptionKey: 'recentBadges.desc', side: 'left' },
        },
        {
            element: '[data-tour="hours-chart"]',
            popover: { titleKey: 'hoursChart.title', descriptionKey: 'hoursChart.desc', side: 'top' },
        },
    ],
    'my-tasks': [
        {
            element: '[data-tour="task-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="task-grid"]',
            popover: { titleKey: 'taskCard.title', descriptionKey: 'taskCard.desc', side: 'top' },
        },
    ],
    'available-tasks': [
        {
            element: '[data-tour="available-filters"]',
            popover: { titleKey: 'search.title', descriptionKey: 'search.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="skill-filter"]',
            popover: { titleKey: 'skillFilter.title', descriptionKey: 'skillFilter.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="available-grid"]',
            popover: { titleKey: 'taskCard.title', descriptionKey: 'taskCard.desc', side: 'top' },
        },
    ],
    'my-hours': [
        {
            element: '[data-tour="hours-summary"]',
            popover: { titleKey: 'summary.title', descriptionKey: 'summary.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="hours-table"]',
            popover: { titleKey: 'table.title', descriptionKey: 'table.desc', side: 'top' },
        },
    ],
    achievements: [
        {
            element: '[data-tour="achievement-stats"]',
            popover: { titleKey: 'stats.title', descriptionKey: 'stats.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="achievement-tabs"]',
            popover: { titleKey: 'tabs.title', descriptionKey: 'tabs.desc', side: 'bottom' },
        },
    ],

    // ── Admin / PM / Staff ─────────────────────────────────────────────────────
    projects: [
        {
            element: '[data-tour="projects-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="projects-grid"]',
            popover: { titleKey: 'grid.title', descriptionKey: 'grid.desc', side: 'top' },
        },
    ],
    tasks: [
        {
            element: '[data-tour="tasks-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="tasks-view-toggle"]',
            popover: { titleKey: 'viewToggle.title', descriptionKey: 'viewToggle.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="tasks-board"]',
            popover: { titleKey: 'board.title', descriptionKey: 'board.desc', side: 'top' },
        },
    ],
    volunteers: [
        {
            element: '[data-tour="volunteers-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="volunteers-grid"]',
            popover: { titleKey: 'grid.title', descriptionKey: 'grid.desc', side: 'top' },
        },
    ],
    resources: [
        {
            element: '[data-tour="resources-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="resources-grid"]',
            popover: { titleKey: 'grid.title', descriptionKey: 'grid.desc', side: 'top' },
        },
    ],
    approvals: [
        {
            element: '[data-tour="approvals-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="approvals-table"]',
            popover: { titleKey: 'table.title', descriptionKey: 'table.desc', side: 'top' },
        },
    ],
    reports: [
        {
            element: '[data-tour="reports-tabs"]',
            popover: { titleKey: 'tabs.title', descriptionKey: 'tabs.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="reports-export"]',
            popover: { titleKey: 'export.title', descriptionKey: 'export.desc', side: 'bottom' },
        },
    ],
    analytics: [
        {
            element: '[data-tour="analytics-stats"]',
            popover: { titleKey: 'stats.title', descriptionKey: 'stats.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="analytics-charts"]',
            popover: { titleKey: 'charts.title', descriptionKey: 'charts.desc', side: 'top' },
        },
    ],
    users: [
        {
            element: '[data-tour="users-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="users-table"]',
            popover: { titleKey: 'table.title', descriptionKey: 'table.desc', side: 'top' },
        },
    ],
    team: [
        {
            element: '[data-tour="team-filters"]',
            popover: { titleKey: 'filters.title', descriptionKey: 'filters.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="team-grid"]',
            popover: { titleKey: 'grid.title', descriptionKey: 'grid.desc', side: 'top' },
        },
    ],
    gamification: [
        {
            element: '[data-tour="gamification-search"]',
            popover: { titleKey: 'search.title', descriptionKey: 'search.desc', side: 'bottom' },
        },
        {
            element: '[data-tour="gamification-award"]',
            popover: { titleKey: 'award.title', descriptionKey: 'award.desc', side: 'bottom' },
        },
    ],
    'my-projects': [
        {
            element: '[data-tour="my-projects-grid"]',
            popover: { titleKey: 'grid.title', descriptionKey: 'grid.desc', side: 'top' },
        },
        {
            element: '[data-tour="my-projects-stats"]',
            popover: { titleKey: 'stats.title', descriptionKey: 'stats.desc', side: 'bottom' },
        },
    ],
};
