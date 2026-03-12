export type AssignmentStatus = 0 | 1 | 2 | 3 | 4;

export const AssignmentStatusLabel: Record<AssignmentStatus, string> = {
    0: 'Pending',
    1: 'Submitted',
    2: 'Graded',
    3: 'Late',
    4: 'Returned',
};

export const AssignmentStatusColor: Record<AssignmentStatus, string> = {
    0: 'bg-gray-100 text-gray-600',
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-green-100 text-green-700',
    3: 'bg-red-100 text-red-700',
    4: 'bg-purple-100 text-purple-700',
};

export interface Assignment {
    id: string;
    attachedFileId: string;
    classSubjectId: string;
    slotId?: string;
    instanceNumber: number;
    displayName?: string;
    description: string;
    dueDate?: string;
    // Navigation
    fileName?: string;
    fileUrl?: string;
    classCode?: string;
    subjectCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentAssignment {
    id: string;
    studentId: string;
    assignmentId: string;
    submissionFileId: string;
    grade?: number;
    status: AssignmentStatus;
    // Navigation
    studentCode?: string;
    studentName?: string;
    assignmentDescription?: string;
    submissionFileName?: string;
    submissionFileUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FileEntityDto {
    id: string;
    fileName: string;
    fileUrl: string;
    extension: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssignmentRequest {
    classSubjectIds: string[];
    slotId?: string;
    attachedFileId: string;
    instanceNumber: number;
    description: string;
    dueDate?: string;
}

export interface UpdateAssignmentRequest {
    attachedFileId?: string;
    description?: string;
}

export interface CreateStudentAssignmentRequest {
    studentId: string;
    assignmentId: string;
    submissionFileId: string;
    status?: AssignmentStatus;
}

export interface UpdateStudentAssignmentRequest {
    submissionFileId?: string;
    grade?: number;
    status?: AssignmentStatus;
}

export interface AssignmentPaginatedResponse {
    items: Assignment[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

export interface StudentAssignmentPaginatedResponse {
    items: StudentAssignment[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
