import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PressBrakeOptions } from "@/api/categoriesApi";
import {
  ANGLES, THICKNESSES, calculatePressBrake, calculateMatrixVariants,
  MATERIAL_STRENGTH, type Material, type PressBrakeDraft,
} from "@/utils/pressBrakeCalculator";

type Props = {
  options?: PressBrakeOptions;
  isLoading: boolean;
  isError: boolean;
  initialDraft: PressBrakeDraft;
  hasAppliedCalculation: boolean;
  onApply: (draft: PressBrakeDraft) => void;
  onRetry: () => void;
};

const CategoryCalculator = ({ options, isLoading, isError, initialDraft, hasAppliedCalculation, onApply, onRetry }: Props) => {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState(initialDraft);
  const [customThickness, setCustomThickness] = useState(!THICKNESSES.includes(Number(initialDraft.thickness)));
  const calculation = calculatePressBrake(draft);
  const variants = calculateMatrixVariants(draft);
  const result = calculation.result;
  const changed = hasAppliedCalculation && JSON.stringify(draft) !== JSON.stringify(initialDraft);
  const number = (value: number, digits = 2) => value.toLocaleString(i18n.language || "ru", { maximumFractionDigits: digits });
  const setField = (field: keyof PressBrakeDraft, value: string) => setDraft((previous) => ({ ...previous, [field]: value }));
  const inputClass = "box-border h-11 sm:h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-0 text-base sm:text-sm leading-5 font-normal text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-[#F58322] focus:outline-none focus:ring-2 focus:ring-[#F58322]/15";
  const selectClass = `${inputClass} block appearance-none pr-9`;
  const labelClass = "flex min-w-0 flex-col gap-1.5 text-[13px] leading-5 font-medium text-gray-600";
  const selectArrow = <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500">
    <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
  const canApply = !!result && options?.available && !isError && !isLoading;
  const errors = {
    positiveNumbers: t("bendCalculator.positiveNumbers", { defaultValue: "Введите положительные значения толщины, длины, прочности и раскрытия матрицы." }),
    angle: t("bendCalculator.angleError", { defaultValue: "Выберите угол гибки из списка." }),
    margin: t("bendCalculator.marginError", { defaultValue: "Запас для подбора должен быть от 0 до 100%." }),
    narrowDie: t("bendCalculator.narrowDie", { defaultValue: "Для своей матрицы укажите раскрытие не меньше пяти толщин листа или выберите табличный вариант." }),
    overflow: t("bendCalculator.overflow", { defaultValue: "Значения слишком велики для расчёта. Проверьте размеры и единицы измерения." }),
  };
  const rows = [
    { key: "dieOpening" as const, label: t("bendCalculator.dieRow", { defaultValue: "Открытие матрицы, мм (V)" }) },
    { key: "minimumFlange" as const, label: t("bendCalculator.flangeRow", { defaultValue: "Минимальная полка, мм (h)" }) },
    { key: "innerRadius" as const, label: t("bendCalculator.radiusRow", { defaultValue: "Внутренний радиус, мм (Ri)" }) },
    { key: "forceTonnes" as const, label: t("bendCalculator.forceRow", { defaultValue: "Усилие гибки, тс (F)" }) },
  ];

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (canApply) onApply(draft); }} className="space-y-6">
      <p className="text-sm leading-relaxed text-gray-600">
        {t("bendCalculator.tableIntro", { defaultValue: "Укажите материал и размеры детали. Калькулятор покажет варианты матриц, минимальную полку, внутренний радиус и необходимое усилие. Выберите столбец для подбора станка." })}
      </p>
      <div className="grid grid-cols-1 items-start gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))]">
        <label className={labelClass}>
          {t("bendCalculator.material", { defaultValue: "Материал" })}
          <span className="relative block min-w-0">
            <select value={draft.material} className={selectClass} onChange={(event) => {
              const material = event.target.value as Material;
              setDraft((previous) => ({ ...previous, material, strength: material === "custom" ? previous.strength : String(MATERIAL_STRENGTH[material]) }));
            }}>
              <option value="mild">{t("bendCalculator.mild", { defaultValue: "Конструкционная сталь" })}</option>
              <option value="stainless">{t("bendCalculator.stainless", { defaultValue: "Нержавеющая сталь" })}</option>
              <option value="aluminium">{t("bendCalculator.aluminium", { defaultValue: "Алюминий" })}</option>
              <option value="custom">{t("bendCalculator.custom", { defaultValue: "Свой материал / прочность" })}</option>
            </select>
            {selectArrow}
          </span>
        </label>
        <div className="min-w-0 space-y-2">
          <label className={labelClass}>
            {t("bendCalculator.thickness", { defaultValue: "Толщина, мм (S)" })}
            <span className="relative block min-w-0">
              <select value={customThickness ? "custom" : String(Number(draft.thickness))} className={selectClass} onChange={(event) => {
                const custom = event.target.value === "custom";
                setCustomThickness(custom);
                setDraft((previous) => ({ ...previous, thickness: custom ? "" : event.target.value, dieOpening: "" }));
              }}>
                {THICKNESSES.map((value) => <option key={value} value={value}>{number(value)}</option>)}
                <option value="custom">{t("bendCalculator.customThickness", { defaultValue: "Своя толщина" })}</option>
              </select>
              {selectArrow}
            </span>
          </label>
          {customThickness && <input aria-label={t("bendCalculator.customThickness", { defaultValue: "Своя толщина" })} type="number" min="0" step="any" required value={draft.thickness}
            onChange={(event) => setDraft((previous) => ({ ...previous, thickness: event.target.value, dieOpening: "" }))} className={inputClass} />}
        </div>
        <label className={labelClass}>
          {t("bendCalculator.angle", { defaultValue: "Угол, град. (α)" })}
          <span className="relative block min-w-0">
            <select value={draft.angle} className={selectClass} onChange={(event) => setField("angle", event.target.value)}>
              {ANGLES.map((value) => <option key={value} value={value}>{value}°</option>)}
            </select>
            {selectArrow}
          </span>
        </label>
        <label className={labelClass}>
          {t("bendCalculator.length", { defaultValue: "Длина гиба, мм (L)" })}
          <input type="number" min="0" step="any" required value={draft.length} onChange={(event) => setField("length", event.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full min-w-[730px] border-collapse text-sm sm:text-base">
          <caption className="sr-only">{t("bendCalculator.table", { defaultValue: "Сравнение пяти вариантов матрицы" })}</caption>
          <thead className="bg-[#F58322] text-white">
            <tr>
              <th scope="col" className="w-[32%] px-4 py-4 text-left font-semibold">{t("bendCalculator.parameter", { defaultValue: "Параметр" })}</th>
              {variants.map((variant, index) => <th key={index} scope="col" className={`w-[13.6%] px-1 py-3 text-center ${index === 2 ? "bg-[#DB751E]" : ""}`}>
                <button type="button" disabled={!variant} aria-pressed={!!variant && result?.dieOpening === variant.dieOpening}
                  aria-label={variant ? t("bendCalculator.chooseDie", { defaultValue: "Выбрать матрицу V = {{value}} мм", value: variant.dieOpening }) : t("bendCalculator.noVariant", { defaultValue: "Вариант недоступен" })}
                  onClick={() => { if (variant) setField("dieOpening", index === 2 ? "" : String(variant.dieOpening)); }}
                  className="w-full rounded px-1 py-2 text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white">
                  {index === 2 ? <>{t("bendCalculator.recommended", { defaultValue: "Рекомендуемое" })}<span className="block mt-1">★</span></>
                    : <><span className="block">{variant && result?.dieOpening === variant.dieOpening ? t("bendCalculator.selected", { defaultValue: "Выбрано" }) : t("bendCalculator.choose", { defaultValue: "Выбрать" })}</span><span className="block mt-1">▼</span></>}
                </button>
              </th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => <tr key={row.key} className="border-b border-gray-200 last:border-b-0">
              <th scope="row" className="bg-gray-50 px-4 py-5 text-left font-medium text-gray-800">{row.label}</th>
              {variants.map((variant, index) => {
                const selected = !!variant && result?.dieOpening === variant.dieOpening;
                const value = variant?.[row.key];
                return <td key={index} data-testid={`${row.key}-${index}`} className={`px-2 py-5 text-center ${selected ? "bg-[#F58322] font-semibold text-white" : index === 2 ? "bg-orange-50 text-gray-900" : "bg-gray-50 text-gray-900"}`}>
                  {value == null ? "—" : number(value)}
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        {t("bendCalculator.tableNote", { defaultValue: "Значения справочные для предварительной оценки свободной гибки. Угол влияет на минимальную полку; оценка усилия в этой методике не зависит от угла. Варианты матриц не означают их наличие в комплектации станка." })}
      </p>
      {draft.material === "custom" && <p className="text-xs text-gray-600">{t("bendCalculator.customRadius", { defaultValue: "Для своего материала рассчитывается усилие; внутренний радиус нужно уточнить по свойствам металла и оснастке." })}</p>}

      <details open={draft.material === "custom" || undefined} className="rounded-md border border-gray-200 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-gray-700">{t("bendCalculator.settings", { defaultValue: "Точные настройки: прочность, своя матрица и запас" })}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className={labelClass}>{t("bendCalculator.strength", { defaultValue: "Прочность Rm, Н/мм²" })}
            <input type="number" min="0" step="any" required value={draft.strength} onChange={(event) => setDraft((previous) => ({ ...previous, material: "custom", strength: event.target.value }))} className={inputClass} />
          </label>
          <label className={labelClass}>{t("bendCalculator.die", { defaultValue: "Своя матрица V, мм" })}
            <input type="number" min="0" step="any" value={draft.dieOpening} onChange={(event) => setField("dieOpening", event.target.value)} placeholder={variants[2] ? number(variants[2].dieOpening) : "—"} className={inputClass} />
          </label>
          <label className={labelClass}>{t("bendCalculator.margin", { defaultValue: "Запас для подбора, %" })}
            <input type="number" min="0" max="100" step="any" required value={draft.margin} onChange={(event) => setField("margin", event.target.value)} className={inputClass} />
          </label>
        </div>
        <p className="mt-3 text-xs text-gray-500">{t("bendCalculator.settingsNote", { defaultValue: "Прочность можно заменить значением из паспорта металла. Пустое поле своей матрицы возвращает рекомендуемый вариант." })}</p>
      </details>

      {calculation.error && <p role="alert" className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">{errors[calculation.error]}</p>}
      {result && <div className="rounded-lg border-l-4 border-[#F58322] bg-orange-50 p-5 sm:p-6" aria-live="polite">
        <h4 className="text-lg font-bold text-[#DE741A]">{t("bendCalculator.resultTitle", { defaultValue: "Результат расчёта" })}</h4>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">{t("bendCalculator.forceResult", { defaultValue: "Усилие для выбранной матрицы" })} V = {number(result.dieOpening)} {t("bendCalculator.mm", { defaultValue: "мм" })}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900" data-testid="calculated-force">{number(result.forceTonnes)} {t("bendCalculator.tonnes", { defaultValue: "тс" })} <span className="text-base font-normal">({number(result.forceKN)} {t("bendCalculator.kn", { defaultValue: "кН" })})</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("bendCalculator.requiredResult", { defaultValue: "Пресс с запасом {{margin}}%", margin: draft.margin })}</p>
            <p className="mt-1 text-2xl font-bold text-[#D96912]" data-testid="required-force">≥ {number(result.requiredKN)} {t("bendCalculator.kn", { defaultValue: "кН" })}</p>
            <p className="mt-1 text-sm text-gray-600">≈ {number(result.requiredTonnes)} {t("bendCalculator.tonnes", { defaultValue: "тс" })} · {t("bendCalculator.lengthResult", { defaultValue: "рабочая длина от {{length}} мм", length: number(result.length) })}</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-600">{t("bendCalculator.pressSelectionNote", { defaultValue: "Подбор учитывает усилие и рабочую длину листогибочных прессов. Панелегибы используют другой способ гибки и в этом расчёте не участвуют. Совместимость и допустимую нагрузку оснастки нужно уточнить отдельно." })}</p>
      </div>}
      {changed && result && <p role="status" className="text-sm text-amber-800">{t("bendCalculator.changed", { defaultValue: "Расчёт обновлён. Нажмите «Подобрать станок», чтобы обновить товары ниже." })}</p>}
      {isError && <div role="alert" className="text-sm text-gray-700">
        <p>{t("bendCalculator.catalogError", { defaultValue: "Расчёт доступен, но параметры станков не загрузились." })}</p>
        <button type="button" onClick={onRetry} className="mt-2 text-[#D96912] underline">{t("pressSelection.retry", { defaultValue: "Повторить" })}</button>
      </div>}
      {!isError && isLoading && <p role="status" className="text-sm text-gray-600">{t("pressSelection.loading", { defaultValue: "Загружаем параметры товаров…" })}</p>}
      {!isError && !isLoading && (!options?.available || !options.totalProducts) && <p role="status" className="text-sm text-gray-600">{t("pressSelection.unavailable", { defaultValue: "Пока нет товаров с заполненными усилием пресса и рабочей длиной гибки." })}</p>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="submit" disabled={!canApply} className="w-full sm:w-auto rounded-md bg-[#F58322] px-6 py-3 font-semibold text-white hover:bg-[#df741b] disabled:opacity-50">{t("pressSelection.apply", { defaultValue: "Подобрать станок" })}</button>
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer underline">{t("bendCalculator.formulaOnly", { defaultValue: "Формула расчёта" })}</summary>
          <p className="mt-2">F = 1,42 × Rm × S² × L / (1000 × V), {t("bendCalculator.kn", { defaultValue: "кН" })}</p>
        </details>
      </div>
    </form>
  );
};

export default CategoryCalculator;
