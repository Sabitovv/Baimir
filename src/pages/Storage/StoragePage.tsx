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

  const [choose, setChoose] = useState(1)
  const [t] = useTranslation()

  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-10 md:mt-14">

        {/* SIDEBAR */}
        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        {/* CONTENT */}
        <main className="w-full">

          {/* HERO */}
          <section>

            <h1 className="font-oswald text-xl sm:text-2xl md:text-3xl xl:text-4xl font-semibold uppercase text-[#EA571E]">
              {t('storage.title')}
            </h1>

            <h3 className="text-base sm:text-lg mt-1 sm:mt-1 font-bold font-oswald">
              {t('storage.subTitle')}
            </h3>

            <h3 className="font-bold text-base sm:text-lg mt-1 font-oswald">
              {t('storage.subTitle2')}
            </h3>

          </section>

          {/* GALLERY */}
          <section className="mt-4 sm:mt-6">

            <img
              src={MainPhoto}
              className="w-full rounded-lg object-cover"
              alt="storage"
            />

            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-4">

              {[Photo2, Photo, Photo3].map((img, i) => {

                const index = i + 1

                return (
                  <div
                    key={i}
                    onClick={() => setChoose(index)}
                    className={`cursor-pointer text-center transition ${choose === index
                      ? 'border-2 border-[#F05023] rounded-lg p-1'
                      : ''
                      }`}
                  >

                    <img
                      src={img}
                      className="mx-auto"
                    />

                    <p className="text-xs sm:text-sm mt-2">{t(`storage.imageSubText.text${i + 1}`)}</p>
                  </div>
                )
              })}

            </div>

          </section>

          {/* INFO BLOCK */}
          <section className="my-14 sm:my-18 md:my-24 px-2 sm:px-4">

            <h2 className="text-xl sm:text-2xl md:text-3xl font-oswald font-semibold text-[#EA571E] mb-6 sm:mb-8 uppercase">
              {t('storage.infoBlock')}
            </h2>

            <div className="space-y-6">
              <Component />
              <Component />
              <Component />
              <Component />
              <Component />
            </div>

          </section>

          {/* BLOG */}
          <section className="mt-16 sm:mt-20">

            <h2 className="text-xl sm:text-2xl md:text-3xl font-oswald font-semibold mb-6 sm:mb-8 uppercase text-[#EA571E]">
              {t('storage.lifeTitle')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />
              <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />
              <Cart title="Производство чего-то там. Не шарю в станках." image={Photo} />

            </div>

            <div className="flex justify-center sm:justify-end mt-6">

              <button className="font-bold text-base sm:text-lg text-[#EA571E] flex items-center gap-2 hover:underline transition">
                {t('storage.other')}
                <span>→</span>
              </button>

            </div>

          </section>

        </main>

      </div>

      {/* CONTACT + IMAGE */}
      <section className="my-20 md:my-32 px-4 flex flex-col-reverse md:flex-row items-center gap-10">

        <div className="w-full md:w-1/2">

          <h2 className="text-xl sm:text-2xl md:text-3xl font-oswald font-semibold mb-6 uppercase pl-4">
            {t('storage.contact')}
          </h2>

          <Contact />

        </div>

        <div className="w-full md:w-1/2 flex justify-center">

          <img
            src={bidImg}
            className="max-w-full md:max-w-md"
            alt="request"
          />

        </div>

      </section>

    </PageContainer>
  )
}

export default StoragePage
