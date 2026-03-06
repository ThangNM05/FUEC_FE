import { baseApi } from '@/api/baseApi';
import type {
    QuestionBank,
    QuestionBanksResponse,
    SubjectQuestionBankManager,
    AssignTeacherToSubjectRequest
} from '@/types/questionBank.types';

export const questionBanksApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all Question Banks (Admin view)
        getAdminQuestionBanks: builder.query<QuestionBanksResponse, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                const pageNumber = Math.max(1, page);
                let url = `/SubjectQuestionBankManagers/banks?PageNumber=${pageNumber}&PageSize=${pageSize}`;

                if (sortColumn) {
                    const sortOrder = sortDirection === 'desc' ? 2 : 1;
                    url += `&SortBy=${sortColumn}&SortOrder=${sortOrder}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }

                return url;
            },
            transformResponse: (response: any) => response?.result || response,
            providesTags: (result) =>
                result && result.items
                    ? [...result.items.map(({ id }) => ({ type: 'QuestionBanks' as const, id })), 'QuestionBanks']
                    : ['QuestionBanks'],
        }),

        // Get Teachers assigned to a specific Subject
        getTeachersBySubjectId: builder.query<SubjectQuestionBankManager[], string>({
            query: (subjectId) => `/SubjectQuestionBankManagers/subject/${subjectId}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: (_result, _error, subjectId) => [{ type: 'QuestionBanks', id: subjectId }],
        }),

        // Get Subjects assigned to a specific Teacher (for Teacher View)
        getSubjectsByTeacherId: builder.query<SubjectQuestionBankManager[], string>({
            query: (teacherId) => `/SubjectQuestionBankManagers/teacher/${teacherId}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['QuestionBanks'],
        }),

        // Get Subjects assigned to the currently authenticated teacher (no teacherId required)
        getMyQuestionBanks: builder.query<SubjectQuestionBankManager[], void>({
            query: () => `/SubjectQuestionBankManagers/my-banks`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['QuestionBanks'],
        }),

        // Assign a Teacher to manage a Subject Question Bank
        assignTeacher: builder.mutation<SubjectQuestionBankManager, AssignTeacherToSubjectRequest>({
            query: (data) => ({
                url: '/SubjectQuestionBankManagers',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['QuestionBanks'],
        }),

        // Revoke a Teacher's access to a Subject Question Bank
        revokeTeacher: builder.mutation<void, { subjectId: string, teacherId: string }>({
            query: ({ subjectId, teacherId }) => ({
                url: `/SubjectQuestionBankManagers/${subjectId}/teacher/${teacherId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['QuestionBanks'],
        }),
    }),
});

export const {
    useGetAdminQuestionBanksQuery,
    useGetTeachersBySubjectIdQuery,
    useGetSubjectsByTeacherIdQuery,
    useGetMyQuestionBanksQuery,
    useAssignTeacherMutation,
    useRevokeTeacherMutation,
} = questionBanksApi;
