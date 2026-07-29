import { createContext, useState, type ReactNode } from 'react'

export type AnimationItem = {
  id: number
  image: string
  position: { x: number; y: number }
}

type CartAnimationContextType = {
  animations: AnimationItem[]
  addAnimation: (id: number, image: string, event: React.MouseEvent) => void
  removeAnimation: (id: number) => void
}

const CartAnimationContext = createContext<CartAnimationContextType | null>(null)

export { CartAnimationContext }

const getAdaptiveOffset = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  return isMobile ? 30 : 40
}

export const CartAnimationProvider = ({ children }: { children: ReactNode }) => {
  const [animations, setAnimations] = useState<AnimationItem[]>([])

  const addAnimation = (id: number, image: string, event: React.MouseEvent) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const offset = getAdaptiveOffset()
    
    setAnimations((prev) => [
      ...prev,
      {
        id,
        image,
        position: {
          x: rect.left + rect.width / 2 - offset,
          y: rect.top + rect.height / 2 - offset,
        },
      },
    ])
  }

  const removeAnimation = (id: number) => {
    setAnimations((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <CartAnimationContext.Provider value={{ animations, addAnimation, removeAnimation }}>
      {children}
    </CartAnimationContext.Provider>
  )
}
