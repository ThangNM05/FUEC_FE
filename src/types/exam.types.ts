export interface ChapterQuestionCount {
    chapter: number;
    count: number;
}

export interface CreateExamRequest {
    classSubjectId: string;
    slotId?: string;
    questionCount: number;
    chapterQuestionCounts: ChapterQuestionCount[];
    tag: string;
    displayName: string;
    syllabusAssessmentId: string;
    examFormatId: string;
    startTime: string; // ISO 8601 string
    endTime: string; // ISO 8601 string
    isPublicGrade: boolean;
    instanceNumber: number;
    securityMode: number;
    requireIpCheck: boolean;
    allowedIpRanges: string;
    codeDuration: number;
    proctoringExemptStudentClassIds?: string[];
    enableAiProctoring?: boolean;
}

export interface UpdateExamRequest {
    id: string;
    startTime?: string;
    endTime?: string;
    isPublicGrade?: boolean;
    requireIpCheck?: boolean;
    allowedIpRanges?: string;
    codeDuration?: number;
    securityMode?: number;
    displayName?: string;
}

export interface Exam {
    syllabusAssessmentId: string;
    classSubjectId: string;
    slotId?: string;
    examFormatId: string;
    startTime: string;
    endTime: string;
    isPublicGrade: boolean;
    instanceNumber: number;
    displayName: string;
    securityMode: number;
    accessCode: string | null;
    requireIpCheck: boolean;
    allowedIpRanges: string;
    codeDuration: number;
    proctoringExemptStudentClassIds?: string[];
    enableAiProctoring?: boolean;
    category: string;
    tag: string;
    subjectCode: string;
    subjectName: string;
    syllabusName: string;
    weight: string;
    id: string;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    deletedAt: string | null;
    deletedBy: string | null;
    isActive: boolean;
    isSubmitted: boolean;
    grade: number | null;
    studentExamId: string | null;
    submittedAt: string | null;
    participationCount: number;
}

export interface PaginatedExamsResponse {
    items: Exam[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

export interface ExamQuestion {
    examId: string;
    questionId: string;
    points: number;
    questionContent: string;
    id: string;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    deletedAt: string | null;
    deletedBy: string | null;
    isActive: boolean;
}

export interface PaginatedExamQuestionsResponse {
    items: ExamQuestion[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
