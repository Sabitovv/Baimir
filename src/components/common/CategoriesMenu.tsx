import React, { useMemo } from 'react'
import OpenButton from '@/assets/button1_for_sideBar.svg'
import CloseButton from '@/assets/button2_for_sideBar.svg'
import { useGetCategoriesTreeQuery } from '@/api/categoriesApi'
import type { Category as ApiCategory } from '@/api/categoriesApi'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

type TreeCategory = ApiCategory & {
  children: TreeCategory[]
}

const buildTree = (list: ApiCategory[] = []): TreeCategory[] => {
  const map = new Map<string | number, TreeCategory>()
  const roots: TreeCategory[] = []

  list.forEach(item => {
    map.set(item.id, { ...item, children: [] } as TreeCategory)
  })

  list.forEach(item => {
    const node = map.get(item.id)!
    const pid = item.parentId
    if (pid == null) {
      roots.push(node)
    } else {
      const parent = map.get(pid)
      if (parent) parent.children.push(node)
    }
  })
  return roots
}
const findCategoryPath = (
  nodes: TreeCategory[],
  targetId: string | number,
  path: (string | number)[] = []
): (string | number)[] | null => {
  for (const node of nodes) {
    if (String(node.id) === String(targetId)) {
      return [...path, node.id]
    }
    if (node.children?.length) {
      const result = findCategoryPath(node.children, targetId, [...path, node.id])
      if (result) return result
    }
  }
  return null
}

const CategoriesMenu: React.FC = () => {
  const { data } = useGetCategoriesTreeQuery()

  const [params] = useSearchParams()
  const rawActiveCategory = params.get('categoryId') ?? params.get('category') ?? null

  const tree = useMemo(() => buildTree(data ?? []), [data])

  const navigate = useNavigate()
  const location = useLocation()

  const activePath = useMemo((): (string | number)[] | null => {
    if (!tree.length) return null
    if (rawActiveCategory) {
      const path = findCategoryPath(tree, rawActiveCategory)
      if (path) return path
    }

    const parts = location.pathname.replace(/^\/catalog/, '').split('/').filter(Boolean)
    const slug = parts[0]
    if (!slug) return null

    const rootNode = tree.find(t => t.slug === slug)
    if (!rootNode) return null

    const path = findCategoryPath(tree, rootNode.id)
    return path ?? [rootNode.id]
  }, [tree, rawActiveCategory, location.pathname])

  return (
    <aside className="w-full lg:w-[260px]">
      <div className="bg-white rounded-md p-4 mb-5 shadow-sm border border-gray-100">
        {tree.map((cat) => {
          const isRootOpen = String(activePath?.[0]) === String(cat.id)
          const hasLevel1 = (cat.children?.length ?? 0) > 0
          const isRootActive = rawActiveCategory && String(rawActiveCategory) === String(cat.id)

          return (
            <div key={cat.id} className="border-b last:border-b-0 border-gray-100">
              <div className="flex items-center">
                <Link
                  to={`/catalog/${cat.slug}?categoryId=${cat.id}`}
                  className={`w-full flex items-center justify-between py-3 text-left font-bold font-[Manrope] text-sm transition-colors ${
                    isRootActive ? 'text-[#F05023]' : 'hover:text-[#F05023]'
                  }`}
                  aria-current={isRootActive ? 'page' : undefined}
                >
                  {cat.name}
                </Link>

                <button
                  onClick={() => navigate(`/catalog/${cat.slug}?categoryId=${cat.id}`)}
                  aria-label={isRootOpen ? 'close root' : 'open root'}
                >
                  <img
                    src={OpenButton}
                    className={`transition-transform duration-300 ${isRootOpen ? 'rotate-0' : 'rotate-180'}`}
                    alt=""
                  />
                </button>
              </div>

              {isRootOpen && hasLevel1 && (
                <div className="pl-3 pb-3 space-y-1">
                  {cat.children!.map(child => {
                    const childIdInPath = activePath?.[1] ?? null
                    const isChildOpen = childIdInPath !== null && String(childIdInPath) === String(child.id)
                    const isChildActive = rawActiveCategory && String(rawActiveCategory) === String(child.id)
                    const childHasChildren = (child.children?.length ?? 0) > 0

                    return (
                      <div key={child.id}>
                        <div className="flex items-center">
                          <Link
                            to={`/catalog/${child.slug}?categoryId=${child.id}`}
                            className={`w-full flex items-center justify-between text-left text-sm py-1.5 font-[Manrope] transition ${
                              isChildActive ? 'text-[#F05023] font-medium' : 'text-gray-600 hover:text-[#F05023]'
                            }`}
                            aria-current={isChildActive ? 'page' : undefined}
                          >
                            {child.name}
                          </Link>

                          {childHasChildren && (
                            <button
                              onClick={() => navigate(`/catalog/${child.slug}?categoryId=${child.id}`)}
                              aria-label={isChildOpen ? 'close child' : 'open child'}
                            >
                              <img
                                src={CloseButton}
                                className={`transition-transform duration-200 ${isChildOpen ? 'rotate-90' : 'rotate-0'}`}
                                alt=""
                              />
                            </button>
                          )}
                        </div>

                        {childHasChildren && isChildOpen && (
                          <div className="pl-4 border-l border-gray-200 mt-1 mb-2 space-y-1">
                            {child.children!.map(sub => {
                              const isSubActive = rawActiveCategory && String(rawActiveCategory) === String(sub.id)
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => navigate(`/catalog/${child.slug}?categoryId=${sub.id}`)}
                                  className={`w-full text-left text-xs py-1 font-[Manrope] transition ${
                                    isSubActive ? 'text-[#F05023] font-medium' : 'text-gray-500 hover:text-[#F05023]'
                                  }`}
                                  aria-current={isSubActive ? 'page' : undefined}
                                >
                                  {sub.name}
                                </button>
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
