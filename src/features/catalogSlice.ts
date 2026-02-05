import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Category } from "@/api/categoriesApi"

type CatalogState = {
    breadcrumbs: Category[]
}

const initialState: CatalogState = {
    breadcrumbs: []
}

const catalogSlice = createSlice({
    name: "catalog",
    initialState,

    reducers: {
        setBreadcrumbs(state, action: PayloadAction<Category[]>) {
            state.breadcrumbs = action.payload
        },
        clearBreadcrumbs(state) {
            state.breadcrumbs = []
        }
    }
})

export const { setBreadcrumbs, clearBreadcrumbs } = catalogSlice.actions

export default catalogSlice.reducer
