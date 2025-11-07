/**
 * Generated TypeScript types from OpenAPI specification
 * Repensar Multiplatform Backend API v2.0.0
 */

// ==================== Enums ====================

export enum BackgroundCheckStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  NOT_REQUIRED = "not_required"
}

export enum VolunteerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

export enum ProficiencyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert"
}

export enum ProjectCategory {
  REFORESTATION = "reforestation",
  ENVIRONMENTAL_EDUCATION = "environmental_education",
  WASTE_MANAGEMENT = "waste_management",
  CONSERVATION = "conservation",
  RESEARCH = "research",
  COMMUNITY_ENGAGEMENT = "community_engagement",
  CLIMATE_ACTION = "climate_action",
  BIODIVERSITY = "biodiversity",
  OTHER = "other"
}

export enum ProjectStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  SUSPENDED = "suspended",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum ProjectPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum TaskStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum MilestoneStatus {
  PENDING = "pending",
  ACHIEVED = "achieved",
  MISSED = "missed",
  CANCELLED = "cancelled"
}

export enum ResourceType {
  HUMAN = "human",
  EQUIPMENT = "equipment",
  MATERIAL = "material",
  FINANCIAL = "financial"
}

export enum DependencyType {
  FINISH_TO_START = "finish_to_start",
  START_TO_START = "start_to_start",
  FINISH_TO_FINISH = "finish_to_finish",
  START_TO_FINISH = "start_to_finish"
}

// ==================== Authentication Types ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  user_type?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: number;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  user_type: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login: string | null;
  created_at: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  new_password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface UserPermissions {
  user_type: string;
  permissions: string[];
  dashboard_config?: Record<string, any>;
}

export interface AuthStatus {
  is_authenticated: boolean;
  user?: UserProfile;
}

export interface GoogleOAuthUrlResponse {
  authorization_url: string;
  state: string;
}

export interface GoogleOAuthCallbackRequest {
  code: string;
  state: string;
}

// ==================== User Management Types ====================

export interface UserType {
  id: number;
  name: string;
  description: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  user_type_name: string;
  department?: string | null;
  is_active: boolean;
  profile_picture?: string | null;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  employee_id?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  profile_picture?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  user_type: UserType;
  oauth_provider?: string | null;
}

export interface UserUpdate {
  name?: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  profile_picture?: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  action: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  details?: Record<string, any>;
  created_at: string;
}

// ==================== Volunteer Types ====================

export interface Volunteer {
  id: number;
  user_id: number;
  volunteer_id: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  availability?: Record<string, any>;
  volunteer_status: VolunteerStatus;
  background_check_status: BackgroundCheckStatus;
  orientation_completed: boolean;
  orientation_date?: string;
  joined_date: string;
  motivation?: string;
  notes?: string;
  total_hours_contributed: number;
  created_at: string;
  updated_at: string;
}

export interface VolunteerProfile extends Volunteer {
  name: string;
  email: string;
  phone: string | null;
  skills: VolunteerSkillAssignment[];
}

export interface VolunteerSummary {
  id: number; // Volunteer's database ID
  volunteer_id: string; // Volunteer's unique identifier (e.g., "VLT001")
  name: string;
  email: string;
  volunteer_status: VolunteerStatus;
  total_hours_contributed: number;
  joined_date: string;
  skills_count: number;
  recent_activity?: string | null;
  // Note: user_id is NOT returned by the list endpoint, only by the detail endpoint (VolunteerProfile)
}

export interface VolunteerRegistration {
  name: string;
  email: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  availability?: Record<string, any>;
  motivation?: string;
  skill_ids?: number[];
}

export interface VolunteerUpdate {
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  availability?: Record<string, any>;
  volunteer_status?: VolunteerStatus;
  background_check_status?: BackgroundCheckStatus;
  orientation_completed?: boolean;
  orientation_date?: string;
  motivation?: string;
  notes?: string;
}

export interface VolunteerStats {
  total_volunteers: number;
  active_volunteers: number;
  total_hours: number;
  volunteers_by_status: Record<string, number>;
  volunteers_by_skill: Record<string, number>;
  recent_registrations: number;
}

export interface VolunteerSkill {
  id: number;
  name: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface VolunteerSkillAssignment {
  id: number;
  volunteer_id: number;
  skill_id: number;
  proficiency_level: ProficiencyLevel;
  years_experience: number;
  certified: boolean;
  notes?: string;
  created_at: string;
  skill: VolunteerSkill;
}

export interface VolunteerSkillAssignmentCreate {
  skill_id: number;
  proficiency_level?: ProficiencyLevel;
  years_experience?: number;
  certified?: boolean;
  notes?: string;
}

export interface VolunteerSkillAssignmentUpdate {
  proficiency_level?: ProficiencyLevel;
  years_experience?: number;
  certified?: boolean;
  notes?: string;
}

export interface VolunteerTimeLog {
  id: number;
  volunteer_id: number;
  project_id?: number;
  task_id?: number;
  date: string;
  start_time?: string;
  end_time?: string;
  hours: number;
  activity_description?: string;
  supervisor_id?: number;
  approved: boolean;
  approved_at?: string;
  approved_by_id?: number;
  created_at: string;
  updated_at: string;
  project_name?: string;
  task_title?: string;
  supervisor_name?: string;
  approved_by_name?: string;
}

export interface VolunteerTimeLogCreate {
  date: string;
  hours: number;
  project_id?: number;
  task_id?: number;
  start_time?: string;
  end_time?: string;
  activity?: string;
  description?: string;
  supervisor_id?: number;
}

export interface VolunteerTimeLogUpdate {
  project_id?: number;
  task_id?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  hours?: number;
  activity?: string;
  description?: string;
  supervisor_id?: number;
}

export interface VolunteerTimeLogApproval {
  approved: boolean;
}

export interface VolunteerHoursSummary {
  total_hours: number;
  approved_hours: number;
  pending_hours: number;
  hours_by_month: Record<string, number>;
  hours_by_project: Record<string, number>;
}

// ==================== Project Types ====================

export interface Project {
  id: number;
  name: string;
  description?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  requires_volunteers: boolean;
  min_volunteers: number;
  max_volunteers?: number;
  volunteer_requirements?: string;
  project_manager_id?: number;
  created_by_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  category: ProjectCategory;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  requires_volunteers?: boolean;
  min_volunteers?: number;
  max_volunteers?: number;
  volunteer_requirements?: string;
  project_manager_id?: number;
  created_by_id?: number;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost?: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  requires_volunteers?: boolean;
  min_volunteers?: number;
  max_volunteers?: number;
  volunteer_requirements?: string;
  project_manager_id?: number;
}

export interface ProjectSummary {
  id: number;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost: number;
  location_name?: string;
  requires_volunteers: boolean;
  project_manager_name?: string;
  team_size: number;
  volunteers_count: number;
  progress_percentage?: number;
}

export interface ProjectDetail extends Project {
  project_manager_name?: string;
  created_by_name?: string;
  team_members: ProjectTeamMember[];
  milestones: Milestone[];
  environmental_metrics: EnvironmentalMetric[];
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  volunteer_hours: number;
}

export interface ProjectDashboard {
  id: number;
  name: string;
  status: ProjectStatus;
  category: ProjectCategory;
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost: number;
  team_size: number;
  volunteers_count: number;
  total_tasks: number;
  completed_tasks: number;
  volunteer_hours: number;
  progress_percentage: number;
  days_remaining?: number;
  budget_utilization?: number;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_spent: number;
  projects_by_status: Record<string, number>;
  projects_by_category: Record<string, number>;
  total_volunteers: number;
  total_volunteer_hours: number;
}

export interface ProjectTeamMember {
  id: number;
  project_id?: number;
  user_id: number;
  name?: string; // User's name (from API spec)
  email?: string; // User's email (from API spec)
  role?: string;
  is_volunteer: boolean;
  joined_date?: string; // From API spec (alternative to assigned_at)
  assigned_at?: string; // Alternative field name
  removed_at?: string;
  // Legacy field names for backwards compatibility
  user_name?: string;
  user_email?: string;
}

export interface ProjectTeamCreate {
  user_id: number;
  role?: string;
  is_volunteer?: boolean;
}

export interface ProjectTeamUpdate {
  role?: string;
  is_volunteer?: boolean;
}

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  target_date: string;
  actual_date?: string;
  status: MilestoneStatus;
  created_at: string;
  updated_at: string;
}

export interface MilestoneCreate {
  project_id: number;
  name: string;
  target_date: string;
  description?: string;
  status?: MilestoneStatus;
}

export interface MilestoneUpdate {
  name?: string;
  description?: string;
  target_date?: string;
  actual_date?: string;
  status?: MilestoneStatus;
}

export interface EnvironmentalMetric {
  id: number;
  project_id: number;
  metric_name: string;
  metric_type?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  measurement_date?: string;
  description?: string;
  recorded_by_id?: number;
  created_at: string;
  updated_at: string;
  recorded_by_name?: string;
}

export interface EnvironmentalMetricCreate {
  project_id: number;
  metric_name: string;
  metric_type?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  measurement_date?: string;
  description?: string;
  recorded_by_id?: number;
}

export interface EnvironmentalMetricUpdate {
  metric_name?: string;
  metric_type?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  measurement_date?: string;
  description?: string;
  recorded_by_id?: number;
}

// ==================== Task Types ====================

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  progress_percentage: number;
  assigned_to_id?: number;
  parent_task_id?: number;
  suitable_for_volunteers: boolean;
  required_skills?: Record<string, any>;
  volunteer_spots: number;
  created_by_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  project_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  progress_percentage?: number;
  assigned_to_id?: number;
  parent_task_id?: number;
  suitable_for_volunteers?: boolean;
  required_skills?: Record<string, any>;
  volunteer_spots?: number;
  created_by_id?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress_percentage?: number;
  assigned_to_id?: number;
  parent_task_id?: number;
  suitable_for_volunteers?: boolean;
  required_skills?: Record<string, any>;
  volunteer_spots?: number;
}

export interface TaskSummary {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  progress_percentage: number;
  suitable_for_volunteers: boolean;
  volunteer_spots: number;
  project_name: string;
  assigned_to_name?: string;
  volunteers_assigned: number;
  days_remaining?: number;
  is_overdue: boolean;
}

export interface TaskDetail extends Task {
  project_name: string;
  project_status: string;
  assigned_to_name?: string;
  created_by_name?: string;
  parent_task_title?: string;
  subtasks: TaskSummary[];
  volunteer_assignments: TaskVolunteerAssignment[];
  dependencies: TaskDependency[];
  completion_percentage: number;
  days_remaining?: number;
  is_overdue: boolean;
  volunteer_hours: number;
}

export interface TaskStats {
  total_tasks: number;
  not_started: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue_tasks: number;
  volunteer_suitable_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  average_completion_time?: number;
  completion_rate: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_project: Record<string, number>;
}

export interface TaskDependency {
  id: number;
  predecessor_task_id: number;
  successor_task_id: number;
  dependency_type: DependencyType;
  created_at: string;
  predecessor_title?: string;
  successor_title?: string;
}

export interface TaskDependencyCreate {
  predecessor_task_id: number;
  successor_task_id: number;
  dependency_type?: DependencyType;
}

export interface TaskVolunteerAssignment {
  id: number;
  task_id: number;
  volunteer_id: number;
  assigned_at: string;
  removed_at?: string;
  volunteer_name?: string;
  hours_contributed: number;
}

// ==================== Pagination & Query Types ====================

/**
 * Paginated API response wrapper (v2.0)
 * Used by all paginated endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

/**
 * Base pagination parameters
 * Supports both v1.0 (skip/limit) and v2.0 (page/page_size) pagination
 */
export interface PaginationParams {
  // Legacy v1.0 pagination
  skip?: number;
  limit?: number;
  // New v2.0 pagination
  page?: number;
  page_size?: number;
}

export interface VolunteerQueryParams extends PaginationParams {
  status?: VolunteerStatus;
  skill_id?: number;
  search?: string;
}

export interface ProjectQueryParams extends PaginationParams {
  status?: ProjectStatus;
  category?: ProjectCategory;
  manager_id?: number;
  requires_volunteers?: boolean;
  search?: string;
}

export interface TaskQueryParams extends PaginationParams {
  project_id?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to_id?: number;
  suitable_for_volunteers?: boolean;
  search?: string;
}

export interface VolunteerHoursQueryParams extends PaginationParams {
  start_date?: string;
  end_date?: string;
  approval_status?: string; // 'approved' | 'pending' | 'rejected'
}

// ==================== Activity & Resources Types ====================

/**
 * Activity log entry for tracking changes and actions
 * Used by project and volunteer activity endpoints
 */
export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  description: string;
  entity_type?: string;
  entity_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
}

/**
 * Resource allocation to a project
 */
export interface ResourceAllocation {
  id: number;
  resource_id: number;
  project_id: number;
  quantity_allocated: number;
  allocation_date: string;
  resource_name?: string;
  resource_type?: ResourceType;
  unit?: string;
  created_at: string;
}

// ==================== Resource Types ====================

export interface Resource {
  id: number;
  name: string;
  description?: string;
  type: ResourceType;
  unit?: string;
  unit_cost?: number;
  available_quantity?: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResourceCreate {
  name: string;
  type: ResourceType;
  description?: string;
  unit?: string;
  unit_cost?: number;
  available_quantity?: number;
  location?: string;
}

// Note: Backend currently doesn't support resource updates
export interface ResourceUpdate {
  name?: string;
  description?: string;
  type?: ResourceType;
  unit?: string;
  unit_cost?: number;
  available_quantity?: number;
  location?: string;
  is_active?: boolean;
}

export interface ResourceAllocationCreate {
  resource_id: number;
  quantity_allocated: number;
  allocation_date?: string;
  notes?: string;
}

export interface ResourceQueryParams extends PaginationParams {
  type?: ResourceType;
  is_active?: boolean;
  search?: string;
  location?: string;
}

// ==================== Analytics Types ====================

export enum MetricType {
  VOLUNTEER_HOURS = "volunteer_hours",
  PROJECT_PROGRESS = "project_progress",
  TASK_COMPLETION = "task_completion",
  VOLUNTEER_COUNT = "volunteer_count",
  RESOURCE_UTILIZATION = "resource_utilization",
  ENVIRONMENTAL_IMPACT = "environmental_impact",
  BUDGET_SPENT = "budget_spent",
  CUSTOM = "custom"
}

export enum Granularity {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly"
}

export interface MetricSnapshot {
  id: number;
  metric_type: MetricType;
  metric_name: string;
  value: number;
  unit?: string;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
  metadata?: Record<string, any>;
  snapshot_date: string;
  created_at: string;
}

export interface MetricSnapshotCreate {
  metric_type: MetricType;
  metric_name: string;
  value: number;
  unit?: string;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
  metadata?: Record<string, any>;
  snapshot_date?: string;
}

export interface TimeSeriesDataPoint {
  period: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export interface TimeSeriesResponse {
  metric_type: MetricType | string;
  start_date: string;
  end_date: string;
  granularity: Granularity;
  data_points: number;
  data: TimeSeriesDataPoint[];
}

export interface AnalyticsDashboard {
  period: {
    start_date: string;
    end_date: string;
  };
  project_filter?: number | null;
  summary: {
    projects: {
      total_projects: number;
      active_projects: number;
      completed_projects: number;
      planning_projects: number;
    };
    tasks: {
      total_tasks: number;
      completed_tasks: number;
      in_progress_tasks: number;
      not_started_tasks: number;
      completion_rate: number;
    };
    volunteers: {
      active_volunteers: number;
      total_hours_logged: number;
      avg_hours_per_volunteer: number;
    };
    budget?: {
      total_budget: number;
      total_spent: number;
      utilization_rate: number;
    } | null;
  };
}

export interface TrendDataPoint {
  period?: string;
  total_hours?: number;
  log_count?: number;
  progress_percentage?: number;
  date?: string;
  metadata?: Record<string, any>;
}

export interface VolunteerHoursTrends {
  start_date: string;
  end_date: string;
  granularity: Granularity;
  data_points: number;
  trends: TrendDataPoint[];
}

export interface ProjectProgressTrends {
  project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  data_points: number;
  trends: TrendDataPoint[];
}

export interface EnvironmentalImpactMetric {
  metric_name: string;
  metric_type: string;
  unit: string;
  data_points: Array<{
    date: string;
    target_value: number;
    current_value: number;
    progress_percentage: number;
    project_id: number;
  }>;
}

export interface EnvironmentalImpactTrends {
  start_date: string;
  end_date: string;
  metrics_count: number;
  metrics: EnvironmentalImpactMetric[];
}

export interface CustomDashboard {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  widgets: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardCreate {
  name: string;
  description?: string;
  widgets: Record<string, any>;
  is_default?: boolean;
}

export interface DashboardUpdate {
  name?: string;
  description?: string;
  widgets?: Record<string, any>;
  is_default?: boolean;
}

export interface TimeSeriesQueryParams {
  metric_type: MetricType | string;
  start_date: string;
  end_date: string;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
  granularity?: Granularity;
}

export interface AnalyticsDashboardParams {
  project_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface TrendsQueryParams {
  start_date: string;
  end_date: string;
  project_id?: number;
  volunteer_id?: number;
  granularity?: Granularity;
  metric_name?: string;
}

// ==================== Reports & Exports Types ====================

export enum ExportFormat {
  CSV = "csv",
  JSON = "json"
}

export interface ExportParams {
  format?: ExportFormat;
  status?: string;
  category?: string;
  project_id?: number;
  volunteer_id?: number;
  start_date?: string;
  end_date?: string;
  approval_status?: string;
  volunteer_status?: string;
}

export interface ProjectReport {
  project_id: number;
  report_data: Record<string, any>;
  generated_at: string;
}

// ==================== Notifications Types ====================

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error"
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  read_at?: string;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface NotificationCreate {
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
}

export interface NotificationUpdate {
  is_read?: boolean;
}

export interface NotificationQueryParams extends PaginationParams {
  is_read?: boolean;
  type?: NotificationType;
  project_id?: number;
  task_id?: number;
}

// ==================== Files & Attachments Types ====================

export enum FileCategory {
  PROFILE = "profile",
  PROJECT = "project",
  TASK = "task",
  RESOURCE = "resource",
  DOCUMENT = "document",
  OTHER = "other"
}

export interface FileUpload {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  thumbnail_path?: string;
  category: FileCategory;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
  uploaded_by_id: number;
  created_at: string;
}

export interface FileUploadParams {
  file: File;
  category: FileCategory;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
  description?: string;
}

export interface FileQueryParams {
  category?: FileCategory;
  project_id?: number;
  task_id?: number;
  volunteer_id?: number;
}
