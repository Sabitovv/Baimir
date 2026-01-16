import { useTranslation } from 'react-i18next'
import bgMain from '@/assets/background_main.png'

const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="relative h-screen text-white">

      <img
        src={bgMain}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-20 flex flex-col justify-between h-full">

        <div
          className="
            absolute
            xl:top-[216px] xl:left-[245px]
            lg:top-[180px] lg:left-[120px]
            md:top-[160px] md:left-[64px]
            top-[120px] left-6
            max-w-[900px]
          "
        >
          <h1
            className="
              font-oswald uppercase leading-[1.05]
              xl:text-[82px]
              lg:text-[64px]
              md:text-[52px]
              text-[38px]
              font-600
            "
          >
            {t('hero.title')}
          </h1>

          <div
            className="
              flex flex-wrap items-center gap-4
              mt-6 md:mt-8
              text-gray-300 uppercase tracking-widest
              text-[11px] md:text-sm
              font-manrope font-600
            "
          >
            <span>{t('hero.tags.laser')}</span>
            <span className="text-gray-500">/</span>
            <span>{t('hero.tags.bending')}</span>
            <span className="text-gray-500">/</span>
            <span>{t('hero.tags.ventilation')}</span>
          </div>

          <button
            className="
              mt-8 md:mt-12
              bg-[#F05023] hover:bg-[#d1401b]
              px-8 md:px-10 py-3 md:py-4
              font-manrope font-700 uppercase tracking-widest
              transition
              text-xs md:text-sm
            "
          >
            {t('hero.buttons.catalog')}
          </button>
        </div>

        <div
          className="
            absolute
            bottom-8 md:bottom-12 xl:bottom-[80px]
            left-1/2 -translate-x-1/2
            w-full
            px-6
          "
        >
          <div
            className="
              flex flex-col lg:flex-row
              items-start lg:items-end
              justify-between
              gap-6
              px-6 md:px-[64px] lg:px-[120px] xl:px-[245px]
            "
          >
            <p
              className="
                max-w-[800px]
                text-white
                font-manrope font-400
                text-xs md:text-sm
                leading-7 md:leading-8
              "
            >
              {t('hero.description')}
            </p>

            <button
              className="
                flex items-center gap-4
                border border-[#F05023]
                px-6 py-3
                bg-black/30 hover:bg-[#F05023]
                transition group
                shrink-0
              "
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#F05023] group-hover:text-white transition"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
              </svg>

              <span
                className="
                  uppercase tracking-widest
                  font-oswald font-400
                  text-xs
                "
              >
                {t('hero.buttons.request')}
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero
