// Student entity types matching backend
export interface Student {
    id: string;
    userId: string;
    studentCode: string;
    studentName: string; // legacy, keeping for compatibility if needed elsewhere
    accountFullName: string; // New field from backend
    accountEmail: string;
    cardId?: string;
    isActive: boolean;
    phoneNumber?: string;
    classId?: string;
    className?: string;
    createdAt?: string;
    updatedAt?: string;
    studentId?: string;
    fullName?: string;
    email?: string;
}

export interface CreateStudentRequest {
    userId: string;
    cardId?: string;
    cohort?: string;
    subMajorId?: string;
    curriculumId?: string;
}

export interface UpdateStudentRequest {
    id: string;
    fullName: string;
    cardId?: string;
    studentCode?: string;
    email?: string;
    isActive?: boolean | number;
    phoneNumber?: string;
    classId?: string;
}

export interface ImportStudentsResponse {
    successCount: number;
    failureCount: number;
    errors?: string[];
}

export interface AutoAssignClassRequest {
    subMajorId?: string;
    cohort?: string;
    maxStudentsPerClass?: number;
}

export interface ClassAssignmentSummary {
    classCode: string;
    subMajorCode: string;
    cohort: string;
    studentCount: number;
    isNewClass: boolean;
}

export interface AutoAssignClassResult {
    success: boolean;
    message: string;
    totalClassesCreated: number;
    totalStudentsAssigned: number;
    classSummaries: ClassAssignmentSummary[];
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

export interface StudentSubject {
    classSubjectId: string;
    classId: string;
    classCode: string;
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    examCount: number;
}
