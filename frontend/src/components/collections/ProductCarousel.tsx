import {
  useRef,
  useState,
  type FC,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import ProductCard from '@/components/common/ProductCard'

type ProductCarouselProps = {
  products: any[] 
  className?: string
  itemClassName?: string
  cardVariant?: 'compact' | 'mini'
  enableMouseDrag?: boolean
  showCompare?: boolean
}

const ProductCarousel: FC<ProductCarouselProps> = ({
  products,
  className,
  itemClassName,
  cardVariant = 'compact',
  enableMouseDrag = false,
  showCompare = true,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const isPointerDownRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const hasCapturedRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const dragStartScrollLeftRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragThreshold = 10

  const clearSuppressClick = () => {
    suppressClickRef.current = false
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enableMouseDrag || !scrollRef.current) return
    if (event.pointerType !== 'mouse') return

    isPointerDownRef.current = true
    hasDraggedRef.current = false
    hasCapturedRef.current = false
    activePointerIdRef.current = event.pointerId
    clearSuppressClick()
    dragStartXRef.current = event.clientX
    dragStartYRef.current = event.clientY
    dragStartScrollLeftRef.current = scrollRef.current.scrollLeft
    // NOTE: do not capture the pointer here. Capturing on pointerdown makes the
    // browser retarget the resulting `click` to this scroll container, which
    // swallows clicks on the buttons/links inside the cards (e.g. add to cart).
    // The pointer is only captured once an actual drag starts (see move handler).
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enableMouseDrag || !isPointerDownRef.current || !scrollRef.current) return
    if (event.pointerType !== 'mouse') return

    const deltaX = event.clientX - dragStartXRef.current
    const deltaY = event.clientY - dragStartYRef.current

    if (
      Math.abs(deltaX) > dragThreshold
      && Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      hasDraggedRef.current = true
      suppressClickRef.current = true
      setIsDragging(true)

      // Capture the pointer only now that a real drag has started, so dragging
      // keeps scrolling even if the cursor leaves the container. Plain clicks
      // never reach this branch, so their `click` events stay on the buttons.
      if (!hasCapturedRef.current && activePointerIdRef.current !== null) {
        scrollRef.current.setPointerCapture(activePointerIdRef.current)
        hasCapturedRef.current = true
      }
    }

    if (!hasDraggedRef.current) return

    event.preventDefault()
    scrollRef.current.scrollLeft = dragStartScrollLeftRef.current - deltaX
  }

  const stopDragging = () => {
    if (!enableMouseDrag) return

    if (
      hasCapturedRef.current
      && activePointerIdRef.current !== null
      && scrollRef.current?.hasPointerCapture(activePointerIdRef.current)
    ) {
      scrollRef.current.releasePointerCapture(activePointerIdRef.current)
    }

    isPointerDownRef.current = false
    hasDraggedRef.current = false
    hasCapturedRef.current = false
    activePointerIdRef.current = null
    setIsDragging(false)
  }

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!enableMouseDrag || !suppressClickRef.current) return

    event.preventDefault()
    event.stopPropagation()
    clearSuppressClick()
  }

  const handleDragStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!enableMouseDrag) return
    event.preventDefault()
  }

  return (
    <div className={`w-full ${className ?? ''}`}>
      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
        onClickCapture={handleClickCapture}
        onDragStart={handleDragStart}
        className={`flex gap-2.5 sm:gap-3 md:gap-3.5 overflow-x-auto pb-3 pt-1 pr-1 sm:pr-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${enableMouseDrag ? `select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}` : ''}`}
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
              categoryId={product.categoryId ?? product?.category?.id}
              categoryName={product.categoryName || product?.category?.name}
              variant={cardVariant}
              showCompare={showCompare}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductCarousel
