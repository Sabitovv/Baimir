import type { FC } from 'react'

type CollectionSkeletonProps = {
  count?: number
  layout?: 'carousel' | 'grid'
}

export const CollectionSkeleton: FC<CollectionSkeletonProps> = ({
  count = 4,
  layout = 'carousel',
}) => {
  if (layout === 'grid') {
    return (
      <div className='grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className='h-52 animate-pulse rounded-lg border border-[#ECEFF3] bg-gradient-to-b from-gray-100 to-gray-50 sm:h-64 sm:rounded-xl'
          />
        ))}
      </div>
    )
  }

  return (
    <div className='flex gap-2 overflow-hidden sm:gap-3'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='h-52 min-w-[186px] animate-pulse rounded-lg border border-[#ECEFF3] bg-gradient-to-b from-gray-100 to-gray-50 sm:h-64 sm:min-w-[238px] sm:rounded-xl'
        />
      ))}
    </div>
  )
}

type CollectionErrorProps = {
  message?: string
}

export const CollectionError: FC<CollectionErrorProps> = ({ message }) => {
  return (
    <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:rounded-xl sm:p-4 sm:text-sm'>
      {message ?? 'Не удалось загрузить подборку. Попробуйте позже.'}
    </div>
  )
}

type CollectionEmptyProps = {
  message?: string
}

export const CollectionEmpty: FC<CollectionEmptyProps> = ({ message }) => {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 sm:rounded-xl sm:p-4 sm:text-sm'>
      {message ?? 'Список товаров пока пуст.'}
    </div>
  )
}
