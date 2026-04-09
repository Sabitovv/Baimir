import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import photo from '@/assets/production/photo_stanok.webp'
import photo2 from '@/assets/production/photoStanok2.webp'
import photo3 from '@/assets/production/photoStanok3.webp'
import platformPlaceholder from '@/assets/production/platformPlaceholder.svg'
import one from '@/assets/demoZal/one.svg'
import two from '@/assets/demoZal/two.svg'
import three from '@/assets/demoZal/three.svg'
import four from '@/assets/demoZal/four.svg'
import Contact from '@/components/common/Contact'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { EditableImage } from '@/zustand/EditableImage'

type ProductionImageItem = {
  key: string
  src: string
}

const ProductionPage = () => {
  const { t } = useTranslation()
  const productionImages: ProductionImageItem[] = [
    { key: 'production_page_main_1', src: photo },
    { key: 'production_page_main_2', src: photo2 },
    { key: 'production_page_main_3', src: photo3 },
  ]

  const stepIcons: ProductionImageItem[] = [
    { key: 'production_page_step_icon_1', src: one },
    { key: 'production_page_step_icon_2', src: two },
    { key: 'production_page_step_icon_3', src: three },
    { key: 'production_page_step_icon_4', src: four },
  ]

  const platformLogos: ProductionImageItem[] = Array.from({ length: 6 }, (_, i) => ({
    key: `production_page_platform_logo_${i + 1}`,
    src: platformPlaceholder,
  }))

  const [choose, setChoose] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activePlatformLogo, setActivePlatformLogo] = useState<ProductionImageItem | null>(null)

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mt-6 sm:mt-8 md:mt-12">
        <aside className="hidden lg:block w-full">
          <CategoriesMenu />
        </aside>

        <main className="w-full min-w-0">

          <ScrollReveal>
            <section>
              <h1 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-[#F58322] leading-tight">
                {t('production.title')}
              </h1>
              <h3 className="text-lg sm:text-xl lg:text-2xl mt-2 font-bold font-oswald text-gray-800">
                {t('production.subTitle')}
              </h3>
              <p className="text-gray-600 mt-3 sm:mt-4 max-w-3xl font-light text-sm sm:text-base leading-relaxed">
                {t('production.text')}
              </p>
              <button className="mt-8 sm:mt-10 bg-[#F58322] w-full sm:w-auto px-8 py-3 text-white font-medium hover:bg-[#DB741F] transition-colors rounded-sm shadow-sm">
                {t('production.signUpDemo')}
              </button>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <section className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4 lg:gap-5">
              <EditableImage
                imageKey={productionImages[activeImageIndex].key}
                fallbackSrc={productionImages[activeImageIndex].src}
                className="w-full h-[260px] sm:h-[400px] lg:h-full object-cover rounded-lg shadow-sm transition-opacity duration-300"
                alt="production main"
              />
              <div className="grid grid-cols-3 lg:grid-cols-1 lg:grid-rows-3 gap-3 sm:gap-4 lg:gap-5">
                {productionImages.map((img, i) => {
                  const index = i + 1;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setChoose(index)
                        setActiveImageIndex(i)
                      }}
                      className={`cursor-pointer transition-all duration-300 rounded-lg p-1 ${choose === index
                        ? 'border-2 border-[#F58322] shadow-sm'
                        : 'border-2 border-transparent hover:border-gray-200'
                        }`}
                    >
                      <EditableImage
                        imageKey={img.key}
                        fallbackSrc={img.src}
                        className="w-full h-24 sm:h-32 lg:h-full object-cover rounded-md"
                        alt={`detail ${index}`}
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal y={20}>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-gray-500 font-light leading-relaxed">
              {t('production.textUnderPhoto')}
            </p>
          </ScrollReveal>

          <section className="mt-16 sm:mt-20">
            <ScrollReveal>
              <h2 className="text-xl sm:text-2xl uppercase font-extrabold mb-5 sm:mb-6 text-gray-900">
                {t('production.youGet.title')}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="space-y-3 sm:space-y-4 text-gray-700 list-disc pl-5 font-light text-sm sm:text-base leading-relaxed">
              <StaggerItem className="list-item">
                <b className="font-bold text-gray-900">{t('production.youGet.speed.textB')}</b>{' '}
                {t('production.youGet.speed.text')}
              </StaggerItem>
              <StaggerItem className="list-item">
                <b className="font-bold text-gray-900">{t('production.youGet.quality.textB')}</b>{' '}
                {t('production.youGet.quality.text')}
              </StaggerItem>
              <StaggerItem className="list-item">
                <b className="font-bold text-gray-900">{t('production.youGet.employees.textB')}</b>{' '}
                {t('production.youGet.employees.text')}
              </StaggerItem>
            </StaggerContainer>
          </section>

          <section className="mt-20 sm:mt-24 mb-16 sm:mb-20 px-2 sm:px-0">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#F58322] uppercase mb-8 sm:mb-10 text-center sm:text-left">
                {t('production.howItWork.title')}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="flex flex-col">
              {stepIcons.map((icon, i) => {
                const steps = ['step1', 'step2', 'step3', 'step4']
                const stepKey = steps[i]
                const isLast = i === 3

                return (
                  <StaggerItem
                    key={i}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 ${!isLast ? 'border-b border-gray-200' : ''
                      }`}
                  >
                    <EditableImage
                      imageKey={icon.key}
                      fallbackSrc={icon.src}
                      className="w-12 sm:w-14 md:w-16 flex-shrink-0"
                      alt={`step ${i + 1}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-lg sm:text-xl text-gray-900">
                        {t(`production.howItWork.${stepKey}.title`)}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {t(`production.howItWork.${stepKey}.text`)}
                      </p>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </section>

          <section className="mt-16 sm:mt-20 mb-16 sm:mb-24">
            <ScrollReveal>
              <h2 className="text-xl sm:text-2xl uppercase font-extrabold mb-6 sm:mb-8 text-gray-900">
                {t('production.benefits.title')}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {['risk', 'training', 'process'].map((item, i) => (
                <StaggerItem key={i} className="p-6 sm:p-8 bg-gray-50 rounded-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-[#F58322] font-bold text-lg mb-3 sm:mb-4">
                    {t(`production.benefits.${item}.title`)}
                  </p>
                  <p className="font-light text-sm sm:text-base text-gray-700 leading-relaxed">
                    {t(`production.benefits.${item}.text`)}
                  </p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

        </main>
      </div>

      <section className="mt-20 sm:mt-28 border-t border-gray-200 pt-16 sm:pt-20">
        <ScrollReveal>
          <h2 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-[#F58322] mb-4 sm:mb-6 text-center lg:text-left">
            {t('production.platformsTitle')}
          </h2>
          <p className="mb-10 sm:mb-12 font-bold text-base sm:text-lg lg:text-xl text-gray-800 text-center lg:text-left max-w-4xl">
            {t('production.platformsText')}
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {platformLogos.map((logo, i) => (
            <StaggerItem key={i} className="flex flex-col group">
              <div
                className="p-6 sm:p-8 mb-4 bg-gray-50 group-hover:bg-gray-100 transition-colors rounded-sm flex items-center justify-center aspect-square border border-gray-100 cursor-zoom-in"
                onClick={(e) => {
                  if (e.shiftKey) return
                  setActivePlatformLogo(logo)
                }}
              >
                <EditableImage
                  imageKey={logo.key}
                  fallbackSrc={logo.src}
                  alt={`platform logo ${i + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-medium text-gray-800 text-sm">{t('production.platformCard.type')}</p>
              <p className="font-light text-xs sm:text-sm text-gray-500 mt-1 mb-6 sm:mb-8">{t('production.platformCard.region')}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {activePlatformLogo && (
          <div
            className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-8 flex items-center justify-center"
            onClick={() => setActivePlatformLogo(null)}
          >
            <div
              className="relative bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActivePlatformLogo(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close image preview"
              >
                ×
              </button>
              <EditableImage
                imageKey={activePlatformLogo.key}
                fallbackSrc={activePlatformLogo.src}
                alt="platform logo preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </section>

      <ScrollReveal y={40} className="my-20 sm:my-28 px-4">
        <section>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-oswald font-semibold mb-8 sm:mb-12 text-center uppercase text-gray-900">
            {t('production.contact')}
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-xl lg:max-w-2xl">
              <Contact />
            </div>
          </div>
        </section>
      </ScrollReveal>

    </PageContainer>
  )
}

export default ProductionPage