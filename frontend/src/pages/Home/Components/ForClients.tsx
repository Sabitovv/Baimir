import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'

import Discount from '@/assets/home/handDiscount.webp'
import Money from '@/assets/home/handMoney.webp'
import Heart from '@/assets/home/handHeart.webp'

type BenefitItem = {
  titleKey: string
  textKey: string
  image: string
}

const ForClients = () => {
  const { t } = useTranslation()

  const benefits: BenefitItem[] = [
    {
      titleKey: 'home.clients.bonus.title',
      textKey: 'home.clients.bonus.text',
      image: Discount
    },
    {
      titleKey: 'home.clients.leasing.title',
      textKey: 'home.clients.leasing.text',
      image: Money
    },
    {
      titleKey: 'home.clients.loyalty.title',
      textKey: 'home.clients.loyalty.text',
      image: Heart
    }
  ]

  return (
    <section className="mb-20 md:mb-32">
      <PageContainer>

        <h1 className="font-oswald font-semibold text-4xl md:text-5xl xl:text-6xl uppercase mt-32">
          {t('home.clients.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="border-[#F05023] border-4 p-4 md:p-8"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8 xl:mb-12">
                <h3 className="font-oswald font-bold text-xl md:text-2xl xl:text-3xl uppercase">
                  {t(item.titleKey)}
                </h3>
                <img src={item.image} className='w-14 h-14' alt="" />
              </div>

              <p className="mt-6 md:mt-8 xl:mt-12 text-base md:text-lg leading-relaxed">
                {t(item.textKey)}
              </p>
            </div>
          ))}
        </div>

      </PageContainer>
    </section>
  )
}

export default ForClients
