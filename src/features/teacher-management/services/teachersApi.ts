import { baseApi } from '@/redux/baseApi';

import type {
    CreateTeacherRequest,
    ImportTeachersResponse,
    PaginatedResponse,
    Teacher,
    UpdateTeacherRequest,
} from '../types/teacher.types.ts';

/**
 * Teachers API - RTK Query service
 * Handles all API calls related to Teachers
 */
export const teachersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all teachers with pagination, sorting, and searching
        getTeachers: builder.query<PaginatedResponse<Teacher>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Adjust for 0-based indexing if backend requires it (consistent with Departments)
                const pageIndex = page - 1;
                let url = `/teachers?PageNumber=${pageIndex}&PageSize=${pageSize}`;
                if (sortColumn) {
                    // Capitalize first letter for backend (teacherCode -> TeacherCode)
                    const pascalCaseColumn = sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1);
                    url += `&SortColumn=${pascalCaseColumn}&SortDirection=${sortDirection || 'asc'}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }
                return url;
            },
            transformResponse: (response: any) => {
                console.log('API Teachers Response:', response); // Debug log

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

                // Fallback for array response (if backend returns flat array)
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
                    ? [...result.items.map(({ id }) => ({ type: 'Teachers' as const, id })), 'Teachers']
                    : ['Teachers'],
        }),

        // GET: Fetch teacher by ID
        getTeacherById: builder.query<Teacher, string>({
            query: (id) => `/teachers/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Teachers', id }],
        }),

        // POST: Create new teacher
        createTeacher: builder.mutation<Teacher, CreateTeacherRequest>({
            query: (teacher) => ({
                url: '/teachers',
                method: 'POST',
                body: teacher,
            }),
            invalidatesTags: ['Teachers'],
        }),

        // PUT: Update existing teacher
        updateTeacher: builder.mutation<Teacher, UpdateTeacherRequest>({
            query: ({ id, ...teacher }) => ({
                url: `/teachers/${id}`,
                method: 'PUT',
                body: teacher,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Teachers', id }, 'Teachers'],
        }),

        // DELETE: Remove teacher
        deleteTeacher: builder.mutation<void, string>({
            query: (id) => ({
                url: `/teachers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Teachers', id }, 'Teachers'],
        }),

        // POST: Import teachers from Excel file
        importTeachers: builder.mutation<ImportTeachersResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: '/teachers/import',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                if (typeof data === 'string') {
                    const successMatch = data.match(/Successfully imported (\d+) teachers/);
                    const errorMatch = data.match(/(\d+) errors skipped/);

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    const errors = [];
                    if (data.includes("No valid teachers found")) {
                        errors.push("No valid teachers found in the file.");
                    }

                    return {
                        successCount,
                        failureCount,
                        errors
                    };
                }

                return data;
            },
            invalidatesTags: ['Teachers'],
        }),
    }),
});

export const {
    useGetTeachersQuery,
    useGetTeacherByIdQuery,
    useCreateTeacherMutation,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
    useImportTeachersMutation,
} = teachersApi;
