import { useTranslation } from 'react-i18next'
import ReviewImg from '@/assets/img_review.png'
import Contact from '@/components/common/Contact'


const ContactForm = () => {
  const { t } = useTranslation()

  return (
    <section className="py-16 md:py-20 bg-[#F5F5F5]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px] flex justify-between">


        <div>
          <h2 className="
              font-oswald font-semibold uppercase text-[#111111]
              text-4xl md:text-5xl xl:text-6xl
              mb-8 md:mb-10
            ">
            {t('home.contact.title')}
          </h2>
          <Contact/>
        </div>

          <div className="w-full md:w-1/2">
            <img
              src={ReviewImg}
              className="w-full max-w-[520px] mx-auto"
            />
          </div>
      </div>
    </section>
  )
}

export default ContactForm
