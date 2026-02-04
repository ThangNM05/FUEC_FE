import { baseApi } from '@/api/baseApi';
import type {
    CreateExamFormatRequest,
    ExamFormat,
    PaginatedResponse,
    UpdateExamFormatRequest
} from '../types/examFormat.types';

export const examFormatsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all exam formats with pagination, sorting, and searching
        getExamFormats: builder.query<PaginatedResponse<ExamFormat>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Backend uses 0-based indexing for PageNumber
                let url = `/ExamFormats?PageNumber=${page - 1}&PageSize=${pageSize}`;
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
                console.log('ExamFormats API Response:', response);
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
            providesTags: ['ExamFormats'],
        }),

        // GET: Fetch by ID
        getExamFormatById: builder.query<ExamFormat, string>({
            query: (id) => `/ExamFormats/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'ExamFormats', id }],
        }),

        // POST: Create
        createExamFormat: builder.mutation<void, CreateExamFormatRequest>({
            query: (examFormat) => ({
                url: '/ExamFormats',
                method: 'POST',
                body: examFormat,
            }),
            invalidatesTags: ['ExamFormats'],
        }),

        // PUT: Update
        updateExamFormat: builder.mutation<void, UpdateExamFormatRequest>({
            query: ({ id, ...examFormat }) => ({
                url: `/ExamFormats/${id}`,
                method: 'PUT',
                body: examFormat,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'ExamFormats', id }, 'ExamFormats'],
        }),

        // DELETE: Remove
        deleteExamFormat: builder.mutation<void, string>({
            query: (id) => ({
                url: `/ExamFormats/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'ExamFormats', id }, 'ExamFormats'],
        }),
    }),
});

export const {
    useGetExamFormatsQuery,
    useGetExamFormatByIdQuery,
    useCreateExamFormatMutation,
    useUpdateExamFormatMutation,
    useDeleteExamFormatMutation
} = examFormatsApi;
