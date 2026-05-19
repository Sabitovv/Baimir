import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import BgService from '@/assets/home/bg_service.webp'
import { SvgIcon, type SvgIconProps } from '@mui/material'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { EditableImage } from '@/zustand/EditableImage'

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

      <circle cx="12" cy="12" r="10" fill="#F58322" />
      <path
        d="M10.1 13.9L7.7 11.5L6.3 12.9L10.1 16.7L18 8.8L16.6 7.4Z"
        fill="#fff"
      />
    </SvgIcon>
  );


  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <EditableImage
        imageKey="home_service_background"
        fallbackSrc={BgService}
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div className="relative z-10">
        <PageContainer>
          <div className="mb-2 md:mb-10">
          <ScrollReveal>
            <h1 className="font-oswald text-[32px] font-semibold uppercase leading-[1.06] text-white md:text-5xl xl:text-6xl">
              {t('home.service.title')}
            </h1>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.1} className="mt-7 grid grid-cols-1 gap-x-16 gap-y-3 md:mt-14 md:grid-cols-2 md:gap-y-5">
            {services.map((key) => (
              <StaggerItem key={key}>
                <div className="flex items-center gap-3 rounded-lg bg-black/20 px-3 py-2.5 backdrop-blur-[1px] md:bg-transparent md:px-0 md:py-0">
                  <CheckCircleIconCustom className="!text-[1.5rem] md:!text-[2.2rem]" />
                  <p className="font-oswald text-[15px] font-bold leading-5 text-white md:text-xl">
                    {t(key)}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          </div>
        </PageContainer>
      </div>
    </section>
  )
}

export default Service
