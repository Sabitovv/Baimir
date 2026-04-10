import { useEffect, useMemo } from "react";
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
import { PopularProduct } from "./components/PopularProduct";
import { useTranslation } from "react-i18next";
import { EditableImage } from "@/zustand/EditableImage";

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
  if (!data) return null;

  return (
    <PageContainer>
      <div className="mt-12 px-4 md:px-6 lg:px-0">
        <ScrollReveal>
          <h1 className="font-oswald text-3xl md:text-4xl font-bold uppercase mb-10">
            {t("catalogPage.title")}
          </h1>
        </ScrollReveal>

        <div className="my-4 text-sm text-gray-500">
          <Breadcrumbs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <CategoriesMenu />
          </aside>

          <main className="ml-0 lg:ml-5">
            <StaggerContainer
              key={location.pathname}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {visibleCategories.map((item) => (
                <StaggerItem key={item.id}>
                  <div
                    onClick={() => {
                      const isLeaf = !hasChildren(item.id);
                      if (isLeaf) {
                        navigate(
                          `/catalog/${item.slug}/products/${item.id}?categoryId=${item.id}`,
                        );
                      } else {
                        navigate(`/catalog/${item.slug}?categoryId=${item.id}`);
                      }
                    }}
                    className="bg-white shadow-sm hover:shadow-md hover:-translate-y-1 
                              transition-all duration-300 rounded-lg cursor-pointer 
                              flex flex-col items-center p-6 h-[240px] overflow-hidden group"
                  >
                    {/* фиксированная зона изображения */}
                    <div
                      className="w-full h-[130px] flex items-center justify-center 
                                    overflow-hidden shrink-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        width={130}
                        height={130}
                        className="w-full h-full object-contain transition-transform 
                                  group-hover:scale-105"
                      />
                    </div>

                    {/* текстовая часть фиксированной высоты */}
                    <div className="mt-4 text-center h-[64px] flex flex-col items-center justify-center overflow-hidden">
                      <p className="font-semibold text-gray-800 line-clamp-2">
                        {item.name}
                      </p>
                      {typeof item.productCount === "number" && (
                        <p className="mt-1 text-xs text-gray-500">
                          {t("catalogPage.productsCount", {
                            count: item.productCount,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
              {visibleCategories.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  {t("catalogPage.noSubcategories")}
                </div>
              )}
            </StaggerContainer>
          </main>
        </div>
        <PopularProduct />
        <ScrollReveal>
          <section className="mb-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="px-2 md:px-0 order-2 md:order-1">
                <h3 className="font-oswald text-4xl sm:text-5xl font-bold uppercase mb-8 ml-4">
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
