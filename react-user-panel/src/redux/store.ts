import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import propertyReducer from './slices/propertySlice';
import walletReducer from './slices/walletSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';

// RTK Query Services
import { authService } from './services/authService';
import { propertyService } from './services/propertyService';
import { walletService } from './services/walletService';

// Configure store
export const store = configureStore({
  reducer: {
    // Slices
    auth: authReducer,
    user: userReducer,
    property: propertyReducer,
    wallet: walletReducer,
    notification: notificationReducer,
    theme: themeReducer,

    // RTK Query Services
    [authService.reducerPath]: authService.reducer,
    [propertyService.reducerPath]: propertyService.reducer,
    [walletService.reducerPath]: walletService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/REGISTER',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['register', 'rehydrate'],
      },
    }).concat(
      // Add RTK Query middleware
      authService.middleware,
      propertyService.middleware,
      walletService.middleware
    ),
  devTools: import.meta.env.MODE !== 'production',
});

// Setup listeners for RTK Query
// This enables features like refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export store as default
export default store;
