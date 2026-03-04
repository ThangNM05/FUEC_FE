import { baseApi } from './baseApi';
import type { CreateExamRequest, PaginatedExamsResponse } from '@/types/exam.types';

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
    }),
});

export const {
    useCreateExamMutation,
    useGetExamsByClassSubjectIdQuery
} = examsApi;
