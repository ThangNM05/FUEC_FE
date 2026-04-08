import { baseApi } from '@/api/baseApi';
import type {
  ConversationDto,
  CreateConversationDto,
  UpdateConversationDto,
  MessageDto,
  CreateMessageDto,
  PaginatedResponse,
  ConversationMemberDto,
  AddMemberDto,
} from '@/types/messenger.types';

export const messengerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ======================== CONVERSATIONS ========================

    /**
     * GET /conversations/user/{userId} - Get user's conversations
     */
    getUserConversations: builder.query<
      PaginatedResponse<ConversationDto>,
      { userId: string; page?: number; pageSize?: number; searchTerm?: string }
    >({
      query: ({ userId, page = 1, pageSize = 50, searchTerm }) => {
        let url = `/conversations/user/${userId}?PageNumber=${Math.max(0, page - 1)}&PageSize=${pageSize}`;
        if (searchTerm) {
          url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
        }
        return url;
      },
      transformResponse: (response: any) => {
        if (response?.result?.items && Array.isArray(response.result.items)) {
          return {
            items: response.result.items,
            totalItemCount: response.result.totalItemCount || 0,
            totalPages: response.result.totalPages || 0,
            itemFrom: response.result.itemFrom || 0,
            itemTo: response.result.itemTo || 0,
          };
        }
        if (response?.result && !response.result.items) {
          // Single result wrapped
          return {
            items: Array.isArray(response.result) ? response.result : [],
            totalItemCount: Array.isArray(response.result) ? response.result.length : 0,
            totalPages: 1,
            itemFrom: 0,
            itemTo: 0,
          };
        }
        return { items: [], totalItemCount: 0, totalPages: 0, itemFrom: 0, itemTo: 0 };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Conversations' as const, id })),
              { type: 'Conversations', id: 'LIST' },
            ]
          : [{ type: 'Conversations', id: 'LIST' }],
    }),

    /**
     * GET /conversations/{id} - Get conversation by ID
     */
    getConversationById: builder.query<ConversationDto, string>({
      query: (id) => `/conversations/${id}`,
      transformResponse: (response: any) => response?.result || response,
      providesTags: (_result, _error, id) => [{ type: 'Conversations', id }],
    }),

    /**
     * POST /conversations?creatorUserId={userId} - Create conversation
     */
    createConversation: builder.mutation<
      ConversationDto,
      { dto: CreateConversationDto; creatorUserId: string }
    >({
      query: ({ dto, creatorUserId }) => ({
        url: `/conversations?creatorUserId=${creatorUserId}`,
        method: 'POST',
        body: dto,
      }),
      transformResponse: (response: any) => response?.result || response,
      invalidatesTags: [{ type: 'Conversations', id: 'LIST' }],
    }),

    /**
     * PUT /conversations/{id} - Update conversation
     */
    updateConversation: builder.mutation<
      ConversationDto,
      { id: string; dto: UpdateConversationDto }
    >({
      query: ({ id, dto }) => ({
        url: `/conversations/${id}`,
        method: 'PUT',
        body: dto,
      }),
      transformResponse: (response: any) => response?.result || response,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Conversations', id },
        { type: 'Conversations', id: 'LIST' },
      ],
    }),

    /**
     * DELETE /conversations/{id} - Delete conversation (soft delete)
     */
    deleteConversation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/conversations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Conversations', id: 'LIST' }],
    }),

    /**
     * POST /conversations/{conversationId}/members - Add member
     */
    addMember: builder.mutation<
      ConversationMemberDto,
      { conversationId: string; dto: AddMemberDto }
    >({
      query: ({ conversationId, dto }) => ({
        url: `/conversations/${conversationId}/members`,
        method: 'POST',
        body: dto,
      }),
      transformResponse: (response: any) => response?.result || response,
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: 'Conversations', id: conversationId },
        { type: 'Conversations', id: 'LIST' },
      ],
    }),

    /**
     * DELETE /conversations/{conversationId}/members/{userId} - Remove member
     */
    removeMember: builder.mutation<
      void,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `/conversations/${conversationId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: 'Conversations', id: conversationId },
        { type: 'Conversations', id: 'LIST' },
      ],
    }),

    // ======================== MESSAGES ========================

    /**
     * GET /messages/conversation/{conversationId} - Get conversation messages
     */
    getConversationMessages: builder.query<
      PaginatedResponse<MessageDto>,
      { conversationId: string; page?: number; pageSize?: number }
    >({
      query: ({ conversationId, page = 1, pageSize = 100 }) =>
        `/messages/conversation/${conversationId}?PageNumber=${Math.max(0, page - 1)}&PageSize=${pageSize}`,
      transformResponse: (response: any) => {
        if (response?.result?.items && Array.isArray(response.result.items)) {
          return {
            items: response.result.items,
            totalItemCount: response.result.totalItemCount || 0,
            totalPages: response.result.totalPages || 0,
            itemFrom: response.result.itemFrom || 0,
            itemTo: response.result.itemTo || 0,
          };
        }
        if (response?.result && !response.result.items) {
          return {
            items: Array.isArray(response.result) ? response.result : [],
            totalItemCount: Array.isArray(response.result) ? response.result.length : 0,
            totalPages: 1,
            itemFrom: 0,
            itemTo: 0,
          };
        }
        return { items: [], totalItemCount: 0, totalPages: 0, itemFrom: 0, itemTo: 0 };
      },
      providesTags: (_result, _error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
    }),

    /**
     * POST /messages - Create a new message
     */
    createMessage: builder.mutation<MessageDto, CreateMessageDto>({
      query: (dto) => ({
        url: '/messages',
        method: 'POST',
        body: dto,
      }),
      transformResponse: (response: any) => response?.result || response,
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        { type: 'Conversations', id: conversationId },
        { type: 'Conversations', id: 'LIST' },
      ],
    }),

    /**
     * DELETE /messages/{id} - Delete message (soft)
     */
    deleteMessage: builder.mutation<void, { id: string; conversationId: string }>({
      query: ({ id }) => ({
        url: `/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
    }),

    /**
     * POST /messages/conversation/{conversationId}/read?userId={userId}
     * Mark messages as read
     */
    markMessagesAsRead: builder.mutation<
      number,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `/messages/conversation/${conversationId}/read?userId=${userId}`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response?.result || response,
    }),
  }),
});

export const {
  useGetUserConversationsQuery,
  useGetConversationByIdQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useGetConversationMessagesQuery,
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useMarkMessagesAsReadMutation,
} = messengerApi;
