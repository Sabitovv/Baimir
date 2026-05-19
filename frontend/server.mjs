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

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
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

const fetchProductBySlug = async (slug, langHeader) => {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(slug)}`,
    {
      headers: {
        "Accept-Language": langHeader || "ru",
      },
    },
  );

  if (!response.ok) return null;
  return response.json();
};

const buildSeoData = (product, slug) => {
  const title = stripHtml(product?.name) || `Товар ${slug}`;
  const fallbackDescription = `${title} - купить в Baytech`;
  const description = (stripHtml(product?.description) || fallbackDescription)
    .slice(0, 500)
    .trim();
  const pageUrl = toAbsoluteBaytechUrl(`/catalog/product/${slug}`);
  const imageCandidate =
    product?.coverImage ||
    product?.media?.find(
      (item) =>
        String(item?.type || "").toUpperCase().includes("IMAGE") &&
        typeof item?.url === "string" &&
        item.url.trim(),
    )?.url ||
    "/favicon-96x96.png";
  const imageUrl = toAbsoluteBaytechUrl(imageCandidate);
  const category = stripHtml(product?.category?.name || "");
  const brand = "Baytech";
  const price =
    typeof product?.price === "number" && Number.isFinite(product.price)
      ? product.price
      : null;
  const inStock = Boolean(product?.inStock);

  return {
    title,
    description,
    pageUrl,
    imageUrl,
    category,
    brand,
    price,
    inStock,
  };
};

const renderProductHtml = (indexHtml, seo) => {
  const ogBlock = `
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(seo.title)}" />
  <meta property="og:description" content="${escapeHtml(seo.description)}" />
  <meta property="og:url" content="${escapeHtml(seo.pageUrl)}" />
  <meta property="og:image" content="${escapeHtml(seo.imageUrl)}" />
  <meta property="og:site_name" content="Baytech" />`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: seo.title,
    description: seo.description,
    brand: {
      "@type": "Brand",
      name: seo.brand,
    },
    url: seo.pageUrl,
    image: [seo.imageUrl],
    offers: {
      "@type": "Offer",
      url: seo.pageUrl,
      priceCurrency: "KZT",
      availability: seo.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(seo.price !== null ? { price: seo.price } : {}),
    },
    ...(seo.category ? { category: seo.category } : {}),
  };

  const titleTag = `<title>${escapeHtml(seo.title)}</title>`;
  const htmlWithTitle = indexHtml.replace(
    /<title>[^<]*<\/title>/i,
    titleTag,
  );
  const withOg = htmlWithTitle.replace("</head>", `${ogBlock}\n</head>`);
  return withOg.replace(
    "</body>",
    `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</body>`,
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
      const [indexHtml, product] = await Promise.all([
        readFile(INDEX_PATH, "utf-8"),
        fetchProductBySlug(slug, req.headers["accept-language"]),
      ]);
      const seo = buildSeoData(product, slug);
      const html = renderProductHtml(indexHtml, seo);
      return send(res, 200, html, "text/html; charset=utf-8");
    }

    const candidatePath = path.join(DIST_DIR, pathname.replace(/^\/+/, ""));
    const served = await serveFile(res, candidatePath);
    if (served) return;

    const spaHtml = await readFile(INDEX_PATH, "utf-8");
    return send(res, 200, spaHtml, "text/html; charset=utf-8");
  } catch (error) {
    return send(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Server started on :${PORT}`);
});

