
export interface Semester {
    id: string;
    semesterCode: string;
    startDate: string;
    endDate: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt?: string;
    createdBy?: string | null;
    updatedAt?: string | null;
    updatedBy?: string | null;
    deletedAt?: string | null;
    deletedBy?: string | null;
}

export interface CreateSemesterRequest {
    semesterCode: string;
    startDate: string; // ISO Date string
    endDate: string;   // ISO Date string
    isDefault: boolean;
}

export interface UpdateSemesterRequest {
    id: string;
    semesterCode: string;
    startDate: string;
    endDate: string;
    isDefault: boolean;
    isActive?: boolean;
}

export interface GetSemestersParams {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

export interface SubjectReportItem {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    studentCount: number;
    classCount: number;
}

export interface SemesterReport {
    semesterId: string;
    semesterCode: string;
    startDate: string;
    endDate: string;
    totalSubjects: number;
    totalClasses: number;
    totalStudents: number;
    totalTeachers: number;
    totalMaterialsUploaded: number;
    totalAssignmentsCreated: number;
    totalExamsCreated: number;
    averageGpa: number;
    passingRate: number;
    topSubjectsByStudentCount: SubjectReportItem[];
}
