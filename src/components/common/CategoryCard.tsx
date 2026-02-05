import { Link } from "react-router-dom"
type CategoryCardProps = {
  title: string
  image: string
  onClick?: () => void
}

const CategoryCard = ({
  title,
  image,
  onClick
}: CategoryCardProps) => {
  return (
    <Link to={`/Technology/${title}`}>
      
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
        <div className="p-4">
          <h3 className="text-sm text-center font-bold uppercase leading-snug group-hover:text-[#F05023] transition">
            {title}
          </h3>
        </div>
        <div className="relative bg-gray-50 p-4 flex items-center  h-[220px]">
          <img
            src={image}
          />
        </div>

      </div>
    </Link>
  )
}

export default CategoryCard
