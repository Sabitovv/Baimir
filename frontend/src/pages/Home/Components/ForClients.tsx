import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { EditableImage } from '@/zustand/EditableImage'

import Discount from '@/assets/home/handDiscount.webp'
import Money from '@/assets/home/handMoney.webp'
import Heart from '@/assets/home/handHeart.webp'

type BenefitItem = {
  key: string
  titleKey: string
  textKey: string
  image: string
}

const ForClients = () => {
  const { t } = useTranslation()

  const benefits: BenefitItem[] = [
    {
      key: 'home_clients_icon_discount',
      titleKey: 'home.clients.bonus.title',
      textKey: 'home.clients.bonus.text',
      image: Discount,
    },
    {
      key: 'home_clients_icon_money',
      titleKey: 'home.clients.leasing.title',
      textKey: 'home.clients.leasing.text',
      image: Money,
    },
    {
      key: 'home_clients_icon_heart',
      titleKey: 'home.clients.loyalty.title',
      textKey: 'home.clients.loyalty.text',
      image: Heart,
    },
  ]

  return (
    <section className="mb-20 md:mb-32">
      <PageContainer>

        <ScrollReveal>
          <h1 className="font-oswald font-semibold text-4xl md:text-5xl xl:text-6xl uppercase mt-32">
            {t('home.clients.title')}
          </h1>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {benefits.map((item, index) => (
            <StaggerItem key={index} className="h-full">
              <div
                className="border-[#F58322] border-4 p-4 md:p-8 hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-start gap-3 mb-6 md:mb-8 xl:mb-12">
                  <h3 className="font-oswald font-bold text-xl md:text-2xl xl:text-3xl uppercase pr-2 min-w-0 break-words leading-tight">
                    {t(item.titleKey)}
                  </h3>
                  <EditableImage
                    imageKey={item.key}
                    fallbackSrc={item.image}
                    className="w-10 h-10 md:w-14 md:h-14 max-w-full object-contain shrink-0"
                    alt=""
                  />
                </div>

                <p className="text-base md:text-lg leading-relaxed">
                  {t(item.textKey)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </PageContainer>
    </section>
  )
}

export default ForClients
