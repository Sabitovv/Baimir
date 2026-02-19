import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Filter } from '@/api/categoriesApi'
import { useTranslation } from 'react-i18next'

type CatalogFiltersProps = {
  onClose: () => void
  filters?: Filter[]
  bounds: Record<string, { min: number; max: number }>
}

type RangeValues = { from: string; to: string }
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const CatalogFilters = ({ onClose, filters, bounds }: CatalogFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [ranges, setRanges] = useState<Record<string, RangeValues>>({})
  const { t } = useTranslation()

  const getLimits = (f: any) => {
    if (bounds && bounds[f.code]) return bounds[f.code]
    const rawMin = f.range?.min ?? 0
    const rawMax = f.range?.max ?? 0
    return { min: Math.floor(Number(rawMin)), max: Math.ceil(Number(rawMax)) }
  }

  const [inStock, setInStock] = useState(searchParams.get('is_stock') === 'true')

  const toggleStock = () => {
    const newValue = !inStock
    setInStock(newValue)
    const params = new URLSearchParams(searchParams.toString())
    newValue ? params.set("is_stock", "true") : params.delete("is_stock")
    params.set("page", "1")
    setSearchParams(params, { replace: false })
  }

  useEffect(() => {
    const rangeFilters = (filters ?? []).filter((f) => f.uiType === 'RANGE_SLIDER')
    const newRanges: Record<string, RangeValues> = {}

    rangeFilters.forEach((f: any) => {
      const { min, max } = getLimits(f)
      const raw = searchParams.get(f.code) ?? ''
      if (!raw) {
        newRanges[f.code] = { from: String(min), to: String(max) }
      } else {
        const parts = raw.split(',', 2)
        newRanges[f.code] = { from: parts[0] ?? String(min), to: parts[1] ?? String(max) }
      }
    })
    setRanges((prev) => ({ ...newRanges, ...prev }))
  }, [filters, searchParams, bounds])

  const setRange = (code: string, part: 'from' | 'to', value: string) => {
    setRanges((prev) => ({ ...prev, [code]: { ...(prev[code] ?? { from: '', to: '' }), [part]: value } }))
  }

  const commitAndNormalize = (code: string) => {
    const f: any = (filters ?? []).find((x) => x.code === code)
    if (!f) return
    const { min: safeMin, max: safeMax } = getLimits(f)
    let rawFrom = ranges[code]?.from ?? ''
    let rawTo = ranges[code]?.to ?? ''
    let numFrom = Number(String(rawFrom).replace(/[^\d-]/g, ''))
    let numTo = Number(String(rawTo).replace(/[^\d-]/g, ''))
    if (Number.isNaN(numFrom)) numFrom = safeMin
    if (Number.isNaN(numTo)) numTo = safeMax
    numFrom = clamp(numFrom, safeMin, safeMax)
    numTo = clamp(numTo, safeMin, safeMax)
    if (numFrom > numTo) numTo = numFrom
    setRanges((prev) => ({ ...prev, [code]: { from: String(numFrom), to: String(numTo) } }))
  }

  const applyRanges = () => {
    const params = new URLSearchParams(searchParams)
    const rangeFilters = (filters ?? []).filter((f) => f.uiType === 'RANGE_SLIDER')
    rangeFilters.forEach((f: any) => {
      commitAndNormalize(f.code)
      const rv = ranges[f.code]
      const { min, max } = getLimits(f)
      let cleanFrom = Number(String(rv?.from).replace(/[^\d-]/g, '')) || min
      let cleanTo = Number(String(rv?.to).replace(/[^\d-]/g, '')) || max
      if (cleanFrom === min && cleanTo === max) params.delete(f.code)
      else params.set(f.code, `${cleanFrom},${cleanTo}`)
    })
    params.set('page', '1')
    setSearchParams(params, { replace: false })
    onClose()
  }

  const descendingOrder = () => {
    const params = new URLSearchParams(searchParams)
    const currentSort = params.get('sort')
    params.set('sort', currentSort === 'price,DESC' ? 'price,ASC' : 'price,DESC')
    params.set('page', '1')
    setSearchParams(params, { replace: false })
  }

  const toggleCheckbox = (filterCode: string, valueId: string) => {
    const params = new URLSearchParams(searchParams)
    const current = params.get(filterCode)
    const values = current ? current.split(',').filter(Boolean) : []
    const newValues = values.includes(valueId) ? values.filter(v => v !== valueId) : [...values, valueId]
    if (newValues.length > 0) params.set(filterCode, newValues.join(','))
    else params.delete(filterCode)
    params.set('page', '1')
    setSearchParams(params, { replace: false })
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams);
    (filters ?? []).forEach((f: any) => params.delete(f.code))
    params.set('page', '1')
    setSearchParams(params, { replace: false })
    onClose()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md mb-6 shadow-sm ">
      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: #F05023; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); position: relative; z-index: 50; }
        input[type=range]::-moz-range-thumb { pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: #F05023; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); position: relative; z-index: 50; border: none; }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F7] text-gray-700 rounded-md hover:bg-gray-200 transition font-medium text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            {t('filters.showFilter')}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 bg-[#E4E7EC] rounded-md cursor-pointer select-none" onClick={toggleStock}>
            <span className="text-sm text-gray-700">{t('filters.have')}</span>
            <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${inStock ? 'bg-[#F05023]' : 'bg-gray-300'}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ease-in-out ${inStock ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <button onClick={descendingOrder} className="px-3 py-2 bg-[#F2F4F7] rounded-md text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-2">
            <span className="text-gray-500">↑↓</span> {t('filters.descendingPrice')}
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
        {(filters ?? []).map((f: any) => (
          <div key={f.code} className="space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-3">{f.name}</h4>
              {f.uiType === 'RANGE_SLIDER' && (() => {
                const { min: safeMin, max: safeMax } = getLimits(f)
                if (safeMin === 0 && safeMax === 0) return null;
                const fromStr = ranges[f.code]?.from ?? String(safeMin)
                const toStr = ranges[f.code]?.to ?? String(safeMax)
                const numericFrom = Number(String(fromStr).replace(/[^\d-]/g, '')) || safeMin
                const numericTo = Number(String(toStr).replace(/[^\d-]/g, '')) || safeMax
                const rangeDiff = safeMax - safeMin
                const percentFrom = rangeDiff === 0 ? 0 : ((Math.max(safeMin, Math.min(safeMax, numericFrom)) - safeMin) / rangeDiff) * 100
                const percentTo = rangeDiff === 0 ? 0 : ((Math.max(safeMin, Math.min(safeMax, numericTo)) - safeMin) / rangeDiff) * 100

                return (
                  <>
                    <div className="flex gap-2 mb-4">
                      <input type="number" value={fromStr} onChange={(e) => setRange(f.code, 'from', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" />
                      <input type="number" value={toStr} onChange={(e) => setRange(f.code, 'to', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="relative h-6 mb-4 select-none">
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded" />
                      <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#F05023] rounded z-10" style={{ left: `${percentFrom}%`, right: `${100 - percentTo}%` }} />
                      <input type="range" min={safeMin} max={safeMax} value={numericFrom} onChange={(e) => setRange(f.code, 'from', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="absolute w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none z-20 h-0" style={{ background: 'transparent', WebkitAppearance: 'none' }} />
                      <input type="range" min={safeMin} max={safeMax} value={numericTo} onChange={(e) => setRange(f.code, 'to', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="absolute w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none z-20 h-0" style={{ background: 'transparent', WebkitAppearance: 'none' }} />
                    </div>
                  </>
                )
              })()}
              {f.uiType === 'CHECKBOX_LIST' && (
                <div className="flex flex-wrap gap-2">
                  {f.values?.map((v: any) => {
                    const isActive = (searchParams.get(f.code)?.split(',') || []).includes(String(v.id))
                    return (
                      <button key={v.id} onClick={() => toggleCheckbox(f.code, String(v.id))} className={`border rounded px-3 py-1.5 text-sm transition-colors ${isActive ? 'bg-[#F05023] text-white border-[#F05023]' : 'bg-white text-gray-600 border-gray-300'}`}>
                        {v.label} {v.count > 0 && <span>({v.count})</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="m-4 flex justify-end gap-3">
        <button onClick={clearAll} className="px-4 py-2 bg-gray-100 rounded text-sm">{t('filters.resetAll')}</button>
        <button onClick={applyRanges} className="bg-[#F05023] text-white px-8 py-3 text-sm font-medium rounded hover:bg-[#d64018] transition">{t('filters.apply')}</button>
      </div>
    </div>
  )
}

export default CatalogFilters