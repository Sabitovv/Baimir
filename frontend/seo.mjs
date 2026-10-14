// Shared by the HTTP server and the SPA so navigation cannot leave stale SEO data.
export const SITE_ORIGIN = 'https://baytech.kz';
export const DEFAULT_DESCRIPTION = 'Baytech поставляет станки и промышленное оборудование в Казахстане: подбор, доставка, пусконаладка и сервис.';
export const STATIC_PAGES = {
  '/': { name: 'Станки и промышленное оборудование в Казахстане', description: DEFAULT_DESCRIPTION },
  '/catalog': { name: 'Каталог станков и промышленного оборудования', description: 'Каталог Baytech: лазерные станки, листогибочные прессы, компрессоры и другое промышленное оборудование в Казахстане.' },
  '/production': { name: 'Производство', description: 'Производство Baytech: изготовление, подбор и поставка промышленного оборудования в Казахстане.' },
  '/storage': { name: 'Склад', description: 'Склад Baytech: промышленное оборудование, комплектующие и расходные материалы в Казахстане.' },
  '/service': { name: 'Сервис', description: 'Сервис Baytech: монтаж, пусконаладка, обслуживание и ремонт промышленного оборудования в Казахстане.' },
  '/about': { name: 'О компании Baytech', description: 'Baytech — поставщик станков и промышленного оборудования в Казахстане. Подбор оборудования, доставка и сервис.' },
  '/blog': { name: 'Блог об оборудовании и технологиях', description: 'Материалы Baytech о промышленном оборудовании, технологиях, производстве и сервисе.' },
};

export const plainText = (value) => String(value ?? '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, (_, entity) => ({ nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[entity.toLowerCase()])
  .replace(/&#(\d+);/g, (match, code) => Number(code) <= 0x10ffff ? String.fromCodePoint(Number(code)) : match)
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/\s+/g, ' ').trim();

export const textFromBlocks = (blocks = []) => (Array.isArray(blocks) ? blocks : []).filter((block) => block?.type && block.data).map(({ type, data }) => {
  switch (type) {
    case 'heading': return [data.text, data.subtitle].filter(Boolean).join(' ');
    case 'paragraph': return data.text;
    case 'list': return (data.items || []).join(' ');
    case 'table': return (data.rows || []).flat().join(' ');
    case 'imageCard': return [data.title, data.description].filter(Boolean).join(' ');
    case 'cardGrid': return (data.cards || []).map((card) => `${card.title || ''} ${card.description || ''}`).join(' ');
    default: return '';
  }
}).map(plainText).filter(Boolean).join(' ');

export const shortDescription = (value, fallback) => {
  const text = plainText(value) || plainText(fallback);
  if (text.length <= 180) return text;
  const excerpt = text.slice(0, 177);
  const boundary = excerpt.lastIndexOf(' ');
  return `${excerpt.slice(0, boundary > 110 ? boundary : excerpt.length).trim()}…`;
};

export const absoluteUrl = (value, origin = SITE_ORIGIN) => {
  try {
    const url = new URL(String(value || ''), `${origin}/`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

export const seoLanguage = (language = 'ru') => {
  const primary = String(language).toLowerCase().split(/[-_,;]/)[0];
  return primary === 'en' ? 'en' : ['kk', 'kz'].includes(primary) ? 'kz' : 'ru';
};

export const languageRoute = (pathname = '/') => {
  const match = String(pathname).match(/^\/(en|kk|kz)(?=\/|$)/);
  return { language: match ? seoLanguage(match[1]) : 'ru', pathname: match ? String(pathname).slice(match[0].length) || '/' : pathname || '/' };
};
export const languagePath = (pathname = '/', language = 'ru') => {
  const path = languageRoute(pathname).pathname;
  const locale = seoLanguage(language);
  return `${locale === 'ru' ? '' : locale === 'kz' ? '/kk' : '/en'}${path.startsWith('/') ? path : `/${path}`}`;
};
export const languageAlternates = (url, origin = SITE_ORIGIN, languages = ['ru', 'en', 'kz']) => {
  const parsed = new URL(url, origin);
  const path = languageRoute(parsed.pathname).pathname + parsed.search;
  return [['ru-KZ', 'ru'], ['en', 'en'], ['kk-KZ', 'kz'], ['x-default', 'ru']].filter(([, language]) => languages.includes(language)).map(([hreflang, language]) => ({ hreflang, href: `${origin}${languagePath(path, language)}` }));
};

const STATIC_TRANSLATIONS = {
  en: {
    '/': ['Industrial machinery and equipment in Kazakhstan', 'Baytech supplies industrial machinery in Kazakhstan: equipment selection, delivery, commissioning and service.'],
    '/catalog': ['Industrial machinery and equipment catalog', 'Baytech equipment catalog: laser machines, press brakes, compressors and other industrial machinery in Kazakhstan.'],
    '/production': ['Production', 'Baytech production: industrial equipment selection and supply in Kazakhstan.'],
    '/storage': ['Warehouse', 'Baytech warehouse: industrial equipment, components and consumables in Kazakhstan.'],
    '/service': ['Service', 'Baytech service: equipment installation, commissioning, maintenance and repair in Kazakhstan.'],
    '/about': ['About Baytech', 'Baytech supplies industrial machinery and equipment in Kazakhstan, with equipment selection, delivery and service.'],
    '/blog': ['Industrial equipment and technology blog', 'Baytech articles about industrial equipment, technology, production and service.'],
  },
  kz: {
    '/': ['Қазақстандағы станоктар және өнеркәсіптік жабдықтар', 'Baytech Қазақстанда өнеркәсіптік жабдықтарды жеткізеді: таңдау, жеткізу, іске қосу-баптау және сервис.'],
    '/catalog': ['Станоктар және өнеркәсіптік жабдықтар каталогы', 'Baytech каталогы: Қазақстандағы лазерлік станоктар, табақ ию престері, компрессорлар және өнеркәсіптік жабдықтар.'],
    '/production': ['Өндіріс', 'Baytech: Қазақстанда өнеркәсіптік жабдықтарды таңдау және жеткізу.'],
    '/storage': ['Қойма', 'Baytech қоймасы: Қазақстандағы өнеркәсіптік жабдықтар, бөлшектер және шығын материалдары.'],
    '/service': ['Сервис', 'Baytech: Қазақстанда жабдықтарды монтаждау, іске қосу-баптау, қызмет көрсету және жөндеу.'],
    '/about': ['Baytech компаниясы туралы', 'Baytech Қазақстанда станоктар мен өнеркәсіптік жабдықтарды жеткізеді, жабдықты таңдау және сервистік қызмет көрсетеді.'],
    '/blog': ['Жабдықтар және технологиялар туралы блог', 'Baytech: өнеркәсіптік жабдықтар, технологиялар, өндіріс және сервис туралы мақалалар.'],
  },
};
export const staticPage = (pathname, language = 'ru') => {
  const base = STATIC_PAGES[pathname];
  if (!base) return null;
  const translation = STATIC_TRANSLATIONS[seoLanguage(language)]?.[pathname];
  return translation ? { name: translation[0], description: translation[1] } : base;
};
export const localizedText = (value, language = 'ru') => typeof value === 'string' ? value :
  value && typeof value === 'object' ? value[seoLanguage(language)] || (seoLanguage(language) === 'kz' ? value.kk : '') || value.ru || value.en || '' : '';

const LABELS = {
  ru: { home: 'Главная', catalog: 'Каталог', country: 'Казахстан', page: 'страница' },
  en: { home: 'Home', catalog: 'Catalog', country: 'Kazakhstan', page: 'page' },
  kz: { home: 'Басты бет', catalog: 'Каталог', country: 'Қазақстан', page: 'бет' },
};

// Paragraph translations are optional; old editor blocks retain their default text.
export const localizedBlocks = (blocks, language = 'ru') => (Array.isArray(blocks) ? blocks : []).map((block) => {
  const data = block?.data;
  if (!data) return block;
  const translation = data.translations?.[seoLanguage(language)] || (seoLanguage(language) === 'kz' ? data.translations?.kk : null);
  const localized = { ...data, ...(translation || {}) };
  for (const key of ['text', 'title', 'subtitle', 'description', 'caption', 'quote', 'author', 'alt', 'altText']) {
    if (localized[key] && typeof localized[key] === 'object') localized[key] = localizedText(localized[key], language);
  }
  if (Array.isArray(localized.items)) localized.items = localized.items.map(value => localizedText(value, language));
  if (Array.isArray(localized.cards)) localized.cards = localized.cards.map(card => ({ ...card,
    title: localizedText(card.title, language), description: localizedText(card.description, language) }));
  return { ...block, data: localized };
});

export const productSeo = (product, origin = SITE_ORIGIN, language = 'ru') => {
  const name = plainText(product.name);
  // The visible editor blocks take precedence over the legacy description.
  const content = Array.isArray(product.contentBlocks) && product.contentBlocks.length
    ? textFromBlocks(localizedBlocks(product.contentBlocks, language))
    : plainText(product.description);
  const canonicalSlug = typeof product.canonicalSlug === 'string' && /^[a-z0-9-]+$/.test(product.canonicalSlug) ? product.canonicalSlug : product.slug;
  const languages = product.seoLanguages || ['ru', 'en', 'kz'];
  const indexable = languages.includes(seoLanguage(language));
  const url = `${origin}${languagePath(`/catalog/product/${encodeURIComponent(canonicalSlug)}`, indexable ? language : 'ru')}`;
  const images = [...new Set([
    product.coverImage,
    ...(product.media || []).filter((item) => String(item.type).toUpperCase().includes('IMAGE')).map((item) => item.url),
  ].filter(Boolean).map((value) => absoluteUrl(value, origin)).filter(Boolean))];
  const description = shortDescription(content, `${name}. Подбор и поставка промышленного оборудования в Казахстане — Baytech.`);
  const attributes = (product.specifications || []).flatMap((group) => group.attributes || []);
  // Only explicit whole-product brand fields are eligible, never component brands
  // such as laser_source_brand / "Laser source brand" / "Лазерлік көз бренді".
  const brandAttribute = attributes.find((item) => ['brand', 'product_brand', 'manufacturer'].includes(String(item.code || '').toLowerCase())
    || (!item.code && /^(бренд|производитель|brand|manufacturer|бренд атауы|өндіруші)$/i.test(plainText(item.name))));
  const brand = plainText(product.brandName || brandAttribute?.value);
  const category = plainText(product.category?.name || product.breadcrumbs?.at(-1)?.name);
  const schema = {
    '@type': 'Product', '@id': `${url}#product`, name, description, url,
    ...(images.length ? { image: images } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    ...(category ? { category } : {}),
    ...(typeof product.price === 'number' && product.price > 0 ? {
      offers: {
        '@type': 'Offer', url, price: product.price, priceCurrency: 'KZT',
        availability: product.availability === 'ON_ORDER' ? 'https://schema.org/PreOrder' : product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@id': `${origin}/#organization` },
      },
    } : {}),
  };
  return { name, title: `${name} — ${LABELS[seoLanguage(language)].country} | Baytech`, description, url, images, schema, languages, indexable };
};

export const breadcrumbSchema = (url, items) => ({
  '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
  itemListElement: items.filter((item) => item.name && item.item).map((item, index) => ({
    '@type': 'ListItem', position: index + 1, name: item.name, item: item.item,
  })),
});

export const productBreadcrumbs = (product, origin = SITE_ORIGIN, language = 'ru') => [
  { name: LABELS[seoLanguage(language)].home, item: `${origin}${languagePath('/', language)}` },
  { name: LABELS[seoLanguage(language)].catalog, item: `${origin}${languagePath('/catalog', language)}` },
  ...(product.breadcrumbs || []).filter((item) => item.name && item.slug).map((item) => ({
    name: item.name, item: `${origin}${languagePath(`/catalog/${encodeURIComponent(item.slug)}`, language)}`,
  })),
  { name: product.name, item: `${origin}${languagePath(`/catalog/product/${encodeURIComponent(product.slug)}`, language)}` },
];

export const categorySeo = (category, page = 1, origin = SITE_ORIGIN, language = 'ru') => ({
  title: `${plainText(category.name)}${page > 1 ? ` — ${LABELS[seoLanguage(language)].page} ${page}` : ''} — ${LABELS[seoLanguage(language)].country} | Baytech`,
  description: shortDescription(category.description, `${plainText(category.name)} в Казахстане. Каталог оборудования Baytech: подбор, доставка, пусконаладка и сервис.`),
  url: `${origin}${languagePath(`/catalog/${encodeURIComponent(category.slug)}`, language)}${page > 1 ? `?page=${page}` : ''}`,
});

export const blogSeo = (blog, origin = SITE_ORIGIN, language = 'ru') => {
  const name = plainText(localizedText(blog.title, language));
  const description = shortDescription(localizedText(blog.excerpt, language), textFromBlocks(localizedBlocks(blog.contentBlocks, language)) || name);
  const languages = blog.seoLanguages || ['ru', 'en', 'kz'];
  const indexable = languages.includes(seoLanguage(language));
  const url = `${origin}${languagePath(`/blog/${encodeURIComponent(blog.slug)}`, indexable ? language : 'ru')}`;
  const images = [blog.coverImage || blog.coverImageUrl || blog.imageUrl].filter(Boolean).map(value => absoluteUrl(value, origin)).filter(Boolean);
  const published = typeof blog.publishedAt === 'string' && Number.isFinite(Date.parse(blog.publishedAt)) ? blog.publishedAt : null;
  const modified = typeof blog.updatedAt === 'string' && Number.isFinite(Date.parse(blog.updatedAt)) ? blog.updatedAt : null;
  const schema = { '@type': 'Article', '@id': `${url}#article`, headline: name, name, description, url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, publisher: { '@id': `${origin}/#organization` },
    ...(images.length ? { image: images } : {}), ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}), ...(blog.authorName ? { author: { '@type': 'Person', name: plainText(blog.authorName) } } : {}),
  };
  return { name, title: `${name} | Baytech`, description, url, images, schema, languages, indexable };
};
export const blogBreadcrumbs = (blog, origin = SITE_ORIGIN, language = 'ru') => [
  { name: LABELS[seoLanguage(language)].home, item: `${origin}${languagePath('/', language)}` },
  { name: staticPage('/blog', language).name, item: `${origin}${languagePath('/blog', language)}` },
  { name: plainText(localizedText(blog.title, language)), item: blogSeo(blog, origin, language).url },
];

export const flattenCategories = (categories = []) => categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);

export const pageNumber = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : 1;

// Match the catalog UI's filtering and pagination, including calculator filters.
export const catalogParameters = (search = '') => {
  const params = new URLSearchParams(search);
  const filters = Object.fromEntries([...params].filter(([key]) => !['categoryId', 'page', 'limit', 'size', 'fbclid', 'gclid', 'yclid', 'msclkid', '_gl', 'editor_key', 'tolgee_url'].includes(key) && !key.startsWith('calc_') && !key.startsWith('utm_')));
  return { ...filters, page: pageNumber(params.get('page')), limit: 12, sort: params.get('sort')?.trim() || 'price,ASC' };
};
export const catalogNoindex = (search = '') => [...new URLSearchParams(search).keys()].some(key =>
  key !== 'page' && !['fbclid', 'gclid', 'yclid', 'msclkid', '_gl', 'editor_key', 'tolgee_url'].includes(key) && !key.startsWith('utm_'));

// Category navigation is not a search across the entire subtree. Only the
// sheet-bending branch may explicitly switch to the calculator's deep search.
export const isBendingCatalogCategory = (category, categories = []) => {
  const seen = new Set();
  const ancestors = [];
  for (let current = category; current && !seen.has(String(current.id));) {
    seen.add(String(current.id)); ancestors.push(current);
    current = current.parentId == null ? null : categories.find(item => String(item.id) === String(current.parentId));
  }
  if (ancestors.some(item => /(?:accessor|component|equipment-for|osnast|zapchast|комплект|оснастк|запчаст)/i.test(`${item.slug || ''} ${item.name || ''}`))) return false;
  return ancestors.some(item => item.slug === 'listogibochnye-stanki');
};

export const categoryCatalogParameters = (category, categories, search = '') => {
  const params = catalogParameters(search);
  const allowed = isBendingCatalogCategory(category, categories);
  if (!allowed) for (const key of ['press_brake', 'panel_bender', 'panel_material', 'panel_thickness', 'bending_force', 'bending_length', 'bending_machine_type']) delete params[key];
  const selection = allowed && (params.press_brake === 'true' || params.panel_bender === 'true' || ['Листогибочный пресс', 'Панелегиб'].includes(params.bending_machine_type));
  return { ...params, category_scope: selection ? 'subtree' : 'direct' };
};

const collectionGraph = (metadata, name, breadcrumbs, items, itemUrl, origin) => [
  { '@type': 'CollectionPage', '@id': `${metadata.url}#collectionpage`, url: metadata.url, name: plainText(name), description: metadata.description, isPartOf: { '@id': `${origin}/#website` }, publisher: { '@id': `${origin}/#organization` } },
  breadcrumbSchema(metadata.url, breadcrumbs),
  ...(items ? [{ '@type': 'ItemList', '@id': `${metadata.url}#itemlist`, numberOfItems: items.length, itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: plainText(item.name), url: itemUrl(item) })) }] : []),
];

export const catalogGraph = (categories, origin = SITE_ORIGIN, language = 'ru') => {
  const labels = LABELS[seoLanguage(language)];
  const url = `${origin}${languagePath('/catalog', language)}`;
  const page = staticPage('/catalog', language);
  return collectionGraph({ url, description: page.description }, page.name, [
    { name: labels.home, item: `${origin}${languagePath('/', language)}` }, { name: labels.catalog, item: url },
  ], categories.filter((category) => category.parentId == null), (item) => categorySeo(item, 1, origin, language).url, origin);
};

export const categoryGraph = (category, categories, products, page = 1, origin = SITE_ORIGIN, language = 'ru') => {
  const labels = LABELS[seoLanguage(language)];
  const ancestors = [];
  const seen = new Set();
  let current = category;
  while (current && !seen.has(String(current.id))) {
    seen.add(String(current.id));
    ancestors.unshift(current);
    current = current.parentId == null ? null : categories.find((item) => String(item.id) === String(current.parentId));
  }
  const children = categories.filter((item) => item.parentId != null && String(item.parentId) === String(category.id));
  return collectionGraph(categorySeo(category, page, origin, language), category.name, [
    { name: labels.home, item: `${origin}${languagePath('/', language)}` }, { name: labels.catalog, item: `${origin}${languagePath('/catalog', language)}` },
    ...ancestors.map((item) => ({ name: item.name, item: categorySeo(item, 1, origin, language).url })),
  ], children.length ? children : products, (item) => children.length ? categorySeo(item, 1, origin, language).url : productSeo(item, origin, language).url, origin);
};
