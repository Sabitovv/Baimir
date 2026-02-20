import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import Card from '@/components/common/CategoryCard'

import teamPhoto from '@/assets/service/groupImg.webp'
import real2 from '@/assets/service/TwoImg.webp'

import { useTranslation } from 'react-i18next'

// Импорты компонентов анимации (убедитесь, что пути правильные)
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const ServicePage = () => {
  const { t } = useTranslation()

  const services = [
    t('service.services.items.setup'),
    t('service.services.items.repair'),
    t('service.services.items.maintenance'),
    t('service.services.items.training'),
    t('service.services.items.materials'),
    t('service.services.items.parts')
  ]

  return (
    <PageContainer>
      {/* Главная сетка: 
        Мобилки - 1 колонка. 
        ПК (lg) - 2 колонки (Сайдбар 280px + Контент) 
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mt-6 sm:mt-8 md:mt-12">

        <aside className="hidden lg:block w-full">
          <CategoriesMenu />
        </aside>

        <main className="w-full min-w-0"> {/* min-w-0 предотвращает вылезание контента за пределы сетки */}

          <ScrollReveal>
            <section>
              <h1 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-[#EA571E] leading-tight">
                {t('service.title')}
              </h1>
              <h3 className="text-base sm:text-lg lg:text-xl mt-2 font-bold font-oswald text-gray-800">
                {t('service.subTitle')}
              </h3>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <section className="mt-4 sm:mt-6">
              <img
                src={teamPhoto}
                className="w-full h-auto aspect-video sm:aspect-auto object-cover rounded-sm"
                alt="service team"
              />
              <p className="text-sm text-gray-500 mt-2 sm:mt-3 leading-relaxed">
                {t('service.team.imageText')}
              </p>
            </section>
          </ScrollReveal>

          <section className="mt-12 sm:mt-16 lg:mt-20">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase text-[#EA571E] mb-6 sm:mb-8">
                {t('service.services.title')}
              </h2>
            </ScrollReveal>

            {/* Сетка услуг: 1 кол. на мобилках, 2 на планшетах, 3 на широких экранах (xl) */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {services.map((item, i) => (
                <StaggerItem
                  key={i}
                  className="flex items-center justify-center text-[#EA571E] bg-white p-6 sm:py-8 md:py-10 text-center font-bold hover:shadow-lg transition-shadow duration-300 cursor-pointer text-lg sm:text-xl rounded-sm border border-gray-100"
                >
                  {item}
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <section className="mt-16 sm:mt-20 lg:mt-24">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl font-semibold uppercase mb-6 sm:mb-8 text-gray-900">
                {t('service.why.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 sm:gap-8 items-start">
                <img
                  src={teamPhoto}
                  className="w-full max-w-[320px] mx-auto md:mx-0 object-cover rounded-sm"
                  alt="work"
                />
                <p className="text-base text-gray-700 leading-relaxed">
                  {t('service.why.text1')}
                  <br /><br />
                  {t('service.why.text2')}
                </p>
              </div>
            </ScrollReveal>
          </section>

          {/* Секция с инженерами */}
          <section className="mt-16 sm:mt-24 -mx-4 sm:-mx-8 lg:-mx-[calc(50vw-50%)] px-4 sm:px-8 lg:px-[calc(50vw-50%)] py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(250px,400px)] gap-10 sm:gap-12 lg:gap-16 items-center">
              <div>
                <ScrollReveal>
                  <h2 className="font-oswald text-xl sm:text-2xl font-semibold uppercase mb-8 sm:mb-10 text-gray-900">
                    {t('service.engineers.title')}
                  </h2>
                </ScrollReveal>

                <StaggerContainer className="space-y-6 sm:space-y-8">
                  {['certification', 'experience', 'coverage', 'speed'].map((item, i) => (
                    <StaggerItem key={i}>
                      <p className="text-[#EA571E] font-bold text-lg mb-1 sm:mb-2">
                        {t(`service.engineers.${item}.title`)}
                      </p>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {t(`service.engineers.${item}.text`)}
                      </p>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>

              <ScrollReveal className="flex justify-center lg:justify-end order-first lg:order-last">
                <img
                  src={real2}
                  className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-full object-contain"
                  alt="engineers"
                />
              </ScrollReveal>
            </div>
          </section>

          <section className="mt-16 sm:mt-24 max-w-5xl">
            <ScrollReveal>
              <h2 className="font-oswald text-2xl sm:text-3xl font-semibold uppercase text-gray-900">
                {t('service.realObjects.title')}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mb-8 sm:mb-10">
                {t('service.realObjects.text')}
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              <StaggerItem>
                <Card title={t('service.realObjects.cardTitle')} image={teamPhoto} />
              </StaggerItem>
              <StaggerItem>
                <Card title={t('service.realObjects.cardTitle')} image={teamPhoto} />
              </StaggerItem>
              <StaggerItem>
                <Card title={t('service.realObjects.cardTitle')} image={teamPhoto} />
              </StaggerItem>
            </StaggerContainer>
          </section>

          <ScrollReveal y={40} className="mt-20 mb-16 sm:mt-28 sm:mb-20">
            <section>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-oswald font-semibold mb-8 sm:mb-10 uppercase text-center md:text-left text-gray-900">
                {t('service.contact.title')}
              </h2>
              <div className="flex justify-center md:justify-start w-full">
                <div className="w-full max-w-xl lg:max-w-2xl">
                  <Contact />
                </div>
              </div>
            </section>
          </ScrollReveal>

        </main>
      </div>
    </PageContainer>
  )
}

export default ServicePage