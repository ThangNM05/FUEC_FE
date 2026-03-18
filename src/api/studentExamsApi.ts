import { baseApi } from './baseApi';
import type { PaginatedResponse } from '@/types/student.types';

export interface QuizOption {
    id: string;
    questionId: string;
    choiceContent: string;
    isCorrect?: boolean;
    isActive: boolean;
}

export interface QuizQuestion {
    id: string;
    questionContent: string;
    questionType: number;
    tag?: string;
    options: QuizOption[];
    studentAnswerId?: string;
    selectedOptionId?: string;
}

export interface StudentExam {
    studentExamId: string;
    examId: string;
    examDisplayName: string;
    remainingTime: string;
    endTime: string;
    questions: QuizQuestion[];
    grade?: number;
    isSubmitted: boolean;
}

export interface StartExamRequest {
    examId: string;
    accessCode?: string;
    ipAddress?: string;
}

const normalizeStudentExam = (data: any): StudentExam => {
    const raw = data?.result || data;
    return {
        studentExamId: raw.studentExamId || raw.Id,
        examId: raw.examId || raw.ExamId,
        examDisplayName: raw.examDisplayName || raw.ExamDisplayName,
        remainingTime: raw.remainingTime || raw.RemainingTime,
        endTime: raw.endTime || raw.ExamEndTime || raw.EndTime,
        isSubmitted: raw.isSubmitted || false,
        grade: raw.grade || raw.Grade,
        questions: (raw.questions || raw.Questions || []).map((q: any) => ({
            id: q.id || q.Id,
            questionContent: q.questionContent || q.QuestionContent,
            questionType: q.questionType || q.QuestionType,
            tag: q.tag || q.Tag,
            options: (q.options || q.Options || []).map((o: any) => ({
                id: o.id || o.Id,
                questionId: o.questionId || o.QuestionId,
                choiceContent: o.choiceContent || o.ChoiceContent,
                isCorrect: o.isCorrect || o.IsCorrect,
                isActive: o.isActive !== undefined ? o.isActive : o.IsActive,
            })),
            studentAnswerId: q.studentAnswerId || q.StudentAnswerId,
            selectedOptionId: q.selectedOptionId || q.SelectedOptionId,
        })),
    };
};

export const studentExamsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        startStudentExam: builder.mutation<StudentExam, StartExamRequest>({
            query: ({ examId, ...body }) => ({
                url: `/Exams/${examId}/start`,
                method: 'POST',
                body,
            }),
            transformResponse: normalizeStudentExam,
            invalidatesTags: ['StudentExams'],
        }),
        getStudentExamById: builder.query<StudentExam, string>({
            query: (id) => `/StudentExams/${id}`,
            transformResponse: normalizeStudentExam,
            providesTags: (_result, _error, id) => [{ type: 'StudentExams', id }],
        }),
        getStudentExamsByExamId: builder.query<any, { examId: string; page?: number; pageSize?: number }>({
            query: ({ examId, page = 1, pageSize = 100 }) => 
                `/StudentExams?ExamId=${examId}&PageNumber=${page - 1}&PageSize=${pageSize}`,
            transformResponse: (response: any) => response.result || response,
            providesTags: ['StudentExams'],
        }),
        submitStudentExam: builder.mutation<any, string>({
            query: (id) => ({
                url: `/StudentExams/${id}/submit`,
                method: 'POST',
            }),
            transformResponse: (response: any) => response.result || response,
            invalidatesTags: (_result, _error, id) => [{ type: 'StudentExams', id }],
        }),
    }),
});

export const {
    useStartStudentExamMutation,
    useGetStudentExamByIdQuery,
    useGetStudentExamsByExamIdQuery,
    useSubmitStudentExamMutation,
} = studentExamsApi;
