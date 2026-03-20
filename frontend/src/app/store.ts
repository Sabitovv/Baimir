import { configureStore } from '@reduxjs/toolkit'
// import uiReducer from '@/features/uiSlice'
import { categoriesApi } from '@/api/categoriesApi'
import { productsApi } from '@/api/productsApi'
import { blogsApi } from '@/api/blogsApi'
import { reviewsApi } from '@/api/reviewsApi'
import { certificatesApi } from '@/api/certificatesApi'
import catalogReducer from "@/features/catalogSlice"
import cartReducer from '@/features/cartSlice'
import { writeCartStorage } from '@/utils/cartStorage'



export const store = configureStore({
    reducer: {
        // ваши редьюсеры:
        // someFeature: someReducer,

        // RTK Query reducers:
        [categoriesApi.reducerPath]: categoriesApi.reducer,
        [productsApi.reducerPath]: productsApi.reducer,
        [blogsApi.reducerPath]: blogsApi.reducer,
        [reviewsApi.reducerPath]: reviewsApi.reducer,
        [certificatesApi.reducerPath]: certificatesApi.reducer,
        catalog: catalogReducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            categoriesApi.middleware,
            productsApi.middleware,
            blogsApi.middleware,
            reviewsApi.middleware,
            certificatesApi.middleware
        ),
});

let lastCartState = store.getState().cart.items

store.subscribe(() => {
    const nextCartState = store.getState().cart.items

    if (nextCartState === lastCartState) return

    lastCartState = nextCartState
    writeCartStorage(nextCartState)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
