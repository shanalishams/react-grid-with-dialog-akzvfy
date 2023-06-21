import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from '@reduxjs/toolkit';
import { SchedulerSlice } from './modules/SchedulerSlice';
const rootReducer = combineReducers({
  SchedulerSlice: SchedulerSlice.reducer,
});

export const store = configureStore({
  reducer: {
    RootReducer: rootReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
