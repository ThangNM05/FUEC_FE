import { baseApi } from './baseApi';

export interface CreateStudentAnswerDto {
    studentExamId: string;
    questionId: string;
    choiceId?: string;
    choiceIds?: string[];
}

export const studentAnswersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createStudentAnswer: builder.mutation<any, CreateStudentAnswerDto>({
            query: (body) => ({
                url: '/StudentAnswers',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['StudentExams'],
        }),
        updateStudentAnswer: builder.mutation<any, { id: string; choiceId: string }>({
            query: ({ id, choiceId }) => ({
                url: `/StudentAnswers/${id}`,
                method: 'PUT',
                body: { choiceId },
            }),
            invalidatesTags: ['StudentExams'],
        }),
    }),
});

export const {
    useCreateStudentAnswerMutation,
    useUpdateStudentAnswerMutation,
} = studentAnswersApi;
