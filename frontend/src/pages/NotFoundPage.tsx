import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return <PageContainer><section className="px-4 py-20 text-center">
    <p className="text-sm font-semibold text-gray-500">404</p>
    <h1 className="mt-3 text-3xl font-bold text-gray-900">{t('notFound.title', { defaultValue: 'Страница не найдена' })}</h1>
    <Link to="/catalog" className="mt-6 inline-block rounded-md bg-[#F58322] px-5 py-3 font-semibold text-white">{t('notFound.catalog', { defaultValue: 'Перейти в каталог' })}</Link>
  </section></PageContainer>
}
