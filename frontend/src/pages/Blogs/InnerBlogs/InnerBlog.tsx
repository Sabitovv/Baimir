import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PageContainer from "@/components/ui/PageContainer";
import CategoriesMenu from "@/components/common/CategoriesMenu";
import { useGetBlogBySlugQuery, type BlogContentBlock } from "@/api/blogsApi";
import defaultImage from "@/assets/home/lazerStanok.webp";
import { useGetProductsBatchQuery } from "@/api/productsApi";
import ProductCard from "@/components/common/ProductCard";
import { useImageEditorStore } from "@/zustand/ImageEditorState";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type LocalizedText = {
  ru?: string;
  en?: string;
  kz?: string;
  kk?: string;
};

const pickLocalized = (
  value?: LocalizedText | string,
  lang?: string,
): string => {
  if (!value) return "";
  if (typeof value === "string") return value;

  const current = lang === "kk" ? "kz" : lang;
  const localized = current ? value[current as keyof LocalizedText] : undefined;

  return localized || value.ru || value.en || value.kz || value.kk || "";
};

const formatDate = (iso?: string, lang?: string) => {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";

  const locale =
    lang === "en"
      ? "en-US"
      : lang === "kk" || lang === "kz"
        ? "kk-KZ"
        : "ru-RU";

  return parsed.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getBlockImage = (block?: BlogContentBlock): string | null => {
  if (!block?.data) return null;
  const direct =
    typeof block.data.imageUrl === "string" ? block.data.imageUrl : null;
  const url = typeof block.data.url === "string" ? block.data.url : null;
  const candidate = direct || url;
  return candidate && candidate.trim() ? candidate : null;
};

const getBlogImage = (
  value: {
    imageUrl?: string | null;
    coverImage?: string | null;
    coverImageUrl?: string | null;
    thumbnailUrl?: string | null;
    contentBlocks?: BlogContentBlock[];
  },
  fallbackImage: string,
) => {
  const direct =
    value.imageUrl ||
    value.coverImage ||
    value.coverImageUrl ||
    value.thumbnailUrl;
  if (direct && direct.trim()) return direct;
  const fromBlocks = value.contentBlocks?.find((block) =>
    Boolean(getBlockImage(block)),
  );
  return getBlockImage(fromBlocks) || fallbackImage;
};

const imageRatioClassMap: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
};

const imageWidthClassMap: Record<string, string> = {
  "1/3": "md:col-span-4",
  "1/2": "md:col-span-6",
  "2/3": "md:col-span-8",
  full: "md:col-span-12",
};

const textWidthClassMap: Record<string, string> = {
  "1/3": "md:col-span-8",
  "1/2": "md:col-span-6",
  "2/3": "md:col-span-4",
  full: "md:col-span-12",
};

const BlogProductsBlock = ({
  productIds,
  layout,
}: {
  productIds: string[];
  layout: string;
}) => {
  const { t } = useTranslation();
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsBatchQuery(productIds, {
    skip: !productIds.length,
  });

  if (!productIds.length) return null;
  if (isLoading)
    return (
      <div className="py-8 text-center text-gray-500">
        {t("innerBlog.loadingProducts")}
      </div>
    );
  if (isError || !products?.length) return null;

  const shouldUseCarousel = layout === "carousel" || products.length > 3;
  const gridClass =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr";

  return (
    <section className="my-8">
      {shouldUseCarousel ? (
        <Swiper
          modules={[Pagination]}
          spaceBetween={16}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1.1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="h-auto">
              <ProductCard
                id={product.id}
                slug={product.slug}
                name={product.name}
                coverImage={product.coverImage}
                price={product.price}
                oldPrice={product.oldPrice}
                inStock={product.inStock}
                isNew={product.new}
                categoryId={product.category?.id}
                categoryName={product.category?.name}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={gridClass}>
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
              isNew={product.new}
              categoryId={product.category?.id}
              categoryName={product.category?.name}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const renderContentBlock = (block: BlogContentBlock, index: number) => {
  const key = `${block.type}-${index}`;

  if (block.type === "heading") {
    const text = String(block.data?.text ?? "").trim();
    if (!text) return null;
    const levelRaw = Number(block.data?.level);
    const level = Number.isFinite(levelRaw)
      ? Math.max(2, Math.min(levelRaw, 4))
      : 2;
    if (level === 2) {
      return (
        <h2 key={key} className="font-oswald font-bold text-3xl mt-10 mb-5">
          {text}
        </h2>
      );
    }
    if (level === 3) {
      return (
        <h3 key={key} className="font-oswald font-bold text-2xl mt-8 mb-4">
          {text}
        </h3>
      );
    }
    return (
      <h4 key={key} className="font-oswald font-bold text-xl mt-6 mb-3">
        {text}
      </h4>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p
        key={key}
        className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line"
      >
        {String(block.data?.text ?? "")}
      </p>
    );
  }

  if (block.type === "image") {
    const src = getBlockImage(block);
    if (!src) return null;
    const alt = String(block.data?.alt ?? block.data?.title ?? "blog image");
    const caption =
      typeof block.data?.caption === "string" ? block.data.caption : "";

    return (
      <figure key={key} className="mb-8">
        <img
          src={src}
          alt={alt}
          className="w-full rounded-lg object-cover"
          loading="lazy"
        />
        {caption && (
          <figcaption className="text-sm text-gray-500 mt-2">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "list") {
    const items = Array.isArray(block.data?.items)
      ? block.data.items.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
      : [];
    if (!items.length) return null;
    const ordered = Boolean(block.data?.ordered);

    if (ordered) {
      return (
        <ol
          key={key}
          className="list-decimal pl-6 mb-6 text-gray-700 space-y-2"
        >
          {items.map((item, itemIndex) => (
            <li key={`${key}-ol-${itemIndex}`}>{item}</li>
          ))}
        </ol>
      );
    }

    return (
      <ul key={key} className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        {items.map((item, itemIndex) => (
          <li key={`${key}-ul-${itemIndex}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "quote") {
    const quote = String(block.data?.quote ?? block.data?.text ?? "").trim();
    if (!quote) return null;
    const author =
      typeof block.data?.author === "string" ? block.data.author.trim() : "";

    return (
      <blockquote
        key={key}
        className="border-l-4 border-[#F58322] pl-5 py-1 mb-7 text-gray-700 italic"
      >
        <p>{quote}</p>
        {author && (
          <footer className="mt-2 text-sm text-gray-500 not-italic">
            — {author}
          </footer>
        )}
      </blockquote>
    );
  }

  if (block.type === "table") {
    const rows = Array.isArray(block.data?.rows) ? block.data.rows : [];
    if (!rows.length) return null;
    const [head, ...body] = rows;

    return (
      <div
        key={key}
        className="overflow-x-auto border border-gray-200 rounded-lg mb-8"
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {head.map((cell, cellIndex) => (
                <th
                  key={`${key}-th-${cellIndex}`}
                  className="px-4 py-3 text-left font-semibold border-b border-gray-200"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr
                key={`${key}-tr-${rowIndex}`}
                className="border-b border-gray-100 last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${key}-td-${rowIndex}-${cellIndex}`}
                    className="px-4 py-3 text-gray-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "imageCard") {
    const imageUrl =
      typeof block.data?.imageUrl === "string" && block.data.imageUrl.trim()
        ? block.data.imageUrl
        : null;
    if (!imageUrl) return null;

    const title =
      typeof block.data?.title === "string" ? block.data.title.trim() : "";
    const description =
      typeof block.data?.description === "string"
        ? block.data.description.trim()
        : "";
    const position =
      typeof block.data?.position === "string" ? block.data.position : "left";
    const imageRatio =
      typeof block.data?.imageRatio === "string"
        ? block.data.imageRatio
        : "video";
    const imageWidth =
      typeof block.data?.imageWidth === "string"
        ? block.data.imageWidth
        : "1/2";
    const verticalAlignClass =
      block.data?.verticalAlign === "center" ? "self-center" : "self-start";

    const isHorizontal = position === "left" || position === "right";
    const ratioClass =
      imageRatioClassMap[imageRatio] || imageRatioClassMap.video;
    const imageWidthClass =
      imageWidthClassMap[imageWidth] || imageWidthClassMap["1/2"];
    const textWidthClass =
      textWidthClassMap[imageWidth] || textWidthClassMap["1/2"];
    const mediaSlotClass =
      imageWidth === "full"
        ? "h-[220px] sm:h-[280px] lg:h-[340px]"
        : ratioClass;

    const imageOrderClass = isHorizontal
      ? position === "right"
        ? "md:order-2"
        : "md:order-1"
      : position === "bottom"
        ? "order-2"
        : "order-1";

    const textOrderClass = isHorizontal
      ? position === "right"
        ? "md:order-1"
        : "md:order-2"
      : position === "bottom"
        ? "order-1"
        : "order-2";

    return (
      <section
        key={key}
        className={`grid grid-cols-1 ${isHorizontal ? "md:grid-cols-12" : ""} gap-5 rounded-xl border border-gray-200 p-4 md:p-5 bg-gradient-to-b from-white to-gray-50/70 shadow-sm mb-8`}
      >
        <div
          className={`w-full ${imageWidthClass} ${imageOrderClass} ${verticalAlignClass}`}
        >
          <div
            className={`${mediaSlotClass} rounded-xl overflow-hidden bg-[#F3F4F6] border border-gray-200 p-2 sm:p-3`}
          >
            <img
              src={imageUrl}
              alt={title || "blog-image"}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>

        {(title || description) && (
          <div
            className={`${isHorizontal ? textWidthClass : "w-full"} ${textOrderClass} ${verticalAlignClass} space-y-2`}
          >
            {title && (
              <h3 className="font-oswald font-bold text-2xl text-gray-900 md:text-3xl">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-700 whitespace-pre-line md:text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  if (block.type === "cardGrid") {
    const cardsRaw = block.data?.cards;
    const cards = Array.isArray(cardsRaw) ? cardsRaw : [];
    if (!cards.length) return null;

    const columns = Number(block.data?.columns);
    const ratio =
      typeof block.data?.imageRatio === "string"
        ? block.data.imageRatio
        : "square";
    const ratioClass = imageRatioClassMap[ratio] || imageRatioClassMap.square;
    const colsClass =
      columns === 2
        ? "md:grid-cols-2"
        : columns === 4
          ? "md:grid-cols-2 lg:grid-cols-4"
          : "md:grid-cols-2 lg:grid-cols-3";

    return (
      <section key={key} className={`grid grid-cols-1 ${colsClass} gap-5 mb-8`}>
        {cards.map((card, cardIndex) => {
          const cardData = (
            card && typeof card === "object" ? card : {}
          ) as Record<string, unknown>;
          const cardTitle =
            typeof cardData.title === "string" ? cardData.title.trim() : "";
          const cardDescription =
            typeof cardData.description === "string"
              ? cardData.description.trim()
              : "";
          const cardImage =
            typeof cardData.imageUrl === "string" && cardData.imageUrl.trim()
              ? cardData.imageUrl
              : "";

          return (
            <article
              key={`${key}-card-${cardIndex}`}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <div
                className={`${ratioClass} bg-[#F3F4F6] border-b border-gray-200`}
              >
                {cardImage ? (
                  <img
                    src={cardImage}
                    alt={cardTitle || `card-${cardIndex + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              {(cardTitle || cardDescription) && (
                <div className="p-4">
                  {cardTitle && (
                    <h4 className="font-oswald font-bold text-lg text-gray-900 mb-2">
                      {cardTitle}
                    </h4>
                  )}
                  {cardDescription && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {cardDescription}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
    );
  }

  if (block.type === "productLink") {
    const productIds = Array.isArray(block.data?.productIds)
      ? block.data.productIds
      : [];
    const layout =
      typeof block.data?.layout === "string" ? block.data.layout : "grid";
    if (!productIds.length) return null;

    return (
      <BlogProductsBlock key={key} productIds={productIds} layout={layout} />
    );
  }

  if (typeof block.data?.text === "string" && block.data.text.trim()) {
    return (
      <p
        key={key}
        className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line"
      >
        {block.data.text}
      </p>
    );
  }

  return null;
};

const InnerBlog = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const fallbackBlogImage = useImageEditorStore(
    (state) => state.images.inner_blog_default_image || defaultImage,
  );

  const { data, isLoading, isError } = useGetBlogBySlugQuery(
    { slug: slug || "", lang: i18n.language },
    { skip: !slug },
  );

  if (isLoading) {
    return (
      <PageContainer>
        <div className="py-16 text-center text-gray-500">
          {t("innerBlog.loading")}
        </div>
      </PageContainer>
    );
  }

  if (!slug || isError || !data) {
    return (
      <PageContainer>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-oswald font-bold mb-3">
            {t("innerBlog.notFoundTitle")}
          </h2>
          <p className="text-gray-600 mb-6">{t("innerBlog.notFoundText")}</p>
          <Link
            to="/blog"
            className="inline-block bg-[#F58322] text-white px-5 py-2 rounded hover:bg-[#DB741F] transition-colors"
          >
            {t("innerBlog.backToBlog")}
          </Link>
        </div>
      </PageContainer>
    );
  }

  const title =
    pickLocalized(data.title, i18n.language) || t("innerBlog.untitled");
  const excerpt = pickLocalized(data.excerpt, i18n.language);
  const publishedAt = formatDate(data.publishedAt, i18n.language);
  const heroImage = getBlogImage(data, fallbackBlogImage);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-16">
        <aside className="hidden lg:block space-y-6">
          <CategoriesMenu />
        </aside>

        <article className="max-w-[900px] mb-16">
          <h1 className="font-manrope font-bold text-3xl md:text-4xl xl:text-5xl uppercase mb-5">
            {title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-8">
            {data.authorName && (
              <span>
                {t("innerBlog.author")}: {data.authorName}
              </span>
            )}
            {publishedAt && (
              <span>
                {t("innerBlog.date")}: {publishedAt}
              </span>
            )}
            {typeof data.readingTime === "number" && (
              <span>
                {data.readingTime} {t("innerBlog.reading")}
              </span>
            )}
            {typeof data.viewsCount === "number" && (
              <span>
                {data.viewsCount} {t("innerBlog.views")}
              </span>
            )}
          </div>

          {excerpt && (
            <p className="text-gray-800 leading-relaxed mb-8 text-lg">
              {excerpt}
            </p>
          )}

          <img
            src={heroImage}
            alt={title}
            className="w-full max-h-[480px] object-cover rounded-lg mb-8"
            loading="lazy"
          />

          {data.contentBlocks && data.contentBlocks.length > 0 ? (
            <div>
              {data.contentBlocks.map((block, index) =>
                renderContentBlock(block, index),
              )}
            </div>
          ) : (
            <p className="text-gray-600">{t("innerBlog.emptyContent")}</p>
          )}
        </article>
      </div>
    </PageContainer>
  );
};

export default InnerBlog;
