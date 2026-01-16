import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import Contact from '@/components/common/Contact'
import demoImg from '@/assets/img_review.png'

const DemoPage = () => {
  return (
    <PageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 mt-16">

        {/* ===== SIDEBAR ===== */}
        <aside className="hidden lg:block">
          <CategoriesMenu />
        </aside>

        {/* ===== CONTENT ===== */}
        <section className="max-w-[1000px]">

          {/* TITLE */}
          <h1 className="font-oswald text-[40px] font-bold uppercase mb-2">
            Посетите наши демозалы
          </h1>

          <h3 className="font-oswald text-xl font-semibold mb-4">
            Подберем станки под ваш бизнес
          </h3>

          <p className="text-[#3A3A3A] max-w-[760px] leading-[1.7] mb-10">
            Ждём вас в наших демозалах, где мы покажем в работе любое оборудование,
            выполним тестовые детали и операции под нужды вашего бизнеса.
          </p>

          {/* ===== DEMO GRID ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">

            {[1,2,3,4,5,6].map(i => (

              <div
                key={i}
                className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={demoImg}
                  className="h-[200px] w-full object-cover"
                />

                <div className="p-4">
                  <p className="text-sm font-semibold text-center">
                    Демозал таких-то станков чего-то
                  </p>
                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

      {/* ===== CTA FORM ===== */}
      <div className="mt-24 text-center max-w-[600px] mx-auto">

        <h2 className="font-oswald text-[42px] font-bold uppercase mb-8">
          Оставьте заявку
        </h2>

        <Contact />

      </div>

    </PageContainer>
  )
}

export default DemoPage
