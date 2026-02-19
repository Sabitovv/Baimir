import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/app/hooks'
import { clearBreadcrumbs, setBreadcrumbs } from '@/features/catalogSlice'
import { useGetCategoriesTreeQuery } from '@/api/categoriesApi'

import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs'

import sampleImg from '@/assets/catalog/sample_machine.png'
import { PopularProduct } from './components/PopularProduct'

const CatalogPage = () => {
  const { data } = useGetCategoriesTreeQuery()
  // const scrollerRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()

  const currentCategory = useMemo(() => {
    if (!data) return null
    const pathSegments = location.pathname
      .replace(/^\/catalog/, '')
      .split('/')
      .filter(Boolean)
      .filter((seg) => seg !== 'products')

    const currentSlug = pathSegments[pathSegments.length - 1] ?? null
    return currentSlug ? data.find((i) => i.slug === currentSlug) ?? null : null
  }, [location.pathname, data])

  useEffect(() => {
    if (!data) return

    if (!currentCategory) {
      dispatch(clearBreadcrumbs())
      return
    }

    const breadcrumbsList = [{ name: 'Каталог', path: '/catalog' }]

    const stack: typeof data = []
    let temp: typeof currentCategory | undefined | null = currentCategory

    while (temp) {
      stack.push(temp)
      // Ищем родителя
      // eslint-disable-next-line no-loop-func
      const parent = data.find((i) => Number(i.id) === Number(temp?.parentId)) || null
      temp = parent
    }

    // Разворачиваем стек и формируем путь
    stack.reverse().forEach((cat) => {
      const hasChildren = data.some((i) => Number(i.parentId) === Number(cat.id))

      // ИСПРАВЛЕНИЕ TS: Передаем только те поля, которые ожидает Slice (name, path)
      breadcrumbsList.push({
        name: cat.name,
        path: hasChildren
          ? `/catalog/${cat.slug}?categoryId=${cat.id}`
          : `/catalog/${cat.slug}/products/${cat.id}`,
      })
    })

    dispatch(setBreadcrumbs(breadcrumbsList))
  }, [currentCategory, data, dispatch])

  // 3. Оптимизация: Фильтруем категории только при необходимости
  const visibleCategories = useMemo(() => {
    if (!data) return []
    return currentCategory
      ? data.filter((item) => item.parentId === currentCategory.id)
      : data.filter((item) => item.parentId === null)
  }, [data, currentCategory])

  // Заглушка товаров (можно заменить на реальный API запрос)
  // const products = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
  //   id: i + 1,
  //   title: `Лазерный станок модель ${i + 1}`,
  //   price: '10 500 000 ₸',
  //   image: prodImg
  // })), [])

  // const scrollBy = (dir: 'left' | 'right') => {
  //   const sc = scrollerRef.current
  //   if (!sc) return
  //   const step = sc.clientWidth * 0.7
  //   sc.scrollTo({
  //     left: dir === 'left' ? sc.scrollLeft - step : sc.scrollLeft + step,
  //     behavior: 'smooth'
  //   })
  // }

  const hasChildren = (id: number | string) => {
    return data?.some((item) => item.parentId === id)
  }

  // Если данные еще грузятся, можно вернуть спиннер, но пока вернем null или скелетон
  if (!data) return null

  return (
    <PageContainer>
      <div className="mt-12 px-4 md:px-6 lg:px-0">
        {/* TITLE */}
        <h1 className="font-oswald text-3xl md:text-4xl font-bold uppercase mb-10">
          Каталог товаров
        </h1>

        <div className="my-4 text-sm text-gray-500">
          <Breadcrumbs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <CategoriesMenu />
          </aside>

          {/* CONTENT */}
          <main className="ml-0 lg:ml-5"> {/* ml-5 на мобилке может мешать, добавил lg: */}
            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleCategories.map((item) => (
                <div
                  onClick={() => {
                    const isLeaf = !hasChildren(item.id)
                    if (isLeaf) {
                      navigate(`/catalog/${item.slug}/products/${item.id}?categoryId=${item.id}`)
                    } else {
                      navigate(`/catalog/${item.slug}?categoryId=${item.id}`)
                    }
                  }}
                  key={item.id}
                  className="bg-white p-6 shadow-sm hover:shadow-md transition rounded-lg cursor-pointer flex flex-col items-center group"
                >
                  {/* ИЗОБРАЖЕНИЕ: Добавил lazy и размеры для Lighthouse */}
                  <div className="w-full h-[130px] flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      width="130"
                      height="130"
                      className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                    />
                  </div>

                  <p className="mt-4 font-semibold text-center text-gray-800">
                    {item.name}
                  </p>
                </div>
              ))}

              {/* Показываем сообщение, если подкатегорий нет */}
              {visibleCategories.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  В этой категории пока нет подкатегорий.
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Popular products */}
        <PopularProduct />

        {/* Leave request section */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: form */}
            <div className="px-2 md:px-0 order-2 md:order-1">
              <h3 className="font-oswald text-4xl sm:text-5xl font-bold uppercase mb-8 ml-4">
                ОСТАВЬТЕ ЗАЯВКУ
              </h3>
              <Contact />
            </div>

            {/* Right: big image */}
            <div className="flex justify-center md:justify-end px-2 md:px-0 order-1 md:order-2">
              <img
                src={sampleImg}
                alt="Лазерный станок - пример"
                loading="lazy"
                width="500"
                height="400"
                className="max-w-full w-72 sm:w-full object-contain"
              />
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

export default CatalogPage