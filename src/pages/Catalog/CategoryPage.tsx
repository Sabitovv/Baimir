import { useEffect, useState } from 'react'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import CatalogCard from '@/pages/Catalog/components/CatalogCard'
import PageContainer from '@/components/ui/PageContainer'
import CatalogFilters from '@/pages/Catalog/components/CatalogFilter'
import prodImg from '@/assets/catalog/prod_sample.png'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useGetCategoriesTreeQuery } from '@/api/categoriesApi';
import { clearBreadcrumbs, setBreadcrumbs } from '@/features/catalogSlice'
import {useAppDispatch} from '@/app/hooks'


const CategoryPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { data, isLoading } = useGetCategoriesTreeQuery();
  const categorySlug = useParams().categorySlug || 'default-category';
  const dispatch= useAppDispatch()
  const {currentSlug} = useParams()
  
  const currentCategory =
    data?.find(item => item.slug === categorySlug) ?? null


    
  useEffect(() => {

    if (!data || !categorySlug) return

    const currentCategory =
      data.find(item => item.slug === categorySlug) ?? null

    if (!currentCategory) return

    const chain = []
    let temp = currentCategory

    while (temp) {
      chain.unshift(temp)
      temp = data.find(i => i.id === temp.parentId) || null
    }

    dispatch(setBreadcrumbs(chain))

  }, [data, categorySlug])

  if (isLoading) return <p>Loading...</p>;
  if (!data) return null;

  const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: 'Лазерный станок для резки мет.листов A3-1500W Bodor',
    code: '10150570',
    price: '10 500 000 ₸',
    image: prodImg
  }))

  return (
    <PageContainer>
      <div className="px-4 md:px-6 lg:px-0 mb-20 font-[Manrope]">
        
        {/* Заголовок */}
        <div className="my-5">
          <h1 className="font-oswald text-3xl md:text-5xl font-bold uppercase text-gray-900">
            Лазерные станки
          </h1>
          <Breadcrumbs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 mt-4">

          {/* Сайдбар */}
          <aside className="hidden lg:block space-y-2 pr-4">
            <CategoriesMenu
            />
          </aside>


          <main>
            {/* --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ФИЛЬТРА --- */}
            
            {isFilterOpen ? (
              // 1. ЕСЛИ ОТКРЫТО: Показываем большой компонент
              <CatalogFilters onClose={() => setIsFilterOpen(false)} />
            ) : (
              // 2. ЕСЛИ ЗАКРЫТО: Показываем серую полоску (как на 1-м фото)
              <div className="bg-[#F2F4F7] p-2 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-4">
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Кнопка ПОКАЗАТЬ */}
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E4E7EC] hover:bg-gray-300 text-gray-700 rounded-md transition font-medium text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                      Показать фильтр
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1"/></svg>
                  </button>

                  {/* В наличии (Оранжевый тоггл) */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-[#E4E7EC] rounded-md">
                    <span className="text-sm text-gray-700">В наличии</span>
                    <div className="w-9 h-5 bg-[#F05023] rounded-full relative cursor-pointer">
                      <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1 top-0.5 shadow-sm"></div>
                    </div>
                  </div>

                  {/* Дропдауны сортировки */}
                  <div className="hidden md:flex gap-2">
                    <button className="px-3 py-2 bg-[#E4E7EC] rounded-md text-sm text-gray-700 flex items-center gap-2">
                      <span>↑↓</span> По убыванию цены <svg width="10" height="6" viewBox="0 0 10 6" stroke="currentColor" fill="none"><path d="M1 1L5 5L9 1"/></svg>
                    </button>
                    <button className="px-3 py-2 bg-[#E4E7EC] rounded-md text-sm text-gray-700 flex items-center gap-2">
                      Цена <svg width="10" height="6" viewBox="0 0 10 6" stroke="currentColor" fill="none"><path d="M1 1L5 5L9 1"/></svg>
                    </button>
                    <button className="px-3 py-2 bg-[#E4E7EC] rounded-md text-sm text-gray-700 flex items-center gap-2">
                      Серия <svg width="10" height="6" viewBox="0 0 10 6" stroke="currentColor" fill="none"><path d="M1 1L5 5L9 1"/></svg>
                    </button>
                  </div>
                </div>

                {/* Вид: Сетка / Список */}
                <div className="flex items-center gap-2 text-gray-400 pr-2">
                   <button className="text-[#F05023] hover:text-[#d64018]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
                   </button>
                   <button className="hover:text-gray-600">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"/></svg>
                   </button>
                </div>
              </div>
            )}

            {/* СЕТКА ТОВАРОВ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/catalog/${categorySlug}/products/${p.id}?categoryId=${currentCategory?.id}`}
                >
                  <CatalogCard product={p} />
                </Link>

              ))}
            </div>

            {/* ПАГИНАЦИЯ */}
            <div className="mt-12 flex justify-center items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">‹</button>
                <button className="w-8 h-8 flex items-center justify-center border border-black bg-white font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center border hover:bg-gray-100">2</button>
                <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">›</button>
            </div>

          </main>
        </div>
      </div>
    </PageContainer>
  )
}

export default CategoryPage

