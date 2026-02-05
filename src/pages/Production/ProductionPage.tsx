import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import photo from '@/assets/Production/photo_stanok.png'
import photo2 from '@/assets/Production/photoStanok2.png'
import photo3 from '@/assets/Production/photoStanok3.png'
import one from '@/assets/demoZal/one.svg'
import two from '@/assets/demoZal/two.svg'
import three from '@/assets/demoZal/three.svg'
import four from '@/assets/demoZal/four.svg'
import Contact from '@/components/common/Contact'
import { useTranslation } from 'react-i18next'

const ProductionPage = () => {

  const { t } = useTranslation()

  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-14 font-manrope">

        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        <main className="w-full">
          <section>

            <h1 className="font-oswald text-2xl sm:text-3xl xl:text-4xl font-semibold uppercase text-[#EA571E]">
              {t('production.title')}
            </h1>

            <p className="text-xl mt-6 font-extrabold">
              {t('production.subTitle')}
            </p>

            <p className="text-gray-600 mt-4 max-w-3xl font-light text-sm">
              {t('production.text')}
            </p>

            <button
              className="mt-10 bg-[#EA571E] w-full sm:w-2/5 text-white py-3 font-medium hover:bg-[#d9481f] transition font-geologica"
            >
              {t('production.signUpDemo')}
            </button>

          </section>

          <section className="mt-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">

            <img
              src={photo}
              className="w-full h-[260px] sm:h-[320px] lg:h-full object-cover rounded-lg"
            />

            <div className="grid grid-rows-3 gap-4">

              <img
                src={photo}
                className="w-full h-full object-cover rounded-lg"
              />

              <img
                src={photo2}
                className="w-full h-full object-cover rounded-lg"
              />

              <img
                src={photo3}
                className="w-full h-full object-cover rounded-lg"
              />

            </div>

          </section>

          <p className="mt-4 font-light">
            {t('production.textUnderPhoto')}
          </p>

          <section className="mt-14">

            <h2 className="text-xl uppercase font-extrabold mb-6">
              {t('production.youGet.title')}
            </h2>

            <ul className="space-y-3 text-gray-700 list-disc pl-5 font-light">

              <li>
                <b className="font-bold">
                  {t('production.youGet.speed.textB')}
                </b>{' '}
                {t('production.youGet.speed.text')}
              </li>

              <li>
                <b className="font-bold">
                  {t('production.youGet.quality.textB')}
                </b>{' '}
                {t('production.youGet.quality.text')}
              </li>

              <li>
                <b className="font-bold">
                  {t('production.youGet.employees.textB')}
                </b>{' '}
                {t('production.youGet.employees.text')}
              </li>

            </ul>

          </section>

          <section className="mb-16 md:mb-20 mt-20 px-4">

            <h2 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-semibold text-[#EA571E] uppercase mb-8 md:mb-10 text-center md:text-left">
              {t('production.howItWork.title')}
            </h2>

            <div className="space-y-8">

              {[one, two, three, four].map((icon, i) => {

                const steps = ['step1', 'step2', 'step3', 'step4']
                const stepKey = steps[i]

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-6 ${
                      i !== 3 && 'border-b border-[#EA571E]'
                    }`}
                  >

                    <img
                      src={icon}
                      className="w-10 sm:w-12 md:w-14 mb-3 flex-shrink-0"
                      alt="step"
                    />

                    <div className="flex-1 pb-4">

                      <h4 className="font-semibold mb-3 text-sm sm:text-base">
                        {t(`production.howItWork.${stepKey}.title`)}
                      </h4>

                      <p className="text-xs sm:text-sm text-gray-600">
                        {t(`production.howItWork.${stepKey}.text`)}
                      </p>

                    </div>

                  </div>
                )
              })}

            </div>

          </section>

          <section className="mt-20 mb-24">

            <h2 className="text-xl uppercase font-extrabold mb-6">
              {t('production.benefits.title')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {['risk', 'training', 'process'].map((item, i) => (

                <div key={i} className="px-4 py-6 bg-white">

                  <p className="text-[#EA571E] font-bold mb-4">
                    {t(`production.benefits.${item}.title`)}
                  </p>

                  <p className="font-light">
                    {t(`production.benefits.${item}.text`)}
                  </p>

                </div>

              ))}

            </div>

          </section>

        </main>

      </div>

      <section className="mt-20">

        <h2 className="font-oswald text-4xl font-bold uppercase text-[#EA571E] mb-6">
          {t('production.platformsTitle')}
        </h2>

        <p className="mb-6 font-bold">
          {t(
            'production.platformsText'
          )}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">

          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>

              <div className="p-8 text-center text-sm bg-white flex items-center justify-center">
                <span className="text-gray-400 text-xs">
                  LOGO
                </span>
              </div>

              <p className="font-light">Тип производства</p>
              <p className="font-light mb-16">Регион, город</p>

            </div>
          ))}

        </div>

      </section>

      <section className="my-20 md:my-32 px-4">

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-oswald font-semibold mb-8 text-center uppercase">
          {t('production.contact')}
        </h2>

        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <Contact />
          </div>
        </div>

      </section>

    </PageContainer>
  )
}

export default ProductionPage
