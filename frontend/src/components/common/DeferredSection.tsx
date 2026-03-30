import { useEffect, useRef, useState, type ReactNode } from 'react'

type DeferredSectionProps = {
  children: ReactNode
  placeholderClassName?: string
  rootMargin?: string
}

const DeferredSection = ({
  children,
  placeholderClassName = 'min-h-[320px]',
  rootMargin = '350px 0px',
}: DeferredSectionProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const placeholderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isVisible || !placeholderRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { rootMargin }
    )

    observer.observe(placeholderRef.current)

    return () => observer.disconnect()
  }, [isVisible, rootMargin])

  if (isVisible) {
    return <>{children}</>
  }

  return <div ref={placeholderRef} className={placeholderClassName} aria-hidden="true" />
}

export default DeferredSection
