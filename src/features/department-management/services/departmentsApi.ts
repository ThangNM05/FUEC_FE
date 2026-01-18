import { baseApi } from '@/redux/baseApi';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/department.types';

export const departmentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all departments
        getDepartments: builder.query<Department[], void>({
            query: () => '/departments',
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
                result
                    ? [...result.map(({ id }) => ({ type: 'Departments' as const, id })), 'Departments']
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
