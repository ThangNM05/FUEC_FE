export interface Subject {
    id: string;
    code: string;
    name: string;
    credits: number;
    timeAllocation: string;
    description: string;
    minAvgMarkToPass: number;
    isActive: boolean;
    createdAt?: string;
}

export interface Class {
    id: string;
    classCode: string;
    subjects: Subject[];  // Array of subjects
    semesterId?: string;
    semesterName?: string;
    teacherId?: string | null;
    teacherName?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateClassRequest {
    classCode: string;
    subjectIds: string[];  // Array of subject IDs
    semesterId?: string;
}

export interface UpdateClassRequest {
    id: string;
    classCode?: string;
    subjectIds?: string[];  // Array of subject IDs
    semesterId?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

export interface ClassSubjectTeacher {
    id: string;
    classSubjectId: string;
    teacherId: string;
    isPrimary: boolean;
    classId?: string;
    subjectId?: string;
    classCode?: string;
    subjectCode?: string;
    subjectName?: string;
    teacherCode?: string;
    teacherName?: string;
    isActive: boolean;
}

export interface StudentClass {
    id: string;
    studentId: string;
    classId: string;
    studentCode?: string;
    studentName?: string;
    classCode?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateClassSubjectTeacherRequest {
    classId: string;
    subjectId: string;
    teacherId: string;
    isPrimary?: boolean;
}

export interface Teacher {
    id: string;
    userId: string;
    teacherCode: string; // from User.Code or Teacher specific?
    fullName?: string; // from User
    // ... other props
}

