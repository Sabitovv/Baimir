import { useContext } from 'react'
import { CartAnimationContext } from '../animations/CartAnimationContext'

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext)
  if (!context) {
    throw new Error('useCartAnimation must be used within CartAnimationProvider')
  }
  return context
}
