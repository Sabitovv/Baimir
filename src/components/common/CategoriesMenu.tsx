import { useState } from 'react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import img1 from '@/assets/lazerStanok.png'

type Category = {
  title: string
  items?: string[]
}

const categories: Category[] = [
  {
    title: 'Металлообработка',
    items: [
      'Станки для раскроя металла',
      'Станки для вентиляции',
      'Гильотинные ножницы',
      'Листогибочные станки',
      'Станки для производства сеток',
      'Вальцовочные станки',
      'Зиговочные станки',
      'Трубогибы, профилегибочные станки',
      'Штамповочные, высечные и пробивные станки',
      'Токарные, фрезерные, сверлильные станки',
      'Оборудование обработки рулонной стали',
      'Сварочное оборудование'
    ]
  },
  { title: 'Компрессоры' },
  { title: 'Деревообработка' },
  { title: 'Камнеобработка' },
  { title: 'Переработка отходов' },
  { title: 'Электроника' },
  { title: 'Прочее оборудование и инструменты' },
  { title: 'Запчасти и комплектующие' },
  { title: 'Остальные товары' }
]

const CategoriesMenu = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <aside className="w-[300px]">

      <div className='bg-[#F5F5F5] rounded-md p-4 mb-5'>
        {categories.map((cat, index) => {
          const isOpen = openIndex === index

          return (
            <div key={index} className="border-b last:border-b-0">

              <button
                onClick={() =>
                  setOpenIndex(isOpen ? null : index)
                }
                className="w-full flex items-center justify-between py-3 text-left font-bold text-sm"
              >
                {cat.title}
                <PlayArrowIcon
                  className={`transition rotate-90`}
                  fontSize="small"
                />
              </button>

              {cat.items && isOpen && (
                <ul className="pl-3 pb-3 space-y-2 text-sm text-gray-600">
                  {cat.items.map((item, i) => (
                    <li
                      key={i}
                      className="hover:text-[#F05023] cursor-pointer transition"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
      <div className="bg-white p-4 shadow-sm">
        <img src={img1} className="mb-3" />
        <p className="text-xs text-gray-600 leading-relaxed">
          Милый щенок настолько сильно похож на медвежонка, что многие уверены, что
          перед ними — житель леса.
        </p>
        <button className="mt-4 w-full bg-[#F05023] text-white text-xs py-2 uppercase font-bold">
          Все записи блога
        </button>
      </div>


    </aside>
  )
}

export default CategoriesMenu
