export interface ExamFormat {
    id: string;
    code: string;
    typeName: string | null;
    durations: number;
    weight: number;
    description: string;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    deletedAt: string | null;
    deletedBy: string | null;
    isActive: boolean;
}

export interface CreateExamFormatRequest {
    code: string;
    typeName: string | null;
    durations: number;
    weight: number;
    description: string;
}

export interface UpdateExamFormatRequest extends CreateExamFormatRequest {
    id: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
