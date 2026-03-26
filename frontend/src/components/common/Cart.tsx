import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CartCard from './CartCard'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, decrementQuantity, incrementQuantity, removeFromCart } from '@/features/cartSlice'
import { useCreateInquiryMutation } from '@/api/categoriesApi'

const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
)

type CartProps = {
  isOpen?: boolean
  onClose: () => void
}

const Cart = ({ isOpen = false, onClose }: CartProps) => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  
  const [openUp, setOpenUp] = useState(false)
  // Новое состояние для экрана успеха
  const [isSuccess, setIsSuccess] = useState(false)

  const [createInquiry, { isLoading }] = useCreateInquiryMutation()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setOpenUp(false)
      setIsSuccess(false)
    }, 300) 
  }

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

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setOpenUp(false)
        setIsSuccess(false)
      }, 300) 
    }
  }, [isOpen])

  const onIncrement = (id: number) => dispatch(incrementQuantity(id))
  const onDecrement = (id: number) => dispatch(decrementQuantity(id))
  const onRemove = (id: number) => dispatch(removeFromCart(id))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      sourceUrl: window.location.href
    }

    try {
      await createInquiry(payload).unwrap()
      
      setIsSuccess(true)
      
      dispatch(clearCart())
    } catch (error) {
      console.error(t('cart.submitErrorLog'), error)
      alert(t('cart.submitError'))
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >      
      <div
        className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-black">{t('cart.title')}</h2>
          <button onClick={handleClose} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
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
                onClick={handleClose}
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

        <div className="border-t border-gray-200 p-4 space-y-3 bg-white relative z-10">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t('cart.itemsTotalLabel')}</span>
            <span>{itemsCount} {t('cart.pieces')}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-gray-900">
            <span>{t('cart.totalToPay')}</span>
            <span>{total.toLocaleString(i18n.language)} ₸</span>
          </div>

          <button
            disabled={items.length === 0}
            className="w-full rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F] disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={() => setOpenUp(true)} 
          >
            {t('cart.submitRequest', 'Оформить заявку')}
          </button>
        </div>

        <div 
          className={`absolute bottom-0 left-0 right-0 h-full bg-white z-20 flex flex-col transition-transform duration-500 ease-in-out ${
            openUp ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {isSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50">
              <CheckCircleIcon />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.successTitle')}</h3>
              <p className="text-gray-600 mb-8">
                {t('cart.successDescription')}
              </p>
              <button
                onClick={handleClose}
                className="w-full max-w-xs rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F]"
              >
                {t('cart.backToShopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-semibold text-black">{t('cart.requestTitle')}</h3>
                <button 
                  onClick={() => setOpenUp(false)} 
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  {t('cart.back')}
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.form.name')} *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all"
                      placeholder={t('cart.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.form.phone')} *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all"
                      placeholder={t('cart.form.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.form.email')} *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all"
                      placeholder={t('cart.form.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.form.comment')}</label>
                    <textarea 
                      name="message" 
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#F58322] focus:border-transparent outline-none transition-all resize-none"
                      placeholder={t('cart.form.commentPlaceholder')}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6">
                    <div className="flex items-center justify-between text-base font-semibold text-gray-900 mb-4">
                      <span>{t('cart.orderSum')}</span>
                      <span>{total.toLocaleString(i18n.language)} ₸</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading} 
                      className="w-full rounded-lg bg-[#F58322] py-3 text-sm font-semibold text-white transition hover:bg-[#DB741F] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('cart.sending')}
                        </>
                      ) : (
                        t('cart.submitRequest')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart
