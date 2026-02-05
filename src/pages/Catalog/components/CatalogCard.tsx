
const CatalogCard = ({ product }: { product: { image: string; title: string; code: string; price: string } }) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-sm hover:shadow-lg transition flex flex-col h-full group">
      {/* Изображение */}
      <div className="h-40 flex items-center justify-center mb-4 relative">
        <img src={product.image} alt={product.title} className="max-h-full object-contain" />
      </div>

      {/* Название */}
      <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1 group-hover:text-orange-600 transition-colors">
        {product.title}
      </h3>

      {/* Артикул */}
      <p className="text-xs text-gray-400 mb-3">Код: {product.code}</p>

      {/* Цена */}
      <div className="mt-auto">
        <p className="text-lg font-bold text-gray-900 mb-3">{product.price}</p>
        
        {/* Кнопка */}
        <button className="w-full bg-[#E3541C] text-white py-2 text-sm font-bold uppercase hover:bg-orange-700 transition rounded-sm">
          Купить
        </button>
      </div>
    </div>
  )
}
export default CatalogCard