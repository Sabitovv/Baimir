import { useContext } from 'react'
import { CartAnimationContext } from './CartAnimationContext'

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext)
  if (!context) {
    throw new Error('useCartAnimation must be used within CartAnimationProvider')
  }
  return context
}
