import { baseApi } from '@/api/baseApi';
import type { 
    SlotQuestionContentDto, 
    CreateSlotQuestionContentRequest, 
    UpdateSlotQuestionContentRequest 
} from '@/types/slotQuestionContent.types';

export const slotQuestionContentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all questions for a specific slot by slot ID
        getSlotQuestionContentsBySlotId: builder.query<SlotQuestionContentDto[], string>({
            query: (slotId) => `/slot-question-contents/slot/${slotId}`,
            transformResponse: (response: any) => response?.result || [],
            providesTags: (result, error, slotId) => [{ type: 'SlotQuestionContents', id: slotId }, { type: 'SlotQuestionContents', id: 'LIST' }]
        }),

        // Create a new slot question
        createSlotQuestionContent: builder.mutation<SlotQuestionContentDto, CreateSlotQuestionContentRequest>({
            query: (body) => ({
                url: '/slot-question-contents',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { slotId }) => [{ type: 'SlotQuestionContents', id: slotId }, { type: 'SlotQuestionContents', id: 'LIST' }],
        }),

        // Update an existing slot question
        updateSlotQuestionContent: builder.mutation<SlotQuestionContentDto, { id: string, body: UpdateSlotQuestionContentRequest }>({
            query: ({ id, body }) => ({
                url: `/slot-question-contents/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'SlotQuestionContents', id: 'LIST' }],
        }),

        // Delete a slot question
        deleteSlotQuestionContent: builder.mutation<void, string>({
            query: (id) => ({
                url: `/slot-question-contents/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'SlotQuestionContents', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetSlotQuestionContentsBySlotIdQuery,
    useCreateSlotQuestionContentMutation,
    useUpdateSlotQuestionContentMutation,
    useDeleteSlotQuestionContentMutation,
} = slotQuestionContentsApi;
