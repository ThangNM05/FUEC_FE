export interface Room {
    id: string;
    roomName: string;
    building: number;
    type: number;
    status: number;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string;
    updatedBy: string | null;
    deletedAt: string | null;
    deletedBy: string | null;
    isActive: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}

// Const object for Room Status
export const RoomStatus = {
    Available: 0,
    InUse: 1,
    Maintenance: 2,
    Closed: 3
} as const;

export type RoomStatusType = typeof RoomStatus[keyof typeof RoomStatus];

// Const object for Room Type
export const RoomType = {
    Classroom: 0,
    LectureHall: 1,
    ComputerLab: 2,
    Laboratory: 3,
    MeetingRoom: 4
} as const;

export type RoomTypeType = typeof RoomType[keyof typeof RoomType];

// Const object for Building
export const Building = {
    Alpha: 0,
    Beta: 1,
    Gamma: 2
} as const;

export type BuildingType = typeof Building[keyof typeof Building];

export interface CreateRoomRequest {
    roomName: string;
    building: number;
    type: number;
    status: number;
}

export interface UpdateRoomRequest extends CreateRoomRequest {
    id: string;
}

export interface ImportRoomsResponse {
    successCount: number;
    failureCount: number;
    errors?: string[];
}
