import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import { useTranslation } from 'react-i18next'
// import { useRef } from 'react'
import one from '@/assets/demoZal/one.svg'
import two from '@/assets/demoZal/two.svg'
import three from '@/assets/demoZal/three.svg'
import four from '@/assets/demoZal/four.svg'
import five from '@/assets/demoZal/five.svg'
import Contact from '@/components/common/Contact'

// Импорты компонентов анимации
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const DemoPage = () => {
  const { t } = useTranslation()
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [playing, setPlaying] = useState(false);

  // const handlePlay = () => {
  //   videoRef.current?.play();
  //   setPlaying(true);
  // };

  return (
    <PageContainer>
      {/* ГЛАВНАЯ СЕТКА */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mt-6 sm:mt-8 md:mt-12">

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-full">
          <CategoriesMenu />
        </aside>

        {/* CONTENT */}
        <main className="w-full min-w-0"> {/* Изменил <section> на <main> с min-w-0 для защиты сетки */}

          {/* HERO */}
          <section>
            <ScrollReveal>
              <h1 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-[#F05023] leading-tight">
                {t('demo.title')}
              </h1>

              <h3 className="font-oswald text-lg sm:text-xl lg:text-2xl font-bold mt-2 sm:mt-3 mb-4 sm:mb-6 whitespace-pre-line text-gray-900">
                {t('demo.subTitle')}
              </h3>

              <p className="text-gray-600 max-w-3xl mb-8 sm:mb-10 text-sm sm:text-base leading-relaxed">
                {t('demo.text')}
              </p>
            </ScrollReveal>

            {/* VIDEO */}
            <ScrollReveal delay={0.2}>
              <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden aspect-video shadow-md bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/APaLfGApE8A?rel=0"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-3 font-light text-center sm:text-left">
                {t('demo.videoSubText')}
              </p>
            </ScrollReveal>
          </section>

          {/* WHY */}
          <section className="max-w-3xl my-16 sm:my-20 lg:my-24">
            <ScrollReveal>
              <h3 className="font-extrabold text-xl sm:text-2xl lg:text-3xl mb-6 text-gray-900">
                {t('demo.why')}
              </h3>
            </ScrollReveal>

            <StaggerContainer className="text-sm sm:text-base space-y-3 sm:space-y-4 text-gray-700">
              {[1, 2, 3, 4].map((n) => (
                <StaggerItem key={n} className="leading-relaxed flex items-start">
                  <span className="text-[#F05023] font-bold mr-2">•</span>
                  <span>
                    <span className="font-bold text-gray-900">
                      {t(`demo.whymain${n}`)}
                    </span>{' '}
                    {t(`demo.whytext${n}`)}
                  </span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* HOW IT WORKS */}
          <section className="max-w-4xl mx-auto mb-20 sm:mb-28">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F05023] uppercase mb-8 sm:mb-10 text-center sm:text-left">
                {t("demo.work")}
              </h2>
            </ScrollReveal>

            <StaggerContainer className="flex flex-col">
              {[one, two, three, four, five].map((icon, i) => {
                const isLast = i === 4;

                return (
                  <StaggerItem
                    key={i}
                    className={`flex items-start sm:items-center gap-4 sm:gap-6 py-6 sm:py-8 ${!isLast ? 'border-b border-gray-200' : ''
                      }`}
                  >
                    <img
                      src={icon}
                      className="w-12 sm:w-14 md:w-16 flex-shrink-0"
                      alt={`step ${i + 1}`}
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-base sm:text-lg lg:text-xl text-gray-900">
                        {t(`demo.workmain${i + 1}`)}
                      </h4>

                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {t(`demo.worktext${i + 1}`)}
                      </p>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </section>

          {/* FORM */}
          <ScrollReveal y={40} className="mb-20 sm:mb-32 lg:mb-40 px-2 sm:px-0">
            <section>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-semibold mb-8 sm:mb-10 text-center sm:text-left text-gray-900 uppercase">
                Записаться в демозал
              </h2>

              <div className="max-w-xl mx-auto sm:mx-0">
                <Contact />
              </div>
            </section>
          </ScrollReveal>

        </main>
      </div>
    </PageContainer>
  )
}

export default DemoPage