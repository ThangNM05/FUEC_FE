
export interface Syllabus {
    id: string;
    subjectId: string;
    syllabusName: string;
    syllabusEnglish: string;
    studentTasks: string;
    tools: string;
    scoringScale: number;
    isApproved: boolean;
    approvedDate?: string | null;

    // Extended properties from API
    subjectCode?: string;
    subjectName?: string;

    // Common Entity props
    createdAt?: string;
    createdBy?: string | null;
    updatedAt?: string | null;
    updatedBy?: string | null;
    isActive: boolean;
}

export interface SyllabusAssessment {
    id: string;
    syllabusId: string;
    category: string;
    type: number;
    part: number;
    weight: string;
    completionCriteria: string;
    duration: string;
    questionType: string;
    numberOfQuestion: string;
    knowledgeAndSkill: string;
    gradingGuide: string;
    note: string;
    totalInstances: number;
    shortCode: string;
    weightPerInstance: number;
    syllabusName: string;
}

export interface CreateSyllabusRequest {
    subjectId: string;
    syllabusName: string;
    syllabusEnglish: string;
    studentTasks: string;
    tools: string;
    scoringScale: number;
    isApproved: boolean;
}

export interface UpdateSyllabusRequest extends CreateSyllabusRequest {
    id: string;
    isActive?: boolean;
}

export interface GetSyllabusesParams {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    subjectId?: string; // Optional filter by subject
}

export type ImportSyllabusesResponse = {
    successCount: number;
    failureCount: number;
    errors: string[];
};
