
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

    <article className="bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col cursor-pointer h-full rounded-sm overflow-hidden">

      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-extrabold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#DB741F] transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="text-xs leading-relaxed text-[#4A5B5F] line-clamp-2 mb-3">
            {excerpt}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 text-[11px] text-[#55676B] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4044]">
            <PersonOutlineRoundedIcon sx={{ fontSize: 15, color: '#F58322' }} />
            <span className="truncate">{authorLabel}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#F8FAFA] px-2 py-1 min-w-0">
              <CalendarTodayRoundedIcon sx={{ fontSize: 12, color: '#7B8C90' }} />
              <span className="truncate">{dateLabel}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#F8FAFA] px-2 py-1 min-w-0">
              <AccessTimeRoundedIcon sx={{ fontSize: 12, color: '#7B8C90' }} />
              <span className="truncate">{readingLabel}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#F8FAFA] px-2 py-1 min-w-0">
              <VisibilityRoundedIcon sx={{ fontSize: 13, color: '#7B8C90' }} />
              <span className="truncate">{viewsLabel}</span>
            </div>
          </div>
        </div>
      </div>

    </article>

  )
}

export default BlogCard
