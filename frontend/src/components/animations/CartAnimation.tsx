import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartAnimation } from '../common/useCartAnimation'

const getAdaptiveSizes = (): { startWidth: number; startHeight: number; endWidth: number; endHeight: number; offset: number; isMobile: boolean } => {
  const isMobile = window.innerWidth < 1280
  return {
    startWidth: isMobile ? 60 : 80,
    startHeight: isMobile ? 60 : 80,
    endWidth: isMobile ? 28 : 40,
    endHeight: isMobile ? 28 : 40,
    offset: isMobile ? 30 : 40,
    isMobile,
  }
}

const findCartButton = (isMobile: boolean): HTMLElement | null => {
  const selector = isMobile ? '[data-cart-button-mobile]' : '[data-cart-button-desktop]'
  return document.querySelector(selector) as HTMLElement | null
}

const CartAnimation = () => {
  const { animations, removeAnimation } = useCartAnimation()
  const [endPositions, setEndPositions] = useState<{ [key: number]: { x: number; y: number } }>({})
  const [sizes, setSizes] = useState<{ startWidth: number; startHeight: number; endWidth: number; endHeight: number; offset: number; isMobile: boolean }>(() => getAdaptiveSizes())
  const animationIdsRef = useRef<number[]>([])
  const rafRef = useRef<number | undefined>(undefined)

  const updatePositions = useCallback(() => {
    const currentSizes = getAdaptiveSizes()
    const cartButton = findCartButton(currentSizes.isMobile)
    
    if (!cartButton || animationIdsRef.current.length === 0) return

    const rect = cartButton.getBoundingClientRect()
    setSizes(currentSizes)

    const newPositions: { [key: number]: { x: number; y: number } } = {}

    animations.forEach((anim) => {
      newPositions[anim.id] = {
        x: rect.left + rect.width / 2 - currentSizes.offset,
        y: rect.top + rect.height / 2 - currentSizes.offset,
      }
    })

    setEndPositions(newPositions)
  }, [animations])

  useEffect(() => {
    animationIdsRef.current = animations.map(a => a.id)
  }, [animations])

  useEffect(() => {
    if (animationIdsRef.current.length === 0) return

    const scheduleUpdate = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(() => {
        updatePositions()
      })
    }

    scheduleUpdate()

    const handleResize = () => {
      if (animationIdsRef.current.length > 0) {
        scheduleUpdate()
      }
    }

    const handleScroll = () => {
      if (animationIdsRef.current.length > 0) {
        scheduleUpdate()
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updatePositions])

  return (
    <AnimatePresence>
      {animations.map((anim) => (
        <motion.img
          key={anim.id}
          src={anim.image}
          alt="Flying"
          initial={{
            position: 'fixed',
            left: anim.position.x,
            top: anim.position.y,
            width: sizes.startWidth,
            height: sizes.startHeight,
            objectFit: 'cover',
            borderRadius: '8px',
            zIndex: 9999,
            opacity: 1,
          }}
          animate={{
            left: endPositions[anim.id]?.x ?? anim.position.x,
            top: endPositions[anim.id]?.y ?? anim.position.y,
            width: sizes.endWidth,
            height: sizes.endHeight,
            opacity: 0.8,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onAnimationComplete={() => removeAnimation(anim.id)}
        />
      ))}
    </AnimatePresence>
  )
}

export default CartAnimation
