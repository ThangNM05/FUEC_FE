// Curriculum types matching backend CurriculumDto

export interface Curriculum {
    id: string;
    isActive: boolean;
    createdAt?: string;
    deletedAt?: string;

    code: string;
    name: string;
    startYear: number;
    cohort?: string;
    totalTerms: number;
    description?: string;

    subMajorId?: string;
    subMajorCode?: string;
    subMajorName?: string;

    subjectCount: number;
}

export interface CreateCurriculumRequest {
    subMajorId: string;
    code: string;
    name: string;
    startYear: number;
    cohort?: string;
    totalTerms?: number;
    description?: string;
}

export interface CurriculumSubject {
    id: string;
    curriculumId: string;
    subjectId: string;
    term: number;
    curriculumCode?: string;
    curriculumName?: string;
    subjectCode?: string;
    subjectName?: string;
    subjectCredits?: number;
    isActive: boolean;
    createdAt?: string;
    deletedAt?: string;
}

export interface UpdateCurriculumRequest {
    id: string;
    name?: string;
    cohort?: string;
    totalTerms?: number;
    description?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
