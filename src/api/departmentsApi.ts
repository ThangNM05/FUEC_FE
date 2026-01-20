import { baseApi } from '@/api/baseApi';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest, PaginatedResponse } from '../types/department.types';

export const departmentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all departments
        // GET: Fetch all departments with pagination, sorting, and searching
        getDepartments: builder.query<PaginatedResponse<Department>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {


                // Backend seems to use 0-based indexing for Departments
                const pageIndex = page - 1;
                let url = `/departments?PageNumber=${pageIndex}&PageSize=${pageSize}`;

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
                    ? [...result.items.map(({ id }) => ({ type: 'Departments' as const, id })), 'Departments']
                    : ['Departments'],
        }),

        // GET: Fetch department by ID
        getDepartmentById: builder.query<Department, string>({
            query: (id) => `/departments/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Departments', id }],
        }),

        // POST: Create new department
        createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
            query: (department) => ({
                url: '/departments',
                method: 'POST',
                body: department,
            }),
            invalidatesTags: ['Departments'],
        }),

        // PUT: Update existing department
        updateDepartment: builder.mutation<Department, UpdateDepartmentRequest>({
            query: ({ id, ...department }) => ({
                url: `/departments/${id}`,
                method: 'PUT',
                body: department,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Departments', id }, 'Departments'],
        }),

        // DELETE: Remove department
        deleteDepartment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/departments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Departments', id }, 'Departments'],
        }),
    }),
});

export const {
    useGetDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} = departmentsApi;
