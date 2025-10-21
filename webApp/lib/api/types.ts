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
  id: number;
  volunteer_id: string;
  name: string;
  email: string;
  volunteer_status: VolunteerStatus;
  total_hours_contributed: number;
  joined_date: string;
  skills_count: number;
  recent_activity?: string;
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
  volunteer_id: number;
  date: string;
  hours: number;
  project_id?: number;
  task_id?: number;
  start_time?: string;
  end_time?: string;
  activity_description?: string;
  supervisor_id?: number;
}

export interface VolunteerTimeLogUpdate {
  project_id?: number;
  task_id?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  hours?: number;
  activity_description?: string;
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
  project_id: number;
  user_id: number;
  role?: string;
  is_volunteer: boolean;
  assigned_at: string;
  removed_at?: string;
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

export interface PaginationParams {
  skip?: number;
  limit?: number;
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
  approved_only?: boolean;
}
