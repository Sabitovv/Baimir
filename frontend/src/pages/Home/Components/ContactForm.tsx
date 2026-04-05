import { useTranslation } from 'react-i18next'
import ReviewImg from '@/assets/img_review.png'
import Contact from '@/components/common/Contact'
import ScrollReveal from '@/components/animations/ScrollReveal'
import PageContainer from '@/components/ui/PageContainer'
import { EditableImage } from '@/zustand/EditableImage'


const ContactForm = () => {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <section id='contact-section' className="py-16 md:py-20"> 
        <div className="mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-0">

          <ScrollReveal>
            <div className="w-full md:flex-1">
              <h2 className="
                  font-oswald font-semibold uppercase text-[#111111]
                  text-4xl md:text-5xl xl:text-6xl
                  mb-8 md:mb-10
                ">
                {t('home.contact.title')}
              </h2>
              <Contact />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="hidden md:flex md:flex-none md:w-[520px] items-center justify-center">
              <EditableImage
                imageKey="home_contact_review_image"
                fallbackSrc={ReviewImg}
                alt="review"
                className="w-full h-auto object-contain"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageContainer>
  )
}

export default ContactForm
