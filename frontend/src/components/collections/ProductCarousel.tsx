import type { FC } from 'react'
import ProductCard from '@/components/common/ProductCard'

type ProductCarouselProps = {
  products: any[] 
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
    <div className={`w-full ${className ?? ''}`}>
      <div
        className='flex gap-2.5 sm:gap-3 md:gap-3.5 overflow-x-auto pb-3 pt-1 pr-1 sm:pr-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={`snap-start shrink-0 w-[calc((100%-1.5rem)/2.5)] min-w-[136px] max-sm:max-w-[176px] sm:w-52 sm:min-w-[208px] md:w-56 md:min-w-[224px] lg:w-60 lg:min-w-[240px] xl:w-64 xl:min-w-[256px] ${itemClassName ?? ''}`}
          >
            <ProductCard
              id={product.id}
              slug={product.slug}
              name={product.name}
              coverImage={product.coverImage}
              price={product.price}
              oldPrice={product.oldPrice}
              inStock={product.inStock}
              isNew={product.newProduct || product.new}
              keyFeatures={null}
              categoryName={product.categoryName || product?.category?.name}
              variant={cardVariant}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductCarousel