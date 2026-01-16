import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import 'swiper/css'

import cert1 from '@/assets/image 137.png'
import cert2 from '@/assets/image 139.png'
import cert3 from '@/assets/image 140.png'

const CertificatesSection = () => {
  const { t } = useTranslation()

  const certificates = [cert1, cert2, cert3]
  const slides = [...certificates, ...certificates]

  return (
    <section className="py-16 md:py-20 bg-white overflow-x-hidden">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px]">

        <h2 className="font-oswald font-bold uppercase text-[#111111] text-3xl md:text-4xl xl:text-5xl mb-10">
          {t('home.certificates.title')}
        </h2>

        <div className="relative">

          <button
            className="cert-prev hidden xl:flex absolute -left-16 top-1/2 -translate-y-1/2
                      w-12 h-12 rounded-full border border-gray-400 items-center justify-center
                      hover:bg-black hover:text-white transition z-20"
            aria-label="Previous"
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
          </button>

          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            loop
            navigation={{ prevEl: '.cert-prev', nextEl: '.cert-next' }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
          >
            {slides.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="bg-white shadow-sm p-4 flex items-center justify-center">
                  <img
                    src={img}
                    alt={t('home.certificates.itemAlt') || `certificate-${i}`}
                    className="max-h-[220px] object-contain mx-auto"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className="cert-next hidden xl:flex absolute -right-16 top-1/2 -translate-y-1/2
                      w-12 h-12 rounded-full border border-gray-400 items-center justify-center
                      hover:bg-black hover:text-white transition z-20"
            aria-label="Next"
          >
            <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
          </button>

        </div>
      </div>
    </section>
  )
}

export default CertificatesSection
