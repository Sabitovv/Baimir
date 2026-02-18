import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'

import Experience from '@/assets/Home/experience_icon.webp'
import Deliver from '@/assets/Home/deliver_icon.webp'
import Garant from '@/assets/Home/garant_icon.webp'
import Sklad from '@/assets/Home/sklad_icon.webp'
import ServiceIcon from '@/assets/Home/service_icon.webp'

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

          <h2 className="text-4xl md:text-5xl xl:text-6xl font-['Oswald'] font-bold uppercase mb-8 md:mb-12 text-[#111111]">
            {t('home.why.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 shadow-sm hover:shadow-md transition group"
              >
                <div className="text-[#F05023] mb-4">
                  <img src={item.icon} alt="" />
                </div>

                <h3 className="text-base md:text-xl font-['Oswald'] font-bold uppercase mb-2">
                  {t(item.titleKey)}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(item.textKey)}
                </p>
              </div>
            ))}
          </div>

        </div>
      </PageContainer>
    </section>
  )
}

export default WhyChooseUs
