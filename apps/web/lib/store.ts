import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

/* Redux yalnızca oturum durumunu tutar. Kitap verisi TanStack Query'de
   (lib/booksQueries.ts). */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
