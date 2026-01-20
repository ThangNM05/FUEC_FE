import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import AppConfig from '@/config/appConfig';

const baseQuery = fetchBaseQuery({
  baseUrl: AppConfig.api.baseURL,
  prepareHeaders: (headers, { getState }) => {
    // Content-Type is handled automatically by fetchBaseQuery (application/json for objects, multipart for FormData)

    // Add authentication token from Redux state
    const token = (getState() as any).auth?.token || localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },

});

// Custom base query with error handling and token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired or invalid
  if (result.error && result.error.status === 401) {
    console.warn('Authentication failed. Please login again.');
    // Clear token and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // You can dispatch a logout action here if needed
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Students', 'Teachers', 'Departments', 'Accounts', 'Rooms', 'Subjects'],
  endpoints: () => ({}),
});

