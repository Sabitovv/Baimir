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
    <section className="py-16 md:py-20 bg-[#F5F5F5]">
      <PageContainer>
        <div className="px-6 md:px-0">

          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-oswald font-semibold uppercase mb-8 md:mb-12 text-[#111111]">
              {t('home.why.title')}
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 auto-rows-fr">
            {features.map((item, index) => (
              <StaggerItem key={index}>
                <div className="bg-white p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                  <div className="text-[#F58322] mb-4">
                    <EditableImage imageKey={item.key} fallbackSrc={item.icon} alt="" className="w-12 h-12 object-contain" />
                  </div>
                  <h3 className="text-base md:text-xl font-oswald font-bold uppercase mb-2">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
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
