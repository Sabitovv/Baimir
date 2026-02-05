import { useState } from 'react'

const CatalogFilters = ({ onClose }: { onClose: () => void }) => {
  const [selectedBrand, setSelectedBrand] = useState('Bodor')

  // Компонент для тегов (кнопок)
  const FilterTag = ({ label, count, active = false }: { label: string, count?: number, active?: boolean }) => (
    <button 
      className={`border rounded px-3 py-1.5 text-sm transition-colors whitespace-nowrap font-[Manrope]
        ${active 
          ? 'bg-[#F05023] text-white border-[#F05023]' 
          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
        }`}
    >
      {label} {count && <span className={active ? 'text-white' : 'text-gray-400'}>({count})</span>}
    </button>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-md mb-6 shadow-sm font-[Manrope]">
      
      {/* --- ВЕРХНЯЯ ЧАСТЬ (ОТКРЫТОГО ФИЛЬТРА) --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Кнопка СКРЫТЬ */}
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F7] text-gray-700 rounded-md hover:bg-gray-200 transition font-medium text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            Скрыть фильтр
          </button>

          {/* Тоггл В наличии */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#F2F4F7] rounded-md">
             <span className="text-sm text-gray-700">В наличии</span>
             <div className="w-9 h-5 bg-[#F05023] rounded-full relative cursor-pointer">
               <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-1 top-0.5 shadow-sm"></div>
             </div>
          </div>

          {/* Сортировка */}
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-[#F2F4F7] rounded-md text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-2">
              <span className="text-gray-500">↑↓</span> По убыванию цены
            </button>
            <button className="px-3 py-2 bg-[#F2F4F7] rounded-md text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-2">
              Цена <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1"/></svg>
            </button>
            <button className="px-3 py-2 bg-[#F2F4F7] rounded-md text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-2">
              Серия <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1"/></svg>
            </button>
          </div>
        </div>

        {/* Переключатель вида (Сетка/Список) */}
        <div className="flex items-center gap-2 text-gray-400">
           <button className="text-[#F05023]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
           </button>
           <button className="hover:text-gray-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"/></svg>
           </button>
        </div>
      </div>

      {/* --- ТЕЛО ФИЛЬТРА (ХАРАКТЕРИСТИКИ) --- */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
        
        {/* КОЛОНКА 1 */}
        <div className="space-y-6">
          {/* Цена */}
          <div>
            <h4 className="font-bold text-sm mb-3">Цена</h4>
            <div className="flex gap-2 mb-4">
               <input 
                 type="text" placeholder="От" 
                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#F05023] outline-none"
               />
               <input 
                 type="text" placeholder="До" 
                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#F05023] outline-none"
               />
            </div>
            {/* Слайдер */}
            <div className="relative h-1 bg-gray-200 rounded mt-2">
               <div className="absolute left-[20%] right-[30%] top-0 bottom-0 bg-[#F05023] rounded"></div>
               <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F05023] rounded-full cursor-pointer shadow border-2 border-white"></div>
               <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F05023] rounded-full cursor-pointer shadow border-2 border-white"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
               <span>3 458 000</span>
               <span>6 750 000</span>
            </div>
          </div>

          {/* Страна */}
          <div>
            <h4 className="font-bold text-sm mb-3">Страна производитель</h4>
            <div className="flex flex-wrap gap-2">
              <FilterTag label="КНР" count={14} />
              <FilterTag label="Германия" count={1} />
              <FilterTag label="Тайвань" count={1} />
            </div>
          </div>

          {/* Производитель */}
          <div>
            <h4 className="font-bold text-sm mb-3">Производитель</h4>
            <div className="flex flex-wrap gap-2">
              <FilterTag label="Han's Laser" />
              <FilterTag label="HGTECH" />
              <FilterTag label="Bodor" count={15} active={selectedBrand === 'Bodor'} />
              <FilterTag label="HSG Laser" />
              <FilterTag label="Gweike" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
             <input type="checkbox" className="w-4 h-4 text-[#F05023] rounded border-gray-300 focus:ring-[#F05023]" />
             <label className="text-sm font-bold text-gray-800">В наличии</label>
          </div>
        </div>

        {/* КОЛОНКА 2 */}
        <div className="space-y-6">
           <div>
             <h4 className="font-bold text-sm mb-3">Рабочая зона, мм</h4>
             <div className="flex flex-wrap gap-2">
               <FilterTag label="3 000 x 1 500" count={12} />
               <FilterTag label="2 000 x 2 500" count={8} />
               <FilterTag label="3 050 x 1 530" count={5} />
             </div>
           </div>
           <div>
             <h4 className="font-bold text-sm mb-3">Ширина направляющей, Y ось, мм</h4>
             <div className="flex flex-wrap gap-2"><FilterTag label="30" count={4} /></div>
           </div>
           <div>
             <h4 className="font-bold text-sm mb-3">Ширина направляющей, X ось, мм</h4>
             <div className="flex flex-wrap gap-2"><FilterTag label="20" count={7} /></div>
           </div>
           <div>
             <h4 className="font-bold text-sm mb-3">Тип привода</h4>
             <div className="flex flex-wrap gap-2"><FilterTag label="Сервоприводы, зубчатая рейка" count={3} /></div>
           </div>
        </div>

        {/* КОЛОНКА 3 */}
        <div className="flex flex-col h-full">
           <div className="space-y-6 flex-grow">
              <div>
                <h4 className="font-bold text-sm mb-3">Выходная мощность лазера, ватт</h4>
                <div className="flex flex-wrap gap-2">
                  <FilterTag label="1 500" count={12} />
                  <FilterTag label="3 000" count={4} />
                  <FilterTag label="до 20 000" count={12} />
                  <FilterTag label="до 2 000" count={17} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3">Макс. вес заготовки, кг</h4>
                <div className="flex flex-wrap gap-2"><FilterTag label="700" count={2} /></div>
              </div>
           </div>

           <div className="mt-8 flex justify-end">
             <button className="bg-[#F05023] text-white px-8 py-3 text-sm font-medium rounded hover:bg-[#d64018] transition w-full sm:w-auto">
               Сбросить все
             </button>
           </div>
        </div>

      </div>
    </div>
  )
}

export default CatalogFilters