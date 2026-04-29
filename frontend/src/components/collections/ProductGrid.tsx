import type { FC } from 'react'
import ProductCard from '@/components/common/ProductCard'
import type { CollectionProduct } from '@/api/productCollectionsApi'

type ProductGridProps = {
  products: CollectionProduct[]
  className?: string
}

const ProductGrid: FC<ProductGridProps> = ({ products, className }) => {
  return (
    <div className={className}>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        {products.map((product) => (
          <ProductCard
            key={product.id}
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
            variant='compact'
          />
        ))}
      </div>
    </div>
  )
}

export default ProductGrid
