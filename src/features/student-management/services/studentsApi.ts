import { baseApi } from '@/redux/baseApi';

import type {
    CreateStudentRequest,
    ImportStudentsResponse,
    Student,
    UpdateStudentRequest,
} from '../types/student.types';

/**
 * Students API - RTK Query service
 * Handles all API calls related to Students
 */
export const studentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all students
        getStudents: builder.query<Student[], void>({
            query: () => '/students',
            transformResponse: (response: any) => {
                // New response format: { status: 200, result: { items: [...] } }
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return response.result.items;
                }

                // Fallbacks for other formats
                if (Array.isArray(response)) {
                    return response;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }

                console.warn('Unexpected response format:', response);
                return [];
            },
            providesTags: (result) =>
                result && Array.isArray(result)
                    ? [...result.map(({ id }) => ({ type: 'Students' as const, id })), 'Students']
                    : ['Students'],
        }),

        // GET: Fetch student by ID
        getStudentById: builder.query<Student, string>({
            query: (id) => `/students/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Students', id }],
        }),

        // POST: Create new student
        createStudent: builder.mutation<Student, CreateStudentRequest>({
            query: (student) => ({
                url: '/students',
                method: 'POST',
                body: student,
            }),
            invalidatesTags: ['Students'],
        }),

        // PUT: Update existing student
        updateStudent: builder.mutation<Student, UpdateStudentRequest>({
            query: ({ id, ...student }) => ({
                url: `/students/${id}`,
                method: 'PUT',
                body: student,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Students', id }, 'Students'],
        }),

        // DELETE: Remove student
        deleteStudent: builder.mutation<void, string>({
            query: (id) => ({
                url: `/students/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Students', id }, 'Students'],
        }),

        // POST: Import students from Excel file
        importStudents: builder.mutation<ImportStudentsResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: '/students/import',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                // Unwrap if wrapped in result/data
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                // Handle String Response (Backend returning text message)
                if (typeof data === 'string') {
                    console.log('String response detected, parsing...');
                    const successMatch = data.match(/Successfully imported (\d+) students/);
                    const errorMatch = data.match(/(\d+) errors skipped/);

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    // If message is "No valid students found", treated as 0 success, maybe generic error
                    const errors = [];
                    if (data.includes("No valid students found")) {
                        errors.push("No valid students found in the file.");
                    }

                    return {
                        successCount,
                        failureCount,
                        errors
                    };
                }

                return data;
            },
            invalidatesTags: ['Students'],
        }),
    }),
});

// Export auto-generated hooks
export const {
    useGetStudentsQuery,
    useGetStudentByIdQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
    useImportStudentsMutation,
} = studentsApi;
