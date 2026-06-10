import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");

const PORT = Number(process.env.PORT || 3000);
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://baytech.kz").replace(
  /\/$/,
  "",
);
const API_BASE_URL = (
  process.env.API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "https://baytech.kz/api/v1"
).replace(/\/$/, "");
const BRAND_NAME = "Baytech";
const BRAND_ALTERNATE_NAMES = ["BAYMIR Tech", "BAYMIR", "Baytech.kz"];
const DEFAULT_LANG = "ru-KZ";
const COMPANY_EMAIL = "baymir@inbox.ru";
const COMPANY_PHONE = "+77080055085";
const COMPANY_ADDRESS = "Алатауский район, микрорайон Рахат, 244";
const COMPANY_CITY = "Алматы";
const LOGO_URL = `${SITE_ORIGIN}/web-app-manifest-512x512.png`;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizePhone = (value) => String(value || "").replace(/[^\d+]/g, "");

const toAbsoluteBaytechUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return SITE_ORIGIN;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      return `${SITE_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return SITE_ORIGIN;
    }
  }

  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${SITE_ORIGIN}${normalizedPath}`;
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const compactJsonLd = (value) => {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => compactJsonLd(item))
      .filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactJsonLd(item)])
      .filter(([, item]) => item !== undefined);
    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (value === null || value === undefined) return undefined;
  return value;
};

const escapeJsonForHtml = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

const normalizeAcceptLanguage = (header) => {
  const raw = Array.isArray(header) ? header[0] : header;
  return String(raw || "ru").split(",")[0].trim() || "ru";
};

const send = (res, status, body, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
  });
  res.end(body);
};

const serveFile = async (res, filePath) => {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control":
        ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    res.end(body);
    return true;
  } catch {
    return false;
  }
};

const fetchJson = async (apiPath, langHeader, params = {}) => {
  const url = new URL(
    `${API_BASE_URL}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      "Accept-Language": normalizeAcceptLanguage(langHeader),
    },
  });

  if (!response.ok) return null;
  return response.json();
};

const fetchProductBySlug = async (slug, langHeader) => {
  return fetchJson(`/products/${encodeURIComponent(slug)}`, langHeader);
};

const fetchCategoriesTree = async (langHeader) =>
  fetchJson("/categories/tree", langHeader);

const fetchProductsByCategory = async (categoryId, langHeader) =>
  fetchJson(`/products/category/${encodeURIComponent(categoryId)}`, langHeader, {
    page: 1,
    limit: 50,
    sort: "price,ASC",
  });

const flattenCategories = (categories, seen = new Map()) => {
  if (!Array.isArray(categories)) return [];

  categories.forEach((category) => {
    if (!category || category.id === undefined || category.id === null) return;
    seen.set(String(category.id), category);
    flattenCategories(category.children, seen);
  });

  return Array.from(seen.values());
};

const hasCategoryChildren = (category, categories) =>
  categories.some((item) => Number(item?.parentId) === Number(category?.id)) ||
  Boolean(category?.children?.length);

const getCategoryPageUrl = (category, categories) => {
  if (!category?.slug) return `${SITE_ORIGIN}/catalog`;
  if (hasCategoryChildren(category, categories)) {
    return toAbsoluteBaytechUrl(
      `/catalog/${category.slug}?categoryId=${category.id}`,
    );
  }
  return toAbsoluteBaytechUrl(
    `/catalog/${category.slug}/products/${category.id}`,
  );
};

const getCategoryCollectionUrl = (category) =>
  category?.slug ? toAbsoluteBaytechUrl(`/catalog/${category.slug}`) : "";

const findCategoryBySlug = (categories, slug) =>
  categories.find((category) => category?.slug === slug) || null;

const findCategoryById = (categories, id) =>
  categories.find((category) => Number(category?.id) === Number(id)) || null;

const getCategoryAncestors = (category, categories) => {
  const stack = [];
  let current = category;

  while (current) {
    stack.push(current);
    current =
      current.parentId !== undefined && current.parentId !== null
        ? findCategoryById(categories, current.parentId)
        : null;
  }

  return stack.reverse();
};

const normalizeProductImages = (product) => {
  const imageCandidates = [
    product?.coverImage,
    ...(Array.isArray(product?.media)
      ? product.media
          .filter((item) =>
            String(item?.type || "").toUpperCase().includes("IMAGE"),
          )
          .map((item) => item?.url)
      : []),
  ];

  return [...new Set(imageCandidates.map(toAbsoluteBaytechUrl))].filter(
    (item) => item !== SITE_ORIGIN,
  );
};

const getProductBrandName = (product) => {
  const direct = stripHtml(product?.brandName || product?.brand?.name || "");
  if (direct) return direct;

  const brandAttribute = product?.specifications
    ?.flatMap((group) => group?.attributes ?? [])
    .find((attr) => /бренд|brand|производител/i.test(String(attr?.name || "")));

  return stripHtml(brandAttribute?.value || "");
};

const buildGlobalGraph = () => [
  {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: `${SITE_ORIGIN}/`,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
    description:
      "Baytech поставляет станки и промышленное оборудование в Казахстане: оборудование для металлообработки, лазерные станки, листогибочные станки, компрессоры, деревообработку, камнеобработку, электротехнику, запчасти и комплектующие.",
    email: COMPANY_EMAIL,
    telephone: COMPANY_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_ADDRESS,
      addressLocality: COMPANY_CITY,
      addressCountry: "KZ",
    },
    areaServed: {
      "@type": "Country",
      name: "Kazakhstan",
    },
    knowsAbout: [
      "Металлообработка",
      "Лазерные станки",
      "Листогибочные станки",
      "Гильотинные ножницы",
      "Компрессоры",
      "Деревообработка",
      "Камнеобработка",
      "Промышленное оборудование",
      "Запчасти для станков",
      "Пусконаладка оборудования",
      "Сервисное сопровождение оборудования",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: normalizePhone(COMPANY_PHONE),
        email: COMPANY_EMAIL,
        contactType: "sales",
        areaServed: "KZ",
        availableLanguage: ["ru", "kk"],
      },
    ],
  },
  {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: BRAND_NAME,
    alternateName: "Baytech.kz",
    publisher: {
      "@id": `${SITE_ORIGIN}/#organization`,
    },
    inLanguage: DEFAULT_LANG,
  },
];

const buildBreadcrumbGraph = (pageUrl, items) => ({
  "@type": "BreadcrumbList",
  "@id": `${pageUrl}#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item,
  })),
});

const buildSchemaScript = (pageGraph = []) => {
  const graph = compactJsonLd([...buildGlobalGraph(), ...pageGraph]) || [];
  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return `  <script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`;
};

const injectHeadContent = (indexHtml, content) =>
  indexHtml.replace("</head>", `${content}\n</head>`);

const renderHtmlWithSchema = (indexHtml, pageGraph = [], extraHead = "") =>
  injectHeadContent(
    indexHtml,
    `${extraHead}${extraHead ? "\n" : ""}${buildSchemaScript(pageGraph)}`,
  );

const buildHomeGraph = () => [
  {
    "@type": "WebPage",
    "@id": `${SITE_ORIGIN}/#webpage`,
    url: `${SITE_ORIGIN}/`,
    name: "Станки и промышленное оборудование в Казахстане",
    description:
      "Baytech поставляет станки и промышленное оборудование в Казахстане.",
    isPartOf: {
      "@id": `${SITE_ORIGIN}/#website`,
    },
    about: {
      "@id": `${SITE_ORIGIN}/#organization`,
    },
    inLanguage: DEFAULT_LANG,
  },
];

const buildCatalogGraph = (categories) => {
  const rootCategories = categories.filter(
    (category) => category?.parentId === null || category?.parentId === undefined,
  );
  const pageUrl = toAbsoluteBaytechUrl("/catalog");

  return [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Каталог станков и промышленного оборудования",
      description:
        "Каталог промышленного оборудования Baytech: металлообработка, лазерные станки, листогибочные станки, компрессоры, деревообработка, камнеобработка, электротехника, запчасти и комплектующие.",
      isPartOf: {
        "@id": `${SITE_ORIGIN}/#website`,
      },
      publisher: {
        "@id": `${SITE_ORIGIN}/#organization`,
      },
      inLanguage: DEFAULT_LANG,
    },
    buildBreadcrumbGraph(pageUrl, [
      { name: "Главная", item: `${SITE_ORIGIN}/` },
      { name: "Каталог", item: pageUrl },
    ]),
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      name: "Категории каталога Baytech",
      itemListElement: rootCategories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: stripHtml(category?.name),
        url: getCategoryCollectionUrl(category),
      })),
    },
  ];
};

const buildCategoryGraph = (category, categories, productsResponse) => {
  const pageUrl = getCategoryCollectionUrl(category);
  const children = categories.filter(
    (item) => Number(item?.parentId) === Number(category?.id),
  );
  const products = Array.isArray(productsResponse?.products)
    ? productsResponse.products
    : [];
  const listItems = children.length > 0 ? children : products;
  const ancestors = getCategoryAncestors(category, categories);

  return [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: stripHtml(category?.name),
      description:
        stripHtml(category?.description) ||
        `Каталог промышленного оборудования Baytech: ${stripHtml(category?.name)}.`,
      isPartOf: {
        "@id": `${SITE_ORIGIN}/#website`,
      },
      about: {
        "@type": "Thing",
        name: stripHtml(category?.name),
      },
      publisher: {
        "@id": `${SITE_ORIGIN}/#organization`,
      },
      inLanguage: DEFAULT_LANG,
    },
    buildBreadcrumbGraph(pageUrl, [
      { name: "Главная", item: `${SITE_ORIGIN}/` },
      { name: "Каталог", item: toAbsoluteBaytechUrl("/catalog") },
      ...ancestors.map((item) => ({
        name: stripHtml(item?.name),
        item: getCategoryCollectionUrl(item),
      })),
    ]),
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      name:
        children.length > 0
          ? `Подкатегории: ${stripHtml(category?.name)}`
          : `Товары: ${stripHtml(category?.name)}`,
      itemListElement: listItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: stripHtml(item?.name),
        url:
          children.length > 0
            ? getCategoryCollectionUrl(item)
            : toAbsoluteBaytechUrl(`/catalog/product/${item?.slug}`),
      })),
    },
  ];
};

const buildProductSeoData = (product, slug, categories) => {
  const title = stripHtml(product?.name) || `Товар ${slug}`;
  const description = stripHtml(product?.description)
    .slice(0, 500)
    .trim();
  const pageUrl = toAbsoluteBaytechUrl(`/catalog/product/${slug}`);
  const images = normalizeProductImages(product);
  const category = stripHtml(product?.category?.name || "");
  const brand = getProductBrandName(product);
  const sku = stripHtml(product?.sku || "");
  const price =
    typeof product?.price === "number" && Number.isFinite(product.price)
      ? product.price
      : null;
  const availability =
    typeof product?.inStock === "boolean"
      ? product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
      : "";
  const breadcrumbsFromProduct = Array.isArray(product?.breadcrumbs)
    ? product.breadcrumbs
    : [];
  const categoryBreadcrumbs =
    breadcrumbsFromProduct.length > 0
      ? breadcrumbsFromProduct
      : product?.category
        ? [product.category]
        : [];
  const breadcrumbItems = [
    { name: "Главная", item: `${SITE_ORIGIN}/` },
    { name: "Каталог", item: toAbsoluteBaytechUrl("/catalog") },
    ...categoryBreadcrumbs.map((item) => {
      const categoryNode =
        findCategoryById(categories, item?.id) ||
        findCategoryBySlug(categories, item?.slug) ||
        item;
      return {
        name: stripHtml(item?.name),
        item: getCategoryPageUrl(categoryNode, categories),
      };
    }),
    { name: title, item: pageUrl },
  ];

  return {
    title,
    description,
    pageUrl,
    images,
    category,
    brand,
    sku,
    price,
    availability,
    breadcrumbItems,
  };
};

const renderProductHtml = (indexHtml, seo) => {
  const ogBlock = `
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(seo.title)}" />
  <meta property="og:description" content="${escapeHtml(seo.description)}" />
  <meta property="og:url" content="${escapeHtml(seo.pageUrl)}" />
  ${
    seo.images[0]
      ? `<meta property="og:image" content="${escapeHtml(seo.images[0])}" />`
      : ""
  }
  <meta property="og:site_name" content="Baytech" />`;

  const productGraph = [
    {
      "@type": "Product",
      "@id": `${seo.pageUrl}#product`,
      name: seo.title,
      description: seo.description,
      url: seo.pageUrl,
      image: seo.images,
      sku: seo.sku,
      brand: seo.brand
        ? {
            "@type": "Brand",
            name: seo.brand,
          }
        : undefined,
      offers: {
        "@type": "Offer",
        url: seo.pageUrl,
        priceCurrency: "KZT",
        availability: seo.availability,
        ...(seo.price !== null ? { price: seo.price } : {}),
      },
      ...(seo.category ? { category: seo.category } : {}),
    },
    buildBreadcrumbGraph(seo.pageUrl, seo.breadcrumbItems),
  ];

  const titleTag = `<title>${escapeHtml(seo.title)}</title>`;
  const htmlWithTitle = indexHtml.replace(
    /<title>[^<]*<\/title>/i,
    titleTag,
  );
  return renderHtmlWithSchema(htmlWithTitle, productGraph, ogBlock);
};

const renderCatalogHtml = async (indexHtml, req) => {
  const categories = flattenCategories(
    await fetchCategoriesTree(req.headers["accept-language"]),
  );
  return renderHtmlWithSchema(indexHtml, buildCatalogGraph(categories));
};

const renderCategoryHtml = async (indexHtml, req, categorySlug, categoryId) => {
  const categories = flattenCategories(
    await fetchCategoriesTree(req.headers["accept-language"]),
  );
  const category =
    (categoryId ? findCategoryById(categories, categoryId) : null) ||
    findCategoryBySlug(categories, categorySlug);

  if (!category) return renderHtmlWithSchema(indexHtml);

  const children = categories.filter(
    (item) => Number(item?.parentId) === Number(category?.id),
  );
  const productsResponse =
    children.length === 0
      ? await fetchProductsByCategory(
          category.id,
          req.headers["accept-language"],
        )
      : null;

  return renderHtmlWithSchema(
    indexHtml,
    buildCategoryGraph(category, categories, productsResponse),
  );
};

const server = createServer(async (req, res) => {
  try {
    const host = req.headers.host || "localhost";
    const requestUrl = new URL(req.url || "/", `http://${host}`);
    const pathname = decodeURIComponent(requestUrl.pathname);

    const productMatch = pathname.match(/^\/catalog\/product\/([^/]+)$/);
    if (productMatch) {
      const slug = productMatch[1];
      const [indexHtml, product, categoriesTree] = await Promise.all([
        readFile(INDEX_PATH, "utf-8"),
        fetchProductBySlug(slug, req.headers["accept-language"]),
        fetchCategoriesTree(req.headers["accept-language"]),
      ]);
      const categories = flattenCategories(categoriesTree);
      const seo = buildProductSeoData(product, slug, categories);
      const html = renderProductHtml(indexHtml, seo);
      return send(res, 200, html, "text/html; charset=utf-8");
    }

    if (pathname === "/catalog" || pathname === "/catalog/") {
      const indexHtml = await readFile(INDEX_PATH, "utf-8");
      const html = await renderCatalogHtml(indexHtml, req);
      return send(res, 200, html, "text/html; charset=utf-8");
    }

    const categoryProductMatch = pathname.match(
      /^\/catalog\/([^/]+)\/products\/([^/]+)$/,
    );
    if (categoryProductMatch) {
      const indexHtml = await readFile(INDEX_PATH, "utf-8");
      const html = await renderCategoryHtml(
        indexHtml,
        req,
        categoryProductMatch[1],
        categoryProductMatch[2],
      );
      return send(res, 200, html, "text/html; charset=utf-8");
    }

    const categoryMatch = pathname.match(/^\/catalog\/([^/]+)$/);
    if (categoryMatch) {
      const indexHtml = await readFile(INDEX_PATH, "utf-8");
      const html = await renderCategoryHtml(indexHtml, req, categoryMatch[1]);
      return send(res, 200, html, "text/html; charset=utf-8");
    }

    const candidatePath = path.join(DIST_DIR, pathname.replace(/^\/+/, ""));
    const served = await serveFile(res, candidatePath);
    if (served) return;

    const spaHtml = await readFile(INDEX_PATH, "utf-8");
    const html = renderHtmlWithSchema(
      spaHtml,
      pathname === "/" ? buildHomeGraph() : [],
    );
    return send(res, 200, html, "text/html; charset=utf-8");
  } catch (error) {
    return send(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Server started on :${PORT}`);
});
