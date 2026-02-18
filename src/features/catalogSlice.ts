import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface BreadcrumbItem {
    id?: string | number; 
    name: string;
    slug?: string;
    path: string;
}

type CatalogState = {
    breadcrumbs: BreadcrumbItem[]
}

const initialState: CatalogState = {
    breadcrumbs: []
}

const catalogSlice = createSlice({
    name: "catalog",
    initialState,

    reducers: {
        setBreadcrumbs(state, action: PayloadAction<BreadcrumbItem[]>) {
            state.breadcrumbs = action.payload
        },
        clearBreadcrumbs(state) {
            state.breadcrumbs = []
        }
    }
})

export const { setBreadcrumbs, clearBreadcrumbs } = catalogSlice.actions

export default catalogSlice.reducer