import assert from 'node:assert/strict'
import test from 'node:test'
import { prioritizeManufacturerFilters } from '../src/utils/catalogFilters.ts'

test('manufacturer appears first without confusing Bodor and its laser-source brand', () => {
  const source = { code: 'laser_source_brand', values: [{ id: '108', label: 'BodorPower' }] }
  const manufacturer = { code: 'manufacturer', values: [{ id: '92', label: 'Bodor' }] }
  const filters = [{ code: 'price' }, source, manufacturer, { code: 'width' }]
  const before = structuredClone(filters)
  const ordered = prioritizeManufacturerFilters(filters)
  assert.deepEqual(ordered.map(f => f.code), ['manufacturer', 'price', 'laser_source_brand', 'width'])
  assert.equal(ordered[0], manufacturer)
  assert.equal(ordered[2], source)
  assert.deepEqual(filters, before)
})

test('other filters retain their order and empty categories remain safe', () => {
  assert.deepEqual(prioritizeManufacturerFilters([]), [])
  const filters = [{ code: 'price' }, { code: 'width' }]
  assert.deepEqual(prioritizeManufacturerFilters(filters), filters)
})
