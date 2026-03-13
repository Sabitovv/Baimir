import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import BlogCard from '@/components/common/BlogCardProps'
import { useGetBlogsQuery, type BlogContentBlock } from '@/api/blogsApi'

import img1 from '@/assets/home/lazerStanok.webp'

import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

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
  return getBlockImage(fromBlocks) || img1
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

const BlogPage = () => {
  const [page, setPage] = useState(0)
  const pageSize = 12
  const { i18n, t } = useTranslation()

  const { data, isLoading, isError } = useGetBlogsQuery({
    page,
    size: pageSize,
    sort: 'publishedAt,DESC',
    lang: i18n.language,
  })

  const pages = useMemo(() => {
    const totalPages = data?.totalPages ?? 0
    return Array.from({ length: totalPages }, (_, idx) => idx)
  }, [data?.totalPages])

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-16">
        <aside className="hidden lg:block space-y-6">
          <CategoriesMenu />
        </aside>

        <section>
          <ScrollReveal>
            <h1 className="font-oswald font-bold text-3xl md:text-4xl xl:text-5xl uppercase text-[#F58322]">
              {t('blogPage.title')}
            </h1>

            <h3 className="font-oswald font-bold mt-4 mb-6 text-2xl md:text-3xl">
              {t('blogPage.subtitle')}
            </h3>

            <p className="max-w-3xl mb-6 text-sm font-Monaper text-[#233337] leading-relaxed">
              {t('blogPage.description')}
            </p>
          </ScrollReveal>

          {isLoading && <p className="text-gray-500 mb-6">{t('blogPage.loading')}</p>}

          {isError && (
            <p className="text-red-600 mb-6">{t('blogPage.error')}</p>
          )}

          {!isLoading && !isError && data?.content?.length === 0 && (
            <p className="text-gray-500 mb-6">{t('blogPage.empty')}</p>
          )}

          {!isLoading && !isError && (data?.content?.length ?? 0) > 0 && (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.content.map((post, index) => {
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
                  <StaggerItem key={post.id || index}>
                    <Link to={`/blog/${post.slug}`} className="block group">
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

          {!isLoading && !isError && (data?.totalPages ?? 0) > 1 && (
            <ScrollReveal y={20}>
              <div className="flex justify-center gap-2 mt-12 mb-12 flex-wrap">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={data?.first}
                  className="px-3 h-8 border text-xs rounded-sm disabled:opacity-40"
                >
                  {t('blogPage.prev')}
                </button>

                {pages.map((pageIndex) => (
                  <button
                    key={pageIndex}
                    onClick={() => setPage(pageIndex)}
                    className={`w-8 h-8 flex items-center justify-center border text-xs rounded-sm transition-colors duration-300 ${
                      pageIndex === (data?.number ?? 0)
                        ? 'bg-black text-white'
                        : 'hover:bg-black hover:text-white'
                    }`}
                  >
                    {pageIndex + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, (data?.totalPages ?? 1) - 1))}
                  disabled={data?.last}
                  className="px-3 h-8 border text-xs rounded-sm disabled:opacity-40"
                >
                  {t('blogPage.next')}
                </button>
              </div>
            </ScrollReveal>
          )}
        </section>
      </div>
    </PageContainer>
  )
}

export default BlogPage
