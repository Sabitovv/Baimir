import { Link } from 'react-router-dom'
import { useAppSelector } from "@/app/hooks"

const Breadcrumbs = () => {
    const breadcrumbs = useAppSelector(
        state => state.catalog.breadcrumbs
    )

    if (!breadcrumbs || breadcrumbs.length === 0) return null

    return (
        <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-6 mt-4">

            {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1

                let toPath = item.path

                if (!toPath) {
                    console.log(item)
                    if (item.slug && item.id) {
                        toPath = `/catalog/${item.slug}?categoryId=${item.id}`
                    }
                    // else if (item.slug) {
                    //     toPath = `/catalog/${item.slug}`
                    // }
                    else if (item.path === '/catalog') {
                        toPath = '/catalog'
                    } else {
                        toPath = '/catalog'
                    }
                }

                return (
                    <div key={index} className="flex items-center">
                        {index > 0 && <span className="mx-2">›</span>}

                        {isLast ? (
                            <span className="text-orange-600 font-medium">
                                {item.name}
                            </span>
                        ) : (
                            <Link to={toPath} className="hover:text-orange-600">
                                {item.name}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}

export default Breadcrumbs