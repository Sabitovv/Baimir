import { Link } from 'react-router-dom'
import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import MainPhoto from '@/assets/storage/MainPhoto.webp'
import Photo from '@/assets/storage/Photo.webp'
import Photo2 from '@/assets/storage/Photo1.webp'
import Photo3 from '@/assets/storage/Photo2.webp'
import Component from '@/pages/Storage/StorageComponent'
import Contact from '@/components/common/Contact'
import BlogCard from '@/components/common/BlogCardProps'
import bidImg from '@/assets/storage/bidImg.webp'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { EditableImage } from '@/zustand/EditableImage'
import { useGetBlogsQuery, type BlogContentBlock } from '@/api/blogsApi'

type StorageImageItem = {
  key: string
  src: string
}

type LocalizedText = {
  ru?: string
  en?: string
  kz?: string
}

const pickLocalized = (value?: LocalizedText | string, lang?: string): string => {
  if (!value) return ''
  if (typeof value === 'string') return value

  const current = lang === 'kk' ? 'kz' : lang
  const localized = current ? value[current as keyof LocalizedText] : undefined

  return localized || value.ru || value.en || value.kz || ''
}

const getBlockImage = (block?: BlogContentBlock): string | null => {
  if (!block?.data) return null
  const direct = typeof block.data.imageUrl === 'string' ? block.data.imageUrl : null
  const url = typeof block.data.url === 'string' ? block.data.url : null
  const candidate = direct || url
  return candidate && candidate.trim() ? candidate : null
}

const getBlogImage = (value: {
  imageUrl?: string | null
  coverImage?: string | null
  coverImageUrl?: string | null
  thumbnailUrl?: string | null
  contentBlocks?: BlogContentBlock[]
}) => {
  const direct = value.imageUrl || value.coverImage || value.coverImageUrl || value.thumbnailUrl
  if (direct && direct.trim()) return direct
  const fromBlocks = value.contentBlocks?.find((block) => Boolean(getBlockImage(block)))
  return getBlockImage(fromBlocks) || ''
}

const formatDate = (iso?: string, lang?: string) => {
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''

  const locale = lang === 'en' ? 'en-US' : lang === 'kk' || lang === 'kz' ? 'kk-KZ' : 'ru-RU'
  return parsed.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const pickStringField = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const pickNumberField = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return undefined
}

const StoragePage = () => {
  const storageImages: StorageImageItem[] = [
    { key: 'storage_page_main_photo_1', src: MainPhoto },
    { key: 'storage_page_main_photo_2', src: Photo2 },
    { key: 'storage_page_main_photo_3', src: Photo },
    { key: 'storage_page_main_photo_4', src: Photo3 },
  ]

  const [choose, setChoose] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const { i18n, t } = useTranslation()

  const { data: blogsData, isLoading: isBlogsLoading, isError: isBlogsError } = useGetBlogsQuery({
    page: 0,
    size: 3,
    sort: 'publishedAt,DESC',
    lang: i18n.language,
  })

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 mt-6 sm:mt-8 md:mt-12">
        <aside className="hidden lg:block w-full">
          <CategoriesMenu />
        </aside>

        <main className="w-full min-w-0">
          <section>
            <ScrollReveal>
              <h1 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-[#F58322] leading-tight">
                {t('storage.title')}
              </h1>
              <h3 className="text-lg sm:text-xl font-bold my-4 mb-8 whitespace-pre-line">
                {t('storage.subTitle')}
              </h3>
              <h3 className="text-lg sm:text-xl font-bold mt-1 mb-8 whitespace-pre-line">
                {t('storage.subTitle2')}
              </h3>
            </ScrollReveal>

            <section className="mt-6 sm:mt-8 mb-6 sm:mb-8">
              <ScrollReveal delay={0.2}>
                <EditableImage
                  imageKey={storageImages[activeImageIndex].key}
                  fallbackSrc={storageImages[activeImageIndex].src}
                  className="w-full h-auto aspect-video object-cover rounded-lg shadow-sm transition-opacity duration-300"
                  alt="storage main"
                />
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
                  {storageImages.slice(1).map((img, i) => {
                    const index = i + 1
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setChoose(index)
                          setActiveImageIndex(index)
                        }}
                        className={`cursor-pointer text-center transition-all duration-300 p-1 sm:p-2 rounded-lg ${choose === index
                          ? 'border-2 border-[#F58322] shadow-sm'
                          : 'border-2 border-transparent hover:border-gray-200'
                          }`}
                      >
                        <EditableImage
                          imageKey={img.key}
                          fallbackSrc={img.src}
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
            </ScrollReveal>

            <div className="mt-24">
              {isBlogsLoading && (
                <p className="text-gray-500 mb-4">{t('blogPage.loading')}</p>
              )}

              {isBlogsError && (
                <p className="text-red-600 mb-4">{t('blogPage.error')}</p>
              )}

              {!isBlogsLoading && !isBlogsError && (blogsData?.content?.length ?? 0) === 0 && (
                <p className="text-gray-500 mb-4">{t('blogPage.empty')}</p>
              )}

              {!isBlogsLoading && !isBlogsError && (blogsData?.content?.length ?? 0) > 0 && (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogsData?.content.map((post, index) => {
                    const rawPost = post as unknown as Record<string, unknown>
                    const title = pickLocalized(post.title, i18n.language) || t('blogPage.untitled')
                    const excerpt = pickLocalized(post.excerpt, i18n.language)
                    const image = getBlogImage(post)
                    const authorName = pickStringField(rawPost, ['authorName', 'author', 'author_name'])
                    const publishedRaw = pickStringField(rawPost, ['publishedAt', 'createdAt', 'created_at', 'date'])
                    const publishedAt = formatDate(publishedRaw, i18n.language)
                    const readingTime = pickNumberField(rawPost, ['readingTime', 'readingMinutes', 'reading_time'])
                    const viewsCount = pickNumberField(rawPost, ['viewsCount', 'viewCount', 'views', 'views_count'])

                    return (
                      <StaggerItem key={post.id || index} className="h-full">
                        <Link to={`/blog/${post.slug}`} className="block group h-full">
                          <BlogCard
                            image={image}
                            title={title}
                            excerpt={excerpt}
                            authorName={authorName}
                            publishedAt={publishedAt}
                            readingTime={readingTime}
                            viewsCount={viewsCount}
                          />
                        </Link>
                      </StaggerItem>
                    )
                  })}
                </StaggerContainer>
              )}
            </div>

            <ScrollReveal className="flex justify-center sm:justify-end mt-8">
              <Link to="/blog" className="font-bold text-base sm:text-lg text-[#F58322] flex items-center gap-2 hover:translate-x-1 transition-transform">
                {t('storage.other')}
                <span className="text-xl leading-none">→</span>
              </Link>
            </ScrollReveal>
          </section>
        </main>
      </div>

      <ScrollReveal y={50} className="mt-20 mb-16 sm:mt-28 sm:mb-20 flex flex-col-reverse lg:flex-row items-center lg:items-stretch gap-10 lg:gap-16">
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-semibold mb-6 sm:mb-8 uppercase text-center lg:text-left text-gray-900">
            {t('storage.contact')}
          </h2>
          <div className="max-w-xl mx-auto lg:mx-0">
            <Contact />
          </div>
        </div>

        <div className="w-full lg:w-1/2 hidden lg:flex">
          <EditableImage
            imageKey="storage_page_contact_bid"
            fallbackSrc={bidImg}
            alt="contact"
            className="w-full h-full min-h-[420px] object-cover"
          />
        </div>
      </ScrollReveal>
    </PageContainer>
  )
}

export default StoragePage
