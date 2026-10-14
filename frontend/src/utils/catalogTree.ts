import { isBendingCatalogCategory } from '../../seo.mjs'
export { isBendingCatalogCategory } from '../../seo.mjs'

export type CatalogTreeEntry = {
  id: number | string
  parentId?: number | string | null
  name: string
  slug?: string
  isActive?: boolean
  children?: CatalogTreeEntry[]
}

export type CatalogTreeNode<T extends CatalogTreeEntry> = T & {
  children: CatalogTreeNode<T>[]
}

export function flattenCatalogTree<T extends CatalogTreeEntry>(categories: readonly T[]): T[] {
  const entries = new Map<string, T>()
  const visit = (items: readonly T[], parentId?: number | string) => {
    for (const category of items) {
      const id = String(category.id)
      if (entries.has(id) || category.isActive === false) continue
      entries.set(id, { ...category, parentId: category.parentId === undefined ? parentId : category.parentId })
      visit((category.children ?? []) as T[], category.id)
    }
  }
  visit(categories)
  return [...entries.values()]
}

export function buildCatalogTree<T extends CatalogTreeEntry>(categories: readonly T[]): CatalogTreeNode<T>[] {
  const flat = flattenCatalogTree(categories)
  const nodes = new Map(flat.map(category => [String(category.id), { ...category, children: [] } as CatalogTreeNode<T>]))
  const roots: CatalogTreeNode<T>[] = []
  for (const category of flat) {
    const node = nodes.get(String(category.id))!
    if (category.parentId == null) roots.push(node)
    else if (String(category.parentId) !== String(category.id)) {
      // Orphans never become invented top-level categories.
      nodes.get(String(category.parentId))?.children.push(node)
    }
  }
  return roots
}

export function catalogAncestors<T extends CatalogTreeEntry>(category: T | null, categories: readonly T[]): T[] {
  const flat = flattenCatalogTree(categories)
  const byId = new Map(flat.map(item => [String(item.id), item]))
  const visited = new Set<string>()
  const ancestors: T[] = []
  for (let current = category; current && !visited.has(String(current.id));) {
    visited.add(String(current.id))
    ancestors.push(current)
    current = current.parentId == null ? null : byId.get(String(current.parentId)) ?? null
  }
  return ancestors
}

export function catalogView<T extends CatalogTreeEntry>(category: T | null, categories: readonly T[], requestedBending: boolean) {
  const flat = flattenCatalogTree(categories)
  const resolvedCategory = flat.find(item => String(item.id) === String(category?.id)) ?? category
  const calculatorAllowed = isBendingCatalogCategory(resolvedCategory, flat)
  const bendingSelection = calculatorAllowed && requestedBending
  const hasChildren = category != null && flat.some(item => String(item.parentId) === String(category.id))
  return {
    calculatorAllowed,
    bendingSelection,
    showSubcategories: hasChildren && !bendingSelection,
    productScope: bendingSelection ? 'subtree' as const : 'direct' as const,
  }
}
