import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import 'swiper/css'
import ScrollReveal from '@/components/animations/ScrollReveal'
import { useGetCertificatesQuery } from '@/api/certificatesApi'
import PageContainer from '@/components/ui/PageContainer'

const CertificatesSection = () => {
  const { t } = useTranslation()
  const { data: certificates = [], isLoading, isError } = useGetCertificatesQuery()
  const [activeCertificate, setActiveCertificate] = useState<{
    imageUrl: string
    name?: string
    id: number
  } | null>(null)

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
          <h2 className="font-oswald font-bold uppercase text-[#111111] text-3xl md:text-4xl xl:text-5xl mb-10">
            {t('home.certificates.title')}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="relative">

            <button
              className="cert-prev hidden xl:flex absolute -left-16  top-1/2 -translate-y-1/2
                        w-12 h-12 rounded-full border border-gray-400 items-center justify-center
                        hover:bg-black hover:text-white transition z-20"
              aria-label="Previous"
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </button>

            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              loop={certificates.length > 1}
              navigation={{ prevEl: '.cert-prev', nextEl: '.cert-next' }}
              breakpoints={{
                320: { slidesPerView: 1 },
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
              className="cert-next hidden xl:flex absolute -right-16 md:-right-8 top-1/2 -translate-y-1/2
                        w-12 h-12 rounded-full border border-gray-400 items-center justify-center
                        hover:bg-black hover:text-white transition z-20"
              aria-label="Next"
            >
              <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
            </button>

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
            aria-label={activeCertificate?.name || 'Сертификат'}
            className={`relative w-full max-w-5xl max-h-[92vh] transform-gpu transition-all duration-300 ease-out ${
              activeCertificate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Закрыть"
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
