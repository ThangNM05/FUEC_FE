import { baseApi } from './baseApi';
import type { PaginatedResponse } from '@/types/account.types';
import type {
    Syllabus,
    GetSyllabusesParams,
    CreateSyllabusRequest,
    UpdateSyllabusRequest,
    ImportSyllabusesResponse
} from '@/types/syllabus.types';

export const syllabusApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSyllabuses: builder.query<PaginatedResponse<Syllabus>, GetSyllabusesParams>({
            query: ({ page = 1, pageSize = 10, sortColumn, sortDirection, searchTerm }) => {
                // Backend uses 1-based indexing
                // FIX: Only send PageNumber if it's > 1. Sending PageNumber=1 with large PageSize causes empty results on backend.
                let url = `/Syllabuses?PageSize=${pageSize}`;
                if (page > 1) {
                    url += `&PageNumber=${page}`;
                }

                if (sortColumn) {
                    const sortOrder = sortDirection === 'desc' ? 2 : 1;

                    // Map frontend column names to backend property names
                    // Re-trying PascalCase as it's the standard for C#
                    const sortMapping: { [key: string]: string } = {
                        subjectCode: 'SubjectCode',
                        syllabusName: 'SyllabusName',
                        syllabusEnglish: 'SyllabusEnglish',
                        scoringScale: 'ScoringScale',
                        isApproved: 'IsApproved',
                        isActive: 'IsActive'
                    };

                    const mappedColumn = sortMapping[sortColumn] || sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1);

                    url += `&SortBy=${mappedColumn}&SortOrder=${sortOrder}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }
                // console.log('🔍 Syllabus API Request:', url);
                return url;
            },
            providesTags: ['Syllabuses'],
            transformResponse: (response: any) => {
                // If response is wrapped in 'result' (common pattern in this backend)
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return {
                        items: response.result.items,
                        totalItemCount: response.result.totalItemCount || 0,
                        totalPages: response.result.totalPages || 0,
                        itemFrom: response.result.itemFrom || 0,
                        itemTo: response.result.itemTo || 0
                    };
                }

                // If response is directly the PaginatedResponse (less likely but possible)
                if (response?.items && Array.isArray(response.items)) {
                    return response;
                }

                return { items: [], totalItemCount: 0, totalPages: 0, itemFrom: 0, itemTo: 0 };
            },
        }),

        getSyllabusById: builder.query<Syllabus, string>({
            query: (id) => `/Syllabuses/${id}`,
            providesTags: (result, error, id) => [{ type: 'Syllabuses', id }],
        }),

        createSyllabus: builder.mutation<Syllabus, CreateSyllabusRequest>({
            query: (body) => ({
                url: '/Syllabuses',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Syllabuses'],
        }),

        updateSyllabus: builder.mutation<Syllabus, UpdateSyllabusRequest>({
            query: ({ id, ...body }) => ({
                url: `/Syllabuses/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Syllabuses'],
        }),

        deleteSyllabus: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Syllabuses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Syllabuses'],
        }),

        importSyllabuses: builder.mutation<ImportSyllabusesResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/Syllabuses/import',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                // Handle String Response (Backend returning text message)
                if (typeof data === 'string') {
                    // Example: "Successfully imported 5 syllabuses. 2 errors skipped."
                    // Regex updated to be more flexible with entity name
                    const successMatch = data.match(/Successfully imported (\d+)/i);
                    const errorMatch = data.match(/(\d+) errors skipped/i);

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    const errors: string[] = [];
                    if (data.includes("No valid syllabuses found")) {
                        errors.push("No data imported. Please check if the file is empty or formatted correctly.");
                    }

                    if (failureCount > 0 && errors.length === 0) {
                        errors.push(`Run into ${failureCount} errors during import. Please check your file format and try again.`);
                    }

                    return {
                        successCount,
                        failureCount,
                        errors
                    };
                }

                return data;
            },
            invalidatesTags: ['Syllabuses'],
        }),
    }),
});

export const {
    useGetSyllabusesQuery,
    useGetSyllabusByIdQuery,
    useCreateSyllabusMutation,
    useUpdateSyllabusMutation,
    useDeleteSyllabusMutation,
    useImportSyllabusesMutation,
} = syllabusApi;
