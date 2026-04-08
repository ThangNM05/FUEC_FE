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
    chapter?: number;
    options: QuizOption[];
    studentAnswerId?: string;
    choiceId?: string;
    choiceIds?: string[];
}

export interface StudentExam {
    studentExamId: string;
    examId: string;
    examDisplayName: string;
    remainingTime: string;
    endTime: string;
    questions: QuizQuestion[];
    grade?: number;
    isPublicGrade: boolean;
    isSubmitted: boolean;
    isProctoringExempt: boolean;
    studentCode?: string;
    studentName?: string;
}

export interface StartExamRequest {
    examId: string;
    accessCode?: string;
    ipAddress?: string;
}

const normalizeStudentExam = (data: any): StudentExam => {
    const raw = data?.result || data;
    return {
        studentExamId: raw.studentExamId || raw.StudentExamId || raw.id || raw.Id,
        examId: raw.examId || raw.ExamId,
        examDisplayName: raw.examDisplayName || raw.ExamDisplayName,
        remainingTime: raw.remainingTime || raw.RemainingTime,
        endTime: raw.endTime || raw.ExamEndTime || raw.EndTime,
        isSubmitted: raw.isSubmitted || raw.IsSubmitted || (raw.grade !== null && raw.grade !== undefined),
        isPublicGrade: raw.isPublicGrade !== undefined ? raw.isPublicGrade : (raw.IsPublicGrade ?? true),
        isProctoringExempt: raw.isProctoringExempt || raw.IsProctoringExempt || false,
        grade: raw.grade !== undefined ? raw.grade : raw.Grade,
        studentCode: raw.studentCode || raw.StudentCode,
        studentName: raw.studentName || raw.StudentName,
        questions: (raw.questions || raw.Questions || []).map((q: any) => ({
            id: q.id || q.Id,
            questionContent: q.questionContent || q.QuestionContent,
            questionType: q.questionType || q.QuestionType,
            tag: q.tag || q.Tag,
            chapter: q.chapter || q.Chapter,
            options: (q.options || q.Options || []).map((o: any) => ({
                id: o.id || o.Id,
                questionId: o.questionId || o.QuestionId,
                choiceContent: o.choiceContent || o.ChoiceContent,
                isCorrect: o.isCorrect || o.IsCorrect,
                isActive: o.isActive !== undefined ? o.isActive : o.IsActive,
            })),
            studentAnswerId: q.studentAnswerId || q.StudentAnswerId,
            choiceId: q.choiceId || q.ChoiceId,
            choiceIds: q.choiceIds || q.ChoiceIds,
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
            transformResponse: (response: any) => {
                const raw = response.result || response;
                return {
                    ...raw,
                    items: (raw.items || raw.Items || []).map(normalizeStudentExam)
                };
            },
            providesTags: ['StudentExams'],
        }),
        getAllStudentExams: builder.query<any, { studentClassesId?: string; examId?: string; page?: number; pageSize?: number }>({
            query: ({ studentClassesId, examId, page = 1, pageSize = 100 }) => {
                const params = new URLSearchParams();
                if (studentClassesId) params.append('StudentClassesId', studentClassesId);
                if (examId) params.append('ExamId', examId);
                params.append('PageNumber', (page - 1).toString());
                params.append('PageSize', pageSize.toString());
                return `/StudentExams?${params.toString()}`;
            },
            transformResponse: (response: any) => {
                const raw = response.result || response;
                return {
                    ...raw,
                    items: (raw.items || raw.Items || []).map(normalizeStudentExam)
                };
            },
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
        forceSubmitStudentExam: builder.mutation<any, string>({
            query: (id) => ({
                url: `/StudentExams/${id}/force-submit`,
                method: 'POST',
            }),
            transformResponse: (response: any) => response.result || response,
            invalidatesTags: (_result, _error, id) => [{ type: 'StudentExams', id }],
        }),
        updateStudentExam: builder.mutation<any, { id: string; grade?: number }>({
            query: ({ id, ...body }) => ({
                url: `/StudentExams/${id}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: any) => response.result || response,
            invalidatesTags: (_result, _error, { id }) => [{ type: 'StudentExams', id }],
        }),
    }),
});

export const {
    useStartStudentExamMutation,
    useGetStudentExamByIdQuery,
    useGetStudentExamsByExamIdQuery,
    useGetAllStudentExamsQuery,
    useSubmitStudentExamMutation,
    useUpdateStudentExamMutation,
    useForceSubmitStudentExamMutation,
} = studentExamsApi;
