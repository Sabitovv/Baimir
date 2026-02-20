import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import imgStanok from '@/assets/home/lazerStanok.webp'

const IndustryCatalog = () => {
  const { t } = useTranslation()

  const cards = [
    { title: t('home.catalog.laser'), image: imgStanok },
    { title: t('home.catalog.laser'), image: imgStanok },
    { title: t('home.catalog.laser'), image: imgStanok },
    { title: t('home.catalog.laser'), image: imgStanok },
  ]

  return (
    <section className="py-16 md:py-20 bg-white">
      <PageContainer>

        <div className="mb-8 md:mb-10">
          <h1 className="font-oswald font-semibold uppercase text-[#111111] text-4xl md:text-5xl xl:text-6xl">
            {t('home.catalog.title')}
          </h1>

          <p className="text-gray-500 mt-2
                        text-lg md:text-xl xl:text-2xl">
            {t('home.catalog.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="flex flex-col">

              <div
                className="
                  bg-[#F9F9F9]
                  p-6 md:p-8
                  flex flex-col items-center
                  min-h-[380px] md:min-h-[420px] xl:min-h-[450px]
                  hover:shadow-lg transition-shadow
                  group
                "
              >
                <h3
                  className="
                    font-oswald font-bold uppercase text-center
                    text-base md:text-lg
                    group-hover:text-[#F05023]
                    mb-4
                  "
                >
                  {card.title}
                </h3>

                <div className="flex-grow flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="max-h-40 md:max-h-44 xl:max-h-48 object-contain"
                  />
                </div>
              </div>

              <a
                className="
                  text-[#F05023]
                  text-xs
                  font-bold uppercase tracking-widest
                  self-end mt-3
                  hover:underline
                "
              >
                {t('home.catalog.link')} &gt;
              </a>

            </div>
          ))}
        </div>

      </PageContainer>
    </section>
  )
}

export default IndustryCatalog
