import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "@/features/cartSlice";
import { useCartAnimation } from "../animations/useCartAnimation";
import { addToCompare, removeFromCompare } from "@/features/compareSlice";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import productPlaceholder from "@/assets/catalog/productPlaceholder.svg";

type KeyFeature = {
  code: string;
  label: string;
  value: string | number;
  unit?: string;
};

type ProductCardProps = {
  id: number;
  slug: string;
  name: string;
  coverImage?: string | null;
  price?: number | string | null;
  oldPrice?: number | null;
  inStock?: boolean;
  isNew?: boolean;
  keyFeatures?: KeyFeature[] | null;
  categoryId?: number | null;
  categoryName?: string | null;
  showCompare?: boolean;
};

const PLACEHOLDER_IMG = productPlaceholder;

const normalizeFeature = (
  feature: KeyFeature,
): { label?: string; value: string; unit?: string } | null => {
  if (!feature) return null;

  const rawLabel = feature.label ?? "";
  const rawValue =
    feature.value === undefined || feature.value === null
      ? ""
      : String(feature.value).trim();
  const rawUnit = feature.unit ?? "";

  if (!rawValue) return null;

  const normalized: { label?: string; value: string; unit?: string } = {
    value: rawValue,
  };
  if (rawLabel) normalized.label = rawLabel;
  if (rawUnit) normalized.unit = rawUnit;

  return normalized;
};

const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  name,
  id,
  coverImage,
  price,
  oldPrice,
  inStock,
  isNew,
  keyFeatures,
  categoryId,
  categoryName,
  showCompare = true,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const compareItems = useAppSelector((state) => state.compare.items);
  const [compareError, setCompareError] = React.useState<string | null>(null);
  const cartItem = items.find((item) => item.id === id);
  const imgSrc =
    typeof coverImage === "string" && coverImage.trim().length > 0
      ? coverImage
      : PLACEHOLDER_IMG;
  const [resolvedImgSrc, setResolvedImgSrc] = React.useState(imgSrc);
  const { addAnimation } = useCartAnimation();

  React.useEffect(() => {
    setResolvedImgSrc(imgSrc);
  }, [imgSrc]);

  const isInCompare = compareItems.some((item) => item.id === id);
  const isOutOfStock = inStock === false;

  const handleCompareToggle = () => {
    if (isInCompare) {
      dispatch(removeFromCompare(id));
      setCompareError(null);
      return;
    }

    const productCategoryId = Number(categoryId);
    const isValidCategory = Number.isFinite(productCategoryId);

    if (!isValidCategory) {
      setCompareError(t("compare.categoryUnknown"));
      return;
    }

    dispatch(
      addToCompare({
        id,
        slug,
        name,
        image: imgSrc,
        price: Number.isFinite(priceNumber) ? priceNumber : 0,
        categoryId: productCategoryId,
        categoryName: categoryName ?? "",
      }),
    );
    setCompareError(null);
  };

  const priceNumber =
    typeof price === "number"
      ? price
      : typeof price === "string"
        ? Number(price)
        : NaN;

  const cartPrice = Number.isFinite(priceNumber) ? priceNumber : undefined;

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString(i18n.language)} ₸`
    : t("commonCatalog.askPrice");

  const oldPriceNumber = typeof oldPrice === "number" ? oldPrice : NaN;
  const showOldPrice =
    Number.isFinite(oldPriceNumber) &&
    Number.isFinite(priceNumber) &&
    oldPriceNumber < priceNumber;
  const formattedOldPrice = showOldPrice
    ? `${oldPriceNumber.toLocaleString(i18n.language)} ₸`
    : null;

  const normalizedFeatures = React.useMemo(() => {
    return (keyFeatures ?? [])
      .map((f) => normalizeFeature(f))
      .filter((f): f is { label?: string; value: string; unit?: string } => !!f)
      .slice(0, 3);
  }, [keyFeatures]);
  return (
    <Link
      to={`/catalog/product/${slug}`}
      className={`bg-white border border-gray-200 p-2.5 sm:p-3 md:p-2.5 lg:p-3 xl:p-4 rounded-md sm:rounded-sm transition flex flex-col h-full group ${
        isOutOfStock ? "border-gray-300" : "hover:shadow-lg"
      }`}
    >
      <div className="relative h-28 sm:h-32 md:h-28 lg:h-32 xl:h-40 flex items-center justify-center mb-2 sm:mb-2.5 md:mb-2 lg:mb-3 xl:mb-4">
        {isNew === true && !isOutOfStock && (
          <span className="absolute left-2 top-2 z-20 inline-flex items-center rounded-full bg-[#FFF4EA] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-[#DB741F]">
            {t("commonCatalog.new")}
          </span>
        )}
        <img
          src={resolvedImgSrc}
          alt={name}
          className={`max-h-full object-contain ${isOutOfStock ? "opacity-80 saturate-75" : ""}`}
          loading="lazy"
          onError={() => setResolvedImgSrc(PLACEHOLDER_IMG)}
        />
      </div>

      <h3 className="font-manrope text-xs sm:text-sm md:text-[13px] lg:text-sm font-extrabold text-gray-800 leading-snug sm:leading-tight mb-1.5 sm:mb-2 group-hover:text-[#DB741F] transition-colors line-clamp-2">
        {name}
      </h3>

      <div className="mb-2 sm:mb-2.5 md:mb-2 lg:mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold ${
            isOutOfStock
              ? "bg-gray-100 text-gray-600"
              : "bg-green-50 text-green-700"
          }`}
        >
          {isOutOfStock
            ? t("commonCatalog.outOfStock")
            : t("commonCatalog.inStock")}
        </span>
      </div>

      {normalizedFeatures.length > 0 && (
        <div className="mb-2 sm:mb-2.5 md:mb-2 lg:mb-3 space-y-1">
          {normalizedFeatures.map((nf, idx) => (
            <div
              key={idx}
              className={`items-center text-[10px] sm:text-xs md:text-[11px] gap-1 ${idx > 1 ? "hidden sm:flex" : "flex"}`}
            >
              {nf.label && (
                <span className="text-gray-500 font-medium whitespace-nowrap">
                  {nf.label}:
                </span>
              )}
              <span className="text-gray-800 font-semibold truncate">
                {nf.value}
                {nf.unit ? ` ${nf.unit}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <p className="text-base sm:text-[17px] md:text-base lg:text-[17px] xl:text-lg font-bold text-gray-900 mb-2.5 sm:mb-2.5 md:mb-2 lg:mb-3">
          {formattedPrice}
        </p>
        {formattedOldPrice && (
          <p className="-mt-1.5 sm:-mt-2 mb-2.5 sm:mb-2.5 md:mb-2 lg:mb-3 text-[11px] sm:text-xs text-gray-400 line-through">
            {formattedOldPrice}
          </p>
        )}

        <div className="flex gap-2 items-stretch">
          {showCompare && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                handleCompareToggle();
              }}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-sm border transition ${
                isInCompare
                  ? "border-[#F58322] bg-[#FFF4EA] text-[#DB741F]"
                  : "border-gray-300 text-gray-700 hover:border-[#F58322] hover:text-[#DB741F]"
              }`}
              aria-label={
                isInCompare
                  ? t("compare.removeFromCompare")
                  : t("compare.addToCompare")
              }
              title={
                isInCompare
                  ? t("compare.removeFromCompare")
                  : t("compare.addToCompare")
              }
            >
              {isInCompare ? (
                <CheckCircleIcon sx={{ fontSize: 15 }} />
              ) : (
                <CompareArrowsIcon sx={{ fontSize: 15 }} />
              )}
            </button>
          )}

          {cartItem ? (
            <div className="flex w-full items-center justify-between bg-[#F58322] rounded-sm">
              <button
                type="button"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition"
                onClick={(event) => {
                  event.preventDefault();
                  if (cartItem.quantity <= 1) {
                    dispatch(removeFromCart(id));
                  } else {
                    dispatch(decrementQuantity(id));
                  }
                }}
              >
                −
              </button>
              <span className="text-white text-sm sm:text-base font-bold">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition"
                onClick={(event) => {
                  event.preventDefault();
                  dispatch(incrementQuantity(id));
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`w-full py-2 text-[11px] sm:text-[13px] md:text-xs lg:text-sm font-extrabold uppercase rounded-sm transition bg-[#F58322] text-white hover:bg-[#DB741F]`}
              onClick={(event) => {
                event.preventDefault();

                addAnimation(id, imgSrc, event);

                dispatch(
                  addToCart({
                    id,
                    slug,
                    name,
                    image: imgSrc,
                    price: cartPrice,
                    oldPrice,
                    inStock,
                  }),
                );
              }}
            >
              {t("commonCatalog.buy")}
            </button>
          )}
        </div>

        {showCompare && compareError && (
          <p className="mt-2 text-xs leading-tight text-red-600">
            {compareError}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
