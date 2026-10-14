import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { productSeo, productBreadcrumbs, categorySeo, STATIC_PAGES, staticPage, plainText, absoluteUrl, localizedBlocks, localizedText, seoLanguage, catalogGraph, categoryGraph, catalogParameters, catalogNoindex, categoryCatalogParameters, pageNumber, languageRoute, languagePath, languageAlternates, blogSeo, blogBreadcrumbs, breadcrumbSchema } from "./seo.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = process.env.DIST_DIR || path.join(__dirname, "dist");
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
  return seoLanguage(String(raw || "ru").split(",")[0].trim());
};

const send = (res, status, body, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
    Vary: "Accept-Language",
    ...(status >= 400 ? { "X-Robots-Tag": "noindex", ...(status === 503 ? { "Retry-After": "60" } : {}) } : {}),
  });
  res.end(body);
};

// The build emits .br/.gz siblings for every compressible asset; prefer them
// over letting the proxy re-compress at request time.
const PRECOMPRESSED_VARIANTS = [
  { suffix: ".br", encoding: "br" },
  { suffix: ".gz", encoding: "gzip" },
];

const acceptsEncoding = (req, encoding) =>
  String(req.headers["accept-encoding"] || "")
    .split(",")
    .some((part) => part.trim().split(";")[0].toLowerCase() === encoding);

const resolvePrecompressed = async (req, filePath) => {
  for (const { suffix, encoding } of PRECOMPRESSED_VARIANTS) {
    if (!acceptsEncoding(req, encoding)) continue;

    try {
      const variantStat = await stat(`${filePath}${suffix}`);
      if (variantStat.isFile()) return { path: `${filePath}${suffix}`, encoding };
    } catch {
      // No variant for this encoding, try the next one.
    }
  }

  return null;
};

const serveFile = async (req, res, filePath) => {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const variant = await resolvePrecompressed(req, filePath);
    const body = await readFile(variant ? variant.path : filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control":
        [".html", ".txt", ".xml", ".json"].includes(ext) ? "no-cache" : "public, max-age=31536000, immutable",
      Vary: "Accept-Encoding",
      ...(variant ? { "Content-Encoding": variant.encoding } : {}),
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
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      "Accept-Language": normalizeAcceptLanguage(langHeader),
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Catalog API returned HTTP ${response.status}`);
  return response.json();
};

const fetchProductBySlug = async (slug, langHeader) => {
  return fetchJson(`/products/${encodeURIComponent(slug)}`, langHeader);
};

const fetchCategoriesTree = async (langHeader) => {
  const categories = await fetchJson('/categories/tree', langHeader);
  if (!Array.isArray(categories)) throw new Error('Invalid categories response');
  return categories;
};

let catalogContract;
const ensureCatalogContract = async () => {
  if (!catalogContract) catalogContract = (async () => {
    const capabilities = await fetchJson('/catalog/capabilities', 'ru');
    if (!(capabilities?.version >= 1 && capabilities.categoryScope === true && capabilities.laserOptions === true
      && capabilities.canonicalProducts === true && capabilities.sourceAvailability === true
      && capabilities.blogSeoReadOnly === true && capabilities.seoLanguages === true)) throw new Error('Catalog API is incompatible with this storefront; deploy the matching backend first');
  })();
  try { await catalogContract; } catch (error) { catalogContract = undefined; throw error; }
};

const fetchProductsByCategory = async (
  categoryId,
  langHeader,
  { page = 1, limit = 12, ...filters } = {},
) => {
  await ensureCatalogContract();
  return fetchJson(`/products/category/${encodeURIComponent(categoryId)}`, langHeader, {
    page,
    size: limit,
    sort: "price,ASC",
    ...filters,
  });
};

// Only the public search endpoint excludes archived products. /products does not.
let sitemapCache;
let sitemapPending;
const productSitemap = async () => {
  if (sitemapCache && sitemapCache.expires > Date.now()) return sitemapCache.xml;
  if (sitemapPending) return sitemapPending;
  sitemapPending = (async () => {
    await ensureCatalogContract();
    const products = [];
    let totalPages = 1;
    let expectedTotal;
    // Spring's one-indexed-parameters=true: request pages start at 1,
    // while response.number is still zero-based. Page 0 aliases page 1.
    for (let page = 1; page <= totalPages; page++) {
      const response = await fetchJson('/products/search', 'ru', { query: '', page, size: 200, sort: 'id,ASC' });
      if (!Array.isArray(response?.content) || !Number.isInteger(response.totalPages) || response.totalPages < 0 || response.totalPages > 250 || response.number !== page - 1 || !Number.isInteger(response.totalElements) || response.totalElements < 0) {
        throw new Error('Invalid product sitemap response');
      }
      if (expectedTotal !== undefined && expectedTotal !== response.totalElements) throw new Error('Catalog changed during sitemap generation');
      expectedTotal = response.totalElements;
      totalPages = response.totalPages;
      products.push(...response.content);
    }
    const urls = [...new Map(products.filter(product => product.slug).map(product => {
      const url = `${SITE_ORIGIN}/catalog/product/${encodeURIComponent(product.slug)}`;
      return [url, { url, languages: product.seoLanguages }];
    })).values()];
    if (urls.length !== expectedTotal) throw new Error('Incomplete product sitemap');
    const xml = sitemapXml(urls);
    sitemapCache = { xml, expires: Date.now() + 5 * 60 * 1000 };
    return xml;
  })();
  try { return await sitemapPending; } finally { sitemapPending = undefined; }
};

const sitemapXml = (urls) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map(item => {
  const url = typeof item === 'string' ? item : item.url;
  return `  <url><loc>${escapeHtml(url)}</loc>${languageAlternates(url, SITE_ORIGIN, typeof item === 'string' ? undefined : item.languages).map(a => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escapeHtml(a.href)}" />`).join('')}</url>`;
}).join('\n')}\n</urlset>`;

const fetchAllBlogs = async () => {
  await ensureCatalogContract();
  const blogs = [];
  let totalPages = 1, total;
  for (let page = 1; page <= totalPages; page++) {
    const result = await fetchJson('/blogs', 'ru', { page, size: 100, sort: 'publishedAt,DESC' });
    if (!Array.isArray(result?.content) || !Number.isInteger(result.totalPages) || result.totalPages < 0 || result.totalPages > 250 || result.number !== page - 1 || !Number.isInteger(result.totalElements)) throw new Error('Invalid blog sitemap response');
    if (total !== undefined && result.totalElements !== total) throw new Error('Blog changed during sitemap generation');
    total = result.totalElements; totalPages = result.totalPages; blogs.push(...result.content);
  }
  if (new Set(blogs.map(b => b.slug).filter(Boolean)).size !== total) throw new Error('Incomplete blog sitemap');
  return blogs;
};

const flattenCategories = (categories, seen = new Map()) => {
  if (!Array.isArray(categories)) return [];

  categories.forEach((category) => {
    if (!category || category.id === undefined || category.id === null) return;
    seen.set(String(category.id), category);
    flattenCategories(category.children, seen);
  });

  return Array.from(seen.values());
};

const getCategoryCollectionUrl = (category, language = 'ru') =>
  category?.slug ? toAbsoluteBaytechUrl(languagePath(`/catalog/${category.slug}`, language)) : "";

const findCategoryBySlug = (categories, slug) =>
  categories.find((category) => category?.slug === slug) || null;

const findCategoryById = (categories, id) =>
  categories.find((category) => Number(category?.id) === Number(id)) || null;


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
    inLanguage: [DEFAULT_LANG, 'en', 'kk-KZ'],
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

  return `  <script id="baytech-schema" type="application/ld+json">${escapeJsonForHtml(schema)}</script>`;
};

const injectHeadContent = (indexHtml, content) =>
  indexHtml.replace("</head>", `${content}\n</head>`);

const renderHtmlWithSchema = (indexHtml, pageGraph = [], extraHead = "") =>
  injectHeadContent(
    indexHtml,
    `${extraHead}${extraHead ? "\n" : ""}${buildSchemaScript(pageGraph)}`,
  );

const withMetadata = (html, { title, description, url, languages, indexable }, noindex = false) => {
  noindex ||= indexable === false;
  const language = languageRoute(new URL(url, SITE_ORIGIN).pathname).language;
  const clean = html
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<link\s+[^>]*hreflang="[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/<html\s+lang="[^"]*"/, `<html lang="${language === 'kz' ? 'kk' : language}"`);
  return injectHeadContent(clean, `<link rel="canonical" href="${escapeHtml(url)}" />${noindex ? '\n<meta name="robots" content="noindex,follow" />' : languageAlternates(url, SITE_ORIGIN, languages).map(a => `\n<link rel="alternate" hreflang="${a.hreflang}" href="${escapeHtml(a.href)}" />`).join('')}`);
};

const withBody = (html, body, language = 'ru') => html.replace('<div id="root"></div>', `<div id="root"><main style="max-width:1100px;margin:0 auto;padding:32px 20px;background:white"><nav><a href="${languagePath('/', language)}">Baytech</a> / <a href="${languagePath('/catalog', language)}">${staticPage('/catalog', language).name}</a></nav>${body}</main></div>`);
const paragraph = (text) => `<p>${escapeHtml(plainText(text))}</p>`;
const renderBlock = ({ type, data = {} }) => {
  switch (type) {
    case 'heading': return `<h2>${escapeHtml(plainText(data.text))}</h2>${data.subtitle ? paragraph(data.subtitle) : ''}`;
    case 'paragraph': return paragraph(data.text);
    case 'list': return `<ul>${(data.items || []).map((item) => `<li>${escapeHtml(plainText(item))}</li>`).join('')}</ul>`;
    case 'table': return `<table>${(data.rows || []).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(plainText(cell))}</td>`).join('')}</tr>`).join('')}</table>`;
    case 'imageCard': return `<h2>${escapeHtml(plainText(data.title))}</h2>${paragraph(data.description)}`;
    case 'cardGrid': return (data.cards || []).map((card) => `<h3>${escapeHtml(plainText(card.title))}</h3>${paragraph(card.description)}`).join('');
    case 'gallery': return (data.urls || []).map((value) => absoluteUrl(value, SITE_ORIGIN)).filter(Boolean).map((url) => `<img src="${escapeHtml(url)}" alt="" loading="lazy" style="max-width:100%;height:auto" />`).join('');
    case 'image': { const url = absoluteUrl(data.imageUrl || data.url, SITE_ORIGIN); return url ? `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(plainText(data.alt || data.altText || ''))}" loading="lazy" style="max-width:100%;height:auto" />${data.caption ? `<figcaption>${escapeHtml(plainText(data.caption))}</figcaption>` : ''}</figure>` : ''; }
    case 'quote': return `<blockquote>${paragraph(data.text || data.quote)}${data.author ? paragraph(data.author) : ''}</blockquote>`;
    default: return '';
  }
};

const productBody = (product, seo, language) => {
  const blocks = localizedBlocks(product.contentBlocks, language).filter((block) => block?.type && block.data);
  const description = blocks.length ? blocks.map(renderBlock).join('') : String(product.description || '').split(/\n\s*\n|\n/).map(paragraph).join('');
  const specs = (product.specifications || []).map((group) => `<h2>${escapeHtml(group.name)}</h2><dl>${(group.attributes || []).map((attr) => `<dt>${escapeHtml(attr.name)}</dt><dd>${escapeHtml(`${attr.value ?? ''} ${attr.unit || ''}`.trim())}</dd>`).join('')}</dl>`).join('');
  return `<h1>${escapeHtml(product.name)}</h1>${seo.images[0] ? `<img src="${escapeHtml(seo.images[0])}" alt="${escapeHtml(product.name)}" width="400" style="max-width:100%;height:auto" />` : ''}${typeof product.price === 'number' && product.price > 0 ? paragraph(`Цена: ${product.price} ₸`) : ''}${description}${specs}`;
};

const listBody = (name, items, link) => `<h1>${escapeHtml(name)}</h1><ul>${items.map((item) => `<li><a href="${escapeHtml(link(item))}">${escapeHtml(item.name || item.slug)}</a></li>`).join('')}</ul>`;

const errorHtml = (indexHtml, pathname, unavailable = false, language = 'ru') => {
  const title = language === 'en' ? unavailable ? 'Temporarily unavailable' : 'Page not found' : language === 'kz' ? unavailable ? 'Уақытша қолжетімсіз' : 'Бет табылмады' : unavailable ? 'Каталог временно недоступен' : 'Страница не найдена';
  return withBody(withMetadata(indexHtml, { title: `${title} | Baytech`, description: title, url: `${SITE_ORIGIN}${languagePath(pathname, language)}` }, true), `<h1>${title}</h1><p><a href="${languagePath('/catalog', language)}">${staticPage('/catalog', language).name}</a></p>`, language);
};

const buildHomeGraph = (language = 'ru') => [
  {
    "@type": "WebPage",
    "@id": `${SITE_ORIGIN}${languagePath('/', language)}#webpage`,
    url: `${SITE_ORIGIN}${languagePath('/', language)}`,
    name: staticPage('/', language).name,
    description: staticPage('/', language).description,
    isPartOf: {
      "@id": `${SITE_ORIGIN}/#website`,
    },
    about: {
      "@id": `${SITE_ORIGIN}/#organization`,
    },
    inLanguage: language === 'kz' ? 'kk-KZ' : language,
  },
];


const INFO_PAGES = {
  "/production": {
    name: "Производство",
    description:
      "Производственные возможности Baytech: изготовление, подбор и поставка промышленного оборудования для предприятий Казахстана.",
  },
  "/storage": {
    name: "Склад",
    description:
      "Склад Baytech: наличие промышленного оборудования, комплектующих и расходных материалов для оперативной поставки.",
  },
  "/service": {
    name: "Сервис",
    description:
      "Сервис Baytech: монтаж, пусконаладка, обслуживание и сопровождение промышленного оборудования.",
  },
  "/about": {
    name: "О компании",
    description:
      "Информация о Baytech: поставщик станков и промышленного оборудования в Казахстане.",
  },
  "/blog": {
    name: "Блог",
    description:
      "Материалы Baytech о промышленном оборудовании, технологиях, сервисе и производстве.",
  },
};

const buildWebPageGraph = (pathname, page, language = 'ru') => {
  const pageUrl = toAbsoluteBaytechUrl(languagePath(pathname, language));

  return [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.name,
      description: page.description,
      isPartOf: {
        "@id": `${SITE_ORIGIN}/#website`,
      },
      about: {
        "@id": `${SITE_ORIGIN}/#organization`,
      },
      inLanguage: language === 'kz' ? 'kk-KZ' : language,
    },
    buildBreadcrumbGraph(pageUrl, [
      { name: "Baytech", item: `${SITE_ORIGIN}${languagePath('/', language)}` },
      { name: page.name, item: pageUrl },
    ]),
  ];
};

const buildProductSeoData = (product, language) => {
  const seo = productSeo(product, SITE_ORIGIN, language);
  return { ...seo, pageUrl: seo.url, breadcrumbItems: productBreadcrumbs(product, SITE_ORIGIN, language) };
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
    seo.schema,
    buildBreadcrumbGraph(seo.pageUrl, seo.breadcrumbItems),
  ];

  const htmlWithTitle = withMetadata(indexHtml, seo);
  return renderHtmlWithSchema(htmlWithTitle, productGraph, ogBlock);
};

const renderCatalogHtml = async (indexHtml, req) => {
  await ensureCatalogContract();
  const language = normalizeAcceptLanguage(req.headers['accept-language']);
  const categories = flattenCategories(
    await fetchCategoriesTree(req.headers["accept-language"]),
  );
  const page = staticPage('/catalog', language);
  const html = withMetadata(indexHtml, { title: `${page.name} | Baytech`, description: page.description, url: `${SITE_ORIGIN}${languagePath('/catalog', language)}` });
  return withBody(renderHtmlWithSchema(html, catalogGraph(categories, SITE_ORIGIN, language)), listBody(page.name, categories.filter((category) => category.parentId == null), c => getCategoryCollectionUrl(c, language)), language);
};

const renderCategoryHtml = async (
  indexHtml,
  req,
  requestUrl,
  categorySlug,
  categoryId,
) => {
  await ensureCatalogContract();
  const categories = flattenCategories(
    await fetchCategoriesTree(req.headers["accept-language"]),
  );
  const category =
    (categoryId ? findCategoryById(categories, categoryId) : null) ||
    findCategoryBySlug(categories, categorySlug);

  if (!category) return null;

  const children = categories.filter(
    (item) => Number(item?.parentId) === Number(category?.id),
  );
  const productsResponse =
    children.length === 0
      ? await fetchProductsByCategory(
          category.id,
          req.headers["accept-language"],
          categoryCatalogParameters(category, categories, requestUrl.search),
        )
      : null;

  const page = catalogParameters(requestUrl.search).page;
  const pageCount = productsResponse?.meta?.totalPages || 1;
  if (page > pageCount) return null;
  const language = normalizeAcceptLanguage(req.headers['accept-language']);
  const metadata = categorySeo(category, page, SITE_ORIGIN, language);
  const noindex = catalogNoindex(requestUrl.search);
  const html = withMetadata(indexHtml, metadata, noindex);
  const items = children.length ? children : productsResponse?.products || [];
  const body = listBody(category.name, items, children.length ? c => getCategoryCollectionUrl(c, language) : product => productSeo(product, SITE_ORIGIN, language).url);
  const pagination = pageCount > 1 ? `<nav>${page > 1 ? `<a href="${escapeHtml(categorySeo(category, page - 1, SITE_ORIGIN, language).url)}">${page - 1}</a> ` : ''}${page < pageCount ? `<a href="${escapeHtml(categorySeo(category, page + 1, SITE_ORIGIN, language).url)}">${page + 1}</a>` : ''}</nav>` : '';
  const graph = categoryGraph(category, categories, productsResponse?.products, page, SITE_ORIGIN, language).filter(item => !noindex || item['@type'] !== 'ItemList');
  return withBody(renderHtmlWithSchema(html, graph), body + pagination, language);
};

const renderBlogList = async (indexHtml, language, requestUrl) => {
  await ensureCatalogContract();
  const page = pageNumber(requestUrl.searchParams.get('page'));
  const blogs = await fetchJson('/blogs', language, { page, size: 12, sort: 'publishedAt,DESC' });
  if (!Array.isArray(blogs?.content) || !Number.isInteger(blogs.totalPages)) throw new Error('Invalid blog response');
  if (page > Math.max(1, blogs.totalPages)) return null;
  const info = staticPage('/blog', language);
  const url = `${SITE_ORIGIN}${languagePath('/blog', language)}${page > 1 ? `?page=${page}` : ''}`;
  const graph = [{ '@type': 'CollectionPage', '@id': `${url}#collectionpage`, url, name: info.name, description: info.description },
    breadcrumbSchema(url, [{ name: 'Baytech', item: `${SITE_ORIGIN}${languagePath('/', language)}` }, { name: info.name, item: url }]),
    { '@type': 'ItemList', '@id': `${url}#itemlist`, numberOfItems: blogs.content.length, itemListElement: blogs.content.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: localizedText(b.title, language), url: blogSeo(b, SITE_ORIGIN, language).url })) }];
  const body = listBody(info.name, blogs.content.map(b => ({ ...b, name: localizedText(b.title, language) })), b => blogSeo(b, SITE_ORIGIN, language).url);
  const pagination = `<nav>${page > 1 ? `<a href="${languagePath('/blog', language)}${page > 2 ? `?page=${page - 1}` : ''}">${page - 1}</a> ` : ''}${page < blogs.totalPages ? `<a href="${languagePath('/blog', language)}?page=${page + 1}">${page + 1}</a>` : ''}</nav>`;
  return withBody(renderHtmlWithSchema(withMetadata(indexHtml, { title: `${info.name}${page > 1 ? ` — ${page}` : ''} | Baytech`, description: info.description, url }), graph), body + pagination, language);
};

const server = createServer(async (req, res) => {
  let pathname = '/';
  let language = 'ru';
  try {
    const host = req.headers.host || "localhost";
    const requestUrl = new URL(req.url || "/", `http://${host}`);
    const publicPath = decodeURIComponent(requestUrl.pathname);
    ({ pathname, language } = languageRoute(publicPath));
    req.headers['accept-language'] = language;
    if (/^\/kz(?:\/|$)/.test(publicPath) || (language !== 'ru' && pathname === '/' && !publicPath.endsWith('/'))) {
      res.writeHead(308, { Location: `${languagePath(pathname, language)}${requestUrl.search}`, 'Cache-Control': 'no-cache' });
      return res.end();
    }

    if (pathname !== '/' && pathname.endsWith('/')) {
      res.writeHead(308, { Location: `${requestUrl.pathname.replace(/\/+$/, '')}${requestUrl.search}`, 'Cache-Control': 'no-cache' });
      return res.end();
    }

    if (pathname === '/sitemap-products.xml') {
      return send(res, 200, await productSitemap(), 'application/xml; charset=utf-8');
    }
    if (pathname === '/sitemap-categories.xml') {
      const categories = flattenCategories(await fetchCategoriesTree('ru'));
      return send(res, 200, sitemapXml(categories.filter((category) => category.slug).map(getCategoryCollectionUrl)), 'application/xml; charset=utf-8');
    }
    if (pathname === '/sitemap-pages.xml') {
      const blogs = await fetchAllBlogs();
      return send(res, 200, sitemapXml([...Object.keys(STATIC_PAGES).map((url) => `${SITE_ORIGIN}${url}`), ...blogs.map(b => ({ url: blogSeo(b, SITE_ORIGIN).url, languages: b.seoLanguages }))]), 'application/xml; charset=utf-8');
    }

    if (pathname === '/blog') {
      const index = await readFile(INDEX_PATH, 'utf-8');
      const html = await renderBlogList(index, language, requestUrl);
      return send(res, html ? 200 : 404, html || errorHtml(index, pathname, false, language), 'text/html; charset=utf-8');
    }
    const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      await ensureCatalogContract();
      const [index, blog] = await Promise.all([readFile(INDEX_PATH, 'utf-8'), fetchJson(`/blogs/${encodeURIComponent(blogMatch[1])}/seo`, language)]);
      if (!blog?.id) return send(res, 404, errorHtml(index, pathname, false, language), 'text/html; charset=utf-8');
      const seo = blogSeo(blog, SITE_ORIGIN, language);
      const blocks = localizedBlocks(blog.contentBlocks, language);
      const body = `<article><h1>${escapeHtml(seo.name)}</h1>${blog.authorName ? paragraph(blog.authorName) : ''}${blog.publishedAt && Number.isFinite(Date.parse(blog.publishedAt)) ? `<time datetime="${escapeHtml(blog.publishedAt)}">${escapeHtml(blog.publishedAt.slice(0, 10))}</time>` : ''}${seo.images[0] ? `<img src="${escapeHtml(seo.images[0])}" alt="${escapeHtml(seo.name)}" style="max-width:100%;height:auto" />` : ''}${blocks.map(renderBlock).join('') || paragraph(localizedText(blog.excerpt, language))}</article>`;
      const metadata = withMetadata(index, seo);
      const og = `<meta property="og:type" content="article" /><meta property="og:title" content="${escapeHtml(seo.title)}" /><meta property="og:description" content="${escapeHtml(seo.description)}" /><meta property="og:url" content="${escapeHtml(seo.url)}" />${seo.images[0] ? `<meta property="og:image" content="${escapeHtml(seo.images[0])}" />` : ''}`;
      return send(res, 200, withBody(renderHtmlWithSchema(metadata, [seo.schema, breadcrumbSchema(seo.url, blogBreadcrumbs(blog, SITE_ORIGIN, language))], og), body, language), 'text/html; charset=utf-8');
    }

    const productMatch = pathname.match(/^\/catalog\/product\/([^/]+)$/);
    if (productMatch) {
      await ensureCatalogContract();
      const slug = productMatch[1];
      const [indexHtml, product] = await Promise.all([
        readFile(INDEX_PATH, "utf-8"),
        fetchProductBySlug(slug, req.headers["accept-language"]),
      ]);
      if (!product?.id) return send(res, 404, errorHtml(indexHtml, pathname, false, language), 'text/html; charset=utf-8');
      if (typeof product.canonicalSlug === 'string' && /^[a-z0-9-]+$/.test(product.canonicalSlug) && product.canonicalSlug !== product.slug) {
        res.writeHead(301, { Location: `${languagePath(`/catalog/product/${encodeURIComponent(product.canonicalSlug)}`, language)}${requestUrl.search}`, 'Cache-Control': 'no-cache' });
        return res.end();
      }
      const seo = buildProductSeoData(product, language);
      const html = withBody(renderProductHtml(indexHtml, seo), productBody(product, seo, language), language);
      return send(res, html ? 200 : 404, html || errorHtml(indexHtml, pathname, false, language), "text/html; charset=utf-8");
    }

    if (pathname === "/catalog" || pathname === "/catalog/") {
      const indexHtml = await readFile(INDEX_PATH, "utf-8");
      const html = await renderCatalogHtml(indexHtml, req);
      return send(res, html ? 200 : 404, html || errorHtml(indexHtml, pathname, false, language), "text/html; charset=utf-8");
    }

    const categoryProductMatch = pathname.match(
      /^\/catalog\/([^/]+)\/products\/([^/]+)$/,
    );
    if (categoryProductMatch) {
      const indexHtml = await readFile(INDEX_PATH, "utf-8");
      const html = await renderCategoryHtml(
        indexHtml,
        req,
        requestUrl,
        categoryProductMatch[1],
        categoryProductMatch[2],
      );
      return send(res, html ? 200 : 404, html || errorHtml(indexHtml, pathname, false, language), "text/html; charset=utf-8");
    }

    const categoryMatch = pathname.match(/^\/catalog\/([^/]+)$/);
    if (categoryMatch && categoryMatch[1] !== 'deep-products') {
      const indexHtml = await readFile(INDEX_PATH, "utf-8");
      const html = await renderCategoryHtml(
        indexHtml,
        req,
        requestUrl,
        categoryMatch[1],
      );
      return send(res, html ? 200 : 404, html || errorHtml(indexHtml, pathname, false, language), "text/html; charset=utf-8");
    }

    const collectionMatch = pathname.match(/^\/collections\/([^/]+)$/);
    if (collectionMatch) {
      await ensureCatalogContract();
      const [index, collection] = await Promise.all([readFile(INDEX_PATH, 'utf-8'), fetchJson(`/collections/slug/${encodeURIComponent(collectionMatch[1])}`, language)]);
      if (!collection?.slug) return send(res, 404, errorHtml(index, pathname, false, language), 'text/html; charset=utf-8');
      const url = `${SITE_ORIGIN}${languagePath(pathname, language)}`;
      const metadata = { title: `${plainText(collection.name)} | Baytech`, description: plainText(collection.name), url };
      const graph = [{ '@type': 'CollectionPage', '@id': `${url}#collectionpage`, name: plainText(collection.name), url },
        breadcrumbSchema(url, [{ name: 'Baytech', item: `${SITE_ORIGIN}${languagePath('/', language)}` }, { name: collection.name, item: url }])];
      return send(res, 200, withBody(renderHtmlWithSchema(withMetadata(index, metadata), graph), listBody(collection.name, collection.products || [], p => productSeo(p, SITE_ORIGIN, language).url), language), 'text/html; charset=utf-8');
    }

    const candidatePath = path.resolve(DIST_DIR, pathname.replace(/^\/+/, ""));
    const distRoot = path.resolve(DIST_DIR);
    if ((candidatePath !== distRoot && !candidatePath.startsWith(`${distRoot}${path.sep}`)) || pathname.split('/').some(segment => segment.startsWith('.'))) {
      return send(res, 404, errorHtml(await readFile(INDEX_PATH, 'utf-8'), pathname, false, language), 'text/html; charset=utf-8');
    }
    const served = await serveFile(req, res, candidatePath);
    if (served) return;

    const spaHtml = await readFile(INDEX_PATH, "utf-8");
    const page = staticPage(pathname, language);
    const technical = pathname === '/compare' || /^\/catalog\/(?:[^/]+\/)?deep-products(?:\/\d+)?$/.test(pathname);
    if (!page && !technical) return send(res, 404, errorHtml(spaHtml, pathname, false, language), 'text/html; charset=utf-8');
    const metadata = { title: page ? `${page.name} | Baytech` : 'Baytech', description: page?.description || staticPage('/catalog', language).description, url: `${SITE_ORIGIN}${languagePath(pathname, language)}` };
    const html = renderHtmlWithSchema(
      withMetadata(spaHtml, metadata, technical),
      pathname === "/"
        ? buildHomeGraph(language)
        : INFO_PAGES[pathname]
          ? buildWebPageGraph(pathname, page, language)
          : [],
    );
    const body = page ? `<h1>${escapeHtml(page.name)}</h1>${paragraph(page.description)}<p><a href="${languagePath('/catalog', language)}">${staticPage('/catalog', language).name}</a></p>` : `<h1>${escapeHtml(metadata.title)}</h1>`;
    return send(res, 200, withBody(html, body, language), "text/html; charset=utf-8");
  } catch (error) {
    console.error('[SEO]', error.message);
    if (pathname.endsWith('.xml')) return send(res, 503, 'Sitemap temporarily unavailable');
    try {
      return send(res, error instanceof URIError ? 400 : 503, errorHtml(await readFile(INDEX_PATH, 'utf-8'), pathname, true, language), 'text/html; charset=utf-8');
    } catch {
      return send(res, 503, 'Service temporarily unavailable');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server started on :${server.address().port}`);
});
