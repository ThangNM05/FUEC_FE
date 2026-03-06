import { baseApi } from '@/api/baseApi';
import type { SubMajor, CreateSubMajorRequest, UpdateSubMajorRequest, PaginatedResponse, ImportSubMajorsResponse } from '../types/subMajor.types';

export const subMajorsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all sub-majors with pagination, sorting, and searching
        getSubMajors: builder.query<PaginatedResponse<SubMajor>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
            majorId?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm, majorId }) => {
                const pageIndex = page - 1;
                let url = `/SubMajors?PageNumber=${pageIndex}&PageSize=${pageSize}`;

                if (majorId) {
                    url += `&MajorId=${majorId}`;
                }

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
                    ? [...result.items.map(({ id }) => ({ type: 'SubMajors' as const, id })), 'SubMajors']
                    : ['SubMajors'],
        }),

        // GET: Fetch sub-major by ID
        getSubMajorById: builder.query<SubMajor, string>({
            query: (id) => `/SubMajors/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'SubMajors', id }],
        }),

        // POST: Create new sub-major
        createSubMajor: builder.mutation<SubMajor, CreateSubMajorRequest>({
            query: (subMajor) => ({
                url: '/SubMajors',
                method: 'POST',
                body: subMajor,
            }),
            invalidatesTags: ['SubMajors'],
        }),

        // PUT: Update existing sub-major
        updateSubMajor: builder.mutation<SubMajor, UpdateSubMajorRequest>({
            query: ({ id, ...subMajor }) => ({
                url: `/SubMajors/${id}`,
                method: 'PUT',
                body: subMajor,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'SubMajors', id }, 'SubMajors'],
        }),

        // DELETE: Remove sub-major
        deleteSubMajor: builder.mutation<void, string>({
            query: (id) => ({
                url: `/SubMajors/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'SubMajors', id }, 'SubMajors'],
        }),
        // POST: Import sub-majors from Excel file
        importSubMajors: builder.mutation<ImportSubMajorsResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: '/SubMajors/import',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                if (typeof data === 'string') {
                    const successMatch = data.match(/Successfully imported (\d+) sub-majors/i);
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
            invalidatesTags: ['SubMajors'],
        }),
    }),
});

export const {
    useGetSubMajorsQuery,
    useGetSubMajorByIdQuery,
    useCreateSubMajorMutation,
    useUpdateSubMajorMutation,
    useDeleteSubMajorMutation,
    useImportSubMajorsMutation,
} = subMajorsApi;
