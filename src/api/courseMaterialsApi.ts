import { baseApi } from './baseApi';
import type {
    CourseMaterial,
    CourseMaterialPaginatedResponse,
    CreateCourseMaterialRequest,
} from '@/types/courseMaterial.types';

export const courseMaterialsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCourseMaterialsByClassSubjectId: builder.query<CourseMaterialPaginatedResponse, string>({
            query: (classSubjectId) =>
                `/CourseMaterials?ClassSubjectId=${classSubjectId}&PageSize=100`,
            transformResponse: (response: any) =>
                response?.result || {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0,
                },
            providesTags: ['CourseMaterials'],
        }),

        getCourseMaterialById: builder.query<CourseMaterial, string>({
            query: (id) => `/CourseMaterials/${id}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['CourseMaterials'],
        }),

        createCourseMaterial: builder.mutation<CourseMaterial, CreateCourseMaterialRequest>({
            query: (body) => ({
                url: '/CourseMaterials',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any) => response?.result || response,
            invalidatesTags: ['CourseMaterials'],
        }),

        deleteCourseMaterial: builder.mutation<void, string>({
            query: (id) => ({
                url: `/CourseMaterials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CourseMaterials'],
        }),
    }),
});

export const {
    useGetCourseMaterialsByClassSubjectIdQuery,
    useGetCourseMaterialByIdQuery,
    useCreateCourseMaterialMutation,
    useDeleteCourseMaterialMutation,
} = courseMaterialsApi;
