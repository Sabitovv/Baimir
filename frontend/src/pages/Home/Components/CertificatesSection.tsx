import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import 'swiper/css'
import 'swiper/css/pagination'
import ScrollReveal from '@/components/animations/ScrollReveal'
import { useGetCertificatesQuery } from '@/api/certificatesApi'
import PageContainer from '@/components/ui/PageContainer'

const CertificatesSection = () => {
  const { t } = useTranslation()
  const { data: certificates = [], isLoading, isError } = useGetCertificatesQuery()
  const swiperRef = useRef<SwiperType | null>(null)
  const [activeCertificate, setActiveCertificate] = useState<{
    imageUrl: string
    name?: string
    id: number
  } | null>(null)
  const canNavigate = certificates.length > 1

  const stopAutoplay = () => {
    swiperRef.current?.autoplay?.stop()
  }

  useEffect(() => {
    if (!activeCertificate) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCertificate(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeCertificate])

  if (isError || (!isLoading && certificates.length === 0)) {
    return null
  }

  return (
    <section className="py-16 md:py-20 bg-white overflow-x-hidden">
      <PageContainer>

        <ScrollReveal>
          <h2 className="font-manrope font-bold uppercase text-[#111111] text-3xl md:text-4xl xl:text-5xl mb-10">
            {t('home.certificates.title')}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="relative">

            <button
              type="button"
              onClick={() => {
                stopAutoplay()
                swiperRef.current?.slidePrev()
              }}
              disabled={!canNavigate}
              className="hidden md:flex absolute -left-6 xl:-left-16 top-1/2 -translate-y-1/2
                        w-12 h-12 rounded-full border border-gray-400 items-center justify-center
                        hover:bg-black hover:text-white transition z-20
                        disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-inherit"
              aria-label="Previous"
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </button>

            <Swiper
              key={`certificates-${certificates.length}`}
              modules={[Autoplay, Pagination]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
                if (canNavigate) {
                  swiper.autoplay.start()
                }
              }}
              autoplay={
                canNavigate
                  ? {
                    delay: 3200,
                    disableOnInteraction: true,
                    pauseOnMouseEnter: true,
                  }
                  : false
              }
              onTouchStart={stopAutoplay}
              spaceBetween={24}
              loop={canNavigate}
              pagination={canNavigate ? { clickable: true } : false}
              className="[&_.swiper-pagination]:!relative [&_.swiper-pagination]:!mt-4 [&_.swiper-pagination-bullet]:bg-[#9CA3AF] [&_.swiper-pagination-bullet-active]:bg-[#F58322]"
              breakpoints={{
                320: { slidesPerView: 1.12, spaceBetween: 12 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
            >
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-white shadow-sm p-4 h-[250px] animate-pulse" />
                </SwiperSlide>
                  ))
                : certificates.map((certificate) => (
                <SwiperSlide key={certificate.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCertificate(certificate)}
                    className="bg-white shadow-sm p-4 flex items-center justify-center h-[250px] cursor-zoom-in"
                    aria-label={certificate.name || `certificate-${certificate.id}`}
                  >
                    <img
                      src={certificate.imageUrl}
                      alt={certificate.name || `certificate-${certificate.id}`}
                      className="max-h-[220px] object-contain mx-auto"
                      loading="lazy"
                    />
                  </button>
                </SwiperSlide>
                  ))}
            </Swiper>

            <button
              type="button"
              onClick={() => {
                stopAutoplay()
                swiperRef.current?.slideNext()
              }}
              disabled={!canNavigate}
              className="hidden md:flex absolute -right-6 xl:-right-16 top-1/2 -translate-y-1/2
                        w-12 h-12 rounded-full border border-gray-400 items-center justify-center
                        hover:bg-black hover:text-white transition z-20
                        disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-inherit"
              aria-label="Next"
            >
              <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
            </button>

            {canNavigate && (
              <div className="mt-3 flex items-center justify-center gap-3 md:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      stopAutoplay()
                      swiperRef.current?.slidePrev()
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#9CA3AF] bg-white text-[#374151] transition hover:bg-black hover:text-white"
                    aria-label="Previous"
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopAutoplay()
                      swiperRef.current?.slideNext()
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#9CA3AF] bg-white text-[#374151] transition hover:bg-black hover:text-white"
                    aria-label="Next"
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                  </button>
              </div>
            )}

          </div>
        </ScrollReveal>
      </PageContainer>

      <div
        className={`fixed inset-0 z-[130] transition-opacity duration-300 ease-out ${
          activeCertificate ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!activeCertificate}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            activeCertificate ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setActiveCertificate(null)}
        />

        <div className="absolute inset-0 p-3 md:p-6 flex items-center justify-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeCertificate?.name || t('home.certificates.title')}
            className={`relative w-full max-w-5xl max-h-[92vh] transform-gpu transition-all duration-300 ease-out ${
              activeCertificate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={() => setActiveCertificate(null)}
              className="absolute right-2 top-2 z-10 w-8 h-7 md:w-10 md:h-10 rounded-full bg-white text-[#111111] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition"
            >
              x
            </button>

            {activeCertificate && (
              <div className="bg-white rounded-xl p-8 md:p-10 shadow-xl">
                <img
                  src={activeCertificate.imageUrl}
                  alt={activeCertificate.name || `certificate-${activeCertificate.id}`}
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CertificatesSection
