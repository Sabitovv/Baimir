import React, { useState, useMemo } from 'react'

type Props = {
  onClose?: () => void
}

const V_ARRAY = [4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 50, 63, 80, 100, 125, 160, 200]

const CategoryCalculator: React.FC<Props> = () => {
  const [material, setMaterial] = useState('') 
  const [thickness, setThickness] = useState('') 
  const [angle, setAngle] = useState('')
  const [length, setLength] = useState('')

  const columns = useMemo(() => {
    const s = Number(thickness)
    let recIndex = -1

    if (s > 0) {
      const targetV = s <= 3 ? s * 6 : s * 8
      let minDiff = Infinity
      V_ARRAY.forEach((v, idx) => {
        const diff = Math.abs(v - targetV)
        if (diff < minDiff) {
          minDiff = diff
          recIndex = idx
        }
      })
    }
    const cols = []
    for (let i = -2; i <= 2; i++) {
      const vIndex = recIndex + i
      const vVal = V_ARRAY[vIndex]

      if (!s || s <= 0) {
        cols.push({ type: i === 0 ? 'rec' : 'norm', v: null, h: null, r: null, f: null, status: 'S=0' })
        continue
      }
      if (vIndex < 0 || vIndex >= V_ARRAY.length || vVal < s * 4) {
        cols.push({ type: i === 0 ? 'rec' : 'norm', v: null, h: null, r: null, f: null, status: 'N' })
        continue
      }

      const h = vVal * 1.0 
      const r = vVal * 0.1875       
      let f: number | null = null
      let fStatus = 'L=0'
      
      const rm = Number(material)
      const l = Number(length)
      
      if (rm > 0 && l > 0) {
        f = (1.5 * rm * Math.pow(s, 2) * (l / 1000)) / (vVal / 1000) / 1000
        fStatus = 'ok'
      }

      cols.push({
        type: i === 0 ? 'rec' : 'norm',
        v: vVal,
        h,
        r,
        f,
        status: !angle ? 'Угол?' : (f !== null ? 'ok' : fStatus)
      })
    }
    
    return cols
  }, [thickness, material, length, angle])

  const recommendedForce = columns[2]?.f

  return (
    <div className="w-full bg-white relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-[#F58322] font-bold text-sm mb-1">
            Материал
          </label>
          <select
            className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm outline-none bg-white focus:border-[#F58322]"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="">Выбрать...</option>
            <option value="45">Сталь (45 Н/мм²)</option>
            <option value="80">Нерж. сталь (80 Н/мм²)</option>
            <option value="25">Алюминий (25 Н/мм²)</option>
          </select>
        </div>

        <div>
          <label className="block text-[#F58322] font-bold text-sm mb-1">
            Толщина, мм (S)
          </label>
          <select
            className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm outline-none bg-white focus:border-[#F58322]"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
          >
            <option value="">Выбрать...</option>
            <option value="0.5">0.5</option>
            <option value="0.8">0.8</option>
            <option value="1.0">1.0</option>
            <option value="1.2">1.2</option>
            <option value="1.5">1.5</option>
            <option value="2.0">2.0</option>
            <option value="3.0">3.0</option>
            <option value="4.0">4.0</option>
            <option value="5.0">5.0</option>
            <option value="6.0">6.0</option>
          </select>
        </div>

        <div>
          <label className="block text-[#F58322] font-bold text-sm mb-1">
            Угол, град. (α)
          </label>
          <select
            className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm outline-none bg-white focus:border-[#F58322]"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
          >
            <option value="">Выбрать...</option>
            <option value="90">90°</option>
            <option value="88">88°</option>
            <option value="60">60°</option>
          </select>
        </div>

        <div>
          <label className="block text-[#F58322] font-bold text-sm mb-1">
            Длина гиба, мм (L)
          </label>
          <input
            type="number"
            min="0"
            className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm outline-none bg-white focus:border-[#F58322]"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="Например: 1000"
          />
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse bg-[#F8F9FA] text-sm text-center min-w-[750px] shadow-sm">
          <thead>
            <tr className="bg-[#F58322] text-white">
              <th className="py-2 px-4 text-left w-[25%]">Параметр</th>
              <th className="py-2 px-2 w-[15%]">▼</th>
              <th className="py-2 px-2 w-[15%]">▼</th>
              <th className="py-1 px-2 w-[20%] font-bold leading-tight bg-[#DB741F]">
                Рекомендуемое<br />▼
              </th>
              <th className="py-2 px-2 w-[15%]">▼</th>
              <th className="py-2 px-2 w-[15%]">▼</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 px-4 text-left font-medium text-gray-800">
                Открытие матрицы, мм (V)
              </td>
              {columns.map((col, idx) => (
                <td key={idx} className={`py-4 ${col.type === 'rec' ? 'bg-[#F58322] text-white font-bold' : ''}`}>
                  {col.v ? col.v : col.status}
                </td>
              ))}
            </tr>

            <tr className="border-b border-gray-200">
              <td className="py-4 px-4 text-left font-medium text-gray-800">
                Минимальная полка, мм (h)
              </td>
              {columns.map((col, idx) => (
                <td key={idx} className={`py-4 ${col.type === 'rec' ? 'bg-[#F58322] text-white font-bold' : ''}`}>
                  {col.h !== null && angle ? col.h.toFixed(2) : (!angle && col.v ? 'Угол?' : col.status)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-4 px-4 text-left font-medium text-gray-800">
                Внутренний радиус, мм (R<sub>i</sub>)
              </td>
              {columns.map((col, idx) => (
                <td key={idx} className={`py-4 ${col.type === 'rec' ? 'bg-[#F58322] text-white font-bold' : ''}`}>
                  {col.r !== null ? col.r.toFixed(2) : col.status}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-4 px-4 text-left font-medium text-gray-800">
                Усилие гибки, тонн (F)
              </td>
              {columns.map((col, idx) => (
                <td key={idx} className={`py-4 ${col.type === 'rec' ? 'bg-[#DB741F] text-white font-bold' : ''}`}>
                  {col.f !== null ? Math.ceil(col.f) : (col.v ? 'L=0' : col.status)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {recommendedForce && recommendedForce > 0 && (
        <div className="bg-orange-50 border-l-4 border-[#F58322] p-4 rounded-r-md flex justify-between items-center animate-in fade-in">
          <div>
            <h4 className="text-[#DB741F] font-bold text-lg">Результат расчета</h4>
            <p className="text-gray-700 mt-1">
              Для ваших параметров потребуется усилие не менее <b className="text-black">{Math.ceil(recommendedForce * 1.15)} тонн</b> (с учетом запаса 15%).
            </p>
          </div>
          <button 
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
            }}
            className="hidden sm:block px-6 py-2 bg-[#F58322] hover:bg-[#DB741F] text-white font-medium rounded transition"
          >
            Подобрать станок
          </button>
        </div>
      )}
    </div>
  )
}

export default CategoryCalculator