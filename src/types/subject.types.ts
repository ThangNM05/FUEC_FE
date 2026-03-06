export interface Subject {
    id: string;
    code: string;
    name: string;
    credits: number;
    terms: number;
    timeAllocation: string; 
    description: string;
    minAvgMarkToPass: number;
    isActive: boolean;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    deletedAt?: string;
    deletedBy?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

export interface CreateSubjectRequest {
    code: string;
    name: string;
    credits: number;
    terms: number;
    timeAllocation?: string;
    description?: string;
    minAvgMarkToPass: number;
    isActive: boolean;
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {
    id: string;
}

export interface ImportSubjectsResponse {
    successCount: number;
    failureCount: number;
    errors?: string[];
}
