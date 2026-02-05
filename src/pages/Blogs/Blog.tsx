import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import BlogCard from '@/components/common/BlogCardProps'
import {Link} from 'react-router-dom'

import img1 from '@/assets/lazerStanok.png'


const BlogPage = () => {
  const posts = [
    { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
    { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
  ]

  return (
    <>
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-16">

          <aside className="hidden lg:block space-y-6">
            <CategoriesMenu />
          </aside>

          <section>
            <h1 className="font-[Oswald] font-bold text-3xl md:text-4xl xl:text-5xl uppercase text-[#F05023]">
              Блог компании
            </h1>

            <h3 className='font-oswald font-extrabold mb-6 text-3xl'>Подберем станки под ваш бизнес</h3>

            <p className=" max-w-3xl mb-6 text-sm font-Monaper text-[#233337]">
                Тут какой-то текст, в котором я фиг знает чо писать, потому что нам так и не предоставили никакой инфы. И кто вообще отвечает за это?
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {[
                'Лазерные станки',
                'Фрезерные станки',
                'Токарные станки',
                'Автоматизация',
                'Лазерные станки',
                'Фрезерные станки',
                'Токарные станки',
                'Автоматизация'
              ].map(tag => (
                <span
                  key={tag}
                  className="border px-5 py-2 text-xs rounded-xl cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* PAGINATION */}
            <div className="flex justify-center gap-2 mt-10 mb-12">
              {[1, 2, 3, 4, '…', 10].map((p, i) => (
                <button
                  key={i}
                  className="w-8 h-8 border text-xs hover:bg-black hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>

          </section>

        </div>
      </PageContainer>

    </>
  )
}

export default BlogPage
