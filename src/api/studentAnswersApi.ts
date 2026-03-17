import { baseApi } from './baseApi';

export interface CreateStudentAnswerDto {
    studentExamId: string;
    questionId: string;
    selectedOptionId: string;
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
        updateStudentAnswer: builder.mutation<any, { id: string; selectedOptionId: string }>({
            query: ({ id, selectedOptionId }) => ({
                url: `/StudentAnswers/${id}`,
                method: 'PUT',
                body: { selectedOptionId },
            }),
            invalidatesTags: ['StudentExams'],
        }),
    }),
});

export const {
    useCreateStudentAnswerMutation,
    useUpdateStudentAnswerMutation,
} = studentAnswersApi;
