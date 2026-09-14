// Reference behavior and engineering lookup data, independently implemented:
// https://www.metal-tool.ru/ukb/kalkulyator-parametrov-i-usiliya-gibki.htm
export const PRESS_BRAKE_SOURCE = "https://www.metal-tool.ru/ukb/kalkulyator-parametrov-i-usiliya-gibki.htm";
export const TONNE_FORCE_KN = 9.80665;
// The reference uses 45/80/20 kgf/mm². Keep our existing Rm input in N/mm².
export const MATERIAL_STRENGTH = {
  mild: 45 * TONNE_FORCE_KN, stainless: 80 * TONNE_FORCE_KN, aluminium: 20 * TONNE_FORCE_KN,
} as const;
export type Material = keyof typeof MATERIAL_STRENGTH | "custom";
export const THICKNESSES = [0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25];
export const ANGLES = [30, 45, 60, 90, 120, 135, 165];
const FLANGE_FACTORS: Record<number, number> = { 30: 1.94, 45: 1.31, 60: 1, 90: 0.71, 120: 0.58, 135: 0.55, 165: 0.51 };
const RADIUS_FACTORS: Record<keyof typeof MATERIAL_STRENGTH, number> = { mild: 5 / 32, stainless: 6 / 32, aluminium: 4 / 32 };
const OPENINGS = [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

export type PressBrakeDraft = {
  method: "press" | "panel";
  material: Material;
  thickness: string;
  angle: string;
  length: string;
  strength: string;
  dieOpening: string; // Empty selects the central recommended variant.
  margin: string;
};

export const DEFAULT_PRESS_BRAKE_DRAFT: PressBrakeDraft = {
  method: "press", material: "mild", thickness: "2", angle: "90", length: "1000",
  strength: String(MATERIAL_STRENGTH.mild), dieOpening: "", margin: "15",
};
export const CALCULATOR_PARAMS = {
  method: "calc_method",
  material: "calc_material", thickness: "calc_thickness", angle: "calc_angle", length: "calc_length",
  strength: "calc_strength", dieOpening: "calc_die", margin: "calc_margin",
} as const;
export const BENDING_MACHINE_TYPES = { press: "Листогибочный пресс", panel: "Панелегиб" } as const;

export function readPressBrakeDraft(params: URLSearchParams): PressBrakeDraft {
  const draft = { ...DEFAULT_PRESS_BRAKE_DRAFT };
  draft.method = params.get("panel_bender") === "true" || params.get("bending_machine_type") === BENDING_MACHINE_TYPES.panel || params.get(CALCULATOR_PARAMS.method) === "panel" ? "panel" : "press";
  for (const field of ["thickness", "angle", "length", "strength", "dieOpening", "margin"] as const) {
    draft[field] = params.get(CALCULATOR_PARAMS[field]) ?? draft[field];
  }
  const material = params.get(CALCULATOR_PARAMS.material);
  if (material === "mild" || material === "stainless" || material === "aluminium" || material === "custom") draft.material = material;
  return draft;
}

export function panelBenderRequest(draft: PressBrakeDraft) {
  const thickness = Number(draft.thickness.replace(",", "."));
  const length = Number(draft.length.replace(",", "."));
  if (draft.material === "custom" || ![thickness, length].every(value => Number.isFinite(value) && value > 0 && value <= Number.MAX_SAFE_INTEGER)) return null;
  return { panel_bender: "true", panel_material: draft.material, panel_thickness: String(thickness), bending_length: `${length},` };
}

export const BENDING_FILTER_PARAMS = ["press_brake", "panel_bender", "panel_material", "panel_thickness", "bending_force", "bending_length", "bending_machine_type"];

// Selecting a method browses that machine type, even with an unfinished draft.
// Only the Apply button claims a match to the calculation or material limits.
export function bendingMethodParams(current: URLSearchParams, draft: PressBrakeDraft): URLSearchParams {
  const params = new URLSearchParams(current);
  for (const key of BENDING_FILTER_PARAMS) params.delete(key);
  params.set("bending_machine_type", BENDING_MACHINE_TYPES[draft.method]);
  for (const field of Object.keys(CALCULATOR_PARAMS) as (keyof PressBrakeDraft)[]) params.set(CALCULATOR_PARAMS[field], draft[field]);
  params.set("page", "1");
  return params;
}

export function bendingSelectionParams(current: URLSearchParams, draft: PressBrakeDraft): URLSearchParams | null {
  const request = draft.method === "panel" ? panelBenderRequest(draft) : (() => {
    const { result } = calculatePressBrake(draft);
    return result ? { press_brake: "true", bending_force: `${result.requiredKN},`, bending_length: `${result.length},` } : null;
  })();
  if (!request) return null;
  const params = new URLSearchParams(current);
  for (const key of BENDING_FILTER_PARAMS) params.delete(key);
  for (const [key, value] of Object.entries(request)) params.set(key, value);
  for (const field of Object.keys(CALCULATOR_PARAMS) as (keyof PressBrakeDraft)[]) params.set(CALCULATOR_PARAMS[field], draft[field]);
  params.set("page", "1");
  return params;
}

// The source's five-column table is centred on the standard opening nearest 8*S.
// For its thinnest sheets only the explicitly listed variants are available.
export function matrixOpenings(thickness: number): (number | null)[] {
  if (!Number.isFinite(thickness) || thickness <= 0) return [null, null, null, null, null];
  if (thickness === 0.5) return [null, null, 6, null, null];
  if (thickness === 0.6) return [null, null, 6, 8, null];
  const recommended = OPENINGS.reduce((best, value) => Math.abs(value - thickness * 8) < Math.abs(best - thickness * 8) ? value : best, 6);
  const index = OPENINGS.indexOf(recommended);
  return [-2, -1, 0, 1, 2].map((offset) => OPENINGS[index + offset] ?? null);
}

export type CalculationError = "positiveNumbers" | "angle" | "margin" | "narrowDie" | "overflow";
export type BendingResult = {
  forceKN: number;
  forceTonnes: number;
  requiredKN: number;
  requiredTonnes: number;
  dieOpening: number;
  minimumFlange: number;
  innerRadius: number | null;
  length: number;
};
export type BendingCalculation = { result: BendingResult; error?: never } | { result?: never; error: CalculationError };

export function calculatePressBrake(draft: PressBrakeDraft): BendingCalculation {
  const parse = (value: string) => value.trim() ? Number(value.replace(",", ".")) : Number.NaN;
  const thickness = parse(draft.thickness);
  const length = parse(draft.length);
  const strength = parse(draft.strength);
  const angle = parse(draft.angle);
  const dieOpening = draft.dieOpening === "" ? (matrixOpenings(thickness)[2] ?? Number.NaN) : parse(draft.dieOpening);
  const margin = parse(draft.margin);
  if (![thickness, length, strength, dieOpening].every((value) => Number.isFinite(value) && value > 0)) return { error: "positiveNumbers" };
  if (!ANGLES.includes(angle)) return { error: "angle" };
  if (!Number.isFinite(margin) || margin < 0 || margin > 100) return { error: "margin" };
  if (dieOpening < thickness * 5 && !(THICKNESSES.includes(thickness) && matrixOpenings(thickness).includes(dieOpening))) return { error: "narrowDie" };
  const forceKN = 1.42 * strength * thickness ** 2 * length / (1000 * dieOpening);
  const requiredKN = Math.ceil(forceKN * (1 + margin / 100));
  if (!Number.isFinite(forceKN) || !Number.isSafeInteger(requiredKN) || requiredKN <= 0) return { error: "overflow" };
  return { result: {
    forceKN, forceTonnes: forceKN / TONNE_FORCE_KN, requiredKN, requiredTonnes: requiredKN / TONNE_FORCE_KN,
    dieOpening, length, minimumFlange: dieOpening * FLANGE_FACTORS[angle]!,
    innerRadius: draft.material === "custom" ? null : dieOpening * RADIUS_FACTORS[draft.material],
  } };
}

export function calculateMatrixVariants(draft: PressBrakeDraft) {
  return matrixOpenings(Number(draft.thickness.replace(",", "."))).map((opening) => opening === null
    ? null : calculatePressBrake({ ...draft, dieOpening: String(opening) }).result ?? null);
}
