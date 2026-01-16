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
          <ol type='1' className='list-[number] pl-6 space-y-2 font-Manrope font-semibold mb-6'>
            <li>Материалы и диапазон толщин</li>
            <li>Требования к качеству реза</li>
            <li>Объёмы производства и бюджет</li>
          </ol>

          <h2 className="font-oswald text-2xl font-bold mb-2">
            Лазерная резка металла
          </h2>

          <div className="space-y-3 text-gray-700 mb-20">
            Лазерный станок — это высокоточная технология, которая востребована в разных отраслях промышленности: машиностроении, производстве металлоконструкций, вентиляции, корпусных изделий, мебели из металла и др.
            Что такое лазерная резка?
            Резка происходит с помощью сфокусированного луча, который плавит или испаряет металл. Управление осуществляется ЧПУ, что обеспечивает максимальную точность и повторяемость.
            <p className='font-bold mt-6'>Преимущества</p>
            <ul className='list-disc pl-6'>
                <li>Идеальное качество реза: минимальная ширина реза, гладкая кромка, отсутствует окалина.</li>
                <li>Высокая скорость при резке тонких материалов (0.5–4 мм).</li>
                <li>Высокая точность — лучшая среди всех технологий.</li>
                <li>Подходит для сложной фигурной резки.</li>
                <li>Меньше последующей обработки — иногда она вообще не требуется</li>
            </ul>
            <p className='font-bold mt-6'>Недостатки</p>
            <ul className='list-disc pl-6'>
                <li>Стоимость оборудования выше, чем у других технологий.</li>
                <li>Требуется обслуживание оптики, охлаждения и автоматики.</li>
                <li>Скорость падает при работе с большой толщиной (выше 12–20 мм).</li>
            </ul>
            <p className='font-bold mt-6'>Преимущества</p>
            <ul className='list-disc pl-6'>
                <li>Изготовление корпусных изделий.</li>
                <li>Металлоконструкции.</li>
                <li>HVAC-системы.</li>
                <li>Производство фасадов, дверей, мебели.</li>
                <li>Малые и средние серийные производства.</li>
            </ul> 
            <p className='font-bold'>Если вы только начинаете</p>
                <p className='leading-4'>✔ Отличный вариант, если основная работа — точная резка листового металла толщиной 0.5–10 мм.</p>
                <p className='leading-4'>✔ Бизнес с высокой добавленной стоимостью</p>
                <p className='leading-4'>✘ Если бюджет ограничен — лазер может быть слишком дорогим для старта.</p>
          </div>
          <div className='space-y-3 text-gray-700 mb-20'>
            <h2 className='font-oswald font-bold text-2xl'>Плазменные станки с ЧПУ</h2>

            <p className='mt-6'>Плазменная резка — это термическая технология, где материал разрезается струёй ионизированного газа. Это оптимальный выбор для тех, кому нужна высокая скорость и возможность работать с толстыми листами.</p>
            <p className='font-bold mt-6'>Преимущества</p>
            <ul className='list-disc pl-6'>
                <li>Высокая скорость резки на средних и больших толщинах</li>
                <li>Оборудование дешевле лазерного — отличный вариант для старта</li>
                <li>Универсальность: можно резать любые токопроводящие материалы</li>
                <li>Подходит для больших заготовок и грубых конструкций</li>
            </ul>
            <p className='font-bold mt-6'>Недостатки</p>
            <ul className='list-disc pl-6'>
                <li>Невысокое качество кромки по сравнению с лазером.</li>
                <li>Может образовываться окалина, требующая зачистки</li>
                <li>Фигурные элементы режутся, но с более низкой точностью</li>
            </ul>
            <p className='font-bold mt-6'>Для каких производств подходит</p>
            <ul className='list-disc pl-6'>
                <li>Производство металлоконструкций.</li>
                <li>Резка толстого листа (10–50 мм)</li>
                <li>Сварные конструкции, фермы, кронштейны</li>
                <li>Заготовительное производство</li>
            </ul>
            <p className='font-bold mt-6'>Если вы только начинаете</p>
                <p className='leading-6'>✔ Отличный вариант, если основная работа — точная резка листового металла толщиной 0.5–10 мм.</p>
                <p className='leading-6'>✔ Бизнес с высокой добавленной стоимостью</p>
                <p className='leading-6'>✘ Если бюджет ограничен — лазер может быть слишком дорогим для старта.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start mb-20">

  {/* LEFT TEXT */}
            <div>
                <h2 className="font-oswald text-2xl font-bold mb-2">
                    Гильотинные ножницы
                </h2>

                <p className="text-[#3A3A3A] text-[15px] leading-6 mb-4">
                    Гильотина — это простая, надёжная и быстрая механическая технология резки, которая используется для прямолинейного раскроя листового металла.
                </p>

                <p className="font-semibold mt-4">Преимущества</p>
                <ul className="list-disc pl-6 space-y-2 text-[15px]">
                    <li>Высокая скорость резки на прямолинейных резах</li>
                    <li>Низкая себестоимость обработки</li>
                    <li>Минимальные требования к обслуживанию</li>
                    <li>Отсутствие термического воздействия</li>
                </ul>

                <p className="font-semibold mt-6">Недостатки</p>
                <ul className="list-disc pl-6 space-y-2 text-[15px]">
                    <li>Только прямые резы</li>
                    <li>Ограничение по толщине (12–16 мм)</li>
                    <li>Не подходит для мелких сложных деталей</li>
                </ul>

                <p className="font-semibold mt-6">Для каких производств подходит</p>
                <ul className="list-disc pl-6 space-y-2 text-[15px]">
                    <li>Производство вентиляционных коробов</li>
                    <li>Заготовительные участки</li>
                    <li>Обрезка листа перед лазером/плазмой</li>
                    <li>Изготовление простых металлических панелей</li>
                </ul>

            </div>

            </div>


        </section>

      </div>
        <div className='flex justify-between'>
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
