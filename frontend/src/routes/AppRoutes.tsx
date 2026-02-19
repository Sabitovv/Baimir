import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('@/pages/Home'))
const TechnologiesPage = lazy(() => import('@/pages/Technologies/TechnologiesPage'))
const InnerTechnologies = lazy(() => import('@/pages/Technologies/InnerTechbologies/InnerTechnologies'))
const Blog = lazy(() => import('@/pages/Blogs/Blog'))
const InnerBlog = lazy(() => import('@/pages/Blogs/InnerBlogs/InnerBlog'))
const DemoPage = lazy(() => import('@/pages/Demo/DemoPage'))
const DemoInnerPage = lazy(() => import('@/pages/Demo/DemoInner'))
const ProductionPage = lazy(() => import('@/pages/Production/ProductionPage'))
const StoragePage = lazy(() => import('@/pages/Storage/StoragePage'))
const ServicePage = lazy(() => import('@/pages/Service/ServicePage'))
const CatalogPage = lazy(() => import('@/pages/Catalog/CatalogPage'))
const CategoryPage = lazy(() => import('@/pages/Catalog/CategoryPage'))
const ProductPage = lazy(() => import('@/pages/Catalog/ProductPage'))

const PageLoader = () => (
    <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#F05023] rounded-full animate-spin" />
    </div>
)

const AppRoutes = () => (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/technology" element={<TechnologiesPage />} />
            <Route path="/technology/:title" element={<InnerTechnologies />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<InnerBlog />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/demo/:id" element={<DemoInnerPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/service" element={<ServicePage />} />

            <Route path="/catalog/product/:productSlug" element={<ProductPage />} />
            <Route path="/catalog/:categorySlug/products/:categoryId" element={<CategoryPage />} />
            <Route path="/catalog/*" element={<CatalogPage />} />
        </Routes>
    </Suspense>
)

export default AppRoutes