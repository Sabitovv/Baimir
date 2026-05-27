import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { EditableImage } from '@/zustand/EditableImage'

import Experience from '@/assets/home/experience_icon.webp'
import Deliver from '@/assets/home/deliver_icon.webp'
import Garant from '@/assets/home/garant_icon.webp'
import Sklad from '@/assets/home/sklad_icon.webp'
import ServiceIcon from '@/assets/home/service_icon.webp'

type FeatureItem = {
  key: string
  icon: string
  titleKey: string
  textKey: string
}

const WhyChooseUs = () => {
  const { t } = useTranslation()

  const features: FeatureItem[] = [
    { key: 'home_why_icon_experience', icon: Experience, titleKey: 'home.why.experience.title', textKey: 'home.why.experience.text' },
    { key: 'home_why_icon_delivery', icon: Deliver, titleKey: 'home.why.delivery.title', textKey: 'home.why.delivery.text' },
    { key: 'home_why_icon_guarantee', icon: Garant, titleKey: 'home.why.guarantee.title', textKey: 'home.why.guarantee.text' },
    { key: 'home_why_icon_stock', icon: Sklad, titleKey: 'home.why.stock.title', textKey: 'home.why.stock.text' },
    { key: 'home_why_icon_service', icon: ServiceIcon, titleKey: 'home.why.service.title', textKey: 'home.why.service.text' },
    { key: 'home_why_icon_price', icon: Experience, titleKey: 'home.why.price.title', textKey: 'home.why.price.text' },
  ]

  return (
    <section className="bg-[#F5F5F5] py-12 md:py-20">
      <PageContainer>
        <div className="px-1 md:px-0">

          <ScrollReveal>
            <h2 className="mb-6 font-manrope text-[32px] font-semibold uppercase leading-[1.06] text-[#111111] md:mb-12 md:text-5xl xl:text-6xl">
              {t('home.why.title')}
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3 md:gap-12">
            {features.map((item, index) => (
              <StaggerItem key={index}>
                <div className="group flex h-full flex-col rounded-xl border border-[#ECECEC] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
                  <div className="mb-3 text-[#F58322]">
                    <EditableImage imageKey={item.key} fallbackSrc={item.icon} alt="" className="h-10 w-10 object-contain md:h-12 md:w-12" />
                  </div>
                  <h3 className="mb-2 font-manrope text-[15px] font-bold uppercase leading-5 md:text-xl">
                    {t(item.titleKey)}
                  </h3>
                  <p className="flex-1 text-sm leading-relaxed text-gray-600">
                    {t(item.textKey)}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

        </div>
      </PageContainer>
    </section>
  )
}

export default WhyChooseUs
