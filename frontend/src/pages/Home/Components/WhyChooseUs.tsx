import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

import Experience from '@/assets/home/experience_icon.webp'
import Deliver from '@/assets/home/deliver_icon.webp'
import Garant from '@/assets/home/garant_icon.webp'
import Sklad from '@/assets/home/sklad_icon.webp'
import ServiceIcon from '@/assets/home/service_icon.webp'

type FeatureItem = {
  icon: string
  titleKey: string
  textKey: string
}

const WhyChooseUs = () => {
  const { t } = useTranslation()

  const features: FeatureItem[] = [
    {
      icon: Experience,
      titleKey: 'home.why.experience.title',
      textKey: 'home.why.experience.text'
    },
    {
      icon: Deliver,
      titleKey: 'home.why.delivery.title',
      textKey: 'home.why.delivery.text'
    },
    {
      icon: Garant,
      titleKey: 'home.why.guarantee.title',
      textKey: 'home.why.guarantee.text'
    },
    {
      icon: Sklad,
      titleKey: 'home.why.stock.title',
      textKey: 'home.why.stock.text'
    },
    {
      icon: ServiceIcon,
      titleKey: 'home.why.service.title',
      textKey: 'home.why.service.text'
    },
    {
      icon: Experience,
      titleKey: 'home.why.price.title',
      textKey: 'home.why.price.text'
    }
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

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((item, index) => (
              <StaggerItem key={index}>
                <div
                  className="bg-white p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="text-[#F05023] mb-4">
                    <img src={item.icon} alt="" />
                  </div>

                  <h3 className="text-base md:text-xl font-oswald font-bold uppercase mb-2">
                    {t(item.titleKey)}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
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
