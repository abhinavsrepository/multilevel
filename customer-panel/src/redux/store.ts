import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import clientReducer from './slices/clientSlice';
import taskReducer from './slices/taskSlice';
import siteVisitReducer from './slices/siteVisitSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    client: clientReducer,
    task: taskReducer,
    siteVisit: siteVisitReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
