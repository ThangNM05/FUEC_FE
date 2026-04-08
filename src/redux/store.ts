import { configureStore, combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import { baseApi } from '../api/baseApi';

const combinedReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

// Root reducer: whenever 'auth/logout' is dispatched from anywhere,
// automatically reset the entire RTK Query cache to clear stale data from the previous user
const rootReducer: typeof combinedReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    // Reset API cache state to undefined → RTK Query clears all cached data
    return combinedReducer({ ...state, [baseApi.reducerPath]: undefined as any }, action);
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, api: ApiState}
export type AppDispatch = typeof store.dispatch;

