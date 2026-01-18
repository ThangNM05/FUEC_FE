export interface Department {
    id: string; // GUID
    code: string;
    name: string;
    description?: string;
    teacherCount?: number;
}

export interface CreateDepartmentRequest {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateDepartmentRequest {
    id: string;
    code: string;
    name: string;
    description?: string;
}

export interface GetDepartmentsResponse {
    items: Department[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
