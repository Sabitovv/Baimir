import type { FC } from 'react'
import ProductCard from '@/components/common/ProductCard'
import type { CollectionProduct } from '@/api/productCollectionsApi'

type ProductCarouselProps = {
  products: CollectionProduct[]
  className?: string
  itemClassName?: string
  cardVariant?: 'compact' | 'mini'
}

const ProductCarousel: FC<ProductCarouselProps> = ({
  products,
  className,
  itemClassName,
  cardVariant = 'compact',
}) => {
  return (
    <div className={className}>
      <div
        className='flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 pr-1 sm:gap-3.5 sm:pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={`w-[86%] min-w-[198px] snap-start sm:w-[50%] sm:min-w-[248px] lg:w-[32%] xl:w-[25%] ${itemClassName ?? ''}`}
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
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductCarousel
