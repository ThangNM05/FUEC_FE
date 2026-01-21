
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
