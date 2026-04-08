import { baseApi } from './baseApi';
import type {
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  GetAllQuestionsRequest,
  PagedResult,
  ApiResponse,
} from '../types/question.types';

export interface ImportPreviewOption {
  choiceContent: string;
  isCorrect: boolean;
}

export interface ImportPreviewQuestion {
  questionContent: string;
  tag?: string | null;
  chapter?: number | null;
  questionType?: 'Single' | 'Multiple';
  options: ImportPreviewOption[];
  isDuplicate: boolean;
}

export interface ImportPreviewResult {
  subjectCode: string;
  questions: ImportPreviewQuestion[];
  duplicateCount: number;
  errors: string[];
}

export interface ImportQuestionBankResult {
  totalRows: number;
  questionsCreated: number;
  optionsCreated: number;
  warnings: string[];
  errors: string[];
}

export const questionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query<PagedResult<QuestionDto>, GetAllQuestionsRequest>({
      query: (params) => ({
        url: '/Questions',
        params,
      }),
      transformResponse: (response: ApiResponse<PagedResult<QuestionDto>>) => response.result,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.items.map(({ id }: { id: string }) => ({ type: 'Question' as const, id })),
              { type: 'Question', id: `LIST-${arg.subjectId || arg.subjectCode || 'ALL'}` },
            ]
          : [{ type: 'Question', id: `LIST-${arg.subjectId || arg.subjectCode || 'ALL'}` }],
    }),

    getQuestionById: builder.query<QuestionDto, string>({
      query: (id) => `/Questions/${id}`,
      transformResponse: (response: ApiResponse<QuestionDto>) => response.result,
      providesTags: (result, error, id) => [{ type: 'Question', id }],
    }),

    createQuestion: builder.mutation<QuestionDto, CreateQuestionDto>({
      query: (body) => ({
        url: '/Questions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Question', id: `LIST-${'ALL'}` }],
    }),

    updateQuestion: builder.mutation<QuestionDto, { id: string; body: UpdateQuestionDto }>({
      query: ({ id, body }) => ({
        url: `/Questions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Question', id },
        { type: 'Question', id: `LIST-${'ALL'}` },
      ],
    }),

    deleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Question', id },
        { type: 'Question', id: `LIST-${'ALL'}` },
      ],
    }),

    deleteQuestions: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: `/Questions/bulk`,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: [{ type: 'Question', id: `LIST-${'ALL'}` }],
    }),

    // Step 1a: Upload Excel file → get preview (no DB save)
    previewImportQuestions: builder.mutation<ImportPreviewResult, FormData>({
      query: (formData) => ({
        url: '/Questions/preview-import',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => response.result,
    }),

    // Step 1b: Upload GIFT file (.gift / .txt) → get preview (no DB save)
    previewImportGift: builder.mutation<ImportPreviewResult, FormData>({
      query: (formData) => ({
        url: '/Questions/preview-import-gift',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => response.result,
    }),

    // Step 2: Confirm save selected questions (JSON body)
    importQuestions: builder.mutation<
      ImportQuestionBankResult,
      { subjectCode: string; selectedQuestions: ImportPreviewQuestion[] }
    >({
      query: (body) => ({
        url: '/Questions/import',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.result,
      invalidatesTags: [{ type: 'Question', id: `LIST-${'ALL'}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useDeleteQuestionsMutation,
  usePreviewImportQuestionsMutation,
  usePreviewImportGiftMutation,
  useImportQuestionsMutation,
} = questionsApi;
