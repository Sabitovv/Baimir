import Hero from './Components/Hero'
import IndustryCatalog from './Components/IndustryCatalog'
import WhyChooseUs from './Components/WhyChooseUs'
import Service from './Components/Service'
import Warehouse from './Components/Warehouse'
import ForClients from './Components/ForClients'
import ReviewsSection from './Components/ReviewsSection'
import ContactForm from './Components/ContactForm'
import RepairService from './Components/RepairService'
import CertificateSection from './Components/CertificatesSection'
import NewsSection from './Components/NewsSection'

const Home = () => (
    <>
        <Hero />
        <IndustryCatalog />
        <WhyChooseUs />
        <Service />
        <Warehouse />
        <ForClients />
        <ReviewsSection />
        <ContactForm />

        <RepairService />

        <CertificateSection/>
        <NewsSection/>
    </>
)

export default Home
