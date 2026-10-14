import { useTranslation } from 'react-i18next'
import { availabilityLabel, availabilityStatus } from '@/utils/productAvailability'
import type { AvailabilityInfo } from '@/utils/productAvailability'

export default function ProductAvailabilityBadge({ product, className = '' }: { product: AvailabilityInfo; className?: string }) {
  const { t, i18n } = useTranslation()
  const status = availabilityStatus(product)
  const keys = { IN_STOCK: 'commonCatalog.inStock', ON_ORDER: 'commonCatalog.onOrder', OUT_OF_STOCK: 'commonCatalog.outOfStock', SERVICE: 'commonCatalog.service' }
  const colors = { IN_STOCK: 'bg-green-50 text-green-700', ON_ORDER: 'bg-blue-50 text-blue-700', OUT_OF_STOCK: 'bg-gray-100 text-gray-600', SERVICE: 'bg-blue-50 text-blue-700' }
  const label = status === 'ON_ORDER' ? availabilityLabel(product, i18n.language) : t(keys[status], { defaultValue: availabilityLabel(product, i18n.language) })
  return <span className={`inline-flex items-center rounded-full font-semibold ${colors[status]} ${className}`}>{label}</span>
}
