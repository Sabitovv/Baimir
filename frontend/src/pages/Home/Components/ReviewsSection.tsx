import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { NavigationOptions } from 'swiper/types'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import reviewImg from '@/assets/home/reviewImg.webp'
import 'swiper/css'
import 'swiper/css/navigation'
import ScrollReveal from '@/components/animations/ScrollReveal'

// 1. Импортируем хук из вашего API
import { useGetReviewsQuery } from '@/api/reviewsApi' 

const ReviewsSection = () => {
  const { t } = useTranslation()
  
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  // 2. Делаем запрос за отзывами
  const { data: reviews = [], isLoading, isError } = useGetReviewsQuery()

  // Если данные грузятся или произошла ошибка
  if (isLoading) {
    return <div className="py-24 text-center">Загрузка отзывов...</div>
  }

  if (isError || reviews.length === 0) {
    return null; 
  }

  return (
    <section className="py-16 md:py-20 xl:py-24 bg-[#F5F5F5] overflow-x-hidden">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px]">
        <ScrollReveal>
          <h2
            className="
              font-oswald font-semibold uppercase text-[#111111]
              text-3xl md:text-4xl xl:text-[54px]
              mb-10 md:mb-12 xl:mb-16
              tracking-tight
            "
          >
            {t('home.reviews.title')}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="relative">
            <button
              ref={prevRef}
              className="
                hidden xl:flex
                absolute -left-16 top-1/2 -translate-y-1/2
                w-12 h-12 rounded-full border border-gray-400
                items-center justify-center
                hover:bg-black hover:text-white
                transition z-50
              "
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </button>

            <Swiper
              modules={[Navigation]}
              navigation
              onBeforeInit={(swiper: SwiperType) => {
                const navigation = swiper.params.navigation as NavigationOptions
                navigation.prevEl = prevRef.current
                navigation.nextEl = nextRef.current
              }}
              spaceBetween={24}
              slidesPerView={1}
              loop={reviews.length > 1}
              onSwiper={(swiper) => {
                setTimeout(() => {
                  const navigation = swiper.params.navigation as NavigationOptions
                  if (prevRef.current && nextRef.current) {
                    navigation.prevEl = prevRef.current
                    navigation.nextEl = nextRef.current
                    swiper.navigation.destroy()
                    swiper.navigation.init()
                    swiper.navigation.update()
                  }
                })
              }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: reviews.length >= 2 ? 2 : reviews.length },
                1024: { slidesPerView: reviews.length >= 3 ? 3 : reviews.length }
              }}
            >
              {reviews.map((review) => (
                <SwiperSlide key={review.id}>
                  <div
                    className="
                      bg-white
                      p-6 md:p-8 xl:p-10
                      shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                      flex flex-col gap-6
                      h-full
                      min-h-[260px] md:min-h-[280px] xl:min-h-[300px]
                    "
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={review.imageUrl || reviewImg}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#111111] mb-1">
                          {review.authorName}
                        </h4>
                        {/* Выводим строку напрямую */}
                        <p className="text-gray-400 text-[11px]">
                          {review.authorDescription}
                        </p>
                      </div>
                    </div>

                    {/* Выводим строку напрямую */}
                    <p className="text-[#444444] text-sm leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={nextRef}
              className="
                hidden xl:flex
                absolute -right-16 top-1/2 -translate-y-1/2
                w-12 h-12 rounded-full border border-gray-400
                items-center justify-center
                hover:bg-black hover:text-white
                transition z-50
              "
            >
              <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default ReviewsSection