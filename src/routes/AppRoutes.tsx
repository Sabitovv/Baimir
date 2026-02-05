import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'

import TechnologiesPage from '@/pages/Technologies/TechnologiesPage'
import InnerTechnologies from '@/pages/Technologies/InnerTechbologies/InnerTechnologies'

import Blog from '@/pages/Blogs/Blog'
import InnerBlog from '@/pages/Blogs/InnerBlogs/InnerBlog'

import DemoPage from '@/pages/Demo/DemoPage'
import DemoInnerPage from '@/pages/Demo/DemoInner'

import ProductionPage from '@/pages/Production/ProductionPage'
import StoragePage from '@/pages/Storage/StoragePage'
import ServicePage from '@/pages/Service/ServicePage'

import CatalogPage from '@/pages/Catalog/CatalogPage'
import CategoryPage from '@/pages/Catalog/CategoryPage'
import ProductPage from '@/pages/Catalog/ProductPage'

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/technology" element={<TechnologiesPage />} />
        <Route path="/technology/:title" element={<InnerTechnologies />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<InnerBlog />} />

        <Route path="/demo" element={<DemoPage />} />
        <Route path="/demo/:id" element={<DemoInnerPage />} />
        
        <Route path='/production' element={<ProductionPage/>}/>
        <Route path='/storage' element={<StoragePage/>}/>
        <Route path="/service" element={<ServicePage />} />

        <Route path="/catalog/:categorySlug/products/:productId" element={<CategoryPage />} />
        <Route path="/catalog/*" element={<CatalogPage />}/>            
        <Route path="/products" element={<ProductPage />} />
        
    </Routes>   
)

export default AppRoutes