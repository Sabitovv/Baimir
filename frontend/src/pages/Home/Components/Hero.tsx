import { useTranslation } from 'react-i18next'
import bgMain from '@/assets/home/background_main.webp'
import ScrollReveal from '@/components/animations/ScrollReveal'
import { Link } from 'react-router-dom'
import PageContainer from '@/components/ui/PageContainer'
import { EditableImage } from '@/zustand/EditableImage'

const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="relative flex min-h-[100dvh] flex-col text-white">
      <EditableImage
        imageKey="home_hero_background"
        fallbackSrc={bgMain}
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-black/75" />

      <div className="relative z-20 flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col">
          <div
            className="
              flex flex-1 flex-col justify-start
              pb-10 pt-28
              md:justify-between md:gap-0 md:pb-12 md:pt-[160px]
              lg:pt-[160px] 
              xl:pb-[80px] xl:pt-[216px]
            "
          >
            <div className="w-full max-w-[560px]">
              <ScrollReveal delay={0.1}>
                <h1
                  className="
                    font-manrope text-[35px] font-semibold uppercase leading-[1.06]
                    md:text-[52px]
                    lg:text-[64px]
                    xl:text-[82px]
                  "
                >
                  {t('hero.title')}
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="hidden md:block">
                <div
                  className="
                    mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px]
                    font-semibold uppercase tracking-widest text-gray-300
                    md:mt-6 md:gap-4 md:text-sm
                  "
                >
                  <span>{t('hero.tags.laser')}</span>
                  <span className="text-gray-500">/</span>
                  <span>{t('hero.tags.bending')}</span>
                  <span className="text-gray-500">/</span>
                  <span>{t('hero.tags.ventilation')}</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <Link to="/catalog">
                  <button
                    className="
                      mt-10 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#F58322] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition
                      hover:bg-[#DB741F] hover:shadow-lg hover:shadow-[#F05023]/20
                      md:mt-10 md:px-10 md:py-4 md:text-sm
                    "
                  >
                    {t('hero.buttons.catalog')}
                  </button>
                </Link>
              </ScrollReveal>

            </div>

            <div className="w-full pt-40 md:mt-auto md:pt-12">
              <ScrollReveal delay={0.5}>
                <div
                  className="
                    flex flex-col items-start justify-between gap-4
                    lg:flex-row lg:items-end
                  "
                >
                  <p
                    className="
                      w-full max-w-[38ch] text-[15px] font-medium leading-[1.55] text-white md:max-w-none
                      md:text-sm md:leading-8
                      lg:max-w-none
                    "
                  >
                    {t('hero.description')}
                  </p>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const contactSection = document.getElementById('contact-section')
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    className="
                      group hidden min-h-11 shrink-0 items-center gap-3 rounded-sm border border-[#F58322] bg-black/30 px-5 py-3
                      font-manrope transition hover:bg-[#DB741F]
                      md:inline-flex
                    "
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[#F58322] transition group-hover:text-white"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M15 3h6v6" />
                      <path d="M10 14L21 3" />
                    </svg>

                    <span className="font-manrope text-xs font-normal uppercase tracking-widest">
                      {t('hero.buttons.request')}
                    </span>
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </PageContainer>
      </div>
    </section>
  )
}

export default Hero
