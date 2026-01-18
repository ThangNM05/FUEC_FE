export const Role = {
    Student: 2,
    Teacher: 1,
    Administrator: 0
} as const;
export type Role = typeof Role[keyof typeof Role];

export const Gender = {
    Male: 0,
    Female: 1,
    Other: 2
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export interface Account {
    id: string;
    userName: string;
    normalizedUserName: string;
    email: string;
    phoneNumber?: string;
    fullName: string;
    gender?: Gender;
    role: Role;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    // Identity fields (optional based on need)
    emailConfirmed?: boolean;
    phoneNumberConfirmed?: boolean;
    twoFactorEnabled?: boolean;
    lockoutEnabled?: boolean;
    lockoutEnd?: string;
    accessFailedCount?: number;
}

export interface CreateAccountRequest {
    userName: string;
    email: string;
    fullName: string;
    phoneNumber?: string | null;
    gender?: Gender | null;
    role: Role;
    password?: string;
    confirmPassword?: string;
    // Extended fields for specific creation flows
    emailConfirmed?: boolean;
    phoneNumberConfirmed?: boolean;
    twoFactorEnabled?: boolean;
    lockoutEnabled?: boolean;
    lockoutEnd?: string | null;
}

export interface UpdateAccountRequest {
    id: string;
    fullName?: string;
    phoneNumber?: string;
    gender?: Gender;
    role?: Role;
    isActive?: boolean; // For lock/unlock or soft delete
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItemCount: number;
    totalPages: number;
    itemFrom: number;
    itemTo: number;
}
