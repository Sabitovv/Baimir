export type ProductAvailability = 'IN_STOCK' | 'ON_ORDER' | 'OUT_OF_STOCK' | 'SERVICE'
export type AvailabilityInfo = {
  availability?: ProductAvailability
  deliveryDays?: number | null
  stockQuantityKnown?: boolean
  inStock?: boolean
}

export function availabilityStatus(product: AvailabilityInfo): ProductAvailability {
  if (product.availability && ['IN_STOCK', 'ON_ORDER', 'OUT_OF_STOCK', 'SERVICE'].includes(product.availability)) return product.availability
  return product.inStock === false ? 'OUT_OF_STOCK' : 'IN_STOCK'
}

export function availabilityLabel(product: AvailabilityInfo, language = 'ru'): string {
  const locale = language.toLowerCase().startsWith('en') ? 'en' : /^(kz|kk)/.test(language.toLowerCase()) ? 'kz' : 'ru'
  const labels = {
    ru: { IN_STOCK: 'В наличии', ON_ORDER: 'Под заказ', OUT_OF_STOCK: 'Нет в наличии', SERVICE: 'Услуга' },
    en: { IN_STOCK: 'In stock', ON_ORDER: 'Available to order', OUT_OF_STOCK: 'Out of stock', SERVICE: 'Service' },
    kz: { IN_STOCK: 'Қоймада бар', ON_ORDER: 'Тапсырыс бойынша', OUT_OF_STOCK: 'Қоймада жоқ', SERVICE: 'Қызмет' },
  }
  const status = availabilityStatus(product)
  const days = product.deliveryDays
  return labels[locale][status] + (status === 'ON_ORDER' && typeof days === 'number' && Number.isInteger(days) && days > 0 ? ` (${days} ${locale === 'en' ? 'days' : locale === 'kz' ? 'күн' : 'дн.'})` : '')
}

export function canOrderProduct(product: AvailabilityInfo): boolean {
  return ['IN_STOCK', 'ON_ORDER'].includes(availabilityStatus(product))
}
