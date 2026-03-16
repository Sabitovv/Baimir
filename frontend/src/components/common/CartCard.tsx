import { useTranslation } from 'react-i18next'

type CartCardProps = {
  image: string
  title: string
  price: number
  oldPrice?: number | null
  quantity: number
  onDecrement?: () => void
  onIncrement?: () => void
  onRemove?: () => void
}

const formatPrice = (value: number, locale: string) => `${value.toLocaleString(locale)} ₸`

const CartCard = ({
  image,
  title,
  price,
  oldPrice,
  quantity,
  onDecrement,
  onIncrement,
  onRemove,
}: CartCardProps) => {
  const { t, i18n } = useTranslation()

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <img src={image} alt={title} className="h-20 w-20 rounded-lg object-cover bg-gray-100" loading="lazy" />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{title}</h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold text-[#F58322]">{formatPrice(price, i18n.language)}</span>
            {oldPrice && oldPrice > price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(oldPrice, i18n.language)}</span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex items-center rounded-md border border-gray-300">
              <button
                type="button"
                onClick={onDecrement}
                className="h-7 w-7 text-gray-700 hover:bg-gray-100"
                aria-label={t('cart.decreaseQuantity')}
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={onIncrement}
                className="h-7 w-7 text-gray-700 hover:bg-gray-100"
                aria-label={t('cart.increaseQuantity')}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-medium text-gray-500 hover:text-red-500"
            >
              {t('cart.remove')}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CartCard
