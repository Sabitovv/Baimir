import { configureStore } from '@reduxjs/toolkit'
// import uiReducer from '@/features/uiSlice'
import { categoriesApi } from '@/api/categoriesApi';
import catalogReducer from "@/features/catalogSlice"



export const store = configureStore({
    reducer: {
        // ваши редьюсеры:
        // someFeature: someReducer,

        // RTK Query reducer:
        [categoriesApi.reducerPath]: categoriesApi.reducer,
        catalog: catalogReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(categoriesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
