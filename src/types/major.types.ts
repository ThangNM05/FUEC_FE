export interface Major {
    id: string; // GUID
    code: string;
    name: string;
    description?: string;
}

export interface CreateMajorRequest {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateMajorRequest {
    id: string;
    code: string;
    name: string;
    description?: string;
}

export interface GetMajorsResponse {
    items: Major[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
export interface ImportMajorsResponse {
    successCount: number;
    failureCount: number;
    errors: string[];
}
