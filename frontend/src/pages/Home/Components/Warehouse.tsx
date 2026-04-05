import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import CardImg from '@/assets/home/sklad1.webp'
import CardImg2 from '@/assets/home/sklad2.webp'
import CardImg3 from '@/assets/home/sklad3.webp'
import { useState } from 'react'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { EditableImage } from '@/zustand/EditableImage'

type WarehouseImageItem = {
  key: string
  src: string
}

type StatItem = {
  valueKey: string
  fallbackValue: string
  unit?: string
  textKey: string
}

const Warehouse = () => {
  const { t } = useTranslation()

  const [imgChange, setImgChange] = useState(0)

  const stats: StatItem[] = [
    {
      valueKey: 'home.warehouse.values.space',
      fallbackValue: '5 500 m2',
      textKey: 'home.warehouse.stats.space',
    },
    {
      valueKey: 'home.warehouse.values.staff',
      fallbackValue: '120+',
      textKey: 'home.warehouse.stats.staff',
    },
    {
      valueKey: 'home.warehouse.values.since',
      fallbackValue: '2012',
      textKey: 'home.warehouse.stats.since',
    },
  ]

  const images: WarehouseImageItem[] = [
    { key: 'home_warehouse_main_1', src: CardImg },
    { key: 'home_warehouse_main_2', src: CardImg2 },
    { key: 'home_warehouse_main_3', src: CardImg3 },
  ]

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
              <EditableImage
                imageKey={images[imgChange].key}
                fallbackSrc={images[imgChange].src}
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
                  ${imgChange == index ? 'border-[#F58322]' : 'border-none'}
                  transition
                  cursor-pointer
                `}
                >
                  <EditableImage
                    imageKey={img.key}
                    fallbackSrc={img.src}
                    onClick={() => setImgChange(index)}
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
                    font-oswald font-bold text-[#F58322]
                    text-4xl md:text-5xl
                    leading-none
                    mb-2
                  "
                  >
                    {t(item.valueKey, { defaultValue: item.fallbackValue })}

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
