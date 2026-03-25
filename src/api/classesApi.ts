import { baseApi } from '@/api/baseApi';
import type { Class, CreateClassRequest, UpdateClassRequest, PaginatedResponse } from '../types/class.types';

export const classesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getClasses: builder.query<PaginatedResponse<Class>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
            semesterId?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm, semesterId }) => {
                const pageNumber = Math.max(1, page);
                let url = `/classes?PageNumber=${pageNumber}&PageSize=${pageSize}`;

                if (semesterId) {
                    url += `&SemesterId=${semesterId}`;
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
                    ? [...result.items.map(({ id }) => ({ type: 'Classes' as const, id })), 'Classes']
                    : ['Classes'],
        }),

        // GET: Fetch class by ID
        getClassById: builder.query<Class, string>({
            query: (id) => `/classes/${id}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: (_result, _error, id) => [{ type: 'Classes', id }],
        }),

        // POST: Create new class
        createClass: builder.mutation<Class, CreateClassRequest>({
            query: (classData) => ({
                url: '/classes',
                method: 'POST',
                body: classData,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['Classes'],
        }),

        // PUT: Update existing class
        updateClass: builder.mutation<Class, UpdateClassRequest>({
            query: ({ id, ...classData }) => ({
                url: `/classes/${id}`,
                method: 'PUT',
                body: classData,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Classes', id }, 'Classes'],
        }),

        // DELETE: Remove class
        deleteClass: builder.mutation<void, string>({
            query: (id) => ({
                url: `/classes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Classes', id }, 'Classes'],
        }),
    }),
});

export const {
    useGetClassesQuery,
    useGetClassByIdQuery,
    useCreateClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
} = classesApi;
