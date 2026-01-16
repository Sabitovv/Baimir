import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import reviewImg from '@/assets/reviewImg.png'
import 'swiper/css'

type ReviewItem = {
  name: string
  location: string
  textKey: string
}

const ReviewsSection = () => {
  const { t } = useTranslation()

  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  const reviews: ReviewItem[] = [
    { name: 'Иванов Роберт', location: 'Warsaw, Poland', textKey: 'home.reviews.items.1' },
    { name: 'Малика', location: 'Shanxi, China', textKey: 'home.reviews.items.2' },
    { name: 'Ким Женя', location: 'Seoul, South Korea', textKey: 'home.reviews.items.3' },
    { name: 'Анна Смит', location: 'London, UK', textKey: 'home.reviews.items.4' }
  ]

  return (
    <section className="py-16 md:py-20 xl:py-24 bg-[#F5F5F5] overflow-x-hidden">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px]">

        {/* TITLE */}
        <h2
          className="
            font-oswald font-bold uppercase text-[#111111]
            text-3xl md:text-4xl xl:text-[54px]
            mb-10 md:mb-12 xl:mb-16
            tracking-tight
          "
        >
          {t('home.reviews.title')}
        </h2>

        <div className="relative">

          {/* PREV */}
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

          {/* SLIDER */}
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            loop
            onSwiper={(swiper) => {
              setTimeout(() => {
                if (
                  prevRef.current &&
                  nextRef.current &&
                  swiper.params.navigation
                ) {
                  swiper.params.navigation.prevEl = prevRef.current
                  swiper.params.navigation.nextEl = nextRef.current
                
                  swiper.navigation.destroy()
                  swiper.navigation.init()
                  swiper.navigation.update()
                }
              })
            }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
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
                      src={reviewImg}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#111111] font-manrope mb-1">
                        {review.name}
                      </h4>
                      <p className="text-gray-400 text-[11px] font-manrope">
                        {review.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-[#444444] text-sm leading-relaxed font-manrope">
                    {t(review.textKey)}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* NEXT */}
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
      </div>
    </section>
  )
}

export default ReviewsSection
