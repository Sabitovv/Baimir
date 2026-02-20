import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import BlogCard from '@/components/common/BlogCardProps'
import { Link } from 'react-router-dom'

import img1 from '@/assets/home/lazerStanok.webp'

// Импорты компонентов анимации
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const BlogPage = () => {
  const posts = [
    { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
    { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
    { id: 'cnc', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
    { id: 'laser', image: img1, text: 'Наши зарубежные склады — залог надежности...' },
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
            {/* Анимация заголовков и описания */}
            <ScrollReveal>
              <h1 className="font-oswald font-bold text-3xl md:text-4xl xl:text-5xl uppercase text-[#F05023]">
                Блог компании
              </h1>

              <h3 className='font-oswald font-bold mt-4 mb-6 text-2xl md:text-3xl'>
                Подберем станки под ваш бизнес
              </h3>

              <p className="max-w-3xl mb-6 text-sm font-Monaper text-[#233337] leading-relaxed">
                Тут какой-то текст, в котором я фиг знает чо писать, потому что нам так и не предоставили никакой инфы. И кто вообще отвечает за это?
              </p>
            </ScrollReveal>

            {/* Анимация блока с тегами */}
            <ScrollReveal delay={0.2} y={15}>
              <div className="flex flex-wrap gap-2 mb-8 mt-2">
                {[
                  'Лазерные станки',
                  'Фрезерные станки',
                  'Токарные станки',
                  'Автоматизация',
                  'Лазерные станки 2', // Изменил немного для уникальности или можно оставить как было
                  'Фрезерные станки 2',
                  'Токарные станки 2',
                  'Автоматизация 2'
                ].map((tag, index) => (
                  <span
                    key={index} // Используем index, чтобы не было конфликта одинаковых ключей
                    className="border px-5 py-2 text-xs rounded-xl cursor-pointer hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            {/* Каскадная анимация карточек блога */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <StaggerItem key={post.id || index}>
                  <Link to={`/Blog/${post.id}`} className="block group">
                    <BlogCard
                      image={post.image}
                      text={post.text}
                    />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Анимация пагинации */}
            <ScrollReveal y={20}>
              <div className="flex justify-center gap-2 mt-12 mb-12">
                {[1, 2, 3, 4, '…', 10].map((p, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 flex items-center justify-center border text-xs rounded-sm hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </ScrollReveal>

          </section>

        </div>
      </PageContainer>
    </>
  )
}

export default BlogPage