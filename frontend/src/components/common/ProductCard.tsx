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
  variant?: "default" | "compact" | "mini";
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
  variant = "default",
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
  const isCompact = variant === "compact";
  const isMini = variant === "mini";

  return (
    <Link
      to={`/catalog/product/${slug}`}
      className={`bg-white border border-gray-200 ${isMini ? "p-1.5 rounded-md" : isCompact ? "p-2 sm:p-2.5 md:p-2.5 lg:p-3 rounded-md" : "p-2.5 sm:p-3 md:p-2.5 lg:p-3 xl:p-4 rounded-md sm:rounded-sm"} transition flex flex-col h-full group ${
        isOutOfStock ? "border-gray-300" : "hover:shadow-lg"
      }`}
    >
      <div className={`relative flex items-center justify-center ${isMini ? "h-16 mb-1" : isCompact ? "h-24 sm:h-28 md:h-28 lg:h-32 mb-1.5 sm:mb-2 md:mb-2 lg:mb-2.5" : "h-28 sm:h-32 md:h-28 lg:h-32 xl:h-40 mb-2 sm:mb-2.5 md:mb-2 lg:mb-3 xl:mb-4"}`}>
        {isNew === true && !isOutOfStock && (
          <span className={`absolute left-2 top-2 z-20 inline-flex items-center rounded-full bg-[#FFF4EA] text-[#DB741F] font-semibold ${isCompact ? "px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]" : "px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px]"}`}>
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

      <h3 className={`font-manrope font-extrabold text-gray-800 leading-snug sm:leading-tight group-hover:text-[#DB741F] transition-colors line-clamp-2 ${isMini ? "text-[10px] mb-1" : isCompact ? "text-[11px] sm:text-xs md:text-[13px] mb-1 sm:mb-1.5" : "text-xs sm:text-sm md:text-[13px] lg:text-sm mb-1.5 sm:mb-2"}`}>
        {name}
      </h3>

      <div className={`flex flex-wrap items-center ${isMini ? "mb-1 gap-1" : isCompact ? "mb-1.5 sm:mb-2 gap-1.5" : "mb-2 sm:mb-2.5 md:mb-2 lg:mb-3 gap-1.5 sm:gap-2"}`}>
        <span
          className={`inline-flex items-center rounded-full font-semibold ${isMini ? "px-1 py-0.5 text-[8px]" : isCompact ? "px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]" : "px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px]"} ${
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
        <div className={`${isCompact ? "mb-1.5 sm:mb-2 space-y-0.5" : "mb-2 sm:mb-2.5 md:mb-2 lg:mb-3 space-y-1"}`}>
          {normalizedFeatures.map((nf, idx) => (
            <div
              key={idx}
              className={`items-center gap-1 ${isCompact ? "text-[9px] sm:text-[10px] md:text-[11px]" : "text-[10px] sm:text-xs md:text-[11px]"} ${idx > 1 ? "hidden sm:flex" : "flex"}`}
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
        <p className={`font-bold text-gray-900 ${isMini ? "text-xs mb-1" : isCompact ? "text-[15px] sm:text-base md:text-[17px] mb-1.5 sm:mb-2" : "text-base sm:text-[17px] md:text-base lg:text-[17px] xl:text-lg mb-2.5 sm:mb-2.5 md:mb-2 lg:mb-3"}`}>
          {formattedPrice}
        </p>
        {formattedOldPrice && (
          <p className={`${isMini ? "-mt-1 mb-1 text-[9px]" : isCompact ? "-mt-1 mb-1.5 sm:mb-2 text-[10px] sm:text-xs" : "-mt-1.5 sm:-mt-2 mb-2.5 sm:mb-2.5 md:mb-2 lg:mb-3 text-[11px] sm:text-xs"} text-gray-400 line-through`}>
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
              className={`flex shrink-0 items-center justify-center rounded-sm border transition ${isCompact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 sm:h-10 sm:w-10"} ${
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
                className={`${isMini ? "w-6 h-6 text-xs" : isCompact ? "w-8 h-8 sm:w-9 sm:h-9 text-sm" : "w-9 h-9 sm:w-10 sm:h-10"} flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition`}
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
              <span className={`${isMini ? "text-[10px]" : isCompact ? "text-xs sm:text-sm" : "text-sm sm:text-base"} text-white font-bold`}>
                {cartItem.quantity}
              </span>
              <button
                type="button"
                className={`${isMini ? "w-6 h-6 text-xs" : isCompact ? "w-8 h-8 sm:w-9 sm:h-9 text-sm" : "w-9 h-9 sm:w-10 sm:h-10"} flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition`}
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
               className={`w-full font-extrabold uppercase rounded-sm transition bg-[#F58322] text-white hover:bg-[#DB741F] ${isMini ? "py-1 text-[9px]" : isCompact ? "py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-[13px]" : "py-2 text-[11px] sm:text-[13px] md:text-xs lg:text-sm"}`}
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
