import { configureStore } from '@reduxjs/toolkit'
import { categoriesApi } from '@/api/categoriesApi'
import { productsApi } from '@/api/productsApi'
import { blogsApi } from '@/api/blogsApi'
import { reviewsApi } from '@/api/reviewsApi'
import { certificatesApi } from '@/api/certificatesApi'

import catalogReducer from "@/features/catalogSlice"
import cartReducer from '@/features/cartSlice'
import { writeCartStorage } from '@/utils/cartStorage'
import compareReducer from '@/features/compareSlice'
import { writeCompareStorage } from '@/utils/compareStorage'
import { staticImagesApi } from '@/zustand/staticImagesApi'

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
        [staticImagesApi.reducerPath]: staticImagesApi.reducer,

        catalog: catalogReducer,
        cart: cartReducer,
        compare: compareReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            categoriesApi.middleware,
            productsApi.middleware,
            blogsApi.middleware,
            reviewsApi.middleware,
            certificatesApi.middleware,
            staticImagesApi.middleware
        ),
});

let lastCartState = store.getState().cart.items
let lastCompareState = store.getState().compare.items

store.subscribe(() => {
    const nextCartState = store.getState().cart.items
    const nextCompareState = store.getState().compare.items

    if (nextCartState !== lastCartState) {
        lastCartState = nextCartState
        writeCartStorage(nextCartState)
    }

    if (nextCompareState !== lastCompareState) {
        lastCompareState = nextCompareState
        writeCompareStorage(nextCompareState)
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch