import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/app/hooks'
import { addToCart } from '@/features/cartSlice'

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
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const imgSrc = product.coverImage ?? PLACEHOLDER_IMG;

  const priceNumber =
    typeof product.price === "number"
      ? product.price
      : typeof product.price === "string"
      ? Number(product.price)
      : NaN;

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString(i18n.language)} ₸`
    : "—";

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
      className="bg-white border border-gray-200 p-4 rounded-sm hover:shadow-lg transition flex flex-col h-full group"
      aria-label={product.name}
    >
      <div className="h-40 flex items-center justify-center mb-4 relative">
        <img
          src={imgSrc}
          alt={product.name ?? "product image"}
          className="max-h-full object-contain"
          loading="lazy"
        />
      </div>

      <h3 className="text-sm font-extrabold text-gray-800 leading-tight mb-3 group-hover:text-[#DB741F] transition-colors line-clamp-2">
        {product.name}
      </h3>

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
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()

            if (product.inStock === false || !Number.isFinite(priceNumber)) return

            dispatch(
              addToCart({
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: imgSrc,
                price: priceNumber,
                oldPrice: product.oldPrice,
                inStock: product.inStock,
              })
            )
          }}
          className={`w-full py-2 text-sm font-extrabold uppercase rounded-sm transition ${
            product.inStock === false
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#F58322] text-white hover:bg-[#DB741F]"
          }`}
          disabled={product.inStock === false}
        >
          {product.inStock === false ? t('commonCatalog.outOfStock') : t('commonCatalog.buy')}
        </button>
      </div>
    </Link>
  );
};

export default CatalogCard;
