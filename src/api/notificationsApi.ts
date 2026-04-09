import { baseApi } from './baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Notifications/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useDeleteNotificationMutation } = notificationsApi;
