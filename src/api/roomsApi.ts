import { baseApi } from '@/api/baseApi';
import type {
    CreateRoomRequest,
    ImportRoomsResponse,
    PaginatedResponse,
    Room,
    UpdateRoomRequest
} from '../types/room.types';

export const roomsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRooms: builder.query<PaginatedResponse<Room>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Backend uses 1-based indexing
                let url = `/Rooms?PageNumber=${page}&PageSize=${pageSize}`;
                if (sortColumn) {
                    const sortOrder = sortDirection === 'desc' ? 2 : 1;
                    url += `&SortBy=${sortColumn}&SortOrder=${sortOrder}`;
                }
                if (searchTerm) {
                    url += `&SearchPhase=${encodeURIComponent(searchTerm)}`;
                }
                return url;
            },
            transformResponse: (response: any) => {
                if (response?.result?.items && Array.isArray(response.result.items)) {
                    return {
                        items: response.result.items,
                        totalItemCount: response.result.totalItemCount || 0,
                        totalPages: response.result.totalPages || 0,
                        itemFrom: response.result.itemFrom || 0,
                        itemTo: response.result.itemTo || 0
                    };
                }
                return {
                    items: [],
                    totalItemCount: 0,
                    totalPages: 0,
                    itemFrom: 0,
                    itemTo: 0
                };
            },
            providesTags: ['Rooms'],
        }),
        createRoom: builder.mutation<Room, CreateRoomRequest>({
            query: (room) => ({
                url: '/Rooms',
                method: 'POST',
                body: room,
            }),
            invalidatesTags: ['Rooms'],
        }),
        // PUT: Update existing room
        updateRoom: builder.mutation<Room, UpdateRoomRequest>({
            query: ({ id, ...room }) => ({
                url: `/rooms/${id}`,
                method: 'PUT',
                body: room,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Rooms', id }, 'Rooms'],
        }),

        // DELETE: Remove room
        deleteRoom: builder.mutation<void, string>({
            query: (id) => ({
                url: `/rooms/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Rooms', id }, 'Rooms'],
        }),

        // POST: Import rooms from Excel file
        importRooms: builder.mutation<ImportRoomsResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/Rooms/import', // Assuming standard convention
                    method: 'POST',
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                let data = response;
                if (response?.result) data = response.result;
                else if (response?.data) data = response.data;

                if (typeof data === 'string') {
                    // Extract numbers using lenient regex
                    const successMatch = data.match(/Successfully imported (\d+)/i);
                    const errorMatch = data.match(/(\d+) errors/i); // Matches "errors" or "errors skipped"

                    const successCount = successMatch ? parseInt(successMatch[1]) : 0;
                    const failureCount = errorMatch ? parseInt(errorMatch[1]) : 0;

                    const errors: string[] = [];
                    if (data.includes("No valid")) {
                        errors.push("No data imported. Please check if the file is empty or formatted correctly.");
                    }

                    // If we have failure count but no specific error list in string, add a generic message
                    // so the user knows to check the file, instead of showing "Error Details (0)"
                    if (failureCount > 0 && errors.length === 0) {
                        errors.push(`Run into ${failureCount} errors during import. Please check your file format (Enums, types) and try again.`);
                    }

                    return {
                        successCount,
                        failureCount,
                        errors
                    };
                }
                return data;
            },
            invalidatesTags: ['Rooms'],
        }),
    }),
});

export const {
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useImportRoomsMutation
} = roomsApi;
