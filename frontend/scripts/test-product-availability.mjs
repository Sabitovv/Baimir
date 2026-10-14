import test from 'node:test'
import assert from 'node:assert/strict'
import { availabilityStatus, availabilityLabel, canOrderProduct } from '../src/utils/productAvailability.ts'

test('preorders remain orderable without pretending there is warehouse stock', () => {
  const product = { inStock: false, availability: 'ON_ORDER', deliveryDays: 45 }
  assert.equal(availabilityStatus(product), 'ON_ORDER')
  assert.equal(availabilityLabel(product), 'Под заказ (45 дн.)')
  assert.equal(canOrderProduct(product), true)
  assert.equal(product.inStock, false)
})
test('zero lead time is not a delivery-date promise and service is not warehouse stock', () => {
  assert.equal(availabilityLabel({ availability: 'ON_ORDER', deliveryDays: 0 }), 'Под заказ')
  assert.equal(availabilityLabel({ availability: 'SERVICE', inStock: false }), 'Услуга')
  assert.equal(canOrderProduct({ availability: 'SERVICE' }), false)
})
test('legacy responses retain their stock behaviour', () => {
  assert.equal(availabilityStatus({ inStock: false }), 'OUT_OF_STOCK')
  assert.equal(canOrderProduct({ inStock: false }), false)
  assert.equal(availabilityLabel({ inStock: true }), 'В наличии')
})
test('unknown quantity is never rendered as one confirmed piece', () => {
  assert.equal(availabilityLabel({ availability: 'IN_STOCK', stockQuantityKnown: false }), 'В наличии')
})
test('availability supports all site languages and ignores invalid lead-time numbers', () => {
  assert.equal(availabilityLabel({ availability: 'ON_ORDER', deliveryDays: 30 }, 'en'), 'Available to order (30 days)')
  assert.equal(availabilityLabel({ availability: 'ON_ORDER', deliveryDays: 30 }, 'kk'), 'Тапсырыс бойынша (30 күн)')
  assert.equal(availabilityLabel({ availability: 'ON_ORDER', deliveryDays: NaN }), 'Под заказ')
})
