import { baseApi } from './baseApi';

export interface StudentCheatLog {
    id: string;
    studentExamId: string;
    status: string;
    capturedImageUrl: string;
    timestamp: string;
    studentName?: string;
    createdAt?: string;
}

export interface GetAllStudentCheatLogsRequest {
    studentExamId?: string;
    examId?: string;
    semesterId?: string;
    classSubjectId?: string;
    pageNumber?: number;
    pageSize?: number;
}

export const studentCheatLogsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStudentCheatLogs: builder.query<{ items: StudentCheatLog[]; totalCount: number }, GetAllStudentCheatLogsRequest>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.studentExamId) searchParams.append('StudentExamId', params.studentExamId);
                if (params.examId) searchParams.append('ExamId', params.examId);
                if (params.semesterId) searchParams.append('SemesterId', params.semesterId);
                if (params.classSubjectId) searchParams.append('ClassSubjectId', params.classSubjectId);
                searchParams.append('PageNumber', (params.pageNumber || 0).toString());
                searchParams.append('PageSize', (params.pageSize || 100).toString());
                return `/StudentCheatLogs?${searchParams.toString()}`;
            },
            transformResponse: (response: any) => {
                const raw = response.result || response;
                return {
                    items: raw.items || [],
                    totalCount: raw.totalCount || 0
                };
            },
            providesTags: ['StudentCheatLogs'],
        }),
        getStudentCheatLogById: builder.query<StudentCheatLog, string>({
            query: (id) => `/StudentCheatLogs/${id}`,
            transformResponse: (response: any) => response.result || response,
            providesTags: (_result, _error, id) => [{ type: 'StudentCheatLogs', id }],
        }),
        createStudentCheatLog: builder.mutation<void, { studentExamId: string; status: string; capturedImageUrl: string }>({
            query: (body) => ({
                url: '/StudentCheatLogs',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['StudentCheatLogs'],
        }),
        deleteStudentCheatLog: builder.mutation<void, string>({
            query: (id) => ({
                url: `/StudentCheatLogs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['StudentCheatLogs'],
        })
    }),
});

export const {
    useGetStudentCheatLogsQuery,
    useGetStudentCheatLogByIdQuery,
    useCreateStudentCheatLogMutation,
    useDeleteStudentCheatLogMutation,
} = studentCheatLogsApi;
