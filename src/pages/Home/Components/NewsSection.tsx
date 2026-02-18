import { useTranslation } from 'react-i18next'
import newsImg1 from '@/assets/Home/Rectangle 3366.webp'
import newsImg2 from '@/assets/Home/Rectangle 3368.webp'
import newsImg3 from '@/assets/Home/Rectangle 3370.webp'

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

        <h2 className="font-oswald font-bold uppercase text-[#111111]
                      text-3xl md:text-4xl xl:text-5xl mb-10">
          {t('home.news.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <article
              key={item.id}
              className="bg-white shadow-sm hover:shadow-md transition flex flex-col"
            >
              <img
                src={images[index]}
                alt={item.title}
                className="w-full h-[200px] object-cover"
              />

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-oswald font-bold text-lg mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed flex-grow line-clamp-4">
                  {item.text}
                </p>

                <button className="mt-4 text-[#F05023] text-xs uppercase tracking-widest font-bold self-start hover:underline">
                  {t('home.news.readmore')} →
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}

export default NewsSection
