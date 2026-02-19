import { useEffect, useState, useMemo } from 'react'
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom'
import OpenButton from '@/assets/button1_for_sideBar.svg'
import CloseButton from '@/assets/button2_for_sideBar.svg'
import { useGetCategoriesTreeQuery, type Category } from '@/api/categoriesApi'

type TreeCategory = Category & {
    children: TreeCategory[]
}

const CategoriesMenu = () => {
    const { data: categories = [] } = useGetCategoriesTreeQuery()
    const { categoryId } = useParams<{ categoryId: string }>()
    const [searchParams] = useSearchParams()
    const location = useLocation()

    const rawActiveId = categoryId ?? searchParams.get('categoryId')
    const activeId = rawActiveId ? Number(rawActiveId) : null

    const isRootCatalog = location.pathname === '/catalog' && !location.search

    const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({})

    const rootCategories = useMemo(() => {
        const map = new Map<number, TreeCategory>()
        categories.forEach(c => map.set(Number(c.id), { ...c, children: [] } as TreeCategory))
        const roots: TreeCategory[] = []
        categories.forEach(c => {
            const node = map.get(Number(c.id))
            if (node) {
                if (c.parentId) {
                    const parent = map.get(Number(c.parentId))
                    if (parent) {
                        parent.children.push(node)
                    }
                } else {
                    roots.push(node)
                }
            }
        })
        return roots
    }, [categories])

    useEffect(() => {
        if (isRootCatalog) {
            setOpenCategories({})
            return
        }

        if (!activeId || categories.length === 0) return

        const parentsChain = new Set<number>()

        const hasChildren = categories.some(c => Number(c.parentId) === activeId)
        if (hasChildren) {
            parentsChain.add(activeId)
        }
        let curr = categories.find(c => Number(c.id) === activeId)
        while (curr && curr.parentId) {
            const pid = Number(curr.parentId)
            parentsChain.add(pid)
            curr = categories.find(c => Number(c.id) === pid)
        }

        setOpenCategories(prev => {
            const newState = { ...prev }

            Object.keys(newState).forEach(key => {
                const id = Number(key)
                if (!parentsChain.has(id)) {
                    newState[id] = false
                }
            })

            parentsChain.forEach(id => {
                newState[id] = true
            })

            return newState
        })

    }, [activeId, categories, isRootCatalog])

    const getAllDescendantIds = (parentId: number, allCats: Category[]) => {
        let ids: number[] = []
        const children = allCats.filter(c => Number(c.parentId) === parentId)
        children.forEach(child => {
            const childId = Number(child.id)
            ids.push(childId)
            ids = ids.concat(getAllDescendantIds(childId, allCats))
        })
        return ids
    }

    const toggleCategory = (id: number, siblings: TreeCategory[]) => {
        setOpenCategories(prev => {
            const newState = { ...prev }
            siblings.forEach(sibling => {
                const sId = Number(sibling.id)
                if (sId !== id) {
                    newState[sId] = false
                    const siblingDescendants = getAllDescendantIds(sId, categories)
                    siblingDescendants.forEach(dId => newState[dId] = false)
                }
            })

            const willOpen = !prev[id]
            newState[id] = willOpen

            if (!willOpen) {
                const descendants = getAllDescendantIds(id, categories)
                descendants.forEach(dId => newState[dId] = false)
            }

            return newState
        })
    }

    const getCategoryLink = (cat: TreeCategory | Category) => {
        const hasChildren = (cat as TreeCategory).children
            ? (cat as TreeCategory).children.length > 0
            : categories.some(c => Number(c.parentId) === Number(cat.id))

        if (hasChildren) {
            return `/catalog/${cat.slug}?categoryId=${cat.id}`
        } else {
            return `/catalog/${cat.slug}/products/${cat.id}`
        }
    }

    if (!categories.length) return null

    return (
        <aside className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 ">
            <div className="space-y-1">
                {rootCategories.map(cat => {
                    const isOpen = openCategories[Number(cat.id)]
                    const isActive = Number(cat.id) === activeId

                    return (
                        <div key={cat.id}>
                            <div className="flex items-center justify-between hover:bg-gray-50 rounded px-2 py-1">
                                <Link
                                    to={getCategoryLink(cat)}
                                    onClick={() => toggleCategory(Number(cat.id), rootCategories)}
                                    className={`flex-1 font-semibold text-lg transition ${isActive ? 'text-[#F05023]' : 'text-gray-700'}`}
                                >
                                    {cat.name}
                                </Link>

                                {cat.children && cat.children.length > 0 && (
                                    <button onClick={() => toggleCategory(Number(cat.id), rootCategories)} className="p-1">
                                        <img src={isOpen ? CloseButton : OpenButton} alt="toggle" />
                                    </button>
                                )}
                            </div>

                            {isOpen && cat.children && (
                                <div className="ml-4 pl-2 border-l border-gray-200 mt-1 space-y-1">
                                    {cat.children.map(child => {
                                        const isChildActive = Number(child.id) === activeId
                                        const isChildOpen = openCategories[Number(child.id)]
                                        const hasGrandChildren = child.children && child.children.length > 0

                                        return (
                                            <div key={child.id} className="block">
                                                <div className="flex items-center justify-between hover:bg-gray-50 rounded px-2 py-1">
                                                    <Link
                                                        to={getCategoryLink(child)}
                                                        onClick={() => {
                                                            if (hasGrandChildren) {
                                                                toggleCategory(Number(child.id), cat.children)
                                                            }
                                                        }}
                                                        className={`flex-1 text-xs transition ${isChildActive ? 'text-[#F05023] font-bold' : 'hover:text-[#F05023]'}`}
                                                    >
                                                        {child.name}
                                                    </Link>

                                                    {hasGrandChildren && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleCategory(Number(child.id), cat.children)
                                                            }}
                                                            className="p-1"
                                                        >
                                                            <img src={isChildOpen ? CloseButton : OpenButton} alt="toggle" />
                                                        </button>
                                                    )}
                                                </div>

                                                {isChildOpen && child.children && child.children.length > 0 && (
                                                    <div className="ml-4 pl-2 border-l border-gray-200 mt-1 space-y-1">
                                                        {child.children.map(grandChild => {
                                                            const isGrandChildActive = Number(grandChild.id) === activeId
                                                            return (
                                                                <div key={grandChild.id}>
                                                                    <Link
                                                                        to={getCategoryLink(grandChild)}
                                                                        className={`block text-xs py-1 ${isGrandChildActive ? 'text-[#F05023] font-medium' : ' hover:text-[#F05023]'}`}
                                                                    >
                                                                        {grandChild.name}
                                                                    </Link>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </aside>
    )
}

export default CategoriesMenu