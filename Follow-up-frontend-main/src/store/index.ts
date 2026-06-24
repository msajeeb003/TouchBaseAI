import { configureStore, combineReducers, type Middleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/store/api/baseApi";
import { authReducer } from "./features/auth/authSlice";

const rootReducer = combineReducers({
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
type PersistedRootState = ReturnType<typeof persistedReducer>;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware as Middleware<object, PersistedRootState>),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;