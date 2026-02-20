import PageContainer from '@/components/ui/PageContainer'
import leftImg from '@/assets/home/worker1.webp'
import rightImg from '@/assets/home/worker2.webp'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'

const RepairService = () => {
  return (
    <section className="py-24 bg-[#F5F7F8]">
      <PageContainer>
        <h1 className="font-oswald text-[#0E1621] text-6xl font-bold uppercase mb-4">
          СЕРВИС ПО РЕМОНТУ СТАНКОВ
        </h1>

        <p className="max-w-3xl text-[#4B5563] mb-16">
          Мы создали новый сервис. Наш сайт соединяет владельцев станков и
          инженеров-ремонтников напрямую. Без посредников, без переплат, без ожидания.
        </p>

        <div className="relative w-full min-h-[420px] rounded-xl overflow-hidden shadow-xl bg-[#EA571E]">

          <img
            src={leftImg}
            alt=""
            className="absolute left-1/2 top-1/2 w-[360px] h-[300px] object-cover
                      -translate-x-1/2 -translate-y-1/2 z-0"
          />

          <div
            className="absolute top-0 bottom-0 left-1/2 w-[60%] bg-[#233337]
                        -skew-x-[10deg] origin-left overflow-hidden z-10"
          >
            <img
              src={rightImg}
              alt=""
              className="absolute left-0 top-1/2 w-[360px] h-[300px] object-cover
                          skew-x-[10deg] -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <div className="relative z-20 flex w-full h-full justify-between">

            <div className="w-[40%] px-12 py-12 text-[#233337] mt-10">
              <h3 className="font-oswald text-3xl uppercase mb-6 font-bold">
                ПЛЮСЫ ДЛЯ ИНЖЕНЕРА-РЕМОНТНИКА
              </h3>

              <ul className="space-y-4 text-sm">
                {[
                  'Сам назначаешь цену',
                  'Заявки приходят сразу после регистрации',
                  'Выбирай заказы рядом или по всей стране',
                  'Рейтинг и отзывы повысят твою репутацию',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AddCircleOutlineOutlinedIcon fontSize="small" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 px-16 py-12 text-white flex flex-col justify-between text-end mt-10">
              <div>
                <h3 className="font-oswald text-3xl uppercase mb-6 font-bold">
                  ПЛЮСЫ ДЛЯ ЗАКАЗЧИКА
                </h3>

              <ul className="space-y-4 text-sm text-gray-200 ">
                {[
                  'Поиск ремонтников по рейтингу и опыту',
                  'Мгновенная связь и вызов',
                  'Ищите ремонтника рядом, чтобы сэкономить на выезде',
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-end gap-3 text-right"
                  >
                    <AddCircleOutlineOutlinedIcon fontSize="small" />
                    <span className="max-w-md">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              </div>

              <div className="flex justify-end">
                <button className="border border-white/60 px-8 py-3 uppercase text-sm hover:border-white hover:bg-white/10 transition">
                  Перейти на сайт →
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}

export default RepairService
