import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://pokeapi.co/api/v2/',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');

    return headers;
  },
});

export const baseApi = createApi({
  baseQuery: baseQuery,
  endpoints: () => ({}),
  tagTypes: ['Pokemon'],
});
