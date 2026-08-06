import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { EditableImage } from '@/zustand/EditableImage'

import Money from '@/assets/home/handMoney.webp'
import Deliver from '@/assets/home/deliver_icon.webp'
import Sklad from '@/assets/home/sklad_icon.webp'
import ServiceIcon from '@/assets/home/service_icon.webp'

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
      key: 'home_clients_icon_price',
      titleKey: 'home.clients.price.title',
      textKey: 'home.clients.price.text',
      image: Money,
    },
    {
      key: 'home_clients_icon_turnkey',
      titleKey: 'home.clients.turnkey.title',
      textKey: 'home.clients.turnkey.text',
      image: Deliver,
    },
    {
      key: 'home_clients_icon_showroom',
      titleKey: 'home.clients.showroom.title',
      textKey: 'home.clients.showroom.text',
      image: Sklad,
    },
    {
      key: 'home_clients_icon_service',
      titleKey: 'home.clients.service.title',
      textKey: 'home.clients.service.text',
      image: ServiceIcon,
    },
  ]

  return (
    <section className="py-12 md:py-20">
      <PageContainer>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {benefits.map((item, index) => (
            <StaggerItem key={index} className="h-full">
              <div
                className="border-[#FF4610] border-4 p-4 md:p-8 hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-start gap-3 mb-4 md:mb-6">
                  <h3 className="font-rubik font-bold text-lg md:text-xl uppercase pr-2 min-w-0 break-words leading-tight">
                    {t(item.titleKey)}
                  </h3>
                  <EditableImage
                    imageKey={item.key}
                    fallbackSrc={item.image}
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 md:w-14 md:h-14 max-w-full object-contain shrink-0"
                    alt=""
                  />
                </div>

                <p className="text-sm md:text-base leading-relaxed">
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
