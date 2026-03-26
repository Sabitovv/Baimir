import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToCart, incrementQuantity, decrementQuantity, removeFromCart } from '@/features/cartSlice'
import { useCartAnimation } from '../animations/useCartAnimation'
import { addToCompare, removeFromCompare } from "@/features/compareSlice"
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'


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
}

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=No+image"

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
}) => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const compareItems = useAppSelector((state) => state.compare.items)
  const [compareError, setCompareError] = React.useState<string | null>(null)
  const cartItem = items.find((item) => item.id === id)
  const imgSrc = coverImage ?? PLACEHOLDER_IMG
  const { addAnimation } = useCartAnimation()

  const isInCompare = compareItems.some((item) => item.id === id)

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

    const activeCategoryId = compareItems[0]?.categoryId

    if (activeCategoryId && activeCategoryId !== productCategoryId) {
      setCompareError(t('compare.onlyOneCategory'))
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

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString(i18n.language)} ₸`
    : "—"

  const normalizedFeatures = React.useMemo(() => {
    return (keyFeatures ?? [])
      .map((f) => normalizeFeature(f))
      .filter((f): f is { label?: string; value: string; unit?: string } => !!f)
      .slice(0, 3)
  }, [keyFeatures])

  return (
    <Link
      to={`/catalog/product/${slug}`}
      className="bg-white border border-gray-200 p-4 rounded-sm hover:shadow-lg transition flex flex-col h-full group"
    >
      <div className="h-40 flex items-center justify-center mb-4">
        <img
          src={imgSrc}
          alt={name}
          className="max-h-full object-contain"
          loading="lazy"
        />
      </div>

      <h3 className="text-sm font-extrabold text-gray-800 leading-tight mb-2 group-hover:text-[#DB741F] transition-colors line-clamp-2">
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

      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            handleCompareToggle()
          }}
          className={`flex w-1/5 items-center justify-center rounded-sm border py-2 text-xs font-bold uppercase${
            isInCompare
              ? 'border-[#F58322] bg-[#FFF4EA] text-[#DB741F]'
              : 'border-gray-300 text-gray-700 hover:border-[#F58322] hover:text-[#DB741F]'
          }`}
        >
          {isInCompare ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CompareArrowsIcon sx={{ fontSize: 16 }} />}

        </button>

        {compareError && (
          <p className="text-xs leading-tight text-red-600">{compareError}</p>
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
            className={`w-full py-2 text-sm font-extrabold uppercase rounded-sm transition ${
              inStock === false
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#F58322] text-white hover:bg-[#DB741F]"
            }`}
            disabled={inStock === false}
            onClick={(event) => {
              event.preventDefault()

              if (inStock === false || !Number.isFinite(priceNumber)) return

              addAnimation(id, imgSrc, event)
              
              dispatch(
                addToCart({
                  id,
                  slug,
                  name,
                  image: imgSrc,
                  price: priceNumber,
                  oldPrice,
                  inStock,
                })
              )
            }} 
          >
            {inStock === false ? t('commonCatalog.outOfStock') : t('commonCatalog.buy')}
          </button>
        )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
