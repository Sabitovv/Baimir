import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { Filter, FilterValue } from "@/api/productsApi";
import { useTranslation } from "react-i18next";
import { prioritizeManufacturerFilters } from '@/utils/catalogFilters';

type CatalogFiltersProps = {
  onClose: () => void;
  filters?: Filter[];
  bounds: Record<string, { min: number; max: number }>;
  inDrawer?: boolean;
};

type RangeValues = { from: string; to: string };
type RangePart = keyof RangeValues;
type Limits = {
  min: number;
  max: number;
  step: number;
  precision: number;
  // The step came from the backend, so typed values have to follow it too.
  strictStep: boolean;
};

const COLLAPSED_COUNT = 7;
const SEARCHABLE_FROM = 9;
const POPOVER_WIDTH = 328;
const MAX_PRECISION = 6;
const COMPACT_FROM = 1_000_000;
const PRICE_UNIT = "₸";
const EPSILON = 1e-9;

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

  const [base = "", exponentRaw = "0"] = asString.split("e");
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
  const normalized = String(value ?? "")
    .trim()
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "")
    .replace(/(?!^)-/g, "")
    .replace(/(\..*)\./g, "$1");

  if (!/\d/.test(normalized)) return Number.NaN;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const formatDisplay = (value: number, precision: number, lang: string) =>
  value.toLocaleString(lang, { maximumFractionDigits: precision });

const formatCompact = (value: number, precision: number, lang: string) =>
  Math.abs(value) >= COMPACT_FROM
    ? new Intl.NumberFormat(lang, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    : formatDisplay(value, precision, lang);

// The backend rarely sends a step; pick a round one so the slider lands on tidy values.
const niceStep = (min: number, max: number): number => {
  const range = max - min;
  if (!(range > 0)) return 1;
  const step = Number(`1e${Math.floor(Math.log10(range / 50))}`);
  return Number.isInteger(min) && Number.isInteger(max)
    ? Math.max(1, step)
    : step;
};

const normalizeRange = (
  value: RangeValues | undefined,
  limits: Limits,
  lead: RangePart = "from",
): { from: number; to: number } => {
  const { min, max, step, precision, strictStep } = limits;
  const fix = (raw: string | undefined, fallback: number) => {
    const parsed = toNumber(raw ?? "");
    if (Number.isNaN(parsed)) return fallback;
    const clamped = clamp(parsed, min, max);
    const stepped = strictStep
      ? min + Math.round((clamped - min) / step) * step
      : clamped;
    return Number(clamp(stepped, min, max).toFixed(precision));
  };

  const from = fix(value?.from, min);
  const to = fix(value?.to, max);
  if (from <= to) return { from, to };
  return lead === "from" ? { from, to: from } : { from: to, to };
};

// A generated step is anchored at zero, so the stops are round numbers and not offsets from an odd minimum.
const stepAnchor = (limits: Limits) => (limits.strictStep ? limits.min : 0);

const sliderBounds = (limits: Limits) => {
  const anchor = stepAnchor(limits);
  return {
    first: Math.floor((limits.min - anchor) / limits.step + EPSILON),
    last: Math.ceil((limits.max - anchor) / limits.step - EPSILON),
  };
};

const indexToValue = (index: number, limits: Limits): number =>
  Number(
    clamp(
      stepAnchor(limits) + index * limits.step,
      limits.min,
      limits.max,
    ).toFixed(limits.precision),
  );

const valueToIndex = (value: number, limits: Limits): number => {
  const { first, last } = sliderBounds(limits);
  if (value <= limits.min) return first;
  if (value >= limits.max) return last;
  return clamp(
    Math.round((value - stepAnchor(limits)) / limits.step),
    first,
    last,
  );
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path
      d="M4 6l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3">
    <path
      d="M3.5 8.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type RangeControlProps = {
  limits: Limits;
  value: RangeValues;
  unit: string;
  lang: string;
  fromLabel: string;
  toLabel: string;
  onChange: (next: RangeValues) => void;
  onSubmit?: () => void;
};

const RangeControl = ({
  limits,
  value,
  unit,
  lang,
  fromLabel,
  toLabel,
  onChange,
  onSubmit,
}: RangeControlProps) => {
  const [editing, setEditing] = useState<{
    part: RangePart;
    text: string;
  } | null>(null);
  const { min, max, precision } = limits;
  const normalized = normalizeRange(value, limits);
  const { first, last } = sliderBounds(limits);
  const span = Math.max(1, last - first);
  const fromIndex = valueToIndex(normalized.from, limits);
  const toIndex = valueToIndex(normalized.to, limits);
  // Thumbs can meet anywhere; keep the one that still has room to move on top.
  const fromOnTop = fromIndex >= toIndex && fromIndex > first;

  const commit = (next: { from: number; to: number }) =>
    onChange({
      from: formatNumber(next.from, precision),
      to: formatNumber(next.to, precision),
    });

  const handleType = (part: RangePart, raw: string) => {
    const text = raw.replace(precision === 0 ? /[^\d-]/g : /[^\d.,-]/g, "");
    setEditing({ part, text });
    onChange({ ...value, [part]: text });
  };

  const handleSlide = (part: RangePart, index: number) => {
    const next = indexToValue(index, limits);
    commit(
      part === "from"
        ? { from: Math.min(next, normalized.to), to: normalized.to }
        : { from: normalized.from, to: Math.max(next, normalized.from) },
    );
  };

  // The thumb centre travels between 9px and 100% - 9px, so the fill has to follow it.
  const trackOffset = (index: number) =>
    `calc(9px + ${(index - first) / span} * (100% - 18px))`;

  const renderInput = (part: RangePart, label: string) => (
    <label className="flex h-10 min-w-0 flex-1 cursor-text items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 transition-colors focus-within:border-[#F58322] focus-within:bg-white">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="text"
        inputMode={precision === 0 ? "numeric" : "decimal"}
        value={
          editing?.part === part
            ? editing.text
            : formatDisplay(normalized[part], precision, lang)
        }
        onFocus={(e) => {
          const input = e.currentTarget;
          setEditing({
            part,
            text: normalized[part].toLocaleString(lang, {
              useGrouping: false,
              maximumFractionDigits: precision,
            }),
          });
          // The click that focuses the field also places the caret, so select once it has settled.
          requestAnimationFrame(() => {
            if (document.activeElement === input) input.select();
          });
        }}
        onChange={(e) => handleType(part, e.target.value)}
        onBlur={() => {
          setEditing(null);
          commit(normalizeRange(value, limits, part));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none"
      />
      {unit && <span className="shrink-0 text-xs text-gray-400">{unit}</span>}
    </label>
  );

  const renderThumb = (part: RangePart, index: number, onTop: boolean) => (
    <input
      type="range"
      aria-label={part === "from" ? fromLabel : toLabel}
      min={first}
      max={last}
      step={1}
      value={index}
      onChange={(e) => handleSlide(part, Number(e.target.value))}
      className={`catalog-range absolute inset-x-0 top-1/2 m-0 h-5 w-full -translate-y-1/2 ${onTop ? "z-30" : "z-20"}`}
    />
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        {renderInput("from", fromLabel)}
        <span className="h-px w-2 shrink-0 bg-gray-300" />
        {renderInput("to", toLabel)}
      </div>
      <div className="relative mt-4 h-5 select-none">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
        <div
          className="absolute top-1/2 z-10 h-1 -translate-y-1/2 rounded-full bg-[#F58322]"
          style={{
            left: trackOffset(fromIndex),
            right: `calc(100% - ${trackOffset(toIndex)})`,
          }}
        />
        {renderThumb("from", fromIndex, fromOnTop)}
        {renderThumb("to", toIndex, !fromOnTop)}
      </div>
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-gray-400">
        <span>{formatDisplay(min, precision, lang)}</span>
        <span>{formatDisplay(max, precision, lang)}</span>
      </div>
    </div>
  );
};

type ListControlProps = {
  values: FilterValue[];
  selected: string[];
  multiple: boolean;
  searchLabel: string;
  emptyLabel: string;
  onToggle: (id: string) => void;
};

const ListControl = ({
  values,
  selected,
  multiple,
  searchLabel,
  emptyLabel,
  onToggle,
}: ListControlProps) => {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? values.filter((v) => v.label.toLowerCase().includes(needle))
    : values;

  return (
    <div>
      {values.length >= SEARCHABLE_FROM && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="mb-2 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition-colors focus:border-[#F58322] focus:bg-white"
        />
      )}
      <div
        role={multiple ? "group" : "radiogroup"}
        className="-mx-2 max-h-64 overflow-y-auto overscroll-contain"
      >
        {shown.map((v) => {
          const id = String(v.id);
          const isActive = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={isActive}
              onClick={() => onToggle(id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${!isActive && v.count === 0 ? "opacity-50" : ""}`}
            >
              <span
                className={`grid h-[18px] w-[18px] shrink-0 place-items-center border transition-colors ${multiple ? "rounded-[5px]" : "rounded-full"} ${isActive ? "border-[#F58322] bg-[#F58322] text-white" : "border-gray-300 bg-white"}`}
              >
                {isActive &&
                  (multiple ? (
                    <CheckIcon />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ))}
              </span>
              <span className="min-w-0 flex-1 truncate text-gray-800">
                {v.label}
              </span>
              {v.count > 0 && (
                <span className="text-xs tabular-nums text-gray-400">
                  {v.count}
                </span>
              )}
            </button>
          );
        })}
        {shown.length === 0 && (
          <p className="px-2 py-3 text-sm text-gray-400">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
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
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const openRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // The page drops its data while the next response loads; keep the last filters
  // of this category so the pills and an open popover do not flash away.
  const { pathname } = useLocation();
  const [kept, setKept] = useState({ pathname, filters });
  if (filters ? filters !== kept.filters : pathname !== kept.pathname) {
    setKept({ pathname, filters });
  }
  const currentFilters = filters ?? kept.filters;
  const fromLabel = t("filters.from", { defaultValue: "от" });
  const toLabel = t("filters.to", { defaultValue: "до" });
  const resetLabel = t("filters.reset", { defaultValue: "Сбросить" });

  const getDisplayValues = useCallback(
    (filter: Filter): FilterValue[] => {
      const values = filter.values ?? [];
      if (filter.code === "wifi") {
        return values.filter((v) => String(v.id) === "true");
      }
      return values;
    },
    [],
  );

  const getLimits = useCallback(
    (f: Filter): Limits => {
      const fallback = bounds[f.code];
      const rawMin = Number(f.range?.min ?? fallback?.min ?? 0);
      const rawMax = Number(f.range?.max ?? fallback?.max ?? 0);
      const low = Number.isFinite(rawMin) ? rawMin : 0;
      const high = Number.isFinite(rawMax) ? rawMax : 0;
      const useIntegerRange = isPriceRangeFilter(f);
      const min = useIntegerRange
        ? Math.floor(Math.min(low, high))
        : Math.min(low, high);
      const max = useIntegerRange
        ? Math.ceil(Math.max(low, high))
        : Math.max(low, high);

      const backendStep = Number(f.range?.step);
      const strictStep =
        !useIntegerRange && Number.isFinite(backendStep) && backendStep > 0;
      const step = strictStep ? backendStep : niceStep(min, max);
      const precision = useIntegerRange
        ? 0
        : Math.min(
            MAX_PRECISION,
            Math.max(
              getDecimalPlaces(min),
              getDecimalPlaces(max),
              getDecimalPlaces(step),
            ),
          );

      return {
        min,
        max: min === max ? min + step : max,
        step,
        precision,
        strictStep,
      };
    },
    [bounds],
  );

  const visibleFilters = useMemo(
    () =>
      prioritizeManufacturerFilters(currentFilters ?? []).filter((f) => {
        if (searchParams.has(f.code)) return true;
        if (f.uiType === "RANGE_SLIDER") {
          // A range with a single value cannot narrow anything.
          const raw = f.range ?? bounds[f.code];
          return raw != null && Number(raw.max) > Number(raw.min);
        }
        return getDisplayValues(f).length > 0;
      }),
    [currentFilters, bounds, searchParams, getDisplayValues],
  );

  const closePopover = useCallback(() => {
    setOpenCode(null);
    setDraftRanges({});
  }, []);

  useEffect(() => {
    if (inDrawer || !openCode) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (openRef.current && !openRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopover();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inDrawer, openCode, closePopover]);

  const unitOf = (f: Filter) =>
    f.unitCode || (isPriceRangeFilter(f) ? PRICE_UNIT : "");

  const selectedIds = (code: string) =>
    searchParams.get(code)?.split(",").filter(Boolean) ?? [];

  const getRange = (f: Filter, withDraft = true): RangeValues => {
    const draft = withDraft ? draftRanges[f.code] : undefined;
    if (draft) return draft;

    const { min, max, precision } = getLimits(f);
    const [from, to] = (searchParams.get(f.code) ?? "").split(",", 2);
    return {
      from: from || formatNumber(min, precision),
      to: to || formatNumber(max, precision),
    };
  };

  const getSummary = (f: Filter, withDraft: boolean): string => {
    if (f.uiType !== "RANGE_SLIDER") {
      const ids = selectedIds(f.code);
      if (ids.length === 0) return "";
      const [firstLabel, ...otherLabels] = (f.values ?? [])
        .filter((v) => ids.includes(String(v.id)))
        .map((v) => v.label);
      if (firstLabel === undefined) return String(ids.length);
      return otherLabels.length > 0
        ? `${firstLabel} +${otherLabels.length}`
        : firstLabel;
    }

    const isApplied = searchParams.has(f.code);
    if (!isApplied && !(withDraft && f.code in draftRanges)) return "";

    const limits = getLimits(f);
    const { from, to } = normalizeRange(getRange(f, withDraft), limits);
    const fromMoved = from > limits.min;
    const toMoved = to < limits.max;
    if (!isApplied && !fromMoved && !toMoved) return "";

    const format = (v: number) => formatCompact(v, limits.precision, lang);
    const body =
      fromMoved && !toMoved
        ? `${fromLabel} ${format(from)}`
        : toMoved && !fromMoved
          ? `${toLabel} ${format(to)}`
          : `${format(from)} – ${format(to)}`;
    const unit = unitOf(f);
    return unit ? `${body} ${unit}` : body;
  };

  const applyRanges = (targets: Filter[]) => {
    const params = new URLSearchParams(searchParams);

    targets.forEach((f) => {
      const limits = getLimits(f);
      const { from, to } = normalizeRange(getRange(f), limits);
      const epsilon = Math.pow(10, -(limits.precision + 2));

      if (from - limits.min <= epsilon && limits.max - to <= epsilon) {
        params.delete(f.code);
      } else {
        params.set(
          f.code,
          `${formatNumber(from, limits.precision)},${formatNumber(to, limits.precision)}`,
        );
      }
    });

    params.set("page", "1");
    setSearchParams(params, { replace: false });
    setDraftRanges({});
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

  const setRadioValue = (filterCode: string, valueId: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(filterCode);

    if (current === valueId) {
      params.delete(filterCode);
    } else {
      params.set(filterCode, valueId);
    }

    params.set("page", "1");
    setSearchParams(params, { replace: false });
  };

  const clearFilter = (code: string) => {
    setDraftRanges((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
    if (!searchParams.has(code)) return;

    const params = new URLSearchParams(searchParams);
    params.delete(code);
    params.set("page", "1");
    setSearchParams(params, { replace: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const categoryId = searchParams.get("categoryId");
    const sort = searchParams.get("sort");

    if (categoryId) params.set("categoryId", categoryId);
    params.set("sort", sort && sort.trim() ? sort : "price,ASC");
    params.set("page", "1");
    setSearchParams(params, { replace: false });
    setDraftRanges({});
    setOpenCode(null);
    if (inDrawer) onClose();
  };

  const togglePopover = (code: string, anchor: HTMLElement) => {
    if (openCode === code) {
      closePopover();
      return;
    }
    const { left } = anchor.getBoundingClientRect();
    setAlignRight(
      left + POPOVER_WIDTH > document.documentElement.clientWidth - 16,
    );
    setDraftRanges({});
    setOpenCode(code);
  };

  const renderControl = (f: Filter) => {
    if (f.uiType === "RANGE_SLIDER") {
      return (
        <RangeControl
          limits={getLimits(f)}
          value={getRange(f)}
          unit={unitOf(f)}
          lang={lang}
          fromLabel={fromLabel}
          toLabel={toLabel}
          onChange={(next) =>
            setDraftRanges((prev) => ({ ...prev, [f.code]: next }))
          }
          onSubmit={
            inDrawer
              ? undefined
              : () => {
                  applyRanges([f]);
                  setOpenCode(null);
                }
          }
        />
      );
    }

    const multiple = f.uiType === "CHECKBOX_LIST";
    return (
      <ListControl
        values={getDisplayValues(f)}
        selected={selectedIds(f.code)}
        multiple={multiple}
        searchLabel={t("filters.search", { defaultValue: "Поиск" })}
        emptyLabel={t("filters.nothingFound", {
          defaultValue: "Ничего не найдено",
        })}
        onToggle={(id) =>
          multiple ? toggleCheckbox(f.code, id) : setRadioValue(f.code, id)
        }
      />
    );
  };

  const rangeStyles = (
    <style>{`
      .catalog-range { -webkit-appearance: none; appearance: none; background: transparent; pointer-events: none; outline: none; }
      .catalog-range::-webkit-slider-runnable-track { height: 4px; background: transparent; border: none; }
      .catalog-range::-moz-range-track { height: 4px; background: transparent; border: none; }
      .catalog-range::-moz-range-progress { background: transparent; }
      .catalog-range::-webkit-slider-thumb { -webkit-appearance: none; box-sizing: border-box; pointer-events: auto; width: 18px; height: 18px; margin-top: -7px; border-radius: 50%; background: #fff; border: 2px solid #F58322; box-shadow: 0 1px 3px rgba(16,24,40,0.2); cursor: grab; transition: box-shadow 0.15s ease; }
      .catalog-range::-moz-range-thumb { box-sizing: border-box; pointer-events: auto; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 2px solid #F58322; box-shadow: 0 1px 3px rgba(16,24,40,0.2); cursor: grab; transition: box-shadow 0.15s ease; }
      .catalog-range:hover::-webkit-slider-thumb, .catalog-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 5px rgba(245,131,34,0.18); }
      .catalog-range:hover::-moz-range-thumb, .catalog-range:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 5px rgba(245,131,34,0.18); }
      .catalog-range:active::-webkit-slider-thumb { cursor: grabbing; }
      .catalog-range:active::-moz-range-thumb { cursor: grabbing; }
    `}</style>
  );

  if (inDrawer) {
    return (
      <div className="bg-white">
        {rangeStyles}
        <div className="divide-y divide-gray-100">
          {visibleFilters.map((f) => {
            const isOpen = openCode === f.code;
            const summary = getSummary(f, true);
            return (
              <div key={f.code}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenCode(isOpen ? null : f.code)}
                  className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {f.name}
                  </span>
                  <span className="flex min-w-0 shrink-0 items-center gap-2">
                    {summary && (
                      <span className="max-w-[9rem] truncate text-sm font-medium text-[#DB741F]">
                        {summary}
                      </span>
                    )}
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>
                {isOpen && <div className="pb-4">{renderControl(f)}</div>}
              </div>
            );
          })}
        </div>

        {/* Engines disagree on whether the drawer padding insets a sticky box; the shadow covers that strip either way. */}
        <div className="sticky bottom-0 z-40 -mx-4 mt-2 flex gap-3 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_16px_0_0_#fff]">
          <button
            type="button"
            onClick={clearAll}
            className="h-11 flex-1 rounded-lg bg-gray-100 text-sm text-gray-700 transition-colors hover:bg-gray-200"
          >
            {t("filters.resetAll")}
          </button>
          <button
            type="button"
            onClick={() => {
              applyRanges(
                visibleFilters.filter((f) => f.code in draftRanges),
              );
              onClose();
            }}
            className="h-11 flex-1 rounded-lg bg-[#F58322] text-sm font-medium text-white transition-colors hover:bg-[#DB741F]"
          >
            {t("filters.apply")}
          </button>
        </div>
      </div>
    );
  }

  const collapsible = visibleFilters.length > COLLAPSED_COUNT + 1;
  const shownFilters =
    !collapsible || showAll
      ? visibleFilters
      : visibleFilters.filter(
          (f, index) =>
            index < COLLAPSED_COUNT ||
            searchParams.has(f.code) ||
            f.code === openCode,
        );
  const hiddenCount = visibleFilters.length - shownFilters.length;
  const hasActive = visibleFilters.some((f) => searchParams.has(f.code));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm">
      {rangeStyles}
      <div className="flex flex-wrap items-center gap-2">
        {shownFilters.map((f) => {
          const isOpen = openCode === f.code;
          const isActive = searchParams.has(f.code);
          const summary = getSummary(f, false);
          const unit = unitOf(f);

          return (
            <div
              key={f.code}
              ref={isOpen ? openRef : undefined}
              className="relative"
            >
              <div
                className={`inline-flex h-8 items-center rounded-full border text-[13px] transition-colors ${
                  isActive
                    ? "border-[#F58322] bg-[#F58322]/10"
                    : isOpen
                      ? "border-gray-900 bg-white"
                      : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  title={f.name}
                  onClick={(e) => togglePopover(f.code, e.currentTarget)}
                  className={`inline-flex h-full items-center gap-1.5 rounded-full pl-3 outline-none focus-visible:ring-2 focus-visible:ring-[#F58322]/40 ${isActive ? "pr-1.5" : "pr-2"}`}
                >
                  <span
                    className={`max-w-[13rem] truncate ${isActive ? "text-gray-600" : "text-gray-800"}`}
                  >
                    {f.name}
                    {isActive && ":"}
                  </span>
                  {summary && (
                    <span className="max-w-[12rem] truncate font-semibold text-gray-900">
                      {summary}
                    </span>
                  )}
                  {!isActive && <ChevronIcon open={isOpen} />}
                </button>
                {isActive && (
                  <button
                    type="button"
                    aria-label={`${resetLabel}: ${f.name}`}
                    onClick={() => {
                      clearFilter(f.code);
                      if (isOpen) setOpenCode(null);
                    }}
                    className="mr-1 grid h-6 w-6 place-items-center rounded-full text-gray-500 outline-none transition-colors hover:bg-[#F58322]/20 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#F58322]/40"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>

              {isOpen && (
                <div
                  role="dialog"
                  aria-label={f.name}
                  style={{ width: POPOVER_WIDTH }}
                  className={`absolute top-full z-40 mt-2 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl ${alignRight ? "right-0" : "left-0"}`}
                >
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                    {f.name}
                    {unit && (
                      <span className="ml-1 font-normal text-gray-400">
                        {unit}
                      </span>
                    )}
                  </h4>

                  {renderControl(f)}

                  {f.uiType === "RANGE_SLIDER" ? (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          clearFilter(f.code);
                          if (isActive) setOpenCode(null);
                        }}
                        className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                      >
                        {resetLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          applyRanges([f]);
                          setOpenCode(null);
                        }}
                        className="h-9 rounded-lg bg-[#F58322] px-5 text-sm font-medium text-white transition-colors hover:bg-[#DB741F]"
                      >
                        {t("filters.apply")}
                      </button>
                    </div>
                  ) : (
                    isActive && (
                      <button
                        type="button"
                        onClick={() => clearFilter(f.code)}
                        className="mt-3 text-sm text-gray-500 transition-colors hover:text-gray-900"
                      >
                        {resetLabel}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}

        {collapsible && (showAll || hiddenCount > 0) && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-gray-300 pl-3 pr-2 text-[13px] text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
          >
            {showAll
              ? t("filters.collapse", { defaultValue: "Свернуть" })
              : t("filters.more", {
                  defaultValue: "Ещё {{n}}",
                  n: hiddenCount,
                })}
            <ChevronIcon open={showAll} />
          </button>
        )}

        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <CloseIcon />
            {t("filters.resetAll")}
          </button>
        )}
      </div>
    </div>
  );
};

export default CatalogFilters;
