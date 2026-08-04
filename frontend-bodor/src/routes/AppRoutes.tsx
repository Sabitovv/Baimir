import ScrollToTop from '@/app/ScrollToTop'
import { lazy, Suspense, type ReactElement } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetCategoriesTreeQuery, type Category } from '@/api/categoriesApi'

// На bodorlaser.kz доступна только одна категория — все остальные пути каталога ведут на неё
export const ONLY_CATEGORY_SLUG = 'lazernye-stanki'
export const ONLY_CATEGORY_PATH = `/catalog/${ONLY_CATEGORY_SLUG}`

const flattenCategories = (cats: Category[]): Category[] =>
    cats.flatMap((cat) => [cat, ...flattenCategories(cat.children ?? [])])

// Разрешена сама категория и любая вложенная в неё (связь идёт через parentId)
const isAllowedCategory = (categories: Category[], slug?: string): boolean => {
    if (!slug) return false
    if (slug === ONLY_CATEGORY_SLUG) return true

    const all = flattenCategories(categories)
    const byId = new Map(all.map((cat) => [Number(cat.id), cat]))
    const visited = new Set<number>()
    let current = all.find((cat) => cat.slug === slug)

    while (current) {
        if (current.slug === ONLY_CATEGORY_SLUG) return true

        const parentId = Number(current.parentId)
        if (!Number.isFinite(parentId) || visited.has(parentId)) break
        visited.add(parentId)
        current = byId.get(parentId)
    }

    return false
}

// const TechnologiesPage = lazy(() => import('@/pages/Technologies/TechnologiesPage'))
// const InnerTechnologies = lazy(() => import('@/pages/Technologies/InnerTechbologies/InnerTechnologies'))
const Home = lazy(() => import('@/pages/Home'))
const Blog = lazy(() => import('@/pages/Blogs/Blog'))
const InnerBlog = lazy(() => import('@/pages/Blogs/InnerBlogs/InnerBlog'))
// const DemoPage = lazy(() => import('@/pages/Demo/DemoPage'))
// const DemoInnerPage = lazy(() => import('@/pages/Demo/DemoInner'))
const ProductionPage = lazy(() => import('@/pages/Production/ProductionPage'))
const StoragePage = lazy(() => import('@/pages/Storage/StoragePage'))
const ServicePage = lazy(() => import('@/pages/Service/ServicePage'))
const AboutPage = lazy(() => import('@/pages/About/AboutPage'))
// Общая страница каталога со списком категорий скрыта
// const CatalogPage = lazy(() => import('@/pages/Catalog/CatalogPage'))
const CollectionPage = lazy(() => import('@/pages/Catalog/CollectionPage'))
const CatalogDeepProductsPage = lazy(() => import('@/pages/Catalog/components/CatalogDeepProductsPage'))
const CategoryPage = lazy(() => import('@/pages/Catalog/CategoryPage'))
const ProductPage = lazy(() => import('@/pages/Catalog/ProductPage'))
const ComparePage = lazy(() => import('@/pages/Compare/ComparePage'))

const PageLoader = () => (
    <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#DC0000] rounded-full animate-spin" />
    </div>
)

// Пропускает только разрешённую категорию и её подкатегории, остальные слаги редиректит на неё
const OnlyCategoryRoute = ({ children }: { children: ReactElement }) => {
    const { categorySlug } = useParams<{ categorySlug: string }>()
    const { i18n } = useTranslation()
    const { data: categories = [], isLoading } = useGetCategoriesTreeQuery({ lang: i18n.language })

    if (categorySlug === ONLY_CATEGORY_SLUG) return children
    if (isLoading) return <PageLoader />

    return isAllowedCategory(categories, categorySlug)
        ? children
        : <Navigate to={ONLY_CATEGORY_PATH} replace />
}

const AppRoutes = () => (
    <Suspense fallback={<PageLoader />}>
        <ScrollToTop />
        <Routes>
            <Route path="/" element={<Home />} />

            {/* <Route path="/technology" element={<TechnologiesPage />} />
            <Route path="/technology/:title" element={<InnerTechnologies />} /> */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<InnerBlog />} />
            {/* <Route path="/demo" element={<DemoPage />} />
            <Route path="/demo/:id" element={<DemoInnerPage />} /> */}
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/about" element={<AboutPage />} />

            <Route path="/catalog/product/:productSlug" element={<ProductPage />} />
            <Route path="/collections/:slug" element={<CollectionPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/catalog/:categorySlug" element={<OnlyCategoryRoute><CategoryPage /></OnlyCategoryRoute>} />
            <Route path="/catalog/:categorySlug/products/:categoryId" element={<OnlyCategoryRoute><CategoryPage /></OnlyCategoryRoute>} />
            <Route path="/catalog/:categorySlug/deep-products" element={<OnlyCategoryRoute><CatalogDeepProductsPage /></OnlyCategoryRoute>} />
            <Route path="/catalog/:categorySlug/deep-products/:categoryId" element={<OnlyCategoryRoute><CatalogDeepProductsPage /></OnlyCategoryRoute>} />
            {/* Любая другая категория недоступна — редирект на единственную */}
            <Route path="/catalog/deep-products" element={<Navigate to={ONLY_CATEGORY_PATH} replace />} />
            <Route path="/catalog/*" element={<Navigate to={ONLY_CATEGORY_PATH} replace />} />
        </Routes>
    </Suspense>
)

export default AppRoutes
