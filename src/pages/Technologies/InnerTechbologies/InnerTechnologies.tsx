import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import PhotoStanok from '@/assets/Home/lazerStanok.webp'
import Photo1 from '@/assets/Technology/Inner/posterVideo.webp'
import MainPhoto from '@/assets/Technology/Inner/mainPhoto.webp'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import ProductCard from '@/components/common/ProductCard'


const TechnologiesPage = () => {
  const { title } = useParams()
  const [choose, setChoose] = useState(0)

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-14">
        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>
        <section className="mx-auto w-full ">
          <h1 className="font-oswald text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold uppercase text-[#F05023]">
            {title}
          </h1>
          <h3 className="font-oswald text-base sm:text-lg md:text-xl font-bold my-4 mb-4 md:mb-6 whitespace-pre-line">
            Как выбрать технологию резки металла для нового производства
          </h3>
          <div className="max-w-4xl overflow-hidden">
            <img src={MainPhoto} />
          </div>
          <p className='text-xs sm:text-sm text-gray-500 mt-2 font-light px-2'>Примечание к фотографии типа “Пример промышленной системы воздуховодов”</p>

          <div className="sm:flex-row sm:items-center sm:justify-between gap-4 my-10">
            <div className="relative max-w-xs w-full">
              <button
                className="
                  w-full flex items-center justify-between
                  bg-[#F05023] text-white
                  px-4 py-2
                  text-sm font-semibold
                "
              >
                Содержание
                <span>▼</span>
              </button>
              <div
                className="
                  bg-white shadow-lg
                  w-full text-sm
                  border border-t-0 border-[#939393] p-2
                "
              >
                <ul>
                  <li onClick={() => setChoose(1)} className={`${choose === 1 ? 'text-[#F05023]' : 'text-none'}  px-4 py-1 hover:bg-gray-100 cursor-pointer`}>
                    1. Этапы производства воздуховодов
                  </li>
                  <li onClick={() => setChoose(2)} className={`${choose === 2 ? 'text-[#F05023]' : 'text-none'}  px-4 py-1 hover:bg-gray-100 cursor-pointer`}>
                    2. Автоматизация
                  </li>
                  <li onClick={() => setChoose(3)} className={`${choose === 3 ? 'text-[#F05023]' : 'text-none'}  px-4 py-1 hover:bg-gray-100 cursor-pointer`}>
                    3. Производство
                  </li>
                  <li onClick={() => setChoose(4)} className={`${choose === 4 ? 'text-[#F05023]' : 'text-none'}  px-4 py-1 hover:bg-gray-100 cursor-pointer`}>
                    4. Что-то еще
                  </li>
                  <li onClick={() => setChoose(5)} className={`${choose === 5 ? 'text-[#F05023]' : 'text-none'}  px-4 py-1 hover:bg-gray-100 cursor-pointer`}>
                    5. Что-то еще
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mb-10">
            <h2 className="font-bold text-2xl mb-3">
              Этапы производства воздуховодов
            </h2>

            <ul className="list-disc pl-5  text-sm text-gray-700">
              <li>Проектирование и расчёты</li>
              <li>Подготовка материала</li>
              <li>Формирование профиля</li>
              <li>Соединение и герметизация швов</li>
              <li>Изготовление фасонных элементов</li>
              <li>Антикоррозийная обработка и отделка</li>
              <li>Контроль качества</li>
            </ul>
          </div>
          <div className="mb-12">

            <h2 className="font-bold text-lg mb-3">
              Автоматизация процесса производства круглых <br /> воздуховодов
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed">
              Автоматизация производства круглых воздуховодов — это переход на роботизированные линии, управляемые цифровыми программами. Всё начинается с автоматического проектирования (САПР), которое само рассчитывает параметры и создаёт чертежи. Затем материал режется и подготавливается на станках с ЧПУ без участия человека. Главный этап — формовка трубы на спирально-навивных или прямошовных автоматах, которые самостоятельно формируют шов, навивают спираль и отрезают готовые секции. Даже сложные элементы — отводы и тройники — вырезаются лазером и гнутся по цифровым шаблонам. В конце автоматика упаковывает и маркирует продукцию. Итог: скорость выше, качество стабильное, а человеческий фактор сведён к контролю и настройке.
            </p>

          </div>
          <div className="mb-24">
            <h3 className="text-center font-extrabold text-2xl mb-4">
              Заголовок для изображения отцентрирован по середине относительно изображения
            </h3>
            <img
              src={Photo1}
              className="w-full rounded-md"
            />
            <p className="text-xs text-gray-500 mt-2">
              Примечание к фотографии или чертежу. Если картинка горизонтальная
            </p>
          </div>

          <div className="mb-24">
            <h3 className="text-center font-extrabold text-2xl mb-4">
              Заголовок для видео отцентрован по середине
            </h3>
            <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/APaLfGApE8A?rel=0"
                title="Baimir Laser Machine Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Если видео, отступы сверху и снизу 100пкс
            </p>
          </div>
          <div className='flex gap-5 mb-48'>
            <img src={Photo1} alt="" className='w-1/3 h-1/2' />
            <p className='text-sm leading-normal'>Автоматизация производства круглых воздуховодов — это переход на роботизированные линии, управляемые цифровыми программами. Всё начинается с автоматического проектирования (САПР), которое само рассчитывает параметры и создаёт чертежи. Затем материал режется и подготавливается на станках с ЧПУ без участия человека. Главный этап — формовка трубы на спирально-навивных или прямошовных автоматах, которые самостоятельно формируют шов, навивают спираль и отрезают готовые секции. Даже сложные элементы — отводы и тройники — вырезаются лазером и гнутся по цифровым шаблонам. В конце автоматика упаковывает и маркирует продукцию. Итог: скорость выше, качество стабильное, а человеческий фактор сведён к контролю и настройке.
              Даже сложные элементы — отводы и тройники — вырезаются лазером и гнутся по цифровым шаблонам. В конце автоматика упаковывает и маркирует продукцию. Итог: скорость выше, качество стабильное, а человеческий фактор сведён к контролю и настройке.</p>
          </div>
          <div className='mb-20'>
            <h3 className="font-extrabold text-2xl mb-4">Заголовок для видео отцентрован по середине</h3>
            <div className='text-center'>
              <div className='flex gap-5 mb-9 text-left'>
                <ProductCard image={PhotoStanok} title='Лазерный станок для резки мет.листов А3-1500W Bodor' code='10150570' price='10 500 000' />
                <ProductCard image={PhotoStanok} title='Лазерный станок для резки мет.листов А3-1500W Bodor' code='10150570' price='10 500 000' />
                <ProductCard image={PhotoStanok} title='Лазерный станок для резки мет.листов А3-1500W Bodor' code='10150570' price='10 500 000' />
              </div>
              <button className="w-1/3 bg-[#F05023] hover:bg-[#e4491f] font-semibold py-3 text-white transition" >Перейти в каталог →</button>
            </div>
          </div>
          <div className="mt-24 max-w-[600px] mx-auto mb-48">
            <h2 className="font-oswald text-6xl font-bold uppercase mb-8">
              Оставьте заявку
            </h2>
            <Contact />
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

export default TechnologiesPage
