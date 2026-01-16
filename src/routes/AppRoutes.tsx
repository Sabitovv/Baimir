import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import TechnologiesPage from '@/pages/Technologies/TechnologiesPage'
import Blog from '@/pages/Blogs/Blog'
import InnerBlog from '@/pages/Blogs/InnerBlogs/InnerBlog'
import InnerTechnologies from '@/pages/Technologies/InnerTechbologies/InnerTechnologies'

const AppRoutes = () => (
    <Routes>
        <Route path="/Baimir" element={<Home />} />
        
        <Route path="/Baimir/Technology" element={<TechnologiesPage />} />
        <Route path='/Baimir/Technology/:title' element={<InnerTechnologies/>}/>

        <Route path='/Baimir/Blog' element={<Blog/>}/>
        <Route path="/Baimir/Blog/:id" element={<InnerBlog />} />

        <Route path='Baimir/Demo' element={<DemoPage/>}/>
    </Routes>
)

export default AppRoutes
