import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Filter, FilterValue } from '@/api/categoriesApi'
import { useTranslation } from 'react-i18next'

type CatalogFiltersProps = {
  onClose: () => void
  filters?: Filter[]
  bounds: Record<string, { min: number; max: number }>
  inDrawer?: boolean
}

type RangeValues = { from: string; to: string }

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const CatalogFilters = ({ onClose, filters, bounds, inDrawer = false }: CatalogFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [draftRanges, setDraftRanges] = useState<Record<string, RangeValues>>({})
  const { t } = useTranslation()

  const rangeFilters = useMemo(
    () => (filters ?? []).filter((f) => f.uiType === 'RANGE_SLIDER'),
    [filters]
  )

  const getLimits = useCallback((f: Filter) => {
    const fallback = bounds[f.code]
    const rawMin = f.range?.min ?? fallback?.min ?? 0
    const rawMax = f.range?.max ?? fallback?.max ?? 0
    return { min: Math.floor(Number(rawMin)), max: Math.ceil(Number(rawMax)) }
  }, [bounds])

  const baseRanges = useMemo(() => {
    const nextRanges: Record<string, RangeValues> = {}

    rangeFilters.forEach((f) => {
      const { min, max } = getLimits(f)
      const raw = searchParams.get(f.code) ?? ''

      if (!raw) {
        nextRanges[f.code] = { from: String(min), to: String(max) }
      } else {
        const parts = raw.split(',', 2)
        nextRanges[f.code] = { from: parts[0] ?? String(min), to: parts[1] ?? String(max) }
      }
    })

    return nextRanges
  }, [getLimits, rangeFilters, searchParams])

  const ranges = useMemo(() => ({ ...baseRanges, ...draftRanges }), [baseRanges, draftRanges])

  const setRange = (code: string, part: 'from' | 'to', value: string) => {
    setDraftRanges((prev) => ({
      ...prev,
      [code]: { ...(ranges[code] ?? { from: '', to: '' }), [part]: value },
    }))
  }

  const normalizeRange = (f: Filter, value: RangeValues | undefined): RangeValues => {
    const { min: safeMin, max: safeMax } = getLimits(f)
    const rawFrom = value?.from ?? ''
    const rawTo = value?.to ?? ''
    let numFrom = Number(String(rawFrom).replace(/[^\d-]/g, ''))
    let numTo = Number(String(rawTo).replace(/[^\d-]/g, ''))

    if (Number.isNaN(numFrom)) numFrom = safeMin
    if (Number.isNaN(numTo)) numTo = safeMax

    numFrom = clamp(numFrom, safeMin, safeMax)
    numTo = clamp(numTo, safeMin, safeMax)

    if (numFrom > numTo) numTo = numFrom

    return { from: String(numFrom), to: String(numTo) }
  }

  const commitAndNormalize = (code: string) => {
    const f = (filters ?? []).find((x) => x.code === code)
    if (!f) return

    const normalized = normalizeRange(f, ranges[code])
    setDraftRanges((prev) => ({ ...prev, [code]: normalized }))
  }

  const applyRanges = () => {
    const params = new URLSearchParams(searchParams)

    rangeFilters.forEach((f) => {
      const normalized = normalizeRange(f, ranges[f.code])
      const { min, max } = getLimits(f)
      const cleanFrom = Number(String(normalized.from).replace(/[^\d-]/g, '')) || min
      const cleanTo = Number(String(normalized.to).replace(/[^\d-]/g, '')) || max

      if (cleanFrom === min && cleanTo === max) {
        params.delete(f.code)
      } else {
        params.set(f.code, `${cleanFrom},${cleanTo}`)
      }
    })

    params.set('page', '1')
    setSearchParams(params, { replace: false })
    onClose()
  }

  const toggleCheckbox = (filterCode: string, valueId: string) => {
    const params = new URLSearchParams(searchParams)
    const current = params.get(filterCode)
    const values = current ? current.split(',').filter(Boolean) : []

    const newValues = values.includes(valueId)
      ? values.filter((v) => v !== valueId)
      : [...values, valueId]

    if (newValues.length > 0) {
      params.set(filterCode, newValues.join(','))
    } else {
      params.delete(filterCode)
    }

    params.set('page', '1')
    setSearchParams(params, { replace: false })
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams)
    ;(filters ?? []).forEach((f) => params.delete(f.code))
    params.set('page', '1')
    setSearchParams(params, { replace: false })
    setDraftRanges({})
    onClose()
  }

  return (
    <div className={inDrawer ? 'bg-white' : 'bg-white border border-gray-200 rounded-md mb-6 shadow-sm'}>
      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: #F58322; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); position: relative; z-index: 50; }
        input[type=range]::-moz-range-thumb { pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: #F58322; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); position: relative; z-index: 50; border: none; }
      `}</style>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
        {(filters ?? []).map((f) => (
          <div key={f.code} className="space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-3">{f.name}</h4>

              {f.uiType === 'RANGE_SLIDER' && (() => {
                const { min: safeMin, max: safeMax } = getLimits(f)
                if (safeMin === 0 && safeMax === 0) return null

                const fromStr = ranges[f.code]?.from ?? String(safeMin)
                const toStr = ranges[f.code]?.to ?? String(safeMax)
                const numericFrom = Number(String(fromStr).replace(/[^\d-]/g, '')) || safeMin
                const numericTo = Number(String(toStr).replace(/[^\d-]/g, '')) || safeMax

                const rangeDiff = safeMax - safeMin
                const percentFrom = rangeDiff === 0 ? 0 : ((Math.max(safeMin, Math.min(safeMax, numericFrom)) - safeMin) / rangeDiff) * 100
                const percentTo = rangeDiff === 0 ? 0 : ((Math.max(safeMin, Math.min(safeMax, numericTo)) - safeMin) / rangeDiff) * 100

                return (
                  <div key={`range-${f.code}`}>
                    <div className="flex gap-2 mb-4">
                      <input type="number" value={fromStr} onChange={(e) => setRange(f.code, 'from', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#F58322] transition-colors" />
                      <input type="number" value={toStr} onChange={(e) => setRange(f.code, 'to', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#F58322] transition-colors" />
                    </div>
                    <div className="relative h-6 mb-4 select-none">
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded" />
                      <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#F58322] rounded z-10" style={{ left: `${percentFrom}%`, right: `${100 - percentTo}%` }} />
                      <input type="range" min={safeMin} max={safeMax} value={numericFrom} onChange={(e) => setRange(f.code, 'from', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="absolute w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none z-20 h-0" style={{ background: 'transparent', WebkitAppearance: 'none' }} />
                      <input type="range" min={safeMin} max={safeMax} value={numericTo} onChange={(e) => setRange(f.code, 'to', e.target.value)} onBlur={() => commitAndNormalize(f.code)} className="absolute w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none z-20 h-0" style={{ background: 'transparent', WebkitAppearance: 'none' }} />
                    </div>
                  </div>
                )
              })()}

              {f.uiType === 'CHECKBOX_LIST' && (
                <div className="flex flex-wrap gap-2">
                  {f.values?.map((v: FilterValue) => {
                    const isActive = (searchParams.get(f.code)?.split(',') || []).includes(String(v.id))
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleCheckbox(f.code, String(v.id))}
                        className={`border rounded px-3 py-1.5 text-sm transition-colors ${isActive ? 'bg-[#F58322] text-white border-[#F58322]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                      >
                        {v.label} {v.count > 0 && <span className="opacity-70">({v.count})</span>}
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
        <button onClick={clearAll} className="px-4 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-colors">{t('filters.resetAll')}</button>
        <button onClick={applyRanges} className="bg-[#F58322] text-white px-8 py-3 text-sm font-medium rounded hover:bg-[#DB741F] transition-colors">{t('filters.apply')}</button>
      </div>
    </div>
  )
}

export default CatalogFilters
