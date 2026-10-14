import type { InquiryRequest, InquiryResponse } from '../api/categoriesApi'

const CRM_ENDPOINT = 'https://crm.baymir.kz/bitrix/services/main/ajax.php?action=crm.site.form.fill'
const attempted = new Set<string>()

type CrmTracker = {
  getTrace?: () => string | null
  setGid?: (gid: string) => void
}

function tracker(): CrmTracker | undefined {
  return (window as Window & { b24Tracker?: { guest?: CrmTracker } }).b24Tracker?.guest
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function crmBody(request: InquiryRequest, saved: InquiryResponse | null, language: string, submissionId: string): FormData {
  let trace = ''
  try {
    trace = tracker()?.getTrace?.() || ''
  } catch {
    // Analytics/ad blockers must never prevent the actual inquiry or CRM copy.
  }
  const items = saved?.items ?? request.crmItems ?? request.items ?? (request.productId ? [{ productId: request.productId, quantity: 1 }] : [])
  const order = items.map((item) => {
    const snapshot = 'productNameSnapshot' in item ? item.productNameSnapshot : undefined
    const price = 'priceSnapshot' in item ? item.priceSnapshot : undefined
    return `${snapshot || `Товар #${item.productId}`} × ${item.quantity}${price != null ? `; цена: ${price} KZT` : ''}`
  }).join('\n')
  const body = new FormData()
  body.set('id', '6')
  body.set('sec', '29e5mk')
  body.set('lang', language.startsWith('en') ? 'en' : /^(kk|kz)/.test(language) ? 'kz' : 'ru')
  // Match the supplied form's actual fields and array-shaped values. Do not
  // open/submit the vendor widget: its success action can redirect the customer.
  body.set('values', JSON.stringify({ CONTACT_NAME: [request.name.trim()], CONTACT_PHONE: [request.phone?.trim()] }))
  // These placeholders must be mapped to hidden fields by the CRM administrator.
  // Until mapped, only name/phone are configured CRM fields, not the order.
  body.set('properties', JSON.stringify({
    site_inquiry_id: saved?.id != null ? String(saved.id) : '',
    site_submission_id: submissionId,
    site_source_url: (request.sourceUrl || '').slice(0, 500),
    site_email: request.email || '',
    site_message: request.message || '',
    site_order: order.slice(0, 8000),
  }))
  // A truncated trace would be invalid JSON; omit oversized analytics instead.
  body.set('trace', trace.length <= 8000 ? trace : '')
  body.set('consents', '{}')
  body.set('entities', '[]')
  body.set('recaptcha', '')
  body.set('yandexSmartCaptcha', '')
  body.set('security_sign', '')
  body.set('timeZoneOffset', String(new Date().getTimezoneOffset()))
  return body
}

// Central lifecycle hook covers Contact AND cart checkout. Site save must succeed
// first. Call without awaiting it: CRM latency/errors must not hold up success,
// clearing the cart, Telegram delivery, or the customer's navigation.
export async function mirrorSavedInquiry(
  request: InquiryRequest,
  savedRequest: Promise<{ data: InquiryResponse | null }>,
  language = 'ru',
  requestId?: string,
): Promise<boolean> {
  let saved: InquiryResponse | null
  try {
    saved = (await savedRequest).data
  } catch {
    return false // Never create a CRM lead for a failed site order.
  }
  const id = saved?.id
  // Production intentionally returns HTTP 201 with NO body/ID. The fulfilled
  // mutation is the save confirmation; RTK's request ID identifies this submission.
  const submissionId = typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? `inquiry-${id}` : requestId
  if (!submissionId || !request.name.trim() || !request.phone?.trim()) return false
  if (attempted.has(submissionId)) return false
  attempted.add(submissionId)
  // Bound session memory without storing customer details in browser storage.
  if (attempted.size > 500) attempted.delete(attempted.values().next().value!)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      signal: controller.signal,
      body: crmBody(request, saved, language, submissionId),
    })
    const payload = record(await response.json())
    const result = record(payload.result)
    if (!response.ok || payload.error || !result.resultId) throw new Error('CRM rejected the copy')
    if (typeof result.gid === 'string') {
      try { tracker()?.setGid?.(result.gid) } catch { /* optional analytics only */ }
    }
    // Deliberately ignore CRM redirect/refill instructions: our own UI is primary.
    return true
  } catch {
    // Don't log the customer's contact details or retry an ambiguous POST: it
    // may already have created a lead. The complete order remains in our backend.
    console.warn(`[CRM] Copy of submission ${submissionId} was not confirmed; the site inquiry is intact.`)
    return false
  } finally {
    clearTimeout(timeout)
  }
}
