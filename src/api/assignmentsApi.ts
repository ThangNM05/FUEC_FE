import { baseApi } from './baseApi';
import type {
    Assignment,
    AssignmentPaginatedResponse,
    CreateAssignmentRequest,
    UpdateAssignmentRequest,
} from '@/types/assignment.types';

export const assignmentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAssignmentsByClassSubjectId: builder.query<AssignmentPaginatedResponse, string>({
            query: (classSubjectId) =>
                `/Assignments?ClassSubjectId=${classSubjectId}&PageSize=100`,
            transformResponse: (response: any) =>
                response?.result || {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0,
                },
            providesTags: ['Assignments'],
        }),

        getAssignmentById: builder.query<Assignment, string>({
            query: (id) => `/Assignments/${id}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['Assignments'],
        }),

        createAssignment: builder.mutation<Assignment[], CreateAssignmentRequest>({
            query: (body) => ({
                url: '/Assignments',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['Assignments'],
        }),

        updateAssignment: builder.mutation<Assignment, { id: string } & UpdateAssignmentRequest>({
            query: ({ id, ...body }) => ({
                url: `/Assignments/${id}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['Assignments'],
        }),

        deleteAssignment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Assignments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Assignments'],
        }),
    }),
});

export const {
    useGetAssignmentsByClassSubjectIdQuery,
    useGetAssignmentByIdQuery,
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation,
} = assignmentsApi;
