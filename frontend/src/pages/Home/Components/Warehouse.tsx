import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import CardImg from '@/assets/home/sklad1.webp'
import CardImg2 from '@/assets/home/sklad2.webp'
import CardImg3 from '@/assets/home/sklad3.webp'
import { useState } from 'react'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

type StatItem = {
  value: string
  unit?: string
  textKey: string
}

const Warehouse = () => {
  const { t } = useTranslation()

  const [imgChange, setImgChange] = useState(0);

  const stats: StatItem[] = [
    { value: '5 500 м', textKey: 'home.warehouse.stats.space' },
    { value: '120+', textKey: 'home.warehouse.stats.staff' },
    { value: '2012', textKey: 'home.warehouse.stats.since' }
  ]

  const images = [CardImg, CardImg2, CardImg3]

  return (
    <section className="py-16 md:py-20 bg-white">
      <PageContainer>

        <ScrollReveal>
          <h1
            className="
            font-oswald font-bold uppercase text-[#111111]
            text-4xl md:text-5xl xl:text-6xl
            mb-10
          "
          >
            {t('home.warehouse.title')}
          </h1>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row gap-10">

          <ScrollReveal className="flex-1">

            <div className="mb-4">
              <img
                src={images[imgChange]}
                alt={t('home.warehouse.imageAlt')}
                className="w-full h-[380px] object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.slice(0, 3).map((img, index) => (
                <div
                  key={index}
                  className={`
                  border-2
                  ${imgChange == index ? 'border-[#F05023]' : 'border-none'}
                  transition
                  cursor-pointer
                `}
                >
                  <img
                    onClick={() => setImgChange(index)}
                    src={img}
                    alt={t('home.warehouse.imageAlt')}
                    className="w-full h-[110px] object-cover"
                  />
                </div>
              ))}
            </div>

          </ScrollReveal>

          <StaggerContainer staggerDelay={0.15} className="w-full lg:w-[420px] flex flex-col gap-8">

            {stats.map((item, index) => (
              <StaggerItem key={index}>
                <div>
                  <div
                    className="
                    font-oswald font-bold text-[#F05023]
                    text-4xl md:text-5xl
                    leading-none
                    mb-2
                  "
                  >
                    {item.value}

                    {item.unit && (
                      <span className="text-xl md:text-2xl ml-1 font-oswald font-semibold">
                        {t(`home.warehouse.units.${item.unit}`)}
                      </span>
                    )}
                  </div>

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

export default Warehouse
