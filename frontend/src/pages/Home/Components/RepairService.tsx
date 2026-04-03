import PageContainer from '@/components/ui/PageContainer'
import leftImg from '@/assets/home/worker1.webp'
import rightImg from '@/assets/home/worker2.webp'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'
import { useTranslation } from 'react-i18next'

const RepairService = () => {
  const { t } = useTranslation()

  const engineerBenefits = [
    t('home.repair.engineer.text.line1'),
    t('home.repair.engineer.text.line2'),
    t('home.repair.engineer.text.line3'),
    t('home.repair.engineer.text.line4'),
  ]

  const clientBenefits = [
    t('home.repair.client.text.line1'),
    t('home.repair.client.text.line2'),
    t('home.repair.client.text.line3'),
  ]

  return (
    <section className="py-24 bg-[#F5F7F8]">
      <PageContainer>
        <ScrollReveal>
          <h1 className="font-oswald text-[#0E1621] text-4xl min-[650px]:text-5xl min-[900px]:text-6xl font-bold uppercase mb-4">
            {t('home.repair.title')}
          </h1>

          <p className="max-w-3xl text-[#4B5563] mb-16 text-sm min-[650px]:text-base">
            {t('home.repair.description')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {/* Mobile: stacked layout, Tablet+: diagonal split layout */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-xl">

            {/* ── MOBILE LAYOUT (< 650px) ── stacked cards */}
            <div className="block min-[650px]:hidden">
              {/* Orange card – engineer */}
              <div className="bg-[#F58322] px-6 py-10 text-[#233337]">
                <h3 className="font-oswald text-2xl uppercase mb-6 font-bold">
                  {t('home.repair.engineer.title')}
                </h3>
                <StaggerContainer staggerDelay={0.1} className="space-y-4 text-sm">
                  {engineerBenefits.map((item, i) => (
                    <StaggerItem key={i}>
                      <li className="flex items-start gap-3 list-none">
                        <AddCircleOutlineOutlinedIcon fontSize="small" />
                        <span>{item}</span>
                      </li>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>

              {/* Dark card – client */}
              <div className="bg-[#233337] px-6 py-10 text-white">
                <h3 className="font-oswald text-2xl uppercase mb-6 font-bold">
                  {t('home.repair.client.title')}
                </h3>
                <StaggerContainer staggerDelay={0.1} className="space-y-4 text-sm text-gray-200 mb-8">
                  {clientBenefits.map((item, i) => (
                    <StaggerItem key={i}>
                      <li className="flex items-start gap-3 list-none">
                        <AddCircleOutlineOutlinedIcon fontSize="small" />
                        <span>{item}</span>
                      </li>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                <button className="border border-white/60 px-8 py-3 uppercase text-sm hover:border-white hover:bg-white/10 transition w-full min-[400px]:w-auto">
                  {t('home.repair.cta')}
                </button>
              </div>
            </div>

            {/* ── DESKTOP LAYOUT (≥ 650px) ── diagonal split */}
            <div className="hidden min-[650px]:block relative min-h-[420px] bg-[#F58322]">

              {/* Left worker image — original positioning */}
              <img
                src={leftImg}
                alt=""
                className="hidden min-[1000px]:block absolute left-1/2 top-1/2 w-[360px] h-[300px] object-cover
                           -translate-x-1/2 -translate-y-1/2 z-0"
              />

              {/* Diagonal dark panel */}
              <div
                className="absolute top-0 bottom-0 left-1/2 w-[60%]
                           bg-[#233337] -skew-x-[10deg] origin-left overflow-hidden z-10"
              >
                {/* Right worker image — original positioning */}
                <img
                  src={rightImg}
                  alt=""
                  className="hidden min-[1000px]:block absolute left-0 top-1/2 w-[360px] h-[300px] object-cover
                             skew-x-[10deg] -translate-x-1/2 -translate-y-1/2"
                />
              </div>

              {/* Content row — original layout */}
              <div className="relative z-20 block min-[650px]:flex w-full h-full min-[650px]:justify-between">

                {/* Left column – engineer */}
                <div className="w-full min-[650px]:w-[40%] px-6 min-[650px]:px-12 py-8 min-[650px]:py-12 text-[#233337] mt-6 min-[650px]:mt-10">
                  <h3 className="font-oswald text-3xl uppercase mb-6 font-bold">
                    {t('home.repair.engineer.title')}
                  </h3>

                  <StaggerContainer staggerDelay={0.1} className="space-y-4 text-sm">
                    {engineerBenefits.map((item, i) => (
                      <StaggerItem key={i}>
                        <li className="flex items-start gap-3 list-none">
                          <AddCircleOutlineOutlinedIcon fontSize="small" />
                          <span>{item}</span>
                        </li>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>

                {/* Right column – client */}
                <div className="w-full min-[650px]:flex-1 px-6 min-[650px]:px-10 min-[900px]:px-16 py-8 min-[650px]:py-12 text-white flex flex-col items-end text-end mt-6 min-[650px]:mt-10">
                  <div>
                    <h3 className="font-oswald text-2xl min-[1000px]:text-3xl uppercase mb-6 font-bold">
                      {t('home.repair.client.title')}
                    </h3>

                    <StaggerContainer
                      staggerDelay={0.1}
                      className="space-y-4 text-xs min-[900px]:text-sm text-gray-200 flex flex-col items-end"
                    >
                      {clientBenefits.map((item, i) => (
                        <StaggerItem key={i}>
                          <li className="flex items-start justify-end gap-4 text-right list-none">
                            <AddCircleOutlineOutlinedIcon fontSize="small" />
                            <span className="max-w-[220px] min-[900px]:max-w-[300px] min-[1100px]:max-w-md">{item}</span>
                          </li>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>

                  <div className="mt-8 min-[900px]:mt-10 flex justify-end">
                    <button className="border border-white/60 px-8 py-3 uppercase text-sm whitespace-nowrap hover:border-white hover:bg-white/10 transition">
                      {t('home.repair.cta')}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </ScrollReveal>
      </PageContainer>
    </section>
  )
}

export default RepairService
