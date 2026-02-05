// type ProductCardProps = {
//     image: string
//     title: string
//     code: string
//     price: string
//     onBuy?: () => void
// }

const ProductCard = ({ title, price, image }: { title: string; price: string; image: string }) => {
  return (
    <div className="min-w-[220px] sm:min-w-[240px] lg:min-w-[260px] bg-white rounded-md shadow-sm p-4 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <img src={image} alt={title} className="max-h-28 object-contain" />
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-gray-500 mt-1">Код: 123-456</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">{price}</div>
        </div>

        <button className="bg-[#EA571E] text-white px-3 py-1 rounded text-sm hover:bg-[#d9481f] transition">
          Купить
        </button>
      </div>
    </div>
  )
}

export default ProductCard
