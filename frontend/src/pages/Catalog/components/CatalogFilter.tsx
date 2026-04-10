import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Filter, FilterValue } from "@/api/productsApi";
import { useTranslation } from "react-i18next";

type CatalogFiltersProps = {
  onClose: () => void;
  filters?: Filter[];
  bounds: Record<string, { min: number; max: number }>;
  inDrawer?: boolean;
};

type RangeValues = { from: string; to: string };
const SLIDER_STEPS_FLOAT = 1000;
const SLIDER_STEPS_PRICE = 100;

const isPriceRangeFilter = (filter: Filter): boolean => {
  const code = String(filter.code ?? "").toLowerCase();
  const name = String(filter.name ?? "").toLowerCase();
  return (
    code.includes("price") || name.includes("price") || name.includes("цена")
  );
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const getDecimalPlaces = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  const asString = value.toString().toLowerCase();

  if (!asString.includes("e")) {
    const [, fraction = ""] = asString.split(".");
    return fraction.length;
  }

  const [base, exponentRaw] = asString.split("e");
  const exponent = Number(exponentRaw);
  const [, fraction = ""] = base.split(".");

  if (exponent >= 0) return Math.max(0, fraction.length - exponent);
  return fraction.length + Math.abs(exponent);
};

const formatNumber = (value: number, precision: number): string => {
  if (!Number.isFinite(value)) return "";
  const fixed =
    precision > 0 ? value.toFixed(precision) : String(Math.round(value));
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1");
};

const toNumber = (value: string): number => {
  return Number(String(value).replace(/[^\d.-]/g, ""));
};

const roundToStep = (
  value: number,
  min: number,
  step: number,
  precision: number,
): number => {
  if (!Number.isFinite(step) || step <= 0) {
    return Number(value.toFixed(precision));
  }
  const stepped = min + Math.round((value - min) / step) * step;
  return Number(stepped.toFixed(precision));
};

const valueToSlider = (
  value: number,
  min: number,
  max: number,
  sliderSteps: number,
): number => {
  const range = max - min;
  if (range === 0) return 0;
  return Math.round(((value - min) / range) * sliderSteps);
};

const sliderToValue = (
  sliderValue: number,
  min: number,
  max: number,
  sliderSteps: number,
): number => {
  const range = max - min;
  if (range === 0) return min;
  return min + (sliderValue / sliderSteps) * range;
};

const CatalogFilters = ({
  onClose,
  filters,
  bounds,
  inDrawer = false,
}: CatalogFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftRanges, setDraftRanges] = useState<Record<string, RangeValues>>(
    {},
  );
  const { t } = useTranslation();

  const rangeFilters = useMemo(
    () => (filters ?? []).filter((f) => f.uiType === "RANGE_SLIDER"),
    [filters],
  );

  const getLimits = useCallback(
    (f: Filter) => {
      const fallback = bounds[f.code];
      const rawMin = f.range?.min ?? fallback?.min ?? 0;
      const rawMax = f.range?.max ?? fallback?.max ?? 0;
      const min = Number(rawMin);
      const max = Number(rawMax);
      const stepCandidate = Number(f.range?.step ?? 1);
      const step =
        Number.isFinite(stepCandidate) && stepCandidate > 0 ? stepCandidate : 1;
      const safeMin = Math.min(min, max);
      const safeMax = Math.max(min, max);
      const useIntegerRange = isPriceRangeFilter(f);
      const precision = useIntegerRange
        ? 0
        : Math.max(
            getDecimalPlaces(safeMin),
            getDecimalPlaces(safeMax),
            getDecimalPlaces(step),
          );

      const normalizedMin = useIntegerRange ? Math.floor(safeMin) : safeMin;
      const normalizedMax = useIntegerRange ? Math.ceil(safeMax) : safeMax;
      const normalizedStep = useIntegerRange ? 1 : step;

      return {
        min: normalizedMin,
        max:
          normalizedMin === normalizedMax
            ? normalizedMin + normalizedStep
            : normalizedMax,
        step: normalizedStep,
        precision,
      };
    },
    [bounds],
  );

  const baseRanges = useMemo(() => {
    const nextRanges: Record<string, RangeValues> = {};

    rangeFilters.forEach((f) => {
      const { min, max } = getLimits(f);
      const raw = searchParams.get(f.code) ?? "";

      if (!raw) {
        nextRanges[f.code] = {
          from: formatNumber(min, getLimits(f).precision),
          to: formatNumber(max, getLimits(f).precision),
        };
      } else {
        const parts = raw.split(",", 2);
        nextRanges[f.code] = {
          from: parts[0] ?? formatNumber(min, getLimits(f).precision),
          to: parts[1] ?? formatNumber(max, getLimits(f).precision),
        };
      }
    });

    return nextRanges;
  }, [getLimits, rangeFilters, searchParams]);

  const ranges = useMemo(
    () => ({ ...baseRanges, ...draftRanges }),
    [baseRanges, draftRanges],
  );

  const setRange = (code: string, part: "from" | "to", value: string) => {
    const filter = (filters ?? []).find((x) => x.code === code);
    if (!filter) return;

    const { min, max, step, precision } = getLimits(filter);
    const isInteger = precision === 0;
    const normalizedRaw = String(value).replace(/,/g, ".");

    let sanitized = isInteger
      ? normalizedRaw.replace(/\D/g, "")
      : normalizedRaw.replace(/[^\d.]/g, "").replace(/\.(?=.*\.)/g, "");

    if (!sanitized) {
      sanitized = formatNumber(min, precision);
    }

    let nextNumber = Number(sanitized);
    if (!Number.isFinite(nextNumber)) {
      nextNumber = min;
    }

    nextNumber = clamp(nextNumber, min, max);
    nextNumber = roundToStep(nextNumber, min, step, precision);

    const nextValue = formatNumber(nextNumber, precision);

    setDraftRanges((prev) => {
      const current = prev[code] ??
        ranges[code] ?? {
          from: formatNumber(min, precision),
          to: formatNumber(max, precision),
        };
      const next = { ...current, [part]: nextValue };

      const fromValue = Number.isFinite(toNumber(next.from))
        ? toNumber(next.from)
        : min;
      const toValue = Number.isFinite(toNumber(next.to))
        ? toNumber(next.to)
        : max;

      if (fromValue > toValue) {
        if (part === "from") {
          next.to = next.from;
        } else {
          next.from = next.to;
        }
      }

      return {
        ...prev,
        [code]: next,
      };
    });
  };

  const normalizeRange = (
    f: Filter,
    value: RangeValues | undefined,
  ): RangeValues => {
    const { min: safeMin, max: safeMax, step, precision } = getLimits(f);
    const rawFrom = value?.from ?? "";
    const rawTo = value?.to ?? "";
    let numFrom = toNumber(rawFrom);
    let numTo = toNumber(rawTo);

    if (Number.isNaN(numFrom)) numFrom = safeMin;
    if (Number.isNaN(numTo)) numTo = safeMax;

    numFrom = clamp(numFrom, safeMin, safeMax);
    numTo = clamp(numTo, safeMin, safeMax);

    numFrom = roundToStep(numFrom, safeMin, step, precision);
    numTo = roundToStep(numTo, safeMin, step, precision);

    if (numFrom > numTo) numTo = numFrom;

    return {
      from: formatNumber(numFrom, precision),
      to: formatNumber(numTo, precision),
    };
  };

  const commitAndNormalize = (code: string) => {
    const f = (filters ?? []).find((x) => x.code === code);
    if (!f) return;

    const normalized = normalizeRange(f, ranges[code]);
    setDraftRanges((prev) => ({ ...prev, [code]: normalized }));
  };

  const applyRanges = () => {
    const params = new URLSearchParams(searchParams);

    rangeFilters.forEach((f) => {
      const normalized = normalizeRange(f, ranges[f.code]);
      const { min, max, precision } = getLimits(f);
      const cleanFrom = Number.isFinite(toNumber(normalized.from))
        ? toNumber(normalized.from)
        : min;
      const cleanTo = Number.isFinite(toNumber(normalized.to))
        ? toNumber(normalized.to)
        : max;
      const epsilon = Math.pow(10, -(precision + 2));

      if (
        Math.abs(cleanFrom - min) <= epsilon &&
        Math.abs(cleanTo - max) <= epsilon
      ) {
        params.delete(f.code);
      } else {
        params.set(
          f.code,
          `${formatNumber(cleanFrom, precision)},${formatNumber(cleanTo, precision)}`,
        );
      }
    });

    params.set("page", "1");
    setSearchParams(params, { replace: false });
    onClose();
  };

  const toggleCheckbox = (filterCode: string, valueId: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(filterCode);
    const values = current ? current.split(",").filter(Boolean) : [];

    const newValues = values.includes(valueId)
      ? values.filter((v) => v !== valueId)
      : [...values, valueId];

    if (newValues.length > 0) {
      params.set(filterCode, newValues.join(","));
    } else {
      params.delete(filterCode);
    }

    params.set("page", "1");
    setSearchParams(params, { replace: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams);
    (filters ?? []).forEach((f) => params.delete(f.code));
    params.set("page", "1");
    setSearchParams(params, { replace: false });
    setDraftRanges({});
    onClose();
  };

  return (
    <div
      className={
        inDrawer
          ? "bg-white"
          : "bg-white border border-gray-200 rounded-md mb-6 shadow-sm"
      }
    >
      <style>{`
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track { height: 4px; background: transparent; border: none; }
        input[type=range]::-moz-range-track { height: 4px; background: transparent; border: none; }
        input[type=range]::-moz-range-progress { background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: #F58322; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); position: relative; z-index: 50; }
        input[type=range]::-moz-range-thumb { pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: #F58322; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); position: relative; z-index: 50; border: none; }
      `}</style>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
        {(filters ?? []).map((f) => (
          <div key={f.code} className="space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-3">
                {f.name}
                {f.unitCode != null && f.unitCode !== "" && (
                  <span className="font-normal text-gray-500 ml-1">
                    ({f.unitCode})
                  </span>
                )}
              </h4>

              {f.uiType === "RANGE_SLIDER" &&
                (() => {
                  const {
                    min: safeMin,
                    max: safeMax,
                    step,
                    precision,
                  } = getLimits(f);
                  const sliderSteps = isPriceRangeFilter(f)
                    ? SLIDER_STEPS_PRICE
                    : SLIDER_STEPS_FLOAT;
                    console.log(sliderSteps)
                  if (safeMin === 0 && safeMax === 0) return null;

                  const fromStr =
                    ranges[f.code]?.from ?? formatNumber(safeMin, precision);
                  const toStr =
                    ranges[f.code]?.to ?? formatNumber(safeMax, precision);
                  const normalizedForView = normalizeRange(f, {
                    from: fromStr,
                    to: toStr,
                  });
                  const parsedFrom = toNumber(normalizedForView.from);
                  const parsedTo = toNumber(normalizedForView.to);
                  const numericFrom = Number.isFinite(parsedFrom)
                    ? parsedFrom
                    : safeMin;
                  const numericTo = Number.isFinite(parsedTo)
                    ? parsedTo
                    : safeMax;

                  const percentFrom = valueToSlider(
                    numericFrom,
                    safeMin,
                    safeMax,
                    sliderSteps,
                  );
                  const percentTo = valueToSlider(
                    numericTo,
                    safeMin,
                    safeMax,
                    sliderSteps,
                  );
                  const rangeStart = Math.min(percentFrom, percentTo);
                  const rangeEnd = Math.max(percentFrom, percentTo);
                  const fromThumbOnTop = percentFrom >= percentTo;

                  const handleSliderFromChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    const sliderVal = Number(e.target.value);
                    const rawVal = sliderToValue(
                      sliderVal,
                      safeMin,
                      safeMax,
                      sliderSteps,
                    );
                    const realVal = roundToStep(
                      rawVal,
                      safeMin,
                      step,
                      precision,
                    );
                    setRange(f.code, "from", formatNumber(realVal, precision));
                  };

                  const handleSliderToChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    const sliderVal = Number(e.target.value);
                    const rawVal = sliderToValue(
                      sliderVal,
                      safeMin,
                      safeMax,
                      sliderSteps,
                    );
                    const realVal = roundToStep(
                      rawVal,
                      safeMin,
                      step,
                      precision,
                    );
                    setRange(f.code, "to", formatNumber(realVal, precision));
                  };

                  return (
                    <div key={`range-${f.code}`}>
                      <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            inputMode={precision === 0 ? "numeric" : "decimal"}
                            pattern={
                              precision === 0 ? "[0-9]*" : "[0-9]*[.,]?[0-9]*"
                            }
                            min={safeMin}
                            max={safeMax}
                            step={step > 0 ? step : "any"}
                            value={fromStr}
                            onChange={(e) =>
                              setRange(f.code, "from", e.target.value)
                            }
                            onBlur={() => commitAndNormalize(f.code)}
                            className="w-full border border-gray-300 rounded px-3 py-2 pr-8 text-sm outline-none focus:border-[#F58322] transition-colors"
                          />
                          {f.unitCode != null && f.unitCode !== "" && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              {f.unitCode}
                            </span>
                          )}
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            inputMode={precision === 0 ? "numeric" : "decimal"}
                            pattern={
                              precision === 0 ? "[0-9]*" : "[0-9]*[.,]?[0-9]*"
                            }
                            min={safeMin}
                            max={safeMax}
                            step={step > 0 ? step : "any"}
                            value={toStr}
                            onChange={(e) =>
                              setRange(f.code, "to", e.target.value)
                            }
                            onBlur={() => commitAndNormalize(f.code)}
                            className="w-full border border-gray-300 rounded px-3 py-2 pr-8 text-sm outline-none focus:border-[#F58322] transition-colors"
                          />
                          {f.unitCode != null && f.unitCode !== "" && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              {f.unitCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative h-6 mb-4 select-none overflow-hidden">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#F58322] rounded z-10"
                          style={{
                            left: `${(rangeStart / sliderSteps) * 100}%`,
                            right: `${100 - (rangeEnd / sliderSteps) * 100}%`,
                          }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={sliderSteps}
                          value={percentFrom}
                          onChange={handleSliderFromChange}
                          onPointerUp={() => commitAndNormalize(f.code)}
                          className={`absolute left-0 w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none h-6 cursor-pointer ${fromThumbOnTop ? "z-30" : "z-20"}`}
                          style={{ background: "transparent" }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={sliderSteps}
                          value={percentTo}
                          onChange={handleSliderToChange}
                          onPointerUp={() => commitAndNormalize(f.code)}
                          className={`absolute left-0 w-full top-1/2 -translate-y-1/2 appearance-none pointer-events-none h-6 cursor-pointer ${fromThumbOnTop ? "z-20" : "z-30"}`}
                          style={{ background: "transparent" }}
                        />
                      </div>
                    </div>
                  );
                })()}

              {f.uiType === "CHECKBOX_LIST" && (
                <div className="flex flex-wrap gap-2">
                  {f.values?.map((v: FilterValue) => {
                    const isActive = (
                      searchParams.get(f.code)?.split(",") || []
                    ).includes(String(v.id));
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleCheckbox(f.code, String(v.id))}
                        className={`border rounded px-3 py-1.5 text-sm transition-colors ${isActive ? "bg-[#F58322] text-white border-[#F58322]" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}`}
                      >
                        {v.label}{" "}
                        {v.count > 0 && (
                          <span className="opacity-70">({v.count})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="m-4 flex justify-end gap-3">
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          {t("filters.resetAll")}
        </button>
        <button
          onClick={applyRanges}
          className="bg-[#F58322] text-white px-8 py-3 text-sm font-medium rounded hover:bg-[#DB741F] transition-colors"
        >
          {t("filters.apply")}
        </button>
      </div>
    </div>
  );
};

export default CatalogFilters;
