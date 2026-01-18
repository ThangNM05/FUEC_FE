import { configureStore } from '@reduxjs/toolkit';

import bookingReducer from '../features/booking/slice';
import { baseApi } from './baseApi';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    // Add the base API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // Add the RTK Query middleware
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {booking: BookingState, api: ApiState}
export type AppDispatch = typeof store.dispatch;

