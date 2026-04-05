import { Link } from "react-router-dom"
import { EditableImage } from '@/zustand/EditableImage'

type CategoryCardProps = {
  title: string
  image: string
  imageKey?: string
  onClick?: () => void
}

const CategoryCard = ({
  title,
  image,
  imageKey,
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
          <h3 className="text-sm text-center font-bold uppercase leading-snug group-hover:text-[#DB741F] transition">
            {title}
          </h3>
        </div>
        <div className="relative bg-gray-50 p-4 flex items-center  h-[220px]">
          {imageKey ? (
            <EditableImage imageKey={imageKey} fallbackSrc={image} alt={title} />
          ) : (
            <img src={image} alt={title} />
          )}
        </div>

      </div>
    </Link>
  )
}

export default CategoryCard
