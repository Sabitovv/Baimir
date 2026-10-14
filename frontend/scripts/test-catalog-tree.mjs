import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCatalogTree, catalogAncestors, catalogView, flattenCatalogTree } from '../src/utils/catalogTree.ts'
import { categoryCatalogParameters } from '../seo.mjs'

const categories = [
  { id: 97, slug: 'metalloobrabotka', name: 'Металлообработка', parentId: null },
  { id: 106, slug: 'stanki-dlya-raskroya', name: 'Станки для раскроя металла', parentId: 97 },
  { id: 152, slug: 'lazernye-stanki', name: 'Лазерные станки', parentId: 106 },
  { id: 162, slug: 'a-series', name: 'А Серия', parentId: 152 },
  { id: 173, slug: 'plasma-parts', name: 'Комплектующие для плазмы', parentId: 106 },
  { id: 109, slug: 'listogibochnye-stanki', name: 'Листогибочные станки', parentId: 97 },
  { id: 192, slug: 'hydraulic-press-brakes', name: 'Гидравлические листогибочные прессы', parentId: 109 },
  { id: 193, slug: 'equipment-for-sheet-metal-press-brakes', name: 'Оснастка для листогибочных прессов', parentId: 109 },
  { id: 201, slug: 'pipe-benders', name: 'Трубогибы', parentId: 97 },
]
const find = id => categories.find(category => category.id === id)

test('preserves all levels instead of truncating the menu at grandchildren', () => {
  const tree = buildCatalogTree(categories)
  assert.equal(tree.length, 1)
  assert.equal(tree[0].children[0].children[0].children[0].slug, 'a-series')
  assert.deepEqual(catalogAncestors(find(162), categories).map(c => c.id), [162, 152, 106, 97])
})

test('accepts nested trees, infers parent IDs, and does not mutate API records', () => {
  const nested = [{ id: 109, slug: 'listogibochnye-stanki', name: 'Листогибы', children: [{ id: 192, name: 'Прессы' }] }]
  const before = structuredClone(nested)
  assert.equal(flattenCatalogTree(nested)[1].parentId, 109)
  assert.equal(catalogView(nested[0].children[0], nested, false).calculatorAllowed, true)
  assert.deepEqual(nested, before)
})

test('non-leaf categories always show subcategories and query only direct products', () => {
  for (const id of [97, 106, 152, 109]) {
    const view = catalogView(find(id), categories, false)
    assert.equal(view.showSubcategories, true)
    assert.equal(view.productScope, 'direct')
  }
})

test('leaves display their own products including imported accessories', () => {
  for (const id of [162, 173, 192, 193]) assert.equal(catalogView(find(id), categories, false).showSubcategories, false)
  assert.equal(catalogView(find(173), categories, false).calculatorAllowed, false)
})

test('calculator is confined to the bending branch, never its ancestors or spare parts', () => {
  for (const id of [109, 192]) assert.equal(catalogView(find(id), categories, false).calculatorAllowed, true)
  for (const id of [97, 106, 152, 162, 173, 193, 201]) assert.equal(catalogView(find(id), categories, true).calculatorAllowed, false)
  const accessoryChild = { id: 999, slug: 'dies', name: 'Matrices', parentId: 193 }
  assert.equal(catalogView(accessoryChild, [...categories, accessoryChild], true).calculatorAllowed, false)
})

test('calculator eligibility does not depend on translated category names', () => {
  const translated = categories.map(c => ({ ...c, name: c.id === 109 ? 'Sheet bending machines' : 'Equipment' }))
  assert.equal(catalogView(translated.find(c => c.id === 192), translated, false).calculatorAllowed, true)
  assert.equal(catalogView(translated.find(c => c.id === 193), translated, false).calculatorAllowed, false)
})

test('only an explicit bending selection switches the bending page from tree to subtree results', () => {
  assert.deepEqual(catalogView(find(109), categories, true), {
    calculatorAllowed: true, bendingSelection: true, showSubcategories: false, productScope: 'subtree',
  })
  assert.deepEqual(catalogView(find(97), categories, true), {
    calculatorAllowed: false, bendingSelection: false, showSubcategories: true, productScope: 'direct',
  })
})

test('unrelated pages ignore stale calculator query parameters and preserve ordinary filters', () => {
  const params = categoryCatalogParameters(find(173), categories,
    '?press_brake=true&panel_bender=true&bending_force=200,&bending_length=1000,&bending_machine_type=Панелегиб&calc_length=1000&category_scope=subtree&attr_power=6&is_stock=true&page=2&sort=price,DESC')
  assert.deepEqual(params, { category_scope: 'direct', attr_power: '6', is_stock: 'true', page: 2, limit: 12, sort: 'price,DESC' })
})

test('bending calculation and method selection retain real matching filters', () => {
  const params = categoryCatalogParameters(find(109), categories, '?press_brake=true&bending_force=200,&bending_length=1000,&is_stock=true')
  assert.equal(params.category_scope, 'subtree')
  assert.equal(params.bending_force, '200,')
  assert.equal(params.bending_length, '1000,')
  assert.equal(categoryCatalogParameters(find(109), categories, '?bending_machine_type=Панелегиб').category_scope, 'subtree')
  assert.equal(categoryCatalogParameters(find(109), categories, '').category_scope, 'direct')
})

test('does not promote orphan/inactive categories or recurse forever through cycles', () => {
  assert.deepEqual(buildCatalogTree([{ id: 1, name: 'orphan', parentId: 999 }, { id: 2, name: 'hidden', isActive: false }]), [])
  const cycle = [{ id: 1, name: 'one', parentId: 2 }, { id: 2, name: 'two', parentId: 1 }]
  assert.deepEqual(buildCatalogTree(cycle), [])
  assert.equal(catalogAncestors(cycle[0], cycle).length, 2)
})
