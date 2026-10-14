// GET-only preflight. Never deploys, logs in, imports or sends enquiries.
import assert from 'node:assert/strict';
import { flattenCategories } from '../seo.mjs';

const option = key => {
  const index = process.argv.indexOf(key);
  return index < 0 ? null : process.argv[index + 1];
};
const api = (option('--api') || 'http://127.0.0.1:18080/api/v1').replace(/\/$/, '');
const site = option('--site')?.replace(/\/$/, '');
const get = async (url, json = true) => {
  const parsed = new URL(url);
  assert.ok(['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password, 'Use a plain public HTTP(S) URL without credentials');
  const response = await fetch(url, { headers: { 'Accept-Language': 'ru' }, signal: AbortSignal.timeout(20000), redirect: 'manual' });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return json ? response.json() : response.text();
};
const contract = await get(`${api}/catalog/capabilities`);
assert.ok(contract.version >= 1, 'Matching backend is required before deploying this storefront');
for (const feature of ['categoryScope', 'laserOptions', 'canonicalProducts', 'sourceAvailability', 'blogSeoReadOnly', 'seoLanguages']) assert.equal(contract[feature], true, `Backend missing: ${feature}`);
const categories = flattenCategories(await get(`${api}/categories/tree`));
const root = categories.find(c => c.slug === 'lazernye-stanki'); assert.ok(root, 'Laser root missing');
const options = await get(`${api}/products/category/${root.id}/laser-options`);
assert.equal(options.available, true); assert.equal(options.rootCategoryId, root.id);
assert.equal(new Set(options.machines.map(m => m.product.id)).size, options.machines.length);
const series = categories.filter(c => c.parentId === root.id);
const counts = [];
for (const category of series) {
  const page = await get(`${api}/products/category/${category.id}?category_scope=direct&page=1&size=12&sort=price,ASC`);
  assert.ok(Array.isArray(page.products) && Number.isInteger(page.meta.totalElements));
  assert.equal(page.meta.totalElements, options.machines.filter(m => m.product.categoryId === category.id).length, `Series ${category.slug}: selector and direct catalog differ`);
  for (const product of page.products) assert.equal(product.categoryId, category.id, 'Subtree results leaked into a direct category');
  counts.push({ slug: category.slug, count: page.meta.totalElements });
}
const bending = categories.find(c => c.slug === 'listogibochnye-stanki'); assert.ok(bending);
assert.equal((await get(`${api}/products/category/${bending.id}/press-brake-options`)).available, true);
const search = await get(`${api}/products/search?query=&page=1&size=1`);
const blog = await get(`${api}/blogs?page=1&size=1`);
if (site) {
  for (const path of ['/not-a-real-release-page', '/blog/not-a-real-release-article', `/catalog/${series[0].slug}?page=999999`]) {
    const response = await fetch(`${site}${path}`, { redirect: 'manual' }); assert.equal(response.status, 404, path);
  }
  for (const path of [`/catalog/${root.slug}`, `/catalog/${series[0].slug}`, '/en/catalog', '/kk/catalog']) {
    const body = await get(`${site}${path}`, false); assert.match(body, /<h1\b/); assert.match(body, /rel="canonical"/);
    if (/^\/(en|kk)\//.test(path)) assert.match(body, /hreflang="ru-KZ"/);
  }
  const products = await get(`${site}/sitemap-products.xml`, false);
  assert.equal((products.match(/<loc>/g) || []).length, search.totalElements);
  const pages = await get(`${site}/sitemap-pages.xml`, false);
  if (blog.totalElements > 0) {
    const article = blog.content[0]; assert.ok(pages.includes(`/blog/${article.slug}`));
    const html = await get(`${site}/blog/${article.slug}`, false); assert.match(html, /"@type":"Article"/); assert.match(html, /<article>/);
  }
}
console.log(JSON.stringify({ result: 'PASS', readOnly: true, apiContract: contract.version, laserCards: options.machines.length,
  series: counts, activeProducts: search.totalElements, blogArticles: blog.totalElements, siteChecked: !!site }));
