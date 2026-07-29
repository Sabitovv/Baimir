import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PageContainer from "@/components/ui/PageContainer";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearCompare, removeFromCompare } from "@/features/compareSlice";
import { useGetProductsCompareQuery } from "@/api/productsApi";

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

const ComparePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const compareItems = useAppSelector((state) => state.compare.items);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const compareIds = compareItems.map((item) => item.id);
  const { data, isLoading, isError } = useGetProductsCompareQuery(
    compareIds.length > 0 ? compareIds : skipToken,
  );

  const groups = data ?? [];

  useEffect(() => {
    if (groups.length === 0) {
      if (selectedCategoryId !== null) {
        setSelectedCategoryId(null);
      }
      return;
    }

    const hasSelected =
      selectedCategoryId !== null &&
      groups.some((group) => group.categoryId === selectedCategoryId);

    if (!hasSelected) {
      const firstGroup = groups[0];
      if (firstGroup) {
        setSelectedCategoryId(firstGroup.categoryId);
      }
    }
  }, [groups, selectedCategoryId]);

  const activeGroup = useMemo(
    () =>
      groups.find((group) => group.categoryId === selectedCategoryId) ??
      groups[0],
    [groups, selectedCategoryId],
  );

  const displayedAttributes = useMemo(() => {
    if (!activeGroup) return [];
    if (!showOnlyDifferences) return activeGroup.attributes;

    return activeGroup.attributes.filter((attribute) => {
      const uniqueValues = new Set(
        activeGroup.products.map((product) => {
          const rawValue = attribute.values[String(product.id)];
          const normalized =
            typeof rawValue === "string" ? rawValue.trim().toLowerCase() : "";
          return normalized || "-";
        }),
      );

      return uniqueValues.size > 1;
    });
  }, [activeGroup, showOnlyDifferences]);

  const getAttributeValue = (value: string | undefined): string => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed || "-";
  };

  const handleClearCategory = (productIds: number[]) => {
    productIds.forEach((id) => {
      dispatch(removeFromCompare(id));
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/catalog");
  };

  if (compareItems.length === 0) {
    return (
      <PageContainer>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("compare.title")}
          </h1>
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:mt-8 sm:p-8">
            <p className="text-base font-semibold text-gray-800 sm:text-lg">
              {t("compare.emptyTitle")}
            </p>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              {t("compare.emptyDescription")}
            </p>
            <Link
              to="/catalog"
              className="mt-5 inline-flex rounded-xl bg-[#F58322] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#DB741F] sm:px-5 sm:py-3 sm:text-base"
            >
              {t("compare.goToCatalog")}
            </Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("compare.title")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F58322] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#DB741F] sm:gap-2 sm:px-4 sm:text-sm"
            >
              <ArrowBackRoundedIcon fontSize="inherit" />
              {t("common.back", { defaultValue: "Назад" })}
            </button>
            <button
              type="button"
              onClick={() => dispatch(clearCompare())}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-[#F58322] hover:text-[#DB741F] sm:px-4 sm:text-sm"
            >
              {t("compare.clear")}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            {t("compare.loading")}
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
            {t("compare.error")}
          </div>
        )}

        {!isLoading && !isError && groups.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            {t("compare.error")}
          </div>
        )}

        {!isLoading && !isError && groups.length > 0 && activeGroup && (
          <>
            <div className="mt-6 -mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:mt-8 sm:px-0">
              <div className="inline-flex w-max min-w-full gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 sm:gap-2 sm:p-2">
                {groups.map((group) => {
                  const isActive = activeGroup.categoryId === group.categoryId;

                  return (
                    <button
                      key={group.categoryId}
                      type="button"
                      onClick={() => setSelectedCategoryId(group.categoryId)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition sm:gap-2 sm:px-4 sm:text-sm ${
                        isActive
                          ? "bg-[#F58322] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-[#FFF4EA] hover:text-[#DB741F]"
                      }`}
                    >
                      <span>{group.categoryName}</span>
                      <span
                        className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] sm:min-w-6 sm:px-2 sm:text-xs ${isActive ? "bg-white/20 text-white" : "bg-white text-gray-600"}`}
                      >
                        {group.products.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 sm:pb-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {activeGroup.categoryName}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    handleClearCategory(
                      activeGroup.products.map((product) => product.id),
                    )
                  }
                  className="hidden rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-[#F58322] hover:text-[#DB741F] sm:inline-flex"
                >
                  {t("compare.clear")}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 sm:mt-6 sm:inline-flex sm:items-center sm:gap-2 sm:bg-transparent sm:p-0">
                <button
                  type="button"
                  onClick={() => setShowOnlyDifferences(false)}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-semibold transition sm:w-auto sm:px-4 sm:text-sm ${
                    !showOnlyDifferences
                      ? "bg-[#F58322] text-white"
                      : "bg-white text-gray-700 hover:text-[#DB741F] sm:border sm:border-gray-300 sm:hover:border-[#F58322]"
                  }`}
                >
                  {t("compare.allCharacteristics")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnlyDifferences(true)}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-semibold transition sm:w-auto sm:px-4 sm:text-sm ${
                    showOnlyDifferences
                      ? "bg-[#F58322] text-white"
                      : "bg-white text-gray-700 hover:text-[#DB741F] sm:border sm:border-gray-300 sm:hover:border-[#F58322]"
                  }`}
                >
                  {t("compare.onlyDifferences")}
                </button>
              </div>

              <div className="mt-5 hidden grid-cols-1 gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-4">
                {activeGroup.products.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <img
                      src={
                        product.coverImage ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={t("compare.productImageAlt", { name: product.name })}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-[#F58322]">
                      {formatPrice(product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCompare(product.id))}
                      className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-[#F58322] hover:text-[#DB741F]"
                    >
                      {t("compare.remove")}
                    </button>
                  </article>
                ))}
              </div>

              {showOnlyDifferences && displayedAttributes.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center text-xs text-gray-600 sm:p-6 sm:text-sm">
                  {t("compare.noDifferences")}
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="min-w-[150px] border-b border-r border-gray-200 bg-gray-50 px-3 py-3 text-left font-semibold text-gray-700 sm:min-w-[220px] sm:px-4">
                          {t("compare.attribute")}
                        </th>
                        {activeGroup.products.map((product) => (
                          <th
                            key={`head-${activeGroup.categoryId}-${product.id}`}
                            className="min-w-[180px] border-b border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700 sm:min-w-[220px] sm:px-4 sm:py-3"
                          >
                            <div className="hidden lg:block">{product.name}</div>
                            <article className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm lg:hidden">
                              <img
                                src={
                                  product.coverImage ||
                                  "https://placehold.co/600x400?text=No+Image"
                                }
                                alt={t("compare.productImageAlt", {
                                  name: product.name,
                                })}
                                className="h-14 w-full rounded-lg object-cover sm:h-16"
                              />
                              <h3 className="mt-2 line-clamp-2 text-[11px] font-semibold text-gray-900 sm:text-xs">
                                {product.name}
                              </h3>
                              <p className="mt-1 text-xs font-bold text-[#F58322]">
                                {formatPrice(product.price)}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch(removeFromCompare(product.id))
                                }
                                className="mt-2 rounded-md border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-700 transition-colors hover:border-[#F58322] hover:text-[#DB741F] sm:text-xs"
                              >
                                {t("compare.remove")}
                              </button>
                            </article>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAttributes.map((attribute, idx) => (
                        <tr
                          key={`${activeGroup.categoryId}-${attribute.attributeName}-${idx}`}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                          }
                        >
                          <td className="border-r border-gray-200 bg-inherit px-3 py-3 font-medium text-gray-700 sm:px-4">
                            {attribute.attributeName}
                          </td>
                          {activeGroup.products.map((product) => (
                            <td
                              key={`${activeGroup.categoryId}-${attribute.attributeName}-${product.id}`}
                              className="px-3 py-3 text-gray-700 sm:px-4"
                            >
                              {getAttributeValue(
                                attribute.values[String(product.id)],
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </PageContainer>
  );
};

export default ComparePage;
