import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import CardImg from '@/assets/Home/sklad1.webp'
import CardImg2 from '@/assets/Home/sklad2.webp'
import CardImg3 from '@/assets/Home/sklad3.webp'
import { useState } from 'react'

type StatItem = {
  value: string
  unit?: string
  textKey: string
}

const Warehouse = () => {
  const { t } = useTranslation()

  const [imgChange, setImgChange] = useState(0);

  const stats: StatItem[] = [
    { value: '5 500', textKey: 'home.warehouse.stats.space' },
    { value: '120+', textKey: 'home.warehouse.stats.staff' },
    { value: '2012', textKey: 'home.warehouse.stats.since' }
  ]

  const images = [CardImg, CardImg2, CardImg3]

  return (
    <section className="py-16 md:py-20 bg-white">
      <PageContainer>

        <h1
          className="
          font-oswald font-bold uppercase text-[#111111]
          text-4xl md:text-5xl xl:text-6xl
          mb-10
        "
        >
          {t('home.warehouse.title')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">

          <div className="flex-1">

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

          </div>

          <div className="w-full lg:w-[420px] flex flex-col gap-8">

            {stats.map((item, index) => (
              <div key={index}>

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
                    <span className="text-xl md:text-2xl ml-1">
                      {t(`home.warehouse.units.${item.unit}`)}
                    </span>
                  )}
                </div>

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

export default Warehouse
