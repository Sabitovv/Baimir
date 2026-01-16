import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import imgStanok from '@/assets/lazerStanok.png'
import ReviewImg from '@/assets/img_review.png'
import { useParams } from 'react-router-dom'

const TechnologiesPage = () => {
    const {title} = useParams()
  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-16">

        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        <section className="max-w-[920px] ml-5">

          <h1 className="font-oswald text-4xl xl:text-5xl font-bold uppercase mb-4">
            {title}
          </h1>

          <h3 className="font-oswald text-xl font-semibold mb-6">
            Как выбрать технологию резки металла для нового производства
          </h3>

          <p className="text-gray-600 mb-10 leading-relaxed">
            Открытие собственного металлообрабатывающего цеха — серьёзный шаг.
            Ниже мы разберём основные технологии резки металла.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">

            {['Лазерные станки','Гильотинные ножницы','Плазменные станки ЧПУ','Рулонная сталь']
              .map(title => (

              <div
                key={title}
                className="border rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer"
              >
                <img
                  src={imgStanok}
                  className="h-20 mx-auto object-contain mb-3"
                />
                <p className="text-xs font-semibold">{title}</p>
              </div>

            ))}
          </div>

          <h2 className="font-oswald text-2xl font-bold mb-4">
            Почему выбор технологии резки так важен?
          </h2>

          <p className="text-gray-700 leading-relaxed ">
            Каждая технология имеет свои преимущества и ограничения. Начинающий предприниматель часто пытается найти «универсальный» станок, который будет резать всё — от тонкого листа до толстого профиля. Но универсального решения нет.
            Поэтому выбор оборудования нужно делать исходя из трёх факторов:
          </p>
          <ol type='1' className='list-[number] pl-6 space-y-2 font-Manrope font-semibold mb-8'>
            <li>Материалы и диапазон толщин</li>
            <li>Требования к качеству реза</li>
            <li>Объёмы производства и бюджет</li>
          </ol>

          <h2 className="font-oswald text-2xl font-bold mb-6">
            Лазерная резка металла
          </h2>

          <div className="space-y-3 text-gray-700 mb-20">
            Лазерный станок — это высокоточная технология, которая востребована в разных отраслях промышленности: машиностроении, производстве металлоконструкций, вентиляции, корпусных изделий, мебели из металла и др.
            Что такое лазерная резка?
            Резка происходит с помощью сфокусированного луча, который плавит или испаряет металл. Управление осуществляется ЧПУ, что обеспечивает максимальную точность и повторяемость.
            <p className='font-bold mt-8'>Преимущества</p>
            <ul className='list-disc pl-6'>
                <li>Идеальное качество реза: минимальная ширина реза, гладкая кромка, отсутствует окалина.</li>
                <li>Высокая скорость при резке тонких материалов (0.5–4 мм).</li>
                <li>Высокая точность — лучшая среди всех технологий.</li>
                <li>Подходит для сложной фигурной резки.</li>
                <li>Меньше последующей обработки — иногда она вообще не требуется</li>
            </ul>
            <p className='font-bold mt-8'>Недостатки</p>
            <ul className='list-disc pl-6'>
                <li>Идеальное качество реза: минимальная ширина реза, гладкая кромка, отсутствует окалина.</li>
                <li>Высокая скорость при резке тонких материалов (0.5–4 мм).</li>
                <li>Высокая точность — лучшая среди всех технологий.</li>
                <li>Подходит для сложной фигурной резки.</li>
                <li>Меньше последующей обработки — иногда она вообще не требуется</li>
            </ul>
          </div>

        </section>

      </div>
        <div className='flex justify-around'>
            <div className="p-10 rounded-xl">
                <h2 className="font-oswald text-4xl font-bold uppercase mb-8">
                    Оставьте заявку
                </h2>
                <Contact />
            </div>
            <div className="w-full md:w-1/2">
                <img
                    src={ReviewImg}
                    className="w-full max-w-[520px] mx-auto"
                />
            </div>
        </div>
        
    </PageContainer>
  )
}

export default TechnologiesPage
