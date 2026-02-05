import { Link } from 'react-router-dom'
import { useAppSelector } from "@/app/hooks"

const Breadcrumbs = () => {
    const breadcrumbs = useAppSelector(
        state => state.catalog.breadcrumbs
    )


    return(
        <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-6 mt-4">
            <Link to="/catalog" className="hover:text-orange-600">Каталог</Link>
            {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    const path = `/catalog/${breadcrumbs
                        .slice(0, index + 1)
                        .map(b => b.slug)
                        .join('/')}`
                return(
                <div key={item.id} className="flex items-center">
                    <span className="mx-2">›</span>
                    {isLast ? (
                        <span className="text-orange-600 font-medium">
                            {item.name}
                        </span>
                    ) : (
                        <Link to={`${path}?categoryId=${item.id}`} className="hover:text-orange-600">
                            {item.name}
                        </Link>
                    )}
                </div>
                )
            })}
        </nav>
    )}
export default Breadcrumbs

{/* <a href="#" className="hover:text-orange-600">Металлообработка</a>
<span className="mx-2">›</span>
<a href="#" className="hover:text-orange-600">Станки для раскроя металла</a>
<span className="mx-2">›</span>
<span className="text-orange-600 font-medium">Лазерные станки</span> */}