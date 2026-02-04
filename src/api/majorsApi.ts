import { baseApi } from '@/api/baseApi';
import type { Major, CreateMajorRequest, UpdateMajorRequest, PaginatedResponse, ImportMajorsResponse } from '../types/major.types';
import type { SubMajor } from '../types/subMajor.types';

export const majorsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all majors
        // GET: Fetch all majors with pagination, sorting, and searching
        getMajors: builder.query<PaginatedResponse<Major>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Backend seems to use 0-based indexing
                const pageIndex = page - 1;
                let url = `/majors?PageNumber=${pageIndex}&PageSize=${pageSize}`;

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
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return {
                        items: response.result.items,
                        totalItemCount: response.result.totalItemCount || 0,
                        totalPages: response.result.totalPages || 0,
                        itemFrom: response.result.itemFrom || 0,
                        itemTo: response.result.itemTo || 0
                    };
                }

                // Fallback
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
                    ? [...result.items.map(({ id }) => ({ type: 'Majors' as const, id })), 'Majors']
                    : ['Majors'],
        }),

        // GET: Fetch major by ID
        getMajorById: builder.query<Major, string>({
            query: (id) => `/majors/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Majors', id }],
        }),

        // POST: Create new major
        createMajor: builder.mutation<Major, CreateMajorRequest>({
            query: (major) => ({
                url: '/majors',
                method: 'POST',
                body: major,
            }),
            invalidatesTags: ['Majors'],
        }),

        // PUT: Update existing major
        updateMajor: builder.mutation<Major, UpdateMajorRequest>({
            query: ({ id, ...major }) => ({
                url: `/majors/${id}`,
                method: 'PUT',
                body: major,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Majors', id }, 'Majors'],
        }),

        // DELETE: Remove major
        deleteMajor: builder.mutation<void, string>({
            query: (id) => ({
                url: `/majors/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Majors', id }, 'Majors'],
        }),

        // POST: Import majors from Excel
        importMajors: builder.mutation<ImportMajorsResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: '/majors/import',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                if (typeof data === 'string') {
                    const successMatch = data.match(/Successfully imported (\d+) majors/i);
                    const errorMatch = data.match(/(\d+) errors skipped/i);

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    const errors: string[] = [];
                    if (data.includes("No valid") || data.includes("error")) {
                        errors.push(data);
                    }

                    return {
                        successCount,
                        failureCount,
                        errors
                    };
                }

                return {
                    successCount: (data?.insertedCount ?? data?.InsertedCount ?? 0) + (data?.updatedCount ?? data?.UpdatedCount ?? 0),
                    failureCount: data?.errorCount ?? data?.ErrorCount ?? 0,
                    errors: data?.errors ?? data?.Errors ?? []
                };
            },
            invalidatesTags: ['Majors'],
        }),
        // GET: Fetch sub-majors for a specific major
        getSubMajorsByMajorId: builder.query<SubMajor[], string>({
            query: (majorId) => `/Majors/${majorId}/submajors`,
            transformResponse: (response: any) => {
                return response?.result || [];
            },
            providesTags: (result, _error, majorId) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'SubMajors' as const, id })), { type: 'SubMajors', id: `MAJOR_${majorId}` }]
                    : [{ type: 'SubMajors', id: `MAJOR_${majorId}` }],
        }),
    }),
});

export const {
    useGetMajorsQuery,
    useGetMajorByIdQuery,
    useCreateMajorMutation,
    useUpdateMajorMutation,
    useDeleteMajorMutation,
    useImportMajorsMutation,
    useGetSubMajorsByMajorIdQuery,
} = majorsApi;
