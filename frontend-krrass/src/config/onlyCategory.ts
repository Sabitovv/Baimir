import type { Category } from '@/api/categoriesApi'

// На krrass.kz доступна только одна категория каталога.
// Всё остальное (роуты, поиск) ограничивается этой категорией и её подкатегориями.
export const ONLY_CATEGORY_SLUG = 'listogibochnye-stanki'
export const ONLY_CATEGORY_PATH = `/catalog/${ONLY_CATEGORY_SLUG}`

// Бэкенд отдаёт дерево плоским списком со связью через parentId,
// но раскрытые children тоже поддерживаем — на случай изменения формата ответа
const flattenCategories = (cats: Category[]): Category[] =>
    cats.flatMap((cat) => [cat, ...flattenCategories(cat.children ?? [])])

export const findOnlyCategory = (categories: Category[]): Category | undefined =>
    flattenCategories(categories).find((cat) => cat.slug === ONLY_CATEGORY_SLUG)

// Разрешена сама категория и любая вложенная в неё (связь идёт через parentId)
export const isAllowedCategory = (categories: Category[], slug?: string): boolean => {
    if (!slug) return false
    if (slug === ONLY_CATEGORY_SLUG) return true

    const all = flattenCategories(categories)
    const byId = new Map(all.map((cat) => [Number(cat.id), cat]))
    const visited = new Set<number>()
    let current = all.find((cat) => cat.slug === slug)

    while (current) {
        if (current.slug === ONLY_CATEGORY_SLUG) return true

        const parentId = Number(current.parentId)
        if (!Number.isFinite(parentId) || visited.has(parentId)) break
        visited.add(parentId)
        current = byId.get(parentId)
    }

    return false
}
