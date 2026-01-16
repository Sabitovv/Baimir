import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import CardImg from '@/assets/card_img_1.png'

type StatItem = {
  value: string
  unit?: string
  textKey: string
}

const Warehouse = () => {
  const { t } = useTranslation()

  const stats: StatItem[] = [
    { value: '5 500', unit: 'm2', textKey: 'home.warehouse.stats.space' },
    { value: '120+', textKey: 'home.warehouse.stats.staff' },
    { value: '2012', textKey: 'home.warehouse.stats.since' }
  ]

  const images = [CardImg, CardImg, CardImg]

  return (
    <section className="py-16 md:py-20 bg-white">
      <PageContainer>

        {/* TITLE */}
        <h1
          className="
            font-oswald font-bold uppercase text-[#111111]
            text-4xl md:text-5xl xl:text-6xl
            mb-6 md:mb-8
          "
        >
          {t('home.warehouse.title')}
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-12">
          {stats.map((item, index) => (
            <div key={index}>
              <div
                className="
                  font-oswald font-bold text-[#F05023]
                  text-4xl md:text-5xl
                  mb-2 leading-tight
                "
              >
                {item.value}
                {item.unit && (
                  <span className="text-xl md:text-2xl ml-1">
                    {t(`home.warehouse.units.${item.unit}`)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 font-manrope text-sm leading-relaxed">
                {t(item.textKey)}
              </p>
            </div>
          ))}
        </div>

        {/* IMAGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img, index) => (
            <div key={index} className="relative bg-black overflow-hidden">
              <img
                src={img}
                alt={t('home.warehouse.imageAlt')}
                className="w-full h-[260px] md:h-[300px] xl:h-[340px] object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0">
                <div className="bg-gradient-to-t from-black/90 via-black/80 to-transparent p-4">
                  <p className="text-white text-xs font-light leading-relaxed">
                    {t('home.warehouse.imageText')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </PageContainer>
    </section>
  )
}

export default Warehouse
