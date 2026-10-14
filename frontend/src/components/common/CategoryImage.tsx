import { useState } from 'react'
import sampleImg from '@/assets/catalog/sample_machine.png'

type CategoryImageProps = { src?: string | null; alt: string; priority?: boolean }

const CategoryImageContent = ({ src, alt, priority = false }: CategoryImageProps) => {
  const [resolvedSrc, setResolvedSrc] = useState(src || sampleImg)
  const [isLoaded, setIsLoaded] = useState(false)
  return (
    <div className="relative w-full h-[100px] sm:h-[130px] flex items-center justify-center overflow-hidden shrink-0">
      <div aria-hidden="true" className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      <img
        src={resolvedSrc} alt={alt} loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'} decoding="async"
        width={130} height={130} sizes="(max-width: 768px) 45vw, (max-width: 1280px) 28vw, 220px"
        onLoad={() => setIsLoaded(true)}
        onError={() => { if (resolvedSrc !== sampleImg) setResolvedSrc(sampleImg); else setIsLoaded(true) }}
        className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

export default function CategoryImage(props: CategoryImageProps) {
  return <CategoryImageContent key={props.src || sampleImg} {...props} />
}
