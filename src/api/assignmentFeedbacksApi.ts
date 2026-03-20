import { baseApi } from './baseApi';
import type {
    AssignmentFeedback,
    CreateAssignmentFeedbackRequest
} from '@/types/assignment.types';

export const assignmentFeedbacksApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAssignmentFeedbacks: builder.query<AssignmentFeedback[], string>({
            query: (studentAssignmentId) => `/AssignmentFeedbacks?studentAssignmentId=${studentAssignmentId}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['AssignmentFeedbacks'],
        }),
        createAssignmentFeedback: builder.mutation<AssignmentFeedback, CreateAssignmentFeedbackRequest>({
            query: (body) => ({
                url: '/AssignmentFeedbacks',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['AssignmentFeedbacks'],
        }),
        updateAssignmentFeedback: builder.mutation<AssignmentFeedback, Partial<AssignmentFeedback> & { id: string }>({
            query: ({ id, ...body }) => ({
                url: `/AssignmentFeedbacks/${id}`,
                method: 'PUT',
                body: { ...body, id },
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['AssignmentFeedbacks'],
        }),
        deleteAssignmentFeedback: builder.mutation<boolean, string>({
            query: (id) => ({
                url: `/AssignmentFeedbacks/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['AssignmentFeedbacks'],
        }),
    }),
});

export const {
    useGetAssignmentFeedbacksQuery,
    useCreateAssignmentFeedbackMutation,
    useUpdateAssignmentFeedbackMutation,
    useDeleteAssignmentFeedbackMutation,
} = assignmentFeedbacksApi;
