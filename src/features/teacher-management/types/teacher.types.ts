export interface Teacher {
    id: string;
    userId: string;
    teacherCode: string;
    teacherName: string;
    cardId?: string;
    departmentId: string;

    // Navigation/Flattened properties (from API projection)
    accountEmail?: string;
    accountFullName?: string;
    departmentName?: string;
    departmentCode?: string;

    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTeacherRequest {
    userId?: string; // Link to Account
    teacherCode: string;
    teacherName: string;
    email: string;
    departmentId: string;
    phoneNumber?: string;
    cardId?: string;
}

export interface UpdateTeacherRequest {
    id: string;
    teacherName: string;
    cardId?: string;
    departmentId: string;
    isActive?: boolean;
}

export interface ImportTeachersResponse {
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


