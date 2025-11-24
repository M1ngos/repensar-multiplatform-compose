/**
 * Gamification API Client
 * Handles all gamification-related API calls (badges, achievements, points, leaderboards)
 */

import { apiClient } from './client';
import type {
  Badge,
  BadgeCreate,
  BadgeUpdate,
  BadgeSummary,
  VolunteerBadge,
  VolunteerBadgesResponse,
  Achievement,
  AchievementCreate,
  AchievementUpdate,
  AchievementProgress,
  VolunteerAchievementsResponse,
  PointsSummary,
  PointsHistory,
  StreakInfo,
  RankingEntry,
  Leaderboard,
  LeaderboardPosition,
  GamificationStats,
  VolunteerGamificationSummary,
  BadgeAwardRequest,
  BadgeAwardResponse,
  PointsAwardRequest,
  PointsAwardResponse,
  ToggleBadgeShowcaseRequest,
  ToggleBadgeShowcaseResponse,
  BadgeCategoriesResponse,
  AchievementTypesResponse,
  GenerateLeaderboardsResponse,
  BadgeListParams,
  AchievementListParams,
  PointsHistoryParams,
  LeaderboardParams,
  RankingsParams,
  BadgeCategory,
  LeaderboardType,
  LeaderboardTimeframe,
} from './types';

const BASE_PATH = '/gamification';

/**
 * Badge API Methods
 */
export const badgesApi = {
  /**
   * Get a list of all available badges
   */
  async list(params?: BadgeListParams): Promise<Badge[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.rarity) queryParams.append('rarity', params.rarity);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const query = queryParams.toString();
    return apiClient.get(`${BASE_PATH}/badges${query ? `?${query}` : ''}`);
  },

  /**
   * Get detailed information about a specific badge
   */
  async getById(badgeId: number): Promise<Badge> {
    return apiClient.get(`${BASE_PATH}/badges/${badgeId}`);
  },

  /**
   * Get list of available badge categories
   */
  async getCategories(): Promise<BadgeCategoriesResponse> {
    return apiClient.get(`${BASE_PATH}/badges/categories`);
  },

  /**
   * Get all badges earned by a volunteer
   */
  async getVolunteerBadges(volunteerId: number): Promise<VolunteerBadgesResponse> {
    return apiClient.get(`${BASE_PATH}/volunteers/${volunteerId}/badges`);
  },

  /**
   * Toggle whether a badge is displayed on the volunteer's profile
   */
  async toggleShowcase(
    volunteerId: number,
    badgeId: number,
    data: ToggleBadgeShowcaseRequest
  ): Promise<ToggleBadgeShowcaseResponse> {
    return apiClient.put(
      `${BASE_PATH}/volunteers/${volunteerId}/badges/${badgeId}/showcase`,
      data
    );
  },

  /**
   * Create a new badge (Admin only)
   */
  async create(data: BadgeCreate): Promise<Badge> {
    return apiClient.post(`${BASE_PATH}/badges`, data);
  },

  /**
   * Update an existing badge (Admin only)
   */
  async update(badgeId: number, data: BadgeUpdate): Promise<Badge> {
    return apiClient.put(`${BASE_PATH}/badges/${badgeId}`, data);
  },

  /**
   * Soft delete a badge (Admin only)
   */
  async delete(badgeId: number): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/badges/${badgeId}`);
  },

  /**
   * Manually award a badge to a volunteer (Admin only)
   */
  async award(volunteerId: number, data: BadgeAwardRequest): Promise<BadgeAwardResponse> {
    return apiClient.post(`${BASE_PATH}/volunteers/${volunteerId}/badges/award`, data);
  },
};

/**
 * Achievement API Methods
 */
export const achievementsApi = {
  /**
   * Get a list of all available achievements
   */
  async list(params?: AchievementListParams): Promise<Achievement[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.achievement_type) queryParams.append('achievement_type', params.achievement_type);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const query = queryParams.toString();
    return apiClient.get(`${BASE_PATH}/achievements${query ? `?${query}` : ''}`);
  },

  /**
   * Get detailed information about a specific achievement
   */
  async getById(achievementId: number): Promise<Achievement> {
    return apiClient.get(`${BASE_PATH}/achievements/${achievementId}`);
  },

  /**
   * Get list of available achievement types
   */
  async getTypes(): Promise<AchievementTypesResponse> {
    return apiClient.get(`${BASE_PATH}/achievements/types`);
  },

  /**
   * Get all achievement progress for a volunteer
   */
  async getVolunteerAchievements(volunteerId: number): Promise<VolunteerAchievementsResponse> {
    return apiClient.get(`${BASE_PATH}/volunteers/${volunteerId}/achievements`);
  },

  /**
   * Get progress for a specific achievement
   */
  async getProgress(
    volunteerId: number,
    achievementId: number
  ): Promise<AchievementProgress> {
    return apiClient.get(
      `${BASE_PATH}/volunteers/${volunteerId}/achievements/${achievementId}/progress`
    );
  },

  /**
   * Create a new achievement (Admin only)
   */
  async create(data: AchievementCreate): Promise<Achievement> {
    return apiClient.post(`${BASE_PATH}/achievements`, data);
  },

  /**
   * Update an existing achievement (Admin only)
   */
  async update(achievementId: number, data: AchievementUpdate): Promise<Achievement> {
    return apiClient.put(`${BASE_PATH}/achievements/${achievementId}`, data);
  },

  /**
   * Soft delete an achievement (Admin only)
   */
  async delete(achievementId: number): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/achievements/${achievementId}`);
  },
};

/**
 * Points API Methods
 */
export const pointsApi = {
  /**
   * Get points summary and recent history for a volunteer
   */
  async getSummary(volunteerId: number): Promise<PointsSummary> {
    return apiClient.get(`${BASE_PATH}/volunteers/${volunteerId}/points`);
  },

  /**
   * Get complete points history for a volunteer
   */
  async getHistory(volunteerId: number, params?: PointsHistoryParams): Promise<PointsHistory[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get(
      `${BASE_PATH}/volunteers/${volunteerId}/points/history${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get activity streak information for a volunteer
   */
  async getStreak(volunteerId: number): Promise<StreakInfo> {
    return apiClient.get(`${BASE_PATH}/volunteers/${volunteerId}/streak`);
  },

  /**
   * Get global volunteer rankings by points
   */
  async getRankings(params?: RankingsParams): Promise<RankingEntry[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get(`${BASE_PATH}/points/rankings${query ? `?${query}` : ''}`);
  },

  /**
   * Manually award points to a volunteer (Admin only)
   */
  async award(volunteerId: number, data: PointsAwardRequest): Promise<PointsAwardResponse> {
    return apiClient.post(`${BASE_PATH}/volunteers/${volunteerId}/points/award`, data);
  },
};

/**
 * Leaderboard API Methods
 */
export const leaderboardsApi = {
  /**
   * Get a leaderboard by type and timeframe
   */
  async get(
    leaderboardType: LeaderboardType,
    params?: LeaderboardParams
  ): Promise<Leaderboard> {
    const queryParams = new URLSearchParams();
    if (params?.timeframe) queryParams.append('timeframe', params.timeframe);

    const query = queryParams.toString();
    return apiClient.get(
      `${BASE_PATH}/leaderboards/${leaderboardType}${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get a volunteer's position across all leaderboards
   */
  async getVolunteerPositions(volunteerId: number): Promise<LeaderboardPosition[]> {
    return apiClient.get(`${BASE_PATH}/leaderboards/volunteer/${volunteerId}/position`);
  },

  /**
   * Manually trigger leaderboard regeneration (Admin only)
   */
  async generate(): Promise<GenerateLeaderboardsResponse> {
    return apiClient.post(`${BASE_PATH}/leaderboards/generate`, {});
  },
};

/**
 * Statistics API Methods
 */
export const gamificationStatsApi = {
  /**
   * Get overall gamification statistics (Admin only)
   */
  async getOverall(): Promise<GamificationStats> {
    return apiClient.get(`${BASE_PATH}/stats`);
  },

  /**
   * Get complete gamification summary for a volunteer
   */
  async getVolunteerSummary(volunteerId: number): Promise<VolunteerGamificationSummary> {
    return apiClient.get(`${BASE_PATH}/stats/volunteer/${volunteerId}`);
  },
};

/**
 * Combined API export
 */
export const gamificationApi = {
  badges: badgesApi,
  achievements: achievementsApi,
  points: pointsApi,
  leaderboards: leaderboardsApi,
  stats: gamificationStatsApi,
};
