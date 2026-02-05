import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import Card from '@/components/common/CategoryCard'

import teamPhoto from '@/assets/Service/groupImg.png'
import real2 from '@/assets/Service/TwoImg.png'

import { useTranslation } from 'react-i18next'

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

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8 mt-8 md:mt-12 font-manrope">

        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        <main className="w-full">

          <section>

            <h1 className="font-oswald text-lg sm:text-xl md:text-2xl xl:text-4xl font-semibold uppercase text-[#EA571E]">
              {t('service.title')}
            </h1>

            <p className="text-sm sm:text-base md:text-lg mt-3 sm:mt-4 font-bold">
              {t('service.subTitle')}
            </p>

          </section>

          <section className="mt-6 sm:mt-8">

            <img
              src={teamPhoto}
              className="w-full object-cover"
              alt="service team"
            />

            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
              {t('service.team.imageText')}
            </p>

          </section>

          <section className="mt-12 sm:mt-16">

            <h2 className="font-oswald text-xl sm:text-2xl md:text-3xl font-semibold uppercase text-[#EA571E] mb-6 sm:mb-8">
              {t('service.services.title')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

              {services.map((item, i) => (
                <div
                  key={i}
                  className="text-[#EA571E] bg-white py-8 sm:py-10 px-4 text-center font-bold hover:shadow-md transition cursor-pointer"
                >
                  {item}
                </div>
              ))}

            </div>

          </section>

          <section className="mt-14 sm:mt-20">

            <h2 className="font-oswald text-xl sm:text-2xl md:text-3xl font-semibold uppercase mb-5 sm:mb-6">
              {t('service.why.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 sm:gap-8 items-start">

              <img
                src={teamPhoto}
                className="mx-auto md:mx-0 max-w-[260px] md:max-w-full"
                alt="work"
              />

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {t('service.why.text1')}
                <br /><br />
                {t('service.why.text2')}
              </p>

            </div>

          </section>

          <section className="mt-20 sm:mt-28 -mx-[calc(50vw-50%)] py-12 sm:py-16">

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 sm:gap-10 items-end">

              <div>

                <h2 className="font-oswald text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold uppercase mb-6 sm:mb-10">
                  {t('service.engineers.title')}
                </h2>

                <div className="space-y-6 sm:space-y-8">

                  {[
                    'certification',
                    'experience',
                    'coverage',
                    'speed'
                  ].map((item, i) => (

                    <div key={i}>

                      <p className="text-[#EA571E] font-semibold mb-1 sm:mb-2">
                        {t(`service.engineers.${item}.title`)}
                      </p>

                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        {t(`service.engineers.${item}.text`)}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              <div className="flex justify-center lg:justify-end">

                <img
                  src={real2}
                  className="max-w-[260px] sm:max-w-[320px] md:max-w-[380px]"
                  alt="engineers"
                />

              </div>

            </div>

          </section>

          <section className="mt-20 sm:mt-32 max-w-3xl">

            <h2 className="font-extrabold text-xl sm:text-2xl">
              {t('service.realObjects.title')}
            </h2>

            <p className="mt-2 text-sm sm:text-base">
              {t('service.realObjects.text')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">

              <Card
                title={t('service.realObjects.cardTitle')}
                image={teamPhoto}
              />

              <Card
                title={t('service.realObjects.cardTitle')}
                image={teamPhoto}
              />

              <Card
                title={t('service.realObjects.cardTitle')}
                image={teamPhoto}
              />

            </div>

          </section>

          <section className="my-16 sm:my-20 md:my-32 px-2 sm:px-4">

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-oswald font-semibold mb-6 sm:mb-8 uppercase text-center md:text-left">
              {t('service.contact.title')}
            </h2>

            <div className="flex justify-center md:justify-start">

              <div className="w-full max-w-xl">
                <Contact />
              </div>

            </div>

          </section>

        </main>

      </div>

    </PageContainer>
  )
}

export default ServicePage
