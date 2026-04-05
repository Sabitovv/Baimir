import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetBlogsQuery, type BlogContentBlock } from '@/api/blogsApi'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import PageContainer from '@/components/ui/PageContainer'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

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
  return getBlockImage(fromBlocks)
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

const NewsSection = () => {
  const { i18n, t } = useTranslation()

  const { data, isLoading, isError } = useGetBlogsQuery({
    page: 0,
    size: 3,
    sort: 'publishedAt,DESC',
    lang: i18n.language,
  })

  return (
    <section className="py-16 md:py-20 bg-[#F5F5F5]">
      <PageContainer>

        <ScrollReveal>
          <div className='flex items-end justify-between'>
            <h2 className="font-oswald font-bold uppercase text-[#111111]
                text-3xl md:text-4xl xl:text-5xl mb-10">
              {t('home.news.title')}
            </h2>
            <Link to="/Blog" className='font-manrope font-semibold uppercase text-[#111111] text-sm md:text-md xl:text-xl mb-10 hover:text-[#DB741F] hover:underline'>
              {t('home.news.readmore')}
            </Link>
          </div>

        </ScrollReveal>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F58322]"></div>
          </div>
        )}

        {isError && (
          <p className="text-red-600 text-center py-8">{t('blogPage.error')}</p>
        )}

        {!isLoading && !isError && data?.content && data.content.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((post, index) => {
              const rawPost = post as unknown as Record<string, unknown>
              const title = pickLocalized(post.title, i18n.language) || t('blogPage.untitled')
              const excerpt = pickLocalized(post.excerpt, i18n.language)
              const image = getBlogImage(post) || ''
              const authorName = pickStringField(rawPost, ['authorName', 'author', 'author_name'])
              const publishedRaw = pickStringField(rawPost, ['publishedAt', 'createdAt', 'created_at', 'date'])
              const publishedAt = formatDate(publishedRaw, i18n.language)
              const readingTime = pickNumberField(rawPost, ['readingTime', 'readingMinutes', 'reading_time'])
              const viewsCount = pickNumberField(rawPost, ['viewsCount', 'viewCount', 'views', 'views_count'])

              return (
                <StaggerItem key={post.id || index} className="h-full">
                  <Link to={`/blog/${post.slug}`} className="block group h-full">
                    <article className="bg-white shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col cursor-pointer h-full rounded-lg overflow-hidden">
                      <div className="relative overflow-hidden">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-[160px] object-cover transform group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#F58322] transition-colors duration-300">
                          {title}
                        </h3>

                        {excerpt && (
                          <p className="text-xs leading-relaxed text-gray-500 line-clamp-2 mb-3">
                            {excerpt}
                          </p>
                        )}

                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <div className="flex items-center gap-1">
                              <PersonOutlineRoundedIcon sx={{ fontSize: 14, color: '#F58322' }} />
                              <span className="truncate max-w-[80px]">{authorName || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarTodayRoundedIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                              <span className="truncate">{publishedAt}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AccessTimeRoundedIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                              <span>
                                {typeof readingTime === 'number' && readingTime > 0
                                  ? `${readingTime} ${t('blogCard.minutes')}`
                                  : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <VisibilityRoundedIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                              <span>{typeof viewsCount === 'number' && viewsCount >= 0 ? `${viewsCount}` : '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </article>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}

        {!isLoading && !isError && (!data?.content || data.content.length === 0) && (
          <p className="text-gray-500 text-center py-8">{t('blogPage.empty')}</p>
        )}

      </PageContainer>
    </section>
  )
}

export default NewsSection
