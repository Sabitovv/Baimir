import { Link } from "react-router-dom"
type CategoryCardProps = {
  title: string
  image: string
  count: number
  inStock?: boolean
  onClick?: () => void
}

const CategoryCard = ({
  title,
  image,
  count,
  inStock = true,
  onClick
}: CategoryCardProps) => {
  return (
    <Link to={`/Baimir/Technology/${title}`}>
      <div
        onClick={onClick}
        className="
          cursor-pointer
          bg-white
          rounded-xl
          shadow-sm
          hover:shadow-md
          transition
          overflow-hidden
          group
        "
      >
        <div className="relative bg-gray-50 p-4 flex items-center  h-[220px]">
          <img
            src={image}
          />

          <div className="absolute top-3 right-3 bg-white text-xs px-2 py-1 rounded-full shadow">
            {count} товар
          </div>

          {inStock && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              В наличии
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-bold uppercase leading-snug group-hover:text-[#F05023] transition">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

export default CategoryCard
