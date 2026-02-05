import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import { useGetCategoriesTreeQuery, type Category } from '@/api/categoriesApi';
import prodImg from '@/assets/catalog/prod_sample.png' 
import sampleImg from '@/assets/catalog/sample_machine.png' 
import ProductCard from '@/components/common/ProductCard'
import RightIcon from '@/assets/Catalog/right.svg'
import LeftIcon from '@/assets/Catalog/left.svg'

import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs';
import { useAppDispatch } from '@/app/hooks';
import { clearBreadcrumbs, setBreadcrumbs } from '@/features/catalogSlice';


const CatalogPage = () => {
    const { data, isLoading } = useGetCategoriesTreeQuery();
    const scrollerRef = useRef<HTMLDivElement | null>(null)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    // const hashPath = location.hash.replace('#/catalog', '')
    // const pathSegments = hashPath.split('/').filter(Boolean)
    const location = useLocation()
    const pathSegments = location.pathname.replace(/^\/catalog/, '').split('/').filter(Boolean).filter(seg => seg !== 'products')
    const currentSlug = pathSegments[pathSegments.length - 1] ?? null
    const currentCategory = currentSlug ? data?.find(i => i.slug === currentSlug) ?? null : null


    useEffect(()=>{
      if (!data) return

      if (!currentCategory) {
        dispatch(clearBreadcrumbs())
        return
      }
    
      const chain = []
      let temp = currentCategory
    
      while (temp) {
        chain.unshift(temp)
        temp = data.find(i => i.id === temp.parentId) || null
      }
    
      dispatch(setBreadcrumbs(chain))
    
    }, [currentCategory, data])
    if (!data) return null

    const visibleCategories = currentCategory
      ? data.filter(item => item.parentId === currentCategory.id)
      : data.filter(item => item.parentId === null)

    // if (isLoading) return <p>Loading...</p>

  const products = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Лазерный станок модель ${i + 1}`,
    price: '10 500 000 ₸',
    image: prodImg
  }))

  const scrollBy = (dir: 'left' | 'right') => {
    const sc = scrollerRef.current
    if (!sc) return
    const step = sc.clientWidth * 0.7
    sc.scrollTo({
      left: dir === 'left' ? sc.scrollLeft - step : sc.scrollLeft + step,
      behavior: 'smooth'
    })
  }

  const hasChildren = (id: number | string) => {
    return data?.some(item => item.parentId === id)
  } 



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
          <main className='ml-5'>
            

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
                      }}}
                    key={item.id}
                    className="bg-white p-6 shadow-sm hover:shadow-md transition rounded-lg cursor-pointer flex flex-col items-center"
                >
                  <img
                    src={item.imageUrl}
                    className="max-h-[130px] object-contain"
                  />

                  <p className="mt-4 font-semibold text-center">
                    {item.name}
                  </p>
                </div>
              ))}

            </div>

          </main>
        </div>

        {/* Popular products */}
        <section className="mb-24 mt-12">
          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-6 ml-15">
            ПОПУЛЯРНЫЕ ТОВАРЫ
          </h2>

          <div className="flex items-center"> {/* Добавил items-center для выравнивания стрелок */}

            {/* Left arrow */}
            <button
              aria-label="scroll left"
              onClick={() => scrollBy('left')}
              className='mr-5 z-10' // z-10 на случай перекрытия
            >
              <img src={LeftIcon} alt="Left" />
            </button>

            {/* Scroller */}
            <div
              ref={scrollerRef}
              // Добавлены классы для скрытия скролла:
              // [&::-webkit-scrollbar]:hidden -> для Chrome/Safari
              // [-ms-overflow-style:none] -> для IE/Edge
              // [scrollbar-width:none] -> для Firefox
              className="flex gap-4 overflow-x-auto py-2 px-2 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {products.map((p) => (
                <div key={p.id} className="snap-start shrink-0"> {/* shrink-0 чтобы карточки не сжимались */}
                  <ProductCard title={p.title} price={p.price} image={p.image} />
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              aria-label="scroll right"
              onClick={() => scrollBy('right')}
              className='ml-5 z-10'
            >
              <img src={RightIcon} alt="Right" />
            </button>

          </div>
        </section>

        {/* Leave request section */}
        <section className='mb-16'>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left: form */}
            <div className="px-2 md:px-0">
              <h3 className="font-oswald text-4xl sm:text-5xl font-bold uppercase mb-8 ml-4">
                ОСТАВЬТЕ ЗАЯВКУ
              </h3>

              {/* можно заменить на <Contact /> */}
              <Contact/>
            </div>

            {/* Right: big image */}
            <div className="flex justify-center md:justify-end px-2 md:px-0">
              <img src={sampleImg} alt="machine" className="max-w-full w-72 sm:w-full object-contain" />
            </div>
          </div>
        </section>

      </div>
    </PageContainer>
  )
}

export default CatalogPage
