/**
 * Communication API Methods
 *
 * Handles all communication-related endpoints including:
 * - Conversations (messaging)
 * - Messages
 * - Announcements
 * - Email digest preferences
 */

import { apiClient } from './client';

const BASE_PATH = '/communication';

export interface ConversationResponse {
  id: number;
  type: string;
  title: string | null;
  project_id: number | null;
  is_active: boolean;
  last_message_at: string | null;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  participants: ConversationParticipantResponse[];
  unread_total: number;
}

export interface ConversationParticipantResponse {
  id: number;
  user_id: number;
  user_name: string | null;
  user_avatar: string | null;
  joined_at: string;
  last_read_at: string | null;
  unread_count: number;
  notifications_enabled: boolean;
}

export interface ConversationCreate {
  type: 'direct' | 'group' | 'project';
  title?: string;
  project_id?: number;
  participant_ids: number[];
}

export interface MessageResponse {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  reply_to_id: number | null;
  attachments: unknown[] | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  read_receipts: MessageReadReceiptResponse[];
  sender_name: string | null;
  sender_avatar: string | null;
}

export interface MessageReadReceiptResponse {
  id: number;
  message_id: number;
  user_id: number;
  read_at: string;
}

export interface MessageCreate {
  content: string;
  message_type?: 'direct' | 'group' | 'announcement';
  reply_to_id?: number;
  attachments?: unknown[];
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface AnnouncementResponse {
  id: number;
  title: string;
  content: string;
  created_by_id: number;
  target_user_types: string[] | null;
  target_project_ids: number[] | null;
  target_user_ids: number[] | null;
  publish_at: string;
  expire_at: string | null;
  priority: number;
  is_published: boolean;
  is_pinned: boolean;
  attachments: unknown[] | null;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  creator_name: string | null;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  target_user_types?: string[];
  target_project_ids?: number[];
  target_user_ids?: number[];
  publish_at?: string;
  expire_at?: string;
  priority?: number;
  is_pinned?: boolean;
  is_published?: boolean;
  attachments?: unknown[];
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string;
  target_user_types?: string[];
  target_project_ids?: number[];
  target_user_ids?: number[];
  publish_at?: string;
  expire_at?: string;
  priority?: number;
  is_pinned?: boolean;
  is_published?: boolean;
  attachments?: unknown[];
}

export interface AnnouncementListResponse {
  announcements: AnnouncementResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface EmailDigestPreferenceResponse {
  id: number;
  user_id: number;
  enabled: boolean;
  frequency: string;
  preferred_hour: number;
  include_messages: boolean;
  include_announcements: boolean;
  include_task_updates: boolean;
  include_project_updates: boolean;
  last_digest_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailDigestPreferenceUpdate {
  enabled?: boolean;
  frequency?: 'daily' | 'weekly' | 'never';
  preferred_hour?: number;
  include_messages?: boolean;
  include_announcements?: boolean;
  include_task_updates?: boolean;
  include_project_updates?: boolean;
}

export const communicationApi = {
  // ==================== Conversations ====================

  /**
   * Get all conversations for the current user
   */
  getConversations: (page = 1, pageSize = 50) =>
    apiClient.get<ConversationResponse[]>(`${BASE_PATH}/conversations`, {
      page,
      page_size: pageSize,
    }),

  /**
   * Get a specific conversation
   */
  getConversation: (conversationId: number) =>
    apiClient.get<ConversationResponse>(
      `${BASE_PATH}/conversations/${conversationId}`
    ),

  /**
   * Create a new conversation
   */
  createConversation: (data: ConversationCreate) =>
    apiClient.post<ConversationResponse>(
      `${BASE_PATH}/conversations`,
      data
    ),

  /**
   * Leave a conversation
   */
  leaveConversation: (conversationId: number) =>
    apiClient.delete<void>(
      `${BASE_PATH}/conversations/${conversationId}`
    ),

  /**
   * Add participant to conversation
   */
  addParticipant: (conversationId: number, userId: number) =>
    apiClient.post<void>(
      `${BASE_PATH}/conversations/${conversationId}/participants/${userId}`
    ),

  // ==================== Messages ====================

  /**
   * Get messages in a conversation
   */
  getMessages: (
    conversationId: number,
    page = 1,
    pageSize = 50
  ): Promise<MessageListResponse> =>
    apiClient.get<MessageListResponse>(
      `${BASE_PATH}/conversations/${conversationId}/messages`,
      { page, page_size: pageSize }
    ),

  /**
   * Send a message in a conversation
   */
  sendMessage: (conversationId: number, data: MessageCreate) =>
    apiClient.post<MessageResponse>(
      `${BASE_PATH}/conversations/${conversationId}/messages`,
      data
    ),

  /**
   * Edit a message
   */
  editMessage: (messageId: number, content: string) =>
    apiClient.put<MessageResponse>(`${BASE_PATH}/messages/${messageId}`, {
      content,
    }),

  /**
   * Delete a message
   */
  deleteMessage: (messageId: number) =>
    apiClient.delete<void>(`${BASE_PATH}/messages/${messageId}`),

  /**
   * Mark a message as read
   */
  markAsRead: (conversationId: number, messageId: number) =>
    apiClient.put<void>(
      `${BASE_PATH}/conversations/${conversationId}/messages/${messageId}/read`
    ),

  // ==================== Announcements ====================

  /**
   * Get announcements visible to current user
   */
  getAnnouncements: (page = 1, pageSize = 20): Promise<AnnouncementListResponse> =>
    apiClient.get<AnnouncementListResponse>(`${BASE_PATH}/announcements`, {
      page,
      page_size: pageSize,
    }),

  /**
   * Get a specific announcement
   */
  getAnnouncement: (announcementId: number) =>
    apiClient.get<AnnouncementResponse>(
      `${BASE_PATH}/announcements/${announcementId}`
    ),

  /**
   * Create a new announcement (admin only)
   */
  createAnnouncement: (data: AnnouncementCreate) =>
    apiClient.post<AnnouncementResponse>(
      `${BASE_PATH}/announcements`,
      data
    ),

  /**
   * Update an announcement (admin only)
   */
  updateAnnouncement: (announcementId: number, data: AnnouncementUpdate) =>
    apiClient.put<AnnouncementResponse>(
      `${BASE_PATH}/announcements/${announcementId}`,
      data
    ),

  /**
   * Publish an announcement (admin only)
   */
  publishAnnouncement: (announcementId: number) =>
    apiClient.post<AnnouncementResponse>(
      `${BASE_PATH}/announcements/${announcementId}/publish`
    ),

  /**
   * Delete an announcement (admin only)
   */
  deleteAnnouncement: (announcementId: number) =>
    apiClient.delete<void>(
      `${BASE_PATH}/announcements/${announcementId}`
    ),

  // ==================== Email Digest Preferences ====================

  /**
   * Get current user's email digest preferences
   */
  getDigestPreferences: () =>
    apiClient.get<EmailDigestPreferenceResponse>(
      `${BASE_PATH}/email-digest-preferences`
    ),

  /**
   * Update email digest preferences
   */
  updateDigestPreferences: (data: EmailDigestPreferenceUpdate) =>
    apiClient.put<EmailDigestPreferenceResponse>(
      `${BASE_PATH}/email-digest-preferences`,
      data
    ),
};