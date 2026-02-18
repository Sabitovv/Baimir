
type BlogCardProps = {
  image: string
  text: string
}

const BlogCard = ({ image, text }: BlogCardProps) => {
  return (

    <article className="bg-white shadow-sm hover:shadow-md transition flex flex-col cursor-pointer h-full">

      <img
        src={image}
        className="w-full h-[200px] object-cover"
      />

      <div className="p-4 flex flex-col flex-grow">
        <p className="leading-relaxed line-clamp-3 flex-grow font-extrabold text-sm">
          {text}
        </p>
      </div>

    </article>

  )
}

export default BlogCard
