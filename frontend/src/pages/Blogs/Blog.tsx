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
  kk?: string
}

const pickLocalized = (value?: LocalizedText | string, lang?: string): string => {
  if (!value) return ''
  if (typeof value === 'string') return value

  const current = lang === 'kk' ? 'kz' : lang
  const localized = current ? value[current as keyof LocalizedText] : undefined

  return localized || value.ru || value.en || value.kz || value.kk || ''
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

const BlogPage = () => {
  const [page, setPage] = useState(0)
  const pageSize = 12
  const { i18n } = useTranslation()

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
              Блог компании
            </h1>

            <h3 className="font-oswald font-bold mt-4 mb-6 text-2xl md:text-3xl">
              Подберем станки под ваш бизнес
            </h3>

            <p className="max-w-3xl mb-6 text-sm font-Monaper text-[#233337] leading-relaxed">
              Публикуем полезные материалы о выборе оборудования, автоматизации производства и запуске цехов.
            </p>
          </ScrollReveal>

          {isLoading && <p className="text-gray-500 mb-6">Загрузка статей...</p>}

          {isError && (
            <p className="text-red-600 mb-6">Не удалось загрузить ленту блога. Попробуйте обновить страницу.</p>
          )}

          {!isLoading && !isError && data?.content?.length === 0 && (
            <p className="text-gray-500 mb-6">Пока нет опубликованных статей.</p>
          )}

          {!isLoading && !isError && (data?.content?.length ?? 0) > 0 && (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.content.map((post, index) => {
                const title = pickLocalized(post.title, i18n.language) || 'Без названия'
                const excerpt = pickLocalized(post.excerpt, i18n.language)
                const image = getBlogImage(post)

                return (
                  <StaggerItem key={post.id || index}>
                    <Link to={`/blog/${post.slug}`} className="block group">
                      <BlogCard image={image} text={excerpt || title} />
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
                  Назад
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
                  Вперед
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
