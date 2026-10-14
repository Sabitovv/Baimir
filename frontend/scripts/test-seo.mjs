import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { productSeo, absoluteUrl, localizedBlocks, categoryGraph, catalogGraph, catalogParameters, blogSeo, languagePath, languageRoute, languageAlternates, catalogNoindex } from '../seo.mjs';

const fixture = {
  id: 1, slug: 'bodor-a3', name: 'Bodor A3 6000W', sku: 'TEST-1',
  description: 'Obsolete A6 text', price: 17500000, inStock: true,
  media: [{ type: 'IMAGE', url: 'https://cdn.example.com/machine.webp' }],
  contentBlocks: [{ type: 'paragraph', data: { text: 'Bodor A3: мощность 6000 Вт (6 кВт).', translations: { en: { text: 'Bodor A3 laser source power: 6000 W (6 kW).' }, kz: { text: 'Bodor A3 лазер көзінің қуаты — 6000 Вт (6 кВт).' } } } }],
  specifications: [{ name: 'Параметры', attributes: [{ name: 'Мощность', value: '6', unit: 'кВт' }] }],
  breadcrumbs: [{ name: 'Лазерные станки', slug: 'lasers' }],
};

test('robots permits public blog rendering and canonical/noindex discovery but keeps private APIs blocked', async () => {
  const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
  const groups = robots.split(/(?=User-agent:)/).filter(group => group.includes('Disallow: /api/'));
  assert.equal(groups.length, 7);
  for (const group of groups) {
    assert.match(group, /^Allow: \/api\/v1\/blogs$/m);
    assert.match(group, /^Disallow: \/api\/$/m);
    assert.match(group, /^Disallow: \/admin\/$/m);
    assert.doesNotMatch(group, /^Disallow: .*\?/m);
  }
});

test('metadata uses visible blocks, preserves external images and does not invent an offer', () => {
  const seo = productSeo(fixture);
  assert.match(seo.description, /6000 Вт/);
  assert.doesNotMatch(seo.description, /A6/);
  assert.equal(seo.images[0], fixture.media[0].url);
  assert.equal(seo.schema.name, fixture.name);
  assert.equal(productSeo({ ...fixture, price: null }).schema.offers, undefined);
  assert.doesNotMatch(productSeo({ ...fixture, contentBlocks: [{ type: 'gallery', data: { urls: [] } }] }).description, /Obsolete/);
  assert.equal(absoluteUrl('javascript:alert(1)'), '');
});

test('component brands never become the machine brand in any language', () => {
  for (const name of ['Laser source brand', 'Лазерлік көз бренді', 'Бренд лазерного источника']) {
    const product = { ...fixture, specifications: [{ attributes: [{ code: 'laser_source_brand', name, value: 'BodorPower' }] }] };
    assert.equal(productSeo(product).schema.brand, undefined);
    assert.deepEqual(productSeo({ ...product, brandName: 'Bodor' }).schema.brand, { '@type': 'Brand', name: 'Bodor' });
  }
  assert.equal(productSeo({ ...fixture, specifications: [{ attributes: [{ code: 'brand', name: 'Бренд', value: 'Bodor' }] }] }).schema.brand.name, 'Bodor');
});
test('preorders use PreOrder and archived duplicate pages point to the canonical product', () => {
  assert.equal(productSeo({ ...fixture, inStock: false, availability: 'ON_ORDER' }).schema.offers.availability, 'https://schema.org/PreOrder');
  assert.equal(productSeo({ ...fixture, inStock: false, availability: 'OUT_OF_STOCK' }).schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(productSeo({ ...fixture, canonicalSlug: 'primary-a3' }).url, 'https://baytech.kz/catalog/product/primary-a3');
  assert.equal(productSeo({ ...fixture, canonicalSlug: '//unsafe.example' }).url, 'https://baytech.kz/catalog/product/bodor-a3');
});

test('localized blocks and metadata use the same translation without changing the source', () => {
  const original = structuredClone(fixture.contentBlocks);
  assert.match(localizedBlocks(fixture.contentBlocks, 'en-US')[0].data.text, /laser source power/);
  assert.match(productSeo(fixture, undefined, 'en').description, /laser source power/);
  assert.match(productSeo(fixture, undefined, 'kk-KZ').description, /лазер көзінің қуаты/);
  assert.match(productSeo(fixture, undefined, 'en').title, /Kazakhstan/);
  assert.deepEqual(fixture.contentBlocks, original);
});

test('category graphs retain breadcrumbs and the correct list across pages and filters', () => {
  const parent = { id: 1, name: 'Металлообработка', slug: 'metal', parentId: null };
  const child = { id: 2, name: 'Лазеры', slug: 'lasers', parentId: 1 };
  const categories = [parent, child];
  const graph = categoryGraph(child, categories, [fixture], 2);
  assert.deepEqual(graph.map((item) => item['@type']), ['CollectionPage', 'BreadcrumbList', 'ItemList']);
  assert.equal(graph[0].url, 'https://baytech.kz/catalog/lasers?page=2');
  assert.deepEqual(graph[1].itemListElement.map((item) => item.name), ['Главная', 'Каталог', 'Металлообработка', 'Лазеры']);
  assert.equal(graph[2].itemListElement[0].url, 'https://baytech.kz/catalog/product/bodor-a3');
  assert.equal(categoryGraph(parent, categories)[2].itemListElement[0].url, 'https://baytech.kz/catalog/lasers');
  assert.equal(categoryGraph(child, categories).length, 2, 'no invented empty list while products are loading');
  assert.equal(catalogGraph(categories)[2].numberOfItems, 1);
  assert.deepEqual(catalogParameters('?page=2&sort=price,DESC&attr_power=6&calc_length=1500&categoryId=2&utm_source=ad&gclid=ad&fbclid=ad'), { page: 2, limit: 12, sort: 'price,DESC', attr_power: '6' });
  assert.equal(catalogParameters('?page=Infinity').page, 1);
});

test('language URLs are stable, strip previous prefixes, preserve query/hash and retain RU addresses', () => {
  assert.deepEqual(languageRoute('/en/catalog/a-series'), { language: 'en', pathname: '/catalog/a-series' });
  assert.deepEqual(languageRoute('/kk'), { language: 'kz', pathname: '/' });
  assert.equal(languagePath('/en/catalog/a-series?page=2#models', 'kz'), '/kk/catalog/a-series?page=2#models');
  assert.equal(languagePath('/kk/catalog/a-series', 'ru'), '/catalog/a-series');
  assert.equal(languagePath('/catalog/english', 'en'), '/en/catalog/english');
  assert.equal(productSeo(fixture, undefined, 'en').url, 'https://baytech.kz/en/catalog/product/bodor-a3');
  assert.equal(languageAlternates('https://baytech.kz/en/catalog/lasers?page=2').find(a => a.hreflang === 'kk-KZ').href, 'https://baytech.kz/kk/catalog/lasers?page=2');
  assert.equal(categoryGraph({ id: 1, name: 'Lasers', slug: 'lasers' }, [], [fixture], 1, undefined, 'en')[2].itemListElement[0].url, 'https://baytech.kz/en/catalog/product/bodor-a3');
});
test('blog metadata uses translated blocks, real author and dates without inventing facts', () => {
  const blog = { id: 1, slug: 'article', title: { ru: 'Статья', en: 'Article' }, excerpt: { en: '' }, contentBlocks: fixture.contentBlocks, authorName: 'Author', publishedAt: '2026-10-07T12:00:00Z' };
  const seo = blogSeo(blog, undefined, 'en');
  assert.equal(seo.schema['@type'], 'Article'); assert.equal(seo.name, 'Article'); assert.match(seo.description, /laser source power/);
  assert.equal(seo.schema.datePublished, blog.publishedAt); assert.equal(seo.schema.author.name, 'Author');
  assert.equal(blogSeo({ ...blog, authorName: null, publishedAt: 'invalid' }).schema.author, undefined);
  assert.equal(blogSeo({ ...blog, publishedAt: 'invalid' }).schema.datePublished, undefined);
  assert.equal(blogSeo(blog, undefined, 'kz').url, 'https://baytech.kz/kk/blog/article');
});
test('real filter/calculator URLs are noindex; pagination and advertising attribution remain crawlable', () => {
  assert.equal(catalogNoindex('page=2&utm_source=ad&gclid=click'), false);
  for (const query of ['sort=price,DESC', 'manufacturer=92', 'calc_laser_pick=true', 'press_brake=true', 'is_stock=true']) assert.equal(catalogNoindex(query), true);
});
test('title-only translations are not advertised to Google as complete language versions', () => {
  const product = productSeo({ ...fixture, seoLanguages: ['ru'] }, undefined, 'en');
  assert.equal(product.indexable, false); assert.equal(product.url, 'https://baytech.kz/catalog/product/bodor-a3');
  assert.deepEqual(languageAlternates(product.url, undefined, product.languages).map(a => a.hreflang), ['ru-KZ', 'x-default']);
  const blog = blogSeo({ slug: 'article', title: { ru: 'Статья', en: 'Article' }, seoLanguages: ['ru'] }, undefined, 'en');
  assert.equal(blog.indexable, false); assert.equal(blog.url, 'https://baytech.kz/blog/article');
});

test('HTTP SEO: visible HTML, canonical, real 404/503, live sitemap pagination and cache policy', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'baytech-seo-test-'));
  await writeFile(path.join(directory, 'index.html'), '<!doctype html><html lang="ru"><head><title>Baymir</title><meta name="description" content="generic" /></head><body><div id="root"></div></body></html>');
  await writeFile(path.join(directory, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  let searchCalls = 0;
  const searchPages = [];
  const categoryQueries = [];
  let compatible = false;
  const api = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/v1/catalog/capabilities') return res.end(JSON.stringify({ version: 1, categoryScope: compatible, laserOptions: true, canonicalProducts: true, sourceAvailability: true, blogSeoReadOnly: true, seoLanguages: true }));
    if (url.pathname === '/api/v1/products/bodor-a3') return res.end(JSON.stringify(fixture));
    if (url.pathname === '/api/v1/products/ru-only') return res.end(JSON.stringify({ ...fixture, slug: 'ru-only', seoLanguages: ['ru'] }));
    if (url.pathname === '/api/v1/products/duplicate-a3') return res.end(JSON.stringify({ ...fixture, slug: 'duplicate-a3', canonicalSlug: fixture.slug }));
    if (url.pathname === '/api/v1/products/unsafe') return res.end(JSON.stringify({ ...fixture, slug: 'unsafe', name: '</title><script>alert(1)</script>', contentBlocks: [{ type: 'paragraph', data: { text: '<img src=x onerror=alert(1)>' } }] }));
    if (url.pathname === '/api/v1/products/unavailable') { res.statusCode = 500; return res.end('{}'); }
    if (url.pathname === '/api/v1/categories/tree') return res.end(JSON.stringify([{ id: 1, name: 'Лазерные станки', slug: 'lasers', children: [] }]));
    if (url.pathname === '/api/v1/blogs') return res.end(JSON.stringify({ number: 0, totalPages: 1, totalElements: 1, content: [{ id: 1, slug: 'article', title: { ru: 'Статья', en: 'Article', kz: 'Мақала' } }] }));
    if (url.pathname === '/api/v1/blogs/article/seo') return res.end(JSON.stringify({ id: 1, slug: 'article', title: { ru: 'Статья', en: 'Article', kz: 'Мақала' }, contentBlocks: fixture.contentBlocks, authorName: 'Author', publishedAt: '2026-10-07T12:00:00Z' }));
    if (url.pathname === '/api/v1/blogs/unavailable/seo') { res.statusCode = 500; return res.end('{}'); }
    if (url.pathname === '/api/v1/products/category/1') {
      categoryQueries.push(Object.fromEntries(url.searchParams));
      return res.end(JSON.stringify({ products: [fixture], meta: { totalPages: 2 } }));
    }
    if (url.pathname === '/api/v1/products/search') {
      searchCalls++;
      assert.equal(url.searchParams.get('query'), '');
      const page = Number(url.searchParams.get('page'));
      searchPages.push(page);
      const number = Math.max(0, page - 1); // Production Spring configuration.
      return res.end(JSON.stringify({ number, totalPages: 2, totalElements: 2, content: [{ slug: number === 0 ? 'bodor-a3' : 'last-product' }] }));
    }
    res.statusCode = 404; res.end('{}');
  });
  api.listen(0, '127.0.0.1');
  await once(api, 'listening');
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, PORT: '0', DIST_DIR: directory, API_BASE_URL: `http://127.0.0.1:${api.address().port}/api/v1` },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => { child.kill(); api.closeAllConnections(); api.close(); await rm(directory, { recursive: true, force: true }); });
  let output = '';
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('SEO server did not start')), 10000);
    child.stdout.on('data', (chunk) => {
      output += chunk;
      const match = output.match(/Server started on :(\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    child.once('error', reject);
    child.once('exit', (code) => { if (code) reject(new Error(`Server exited ${code}`)); });
  });
  const origin = `http://127.0.0.1:${port}`;
  const redirect = await fetch(`${origin}/catalog/product/bodor-a3/?utm_source=test`, { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/catalog/product/bodor-a3?utm_source=test');
  const mismatched = await fetch(`${origin}/catalog/product/bodor-a3`);
  assert.equal(mismatched.status, 503); assert.equal(mismatched.headers.get('x-robots-tag'), 'noindex');
  compatible = true;
  const response = await fetch(`${origin}/catalog/product/bodor-a3?utm_source=test`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1>Bodor A3 6000W<\/h1>/);
  assert.match(html, /<meta name="description" content="Bodor A3: мощность 6000 Вт/);
  assert.match(html, /rel="canonical" href="https:\/\/baytech.kz\/catalog\/product\/bodor-a3"/);
  assert.match(html, /<dt>Мощность<\/dt><dd>6 кВт<\/dd>/);
  assert.doesNotMatch(html, /Obsolete A6|utm_source/);
  assert.match(html, /"@type":"Product"/);
  const english = await (await fetch(`${origin}/en/catalog/product/bodor-a3`, { headers: { 'Accept-Language': 'ru' } })).text();
  assert.match(english, /<html lang="en"/);
  assert.match(english, /<p>Bodor A3 laser source power/);
  assert.doesNotMatch(english, /мощность 6000/);
  assert.match(english, /rel="canonical" href="https:\/\/baytech.kz\/en\/catalog\/product\/bodor-a3"/);
  assert.match(english, /hreflang="kk-KZ" href="https:\/\/baytech.kz\/kk\/catalog\/product\/bodor-a3"/);
  const russian = await (await fetch(`${origin}/catalog/product/bodor-a3`, { headers: { 'Accept-Language': 'en-US' } })).text();
  assert.match(russian, /<html lang="ru"/);
  const kazakh = await (await fetch(`${origin}/kk/catalog/product/bodor-a3`)).text();
  assert.match(kazakh, /<html lang="kk"/);
  assert.match(kazakh, /лазер көзінің қуаты/);
  const incomplete = await (await fetch(`${origin}/en/catalog/product/ru-only`)).text();
  assert.match(incomplete, /name="robots" content="noindex,follow"/);
  assert.match(incomplete, /rel="canonical" href="https:\/\/baytech.kz\/catalog\/product\/ru-only"/);
  assert.doesNotMatch(incomplete, /hreflang="en"/);
  const missing = await fetch(`${origin}/catalog/product/not-real`);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('x-robots-tag'), 'noindex');
  assert.doesNotMatch(await missing.text(), /"@type":"Product"/);
  const unavailable = await fetch(`${origin}/catalog/product/unavailable`);
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get('retry-after'), '60');
  assert.equal((await fetch(`${origin}/catalog/unknown`)).status, 404);
  assert.equal((await fetch(`${origin}/catalog/unknown/products/999`)).status, 404);
  for (const invalid of ['/unknown', '/blog/missing', '/collections/missing', '/missing.png', '/catalog/lasers?page=9999', '/en/unknown', '/blog?page=2', '/%2e%2e%2fprivate-file', '/.env']) assert.equal((await fetch(`${origin}${invalid}`)).status, 404, invalid);
  assert.equal((await fetch(`${origin}/blog/unavailable`)).status, 503);
  const article = await (await fetch(`${origin}/en/blog/article`)).text();
  assert.match(article, /<h1>Article<\/h1>/); assert.match(article, /"@type":"Article"/); assert.match(article, /laser source power/);
  assert.match(article, /"datePublished":"2026-10-07T12:00:00Z"/);
  assert.doesNotMatch(article, /<div id="root"><\/div>/);
  assert.match(await (await fetch(`${origin}/blog`)).text(), /<a href="https:\/\/baytech.kz\/blog\/article">/);
  const technical = await (await fetch(`${origin}/catalog/deep-products`)).text();
  assert.match(technical, /name="robots" content="noindex,follow"/);
  const alias = await fetch(`${origin}/catalog/product/duplicate-a3?utm_source=test`, { redirect: 'manual' });
  assert.equal(alias.status, 301);
  assert.equal(alias.headers.get('location'), '/catalog/product/bodor-a3?utm_source=test');
  const category = await (await fetch(`${origin}/catalog/lasers/products/1?page=2&utm_source=test`)).text();
  assert.match(category, /rel="canonical" href="https:\/\/baytech.kz\/catalog\/lasers\?page=2"/);
  assert.match(category, /<a href="https:\/\/baytech.kz\/catalog\/product\/bodor-a3">/);
  assert.match(category, /"@type":"BreadcrumbList"/);
  assert.match(category, /"@type":"ItemList"/);
  assert.match(category, /"@id":"https:\/\/baytech.kz\/catalog\/lasers\?page=2#collectionpage"/);
  assert.equal(categoryQueries.at(-1).utm_source, undefined, 'tracking tags must not be sent as catalog filters');
  await fetch(`${origin}/catalog/lasers?sort=price,DESC&attr_power=6&calc_length=1500`);
  const lastQuery = categoryQueries.at(-1);
  assert.equal(lastQuery.size, '12');
  assert.equal(lastQuery.sort, 'price,DESC');
  assert.equal(lastQuery.attr_power, '6');
  assert.equal(lastQuery.calc_length, undefined);
  assert.equal(lastQuery.category_scope, 'direct');
  const selected = await (await fetch(`${origin}/catalog/lasers?calc_laser_pick=true&calc_laser_thickness=10`)).text();
  assert.match(selected, /name="robots" content="noindex,follow"/); assert.doesNotMatch(selected, /"@type":"ItemList"/);
  const enAlias = await fetch(`${origin}/en/catalog/product/duplicate-a3`, { redirect: 'manual' });
  assert.equal(enAlias.headers.get('location'), '/en/catalog/product/bodor-a3');
  const unsafe = await (await fetch(`${origin}/catalog/product/unsafe`)).text();
  assert.doesNotMatch(unsafe, /<script>alert\(1\)|<img src=x/);
  const maps = await Promise.all([fetch(`${origin}/sitemap-products.xml`), fetch(`${origin}/sitemap-products.xml`)]);
  const xml = await maps[0].text();
  assert.match(xml, /last-product/);
  assert.equal((xml.match(/<loc>/g) || []).length, 2);
  assert.equal(searchCalls, 2, 'concurrent sitemap requests share one paginated load');
  assert.deepEqual(searchPages, [1, 2], 'all one-based API pages must be requested, including the last one');
  assert.equal(maps[0].headers.get('cache-control'), 'no-cache');
  assert.equal((await fetch(`${origin}/robots.txt`)).headers.get('cache-control'), 'no-cache');
  const pages = await (await fetch(`${origin}/sitemap-pages.xml`)).text();
  assert.match(pages, /https:\/\/baytech.kz\/service/);
  assert.match(pages, /<loc>https:\/\/baytech.kz\/blog\/article<\/loc>/);
  assert.match(pages, /xmlns:xhtml/);
  const home = await (await fetch(`${origin}/en/`)).text();
  assert.match(home, /<h1>Industrial machinery and equipment in Kazakhstan<\/h1>/);
  assert.match(home, /"url":"https:\/\/baytech.kz\/en\/"/);
  assert.doesNotMatch(pages, /2026-06-10/);
});
