import { lazy, Suspense, useEffect, useState } from 'react'
import Hero from './Components/Hero'
import DeferredSection from '@/components/common/DeferredSection'
import PageContainer from '@/components/ui/PageContainer'
import ProductCollectionRenderer from '@/components/collections/ProductCollectionRenderer'
import { useProductCollectionPlacement } from '@/features/productCollections/useProductCollectionPlacement'
import { useTranslation } from 'react-i18next'

// const IndustryCatalog = lazy(() => import('./Components/IndustryCatalog'))
const WhyChooseUs = lazy(() => import('./Components/WhyChooseUs'))
const Service = lazy(() => import('./Components/Service'))
const Warehouse = lazy(() => import('./Components/Warehouse'))
const ForClients = lazy(() => import('./Components/ForClients'))
// const ReviewsSection = lazy(() => import('./Components/ReviewsSection'))
const ReviewForm = lazy(() => import('./Components/ReviewForm'))
// const RepairService = lazy(() => import('./Components/RepairService'))
// const CertificateSection = lazy(() => import('./Components/CertificatesSection'))
// const NewsSection = lazy(() => import('./Components/NewsSection'))
const ContactForm = lazy(() => import('./Components/ContactForm'))

const SectionFallback = ({ heightClassName }: { heightClassName: string }) => (
    <div className={`${heightClassName} animate-pulse bg-[#F7F7F7]`} />
)

type OptionalCollectionSectionProps = {
    placement: 'HOME_HERO_COLLECTION' | 'HOME_PERSONALIZED_RECOMMENDATIONS'
    containerClassName: string
    variant?: 'hero' | 'recommendations'
    title?: string
}

const OptionalCollectionSection = ({
    placement,
    containerClassName,
    variant = 'hero',
    title,
}: OptionalCollectionSectionProps) => {
    const { i18n } = useTranslation()
    const { collections, isLoading, isFetching, isError } = useProductCollectionPlacement(
        placement,
        { lang: i18n.language, maxItems: 12 },
    )

    const hasVisibleCollections = collections.some((collection) => collection.products.length > 0)
    const shouldRenderSection = isLoading || isFetching || isError || hasVisibleCollections

    if (!shouldRenderSection) return null

    return (
        <PageContainer className={containerClassName}>
            <ProductCollectionRenderer
                placement={placement}
                layout="carousel"
                variant={variant}
                title={title}
                maxItems={12}
                skeletonCount={4}
                collectionsOverride={collections}
                isLoadingOverride={isLoading}
                isFetchingOverride={isFetching}
                isErrorOverride={isError}
            />
        </PageContainer>
    )
}

const Home = () => {
    const { t } = useTranslation()
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

    useEffect(() => {
        if (!isReviewModalOpen) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsReviewModalOpen(false)
            }
        }

        window.addEventListener('keydown', onKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isReviewModalOpen])

    return (
        <>
            <Hero />
            <OptionalCollectionSection
                placement="HOME_HERO_COLLECTION"
                containerClassName="py-5 md:py-8"
            />
            <OptionalCollectionSection
                placement="HOME_PERSONALIZED_RECOMMENDATIONS"
                containerClassName="pb-5 md:pb-10"
                variant="recommendations"
                title={t('home.personalizedRecommendations')}
            />
            {/* Секция "Лидируем в индустрии" временно скрыта.
                Документ описывает на её месте "Блок категорий оборудования" (6 категорий Bodor:
                лист, труба, комбинированные, профиль, сварка, автоматизация), но IndustryCatalog
                берёт карточки из общего каталога Baytech (useGetCategoriesTreeQuery) — первые
                4 корневые категории там: Металлообработка, Камнеобработка, Компрессоры,
                Деревообработка. Раскомментировать можно только после перевода блока на
                статический список из документа.
            <DeferredSection placeholderClassName="min-h-[560px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[560px]" />}>
                    <IndustryCatalog />
                </Suspense>
            </DeferredSection>
            */}

            {/* Порядок блоков соответствует документу «Готовый текст главной страницы»:
                первый экран → строка доверия → в наличии → почему из Китая → сервис → заявка */}
            <DeferredSection placeholderClassName="min-h-[380px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[380px]" />}>
                    <ForClients />
                </Suspense>
            </DeferredSection>

            <DeferredSection placeholderClassName="min-h-[520px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[520px]" />}>
                    <Warehouse />
                </Suspense>
            </DeferredSection>

            <DeferredSection placeholderClassName="min-h-[520px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[520px]" />}>
                    <WhyChooseUs />
                </Suspense>
            </DeferredSection>

            <DeferredSection placeholderClassName="min-h-[360px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[360px]" />}>
                    <Service />
                </Suspense>
            </DeferredSection>

            {/* Секция "Отзывы наших клиентов" временно скрыта
            <DeferredSection placeholderClassName="min-h-[460px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[460px]" />}>
                    <ReviewsSection onOpenReviewModal={() => setIsReviewModalOpen(true)} />
                </Suspense>
            </DeferredSection>
            */}

            {/* Секция "Сервис по ремонту станков" временно скрыта
            <DeferredSection placeholderClassName="min-h-[520px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[520px]" />}>
                    <RepairService />
                </Suspense>
            </DeferredSection>
            */}

            <DeferredSection placeholderClassName="min-h-[520px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[520px]" />}>
                    <ContactForm />
                </Suspense>
            </DeferredSection>

            {/* Секция "Сертификаты" временно скрыта
            <DeferredSection placeholderClassName="min-h-[420px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[420px]" />}>
                    <CertificateSection />
                </Suspense>
            </DeferredSection>
            */}

            {/* Секция "Новости" временно скрыта
            <DeferredSection placeholderClassName="min-h-[420px]">
                <Suspense fallback={<SectionFallback heightClassName="min-h-[420px]" />}>
                    <NewsSection />
                </Suspense>
            </DeferredSection>
            */}

            <div
                className={`fixed inset-0 z-[130] transition-opacity duration-300 ease-out ${
                    isReviewModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                aria-hidden={!isReviewModalOpen}
            >
                <div
                    className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
                        isReviewModalOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setIsReviewModalOpen(false)}
                />

                <div className="absolute inset-0 overflow-y-auto p-3 md:p-6 flex items-start md:items-center justify-center">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('home.reviews.formAriaLabel')}
                        className={`relative w-full max-w-5xl max-h-[92vh] overflow-y-auto transform-gpu transition-all duration-300 ease-out will-change-transform ${
                            isReviewModalOpen
                                ? 'opacity-100 translate-y-0 scale-100'
                                : 'opacity-0 translate-y-8 scale-[0.98]'
                        }`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label={t('common.close')}
                            onClick={() => setIsReviewModalOpen(false)}
                            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white text-[#171B25] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition"
                        >
                            ×
                        </button>

                        <Suspense fallback={<div className="min-h-[280px] bg-white" />}>
                            <ReviewForm isModal onSuccess={() => setIsReviewModalOpen(false)} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home
