import { baseApi } from '@/redux/baseApi';

import type {
    CreateStudentRequest,
    ImportStudentsResponse,
    PaginatedResponse,
    Student,
    UpdateStudentRequest,
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
                // Adjust for 0-based indexing if backend requires it (consistent with Departments/Teachers)
                const pageIndex = page - 1;
                let url = `/students?PageNumber=${pageIndex}&PageSize=${pageSize}`;
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
