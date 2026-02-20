import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import CategoryCard from '@/components/common/CategoryCard'
import Contact from '@/components/common/Contact'
import imgStanok from '@/assets/home/lazerStanok.webp'
import { useTranslation } from 'react-i18next'


const TechnologiesPage = () => {
  const { t } = useTranslation()
  return (
    <>
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-14">

          <aside className="hidden lg:block">
            <CategoriesMenu />
          </aside>

          <section className='flex flex-col mx-auto'>
            <h1 className="font-oswald font-semibold text-3xl font-bold md:text-4xl xl:text-[45px] uppercase text-[#F05023]">
              {t('technology.title')}
            </h1>

            <h3 className='text-xl font-bold mb-4 mt-1' style={{ whiteSpace: 'pre-line' }}>{t('technology.subTitle')}</h3>

            <p className="text-gray-600 max-w-3xl mb-6 text-sm md:text-base">
              {t('technology.text')}
            </p>

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
            ">
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
              <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
            </div>
          </section>

        </div>
        <div className="mt-24 text-center max-w-[600px] mx-auto mb-30">
          <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
            Оставьте заявку
          </h2>
          <Contact />
        </div>
      </PageContainer>


      {/* ===== CONTACT FORM (GLOBAL) ===== */}
      {/* <div className='text-center my-45'>
        <h2
            className="
              font-oswald font-semibold uppercase text-[#111111]
              text-4xl md:text-5xl xl:text-6xl
              mb-8 md:mb-10
            "
          >
          {t('home.contact.title')}
        </h2>
        <Contact />
      </div> */}
    </>
  )
}

export default TechnologiesPage
