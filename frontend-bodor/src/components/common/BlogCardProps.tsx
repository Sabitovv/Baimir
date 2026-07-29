
import { useTranslation } from 'react-i18next'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'

type BlogCardProps = {
  image: string
  title: string
  excerpt?: string
  authorName?: string
  publishedAt?: string
  readingTime?: number
  viewsCount?: number
}

const BlogCard = ({
  image,
  title,
  excerpt,
  authorName,
  publishedAt,
  readingTime,
  viewsCount,
}: BlogCardProps) => {
  const { t } = useTranslation()
  const authorLabel = authorName?.trim() || '—'
  const dateLabel = publishedAt?.trim() || '—'
  const readingLabel = typeof readingTime === 'number' && readingTime > 0 ? `${readingTime} ${t('blogCard.minutes')}` : '—'
  const viewsLabel = typeof viewsCount === 'number' && viewsCount >= 0 ? `${viewsCount}` : '—'

  return (
    <article className="bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 cursor-pointer h-full rounded-sm overflow-hidden flex flex-col">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="p-3 flex flex-col flex-1 min-h-0">
        <h3 className="font-bold text-xs leading-tight line-clamp-2 mb-1.5 group-hover:text-[#DB741F] transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="text-[11px] leading-snug text-[#4A5B5F] line-clamp-2 mb-2">
            {excerpt}
          </p>
        )}

        <div className="mt-auto pt-2 border-t border-gray-100 space-y-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-[#55676B]">
            <PersonOutlineRoundedIcon sx={{ fontSize: 12, color: '#F58322' }} />
            <span className="truncate">{authorLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] text-[#55676B]">
            <div className="flex items-center gap-1">
              <CalendarTodayRoundedIcon sx={{ fontSize: 10, color: '#7B8C90' }} />
              <span className="truncate">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <AccessTimeRoundedIcon sx={{ fontSize: 10, color: '#7B8C90' }} />
              <span>{readingLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <VisibilityRoundedIcon sx={{ fontSize: 10, color: '#7B8C90' }} />
              <span>{viewsLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
