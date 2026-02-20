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
            <h1 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-[#EA571E] leading-tight">
              {t('storage.title')}
            </h1>
            <h3 className="text-lg sm:text-xl lg:text-2xl mt-2 font-bold font-oswald text-gray-800">
              {t('storage.subTitle')}
            </h3>
            <h3 className="text-base sm:text-lg lg:text-xl mt-1 font-bold font-oswald text-gray-700">
              {t('storage.subTitle2')}
            </h3>
          </section>
          <section className="mt-6 sm:mt-8">
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
                    className={`cursor-pointer text-center transition-all duration-300 p-1 sm:p-2 rounded-lg ${
                      choose === index
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
          </section>
          <section className="my-16 sm:my-20 lg:my-24">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-semibold text-[#EA571E] mb-6 sm:mb-8 uppercase">
              {t('storage.infoBlock')}
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <Component />
              <Component />
              <Component />
              <Component />
              <Component />
            </div>
          </section>
          <section className="mt-16 sm:mt-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-semibold mb-6 sm:mb-8 uppercase text-[#EA571E]">
              {t('storage.lifeTitle')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />
              <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />
              <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />
            </div>

            <div className="flex justify-center sm:justify-end mt-8">
              <button className="font-bold text-base sm:text-lg text-[#EA571E] flex items-center gap-2 hover:translate-x-1 transition-transform">
                {t('storage.other')}
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
          </section>

        </main>
      </div>
      <section className="mt-20 mb-16 sm:mt-28 sm:mb-20 flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
        
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
            className="w-full max-w-[280px] sm:max-w-[380px] lg:max-w-md object-contain"
            alt="request"
          />
        </div>

      </section>

    </PageContainer>
  )
}

export default StoragePage