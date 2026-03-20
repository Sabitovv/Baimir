import { useEffect, useState } from 'react'
import Hero from './Components/Hero'
import IndustryCatalog from './Components/IndustryCatalog'
import WhyChooseUs from './Components/WhyChooseUs'
import Service from './Components/Service'
import Warehouse from './Components/Warehouse'
import ForClients from './Components/ForClients'
import ReviewsSection from './Components/ReviewsSection'
import ReviewForm from './Components/ReviewForm'
import ContactForm from './Components/ContactForm'
import RepairService from './Components/RepairService'
import CertificateSection from './Components/CertificatesSection'
import NewsSection from './Components/NewsSection'

const Home = () => {
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
            <IndustryCatalog />
            <WhyChooseUs />
            <Service />
            <Warehouse />
            <ForClients />
            <ReviewsSection onOpenReviewModal={() => setIsReviewModalOpen(true)} />

            <RepairService />
            <ContactForm />

            <CertificateSection/>
            <NewsSection/>

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
                        aria-label="Форма отзыва"
                        className={`relative w-full max-w-5xl max-h-[92vh] overflow-y-auto transform-gpu transition-all duration-300 ease-out will-change-transform ${
                            isReviewModalOpen
                                ? 'opacity-100 translate-y-0 scale-100'
                                : 'opacity-0 translate-y-8 scale-[0.98]'
                        }`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label="Закрыть"
                            onClick={() => setIsReviewModalOpen(false)}
                            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white text-[#111111] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition"
                        >
                            ×
                        </button>

                        <ReviewForm isModal onSuccess={() => setIsReviewModalOpen(false)} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home
