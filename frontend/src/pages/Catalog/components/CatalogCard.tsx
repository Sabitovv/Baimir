import React, { useMemo } from "react";
import { Link } from "react-router-dom";

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
  const imgSrc = product.coverImage ?? PLACEHOLDER_IMG;

  const priceNumber =
    typeof product.price === "number"
      ? product.price
      : typeof product.price === "string"
      ? Number(product.price)
      : NaN;

  const formattedPrice = Number.isFinite(priceNumber)
    ? `${priceNumber.toLocaleString("ru-RU")} ₸`
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

      <h3 className="text-sm font-extrabold text-gray-800 leading-tight mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
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
          className={`w-full py-2 text-sm font-extrabold uppercase rounded-sm transition ${
            product.inStock === false
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#E3541C] text-white hover:bg-orange-700"
          }`}
          disabled={product.inStock === false}
        >
          {product.inStock === false ? "Нет в наличии" : "Купить"}
        </button>
      </div>
    </Link>
  );
};

export default CatalogCard;
