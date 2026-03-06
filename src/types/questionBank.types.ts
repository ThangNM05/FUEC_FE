import type { PaginatedResponse } from './class.types';

export interface QuestionBank {
    id: string;
    subjectCode: string;
    subjectName: string;
    majors: string[];
    subMajorNames: string[];
    subMajorIds?: (string | null)[];
    totalQuestions: number;
    assignedTeachers: number;
    lastUpdated: string;
    status: 'active' | 'draft';
}

export interface SubjectQuestionBankManager {
    id: string;
    teacherId: string;
    subjectId: string;
    teacherCode: string;
    subjectCode: string;
    subjectName: string;
}

export interface AssignTeacherToSubjectRequest {
    teacherId: string;
    subjectId: string;
}

export type QuestionBanksResponse = PaginatedResponse<QuestionBank>;
