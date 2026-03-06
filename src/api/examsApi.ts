import { baseApi } from './baseApi';
import type { CreateExamRequest, PaginatedExamsResponse, PaginatedExamQuestionsResponse } from '@/types/exam.types';

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
            transformResponse: (response: any) => response?.result || {
                items: [],
                totalItemCount: 0,
                totalPages: 0,
                itemFrom: 0,
                itemTo: 0
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
    }),
});

export const {
    useCreateExamMutation,
    useGetExamsByClassSubjectIdQuery,
    useGetExamQuestionsQuery
} = examsApi;
