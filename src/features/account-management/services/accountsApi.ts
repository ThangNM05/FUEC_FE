import { baseApi } from '@/redux/baseApi';
import type {
    Account,
    CreateAccountRequest,
    UpdateAccountRequest,
    PaginatedResponse,
} from '../types/account.types';

export const accountsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET: Fetch all accounts with pagination, sorting, and searching
        getAccounts: builder.query<PaginatedResponse<Account>, {
            page: number;
            pageSize: number;
            sortColumn?: string;
            sortDirection?: 'asc' | 'desc';
            searchTerm?: string;
        }>({
            query: ({ page, pageSize, sortColumn, sortDirection, searchTerm }) => {
                // Adjust for 0-based indexing (consistent with other features)
                const pageIndex = page - 1;
                let url = `/accounts?PageNumber=${pageIndex}&PageSize=${pageSize}`;
                if (sortColumn) {
                    const pascalCaseColumn = sortColumn.charAt(0).toUpperCase() + sortColumn.slice(1);
                    url += `&SortColumn=${pascalCaseColumn}&SortDirection=${sortDirection || 'asc'}`;
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

                if (Array.isArray(response)) {
                    return {
                        items: response,
                        totalItemCount: response.length,
                        totalPages: 1,
                        itemFrom: 1,
                        itemTo: response.length
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
            providesTags: (result) =>
                result && result.items
                    ? [...result.items.map(({ id }) => ({ type: 'Accounts' as const, id })), 'Accounts']
                    : ['Accounts'],
        }),

        // GET: Fetch account by ID
        getAccountById: builder.query<Account, string>({
            query: (id) => `/accounts/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Accounts', id }],
        }),

        // POST: Create new account
        createAccount: builder.mutation<Account, CreateAccountRequest>({
            query: (account) => ({
                url: '/accounts',
                method: 'POST',
                body: account,
            }),
            invalidatesTags: ['Accounts'],
            transformResponse: (response: any) => response.result || response,
        }),

        // PUT: Update existing account (e.g. Profile, Lock)
        updateAccount: builder.mutation<Account, UpdateAccountRequest>({
            query: ({ id, ...account }) => ({
                url: `/accounts/${id}`,
                method: 'PUT',
                body: account,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Accounts', id }, 'Accounts'],
        }),

        // DELETE: Remove account
        deleteAccount: builder.mutation<void, string>({
            query: (id) => ({
                url: `/accounts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Accounts', id }, 'Accounts'],
        }),
    }),
});

export const {
    useGetAccountsQuery,
    useGetAccountByIdQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,
} = accountsApi;
