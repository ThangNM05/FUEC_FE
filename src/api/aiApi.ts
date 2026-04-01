import { baseApi } from './baseApi';

export interface ExplainAnswerRequest {
    question: string;
    correctAnswer: string;
    studentAnswer: string;
}

export interface ExplainAnswerResponse {
    status: number;
    result: string;
}

export const aiApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        explainAnswer: builder.mutation<ExplainAnswerResponse, ExplainAnswerRequest>({
            query: (body) => ({
                url: '/AI/explain-answer',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useExplainAnswerMutation } = aiApi;
