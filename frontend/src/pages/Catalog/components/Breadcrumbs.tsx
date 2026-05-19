import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from "@/app/hooks"

const Breadcrumbs = () => {
    const breadcrumbs = useAppSelector(
        state => state.catalog.breadcrumbs
    )
    const listRef = useRef<HTMLOListElement | null>(null)

    useEffect(() => {
        const node = listRef.current
        if (!node) return

        const frame = requestAnimationFrame(() => {
            node.scrollLeft = node.scrollWidth
        })

        return () => cancelAnimationFrame(frame)
    }, [breadcrumbs])

    if (!breadcrumbs || breadcrumbs.length === 0) return null

    return (
        <nav
            aria-label="Breadcrumb"
            className="mb-3 mt-2 sm:mb-6 sm:mt-4"
        >
            <ol
                ref={listRef}
                className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm leading-6 text-gray-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:whitespace-normal sm:text-base"
            >

                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1

                    let toPath = item.path

                    if (!toPath) {
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
                        <li key={index} className="flex min-w-0 shrink-0 items-center sm:shrink">
                            {index > 0 && <span className="mx-1.5 text-base text-gray-400 sm:mx-2.5">›</span>}

                            {isLast ? (
                                <span
                                    className="max-w-[170px] truncate px-1 py-1 font-semibold text-[#F58322] sm:max-w-none"
                                    title={item.name}
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    to={toPath}
                                    className="max-w-[170px] truncate rounded px-1 py-1 transition-colors hover:text-[#DB741F] sm:max-w-none"
                                    title={item.name}
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumbs
