import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import ProductCard from '@/components/common/ProductCard'
import type { CollectionProduct } from '@/api/productCollectionsApi'

type ProductGridProps = {
  products: CollectionProduct[]
  className?: string
  gridClassName?: string
  cardVariant?: 'default' | 'compact' | 'mini'
  showCompare?: boolean
  initialCount?: number
  batchSize?: number
}

const DEFAULT_INITIAL_COUNT = 24
const DEFAULT_BATCH_SIZE = 24

const ProductGrid: FC<ProductGridProps> = ({
  products,
  className,
  gridClassName = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
  cardVariant = 'compact',
  showCompare = true,
  initialCount = DEFAULT_INITIAL_COUNT,
  batchSize = DEFAULT_BATCH_SIZE,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(products.length, initialCount),
  )

  useEffect(() => {
    setVisibleCount(Math.min(products.length, initialCount))
  }, [initialCount, products])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || visibleCount >= products.length) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisibleCount(products.length)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return

        setVisibleCount((current) =>
          Math.min(current + batchSize, products.length),
        )
      },
      { rootMargin: '700px 0px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [batchSize, products.length, visibleCount])

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  )

  return (
    <div className={className}>
      <div className={gridClassName}>
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className='h-full [contain-intrinsic-size:auto_320px] [content-visibility:auto]'
          >
            <ProductCard
              id={product.id}
              slug={product.slug}
              name={product.name}
              coverImage={product.coverImage}
              price={product.price}
              oldPrice={product.oldPrice}
              inStock={product.inStock}
              isNew={product.newProduct}
              keyFeatures={null}
              categoryName={product.categoryName}
              variant={cardVariant}
              showCompare={showCompare}
            />
          </div>
        ))}
        {visibleCount < products.length && (
          <div
            ref={sentinelRef}
            className='col-span-full h-px'
            aria-hidden='true'
          />
        )}
      </div>
    </div>
  )
}

export default ProductGrid
