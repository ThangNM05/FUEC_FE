import { baseApi } from '@/redux/baseApi';

import type {
    CreateTeacherRequest,
    ImportTeachersResponse,
    Teacher,
    UpdateTeacherRequest,
} from '../types/teacher.types.ts';

/**
 * Teachers API - RTK Query service
 * Handles all API calls related to Teachers
 */
export const teachersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all teachers
        getTeachers: builder.query<Teacher[], void>({
            query: () => '/teachers',
            transformResponse: (response: any) => {
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return response.result.items;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            },
            providesTags: (result) =>
                result && Array.isArray(result)
                    ? [...result.map(({ id }) => ({ type: 'Teachers' as const, id })), 'Teachers']
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
