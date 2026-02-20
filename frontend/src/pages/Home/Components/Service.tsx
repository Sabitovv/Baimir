import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import BgService from '@/assets/home/bg_service.webp'
import { SvgIcon, type SvgIconProps } from '@mui/material'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const Service = () => {
  const { t } = useTranslation()

  const services: string[] = [
    'home.service.items.preparation',
    'home.service.items.visit',
    'home.service.items.setup',
    'home.service.items.repair',
    'home.service.items.training',
    'home.service.items.support'
  ]

  const CheckCircleIconCustom = (props: SvgIconProps) => (
    <SvgIcon {...props} viewBox="0 0 24 24">

      <circle cx="12" cy="12" r="10" fill="#EA571E" />
      <path
        d="M10.1 13.9L7.7 11.5L6.3 12.9L10.1 16.7L18 8.8L16.6 7.4Z"
        fill="#fff"
      />
    </SvgIcon>
  );


  return (
    <section
      className="py-20 bg-cover bg-center"
      style={{ backgroundImage: `url(${BgService})` }}
    >
      <PageContainer>
        <div className="mb-10">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-oswald font-semibold uppercase text-white">
              {t('home.service.title')}
            </h1>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.1} className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-16">
            {services.map((key) => (
              <StaggerItem key={key}>
                <div className="flex gap-4 items-center">
                  <CheckCircleIconCustom fontSize="large" />
                  <p className="font-oswald font-bold text-base md:text-xl  text-white">
                    {t(key)}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </PageContainer>
    </section>
  )
}

export default Service
