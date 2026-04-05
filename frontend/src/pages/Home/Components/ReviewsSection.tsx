import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { NavigationOptions } from 'swiper/types'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import 'swiper/css'
import 'swiper/css/navigation'
import ScrollReveal from '@/components/animations/ScrollReveal'
import PageContainer from '@/components/ui/PageContainer'

import { useGetReviewsQuery } from '@/api/reviewsApi' 

const formatReviewDate = (iso?: string, lang?: string) => {
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''

  const locale = lang === 'en' ? 'en-US' : lang === 'kk' || lang === 'kz' ? 'kk-KZ' : 'ru-RU'
  return parsed.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getSourceLabel = (profileUrl?: string, fallbackLabel = '2GIS', genericLabel = 'Source') => {
  if (!profileUrl) return fallbackLabel

  try {
    const host = new URL(profileUrl).hostname.replace('www.', '').toLowerCase()
    if (host.includes('2gis')) return '2GIS'
    if (host.includes('google')) return 'Google'
    if (host.includes('yandex')) return 'Yandex'
    return host.split('.')[0]?.toUpperCase() || genericLabel
  } catch {
    return fallbackLabel
  }
}

const getInitial = (name?: string) => {
  if (!name) return 'B'
  const trimmed = name.trim()
  if (!trimmed) return 'B'
  return trimmed[0].toUpperCase()
}

type ReviewsSectionProps = {
  onOpenReviewModal?: () => void
}

const ReviewsSection = ({ onOpenReviewModal }: ReviewsSectionProps) => {
  const { t, i18n } = useTranslation()
  
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  const { data: reviews = [], isLoading, isError } = useGetReviewsQuery()


  if (isLoading) {
    return <div className="py-24 text-center text-[#4B5563]">{t('home.reviews.loading', { defaultValue: 'Загрузка отзывов...' })}</div>
  }

  if (isError || reviews.length === 0) {
    return null; 
  }

  return (
    <section className="py-16 md:py-20 xl:py-24 bg-[#F5F5F5] overflow-x-hidden">
      <PageContainer>
        <ScrollReveal>
          <h2
            className="
              font-oswald font-semibold text-center 
              text-3xl md:text-4xl xl:text-[54px]
              mb-10 md:mb-12 xl:mb-16
              tracking-tight leading-none
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
                hidden md:flex
                absolute -left-6 xl:-left-16 top-1/2 -translate-y-1/2
                w-12 h-12 rounded-full border-2 border-[#6B7280] bg-white/90
                items-center justify-center
                text-[#374151] hover:bg-[#0B5FA1] hover:text-white hover:border-[#0B5FA1]
                transition z-50 shadow-sm
              "
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
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
                1024: { slidesPerView: reviews.length >= 3 ? 3 : reviews.length },
                1440: { slidesPerView: reviews.length >= 4 ? 4 : reviews.length },
              }}
            >
              {reviews.map((review) => (
                <SwiperSlide key={review.id}>
                  {(() => {
                    const profileLink = review.profileUrl || review.profileLink

                    return (
                  <div
                    className="
                      bg-white
                      p-5 md:p-6
                      border border-[#E5E7EB] rounded-2xl
                      shadow-[0_8px_24px_rgba(16,24,40,0.04)]
                      flex flex-col gap-6
                      h-full
                      min-h-[270px] md:min-h-[300px] xl:min-h-[320px]
                    "
                  >
                    <div className="flex items-start gap-3">
                      {review.imageUrl ? (
                        <img
                          src={review.imageUrl}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-oswald text-xl">
                          {getInitial(review.authorName)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-manrope font-semibold text-[17px] leading-tight text-[#111827] mb-1 truncate">
                          {review.authorName}
                        </h4>

                        <div className="flex items-center gap-0.5 mb-1.5">
                          {Array.from({ length: 5 }, (_, index) => {
                            const filled = index < Math.max(0, Math.min(5, Math.round(review.rating || 0)))
                            return filled ? (
                              <StarRoundedIcon key={index} sx={{ fontSize: 16, color: '#F59E0B' }} />
                            ) : (
                              <StarBorderRoundedIcon key={index} sx={{ fontSize: 16, color: '#D1D5DB' }} />
                            )
                          })}
                        </div>

                        {review.authorDescription && (
                          <p className="text-[#6B7280] text-[12px] leading-tight truncate">
                            {review.authorDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-[#374151] text-[14px] leading-relaxed line-clamp-5 flex-1">
                      {review.text}
                    </p>

                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-3 text-[12px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[#9CA3AF] whitespace-nowrap">
                          {formatReviewDate(review.reviewDate || review.createdAt, i18n.language)}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-[#E8F6EF] text-[#047857] font-semibold whitespace-nowrap">
                          {getSourceLabel(profileLink, '2GIS', t('home.reviews.sourceGeneric', { defaultValue: 'Источник' }))}
                        </span>
                      </div>

                      {profileLink && (
                        <a
                          href={profileLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#F59E0B] hover:text-[#DB741F] font-semibold whitespace-nowrap"
                        >
                          {t('home.reviews.source', { defaultValue: 'Источник' })}
                          <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                        </a>
                      )}
                    </div>
                  </div>
                    )
                  })()}
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={nextRef}
              className="
                hidden md:flex
                absolute -right-6 xl:-right-16 top-1/2 -translate-y-1/2
                w-12 h-12 rounded-full border-2 border-[#6B7280] bg-white/90
                items-center justify-center
                text-[#374151] hover:bg-[#0B5FA1] hover:text-white hover:border-[#0B5FA1]
                transition z-50 shadow-sm
              "
            >
              <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </ScrollReveal>
        <ScrollReveal className='flex justify-end'>
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="
              mt-8 md:mt-12
              bg-[#F58322] hover:bg-[#DB741F]
              px-8 md:px-10 py-3 md:py-4
              font-bold uppercase tracking-widest
              transition
              text-xs md:text-sm
              hover:shadow-lg hover:shadow-[#F05023]/20
              text-white
            "
          >
            {t('home.reviews.leaveReview', { defaultValue: 'Оставить отзыв' })}
          </button>
        </ScrollReveal>
      </PageContainer>
    </section>
  )
}

export default ReviewsSection
