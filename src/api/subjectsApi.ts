import { baseApi } from '@/api/baseApi';
import type {
    CreateSubjectRequest,
    ImportSubjectsResponse,
    PaginatedResponse,
    Subject,
    UpdateSubjectRequest
} from '../types/subject.types';

export const subjectsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all subjects with pagination, sorting, and searching
        getSubjects: builder.query<PaginatedResponse<Subject>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Backend uses 0-based indexing for Subjects
                let url = `/Subjects?PageNumber=${page - 1}&PageSize=${pageSize}`;
                if (sortColumn) {
                    const sortOrder = sortDirection === 'desc' ? 2 : 1;
                    url += `&SortBy=${sortColumn}&SortOrder=${sortOrder}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }
                return url;
            },
            transformResponse: (response: any) => {
                console.log('Subjects API Response:', response);
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return {
                        items: response.result.items,
                        totalItemCount: response.result.totalItemCount || 0,
                        totalPages: response.result.totalPages || 0,
                        itemFrom: response.result.itemFrom || 0,
                        itemTo: response.result.itemTo || 0
                    };
                }
                return { items: [], totalItemCount: 0, totalPages: 0, itemFrom: 0, itemTo: 0 };
            },
            providesTags: ['Subjects'],
        }),

        // GET: Fetch by ID
        getSubjectById: builder.query<Subject, string>({
            query: (id) => `/Subjects/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Subjects', id }],
        }),

        // GET: Fetch by Code (exact match)
        getSubjectByCode: builder.query<Subject, string>({
            query: (code) => `/Subjects/code/${encodeURIComponent(code)}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: (_result, _error, code) => [{ type: 'Subjects', id: `code-${code}` }],
        }),

        // POST: Create
        createSubject: builder.mutation<Subject, CreateSubjectRequest>({
            query: (subject) => ({
                url: '/Subjects',
                method: 'POST',
                body: subject,
            }),
            invalidatesTags: ['Subjects'],
        }),

        // PUT: Update
        updateSubject: builder.mutation<Subject, UpdateSubjectRequest>({
            query: ({ id, ...subject }) => ({
                url: `/Subjects/${id}`,
                method: 'PUT',
                body: subject,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Subjects', id }, 'Subjects'],
        }),

        // DELETE: Remove
        deleteSubject: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Subjects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Subjects', id }, 'Subjects'],
        }),

        // POST: Import
        importSubjects: builder.mutation<ImportSubjectsResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/Subjects/import',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                if (typeof data === 'string') {
                    // Extract numbers using regex
                    const successMatch = data.match(/Successfully imported (\d+)/i);
                    const errorMatch = data.match(/(\d+) errors/i);

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    const errors: string[] = [];
                    if (data.includes("No valid")) {
                        errors.push("No data imported. Please check if the file is empty or formatted correctly.");
                    }

                    if (failureCount > 0 && errors.length === 0) {
                        errors.push(`Run into ${failureCount} errors during import. Please check your file format and try again.`);
                    }

                    return { successCount, failureCount, errors };
                }
                return data;
            },
            invalidatesTags: ['Subjects'],
        }),
    }),
});

export const {
    useGetSubjectsQuery,
    useGetSubjectByIdQuery,
    useGetSubjectByCodeQuery,
    useCreateSubjectMutation,
    useUpdateSubjectMutation,
    useDeleteSubjectMutation,
    useImportSubjectsMutation
} = subjectsApi;
