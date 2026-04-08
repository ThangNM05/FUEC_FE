// =====================================================
// Messenger Types - matching FUEC.BE DTOs & enums
// =====================================================

// --- Enum-like constants (mirrors FUEC.Domain.Enums) ---
// Using const objects instead of enum to comply with erasableSyntaxOnly

export const ConversationType = {
  Private: 0,   // 1-on-1 conversation
  Group: 1,     // Group chat
  Channel: 2,   // Public channel
} as const;
export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType];

export const MessageType = {
  Text: 0,
  Image: 1,
  File: 2,
  Video: 3,
  Audio: 4,
  System: 5,
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageStatus = {
  Sent: 0,
  Delivered: 1,
  Read: 2,
  Failed: 3,
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

// --- Conversation DTOs ---

export interface ConversationMemberDto {
  id: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  joinedAt?: string;
  isAdmin?: boolean;
}

export interface ConversationDto {
  id: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  conversationName?: string;
  conversationAvatar?: string;
  conversationType: ConversationType;
  memberCount: number;
  messageCount: number;
  members: ConversationMemberDto[];
}

export interface CreateConversationDto {
  conversationName?: string;
  conversationAvatar?: string;
  conversationType: ConversationType;
  memberUserIds: string[];
}

export interface UpdateConversationDto {
  conversationName?: string;
  conversationAvatar?: string;
}

export interface AddMemberDto {
  userId: string;
}

// --- Message DTOs ---

export interface MessageDto {
  id: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  conversationId: string;
  senderId: string;
  messageContent?: string;
  messageType: MessageType;
  messageStatus: MessageStatus;
  senderEmail?: string;
  senderFullName?: string;
}

export interface CreateMessageDto {
  conversationId: string;
  senderId: string;
  messageContent?: string;
  messageType: MessageType;
}

export interface UpdateMessageDto {
  messageContent?: string;
}

// --- Paginated Response (reused from existing patterns) ---

export interface PaginatedResponse<T> {
  items: T[];
  totalItemCount: number;
  totalPages: number;
  itemFrom: number;
  itemTo: number;
}

// --- SignalR Event DTOs (mirrors IChatNotificationService) ---

export interface SignalRMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  messageContent?: string;
  messageType: MessageType;
  messageStatus: MessageStatus;
  createdAt: string;
}

export interface SignalRConversationDto {
  id: string;
  conversationName?: string;
  conversationAvatar?: string;
  conversationType: ConversationType;
  createdAt: string;
}

export interface UserTypingEvent {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface UserJoinedEvent {
  userId: string;
  conversationId: string;
}

export interface UserLeftEvent {
  userId: string;
  conversationId: string;
}

export interface MessageDeletedEvent {
  messageId: string;
  conversationId: string;
}

export interface MemberRemovedEvent {
  conversationId: string;
  userId: string;
}

export interface MemberAddedEvent {
  conversationId: string;
  userId: string;
  userFullName?: string;
}

export interface MessagesReadEvent {
  userId: string;
  conversationId: string;
  messageIds: string[];
}
