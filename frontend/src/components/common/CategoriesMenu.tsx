import { useState, useMemo, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import OpenButton from '@/assets/button1_for_sideBar.svg'
import CloseButton from '@/assets/button2_for_sideBar.svg'
import { useGetCategoriesTreeQuery, type Category } from '@/api/categoriesApi'
import { useTranslation } from 'react-i18next'
import { EditableImage } from '@/zustand/EditableImage'
import { buildCatalogTree, catalogAncestors, flattenCatalogTree } from '@/utils/catalogTree'

type TreeCategory = Category & {
    children: TreeCategory[]
}

const CategoriesMenu = () => {
    const { i18n } = useTranslation()
    const { data: categories = [] } = useGetCategoriesTreeQuery({lang: i18n.language}, { refetchOnMountOrArgChange: true })
    const flatCategories = useMemo(() => flattenCatalogTree(categories), [categories])
    const { categorySlug, categoryId } = useParams<{ categorySlug?: string; categoryId?: string }>()
    const activeId = useMemo(() => {
        const fromParam = Number(categoryId)
        if (Number.isFinite(fromParam) && fromParam > 0) return fromParam
        const fromSlug = flatCategories.find(c => c.slug === categorySlug)
        const slugId = Number(fromSlug?.id)
        return Number.isFinite(slugId) && slugId > 0 ? slugId : null
    }, [categoryId, categorySlug, flatCategories])

    const [menuState, setMenuState] = useState<{ activeId: number | null; openCategories: Record<number, boolean> }>({ activeId: null, openCategories: {} })

    const rootCategories = useMemo(() => {
        return buildCatalogTree(categories)
    }, [categories])

    const activeParentsChain = useMemo(() => {
        if (!activeId || flatCategories.length === 0) return new Set<number>()
        const parentsChain = new Set<number>()
        const active = flatCategories.find(c => Number(c.id) === activeId) ?? null
        for (const ancestor of catalogAncestors(active, flatCategories)) {
            if (flatCategories.some(c => Number(c.parentId) === Number(ancestor.id))) parentsChain.add(Number(ancestor.id))
        }
        return parentsChain
    }, [activeId, flatCategories])

    const effectiveOpenCategories = useMemo(() => {
        const derivedState: Record<number, boolean> = {}
        activeParentsChain.forEach(id => { derivedState[id] = true })
        return { ...derivedState, ...(menuState.activeId === activeId ? menuState.openCategories : {}) }
    }, [activeParentsChain, menuState, activeId])

    const getAllDescendantIds = (parentId: number, allCats: Category[], visited = new Set<number>()): number[] => {
        if (visited.has(parentId)) return []
        visited.add(parentId)
        let ids: number[] = []
        const children = allCats.filter(c => Number(c.parentId) === parentId)
        children.forEach(child => {
            const childId = Number(child.id)
            ids.push(childId)
            ids = ids.concat(getAllDescendantIds(childId, allCats, visited))
        })
        return ids
    }

    const toggleCategory = (id: number, siblings: TreeCategory[]) => {
        setMenuState(prev => {
            const newState = { ...effectiveOpenCategories, ...(prev.activeId === activeId ? prev.openCategories : {}) }
            siblings.forEach(sibling => {
                const sId = Number(sibling.id)
                if (sId !== id) {
                    newState[sId] = false
                    const siblingDescendants = getAllDescendantIds(sId, flatCategories)
                    siblingDescendants.forEach(dId => newState[dId] = false)
                }
            })

            const willOpen = !effectiveOpenCategories[id]
            newState[id] = willOpen

            if (!willOpen) {
                const descendants = getAllDescendantIds(id, flatCategories)
                descendants.forEach(dId => newState[dId] = false)
            }

            return { activeId, openCategories: newState }
        })
    }

    const getCategoryLink = (cat: TreeCategory | Category) => {
        return `/catalog/${cat.slug}`
    }

    const renderNodes = (nodes: TreeCategory[], depth = 0): ReactNode => nodes.map(cat => {
        const isOpen = Boolean(effectiveOpenCategories[Number(cat.id)])
        const isActive = Number(cat.id) === activeId
        const hasChildren = cat.children.length > 0
        const imageKey = depth === 0 ? 'categories_menu_toggle' : 'categories_menu_child_toggle'
        return (
            <div key={cat.id}>
                <div className="flex items-center justify-between hover:bg-gray-50 rounded px-2 py-1">
                    <Link
                        to={getCategoryLink(cat)}
                        onClick={() => { if (hasChildren) toggleCategory(Number(cat.id), nodes) }}
                        className={`flex-1 transition ${depth === 0 ? 'font-semibold text-lg' : 'text-xs'} ${isActive ? 'text-[#F58322] font-bold' : depth === 0 ? 'text-gray-700' : 'hover:text-[#DB741F]'}`}
                    >
                        {cat.name}
                    </Link>
                    {hasChildren && <button
                        onClick={() => toggleCategory(Number(cat.id), nodes)}
                        aria-expanded={isOpen}
                        aria-label={cat.name}
                        className="p-1 shrink-0"
                    >
                        <EditableImage imageKey={`${imageKey}_${isOpen ? 'close' : 'open'}`} fallbackSrc={isOpen ? CloseButton : OpenButton} alt="" />
                    </button>}
                </div>
                {isOpen && hasChildren && <div className="ml-3 pl-2 border-l border-gray-200 mt-1 space-y-1">
                    {renderNodes(cat.children, depth + 1)}
                </div>}
            </div>
        )
    })

    if (!categories.length) return null

    return (
        <aside className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 ">
            <div className="space-y-1">
                {renderNodes(rootCategories)}
            </div>
        </aside>
    )
}

export default CategoriesMenu
