import { useMemo, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { useTranslation } from 'react-i18next'
import { useGetLaserOptionsQuery } from '@/api/categoriesApi'
import ProductCard from '@/components/common/ProductCard'
import {
  LASER_DEFAULTS, laserRequest, selectLasers,
  type LaserDraft, type LaserKind, type LaserMatch, type LaserMaterial, type LaserReason,
} from '@/utils/laserSelection'

type Props = {
  rootId: number
  open: boolean
  applied: boolean
  initialDraft: LaserDraft
  onToggle: () => void
  onApply: (draft: LaserDraft) => void
  onReset: () => void
}
const reasonLabels: Record<LaserReason, string> = {
  materialMissing: 'Нет подтверждённого предела толщины для выбранного материала.',
  thicknessExceeded: 'Задана толщина выше опубликованного предела.',
  workingAreaMissing: 'Рабочее поле не заполнено или требует уточнения.',
  workingAreaExceeded: 'Лист не помещается в рабочее поле даже с поворотом.',
  pipeLengthMissing: 'Допустимая длина трубы не указана.',
  pipeLengthExceeded: 'Труба длиннее допустимой заготовки.',
  pipeSectionMissing: 'Нет полного диапазона для выбранного сечения трубы.',
  pipeSectionExceeded: 'Сечение трубы выходит за допустимый диапазон.',
  rollWidthMissing: 'Допустимая ширина рулона не указана.',
  rollWidthExceeded: 'Рулон шире допустимой рабочей зоны.',
  rollThicknessExceeded: 'Толщина ленты выходит за опубликованный диапазон.',
  powerConflict: 'Мощность в исходных данных противоречива или не подтверждена.',
  configurationUnconfirmed: 'Точная комплектация этой карточки требует подтверждения.',
  parameterConflict: 'В характеристиках есть противоречащие друг другу значения.',
  sheetRotated: 'Лист помещается с поворотом на 90°.',
  atLimit: 'Это предельная толщина: скорость и качество резки нужно подтвердить.',
  modeExcluded: 'Станок предназначен для другого типа заготовки.',
}

export default function LaserMachineSelector({ rootId, open, applied, initialDraft, onToggle, onApply, onReset }: Props) {
  const { t, i18n } = useTranslation()
  const [draft, setDraft] = useState<LaserDraft>(initialDraft)
  const [submittedInvalid, setSubmittedInvalid] = useState(false)
  const [inStock, setInStock] = useState(false)
  const [sort, setSort] = useState('stock')
  const [showExcluded, setShowExcluded] = useState(false)
  const { currentData: options, isFetching, isError, refetch } = useGetLaserOptionsQuery(
    open || applied ? { categoryId: rootId, lang: i18n.language } : skipToken,
    { refetchOnMountOrArgChange: true, pollingInterval: open || applied ? 30000 : 0 },
  )
  const request = laserRequest(draft)
  const appliedRequest = applied ? laserRequest(initialDraft) : null
  const results = useMemo(() => appliedRequest && options?.rootCategoryId === rootId && !isError
    ? selectLasers(options.machines, appliedRequest, inStock, sort) : null,
  [appliedRequest, options, rootId, inStock, sort, isError])
  const changed = applied && JSON.stringify(draft) !== JSON.stringify(initialDraft)
  const field = (name: keyof LaserDraft, value: string) => { setSubmittedInvalid(false); setDraft(previous => ({ ...previous, [name]: value })) }
  const locale = /^(kz|kk)/i.test(i18n.language) ? 'kk-KZ' : i18n.language
  const number = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 3 })
  const mm = t('laserSelector.mm', { defaultValue: 'мм' })
  const requestedSize = appliedRequest && (appliedRequest.kind === 'sheet'
    ? `${number(appliedRequest.length!)} × ${number(appliedRequest.width!)} ${mm}`
    : appliedRequest.kind === 'roll' ? `${t('laserSelector.rollWidth', { defaultValue: 'Ширина рулона, мм' })}: ${number(appliedRequest.width!)}`
      : `${number(appliedRequest.length!)} ${mm} · ${appliedRequest.profile === 'round'
        ? `Ø ${number(appliedRequest.diameter!)} ${mm}`
        : appliedRequest.profile === 'square' ? `${number(appliedRequest.side!)} × ${number(appliedRequest.side!)} ${mm}`
          : `${number(appliedRequest.tubeWidth!)} × ${number(appliedRequest.tubeHeight!)} ${mm}`}`)
  const labelClass = 'min-w-0 flex flex-col gap-2 text-sm font-medium text-gray-700'
  const inputClass = 'min-w-0 w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none focus:border-[#F58322] focus:ring-2 focus:ring-orange-100'
  const selectClass = `${inputClass} block appearance-none cursor-pointer pr-12 hover:border-gray-400`
  const selectArrow = <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none"
    className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  const dimensionInput = (name: keyof LaserDraft, label: string) => <label className={labelClass} key={name}>
    {label}
    <input inputMode="decimal" type="text" required autoComplete="off" value={draft[name]} onChange={e => field(name, e.target.value)} className={inputClass} />
  </label>
  const reason = (code: LaserReason) => t(`laserSelector.reason.${code}`, { defaultValue: reasonLabels[code] })
  const renderMatch = (match: LaserMatch) => {
    const { product, capabilities: c } = match.machine
    return <div key={product.id} className="flex min-w-0 flex-col gap-3">
      <ProductCard id={product.id} slug={product.slug} name={product.name} coverImage={product.coverImage}
        price={product.price} oldPrice={product.oldPrice} inStock={product.inStock} availability={product.availability}
        deliveryDays={product.deliveryDays} isNew={product.newProduct} categoryId={product.categoryId} categoryName={product.categoryName} />
      <div className={`rounded-md border p-3 text-sm ${match.status === 'review' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
        <p className="font-semibold text-gray-800">{product.categoryName}</p>
        {c.powerWatts != null && <p className="mt-1 text-gray-600">{t('laserSelector.power', { defaultValue: 'Мощность' })}: {number(c.powerWatts / 1000)} {t('laserSelector.kw', { defaultValue: 'кВт' })}</p>}
        {match.maxThickness != null && <p className="mt-1 text-gray-700">{t('laserSelector.materialLimit', { defaultValue: 'По выбранному материалу: до {{thickness}} мм', thickness: number(match.maxThickness) })}</p>}
        {appliedRequest?.kind === 'sheet' && c.workingLength != null && c.workingWidth != null && <p className="mt-1 text-gray-600">
          {t('laserSelector.workingArea', { defaultValue: 'Рабочее поле' })}: {number(c.workingLength)} × {number(c.workingWidth)} {mm}
        </p>}
        {appliedRequest?.kind === 'tube' && c.pipeLength != null && <p className="mt-1 text-gray-600">{t('laserSelector.pipeCapacity', { defaultValue: 'Длина трубы: до {{length}} мм', length: number(c.pipeLength) })}</p>}
        {appliedRequest?.kind === 'roll' && c.rollWidth != null && <p className="mt-1 text-gray-600">{t('laserSelector.rollCapacity', { defaultValue: 'Ширина рулона: до {{width}} мм', width: number(c.rollWidth) })}</p>}
        {match.reasons.length > 0 && <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-700">
          {match.reasons.map(code => <li key={code}>{reason(code)}</li>)}
        </ul>}
      </div>
    </div>
  }
  const gridClass = 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
  return <section className="mb-6" aria-label={t('laserSelector.title', { defaultValue: 'Подбор лазерного станка' })}>
    <button type="button" onClick={onToggle} aria-expanded={open} aria-controls="laser-selector-form"
      className={`mb-4 inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition ${open ? 'bg-[#F58322] text-white' : 'bg-[#E4E7EC] text-gray-800 hover:bg-gray-300'}`}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 3h16M12 3v7M8 10h8l-4 5-4-5ZM3 21h18M12 16v3M4 13l2 2M20 13l-2 2" /></svg>
      {t('laserSelector.button', { defaultValue: 'Подобрать лазерный станок' })}
    </button>
    {open && <div id="laser-selector-form" className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('laserSelector.title', { defaultValue: 'Подбор лазерного станка' })}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{t('laserSelector.intro', { defaultValue: 'Укажите заготовку и материал. Проверим опубликованные характеристики моделей из всех серий лазерных станков — не только текущей категории.' })}</p>
        </div>
        <button type="button" onClick={onToggle} aria-label={t('common.close', { defaultValue: 'Закрыть' })} className="rounded p-2 text-xl text-gray-500 hover:bg-gray-100">×</button>
      </div>
      <form className="mt-6 space-y-5" onSubmit={event => { event.preventDefault(); if (!request) setSubmittedInvalid(true); else if (!isError && options?.available) onApply(draft) }}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className={labelClass}>{t('laserSelector.kind', { defaultValue: 'Что режем' })}
            <span className="relative block min-w-0">
              <select value={draft.kind} className={selectClass} onChange={e => {
                const kind = e.target.value as LaserKind
                setSubmittedInvalid(false)
                setDraft(previous => ({ ...previous, kind, thickness: kind === 'tube' ? '3' : kind === 'roll' ? '1' : LASER_DEFAULTS.thickness,
                  length: kind === 'tube' ? '6000' : LASER_DEFAULTS.length, width: kind === 'roll' ? '1000' : LASER_DEFAULTS.width }))
              }}>
                <option value="sheet">{t('laserSelector.sheet', { defaultValue: 'Металлический лист' })}</option>
                <option value="tube">{t('laserSelector.tube', { defaultValue: 'Труба / профиль' })}</option>
                <option value="roll">{t('laserSelector.roll', { defaultValue: 'Рулонный металл' })}</option>
              </select>
              {selectArrow}
            </span>
          </label>
          <label className={labelClass}>{t('laserSelector.material', { defaultValue: 'Материал' })}
            <span className="relative block min-w-0">
              <select value={draft.material} className={selectClass} onChange={e => field('material', e.target.value as LaserMaterial)}>
                <option value="mild">{t('laserSelector.mild', { defaultValue: 'Углеродистая сталь' })}</option>
                <option value="stainless">{t('laserSelector.stainless', { defaultValue: 'Нержавеющая сталь' })}</option>
                <option value="aluminium">{t('laserSelector.aluminium', { defaultValue: 'Алюминий' })}</option>
                <option value="brass">{t('laserSelector.brass', { defaultValue: 'Латунь' })}</option>
              </select>
              {selectArrow}
            </span>
          </label>
          {dimensionInput('thickness', draft.kind === 'tube' ? t('laserSelector.wallThickness', { defaultValue: 'Толщина стенки, мм' }) : t('laserSelector.thickness', { defaultValue: 'Толщина материала, мм' }))}
          {draft.kind === 'sheet' && <>
            {dimensionInput('length', t('laserSelector.sheetLength', { defaultValue: 'Длина листа, мм' }))}
            {dimensionInput('width', t('laserSelector.sheetWidth', { defaultValue: 'Ширина листа, мм' }))}
          </>}
          {draft.kind === 'roll' && dimensionInput('width', t('laserSelector.rollWidth', { defaultValue: 'Ширина рулона, мм' }))}
          {draft.kind === 'tube' && <>
            <label className={labelClass}>{t('laserSelector.profile', { defaultValue: 'Сечение трубы' })}
              <span className="relative block min-w-0">
                <select value={draft.profile} onChange={e => field('profile', e.target.value)} className={selectClass}>
                  <option value="round">{t('laserSelector.round', { defaultValue: 'Круглое' })}</option>
                  <option value="square">{t('laserSelector.square', { defaultValue: 'Квадратное' })}</option>
                  <option value="rectangle">{t('laserSelector.rectangle', { defaultValue: 'Прямоугольное' })}</option>
                </select>
                {selectArrow}
              </span>
            </label>
            {dimensionInput('length', t('laserSelector.pipeLength', { defaultValue: 'Длина трубы, мм' }))}
            {draft.profile === 'round' && dimensionInput('diameter', t('laserSelector.diameter', { defaultValue: 'Наружный диаметр, мм' }))}
            {draft.profile === 'square' && dimensionInput('side', t('laserSelector.side', { defaultValue: 'Наружная сторона, мм' }))}
            {draft.profile === 'rectangle' && <>{dimensionInput('tubeWidth', t('laserSelector.profileWidth', { defaultValue: 'Наружная ширина профиля, мм' }))}{dimensionInput('tubeHeight', t('laserSelector.profileHeight', { defaultValue: 'Наружная высота профиля, мм' }))}</>}
          </>}
        </div>
        {submittedInvalid && <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{t('laserSelector.invalid', { defaultValue: 'Введите положительные размеры и толщину в мм. Для трубы две толщины стенки должны быть меньше её наружного диаметра или меньшей стороны.' })}</p>}
        {changed && <p role="status" className="text-sm text-amber-800">{t('laserSelector.changed', { defaultValue: 'Условия изменены. Нажмите «Подобрать модели», чтобы обновить результаты.' })}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={isFetching && !options || isError || !options?.available}
            className="rounded-md bg-[#F58322] px-6 py-3 font-semibold text-white transition hover:bg-[#de741a] disabled:cursor-not-allowed disabled:opacity-50">
            {t('laserSelector.submit', { defaultValue: 'Подобрать модели' })}
          </button>
          {applied && <button type="button" onClick={onReset} className="px-3 py-2 text-sm text-gray-700 underline">{t('laserSelector.reset', { defaultValue: 'Сбросить подбор' })}</button>}
          {!isError && options && <p className="text-sm text-gray-600">{t('laserSelector.catalogCount', { defaultValue: 'В подборе {{count}} активных карточек из всех серий', count: options.machines.length })}</p>}
        </div>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-gray-500">{t('laserSelector.disclaimer', { defaultValue: 'Предварительный подбор по опубликованным пределам, а не гарантия производительности. Скорость, качество кромки, марку металла, газ, оснастку и нагрузку заготовки нужно подтвердить у поставщика. Мощность сама по себе не определяет допустимую толщину.' })}</p>
    </div>}
    {(open || applied) && isFetching && !options && <p role="status" className="py-4 text-sm text-gray-600">{t('laserSelector.loading', { defaultValue: 'Загружаем актуальные параметры всех серий…' })}</p>}
    {(open || applied) && isError && <div role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm">
      <p>{t('laserSelector.error', { defaultValue: 'Не удалось загрузить параметры. Результаты подбора недоступны.' })}</p>
      <button type="button" onClick={() => { void refetch() }} className="mt-2 text-[#D96912] underline">{t('pressSelection.retry', { defaultValue: 'Повторить' })}</button>
      {applied && <button type="button" onClick={onReset} className="ml-4 underline">{t('laserSelector.reset', { defaultValue: 'Сбросить подбор' })}</button>}
    </div>}
    {!isError && options && !options.available && <p role="status" className="mb-6 rounded-md bg-gray-50 p-4 text-sm">{t('laserSelector.unavailable', { defaultValue: 'В этом разделе пока нет активных лазерных станков для подбора.' })}</p>}
    {applied && !appliedRequest && <div role="alert" className="mb-6 rounded-md bg-amber-50 p-4 text-sm">
      <p>{t('laserSelector.invalidLink', { defaultValue: 'В ссылке некорректные параметры подбора. Исправьте их в форме или сбросьте подбор.' })}</p>
      <button type="button" onClick={onReset} className="mt-2 underline">{t('laserSelector.reset', { defaultValue: 'Сбросить подбор' })}</button>
    </div>}
    {results && <div className="space-y-7">
      <div className="rounded-lg border-l-4 border-[#F58322] bg-orange-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div role="status" aria-live="polite">
            <h2 className="text-lg font-bold text-gray-900">{t('laserSelector.results', { defaultValue: 'Соответствуют заданным параметрам: {{count}}', count: results.matches.length })}</h2>
            <p className="mt-1 text-sm text-gray-700">{t('laserSelector.conditions', { defaultValue: '{{kind}} · {{material}} · {{thickness}} мм',
              kind: t(`laserSelector.${initialDraft.kind}`, { defaultValue: ({ sheet: 'Лист', tube: 'Труба', roll: 'Рулон' })[initialDraft.kind] }),
              material: t(`laserSelector.${initialDraft.material}`, { defaultValue: ({ mild: 'Углеродистая сталь', stainless: 'Нержавеющая сталь', aluminium: 'Алюминий', brass: 'Латунь' })[initialDraft.material] }), thickness: initialDraft.thickness })}</p>
            <p className="mt-1 text-sm text-gray-700">{requestedSize}</p>
            <p className="mt-1 text-xs text-gray-600">{t('laserSelector.reviewCount', { defaultValue: 'Требуют уточнения: {{review}}. Не соответствуют условиям: {{excluded}}.', review: results.review.length, excluded: results.excluded.length })}</p>
          </div>
          <button type="button" onClick={onReset} className="text-sm text-gray-700 underline">{t('laserSelector.reset', { defaultValue: 'Сбросить подбор' })}</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="accent-orange-500" />{t('laserSelector.stockOnly', { defaultValue: 'Только в наличии' })}</label>
          <label className="flex items-center gap-2 text-sm text-gray-700">{t('laserSelector.sort', { defaultValue: 'Порядок' })}
            <span className="relative block min-w-0">
              <select value={sort} onChange={e => setSort(e.target.value)} className="block w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-12 outline-none hover:border-gray-400 focus:border-[#F58322] focus:ring-2 focus:ring-orange-100">
                <option value="stock">{t('laserSelector.stockFirst', { defaultValue: 'Сначала в наличии' })}</option>
                <option value="price-asc">{t('laserSelector.priceAsc', { defaultValue: 'Сначала дешевле' })}</option>
                <option value="price-desc">{t('laserSelector.priceDesc', { defaultValue: 'Сначала дороже' })}</option>
              </select>
              {selectArrow}
            </span>
          </label>
        </div>
        {isFetching && <p className="mt-3 text-xs text-gray-600">{t('laserSelector.refreshing', { defaultValue: 'Обновляем цены, наличие и параметры…' })}</p>}
      </div>
      {results.matches.length ? <div className={gridClass}>{results.matches.map(renderMatch)}</div> : <p className="rounded-md border border-gray-200 p-5 text-sm text-gray-700">{t('laserSelector.empty', { defaultValue: 'Нет моделей с подтверждёнными параметрами под эти условия. Проверьте группу «Требует уточнения» или измените заготовку.' })}</p>}
      {results.review.length > 0 && <section>
        <h2 className="mb-2 text-xl font-bold text-gray-900">{t('laserSelector.reviewTitle', { defaultValue: 'Требует уточнения' })} ({results.review.length})</h2>
        <p className="mb-4 text-sm leading-relaxed text-gray-600">{t('laserSelector.reviewIntro', { defaultValue: 'У этих моделей недостаёт данных или есть противоречия. Они не считаются подходящими автоматически. Причина указана под каждой карточкой.' })}</p>
        <div className={gridClass}>{results.review.map(renderMatch)}</div>
      </section>}
      {results.excluded.length > 0 && <details open={showExcluded} onToggle={e => setShowExcluded(e.currentTarget.open)} className="rounded-md border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">{t('laserSelector.excludedTitle', { defaultValue: 'Почему остальные не подошли' })} ({results.excluded.length})</summary>
        {showExcluded && <ul className="mt-4 divide-y divide-gray-200">{results.excluded.map(match => <li key={match.machine.product.id} className="py-3 text-sm">
          <p className="font-medium text-gray-800">{match.machine.product.name}</p>
          <p className="mt-1 text-xs text-gray-600">{match.reasons.map(reason).join(' ')}</p>
        </li>)}</ul>}
      </details>}
      <p className="text-xs leading-relaxed text-gray-500">{t('laserSelector.resultsNote', { defaultValue: 'Результаты учитывают тип, материал, толщину и заданные размеры. Для комбинированных станков толщина резки листа не переносится автоматически на стенку трубы. Сброс возвращает обычное дерево категорий.' })}</p>
    </div>}
  </section>
}
