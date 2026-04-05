import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import demoImg from '@/assets/img_review.png'
import { useTranslation } from 'react-i18next'
import { EditableImage } from '@/zustand/EditableImage'

const DemoInnerPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-16">

        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>
        <section className="max-w-[1000px]">
          <h1 className="font-oswald text-[40px] font-bold uppercase mb-6">
            {t('demoInner.title')}
          </h1>
          <div className="mb-12">
            <div className="bg-[#E5E5E5] h-[360px] mb-4 rounded-lg overflow-hidden">
              <EditableImage imageKey="demo_inner_main_image" fallbackSrc={demoImg} className="w-full h-full object-cover" alt="demo" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="bg-[#E5E5E5] h-[120px] rounded-lg overflow-hidden"
                >
                  <EditableImage imageKey={`demo_inner_thumb_${i}`} fallbackSrc={demoImg} className="w-full h-full object-cover" alt={`demo ${i}`} />
                </div>
              ))}
            </div>

          </div>

          <div className="max-w-[860px] space-y-10 text-[#2A2A2A]">

            <div>
              <h2 className="font-oswald text-xl font-bold mb-2">
                {t('demoInner.intro.title')}
              </h2>

              <p className="leading-[1.7] text-[15px]">
                {t('demoInner.intro.text')}
              </p>
            </div>

            <div>
              <h2 className="font-oswald text-xl font-bold mb-3">
                {t('demoInner.why.title')}
              </h2>

              <ul className="list-disc pl-5 space-y-2 text-[15px] leading-[1.7]">

                <li>
                  <b>{t('demoInner.why.items.1.title')}</b> {t('demoInner.why.items.1.text')}
                </li>

                <li>
                  <b>{t('demoInner.why.items.2.title')}</b> {t('demoInner.why.items.2.text')}
                </li>

                <li>
                  <b>{t('demoInner.why.items.3.title')}</b> {t('demoInner.why.items.3.text')}
                </li>

                <li>
                  <b>{t('demoInner.why.items.4.title')}</b> {t('demoInner.why.items.4.text')}
                </li>

                <li>
                  <b>{t('demoInner.why.items.5.title')}</b> {t('demoInner.why.items.5.text')}
                </li>

              </ul>
            </div>

          </div>

        </section>

      </div>

      <div className="mt-24 text-center max-w-[600px] mx-auto">

        <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
          {t('demoInner.contactTitle')}
        </h2>

        <Contact />

      </div>

    </PageContainer>
  )
}

export default DemoInnerPage
