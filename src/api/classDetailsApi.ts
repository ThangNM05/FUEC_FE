import { baseApi } from '@/api/baseApi';
import type {
    StudentClass,
    PaginatedResponse,
} from '../types/class.types';

export interface ClassSubject {
    id: string;
    classId: string;
    subjectId: string;
    teacherId?: string | null;
    classCode?: string;
    subjectCode?: string;
    subjectName?: string;
    subjectCredits?: number;
    subjectDescription?: string;
    teacherCode?: string | null;
    teacherName?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const classDetailsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Class Subjects
        getClassSubjects: builder.query<PaginatedResponse<ClassSubject>, { classId?: string; subjectId?: string }>({
            query: (params) => {
                let url = '/ClassSubjects?';
                if (params.classId) url += `ClassId=${params.classId}&`;
                if (params.subjectId) url += `SubjectId=${params.subjectId}&`;
                return url;
            },
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['ClassSubjectTeachers'],
        }),
        getClassSubjectById: builder.query<any, string>({
            query: (id) => `/ClassSubjects/${id}`,
            transformResponse: (response: any) => response?.result || response,
        }),
        getClassSubjectSlots: builder.query<any, string>({
            query: (id) => `/Slots/class-subject/${id}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['Slots' as any],
        }),

        // Update ClassSubject (assign/change teacher)
        updateClassSubject: builder.mutation<any, { id: string; subjectId: string; teacherId: string }>({
            query: ({ id, ...body }) => ({
                url: `/ClassSubjects/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['ClassSubjectTeachers'],
        }),

        // Student Classes
        getStudentClasses: builder.query<PaginatedResponse<StudentClass>, { classId: string; pageSize?: number }>({
            query: ({ classId, pageSize = 100 }) => `/StudentClasses?ClassId=${classId}&PageSize=${pageSize}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['StudentClasses']
        }),
        // Add student to class
        addStudentClass: builder.mutation<void, { classId: string; studentId: string }>({
            query: (body) => ({
                url: '/StudentClasses/add',
                method: 'POST',
                body
            }),
            invalidatesTags: ['StudentClasses']
        }),
        // Remove student from class
        removeStudentClass: builder.mutation<void, { classId: string; studentId: string }>({
            query: (body) => ({
                url: '/StudentClasses/remove',
                method: 'POST',
                body
            }),
            invalidatesTags: ['StudentClasses']
        }),
        // Get ineligible student IDs for a class (already enrolled or subject conflict)
        getIneligibleStudentIds: builder.query<string[], string>({
            query: (classId) => `/StudentClasses/ineligible/${classId}`,
            transformResponse: (response: any) => response?.result || [],
            providesTags: ['StudentClasses']
        }),
    }),
});

export const {
    useGetClassSubjectsQuery,
    useGetClassSubjectByIdQuery,
    useGetClassSubjectSlotsQuery,
    useUpdateClassSubjectMutation,
    useGetStudentClassesQuery,
    useAddStudentClassMutation,
    useRemoveStudentClassMutation,
    useGetIneligibleStudentIdsQuery
} = classDetailsApi;
