export interface Class {
    id: string;
    classCode: string;
    subjectId?: string;
    subjectName?: string;
    subjectCode?: string;
    semesterId?: string;
    semesterName?: string;
    teacherId: string;
    teacherName?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateClassRequest {
    classCode: string;
    subjectId?: string;
    semesterId?: string;
    teacherId: string;
}

export interface UpdateClassRequest {
    id: string;
    classCode?: string;
    subjectId?: string;
    semesterId?: string;
    teacherId?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
