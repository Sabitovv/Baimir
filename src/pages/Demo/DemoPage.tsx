import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import img1 from '@/assets/sklad1.png'
import {Link} from 'react-router-dom'
import BlogCard from '@/components/common/BlogCardProps'

const DemoPage = () => {
      const posts = [
          { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
          { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
      ]
  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-16">

        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        <section className="max-w-[1000px] ml-10">

          <h1 className="font-oswald text-[40px] font-bold uppercase mb-2">
            Посетите наши демозалы
          </h1>

          <h3 className="font-oswald text-xl font-semibold mb-4">
            Подберем станки под ваш бизнес
          </h3>

          <p className="text-[#3A3A3A] max-w-[760px] leading-[1.7] mb-10">
            Ждём вас в наших демозалах, где мы покажем в работе любое оборудование,
            выполним тестовые детали и операции под нужды вашего бизнеса.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">


              {posts.map(post => (
                    <Link to={`/Blog/${post.id}`} className="block">
                        <BlogCard
                            key={post.id}
                            image={post.image}
                            text={post.text}
                        />
                    </Link>
              ))}


          </div>

        </section>

      </div>

      <div className="mt-24 text-center max-w-[600px] mx-auto mb-30">

        <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
          Оставьте заявку
        </h2>

        <Contact />

      </div>

    </PageContainer>
  )
}

export default DemoPage
