import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToCart, incrementQuantity, decrementQuantity, removeFromCart } from '@/features/cartSlice'
import { useCartAnimation } from '../animations/useCartAnimation'
import { addToCompare, removeFromCompare } from "@/features/compareSlice"
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import productPlaceholder from '@/assets/catalog/productPlaceholder.svg'


type KeyFeature = {
  code: string
  label: string
  value: string | number
  unit?: string
}

type ProductCardProps = {
  id: number
  slug: string
  name: string
  coverImage?: string | null
  price?: number | string | null
  oldPrice?: number | null
  inStock?: boolean
  keyFeatures?: KeyFeature[] | null
  categoryId?: number | null
  categoryName?: string | null
  showCompare?: boolean
}

const PLACEHOLDER_IMG = productPlaceholder

const normalizeFeature = (feature: KeyFeature): { label?: string; value: string; unit?: string } | null => {
  if (!feature) return null

  const rawLabel = feature.label ?? ""
  const rawValue = feature.value === undefined || feature.value === null ? "" : String(feature.value).trim()
  const rawUnit = feature.unit ?? ""

  if (!rawValue) return null

  const normalized: { label?: string; value: string; unit?: string } = { value: rawValue }
  if (rawLabel) normalized.label = rawLabel
  if (rawUnit) normalized.unit = rawUnit

  return normalized
}

const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  name,
  id,
  coverImage,
  price,
  oldPrice,
  inStock,
  keyFeatures,
  categoryId,
  categoryName,
  showCompare = true,
}) => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const compareItems = useAppSelector((state) => state.compare.items)
  const [compareError, setCompareError] = React.useState<string | null>(null)
  const cartItem = items.find((item) => item.id === id)
  const imgSrc = typeof coverImage === 'string' && coverImage.trim().length > 0 ? coverImage : PLACEHOLDER_IMG
  const [resolvedImgSrc, setResolvedImgSrc] = React.useState(imgSrc)
  const { addAnimation } = useCartAnimation()

  React.useEffect(() => {
    setResolvedImgSrc(imgSrc)
  }, [imgSrc])

  const isInCompare = compareItems.some((item) => item.id === id)
  const isOutOfStock = inStock === false

  const handleCompareToggle = () => {
    if (isInCompare) {
      dispatch(removeFromCompare(id))
      setCompareError(null)
      return
    }

    const productCategoryId = Number(categoryId)
    const isValidCategory = Number.isFinite(productCategoryId)

    if (!isValidCategory) {
      setCompareError(t('compare.categoryUnknown'))
      return
    }

    dispatch(
      addToCompare({
        id,
        slug,
        name,
        image: imgSrc,
        price: Number.isFinite(priceNumber) ? priceNumber : 0,
        categoryId: productCategoryId,
        categoryName: categoryName ?? '',
      }),
    )
    setCompareError(null)
  }

  const priceNumber =
    typeof price === "number"
      ? price
      : typeof price === "string"
      ? Number(price)
      : NaN

  const cartPrice = Number.isFinite(priceNumber) ? priceNumber : undefined

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString(i18n.language)} ₸`
    : t('commonCatalog.askPrice')

  const oldPriceNumber = typeof oldPrice === 'number' ? oldPrice : NaN
  const showOldPrice = Number.isFinite(oldPriceNumber) && Number.isFinite(priceNumber) && oldPriceNumber < priceNumber
  const formattedOldPrice = showOldPrice ? `${oldPriceNumber.toLocaleString(i18n.language)} ₸` : null

  const normalizedFeatures = React.useMemo(() => {
    return (keyFeatures ?? [])
      .map((f) => normalizeFeature(f))
      .filter((f): f is { label?: string; value: string; unit?: string } => !!f)
      .slice(0, 3)
  }, [keyFeatures])

  return (
    <Link
      to={`/catalog/product/${slug}`}
      className={`bg-white border border-gray-200 p-4 rounded-sm transition flex flex-col h-full group ${
        isOutOfStock ? 'border-gray-300' : 'hover:shadow-lg'
      }`}
    >
      <div className="relative h-40 flex items-center justify-center mb-4">
        <img
          src={resolvedImgSrc}
          alt={name}
          className={`max-h-full object-contain ${isOutOfStock ? 'opacity-80 saturate-75' : ''}`}
          loading="lazy"
          onError={() => setResolvedImgSrc(PLACEHOLDER_IMG)}
        />
      </div>

      <h3 className="font-manrope text-sm font-extrabold text-gray-800 leading-tight mb-2 group-hover:text-[#DB741F] transition-colors line-clamp-2">
        {name}
      </h3>

      {normalizedFeatures.length > 0 && (
        <div className="mb-3 space-y-1">
          {normalizedFeatures.map((nf, idx) => (
            <div key={idx} className="flex items-center text-xs gap-1">
              {nf.label && (
                <span className="text-gray-500 font-medium whitespace-nowrap">
                  {nf.label}:
                </span>
              )}
              <span className="text-gray-800 font-semibold truncate">
                {nf.value}
                {nf.unit ? ` ${nf.unit}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <p className="text-lg font-bold text-gray-900 mb-3">
          {formattedPrice}
        </p>
        {formattedOldPrice && (
          <p className="-mt-2 mb-3 text-xs text-gray-400 line-through">{formattedOldPrice}</p>
        )}

        <div className="flex gap-2 items-stretch">
          {showCompare && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                handleCompareToggle()
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border transition ${
                isInCompare
                  ? 'border-[#F58322] bg-[#FFF4EA] text-[#DB741F]'
                  : 'border-gray-300 text-gray-700 hover:border-[#F58322] hover:text-[#DB741F]'
              }`}
              aria-label={isInCompare ? t('compare.removeFromCompare') : t('compare.addToCompare')}
              title={isInCompare ? t('compare.removeFromCompare') : t('compare.addToCompare')}
            >
              {isInCompare ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CompareArrowsIcon sx={{ fontSize: 16 }} />}
            </button>
          )}

          {cartItem ? (
            <div className="flex w-full items-center justify-between bg-[#F58322] rounded-sm">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition"
              onClick={(event) => {
                event.preventDefault()
                if (cartItem.quantity <= 1) {
                  dispatch(removeFromCart(id))
                } else {
                  dispatch(decrementQuantity(id))
                }
              }}
            >
              −
            </button>
            <span className="text-white font-bold">{cartItem.quantity}</span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition"
              onClick={(event) => {
                event.preventDefault()
                dispatch(incrementQuantity(id))
              }}
            >
              +
            </button>
            </div>
          ) : (
            <button
              type="button"
              className={`w-full py-2 text-sm font-extrabold uppercase rounded-sm transition bg-[#F58322] text-white hover:bg-[#DB741F]`}
              onClick={(event) => {
                event.preventDefault()

                addAnimation(id, imgSrc, event)

                dispatch(
                  addToCart({
                    id,
                    slug,
                    name,
                    image: imgSrc,
                    price: cartPrice,
                    oldPrice,
                    inStock,
                  })
                )
              }}
            >
              {t('commonCatalog.buy')}
            </button>
          )}
        </div>

        {showCompare && compareError && (
          <p className="mt-2 text-xs leading-tight text-red-600">{compareError}</p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
