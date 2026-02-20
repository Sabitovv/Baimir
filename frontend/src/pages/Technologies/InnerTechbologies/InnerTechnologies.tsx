import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import PhotoStanok from '@/assets/home/lazerStanok.webp'
import Photo1 from '@/assets/technology/Inner/posterVideo.webp'
import MainPhoto from '@/assets/technology/Inner/mainPhoto.webp'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import ProductCard from '@/components/common/ProductCard'

import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const TechnologiesPage = () => {
  const { title } = useParams()
  const [choose, setChoose] = useState(0)

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-14">
        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        <section className="mx-auto w-full">

          {/* Главный блок с фото */}
          <ScrollReveal>
            <h1 className="font-oswald text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold uppercase text-[#F05023]">
              {title}
            </h1>
            <h3 className="text-base sm:text-lg md:text-xl font-bold my-4 mb-4 md:mb-6 whitespace-pre-line">
              Как выбрать технологию резки металла для нового производства
            </h3>
            <div className="max-w-4xl overflow-hidden rounded-md">
              <img src={MainPhoto} alt="Главное фото" className="w-full object-cover" />
            </div>
            <p className='text-xs sm:text-sm text-gray-500 mt-2 font-light px-2'>
              Примечание к фотографии типа “Пример промышленной системы воздуховодов”
            </p>
          </ScrollReveal>

          {/* Содержание */}
          <ScrollReveal delay={0.2}>
            <div className="sm:flex-row sm:items-center sm:justify-between gap-4 my-10">
              <div className="relative max-w-xs w-full">
                <button
                  className="
                    w-full flex items-center justify-between
                    bg-[#F05023] text-white
                    px-4 py-2
                    text-sm font-semibold
                    rounded-t-sm
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
                    <li onClick={() => setChoose(1)} className={`${choose === 1 ? 'text-[#F05023]' : 'text-gray-800'}  px-4 py-1 hover:bg-gray-100 cursor-pointer transition-colors`}>
                      1. Этапы производства воздуховодов
                    </li>
                    <li onClick={() => setChoose(2)} className={`${choose === 2 ? 'text-[#F05023]' : 'text-gray-800'}  px-4 py-1 hover:bg-gray-100 cursor-pointer transition-colors`}>
                      2. Автоматизация
                    </li>
                    <li onClick={() => setChoose(3)} className={`${choose === 3 ? 'text-[#F05023]' : 'text-gray-800'}  px-4 py-1 hover:bg-gray-100 cursor-pointer transition-colors`}>
                      3. Производство
                    </li>
                    <li onClick={() => setChoose(4)} className={`${choose === 4 ? 'text-[#F05023]' : 'text-gray-800'}  px-4 py-1 hover:bg-gray-100 cursor-pointer transition-colors`}>
                      4. Что-то еще
                    </li>
                    <li onClick={() => setChoose(5)} className={`${choose === 5 ? 'text-[#F05023]' : 'text-gray-800'}  px-4 py-1 hover:bg-gray-100 cursor-pointer transition-colors`}>
                      5. Что-то еще
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Списки этапов */}
          <div className="mb-10">
            <ScrollReveal>
              <h2 className="font-bold text-2xl mb-4">
                Этапы производства воздуховодов
              </h2>
            </ScrollReveal>

            <StaggerContainer className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <StaggerItem className="list-item">Проектирование и расчёты</StaggerItem>
              <StaggerItem className="list-item">Подготовка материала</StaggerItem>
              <StaggerItem className="list-item">Формирование профиля</StaggerItem>
              <StaggerItem className="list-item">Соединение и герметизация швов</StaggerItem>
              <StaggerItem className="list-item">Изготовление фасонных элементов</StaggerItem>
              <StaggerItem className="list-item">Антикоррозийная обработка и отделка</StaggerItem>
              <StaggerItem className="list-item">Контроль качества</StaggerItem>
            </StaggerContainer>
          </div>

          {/* Текстовый блок */}
          <ScrollReveal y={20}>
            <div className="mb-12">
              <h2 className="font-bold text-lg mb-3">
                Автоматизация процесса производства круглых <br /> воздуховодов
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Автоматизация производства круглых воздуховодов — это переход на роботизированные линии, управляемые цифровыми программами. Всё начинается с автоматического проектирования (САПР), которое само рассчитывает параметры и создаёт чертежи. Затем материал режется и подготавливается на станках с ЧПУ без участия человека. Главный этап — формовка трубы на спирально-навивных или прямошовных автоматах, которые самостоятельно формируют шов, навивают спираль и отрезают готовые секции. Даже сложные элементы — отводы и тройники — вырезаются лазером и гнутся по цифровым шаблонам. В конце автоматика упаковывает и маркирует продукцию. Итог: скорость выше, качество стабильное, а человеческий фактор сведён к контролю и настройке.
              </p>
            </div>
          </ScrollReveal>

          {/* Дополнительное фото */}
          <ScrollReveal y={20}>
            <div className="mb-24">
              <h3 className="text-center font-extrabold text-xl sm:text-2xl mb-4">
                Заголовок для изображения отцентрирован по середине относительно изображения
              </h3>
              <img
                src={Photo1}
                className="w-full rounded-md shadow-sm"
                alt="Процесс производства"
              />
              <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                Примечание к фотографии или чертежу. Если картинка горизонтальная
              </p>
            </div>
          </ScrollReveal>

          {/* Блок с видео */}
          <ScrollReveal y={30}>
            <div className="mb-24">
              <h3 className="text-center font-extrabold text-xl sm:text-2xl mb-4">
                Заголовок для видео отцентрован по середине
              </h3>
              <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden aspect-video shadow-md bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/APaLfGApE8A?rel=0"
                  title="Baimir Laser Machine Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center sm:text-left">
                Если видео, отступы сверху и снизу 100пкс
              </p>
            </div>
          </ScrollReveal>

          {/* Текст с картинкой сбоку */}
          <ScrollReveal y={20}>
            <div className='flex flex-col md:flex-row items-start gap-5 mb-32 sm:mb-48'>
              <img src={Photo1} alt="" className='w-full md:w-1/3 object-cover rounded-md shadow-sm' />
              <p className='text-sm leading-relaxed text-gray-700 flex-1'>
                Автоматизация производства круглых воздуховодов — это переход на роботизированные линии, управляемые цифровыми программами. Всё начинается с автоматического проектирования (САПР), которое само рассчитывает параметры и создаёт чертежи. Затем материал режется и подготавливается на станках с ЧПУ без участия человека. Главный этап — формовка трубы на спирально-навивных или прямошовных автоматах, которые самостоятельно формируют шов, навивают спираль и отрезают готовые секции. Даже сложные элементы — отводы и тройники — вырезаются лазером и гнутся по цифровым шаблонам. В конце автоматика упаковывает и маркирует продукцию. Итог: скорость выше, качество стабильное, а человеческий фактор сведён к контролю и настройке.
                <br /><br />
                Даже сложные элементы — отводы и тройники — вырезаются лазером и гнутся по цифровым шаблонам. В конце автоматика упаковывает и маркирует продукцию. Итог: скорость выше, качество стабильное, а человеческий фактор сведён к контролю и настройке.
              </p>
            </div>
          </ScrollReveal>

          {/* Рекомендуемые товары */}
          <div className='mb-20'>
            <ScrollReveal>
              <h3 className="font-extrabold text-2xl mb-8 text-center md:text-left">
                Заголовок для видео отцентрован по середине
              </h3>
            </ScrollReveal>

            <div className='text-center'>
              <StaggerContainer className='flex flex-col sm:flex-row flex-wrap gap-5 mb-9 text-left justify-center md:justify-start'>
                {[1, 2, 3].map((item) => (
                  <StaggerItem key={item} className="w-full sm:w-auto flex-1 min-w-[280px]">
                    <ProductCard
                      image={PhotoStanok}
                      title='Лазерный станок для резки мет.листов А3-1500W Bodor'
                      code='10150570'
                      price='10 500 000'
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <ScrollReveal y={15}>
                <button className="w-full sm:w-1/3 bg-[#F05023] hover:bg-[#e4491f] font-semibold py-3 px-6 rounded-sm text-white transition-colors duration-300">
                  Перейти в каталог →
                </button>
              </ScrollReveal>
            </div>
          </div>

          {/* Форма заявки */}
          <ScrollReveal y={40} className="mt-24 max-w-[600px] mx-auto mb-32 sm:mb-48 px-4 sm:px-0">
            <h2 className="font-oswald text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-8 text-center text-gray-900">
              Оставьте заявку
            </h2>
            <Contact />
          </ScrollReveal>

        </section>
      </div>
    </PageContainer>
  )
}

export default TechnologiesPage