import { useState } from 'react'
import PageContainer from '@/components/ui/PageContainer'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs' // Используем ваш компонент
import prodImg from '@/assets/catalog/Stanok.png' // Ваша картинка
import track from '@/assets/catalog/icons/fa_truck.svg'
import delivery from '@/assets/catalog/icons/time.svg'
import calendar from '@/assets/catalog/icons/calendar.svg'
import address from '@/assets/catalog/icons/addres.svg'

// --- ТИПЫ ДАННЫХ ---
// (В реальном проекте это придет с бэкенда)

const productData = {
  id: 1,
  title: 'ЛАЗЕРНЫЙ СТАНОК ДЛЯ РЕЗКИ МЕТ.ЛИСТОВ И ТРУБ A3T6 - 3000W BODOR',
  price: '10 500 000 ₸',
  sku: '10150570',
  inStock: true,
  brand: 'Bodor',
  country: 'Китай',
  warranty: '12 мес.',
  power: '3 кВт',
  images: [prodImg, prodImg, prodImg],
  
  // Характеристики (левая колонка)
  // isSubItem - добавляет отступ, isHeader - делает жирным без значения
  specs: [
    { name: 'Толщина резки:', value: '', isHeader: true },
    { name: 'низкоуглеродистая сталь', value: 'до 20 мм', isSubItem: true },
    { name: 'нержавеющая сталь', value: 'до 10 мм', isSubItem: true },
    { name: 'алюминий', value: 'до 10 мм', isSubItem: true },
    { name: 'латунь', value: 'до 6 мм', isSubItem: true },
    { name: 'Модель', value: 'A3T6-3000W' },
    { name: 'Макс. рабочая поверхность', value: '1500*3000 мм' },
    { name: 'Марка лазерного источника', value: 'BodorPower' },
    { name: 'Мощность лазерного источника', value: '3000 Вт (3 кВт)' },
    { name: 'Длина волны лазера', value: '1064 нм' },
    { name: 'Макс. скорость движения', value: '110 м/мин' },
    { name: 'Ход по оси Z', value: '315 мм' },
    { name: 'Точность позиционирования', value: '±0.05 мм' },
    { name: 'Точность репозиции', value: '±0.03 мм' },
    { name: 'Макс. нагрузка на раб. платформу', value: '911 кг' },
    { name: 'Размер трубы:', value: '', isHeader: true },
    { name: 'Круглые трубы', value: '8-230 мм', isSubItem: true },
    { name: 'Квадратные трубы', value: '20*20 - 160*160 мм', isSubItem: true }, // исправил по логике, на скрине 20*20 - 8*230 (видимо опечатка в оригинале, оставил как есть)
    { name: 'Максимальная длина труб', value: '6 м' },
    { name: 'Зажимной патрон', value: 'электрическо-сервомоторный' },
    { name: 'Габаритные размеры (Д*Ш*В)', value: '8865*3908*2043 мм' },
  ],

  // Особенности (правая колонка)
  features: [
    'Технология скоростной перфорации Bodor',
    'Библиотека по высокоскоростной резке',
    'Автоматическая регулировка давления режущего газа',
    'Автофокус лазерной головки',
    'Автоматический контроль труб',
    'База данных по технологии лазерной резки',
    'Активная функция предотвращения столкновений',
    'Интеллектуальная защита от дрожания края листа',
    'Угловая сталь, швеллерная сталь резка',
    'База данных по резке высокого качества',
    'Антишлаковая защита',
    'Программное обеспечение интеллектуального проектирования',
    'Газосберегающее сопло с постоянным потоком',
    'Самосмазка направляющих',
    'Интеллектуальное напоминание о техническом обслуживании',
    'Интернет-соединение WIFI',
    'Облачный сервис Bodor'
  ],

  // Комплектация
  equipment: [
    'Стальная сварная станина - «BODOR» (Китай)',
    'Литой алюминиевый портал - «BODOR» (Китай)',
    'Лазер (Источник) - «BodorPower» (Китай)',
    'Режущая голова - BODOR GENIUS «BODOR» (Китай)',
    'Серво привода - «BODOR» (Китай)',
    'Труборез - «Bodor», (Китай)',
    'Направляющие - «Bodor» (Китай)',
    'Зубчатые рейки - «Bodor» (Китай)',
    'Система автоматической смазки - Bodor (Китай)',
    'Водяной охладитель CWFL (Китай)',
    'Пульт дистанционного управления - «BODOR» (Китай)',
    'Управление BodorThinker - «BODOR» (Китай)',
    'Функция определения положения листа - «BODOR» (Китай)'
  ],
  
  // Данные для таблицы моделей
  models: [
    { name: ['A3T6-1500W', 'A3T6-3000W', 'A3T6-6000W'], area: '3048mm * 1524mm', power: '±0.05mm/m', repo: '±0.03mm', speed: '100m/min', acc: '1.5G' },
    { name: ['A4T6-1500W', 'A4T6-3000W', 'A4T6-6000W'], area: '4000mm * 1524mm', power: '±0.05mm/m', repo: '±0.03mm', speed: '100m/min', acc: '1.5G' },
    { name: ['A6T6-1500W', 'A6T6-3000W', 'A6T6-6000W'], area: '6100mm * 1524mm', power: '±0.05mm/m', repo: '±0.03mm', speed: '100m/min', acc: '1.5G' },
    { name: ['A3T6 Plus-1500W', 'A3T6 Plus-3000W', 'A3T6 Plus-6000W'], area: '6100mm * 2500mm', power: '±0.05mm/m', repo: '±0.03mm', speed: '100m/min', acc: '1.5G' },
  ]
}

const ProductPage = () => {
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'order'>('desc')

  return (
    <PageContainer>
      <div className="px-4 md:px-6 lg:px-0 mb-20 font-[Manrope]">
        
        {/* ХЛЕБНЫЕ КРОШКИ */}
        <div className="my-4 text-sm text-gray-500">
            <Breadcrumbs />
        </div>

        {/* ЗАГОЛОВОК ТОВАРА */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-gray-900 mb-8 font-oswald leading-tight">
          {productData.title}
        </h1>

        {/* --- ВЕРХНЯЯ ЧАСТЬ (Галерея + Инфо) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          
          {/* ЛЕВАЯ КОЛОНКА: Галерея */}
          <div>
            {/* Главное фото */}
            <div className="rounded-lg overflow-hidden mb-4 flex relative">
              <img 
                src={productData.images[activeImage]} 
                className="object-contain w-full h-full"
              />
            </div>
            {/* Миниатюры */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {productData.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 border-2 rounded-md overflow-hidden bg-gray-50
                    ${activeImage === idx ? 'border-[#F05023]' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Цена и Краткие данные */}
          <div>
            <div >
              
              <div className="flex border-b items-center gap-5 border-gray-100">
                <div className='bg-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm w-2/3'>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{productData.price}</div>
                        {productData.inStock && (
                            <span className="text-green-600 text-sm font-medium flex items-center gap-1 mb-5">
                                В наличии
                            </span>
                        )}
                    </div>
                    <button className="w-full px-10 py-3 bg-[#F05023] text-white font-bold uppercase hover:bg-[#d64018] transition shadow-md hover:shadow-lg">
                        Купить
                    </button>
                </div>
                <div className="space-y-3 text-sm border-t border-gray-100 pt-6">
                    <div className="flex justify-between gap-5">
                        <span className="text-gray-500">Код:</span>
                        <span className="font-medium text-gray-900">{10150570}</span>
                    </div>
                    <div className="flex justify-between gap-5">
                        <span className="text-gray-500">Страна производитель:</span>
                        <span className="font-medium text-gray-900">{productData.country}</span>
                    </div>
                    <div className="flex justify-between gap-5">
                        <span className="text-gray-500">Производитель:</span>
                        <span className="font-medium text-gray-900">{productData.brand}</span>
                    </div>
                    <div className="flex justify-between gap-5">
                        <span className="text-gray-500">Гарантийный срок:</span>
                        <span className="font-medium text-gray-900">{productData.warranty}</span>
                    </div>
                    <div className="flex justify-between gap-5">
                        <span className="text-gray-500">Мощность:</span>
                        <span className="font-medium text-gray-900">{productData.power}</span>
                    </div>
                </div>
              </div>


              {/* Краткие характеристики (Справа от картинки) */}

              {/* Условия (Иконки) */}
              <div className="mt-8 space-y-3">
                 <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">
                    <h5 className="text-[#EA571E] font-bold mb-1 text-xs uppercase">Условия возврата</h5>
                    <div className='flex justify-between'>
                        <p>
                            Возврат товара в течении 14 дней по договоренности. 
                        </p>
                        <a href="#" className="font-bold hover:underline">Подробности →</a>
                    </div>
                 </div>
                 
                 <div className="space-y-2 text-xs font-bold text-gray-500 uppercase mt-4">
                    <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                       <span className="text-[#F05023]"><img src={track} alt="" className="w-4 h-4" /></span> Бесплатная доставка
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                       <span className="text-[#F05023]"><img src={delivery} alt="" className="w-4 h-4" /></span> Условия оплаты и доставки
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                       <span className="text-[#F05023]"><img src={calendar} alt="" className="w-4 h-4" /></span> График работы
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                       <span className="text-[#F05023]"><img src={address} alt="" className="w-4 h-4" /></span> Адрес магазина
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ВКЛАДКИ (TABS) --- */}
        <div className="border-b border-gray-200 mb-8">
           <div className="flex gap-8 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('desc')}
                className={`pb-4 px-2 font-bold uppercase text-sm transition whitespace-nowrap border-b-2 
                  ${activeTab === 'desc' ? 'border-[#F05023] text-[#F05023]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                Описание
              </button>
              <button 
                onClick={() => setActiveTab('specs')}
                className={`pb-4 px-2 font-bold uppercase text-sm transition whitespace-nowrap border-b-2 
                  ${activeTab === 'specs' ? 'border-[#F05023] text-[#F05023]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                Спецификация
              </button>
              <button 
                onClick={() => setActiveTab('order')}
                className={`pb-4 px-2 font-bold uppercase text-sm transition whitespace-nowrap border-b-2 
                  ${activeTab === 'order' ? 'border-[#F05023] text-[#F05023]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                Информация для заказа
              </button>
           </div>
        </div>

        {activeTab === 'desc' && (
            <div className="animate-fade-in text-gray-800 font-[Manrope]">
               
               {/* Вступительный текст */}
               <div className="mb-8">
                 <h3 className="font-bold text-lg mb-2">Лазерный станок начального уровня для резки листового металла и труб.</h3>
                 <p className="text-sm font-medium">
                   Один станок для двух целей. Серия АТ режет как металлические листы, так и металлические трубы.
                 </p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 align-top">
                  
                  {/* Левая колонка: ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                  <div>
                    <h4 className="font-bold uppercase mb-3 text-sm tracking-wide text-gray-800">Технические характеристики:</h4>
                    <div className="text-[13px] leading-relaxed border-t border-gray-100">
                       {productData.specs.map((item, idx) => (
                         <div 
                            key={idx} 
                            className={`flex justify-between py-1 px-3 ${idx % 2 !== 0 ? 'bg-white' : 'bg-[#F5F7FA]'}`}
                         >
                            {/* Если это заголовок группы (Толщина резки, Размер трубы) */}
                            {item.isHeader ? (
                               <span className="font-bold text-gray-800">• {item.name}</span>
                            ) : (
                               <>
                                 <span className={`text-black ${item.isSubItem ? 'pl-5 relative' : ''}`}>
                                    {/* Точка для обычных пунктов, для подпунктов буллит ставим через css или просто отступ */}
                                    {!item.isSubItem && <span className="mr-1">•</span>}
                                    {item.isSubItem && <span className="absolute left-2 top-2 w-1 h-1 rounded-full bg-black"></span>}
                                    {item.name}
                                 </span>
                                 <span className="font-bold text-gray-900 text-right ml-4 whitespace-nowrap">{item.value}</span>
                               </>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Правая колонка: ОСОБЕННОСТИ */}
                  <div>
                    <h4 className="font-bold uppercase mb-3 text-sm tracking-wide text-gray-800">Особенности:</h4>
                    <div className="text-[13px] leading-relaxed border-t border-gray-100">
                      {productData.features.map((feature, idx) => (
                        <div 
                           key={idx} 
                           className={`py-1 px-3 flex items-start gap-2 ${idx % 2 !== 0 ? 'bg-white' : 'bg-[#F5F7FA]'}`}
                        >
                           <span className="text-black mt-1.5 text-[6px]">●</span>
                           <span className="text-black">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-12">
                    <h4 className="font-bold uppercase mb-3 text-sm tracking-wide text-gray-800">Основная комплектация:</h4>
                    <div className="text-[13px] leading-relaxed border-t border-gray-100">
                      <ol className="list-decimal list-inside text-[13px] text-gray-700 font-medium">
                        {productData.equipment.map((item, idx) => (
                          <li key={idx} className={`py-1 px-3 ${idx % 2 !== 0 ? 'bg-white' : 'bg-[#F5F7FA]'}`}>
                             {item}
                          </li>
                        ))}
                      </ol>
                    </div>
               </div>
               </div>

               
               {/* ТАБЛИЦА МОДЕЛЬНЫЙ РЯД */}
               <div className="mt-12 overflow-x-auto">
                 <h4 className="font-bold uppercase mb-4 text-sm tracking-wide text-gray-800">Модельный ряд:</h4>
                 <table className="w-full min-w-[900px] border-collapse text-[13px] text-center border border-gray-300">
                    <thead>
                       <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                          <th className="p-3 border-r border-gray-300 text-left w-[180px]">Модель</th>
                          <th className="p-3 border-r border-gray-300">Рабочая область</th>
                          <th className="p-3 border-r border-gray-300">Выходная мощность лазера</th>
                          <th className="p-3 border-r border-gray-300">Точность репозиции</th>
                          <th className="p-3 border-r border-gray-300">Макс. скорость движения</th>
                          <th className="p-3">Максимум. ускорение</th>
                       </tr>
                    </thead>
                    <tbody>
                       {productData.models.map((row, idx) => (
                           <tr key={idx} className="border-b border-gray-300 last:border-0 hover:bg-gray-50">
                              <td className="p-3 border-r border-gray-300 text-left align-top">
                                 {row.name.map((n, i) => (
                                    <div key={i} className="text-[#F05023] font-bold leading-tight">{n}</div>
                                 ))}
                              </td>
                              <td className="p-3 border-r border-gray-300 font-medium text-gray-700">{row.area}</td>
                              <td className="p-3 border-r border-gray-300 font-medium text-gray-700">{row.power}</td>
                              <td className="p-3 border-r border-gray-300 font-medium text-gray-700">{row.repo}</td>
                              <td className="p-3 border-r border-gray-300 font-medium text-gray-700">{row.speed}</td>
                              <td className="p-3 font-medium text-gray-700">{row.acc}</td>
                           </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
      </div>
    </PageContainer>
  )
}

export default ProductPage