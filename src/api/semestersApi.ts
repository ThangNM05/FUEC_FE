import { baseApi } from './baseApi';
import type {
    Semester,
    GetSemestersParams,
    CreateSemesterRequest,
    UpdateSemesterRequest,
    PaginatedResponse,
    SemesterReport
} from '@/types/semester.types';

export const semestersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSemesters: builder.query<PaginatedResponse<Semester>, GetSemestersParams>({
            query: ({ page = 1, pageSize = 10, sortColumn, sortDirection, searchTerm }) => {
                // Backend uses 0-based indexing for this project
                const pageIndex = page - 1;
                let url = `/Semesters?PageSize=${pageSize}&PageNumber=${pageIndex}`;

                if (sortColumn) {
                    const sortOrder = sortDirection === 'desc' ? 2 : 1;
                    // For Semesters, backend seems to prefer PascalCase props
                    const pascalColumn = sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1);
                    url += `&SortBy=${pascalColumn}&SortOrder=${sortOrder}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }
                return url;
            },
            providesTags: ['Semesters'],
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
                if (Array.isArray(response)) {
                    return { items: response, totalItemCount: response.length, totalPages: 1, itemFrom: 1, itemTo: response.length };
                }
                return { items: [], totalItemCount: 0, totalPages: 0, itemFrom: 0, itemTo: 0 };
            },
        }),

        getSemesterById: builder.query<Semester, string>({
            query: (id) => `/Semesters/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Semesters', id }],
        }),

        createSemester: builder.mutation<Semester, CreateSemesterRequest>({
            query: (body) => ({
                url: '/Semesters',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Semesters'],
        }),

        updateSemester: builder.mutation<Semester, UpdateSemesterRequest>({
            query: ({ id, ...body }) => ({
                url: `/Semesters/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Semesters'],
        }),

        deleteSemester: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Semesters/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Semesters'],
        }),
        getDefaultSemester: builder.query<Semester, void>({
            query: () => '/Semesters/default',
            providesTags: ['Semesters'],
            transformResponse: (response: any) => {
                if (response?.result) {
                    return response.result;
                }
                return response;
            }
        }),
        setDefaultSemester: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Semesters/${id}/set-default`,
                method: 'PUT',
            }),
            invalidatesTags: ['Semesters'],
        }),
        getSemesterReport: builder.query<SemesterReport, string>({
            query: (id) => `/Semesters/${id}/report`,
            providesTags: (_result, _error, id) => [{ type: 'Semesters', id }],
            transformResponse: (response: any) => response.result,
        }),
    }),
});

export const {
    useGetSemestersQuery,
    useGetSemesterByIdQuery,
    useCreateSemesterMutation,
    useUpdateSemesterMutation,
    useDeleteSemesterMutation,
    useGetDefaultSemesterQuery,
    useSetDefaultSemesterMutation,
    useGetSemesterReportQuery,
} = semestersApi;
