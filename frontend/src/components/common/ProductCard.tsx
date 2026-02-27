import React from "react"
import { Link } from "react-router-dom"

type ProductCardProps = {
  id: number
  slug: string
  name: string
  coverImage?: string | null
  price?: number | string | null
  inStock?: boolean
}

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=No+image"

const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  name,
  coverImage,
  price,
  inStock,
}) => {
  const imgSrc = coverImage ?? PLACEHOLDER_IMG

  const priceNumber =
    typeof price === "number"
      ? price
      : typeof price === "string"
      ? Number(price)
      : NaN

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString("ru-RU")} ₸`
    : "—"

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

      <h3 className="text-sm font-extrabold text-gray-800 leading-tight mb-3 group-hover:text-[#DB741F] transition-colors line-clamp-2">
        {name}
      </h3>
      <div className="mt-auto">
        <p className="text-lg font-bold text-gray-900 mb-3">
          {formattedPrice}
        </p>

        <button
          type="button"
          className={`w-full py-2 text-sm font-extrabold uppercase rounded-sm transition ${
            inStock === false
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#F58322] text-white hover:bg-[#DB741F]"
          }`}
          disabled={inStock === false}
          onClick={(e) => e.preventDefault()} 
        >
          {inStock === false ? "Нет в наличии" : "Купить"}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard