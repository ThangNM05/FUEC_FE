import { baseApi } from '@/api/baseApi';

export interface SubmitSlotAnswerDto {
    studentId: string;
    slotQuestionContentId: string;
    answerText: string;
}

export interface StudentSlotAnswerDto {
    id: string;
    studentId: string;
    slotQuestionContentId: string;
    slotId: string;
    answerText: string;
    questionContent?: string;
    studentCode?: string;
    studentName?: string;
    createdAt: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    isActive: boolean;
    isPassed?: boolean | null;
    teacherFeedback?: string | null;
    isAIGraded?: boolean;
}

export const studentSlotAnswersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitSlotAnswer: builder.mutation<StudentSlotAnswerDto, SubmitSlotAnswerDto>({
            query: (body) => ({
                url: '/student-slot-answers',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any) => response?.result,
            invalidatesTags: (result, error, { slotQuestionContentId }) => [
                { type: 'StudentSlotAnswers', id: slotQuestionContentId },
                { type: 'StudentSlotAnswers', id: 'LIST' },
            ],
        }),

        getSlotAnswersByStudentAndSlot: builder.query<StudentSlotAnswerDto[], { studentId: string; slotId: string }>({
            query: ({ studentId, slotId }) => `/student-slot-answers?studentId=${studentId}&slotId=${slotId}`,
            transformResponse: (response: any) => response?.result || [],
            providesTags: (result, error, { slotId }) => [
                { type: 'StudentSlotAnswers', id: slotId },
                { type: 'StudentSlotAnswers', id: 'LIST' },
            ],
        }),

        getSlotAnswersByQuestionId: builder.query<StudentSlotAnswerDto[], string>({
            query: (questionId) => `/student-slot-answers/question/${questionId}`,
            transformResponse: (response: any) => response?.result || [],
            providesTags: (result, error, questionId) => [
                { type: 'StudentSlotAnswers', id: questionId },
                { type: 'StudentSlotAnswers', id: 'LIST' },
            ],
        }),

        deleteSlotAnswer: builder.mutation<string, string>({
            query: (id) => ({
                url: `/student-slot-answers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'StudentSlotAnswers', id: 'LIST' }],
        }),

        editSlotAnswer: builder.mutation<string, { id: string; studentId: string; answerText: string }>({
            query: ({ id, studentId, answerText }) => ({
                url: `/student-slot-answers/${id}`,
                method: 'PUT',
                body: { studentId, answerText },
            }),
            invalidatesTags: [{ type: 'StudentSlotAnswers', id: 'LIST' }],
        }),
    }),
});

export const {
    useSubmitSlotAnswerMutation,
    useGetSlotAnswersByStudentAndSlotQuery,
    useGetSlotAnswersByQuestionIdQuery,
    useDeleteSlotAnswerMutation,
    useEditSlotAnswerMutation,
} = studentSlotAnswersApi;
