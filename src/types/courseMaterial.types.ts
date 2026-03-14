export interface CourseMaterial {
    id: string;
    classSubjectId: string;
    fileId: string;
    classCode?: string;
    fileName?: string;
    fileUrl?: string;
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
    isActive: boolean;
}

export interface CreateCourseMaterialRequest {
    classSubjectId: string;
    fileId: string;
}

export interface CourseMaterialPaginatedResponse {
    items: CourseMaterial[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
