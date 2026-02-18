import { configureStore } from '@reduxjs/toolkit'
// import uiReducer from '@/features/uiSlice'
import { categoriesApi } from '@/api/categoriesApi'
import { productsApi } from '@/api/productsApi'
import catalogReducer from "@/features/catalogSlice"



export const store = configureStore({
    reducer: {
        // ваши редьюсеры:
        // someFeature: someReducer,

        // RTK Query reducers:
        [categoriesApi.reducerPath]: categoriesApi.reducer,
        [productsApi.reducerPath]: productsApi.reducer,
        catalog: catalogReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            categoriesApi.middleware,
            productsApi.middleware
        ),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
