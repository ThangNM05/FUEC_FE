import { configureStore } from '@reduxjs/toolkit';

import { pokemonApi } from '../features/booking/service';
import bookingReducer from '../features/booking/slice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
