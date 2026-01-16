import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import TechnologiesPage from '@/pages/Technologies/TechnologiesPage'
import Blog from '@/pages/Blogs/Blog'
import InnerBlog from '@/pages/Blogs/InnerBlogs/InnerBlog'
import InnerTechnologies from '@/pages/Technologies/InnerTechbologies/InnerTechnologies'

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/Technology" element={<TechnologiesPage />} />
        <Route path='/Technology/:title' element={<InnerTechnologies/>}/>

        <Route path='/Blog' element={<Blog/>}/>
        <Route path="/Blog/:id" element={<InnerBlog />} />
    </Routes>
)

export default AppRoutes
