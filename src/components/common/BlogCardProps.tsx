import { Link } from 'react-router-dom'

type BlogCardProps = {
  image: string
  text: string
  id: string
}

const BlogCard = ({ image, text, id }: BlogCardProps) => {
  return (
    <Link to={`/Blog/${id}`} className="block">

      <article className="bg-white shadow-sm hover:shadow-md transition flex flex-col cursor-pointer h-full">

        <img
          src={image}
          className="w-full h-[200px] object-cover"
        />

        <div className="p-4 flex flex-col flex-grow">
          <p className="leading-relaxed line-clamp-3 flex-grow font-Manrope font-extrabold text-sm">
            {text}
          </p>
        </div>

      </article>

    </Link>
  )
}

export default BlogCard
