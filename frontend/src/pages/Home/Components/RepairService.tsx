import PageContainer from '@/components/ui/PageContainer'
import leftImg from '@/assets/home/worker1.webp'
import rightImg from '@/assets/home/worker2.webp'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

const RepairService = () => {
  return (
    <section className="py-24 bg-[#F5F7F8]">
      <PageContainer>
        <ScrollReveal>
          <h1 className="font-oswald text-[#0E1621] text-4xl min-[650px]:text-5xl min-[900px]:text-6xl font-bold uppercase mb-4">
            СЕРВИС ПО РЕМОНТУ СТАНКОВ
          </h1>

          <p className="max-w-3xl text-[#4B5563] mb-16 text-sm min-[650px]:text-base">
            Мы создали новый сервис. Наш сайт соединяет владельцев станков и
            инженеров-ремонтников напрямую. Без посредников, без переплат, без ожидания.
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
                  ПЛЮСЫ ДЛЯ ИНЖЕНЕРА-РЕМОНТНИКА
                </h3>
                <StaggerContainer staggerDelay={0.1} className="space-y-4 text-sm">
                  {[
                    'Сам назначаешь цену',
                    'Заявки приходят сразу после регистрации',
                    'Выбирай заказы рядом или по всей стране',
                    'Рейтинг и отзывы повысят твою репутацию',
                  ].map((item, i) => (
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
                  ПЛЮСЫ ДЛЯ ЗАКАЗЧИКА
                </h3>
                <StaggerContainer staggerDelay={0.1} className="space-y-4 text-sm text-gray-200 mb-8">
                  {[
                    'Поиск ремонтников по рейтингу и опыту',
                    'Мгновенная связь и вызов',
                    'Ищите ремонтника рядом, чтобы сэкономить на выезде',
                  ].map((item, i) => (
                    <StaggerItem key={i}>
                      <li className="flex items-start gap-3 list-none">
                        <AddCircleOutlineOutlinedIcon fontSize="small" />
                        <span>{item}</span>
                      </li>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                <button className="border border-white/60 px-8 py-3 uppercase text-sm hover:border-white hover:bg-white/10 transition w-full min-[400px]:w-auto">
                  Перейти на сайт →
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
                    ПЛЮСЫ ДЛЯ ИНЖЕНЕРА-РЕМОНТНИКА
                  </h3>

                  <StaggerContainer staggerDelay={0.1} className="space-y-4 text-sm">
                    {[
                      'Сам назначаешь цену',
                      'Заявки приходят сразу после регистрации',
                      'Выбирай заказы рядом или по всей стране',
                      'Рейтинг и отзывы повысят твою репутацию',
                    ].map((item, i) => (
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
                <div className="w-full min-[650px]:flex-1 px-6 min-[650px]:px-16 py-8 min-[650px]:py-12 text-white flex flex-col justify-between text-end mt-6 min-[650px]:mt-10">
                  <div>
                    <h3 className="font-oswald text-3xl uppercase mb-6 font-bold">
                      ПЛЮСЫ ДЛЯ ЗАКАЗЧИКА
                    </h3>

                    <StaggerContainer
                      staggerDelay={0.1}
                      className="space-y-4 text-sm text-gray-200"
                    >
                      {[
                        'Поиск ремонтников по рейтингу и опыту',
                        'Мгновенная связь и вызов',
                        'Ищите ремонтника рядом, чтобы сэкономить на выезде',
                      ].map((item, i) => (
                        <StaggerItem key={i}>
                          <li className="flex items-center justify-end gap-3 text-right list-none">
                            <AddCircleOutlineOutlinedIcon fontSize="small" />
                            <span className="max-w-md">{item}</span>
                          </li>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>

                  <div className="flex justify-end">
                    <button className="border border-white/60 px-8 py-3 uppercase text-sm hover:border-white hover:bg-white/10 transition">
                      Перейти на сайт →
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