import { baseApi } from '@/api/baseApi';
import type { 
    ClassSubjectTeacher, 
    StudentClass, 
    PaginatedResponse,
    CreateClassSubjectTeacherRequest 
} from '../types/class.types';

export interface ClassSubject {
    id: string;
    classId: string;
    subjectId: string;
    classCode?: string;
    subjectCode?: string;
    subjectName?: string;
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
        }),

        // Class Subject Teachers
        getClassSubjectTeachers: builder.query<PaginatedResponse<ClassSubjectTeacher>, { classSubjectId?: string }>({
            query: ({ classSubjectId }) => `/ClassSubjectTeachers?ClassSubjectId=${classSubjectId}`,
            transformResponse: (response: any) => response?.result || response,
            providesTags: ['ClassSubjectTeachers'],
        }),
        addClassSubjectTeacher: builder.mutation<void, { classSubjectId: string; teacherId: string; isPrimary?: boolean }>({
            query: (body) => ({
                url: '/ClassSubjectTeachers',
                method: 'POST',
                body
            }),
            invalidatesTags: ['ClassSubjectTeachers']
        }),
        deleteClassSubjectTeacher: builder.mutation<void, string>({
            query: (id) => ({
                url: `/ClassSubjectTeachers/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['ClassSubjectTeachers']
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
    useGetClassSubjectTeachersQuery,
    useAddClassSubjectTeacherMutation,
    useDeleteClassSubjectTeacherMutation,
    useGetStudentClassesQuery,
    useAddStudentClassMutation,
    useRemoveStudentClassMutation,
    useGetIneligibleStudentIdsQuery
} = classDetailsApi;
