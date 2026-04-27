import RightIcon from "@/assets/catalog/right.svg";
import LeftIcon from "@/assets/catalog/left.svg";
import { useTranslation } from "react-i18next";
import { useRef, useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useGetPopularProductsQuery } from "@/api/productsApi";
import type { Product } from "@/api/productsApi";
import { EditableImage } from "@/zustand/EditableImage";

export const PopularProduct = () => {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useGetPopularProductsQuery({});
  const SCROLL_STEP_PX = 320;

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({
      left: -SCROLL_STEP_PX,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({
      left: SCROLL_STEP_PX,
      behavior: "smooth",
    });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollLeft();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollRight();
    }
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.style.setProperty("-webkit-overflow-scrolling", "touch");
  }, []);

  const products = data?.content ?? [];

  return (
    <section className="mb-12 sm:mb-16 md:mb-20 mt-8 sm:mt-10 md:mt-12 px-0 sm:px-0">
      <h2 className="font-oswald text-lg sm:text-3xl md:text-[34px] lg:text-4xl xl:text-5xl font-bold uppercase mb-4 sm:mb-5 md:mb-6 ml-1 sm:ml-4">
        {t("catalogPage.popular")}
      </h2>

      <div className="flex items-center gap-1 sm:gap-2.5 md:gap-2 lg:gap-3 w-full">
        <button
          aria-label="scroll left"
          onClick={scrollLeft}
          className="hidden sm:flex shrink-0 p-3 z-10 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <EditableImage
            imageKey="catalog_popular_arrow_left"
            fallbackSrc={LeftIcon}
            alt="Left"
            className="w-6 h-6 sm:w-10 sm:h-10"
          />
        </button>

        <div
          ref={scrollerRef}
          role="list"
          tabIndex={0}
          onKeyDown={handleKey}
          className="flex-1 flex gap-3 sm:gap-3 md:gap-2.5 lg:gap-3 overflow-x-auto py-2 px-0 sm:px-1 scroll-smooth snap-x snap-mandatory
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {isLoading ? (
            <div className="text-gray-500 px-4">
              {t("commonCatalog.loading")}
            </div>
          ) : error ? (
            <div className="text-red-500 px-4">{t("commonCatalog.error")}</div>
          ) : products.length === 0 ? (
            <div className="text-gray-500 px-4">
              {t("catalogPage.noPopularProducts")}
            </div>
          ) : (
            products.map((product: Product) => (
              <div
                key={product.id}
                role="listitem"
                className="snap-center shrink-0 w-[calc((100%-1.5rem)/2.5)] min-w-[136px] max-w-[176px] sm:w-52 sm:min-w-0 sm:max-w-none md:w-56 lg:w-60 xl:w-64"
              >
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  coverImage={product.coverImage}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  inStock={product.inStock}
                  isNew={product.newProduct ?? product.new}
                  keyFeatures={product.keyFeatures}
                  categoryId={product.category?.id}
                  categoryName={product.category?.name}
                />
              </div>
            ))
          )}
        </div>

        <button
          aria-label="scroll right"
          onClick={scrollRight}
          className="hidden sm:flex shrink-0 p-3 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <EditableImage
            imageKey="catalog_popular_arrow_right"
            fallbackSrc={RightIcon}
            alt="Right"
            className="w-6 h-6 sm:w-10 sm:h-10"
          />
        </button>
      </div>
    </section>
  );
};
