import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import CategoryCard from '@/components/common/CategoryCard'
import Contact from '@/components/common/Contact'
import imgStanok from '@/assets/home/lazerStanok.webp'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const TechnologiesPage = () => {
  const { t } = useTranslation()
  return (
    <>
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-14">
          <aside className="hidden lg:block">
            <CategoriesMenu />
          </aside>

          <section className='flex flex-col mx-auto w-full'>
            <ScrollReveal>
              <h1 className="font-oswald font-semibold text-3xl md:text-4xl xl:text-[45px] uppercase text-[#F05023]">
                {t('technology.title')}
              </h1>
              <h3 className='text-xl font-bold mb-4 mt-1' style={{ whiteSpace: 'pre-line' }}>
                {t('technology.subTitle')}
              </h3>
              <p className="text-gray-600 max-w-3xl mb-6 text-sm md:text-base">
                {t('technology.text')}
              </p>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(7)].map((_, index) => (
                <StaggerItem key={index}>
                  <CategoryCard title='Технология производства металлоконструкций для мостов и зданий' image={imgStanok} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </div>

        <ScrollReveal y={40} className="mt-24 text-center max-w-[600px] mx-auto mb-30">
          <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
            Оставьте заявку
          </h2>
          <Contact />
        </ScrollReveal>
      </PageContainer>
    </>
  )
}

export default TechnologiesPage