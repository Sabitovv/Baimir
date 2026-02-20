import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import MainPhoto from '@/assets/storage/MainPhoto.webp'
import Photo from '@/assets/storage/Photo.webp'
import Photo2 from '@/assets/storage/Photo1.webp'
import Photo3 from '@/assets/storage/Photo2.webp'
import Component from '@/pages/Storage/StorageComponent'
import Cart from '@/components/common/CategoryCard'
import Contact from '@/components/common/Contact'
import bidImg from '@/assets/storage/bidImg.webp'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const StoragePage = () => {
  const [choose, setChoose] = useState(0)
  const [activeImage, setActiveImage] = useState(MainPhoto)

  const { t } = useTranslation()

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mt-6 sm:mt-8 md:mt-12">
        <aside className="hidden lg:block w-full">
          <CategoriesMenu />
        </aside>

        <main className="w-full min-w-0">
          <section>
            <ScrollReveal>
              <h1 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-[#EA571E] leading-tight">
                {t('storage.title')}
              </h1>
              <h3 className="text-lg sm:text-xl font-bold my-4 mb-8 whitespace-pre-line">
                {t('storage.description')}
              </h3>
            </ScrollReveal>

            <section className="mt-6 sm:mt-8">
              <ScrollReveal delay={0.2}>
                <img
                  src={activeImage}
                  className="w-full h-auto aspect-video object-cover rounded-lg shadow-sm transition-opacity duration-300"
                  alt="storage main"
                />
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
                  {[Photo2, Photo, Photo3].map((img, i) => {
                    const index = i + 1
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setChoose(index)
                          setActiveImage(img)
                        }}
                        className={`cursor-pointer text-center transition-all duration-300 p-1 sm:p-2 rounded-lg ${choose === index
                          ? 'border-2 border-[#F05023] shadow-sm'
                          : 'border-2 border-transparent hover:border-gray-200'
                          }`}
                      >
                        <img
                          src={img}
                          className="w-full h-auto aspect-[4/3] sm:aspect-video object-cover rounded-md mx-auto"
                          alt={`storage detail ${index}`}
                        />
                        <p className="text-[10px] sm:text-xs md:text-sm mt-2 font-medium text-gray-600 leading-snug">
                          {t(`storage.imageSubText.text${index}`)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </ScrollReveal>
            </section>

            <ScrollReveal delay={0.3} y={20}>
              <Component />
              <Component />
              <Component />
              <Component />
              <Component />
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <StaggerItem>
                <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />
              </StaggerItem>
              <StaggerItem>
                <Cart title="Производство чего-то там. Не шарю в станках." image={Photo2} />
              </StaggerItem>
              <StaggerItem>
                <Cart title="Производство чего-то там. Не шарю в станках." image={Photo3} />
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal className="flex justify-center sm:justify-end mt-8">
              <button className="font-bold text-base sm:text-lg text-[#EA571E] flex items-center gap-2 hover:translate-x-1 transition-transform">
                {t('storage.other')}
                <span className="text-xl leading-none">→</span>
              </button>
            </ScrollReveal>
          </section>
        </main>
      </div>

      <ScrollReveal y={50} className="mt-20 mb-16 sm:mt-28 sm:mb-20 flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-semibold mb-6 sm:mb-8 uppercase text-center lg:text-left text-gray-900">
            {t('storage.contact')}
          </h2>
          <div className="max-w-xl mx-auto lg:mx-0">
            <Contact />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src={bidImg}
            alt="contact"
            className="w-full max-w-md lg:max-w-full object-cover"
          />
        </div>
      </ScrollReveal>
    </PageContainer>
  )
}

export default StoragePage