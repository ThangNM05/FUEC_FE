import { baseApi } from '@/api/baseApi';

import type {
    CreateStudentRequest,
    ImportStudentsResponse,
    PaginatedResponse,
    Student,
    UpdateStudentRequest,
    AutoAssignClassRequest,
    AutoAssignClassResult,
    StudentSubject,
} from '../types/student.types';

/**
 * Students API - RTK Query service
 * Handles all API calls related to Students
 */
export const studentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all students with pagination, sorting, and searching
        getStudents: builder.query<PaginatedResponse<Student>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Backend uses 0-based indexing
                const pageIndex = page - 1;
                let url = `/students?PageSize=${pageSize}&PageNumber=${pageIndex}`;
                if (sortColumn) {
                    // Backend expects camelCase property names
                    // Backend expects SortOrder: 1 = Ascending, 2 = Descending
                    const sortOrder = sortDirection === 'desc' ? 2 : 1;
                    url += `&SortBy=${sortColumn}&SortOrder=${sortOrder}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }

                return url;
            },
            transformResponse: (response: any) => {


                // Expected format: { result: { items: [], totalItemCount: ... } }
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return {
                        items: response.result.items,
                        totalItemCount: response.result.totalItemCount || 0,
                        totalPages: response.result.totalPages || 0,
                        itemFrom: response.result.itemFrom || 0,
                        itemTo: response.result.itemTo || 0
                    };
                }

                // Fallback for array response (no pagination metadata)
                if (Array.isArray(response)) {
                    return {
                        items: response,
                        totalItemCount: response.length,
                        totalPages: 1,
                        itemFrom: 1,
                        itemTo: response.length
                    };
                }


                return {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0
                };
            },
            providesTags: (result) =>
                result && result.items
                    ? [...result.items.map(({ id }) => ({ type: 'Students' as const, id })), 'Students']
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
            query: (student) => ({
                url: `/students/${student.id}`,
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
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;
                if (typeof data === 'string') {

                    const successMatch = data.match(/Successfully imported (\d+) students/);
                    const errorMatch = data.match(/(\d+) errors skipped/);

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    // If message is "No valid students found", treated as 0 success, maybe generic error
                    const errors: string[] = [];
                    if (data.includes("No valid students found")) {
                        errors.push("No data imported. Please check if the file is empty or formatted correctly.");
                    }

                    if (failureCount > 0 && errors.length === 0) {
                        errors.push(`Run into ${failureCount} errors during import. Please check your file format and try again.`);
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
        // POST: Auto-assign students to classes with schedule file support
        autoAssignClass: builder.mutation<AutoAssignClassResult, AutoAssignClassRequest>({
            query: (data) => {
                const formData = new FormData();
                if (data.subMajorId) formData.append('SubMajorId', data.subMajorId);
                if (data.cohort) formData.append('Cohort', data.cohort);
                if (data.maxStudentsPerClass) formData.append('MaxStudentsPerClass', data.maxStudentsPerClass.toString());
                if (data.file) formData.append('File', data.file);

                return {
                    url: '/students/auto-assign-class',
                    method: 'POST',
                    body: formData
                };
            },
            invalidatesTags: ['Classes', 'Students', 'ClassSubjectTeachers', 'StudentClasses']
        }),

        // GET: Fetch student schedule
        getStudentSchedule: builder.query<any[], { startDate?: string; endDate?: string }>({
            query: ({ startDate, endDate }) => {
                let url = '/students/schedule';
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);

                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }
                return url;
            },
            transformResponse: (response: any) => {
                return response?.result || response || [];
            },
            providesTags: ['Students', 'Classes'], // Invalidate if classes change
        }),
        // GET: Fetch student subjects by student ID
        getStudentSubjects: builder.query<StudentSubject[], { studentId: string, semesterId?: string }>({
            query: ({ studentId, semesterId }) => {
                let url = `/students/${studentId}/subjects`;
                if (semesterId) {
                    url += `?semesterId=${semesterId}`;
                }
                return url;
            },
            transformResponse: (response: any) => response?.result || response || [],
            providesTags: (_result, _error, { studentId }) => [{ type: 'Students', id: studentId }, 'StudentClasses'],
        }),

        // GET: Fetch student classes
        getStudentClasses: builder.query<PaginatedResponse<any>, {
            page?: number;
            pageSize?: number;
            studentId?: string;
            classId?: string;
        }>({
            query: ({ page = 1, pageSize = 10, studentId, classId }) => {
                const pageIndex = page - 1;
                let url = `/StudentClasses?PageSize=${pageSize}&PageNumber=${pageIndex}`;
                if (studentId) url += `&StudentId=${studentId}`;
                if (classId) url += `&ClassId=${classId}`;
                return url;
            },
            transformResponse: (response: any) => {
                if (response?.result?.items) return response.result;
                return { items: response?.result || response || [], totalItemCount: 0 };
            },
            providesTags: ['StudentClasses'],
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
    useAutoAssignClassMutation,
    useGetStudentScheduleQuery,
    useGetStudentSubjectsQuery,
    useGetStudentClassesQuery,
} = studentsApi;

