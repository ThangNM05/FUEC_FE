import { baseApi } from '../api/baseApi';

export interface GoogleLoginRequest {
    idToken: string;
}

export interface GoogleLoginResponse {
    accessToken: string;
    user: {
        id: string;
        entityId?: string;
        email: string;
        fullName: string;
        picture?: string;
        avatarUrl?: string;
        role?: string;
    };
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        googleLogin: builder.mutation<GoogleLoginResponse, GoogleLoginRequest>({
            query: (credentials) => ({
                url: '/Auth/google-login',
                method: 'POST',
                headers: {
                    // Ensure no conflicting headers
                },
                body: credentials,
            }),
        }),
        getCurrentUser: builder.query<any, void>({
            query: () => '/Auth/me',
        }),
    }),
    overrideExisting: false,
});

export const { useGoogleLoginMutation, useGetCurrentUserQuery } = authApi;
