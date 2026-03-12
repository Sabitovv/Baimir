import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import { useGetBlogBySlugQuery, type BlogContentBlock } from '@/api/blogsApi'
import defaultImage from '@/assets/home/lazerStanok.webp'

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

const formatDate = (iso?: string) => {
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
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
  return getBlockImage(fromBlocks) || defaultImage
}

const renderContentBlock = (block: BlogContentBlock, index: number) => {
  const key = `${block.type}-${index}`

  if (block.type === 'heading') {
    const text = String(block.data?.text ?? '').trim()
    if (!text) return null
    const levelRaw = Number(block.data?.level)
    const level = Number.isFinite(levelRaw) ? Math.max(2, Math.min(levelRaw, 4)) : 2
    if (level === 2) {
      return <h2 key={key} className="font-oswald font-bold text-3xl mt-10 mb-5">{text}</h2>
    }
    if (level === 3) {
      return <h3 key={key} className="font-oswald font-bold text-2xl mt-8 mb-4">{text}</h3>
    }
    return <h4 key={key} className="font-oswald font-bold text-xl mt-6 mb-3">{text}</h4>
  }

  if (block.type === 'paragraph') {
    return (
      <p key={key} className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
        {String(block.data?.text ?? '')}
      </p>
    )
  }

  if (block.type === 'image') {
    const src = getBlockImage(block)
    if (!src) return null
    const alt = String(block.data?.alt ?? block.data?.title ?? 'blog image')
    const caption = typeof block.data?.caption === 'string' ? block.data.caption : ''

    return (
      <figure key={key} className="mb-8">
        <img src={src} alt={alt} className="w-full rounded-lg object-cover" loading="lazy" />
        {caption && <figcaption className="text-sm text-gray-500 mt-2">{caption}</figcaption>}
      </figure>
    )
  }

  if (block.type === 'list') {
    const items = Array.isArray(block.data?.items)
      ? block.data.items.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
    if (!items.length) return null
    const ordered = Boolean(block.data?.ordered)

    if (ordered) {
      return (
        <ol key={key} className="list-decimal pl-6 mb-6 text-gray-700 space-y-2">
          {items.map((item, itemIndex) => <li key={`${key}-ol-${itemIndex}`}>{item}</li>)}
        </ol>
      )
    }

    return (
      <ul key={key} className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        {items.map((item, itemIndex) => <li key={`${key}-ul-${itemIndex}`}>{item}</li>)}
      </ul>
    )
  }

  if (block.type === 'quote') {
    const quote = String(block.data?.quote ?? block.data?.text ?? '').trim()
    if (!quote) return null
    const author = typeof block.data?.author === 'string' ? block.data.author.trim() : ''

    return (
      <blockquote key={key} className="border-l-4 border-[#F58322] pl-5 py-1 mb-7 text-gray-700 italic">
        <p>{quote}</p>
        {author && <footer className="mt-2 text-sm text-gray-500 not-italic">— {author}</footer>}
      </blockquote>
    )
  }

  if (block.type === 'table') {
    const rows = Array.isArray(block.data?.rows) ? block.data.rows : []
    if (!rows.length) return null
    const [head, ...body] = rows

    return (
      <div key={key} className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {head.map((cell, cellIndex) => (
                <th key={`${key}-th-${cellIndex}`} className="px-4 py-3 text-left font-semibold border-b border-gray-200">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={`${key}-tr-${rowIndex}`} className="border-b border-gray-100 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${key}-td-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-gray-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (typeof block.data?.text === 'string' && block.data.text.trim()) {
    return (
      <p key={key} className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
        {block.data.text}
      </p>
    )
  }

  return null
}

const InnerBlog = () => {
  const { slug } = useParams()
  const { i18n } = useTranslation()

  const { data, isLoading, isError } = useGetBlogBySlugQuery(
    { slug: slug || '', lang: i18n.language },
    { skip: !slug }
  )

  if (isLoading) {
    return (
      <PageContainer>
        <div className="py-16 text-center text-gray-500">Загрузка статьи...</div>
      </PageContainer>
    )
  }

  if (!slug || isError || !data) {
    return (
      <PageContainer>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-oswald font-bold mb-3">Статья не найдена</h2>
          <p className="text-gray-600 mb-6">Проверьте ссылку или перейдите обратно в блог.</p>
          <Link to="/blog" className="inline-block bg-[#F58322] text-white px-5 py-2 rounded hover:bg-[#DB741F] transition-colors">
            Вернуться к блогу
          </Link>
        </div>
      </PageContainer>
    )
  }

  const title = pickLocalized(data.title, i18n.language) || 'Без названия'
  const excerpt = pickLocalized(data.excerpt, i18n.language)
  const publishedAt = formatDate(data.publishedAt)
  const heroImage = getBlogImage(data)

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-16">
        <aside className="hidden lg:block space-y-6">
          <CategoriesMenu />
        </aside>

        <article className="max-w-[900px] mb-16">
          <h1 className="font-oswald font-bold text-3xl md:text-4xl xl:text-5xl uppercase mb-5">
            {title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-8">
            {data.authorName && <span>Автор: {data.authorName}</span>}
            {publishedAt && <span>Дата: {publishedAt}</span>}
            {typeof data.readingTime === 'number' && <span>{data.readingTime} мин чтения</span>}
            {typeof data.viewsCount === 'number' && <span>{data.viewsCount} просмотров</span>}
          </div>

          {excerpt && (
            <p className="text-gray-800 leading-relaxed mb-8 text-lg">
              {excerpt}
            </p>
          )}

          <img
            src={heroImage}
            alt={title}
            className="w-full max-h-[480px] object-cover rounded-lg mb-8"
            loading="lazy"
          />

          {data.contentBlocks && data.contentBlocks.length > 0 ? (
            <div>
              {data.contentBlocks.map((block, index) => renderContentBlock(block, index))}
            </div>
          ) : (
            <p className="text-gray-600">Контент статьи пока не заполнен.</p>
          )}
        </article>
      </div>
    </PageContainer>
  )
}

export default InnerBlog
