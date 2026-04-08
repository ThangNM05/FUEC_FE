import { baseApi } from './baseApi';
import type {
    StudentAssignment,
    StudentAssignmentPaginatedResponse,
    CreateStudentAssignmentRequest,
    UpdateStudentAssignmentRequest,
} from '@/types/assignment.types';

export const studentAssignmentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStudentAssignmentsByAssignmentId: builder.query<StudentAssignmentPaginatedResponse, string>({
            query: (assignmentId) =>
                `/StudentAssignments?AssignmentId=${assignmentId}&PageSize=100`,
            transformResponse: (response: any) =>
                response?.result || {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0,
                },
            providesTags: ['StudentAssignments'],
        }),

        getStudentAssignmentsByStudentId: builder.query<StudentAssignmentPaginatedResponse, string>({
            query: (studentId) =>
                `/StudentAssignments?StudentId=${studentId}&PageSize=100`,
            transformResponse: (response: any) =>
                response?.result || {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0,
                },
            providesTags: ['StudentAssignments'],
        }),

        getStudentAssignmentById: builder.query<StudentAssignment, string>({
            query: (id) => `/StudentAssignments/${id}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['StudentAssignments'],
        }),

        submitAssignment: builder.mutation<StudentAssignment, CreateStudentAssignmentRequest>({
            query: (body) => ({
                url: '/StudentAssignments',
                method: 'POST',
                body: {
                    ...body,
                    status: body.status ?? 1, // Default: Submitted
                },
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['StudentAssignments'],
        }),

        updateStudentAssignment: builder.mutation<StudentAssignment, { id: string } & UpdateStudentAssignmentRequest>({
            query: ({ id, ...body }) => ({
                url: `/StudentAssignments/${id}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['StudentAssignments'],
        }),

        deleteStudentAssignment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/StudentAssignments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['StudentAssignments'],
        }),
    }),
});

export const {
    useGetStudentAssignmentsByAssignmentIdQuery,
    useGetStudentAssignmentsByStudentIdQuery,
    useGetStudentAssignmentByIdQuery,
    useSubmitAssignmentMutation,
    useUpdateStudentAssignmentMutation,
    useDeleteStudentAssignmentMutation,
} = studentAssignmentsApi;
