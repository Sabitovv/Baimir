import { useGetCategoriesTreeQuery, type Category } from "@/api/categoriesApi";
import {
  useGetProductsDeepQuery,
  type CategoryProductGroup,
} from "@/api/productsApi";
import PageContainer from "@/components/ui/PageContainer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ProductCarousel from "@/components/collections/ProductCarousel";
import type { CollectionProduct } from "@/api/productCollectionsApi";

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

const CategoryCarousel = ({ group }: { group: CategoryProductGroup }) => {
  const { t } = useTranslation();
  
  const categoryHasProducts =
    Number(group.category.productCount ?? group.totalProducts ?? group.products.length) > 0;
    
  const categoryLink = categoryHasProducts
    ? `/catalog/${group.category.slug}/products/${group.category.id}?categoryId=${group.category.id}&sort=price,ASC`
    : `/catalog/${group.category.slug}?categoryId=${group.category.id}`;

  const carouselProducts = useMemo<CollectionProduct[]>(() => {
    return group.products.map(p => ({
      ...p,
      categoryName: group.category.name,
      newProduct: false,
    } as unknown as CollectionProduct));
  }, [group.products, group.category.name]);

  return (
    <section className="-mx-4 sm:mx-0 mb-5 sm:mb-6 md:mb-7 lg:mb-8 rounded-none sm:rounded-2xl border-x-0 sm:border-x border-y border-gray-100 bg-gradient-to-b from-white to-gray-50/60 p-2.5 sm:p-3.5 md:p-3 lg:p-4">
      <div className="mb-3 sm:mb-3.5 md:mb-3 flex items-center justify-between gap-2 sm:gap-3 px-1 sm:px-2">
        <div className="min-w-0">
          <h2 className="font-oswald text-sm sm:text-xl md:text-2xl lg:text-[28px] xl:text-3xl font-bold uppercase text-gray-900 truncate">
            {group.category.name}
          </h2>
          <div className="mt-1 h-[3px] w-12 sm:w-14 md:w-12 lg:w-16 rounded-full bg-[#F58322]" />
        </div>

        <Link
          to={categoryLink}
          className="shrink-0 rounded-full border border-[#F3C9A8] bg-[#FFF4EA] w-8 h-8 sm:w-auto sm:h-auto px-0 sm:px-3 md:px-2.5 lg:px-4 py-0 sm:py-1.5 md:py-1.5 lg:py-2 flex items-center justify-center text-[10px] sm:text-xs md:text-[11px] lg:text-sm font-semibold uppercase tracking-wide text-[#DB741F] hover:bg-[#FFE9D8] transition-colors"
          aria-label={t("catalogPage.goToCategory")}
          title={t("catalogPage.goToCategory")}
        >
          <span className="sm:hidden" aria-hidden="true">
            →
          </span>
          <span className="hidden sm:inline">{t("catalogPage.goToCategory")}</span>
        </Link>
      </div>

      <div className="w-full">
        {group.products.length === 0 ? (
          <div className="text-gray-500 px-4">{t("catalogPage.noDeepProducts")}</div>
        ) : (
          <ProductCarousel
            products={carouselProducts}
            className="w-full"
            cardVariant="compact"
          />
        )}
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
      <section className="mt-4 sm:mt-6 md:mt-8">
        {content}
      </section>
    );
  }

  return (
    <PageContainer>
      <div className="mt-8 sm:mt-10 md:mt-11 lg:mt-12 px-4 md:px-5 lg:px-0">
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
          <Link to="/catalog" className="hover:text-[#DB741F] transition-colors">
            {t("commonCatalog.catalog")}
          </Link>
          <span className="mx-2">/</span>
          <span>{pageTitle}</span>
        </div>

        <h1 className="font-oswald text-[22px] leading-tight sm:text-3xl md:text-[34px] lg:text-4xl font-bold uppercase mb-6 sm:mb-8 md:mb-9 lg:mb-10">
          {pageTitle}
        </h1>

        {content}
      </div>
    </PageContainer>
  );
};

export default CatalogDeepProductsPage;