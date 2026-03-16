import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CartCard from './CartCard'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { decrementQuantity, incrementQuantity, removeFromCart } from '@/features/cartSlice'

type CartProps = {
  isOpen?: boolean
  onClose: () => void
}

const Cart = ({ isOpen = false, onClose }: CartProps) => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

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

  const onIncrement = (id: number) => {
    dispatch(incrementQuantity(id))
  }

  const onDecrement = (id: number) => {
    dispatch(decrementQuantity(id))
  }

  const onRemove = (id: number) => {
    dispatch(removeFromCart(id))
  }


  if (!isOpen) return null


  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-black">{t('cart.title')}</h2>
          <button onClick={onClose} className="text-sm font-medium text-gray-600 hover:text-black">
            {t('cart.close')}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6">
              <p className="text-base font-semibold text-gray-900">{t('cart.emptyTitle')}</p>
              <p className="mt-2 text-sm text-gray-500">{t('cart.emptyDescription')}</p>
              <Link
                to="/catalog"
                onClick={onClose}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#F58322] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#DB741F]"
              >
                {t('cart.goToCatalog')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartCard
                  key={item.id}
                  image={item.image}
                  title={item.name}
                  price={item.price}
                  oldPrice={item.oldPrice}
                  quantity={item.quantity}
                  onIncrement={() => onIncrement(item.id)}
                  onDecrement={() => onDecrement(item.id)}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t('cart.itemsCount', { count: itemsCount })}</span>
            <span>{total.toLocaleString(i18n.language)} ₸</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-gray-900">
            <span>{t('cart.total')}</span>
            <span>{total.toLocaleString(i18n.language)} ₸</span>
          </div>

          <button
            disabled={items.length === 0}
            className="w-full rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {t('cart.submitRequest')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
