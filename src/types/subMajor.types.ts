export interface SubMajor {
    id: string; // GUID
    code: string;
    name: string;
    description?: string;
    majorId: string;
    majorName?: string;
    majorCode?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ImportSubMajorsResponse {
    successCount: number;
    failureCount: number;
    errors: string[];
}

export interface CreateSubMajorRequest {
    code: string;
    name: string;
    description?: string;
    majorId: string;
}

export interface UpdateSubMajorRequest {
    id: string;
    code: string;
    name: string;
    description?: string;
    majorId: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
