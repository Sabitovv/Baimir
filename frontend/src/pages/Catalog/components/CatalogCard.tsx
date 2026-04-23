import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "@/features/cartSlice";
import { useCartAnimation } from "@/components/animations/useCartAnimation";
import { addRecentlyViewedProductId } from "@/utils/recentlyViewedStorage";

type RawFeatureObject = {
  label?: string | null;
  name?: string | null;
  value?: string | number | null;
  unit?: string | null;
};

type Feature = string | RawFeatureObject | null | undefined;

type NormalizedFeature = {
  label?: string;
  value: string;
  unit?: string;
};

type Product = {
  id: number;
  slug: string;
  name: string;
  coverImage?: string | null;
  price?: number | string | null;
  oldPrice?: number | null;
  keyFeatures?: Feature[] | null;
  inStock?: boolean;
  newProduct?: boolean;
  new?: boolean;
};

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=No+image";

const normalizeFeature = (feature: Feature): NormalizedFeature | null => {
  if (feature == null) return null;

  if (typeof feature === "string") {
    const trimmed = feature.trim();
    if (!trimmed) return null;
    return { value: trimmed };
  }

  if (typeof feature === "object") {
    const rawLabel = feature.label ?? feature.name ?? "";
    const rawValue =
      feature.value === undefined || feature.value === null
        ? ""
        : String(feature.value).trim();
    const rawUnit =
      feature.unit === undefined || feature.unit === null
        ? ""
        : String(feature.unit).trim();

    if (!rawValue) return null;

    const normalized: NormalizedFeature = {
      value: rawValue,
    };

    if (rawLabel) normalized.label = rawLabel;
    if (rawUnit) normalized.unit = rawUnit;

    return normalized;
  }

  return null;
};

const CatalogCard: React.FC<{ product: Product }> = ({ product }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const cartItem = items.find((item) => item.id === product.id);
  const imgSrc = product.coverImage ?? PLACEHOLDER_IMG;
  const { addAnimation } = useCartAnimation();

  const priceNumber =
    typeof product.price === "number"
      ? product.price
      : typeof product.price === "string"
        ? Number(product.price)
        : NaN;

  const cartPrice = Number.isFinite(priceNumber) ? priceNumber : undefined;

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString(i18n.language)} ₸`
    : t("commonCatalog.askPrice");

  const normalizedFeatures = useMemo(() => {
    return (
      product.keyFeatures
        ?.map((f) => normalizeFeature(f))
        .filter((f): f is NormalizedFeature => !!f)
        .slice(0, 3) ?? []
    );
  }, [product.keyFeatures]);

  return (
    <Link
      to={`/catalog/product/${product.slug}`}
      onClick={() => addRecentlyViewedProductId(product.id)}
      className="bg-white border border-gray-200 p-4 rounded-sm hover:shadow-lg transition flex flex-col h-full group"
      aria-label={product.name}
    >
      <div className="h-40 flex items-center justify-center mb-4 relative">
        {(product.newProduct ?? product.new) === true &&
          product.inStock !== false && (
            <span className="absolute left-2 top-2 z-20 inline-flex items-center rounded-full bg-[#FFF4EA] px-2.5 py-1 text-[11px] font-semibold text-[#DB741F]">
              {t("commonCatalog.new")}
            </span>
          )}
        <img
          src={imgSrc}
          alt={product.name ?? "product image"}
          className="max-h-full object-contain"
          loading="lazy"
        />
      </div>

      <h3 className="font-manrope text-sm font-extrabold text-gray-800 leading-tight mb-3 group-hover:text-[#DB741F] transition-colors line-clamp-2">
        {product.name}
      </h3>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            product.inStock === false
              ? "bg-gray-100 text-gray-600"
              : "bg-green-50 text-green-700"
          }`}
        >
          {product.inStock === false
            ? t("commonCatalog.outOfStock")
            : t("commonCatalog.inStock")}
        </span>
      </div>

      {normalizedFeatures.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {normalizedFeatures.map((nf, idx) => (
            <div key={idx} className="flex items-center text-xs gap-2">
              {nf.label && (
                <span className="text-gray-500 font-medium whitespace-nowrap">
                  {nf.label}:
                </span>
              )}

              <span
                className="text-gray-800 font-semibold truncate min-w-0 flex-1"
                title={`${nf.value}${nf.unit ? ` ${nf.unit}` : ""}`}
              >
                {nf.value}
                {nf.unit ? ` ${nf.unit}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <p className="text-lg font-bold text-gray-900 mb-3">{formattedPrice}</p>

        {cartItem ? (
          <div className="flex items-center justify-between bg-[#F58322] rounded-sm">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition"
              onClick={(event) => {
                event.preventDefault();
                if (cartItem.quantity <= 1) {
                  dispatch(removeFromCart(product.id));
                } else {
                  dispatch(decrementQuantity(product.id));
                }
              }}
            >
              −
            </button>
            <span className="text-white font-bold">{cartItem.quantity}</span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition"
              onClick={(event) => {
                event.preventDefault();
                dispatch(incrementQuantity(product.id));
              }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();

              if (product.inStock === false) return;

              addAnimation(product.id, imgSrc, event);

              dispatch(
                addToCart({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: imgSrc,
                  price: cartPrice,
                  oldPrice: product.oldPrice,
                  inStock: product.inStock,
                }),
              );
            }}
            className={`w-full py-2 text-sm font-extrabold uppercase rounded-sm transition ${
              product.inStock === false
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#F58322] text-white hover:bg-[#DB741F]"
            }`}
            disabled={product.inStock === false}
          >
            {product.inStock === false
              ? t("commonCatalog.outOfStock")
              : t("commonCatalog.buy")}
          </button>
        )}
      </div>
    </Link>
  );
};

export default CatalogCard;
