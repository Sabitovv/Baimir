import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the real TSX without introducing another UI test runner.
const source = await fs.readFile(new URL('../src/components/common/ProductPrice.tsx', import.meta.url), 'utf8');
const require = createRequire(import.meta.url);
const runtime = pathToFileURL(require.resolve('react/jsx-runtime')).href;
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  .replaceAll('"react/jsx-runtime"', JSON.stringify(runtime));
const { default: ProductPrice } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const render = props => renderToStaticMarkup(React.createElement(ProductPrice, props));

for (const variant of ['default', 'compact', 'mini', 'catalog', 'cart']) {
  test(`${variant}: discounted millions are stacked, left-aligned and unbroken`, () => {
    const html = render({ price: '13 500 000 ₸', oldPrice: '15 000 000 ₸', variant });
    assert.match(html, /class="product-price [^"]*flex-col items-start/);
    assert.match(html, /<del class="[^"]*whitespace-nowrap[^>]*>15 000 000\u00a0₸<\/del>/);
    assert.match(html, /<span class="[^"]*whitespace-nowrap[^>]*>13 500 000\u00a0₸<\/span>/);
    assert.ok(html.indexOf('<del') < html.indexOf('<span'));
    assert.doesNotMatch(html, /flex-row|items-end|justify-between|shrink-0|rounded-full/);
  });
}

test('a price without a discount has no empty old-price line', () => {
  const html = render({ price: '520 ₸' });
  assert.doesNotMatch(html, /<del/); assert.match(html, /520\u00a0₸/);
});
test('unknown-price labels can wrap and never receive an invented amount', () => {
  const html = render({ price: 'Price on request', oldPrice: null });
  assert.match(html, />Price on request<\/span>/); assert.doesNotMatch(html, /whitespace-nowrap|₸|<del/);
});
test('locale formatting and large amounts are preserved', () => {
  for (const locale of ['ru', 'en', 'kk']) for (const value of [0, 520, 13500000, 150000000, 1000000000, 10900000.5]) {
    const amount = value.toLocaleString(locale);
    const html = render({ price: `${amount} ₸` });
    assert.ok(html.includes(`${amount}\u00a0₸`)); assert.match(html, /whitespace-nowrap/);
  }
});
test('both product-card implementations and cart use the shared layout', async () => {
  for (const file of ['components/common/ProductCard.tsx', 'pages/Catalog/components/CatalogCard.tsx', 'components/common/CartCard.tsx']) {
    const text = await fs.readFile(new URL('../src/' + file, import.meta.url), 'utf8');
    assert.match(text, /<ProductPrice\b/); assert.doesNotMatch(text, />\s*\{formattedOldPrice\}\s*</);
  }
});
