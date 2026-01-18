// Student entity types matching backend
export interface Student {
    id: string;
    studentCode: string;
    studentName: string;
    accountEmail: string;
    cardId?: string;
    isActive: boolean;
    phoneNumber?: string;
    classId?: string;
    className?: string;
    createdAt?: string;
    updatedAt?: string;
    // Legacy fields (optional compatibility if needed, otherwise remove)
    studentId?: string;
    fullName?: string;
    email?: string;
}

export interface CreateStudentRequest {
    userId: string;
    studentCode: string;
    studentName: string;
    email: string;
    phoneNumber?: string;
    classId?: string;
    cardId?: string;
}

export interface UpdateStudentRequest {
    id: string;
    studentName: string;
    cardId?: string;
    // Optional fields if the API supports them, based on "Student" entity
    studentCode?: string;
    accountEmail?: string;
    isActive?: boolean | number;
    phoneNumber?: string;
    classId?: string;
}

export interface ImportStudentsResponse {
    successCount: number;
    failureCount: number;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
