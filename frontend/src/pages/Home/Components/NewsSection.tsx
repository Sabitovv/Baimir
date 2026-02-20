import { useTranslation } from 'react-i18next'
import newsImg1 from '@/assets/home/Rectangle 3366.webp'
import newsImg2 from '@/assets/home/Rectangle 3368.webp'
import newsImg3 from '@/assets/home/Rectangle 3370.webp'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

type NewsItem = {
  id: number
  title: string
  text: string
}

const NewsSection = () => {
  const { t } = useTranslation()

  const rawNews = t('home.news.items', {
    returnObjects: true
  })
  const news: NewsItem[] = Array.isArray(rawNews) ? rawNews : []

  const images = [newsImg1, newsImg2, newsImg3]

  return (
    <section className="py-16 md:py-20 bg-[#F5F5F5]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px]">

        <ScrollReveal>
          <h2 className="font-oswald font-bold uppercase text-[#111111]
                        text-3xl md:text-4xl xl:text-5xl mb-10">
            {t('home.news.title')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <StaggerItem key={item.id} className="h-full">
              <article
                className="bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <img
                  src={images[index]}
                  alt={item.title}
                  className="w-full h-[200px] object-cover shrink-0"
                />

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-oswald font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 mb-4">
                    {item.text}
                  </p>

                  <button className="mt-auto text-[#F05023] text-xs uppercase tracking-widest font-bold self-start hover:underline">
                    {t('home.news.readmore')} →
                  </button>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  )
}

export default NewsSection
