import { useEffect } from 'react'
import type { FC, ReactNode } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  mode?: 'slide' | 'drop'
  widthClass?: string
  heightClass?: string
}

const Drawer: FC<Props> = ({
  isOpen,
  onClose,
  title,
  children,
  mode = 'slide',
  widthClass = 'w-full md:w-[480px]',
  heightClass = 'h-auto md:h-[480px]',
}) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      const prevBodyOverflow = document.body.style.overflow
      const prevBodyPosition = document.body.style.position
      const prevBodyTop = document.body.style.top
      const prevBodyWidth = document.body.style.width
      const prevBodyLeft = document.body.style.left
      const prevBodyRight = document.body.style.right
      const prevHtmlOverflow = document.documentElement.style.overflow

      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.left = '0'
      document.body.style.right = '0'

      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow
        document.body.style.overflow = prevBodyOverflow
        document.body.style.position = prevBodyPosition
        document.body.style.top = prevBodyTop
        document.body.style.width = prevBodyWidth
        document.body.style.left = prevBodyLeft
        document.body.style.right = prevBodyRight

        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  const panelCommon =
    'pointer-events-auto bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out'
  const slidePanel = `${widthClass} absolute right-0 top-0 h-full transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
  const dropPanel = `absolute left-0 right-0 top-0 ${heightClass} transform ${isOpen ? 'translate-y-0' : '-translate-y-full'}`

  return (
    <div aria-hidden={!isOpen} className={`fixed inset-0 z-50 ${isOpen ? 'visible' : 'invisible delay-300'}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`${panelCommon} ${mode === 'slide' ? slidePanel : dropPanel}`}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} aria-label="Закрыть" className="p-2 rounded hover:bg-gray-100">
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="overflow-auto overscroll-contain p-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Drawer
