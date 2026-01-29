export interface Teacher {
    id: string;
    userId: string;
    teacherCode: string;
    teacherName: string; // legacy
    subMajorId: string;
    subMajorName?: string;
    subMajorCode?: string;

    // Navigation/Flattened properties
    accountEmail?: string;
    accountFullName: string;
    cardId?: string;

    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTeacherRequest {
    userId?: string; // Link to Account
    teacherCode: string;
    teacherName: string;
    email: string;
    subMajorId: string;
    phoneNumber?: string;
}

export interface UpdateTeacherRequest {
    id: string;
    fullName: string;
    email?: string;
    subMajorId: string;
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


