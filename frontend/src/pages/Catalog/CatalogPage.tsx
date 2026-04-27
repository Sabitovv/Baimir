import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { clearBreadcrumbs, setBreadcrumbs } from "@/features/catalogSlice";
import { useGetCategoriesTreeQuery } from "@/api/categoriesApi";

import PageContainer from "@/components/ui/PageContainer";
import CategoriesMenu from "@/components/common/CategoriesMenu";
import Contact from "@/components/common/Contact";
import Breadcrumbs from "@/pages/Catalog/components/Breadcrumbs";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";

import sampleImg from "@/assets/catalog/sample_machine.png";
import { RecentlyViewedProducts } from "./components/RecentlyViewedProducts";
import { useTranslation } from "react-i18next";
import { EditableImage } from "@/zustand/EditableImage";
import CatalogDeepProductsPage from "./components/CatalogDeepProductsPage";

interface CategoryImageProps {
  src?: string | null;
  alt: string;
}

const CategoryImage = ({ src, alt }: CategoryImageProps) => {
  const [resolvedSrc, setResolvedSrc] = useState(src || sampleImg);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setResolvedSrc(src || sampleImg);
    setIsLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-[100px] sm:h-[130px] flex items-center justify-center overflow-hidden shrink-0">
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        width={130}
        height={130}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (resolvedSrc !== sampleImg) {
            setResolvedSrc(sampleImg);
            return;
          }
          setIsLoaded(true);
        }}
        className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

const CatalogPage = () => {
  const { i18n, t } = useTranslation();
  const { data } = useGetCategoriesTreeQuery({ lang: i18n.language });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const currentCategory = useMemo(() => {
    if (!data) return null;
    const pathSegments = location.pathname
      .replace(/^\/catalog/, "")
      .split("/")
      .filter(Boolean)
      .filter((seg) => seg !== "products");

    const currentSlug = pathSegments[pathSegments.length - 1] ?? null;
    return currentSlug
      ? (data.find((i) => i.slug === currentSlug) ?? null)
      : null;
  }, [location.pathname, data]);

  useEffect(() => {
    if (!data) return;

    if (!currentCategory) {
      dispatch(clearBreadcrumbs());
      return;
    }

    const breadcrumbsList = [
      { name: t("commonCatalog.catalog"), path: "/catalog" },
    ];

    const stack: typeof data = [];
    let temp: typeof currentCategory | undefined | null = currentCategory;

    while (temp) {
      stack.push(temp);
      const parent =
        data.find((i) => Number(i.id) === Number(temp?.parentId)) || null;
      temp = parent;
    }

    stack.reverse().forEach((cat) => {
      const hasChildren = data.some(
        (i) => Number(i.parentId) === Number(cat.id),
      );

      breadcrumbsList.push({
        name: cat.name,
        path: hasChildren
          ? `/catalog/${cat.slug}?categoryId=${cat.id}`
          : `/catalog/${cat.slug}/products/${cat.id}`,
      });
    });

    dispatch(setBreadcrumbs(breadcrumbsList));
  }, [currentCategory, data, dispatch, t]);

  const visibleCategories = useMemo(() => {
    if (!data) return [];
    return currentCategory
      ? data.filter((item) => item.parentId === currentCategory.id)
      : data.filter((item) => item.parentId === null);
  }, [data, currentCategory]);

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
    return data?.some((item) => item.parentId === id);
  };

  const resolveProductCount = (value: {
    productCount?: number | string;
    productsCount?: number | string;
    count?: number | string;
  }): number | null => {
    const raw = value.productCount ?? value.productsCount ?? value.count;
    const parsed = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  if (!data) return null;

  return (
    <PageContainer>
      <div className="mt-8 sm:mt-12 px-4 md:px-6 lg:px-0">
        <ScrollReveal>
          <h1 className="font-oswald text-[22px] leading-tight sm:text-3xl md:text-4xl font-bold uppercase mb-6 sm:mb-10">
            {t("catalogPage.title")}
          </h1>
        </ScrollReveal>

        <div className="my-3 sm:my-4 text-xs sm:text-sm text-gray-500">
          <Breadcrumbs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <CategoriesMenu />
          </aside>

          <main className="ml-0 lg:ml-5">
            <StaggerContainer
              key={location.pathname}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            >
              {visibleCategories.map((item) => {
                const productCountValue = resolveProductCount(item);
                return (
                  <StaggerItem key={item.id}>
                    <div
                      onClick={() => {
                        const isLeaf = !hasChildren(item.id);
                        if (isLeaf) {
                          navigate(
                            `/catalog/${item.slug}/products/${item.id}?categoryId=${item.id}`,
                          );
                        } else {
                          navigate(
                            `/catalog/${item.slug}?categoryId=${item.id}`,
                          );
                        }
                      }}
                      className="bg-white shadow-sm hover:shadow-md hover:-translate-y-1 
                              transition-all duration-300 rounded-lg cursor-pointer 
                              flex flex-col items-center p-3 sm:p-6 h-[210px] sm:h-[240px] overflow-hidden group relative"
                    >
                      {productCountValue !== null && (
                        <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-full bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-gray-700">
                          {productCountValue}{" "}
                          {t("catalogPage.productsCountUnit")}
                        </span>
                      )}
                      <CategoryImage src={item.imageUrl} alt={item.name} />

                      {/* текстовая часть фиксированной высоты */}
                      <div className="mt-3 sm:mt-4 text-center h-[56px] sm:h-[64px] flex flex-col items-center justify-center overflow-hidden">
                        <p className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-2">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
              {visibleCategories.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  {t("catalogPage.noSubcategories")}
                </div>
              )}
            </StaggerContainer>
          </main>
        </div>
        <CatalogDeepProductsPage
          embedded
          categoryId={
            currentCategory && Number.isFinite(Number(currentCategory.id))
              ? Number(currentCategory.id)
              : null
          }
        />
        <RecentlyViewedProducts />
        <ScrollReveal>
          <section className="mb-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="px-2 md:px-0 order-2 md:order-1">
                <h3 className="font-oswald text-2xl sm:text-4xl md:text-5xl font-bold uppercase mb-6 sm:mb-8 ml-2 sm:ml-4">
                  {t("catalogPage.bid")}
                </h3>
                <Contact />
              </div>
              <div className="hidden md:flex justify-center md:justify-end px-2 md:px-0 order-1 md:order-2">
                <EditableImage
                  imageKey="catalog_page_bid_image"
                  fallbackSrc={sampleImg}
                  alt={t("catalogPage.sampleAlt")}
                  loading="lazy"
                  width="500"
                  height="400"
                  className="max-w-full w-72 sm:w-full object-contain"
                />
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </PageContainer>
  );
};

export default CatalogPage;
