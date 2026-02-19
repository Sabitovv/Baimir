import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import demoImg from '@/assets/img_review.png'

const DemoInnerPage = () => {
  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-16">

        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>
        <section className="max-w-[1000px]">
          <h1 className="font-oswald text-[40px] font-bold uppercase mb-6">
            Работа станков в реальном производстве
          </h1>
          <div className="mb-12">
            <div className="bg-[#E5E5E5] h-[360px] mb-4 rounded-lg overflow-hidden">
              <img
                src={demoImg}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="bg-[#E5E5E5] h-[120px] rounded-lg overflow-hidden"
                >
                  <img
                    src={demoImg}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

          </div>

          <div className="max-w-[860px] space-y-10 text-[#2A2A2A]">

            <div>
              <h2 className="font-oswald text-xl font-bold mb-2">
                Увидеть станок в деле — значит убедиться в его эффективности
              </h2>

              <p className="leading-[1.7] text-[15px]">
                Выбор промышленного станка — это решение, которое влияет
                на всё производство. Мы предлагаем посетить реальные цеха
                наших партнёров.
              </p>
            </div>

            <div>
              <h2 className="font-oswald text-xl font-bold mb-3">
                Зачем это нужно?
              </h2>

              <ul className="list-disc pl-5 space-y-2 text-[15px] leading-[1.7]">

                <li>
                  <b>Работа в реальном режиме.</b> Вы увидите,
                  как станок работает под нагрузкой.
                </li>

                <li>
                  <b>Испытания своим материалом.</b>
                  Привезите собственные заготовки.
                </li>

                <li>
                  <b>Диалог с инженером.</b>
                  Получите ответы на реальные вопросы.
                </li>

                <li>
                  <b>Оценка эффективности.</b>
                  Узнайте скорость, точность, ресурс.
                </li>

                <li>
                  <b>Обоснованный выбор.</b>
                  Решение на фактах, а не рекламе.
                </li>

              </ul>
            </div>

          </div>

        </section>

      </div>

      <div className="mt-24 text-center max-w-[600px] mx-auto">

        <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
          Есть вопросы? Оставьте заявку
        </h2>

        <Contact />

      </div>

    </PageContainer>
  )
}

export default DemoInnerPage
