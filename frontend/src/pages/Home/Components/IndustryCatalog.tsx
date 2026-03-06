import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import PageContainer from '@/components/ui/PageContainer'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { useGetCategoriesTreeQuery } from '@/api/categoriesApi'
import { Link } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/pagination'

const IndustryCatalog = () => {
  const { t } = useTranslation()
  const { i18n } = useTranslation()

  const { data } = useGetCategoriesTreeQuery({lang: i18n.language})
  const cards = data
  ? [
      { title: data[0].name, image: data[0].imageUrl, path: "catalog/metalworking?categoryId=19"},
      { title: data[1].name, image: data[1].imageUrl, path: "catalog/metalworking?categoryId=8"},
      { title: data[2].name, image: data[2].imageUrl, path: "catalog/metalworking?categoryId=20"},
      { title: data[3].name, image: data[3].imageUrl, path: "catalog/metalworking?categoryId=21"}
    ]
  : []

  return (
    <section className="py-16 md:py-20 bg-white">
      <PageContainer>

        <ScrollReveal>
          <div className="mb-8 md:mb-10">
            <h1 className="font-oswald font-semibold uppercase text-[#111111] text-4xl md:text-5xl xl:text-6xl">
              {t('home.catalog.title')}
            </h1>

            <p className="text-gray-500 mt-2
                          text-lg md:text-xl xl:text-2xl">
              {t('home.catalog.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="md:hidden">
          <Swiper
            modules={[Pagination]}
            slidesPerView={1.08}
            spaceBetween={14}
            pagination={{ clickable: true }}
            className="pb-10 [&_.swiper-pagination-bullet]:bg-[#B0B0B0] [&_.swiper-pagination-bullet-active]:bg-[#F58322]"
          >
            {cards.map((card, index) => (
              <SwiperSlide key={index} className="h-auto">
                <div className="flex flex-col h-full">
                  <div className="bg-[#F9F9F9] p-6 flex flex-col items-center min-h-[360px] group">
                    <Link
                      to={card.path}
                      className="font-oswald font-bold uppercase text-center text-base group-hover:text-[#DB741F] mb-4"
                    >
                      {card.title}
                    </Link>

                    <div className="flex-grow flex items-center justify-center w-full">
                      <img
                        src={card.image}
                        className="max-h-40 object-contain"
                        alt={card.title}
                      />
                    </div>
                  </div>

                  <Link
                    to={card.path}
                    className="text-[#F58322] text-xs font-bold uppercase tracking-widest self-end mt-3 hover:underline"
                  >
                    {t('home.catalog.link')} &gt;
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden md:block">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <StaggerItem key={index} className="flex flex-col">

                <div
                  className="
                    bg-[#F9F9F9]
                    p-6 md:p-8
                    flex flex-col items-center
                    min-h-[380px] md:min-h-[420px] xl:min-h-[450px]
                    hover:shadow-lg transition-shadow
                    group
                  "
                >
                  <Link
                    to={card.path}
                    className="
                      font-oswald font-bold uppercase text-center
                      text-base md:text-lg
                      group-hover:text-[#DB741F]
                      mb-4
                    "
                  >
                    {card.title}
                  </Link>

                  <div className="flex-grow flex items-center justify-center">
                    <img
                      src={card.image}
                      className="max-h-40 md:max-h-44 xl:max-h-48 object-contain"
                      alt={card.title}
                    />
                  </div>
                </div>

                <Link
                  to={card.path}
                  className="
                    text-[#F58322]
                    text-xs
                    font-bold uppercase tracking-widest
                    self-end mt-3
                    hover:underline
                  "
                >
                  {t('home.catalog.link')} &gt;
                </Link>

              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

      </PageContainer>
    </section>
  )
}

export default IndustryCatalog
