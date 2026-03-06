import { baseApi } from '@/api/baseApi';
import type {
    Curriculum,
    CreateCurriculumRequest,
    UpdateCurriculumRequest,
    PaginatedResponse
} from '../types/curriculum.types';

export const curriculumsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all curriculums with pagination
        getCurriculums: builder.query<PaginatedResponse<Curriculum>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                let url = `/Curriculums?PageNumber=${page - 1}&PageSize=${pageSize}`;
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
                return { items: [], totalItemCount: 0, totalPages: 0, itemFrom: 0, itemTo: 0 };
            },
            providesTags: ['Curriculums'],
        }),

        // GET: Fetch by ID
        getCurriculumById: builder.query<Curriculum, string>({
            query: (id) => `/Curriculums/${id}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: (_result, _error, id) => [{ type: 'Curriculums', id }],
        }),

        // POST: Create
        createCurriculum: builder.mutation<Curriculum, CreateCurriculumRequest>({
            query: (curriculum) => ({
                url: '/Curriculums',
                method: 'POST',
                body: curriculum,
            }),
            invalidatesTags: ['Curriculums'],
        }),

        // PUT: Update
        updateCurriculum: builder.mutation<Curriculum, UpdateCurriculumRequest>({
            query: ({ id, ...curriculum }) => ({
                url: `/Curriculums/${id}`,
                method: 'PUT',
                body: curriculum,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Curriculums', id }, 'Curriculums'],
        }),

        // DELETE: Remove
        deleteCurriculum: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Curriculums/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Curriculums', id }, 'Curriculums'],
        }),
    }),
});

export const {
    useGetCurriculumsQuery,
    useGetCurriculumByIdQuery,
    useCreateCurriculumMutation,
    useUpdateCurriculumMutation,
    useDeleteCurriculumMutation
} = curriculumsApi;
