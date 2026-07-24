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
    <div>
      
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
        <div className="relative bg-gray-50 p-4 flex items-center justify-center h-[220px] aspect-[4/3] overflow-hidden">
          {imageKey ? (
            <EditableImage
              imageKey={imageKey}
              fallbackSrc={image}
              alt={title}
              width={320}
              height={240}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              src={image}
              alt={title}
              width={320}
              height={240}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default CategoryCard
