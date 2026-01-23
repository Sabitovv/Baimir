import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import TechnologiesPage from '@/pages/Technologies/TechnologiesPage'
import Blog from '@/pages/Blogs/Blog'
import InnerBlog from '@/pages/Blogs/InnerBlogs/InnerBlog'
import InnerTechnologies from '@/pages/Technologies/InnerTechbologies/InnerTechnologies'
import DemoPage from '@/pages/Demo/DemoPage'
import DemoInnerPage from '@/pages/Demo/DemoInner'

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/Technology" element={<TechnologiesPage />} />
            <Route path="/Technology/:title" element={<InnerTechnologies />} />

        <Route path="/Blog" element={<Blog />} />
            <Route path="/Blog/:id" element={<InnerBlog />} />

        <Route path="/Demo" element={<DemoPage />} />
            <Route path="/demo/:id" element={<DemoInnerPage />} />
    </Routes>
)

export default AppRoutes
