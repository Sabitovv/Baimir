import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { mirrorSavedInquiry } from '../src/utils/bitrixForm.ts'

let inquiryId = 100
const request = { name: ' Test Customer ', phone: ' +70000000000 ', email: 'test@example.invalid', message: 'Comment', sourceUrl: 'https://baytech.kz/?utm_source=test' }
const saved = (extra = {}) => Promise.resolve({ data: { id: ++inquiryId, ...extra } })
const success = () => Response.json({ result: { resultId: 9, gid: 'test-guest', redirect: { url: 'https://example.invalid/' } } })

function fixture(t, { fetch = success, guest } = {}) {
  const calls = []
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  // No document or location API: this path must never click, render, or navigate.
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { b24Tracker: { guest } } })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
    else delete globalThis.window
  })
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, ...options })
    return fetch(url, options)
  })
  const warnings = t.mock.method(console, 'warn', () => {})
  return { calls, warnings }
}

test('provided script is loaded once with an unused hidden trigger and no popup calls', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.equal((html.match(/data-b24-form=/g) || []).length, 1)
  assert.match(html, /data-b24-form="click\/6\/29e5mk"/)
  assert.match(html, /https:\/\/crm.baymir.kz\/upload\/crm\/form\/loader_6_29e5mk.js/)
  assert.match(html, /<\/script>\s*<button id="baymir-crm-trigger" type="button" hidden/)
  const code = await readFile(new URL('../src/utils/bitrixForm.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(code, /\.click\(|\.show\(|localStorage|sessionStorage/)
  const contact = await readFile(new URL('../src/components/common/Contact.tsx', import.meta.url), 'utf8')
  assert.match(contact, /<form[^>]*onSubmit=\{handleSubmit\}/)
  assert.doesNotMatch(contact, /BitrixFormButton|useFallback/)
})

test('never contacts CRM until the site inquiry is saved', async (t) => {
  const state = fixture(t)
  let resolve
  const pending = new Promise((done) => { resolve = done })
  const copying = mirrorSavedInquiry(request, pending)
  await Promise.resolve()
  assert.equal(state.calls.length, 0)
  resolve({ data: { id: ++inquiryId } })
  assert.equal(await copying, true)
  assert.equal(state.calls.length, 1)
})

test('failed primary orders are never sent to CRM', async (t) => {
  const state = fixture(t)
  assert.equal(await mirrorSavedInquiry(request, Promise.reject(new Error('site failed'))), false)
  assert.equal(state.calls.length, 0)
})

test('production HTTP 201 with an empty body is a successful save, not a missing order', async (t) => {
  const state = fixture(t)
  const primary = Promise.resolve({ data: null })
  assert.equal(await mirrorSavedInquiry(request, primary, 'ru', 'rtk-empty-201'), true)
  assert.equal(await mirrorSavedInquiry(request, primary, 'ru', 'rtk-empty-201'), false)
  assert.equal(state.calls.length, 1)
  const properties = JSON.parse(state.calls[0].body.get('properties'))
  assert.equal(properties.site_inquiry_id, '', 'do not invent a server ID')
  assert.equal(properties.site_submission_id, 'rtk-empty-201')
})

test('cart snapshots are available even though production returns no inquiry body', async (t) => {
  const state = fixture(t)
  await mirrorSavedInquiry({ ...request, items: [{ productId: 2708, quantity: 2 }], crmItems: [{ productId: 2708, quantity: 2, productNameSnapshot: 'Bodor A3', priceSnapshot: 10900000 }] }, Promise.resolve({ data: null }), 'ru', 'rtk-cart-201')
  assert.match(JSON.parse(state.calls[0].body.get('properties')).site_order, /Bodor A3 × 2; цена: 10900000 KZT/)
})

test('successful site result is available while CRM is still pending', async (t) => {
  let finishCrm
  fixture(t, { fetch: () => new Promise((done) => { finishCrm = done }) })
  const primary = saved()
  const copying = mirrorSavedInquiry(request, primary)
  const result = await primary
  assert.ok(result.data.id, 'checkout can show success and clear the cart now')
  assert.ok(finishCrm)
  finishCrm(success())
  assert.equal(await copying, true)
})

test('matches the public form payload, retains attribution and ignores CRM redirects', async (t) => {
  const gids = []
  const state = fixture(t, { guest: { getTrace: () => '{"utm_source":"test"}', setGid: (gid) => gids.push(gid) } })
  assert.equal(await mirrorSavedInquiry(request, saved(), 'kk-KZ'), true)
  const call = state.calls[0]
  assert.equal(call.url, 'https://crm.baymir.kz/bitrix/services/main/ajax.php?action=crm.site.form.fill')
  assert.equal(call.method, 'POST')
  assert.equal(call.keepalive, true)
  assert.equal(call.credentials, 'omit')
  assert.equal(call.body.get('id'), '6')
  assert.equal(call.body.get('sec'), '29e5mk')
  assert.equal(call.body.get('lang'), 'kz')
  assert.deepEqual(JSON.parse(call.body.get('values')), { CONTACT_NAME: ['Test Customer'], CONTACT_PHONE: ['+70000000000'] })
  assert.equal(call.body.get('trace'), '{"utm_source":"test"}')
  assert.deepEqual(gids, ['test-guest'])
  const properties = JSON.parse(call.body.get('properties'))
  assert.equal(properties.site_email, request.email)
  assert.equal(properties.site_message, request.message)
  assert.equal(properties.site_source_url, request.sourceUrl)
})

test('cart copy carries saved product snapshots and quantities, without mutating the order', async (t) => {
  const state = fixture(t)
  const cart = { ...request, items: [{ productId: 2708, quantity: 2 }, { productId: 12, quantity: 3 }] }
  const original = structuredClone(cart)
  const primary = saved({ items: [
    { productId: 2708, quantity: 2, productNameSnapshot: 'Bodor A3', priceSnapshot: 10900000 },
    { productId: 12, quantity: 3, productNameSnapshot: 'Tool', priceSnapshot: 100 },
  ] })
  assert.equal(await mirrorSavedInquiry(cart, primary), true)
  const order = JSON.parse(state.calls[0].body.get('properties')).site_order
  assert.match(order, /Bodor A3 × 2; цена: 10900000 KZT/)
  assert.match(order, /Tool × 3; цена: 100 KZT/)
  assert.deepEqual(cart, original)
})

test('single-product enquiries keep the product ID when no snapshot is returned', async (t) => {
  const state = fixture(t)
  await mirrorSavedInquiry({ ...request, productId: 2708 }, saved())
  assert.equal(JSON.parse(state.calls[0].body.get('properties')).site_order, 'Товар #2708 × 1')
})

test('duplicate lifecycle invocations do not create duplicate CRM leads', async (t) => {
  const state = fixture(t)
  const primary = saved()
  assert.deepEqual(await Promise.all([mirrorSavedInquiry(request, primary), mirrorSavedInquiry(request, primary)]), [true, false])
  assert.equal(state.calls.length, 1)
})

test('empty contact data or missing saved IDs never produce blank CRM submissions', async (t) => {
  const state = fixture(t)
  for (const invalid of [{ ...request, name: ' ' }, { ...request, phone: null }, { ...request, phone: ' ' }]) {
    assert.equal(await mirrorSavedInquiry(invalid, saved()), false)
  }
  for (const data of [undefined, null, {}, { id: -1 }, { id: '123' }]) {
    assert.equal(await mirrorSavedInquiry(request, Promise.resolve({ data })), false)
  }
  assert.equal(state.calls.length, 0)
})

test('CRM HTTP/network/JSON failures never reject successful site orders or log personal data', async (t) => {
  let response
  const state = fixture(t, { fetch: () => {
    if (response instanceof Error) throw response
    return response
  } })
  for (response of [new Error('blocked'), new Response('broken JSON'), Response.json({ error: 'CRM unavailable' }), Response.json({ result: {} }), Response.json({}, { status: 503 })]) {
    const primary = saved()
    assert.equal(await mirrorSavedInquiry(request, primary), false)
    assert.ok((await primary).data.id)
  }
  assert.equal(state.calls.length, 5)
  const warnings = state.warnings.mock.calls.map((call) => call.arguments.join(' ')).join('\n')
  assert.match(warnings, /site inquiry is intact/)
  assert.doesNotMatch(warnings, /Test Customer|70000000000|example.invalid|Comment/)
})

test('ambiguous failures are not automatically retried', async (t) => {
  const state = fixture(t, { fetch: () => { throw new Error('network') } })
  const primary = saved()
  await mirrorSavedInquiry(request, primary)
  await mirrorSavedInquiry(request, primary)
  assert.equal(state.calls.length, 1)
})

test('slow CRM requests time out independently of checkout', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const state = fixture(t, { fetch: (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true })
  }) })
  const copying = mirrorSavedInquiry(request, saved())
  await Promise.resolve()
  t.mock.timers.tick(10000)
  assert.equal(await copying, false)
  assert.equal(state.calls.length, 1)
  assert.equal(state.calls[0].signal.aborted, true)
})

test('missing/broken tracking never blocks the contact copy', async (t) => {
  const state = fixture(t, { guest: { getTrace: () => { throw new Error('blocked tracker') }, setGid: () => { throw new Error('blocked storage') } } })
  assert.equal(await mirrorSavedInquiry(request, saved()), true)
  assert.equal(state.calls[0].body.get('trace'), '')
})

test('oversized analytics is omitted, never sent as corrupted partial JSON', async (t) => {
  const state = fixture(t, { guest: { getTrace: () => 'x'.repeat(9000) } })
  await mirrorSavedInquiry(request, saved())
  assert.equal(state.calls[0].body.get('trace'), '')
})
