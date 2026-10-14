import assert from 'node:assert/strict'
import test from 'node:test'
import { LASER_DEFAULTS, LASER_PICK_PARAM, laserRequest, laserCatalogRoot, readLaserDraft, laserSelectionParams, clearLaserSelection, matchLaser, selectLasers } from '../src/utils/laserSelection.ts'
import { catalogParameters } from '../seo.mjs'

function machine(overrides = {}, product = {}) {
  return { product: { id: 1, slug: 'laser-1', name: 'Laser', categoryId: 2, categoryName: 'A', price: 100, availability: 'IN_STOCK', ...product },
    capabilities: { modes: ['sheet'], powerWatts: 3000, sheetThickness: { mild: 20, stainless: 10, aluminium: 6, brass: 5 },
      tubeThickness: {}, rollThickness: {}, workingLength: 3000, workingWidth: 1500, pipeLength: null,
      roundMin: null, roundMax: null, squareMin: null, squareMax: null, rectangleMin: null, rectangleMax: null,
      rollWidth: null, rollMinThickness: null, rollMaxThickness: null, issues: [], ...overrides } }
}
const request = draft => {
  const result = laserRequest({ ...LASER_DEFAULTS, ...draft })
  assert.ok(result)
  return result
}

test('accepts decimals in mm and rejects zero, negative, NaN, infinity, junk and huge numbers', () => {
  assert.equal(request({ thickness: '1,5' }).thickness, 1.5)
  for (const value of ['', '0', '-1', 'NaN', 'Infinity', '1e8', '2мм', '99999999999']) assert.equal(laserRequest({ ...LASER_DEFAULTS, thickness: value }), null)
  assert.equal(laserRequest({ ...LASER_DEFAULTS, kind: 'plasma' }), null)
  assert.equal(laserRequest({ ...LASER_DEFAULTS, material: 'copper' }), null)
})
test('sheet fits at an inclusive thickness and workspace boundary', () => {
  const result = matchLaser(machine(), request({ thickness: '20' }))
  assert.equal(result.status, 'match'); assert.ok(result.reasons.includes('atLimit'))
  assert.equal(matchLaser(machine(), request({ thickness: '20.01' })).status, 'excluded')
})
test('material limits are never inferred from laser watts or another material', () => {
  assert.equal(matchLaser(machine({ powerWatts: 120000, sheetThickness: {} }), request({})).status, 'review')
  assert.equal(matchLaser(machine(), request({ material: 'stainless', thickness: '15' })).status, 'excluded')
  assert.equal(matchLaser(machine({ sheetThickness: { mild: '20' } }), request({})).status, 'review')
})
test('fits a rotated sheet and explains the rotation; too large in both orientations is excluded', () => {
  const rotated = matchLaser(machine(), request({ length: '1500', width: '3000' }))
  assert.equal(rotated.status, 'match'); assert.ok(rotated.reasons.includes('sheetRotated'))
  assert.equal(matchLaser(machine(), request({ length: '3001', width: '1501' })).status, 'excluded')
})
test('missing dimensions and contradictory configuration require review rather than matching', () => {
  assert.equal(matchLaser(machine({ workingWidth: null }), request({})).status, 'review')
  for (const issue of ['powerConflict', 'configurationUnconfirmed', 'workingAreaConflict']) assert.equal(matchLaser(machine({ issues: [issue] }), request({})).status, 'review')
  assert.equal(matchLaser(machine({ issues: ['materialConflict:stainless'] }), request({ material: 'mild' })).status, 'match')
})
test('a known failing dimension stays excluded even if other parameters are missing', () => {
  const result = matchLaser(machine({ sheetThickness: {} }), request({ length: '4000' }))
  assert.equal(result.status, 'excluded'); assert.ok(result.reasons.includes('workingAreaExceeded'))
})
test('only conflicts relevant to the selected cutting mode require review', () => {
  assert.equal(matchLaser(machine({ issues: ['pipeLengthConflict', 'tubeMaterialConflict:mild', 'rollWidthConflict'] }), request({})).status, 'match')
  const tube = machine({ modes: ['sheet', 'tube'], tubeThickness: { mild: 6 }, pipeLength: 6500, roundMin: 8, roundMax: 230,
    issues: ['workingAreaConflict', 'materialConflict:mild'] })
  assert.equal(matchLaser(tube, request({ kind: 'tube', thickness: '3', length: '6000' })).status, 'match')
  assert.equal(matchLaser({ ...tube, capabilities: { ...tube.capabilities, modes: ['tube'] } }, request({ kind: 'tube', thickness: '3', length: '6000' })).status, 'review')
})
test('a tube-only model never qualifies as a sheet machine', () => {
  assert.equal(matchLaser(machine({ modes: ['tube'] }), request({})).status, 'excluded')
})
test('combined machines do not copy their sheet thickness into tube wall limits', () => {
  const tube = request({ kind: 'tube', thickness: '3', length: '6000' })
  const result = matchLaser(machine({ modes: ['sheet', 'tube'], pipeLength: 6000, roundMin: 8, roundMax: 230 }), tube)
  assert.equal(result.status, 'review'); assert.ok(result.reasons.includes('materialMissing'))
})
test('round tubes check wall thickness, both chuck limits and the actual tube length', () => {
  const m = machine({ modes: ['tube'], tubeThickness: { mild: 6 }, pipeLength: 6500, roundMin: 8, roundMax: 230 })
  assert.equal(matchLaser(m, request({ kind: 'tube', thickness: '3', length: '6500', diameter: '230' })).status, 'match')
  assert.equal(matchLaser(m, request({ kind: 'tube', thickness: '3', length: '6501' })).status, 'excluded')
  assert.equal(matchLaser(m, request({ kind: 'tube', thickness: '1', diameter: '7' })).status, 'excluded')
  assert.equal(matchLaser(m, request({ kind: 'tube', thickness: '3', diameter: '231' })).status, 'excluded')
  assert.equal(laserRequest({ ...LASER_DEFAULTS, kind: 'tube', thickness: '30', diameter: '60' }), null)
})
test('square and rectangular profiles are not substituted for each other or for circles', () => {
  const m = machine({ modes: ['tube'], tubeThickness: { mild: 6 }, pipeLength: 6500, squareMin: 8, squareMax: 230 })
  assert.equal(matchLaser(m, request({ kind: 'tube', profile: 'square', thickness: '3', length: '6000' })).status, 'match')
  assert.equal(matchLaser(m, request({ kind: 'tube', profile: 'rectangle', thickness: '3', length: '6000' })).status, 'review')
  assert.equal(laserRequest({ ...LASER_DEFAULTS, kind: 'tube', profile: 'rectangle', thickness: '3', tubeHeight: '' }), null)
})
test('rolls use roll width/material limits, never table length or sheet ratings', () => {
  const m = machine({ modes: ['roll'], rollThickness: { mild: 2 }, rollMinThickness: 0.8, rollMaxThickness: 2, rollWidth: 1500, workingLength: 3000 })
  assert.equal(matchLaser(m, request({ kind: 'roll', thickness: '1', width: '1500', length: '' })).status, 'match')
  assert.equal(matchLaser(m, request({ kind: 'roll', thickness: '0.5' })).status, 'excluded')
  assert.equal(matchLaser(m, request({ kind: 'roll', thickness: '1', width: '1501' })).status, 'excluded')
  assert.equal(matchLaser(machine({ modes: ['roll'], rollWidth: 1500 }), request({ kind: 'roll', thickness: '1' })).status, 'review')
})
test('all models from all series are considered; missing models have a separate group', () => {
  const machines = Array.from({ length: 41 }, (_, index) => machine(index === 40 ? { sheetThickness: {} } : {}, { id: index + 1, categoryId: index % 9 + 1 }))
  const result = selectLasers(machines, request({}))
  assert.equal(result.total, 41); assert.equal(result.matches.length, 40); assert.equal(result.review.length, 1)
  assert.equal(selectLasers([...machines, machines[0]], request({})).total, 41)
})
test('stock filtering preserves real availability; prices by request stay last in both sorts', () => {
  const machines = [machine({}, { id: 1, availability: 'ON_ORDER', inStock: false, price: 10 }), machine({}, { id: 2, price: null }), machine({}, { id: 3, price: 1000 })]
  assert.deepEqual(selectLasers(machines, request({}), true).matches.map(m => m.machine.product.id), [3, 2])
  assert.deepEqual(selectLasers(machines, request({}), false, 'price-asc').matches.map(m => m.machine.product.id), [1, 3, 2])
  assert.deepEqual(selectLasers(machines, request({}), false, 'price-desc').matches.map(m => m.machine.product.id), [3, 1, 2])
})
test('selection URLs round-trip, preserve ordinary filters, and never leak calculator inputs into catalog API', () => {
  const original = new URLSearchParams('is_stock=true&manufacturer=92&page=3&calc_laser_old=1')
  const params = laserSelectionParams(original, { ...LASER_DEFAULTS, thickness: '12.5' })
  assert.equal(params.get(LASER_PICK_PARAM), 'true'); assert.equal(params.get('page'), '1')
  assert.equal(readLaserDraft(params).thickness, '12.5'); assert.equal(params.has('calc_laser_old'), false)
  assert.deepEqual(catalogParameters(params.toString()), { is_stock: 'true', manufacturer: '92', page: 1, limit: 12, sort: 'price,ASC' })
  assert.equal([...clearLaserSelection(params).keys()].some(k => k.startsWith('calc_laser_')), false)
  assert.equal(original.get('page'), '3'); assert.equal(laserSelectionParams(original, { ...LASER_DEFAULTS, thickness: '' }), null)
})
test('calculator only appears inside the laser branch, not metalworking/bending/accessories/hidden/orphan branches', () => {
  const cats = [
    { id: 1, name: 'Metal', slug: 'metal', parentId: null },
    { id: 2, name: 'Laser', slug: 'lazernye-stanki', parentId: 1 },
    { id: 3, name: 'A', slug: 'a-series', parentId: 2 },
    { id: 4, name: 'Parts', slug: 'laser-parts', parentId: 2 },
    { id: 5, name: 'Parts', slug: 'zapchasti-lazera', parentId: 2 },
    { id: 6, name: 'Press', slug: 'listogibochnye-stanki', parentId: 1 },
  ]
  assert.equal(laserCatalogRoot(cats[1], cats)?.id, 2); assert.equal(laserCatalogRoot(cats[2], cats)?.id, 2)
  for (const index of [0, 3, 4, 5]) assert.equal(laserCatalogRoot(cats[index], cats), null)
  assert.equal(laserCatalogRoot(cats[2], cats.map(c => c.id === 2 ? { ...c, isActive: false } : c)), null)
  assert.equal(laserCatalogRoot(cats[2], cats.slice(1)), null)
  const nested = [{ id: 2, slug: 'lazernye-stanki', name: 'Laser', children: [{ id: 3, name: 'A' }] }]
  assert.equal(laserCatalogRoot(nested[0].children[0], nested)?.id, 2)
})
