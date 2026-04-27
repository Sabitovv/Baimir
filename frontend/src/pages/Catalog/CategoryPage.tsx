import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";

import Breadcrumbs from "@/pages/Catalog/components/Breadcrumbs";
import CategoriesMenu from "@/components/common/CategoriesMenu";
import ProductCard from "@/components/common/ProductCard";
import PageContainer from "@/components/ui/PageContainer";
import CatalogFilters from "@/pages/Catalog/components/CatalogFilter";
import Drawer from "@/components/common/Drawer";
import { PopularProduct } from "./components/PopularProduct";
import { RecentlyViewedProducts } from "./components/RecentlyViewedProducts";
import sampleImg from "@/assets/catalog/sample_machine.png";

import {
  useGetCategoriesTreeQuery,
  useGetProductsQuery,
  type Category,
  type Filter,
} from "@/api/categoriesApi";
import { setBreadcrumbs } from "@/features/catalogSlice";
import { useAppDispatch } from "@/app/hooks";
import Contact from "@/components/common/Contact";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CategoryCalculator from "./components/CategoryCalculator";
import { EditableImage } from "@/zustand/EditableImage";

type BreadcrumbItem = {
  id?: number | string;
  name: string;
  slug?: string;
  path: string;
};

type ProductSpecAttribute = {
  name?: string;
  value?: string | number | null;
};

type ProductSpecGroup = {
  attributes?: ProductSpecAttribute[];
};

type ProductForFilter = {
  [key: string]: unknown;
  price?: string | number | null;
  specifications?: ProductSpecGroup[];
};

const isPriceRangeFilter = (filter: Filter): boolean => {
  const code = String(filter.code ?? "").toLowerCase();
  const name = String(filter.name ?? "").toLowerCase();
  return (
    code.includes("price") || name.includes("price") || name.includes("цена")
  );
};

const findCategoryById = (
  categories: Category[],
  id: number,
): Category | null => {
  for (const cat of categories) {
    if (Number(cat.id) === id) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
};

const CategoryPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
    setIsCalculatorOpen(false);
  };

  const toggleCalculator = () => {
    setIsCalculatorOpen((prev) => !prev);
    setIsFilterOpen(false);
  };

  const closePanels = () => {
    setIsFilterOpen(false);
    setIsCalculatorOpen(false);
  };

  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { categoryId } = useParams<{
    categorySlug: string;
    categoryId: string;
  }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inStock = searchParams.get("is_stock") === "true";

  const toggleStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (!inStock) {
      params.set("is_stock", "true");
    } else {
      params.delete("is_stock");
    }
    params.set("page", "1");
    setSearchParams(params, { replace: false });
  };

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useGetCategoriesTreeQuery({ lang: i18n.language });

  const activeId = categoryId
    ? Number(categoryId)
    : Number(searchParams.get("categoryId"));

  const currentCategory = useMemo(() => {
    if (!categories.length || !activeId) return null;
    return findCategoryById(categories, activeId);
  }, [categories, activeId]);

  const pageParam = Number(searchParams.get("page") ?? 1);
  const page = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;
  const limit = 12;
  const sortParam = searchParams.get("sort");
  const effectiveSort =
    sortParam && sortParam.trim().length > 0 ? sortParam : "price,ASC";

  const allParams = Object.fromEntries(searchParams.entries());
  const filters = { ...allParams };
  delete filters.page;
  delete filters.categoryId;

  const queryArg = activeId
    ? { categoryId: activeId, page, limit, ...filters, sort: effectiveSort }
    : skipToken;

  const { data: productsResponse, isLoading: isLoadingProducts } =
    useGetProductsQuery(
      queryArg === skipToken ? skipToken : { ...queryArg, lang: i18n.language },
    );

  const products = useMemo(
    () => productsResponse?.products ?? [],
    [productsResponse?.products],
  );
  const total = productsResponse?.meta?.totalPages;
  const totalPages = total ? total : 0;

  const extractNumericForFilter = (
    product: ProductForFilter,
    f: Filter,
  ): number | null => {
    const direct = product?.[f.code];
    if (direct != null) {
      const n = Number(String(direct).replace(/[^\d.-]/g, ""));
      if (!Number.isNaN(n)) return n;
    }

    if (
      String(f.code).toLowerCase().includes("price") &&
      product?.price != null
    ) {
      const n = Number(String(product.price).replace(/[^\d.-]/g, ""));
      if (!Number.isNaN(n)) return n;
    }

    if (product?.specifications?.length) {
      for (const grp of product.specifications) {
        if (!grp?.attributes) continue;
        for (const attr of grp.attributes) {
          try {
            const name = String(attr.name ?? "").toLowerCase();
            const fcode = String(f.code ?? "").toLowerCase();
            const fname = String(f.name ?? "").toLowerCase();
            if (
              name.includes(fcode) ||
              name.includes(fname) ||
              fcode.includes(name)
            ) {
              const val = String(attr.value ?? "");
              const num = Number(val.replace(/[^\d.-]/g, ""));
              if (!Number.isNaN(num)) return num;
            }
          } catch {
            /* noop */
          }
        }
      }
    }
    return null;
  };

  const bounds = useMemo(() => {
    const result: Record<string, { min: number; max: number }> = {};
    const rangeFilters = (productsResponse?.filters ?? []).filter(
      (f: Filter) => f.uiType === "RANGE_SLIDER",
    );

    rangeFilters.forEach((f: Filter) => {
      const values: number[] = [];
      for (const p of products) {
        const n = extractNumericForFilter(p as ProductForFilter, f);
        if (n != null) values.push(n);
      }
      const minFromProducts = values.length ? Math.min(...values) : undefined;
      const maxFromProducts = values.length ? Math.max(...values) : undefined;

      const minCandidate = Number(f.range?.min ?? minFromProducts ?? 0);
      const maxCandidate = Number(
        f.range?.max ?? maxFromProducts ?? minCandidate,
      );
      const stepCandidate = Number(f.range?.step ?? 1);
      const safeStep =
        Number.isFinite(stepCandidate) && stepCandidate > 0 ? stepCandidate : 1;
      const useIntegerRange = isPriceRangeFilter(f);

      let min = Math.min(minCandidate, maxCandidate);
      let max = Math.max(minCandidate, maxCandidate);

      if (useIntegerRange) {
        min = Math.floor(min);
        max = Math.ceil(max);
      }

      if (min === max) {
        max = min + (useIntegerRange ? 1 : safeStep);
      }

      result[f.code] = { min, max };
    });
    return result;
  }, [productsResponse?.filters, products]);

  useEffect(() => {
    if (!categories.length) return;
    if (!currentCategory) {
      dispatch(
        setBreadcrumbs([
          { name: t("commonCatalog.catalog"), path: "/catalog" },
        ]),
      );
      return;
    }

    const breadcrumbs: BreadcrumbItem[] = [
      { name: t("commonCatalog.catalog"), path: "/catalog" },
    ];
    const stack: Category[] = [];
    let temp: Category | null = currentCategory;

    while (temp) {
      stack.push(temp);
      temp = temp.parentId
        ? findCategoryById(categories, Number(temp.parentId))
        : null;
    }

    stack.reverse().forEach((cat) => {
      const hasChildren = categories.some(
        (c) => Number(c.parentId) === Number(cat.id),
      );
      breadcrumbs.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        path: hasChildren
          ? `/catalog/${cat.slug}?categoryId=${cat.id}`
          : `/catalog/${cat.slug}/products/${cat.id}`,
      });
    });

    dispatch(setBreadcrumbs(breadcrumbs));
  }, [currentCategory, categories, dispatch, t]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(media.matches);

    updateViewport();
    media.addEventListener("change", updateViewport);

    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (sortParam && sortParam.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", "price,ASC");
    setSearchParams(params, { replace: true });
  }, [sortParam, searchParams, setSearchParams]);

  const changePage = (newPage: number) => {
    const safePage = Math.max(1, Math.min(totalPages, newPage));
    const params = new URLSearchParams(searchParams);
    params.set("page", String(safePage));
    setSearchParams(params, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageButtons = (): (number | null)[] => {
    const maxButtons = 7;
    if (totalPages <= maxButtons)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let i = page - 2; i <= page + 2; i++) {
      if (i > 1 && i < totalPages) pages.add(i);
    }
    const arr = Array.from(pages).sort((a, b) => a - b);
    const result: (number | null)[] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const next = arr[i + 1];
      if (current == null) continue;
      result.push(current);
      if (next != null && next - current > 1) result.push(null);
    }
    return result;
  };

  const descendingOrder = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sort");
    params.set(
      "sort",
      currentSort === "price,DESC" ? "price,ASC" : "price,DESC",
    );
    params.set("page", "1");
    setSearchParams(params, { replace: false });
  };

  if (isLoadingCategories)
    return (
      <PageContainer>
        <p>{t("categoryPage.loadingCategories")}</p>
      </PageContainer>
    );
  if (isErrorCategories)
    return (
      <PageContainer>
        <p>{t("categoryPage.errorCategories")}</p>
      </PageContainer>
    );

  const hasSubcategories = (currentCategory?.children?.length ?? 0) > 0;
  const hasProducts = products.length > 0;

  return (
    <PageContainer>
      <div className="px-4 md:px-6 lg:px-0 mb-14 sm:mb-20">
        <div className="my-4 sm:my-5">
          <ScrollReveal key={activeId ?? "catalog-title"}>
            <h1 className="font-oswald text-[22px] leading-tight sm:text-3xl md:text-5xl font-bold uppercase text-gray-900">
              {currentCategory?.name ?? t("commonCatalog.catalog")}
            </h1>
          </ScrollReveal>
          <Breadcrumbs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 mt-4">
          <aside className="hidden lg:block space-y-2 pr-4">
            <CategoriesMenu />
          </aside>

          <main>
            {!isLoadingProducts && !hasProducts && hasSubcategories ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
                {currentCategory?.children?.map((sub: Category) => (
                  <div
                    key={sub.id}
                    onClick={() =>
                      navigate(`/catalog/${sub.slug}?categoryId=${sub.id}`)
                    }
                    className="cursor-pointer group border rounded-lg p-2.5 sm:p-4 min-h-[76px] sm:min-h-[96px] flex items-center justify-center hover:shadow-lg transition bg-white text-center"
                  >
                    <h3 className="font-bold text-[13px] leading-snug sm:text-lg group-hover:text-[#DB741F] transition">
                      {sub.name}
                    </h3>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* controls */}
                <div className="bg-[#F2F4F7] p-2 sm:p-2.5 rounded-lg mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <button
                      onClick={toggleFilter}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition font-medium text-xs sm:text-sm ${isFilterOpen ? "bg-[#F58322] text-white" : "bg-[#E4E7EC] hover:bg-gray-300 text-gray-700"}`}
                    >
                      {t("filters.showFilter")}
                    </button>

                    <div
                      className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#E4E7EC] rounded-md cursor-pointer select-none"
                      onClick={toggleStock}
                    >
                      <span className="text-xs sm:text-sm text-gray-700">
                        {t("filters.have")}
                      </span>
                      <div
                        className={`w-9 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${inStock ? "bg-[#F58322]" : "bg-gray-300"}`}
                      >
                        <div
                          className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ease-in-out ${inStock ? "right-1" : "left-1"}`}
                        ></div>
                      </div>
                    </div>

                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={descendingOrder}
                        className="cursor-pointer px-3 py-2 bg-[#E4E7EC] rounded-md text-sm text-gray-700 flex items-center gap-2"
                      >
                        <span>↑↓</span> {t("filters.descendingPrice")}
                      </button>
                    </div>

                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={toggleCalculator}
                        className={`cursor-pointer px-3 py-2 rounded-md text-sm transition flex items-center gap-2 ${isCalculatorOpen ? "bg-[#F58322] text-white" : "bg-[#E4E7EC] hover:bg-gray-300 text-gray-700"}`}
                      >
                        {t("categoryPage.calculator")}
                      </button>
                    </div>
                  </div>
                </div>

                {isFilterOpen && (
                  <div className="hidden md:block mb-6 transition-all duration-300">
                    <CatalogFilters
                      onClose={closePanels}
                      filters={productsResponse?.filters?.filter(
                        (f: Filter) => f.code !== "is_stock",
                      )}
                      bounds={bounds}
                    />
                  </div>
                )}

                <Drawer
                  isOpen={isFilterOpen && isMobileViewport}
                  onClose={closePanels}
                  title={t("filters.showFilter")}
                  mode="drop"
                  heightClass="h-full"
                >
                  <div className="md:hidden">
                    <CatalogFilters
                      onClose={closePanels}
                      filters={productsResponse?.filters?.filter(
                        (f: Filter) => f.code !== "is_stock",
                      )}
                      bounds={bounds}
                      inDrawer
                    />
                  </div>
                </Drawer>

                {isCalculatorOpen && (
                  <div className="mb-6 bg-white border border-gray-200 rounded-md shadow-sm p-6 relative transition-all duration-300">
                    <button
                      onClick={closePanels}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <h3 className="text-xl font-bold mb-6 text-gray-900">
                      {t("categoryPage.calculator")}
                    </h3>
                    <CategoryCalculator onClose={closePanels} />
                  </div>
                )}

                {/* products grid */}
                <div
                  key={`products-${activeId}-${page}`}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                >
                  {isLoadingProducts && (
                    <p className="col-span-full text-center">
                      {t("productPage.loadingProduct")}
                    </p>
                  )}
                  {!isLoadingProducts && !hasProducts && (
                    <p className="col-span-full text-center text-gray-500 py-10">
                      {t("productPage.notFoundTitle")}
                    </p>
                  )}
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
                      isNew={product.newProduct ?? product.new}
                      categoryId={product.category?.id ?? activeId}
                      categoryName={
                        product.category?.name ?? currentCategory?.name ?? ""
                      }
                    />
                  ))}
                </div>

                {hasProducts && (
                  <div className="mt-8 sm:mt-12 flex justify-center items-center gap-1.5 sm:gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => changePage(page - 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      ‹
                    </button>
                    {getPageButtons().map((pNum, idx) =>
                      pNum === null ? (
                        <span key={`sep-${idx}`} className="px-2 select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={pNum}
                          onClick={() => changePage(pNum)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm flex items-center justify-center border ${pNum === page ? "bg-black text-white" : ""}`}
                        >
                          {pNum}
                        </button>
                      ),
                    )}
                    <button
                      disabled={page === totalPages}
                      onClick={() => changePage(page + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        <PopularProduct />
        <RecentlyViewedProducts />

        <section className="mb-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="px-2 md:px-0">
              <h3 className="font-oswald text-2xl sm:text-4xl md:text-5xl font-bold uppercase mb-6 sm:mb-8 ml-2 sm:ml-4">
                {t("catalogPage.bid")}
              </h3>
              <Contact />
            </div>
            <div className="hidden md:flex justify-center md:justify-end px-2 md:px-0">
              <EditableImage
                imageKey="catalog_category_bid_image"
                fallbackSrc={sampleImg}
                alt="machine"
                className="max-w-full w-72 sm:w-full object-contain"
              />
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default CategoryPage;
