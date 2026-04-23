import LeftIcon from "@/assets/catalog/left.svg";
import RightIcon from "@/assets/catalog/right.svg";
import { useGetCategoriesTreeQuery, type Category } from "@/api/categoriesApi";
import {
  useGetProductsDeepQuery,
  type CategoryProductGroup,
  type Product,
} from "@/api/productsApi";
import ProductCard from "@/components/common/ProductCard";
import PageContainer from "@/components/ui/PageContainer";
import { EditableImage } from "@/zustand/EditableImage";
import { useMemo, useRef, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";

type ProductFeature = {
  code: string;
  label: string;
  value: string | number;
  unit?: string;
};

const SCROLL_STEP_PX = 320;
type CatalogDeepProductsPageProps = {
  embedded?: boolean;
  categoryId?: number | null;
};

const findCategoryById = (categories: Category[], id: number): Category | null => {
  for (const category of categories) {
    if (Number(category.id) === id) return category;

    if (Array.isArray(category.children) && category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }

  return null;
};

const findCategoryBySlug = (
  categories: Category[],
  slug: string,
): Category | null => {
  for (const category of categories) {
    if (category.slug === slug) return category;

    if (Array.isArray(category.children) && category.children.length > 0) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }

  return null;
};

const normalizeKeyFeatures = (raw: unknown): ProductFeature[] | undefined => {
  if (!Array.isArray(raw)) return undefined;

  const normalized = raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as {
        code?: unknown;
        label?: unknown;
        value?: unknown;
        unit?: unknown;
      };

      if (candidate.value === null || candidate.value === undefined) {
        return null;
      }

      const label =
        typeof candidate.label === "string" && candidate.label.trim().length > 0
          ? candidate.label
          : "";

      const code =
        typeof candidate.code === "string" && candidate.code.trim().length > 0
          ? candidate.code
          : `feature_${index}`;

      const value =
        typeof candidate.value === "number" || typeof candidate.value === "string"
          ? candidate.value
          : String(candidate.value);

      const feature: ProductFeature = {
        code,
        label,
        value,
      };

      if (typeof candidate.unit === "string" && candidate.unit.trim().length > 0) {
        feature.unit = candidate.unit;
      }

      return feature;
    })
    .filter((feature): feature is ProductFeature => feature !== null);

  return normalized.length > 0 ? normalized : undefined;
};

const CategoryCarousel = ({ group }: { group: CategoryProductGroup }) => {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const categoryLink = `/catalog/${group.category.slug}?categoryId=${group.category.id}`;

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({ left: -SCROLL_STEP_PX, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: SCROLL_STEP_PX, behavior: "smooth" });
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollLeft();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollRight();
    }
  };

  return (
    <section className="mb-7 sm:mb-8 rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/60 p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:px-2">
        <div className="min-w-0">
          <h2 className="font-oswald text-xl sm:text-2xl md:text-3xl font-bold uppercase text-gray-900 truncate">
            {group.category.name}
          </h2>
          <div className="mt-1 h-[3px] w-16 rounded-full bg-[#F58322]" />
        </div>

        <Link
          to={categoryLink}
          className="shrink-0 rounded-full border border-[#F3C9A8] bg-[#FFF4EA] px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-[#DB741F] hover:bg-[#FFE9D8] transition-colors"
        >
          {t("catalogPage.goToCategory")}
        </Link>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 w-full">
        <button
          type="button"
          aria-label="scroll left"
          onClick={scrollLeft}
          className="hidden sm:flex shrink-0 p-3 z-10 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <EditableImage
            imageKey={`catalog_deep_${group.category.id}_arrow_left`}
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
          className="flex-1 flex gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {group.products.length === 0 ? (
            <div className="text-gray-500 px-4">{t("catalogPage.noDeepProducts")}</div>
          ) : (
            group.products.map((product: Product) => (
              <div
                key={product.id}
                role="listitem"
                className="snap-center shrink-0 w-[260px] xs:w-[280px] sm:w-64 md:w-72 lg:w-80"
              >
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  coverImage={product.coverImage}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  inStock={product.inStock}
                  keyFeatures={normalizeKeyFeatures(product.keyFeatures)}
                  categoryId={group.category.id}
                  categoryName={group.category.name}
                  showCompare={false}
                />
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          aria-label="scroll right"
          onClick={scrollRight}
          className="hidden sm:flex shrink-0 p-3 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <EditableImage
            imageKey={`catalog_deep_${group.category.id}_arrow_right`}
            fallbackSrc={RightIcon}
            alt="Right"
            className="w-6 h-6 sm:w-10 sm:h-10"
          />
        </button>
      </div>
    </section>
  );
};

const CatalogDeepProductsPage = ({
  embedded = false,
  categoryId: categoryIdFromParent = null,
}: CatalogDeepProductsPageProps) => {
  const { i18n, t } = useTranslation();
  const { categorySlug, categoryId } = useParams<{
    categorySlug?: string;
    categoryId?: string;
  }>();
  const [searchParams] = useSearchParams();

  const explicitCategoryId = useMemo(() => {
    if (
      typeof categoryIdFromParent === "number" &&
      Number.isFinite(categoryIdFromParent) &&
      categoryIdFromParent > 0
    ) {
      return categoryIdFromParent;
    }

    const fromParam = Number(categoryId);
    if (Number.isFinite(fromParam) && fromParam > 0) return fromParam;

    const fromQuery = Number(searchParams.get("categoryId"));
    if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery;

    return null;
  }, [categoryIdFromParent, categoryId, searchParams]);

  const { data: categories = [] } = useGetCategoriesTreeQuery({
    lang: i18n.language,
  });

  const selectedCategory = useMemo(() => {
    if (explicitCategoryId) {
      return findCategoryById(categories, explicitCategoryId);
    }

    if (categorySlug) {
      return findCategoryBySlug(categories, categorySlug);
    }

    return null;
  }, [categories, explicitCategoryId, categorySlug]);

  const selectedCategoryId = useMemo(() => {
    if (selectedCategory) {
      const normalized = Number(selectedCategory.id);
      return Number.isFinite(normalized) ? normalized : null;
    }

    return explicitCategoryId;
  }, [selectedCategory, explicitCategoryId]);

  const parentCategoryId =
    typeof categoryIdFromParent === "number" &&
    Number.isFinite(categoryIdFromParent) &&
    categoryIdFromParent > 0
      ? categoryIdFromParent
      : null;

  const rootCategoryIds = useMemo(() => {
    const hasNestedTree = categories.some(
      (category) =>
        Array.isArray(category.children) && category.children.length > 0,
    );

    if (hasNestedTree) {
      return new Set(
        categories
          .map((category) => Number(category.id))
          .filter((id) => Number.isFinite(id)),
      );
    }

    return new Set(
      categories
        .filter((category) => category.parentId === null)
        .map((category) => Number(category.id))
        .filter((id) => Number.isFinite(id)),
    );
  }, [categories]);

  const isRootCategory = selectedCategoryId === null
    ? true
    : rootCategoryIds.has(selectedCategoryId);

  const deepQueryParams = parentCategoryId
    ? { categoryId: parentCategoryId }
    : isRootCategory
    ? {}
    : { categoryId: selectedCategoryId ?? undefined };

  const { data, isLoading, error } = useGetProductsDeepQuery(deepQueryParams);

  const groups = data?.content ?? [];
  const pageTitle = selectedCategory?.name ?? t("catalogPage.deepProductsTitle");

  const content = isLoading ? (
    <div className="text-gray-500 px-2">{t("commonCatalog.loading")}</div>
  ) : error ? (
    <div className="text-red-500 px-2">{t("commonCatalog.error")}</div>
  ) : groups.length === 0 ? (
    <div className="text-gray-500 px-2">{t("catalogPage.noDeepProducts")}</div>
  ) : (
    groups.map((group) => <CategoryCarousel key={group.category.id} group={group} />)
  );

  if (embedded) {
    return (
      <section className="mt-10 sm:mt-12">
        <div className="mb-6 sm:mb-7 px-1 sm:px-2">
          <h2 className="font-oswald text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-gray-900">
            {t("catalogPage.deepProductsTitle")}
          </h2>
          <div className="mt-2 h-1 w-28 rounded-full bg-[#F58322]" />
        </div>
        {content}
      </section>
    );
  }

  return (
    <PageContainer>
      <div className="mt-12 px-4 md:px-6 lg:px-0">
        <div className="mb-4 text-sm text-gray-500">
          <Link to="/catalog" className="hover:text-[#DB741F] transition-colors">
            {t("commonCatalog.catalog")}
          </Link>
          <span className="mx-2">/</span>
          <span>{pageTitle}</span>
        </div>

        <h1 className="font-oswald text-3xl md:text-4xl font-bold uppercase mb-10">
          {pageTitle}
        </h1>

        {content}
      </div>
    </PageContainer>
  );
};

export default CatalogDeepProductsPage;
