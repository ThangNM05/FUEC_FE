import { baseApi } from './baseApi';
import type { CreateExamRequest, UpdateExamRequest, PaginatedExamsResponse, PaginatedExamQuestionsResponse } from '@/types/exam.types';

export const examsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createExam: builder.mutation<void, CreateExamRequest>({
            query: (exam) => ({
                url: '/Exams/generate',
                method: 'POST',
                body: exam,
            }),
            invalidatesTags: ['Exams'],
        }),
        getExamsByClassSubjectId: builder.query<PaginatedExamsResponse, string>({
            query: (classSubjectId) => `/Exams?ClassSubjectId=${classSubjectId}`,
            transformResponse: (response: any) => {
                console.log("EXAMS RESPONSE:", response);
                return response?.result || {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0
                };
            },
            providesTags: ['Exams'],
        }),
        getExamQuestions: builder.query<PaginatedExamQuestionsResponse, { examId: string; page?: number; pageSize?: number }>({
            query: ({ examId, page = 0, pageSize = 100 }) => `/ExamQuestions?ExamId=${examId}&PageNumber=${page}&PageSize=${pageSize}`,
            transformResponse: (response: any) => response?.result || {
                items: [],
                totalItemCount: 0,
                totalPages: 0,
                itemFrom: 0,
                itemTo: 0
            },
            providesTags: ['Exams'],
        }),
        updateExam: builder.mutation<void, UpdateExamRequest>({
            query: ({ id, ...exam }) => ({
                url: `/Exams/${id}`,
                method: 'PUT',
                body: exam,
            }),
            invalidatesTags: ['Exams'],
        }),
        deleteExam: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Exams/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Exams'],
        }),
    }),
});

export const {
    useCreateExamMutation,
    useGetExamsByClassSubjectIdQuery,
    useGetExamQuestionsQuery,
    useUpdateExamMutation,
    useDeleteExamMutation
} = examsApi;
