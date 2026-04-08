import { baseApi } from './baseApi';
import type { FileEntityDto } from '@/types/assignment.types';

export const filesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadFile: builder.mutation<FileEntityDto, { file: File; folder?: string }>({
            query: ({ file, folder }) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: folder ? `/Files/upload?folder=${encodeURIComponent(folder)}` : '/Files/upload',
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => response?.result || response,
        }),

        getFileById: builder.query<FileEntityDto, string>({
            query: (id) => `/Files/${id}`,
            transformResponse: (response: any) => response?.result || response,
        }),
    }),
});

export const {
    useUploadFileMutation,
    useGetFileByIdQuery,
} = filesApi;
