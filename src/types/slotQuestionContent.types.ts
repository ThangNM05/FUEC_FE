export interface SlotQuestionContentDto {
    id: string;
    slotId: string;
    content: string;
    description?: string;
    displayOrder: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateSlotQuestionContentRequest {
    slotId: string;
    content: string;
    description?: string;
}

export interface UpdateSlotQuestionContentRequest {
    content: string;
    description?: string;
    displayOrder?: number;
}

export interface GenerateAISlotQuestionsRequest {
    topics: string;
    count: number;
}

export interface AIQuestionResult {
    content: string;
    description: string;
}

