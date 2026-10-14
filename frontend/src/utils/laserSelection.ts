import { catalogAncestors, flattenCatalogTree, type CatalogTreeEntry } from './catalogTree.ts'
import type { AvailabilityInfo } from './productAvailability'

export type LaserKind = 'sheet' | 'tube' | 'roll'
export type LaserMaterial = 'mild' | 'stainless' | 'aluminium' | 'brass'
export type TubeProfile = 'round' | 'square' | 'rectangle'
export type LaserDraft = {
  kind: LaserKind
  material: LaserMaterial
  thickness: string
  length: string
  width: string
  profile: TubeProfile
  diameter: string
  side: string
  tubeWidth: string
  tubeHeight: string
}
export const LASER_DEFAULTS: LaserDraft = {
  kind: 'sheet', material: 'mild', thickness: '10', length: '3000', width: '1500',
  profile: 'round', diameter: '60', side: '60', tubeWidth: '100', tubeHeight: '50',
}
export const LASER_PICK_PARAM = 'calc_laser_pick'
const prefix = 'calc_laser_'
export type LaserRequest = Omit<LaserDraft, 'thickness' | 'length' | 'width' | 'diameter' | 'side' | 'tubeWidth' | 'tubeHeight'> & {
  thickness: number; length: number | null; width: number | null
  diameter: number | null; side: number | null; tubeWidth: number | null; tubeHeight: number | null
}
export type LaserCapabilities = {
  modes: LaserKind[]
  powerWatts: number | null
  sheetThickness: Partial<Record<LaserMaterial, number>>
  tubeThickness: Partial<Record<LaserMaterial, number>>
  rollThickness: Partial<Record<LaserMaterial, number>>
  workingLength: number | null; workingWidth: number | null; pipeLength: number | null
  roundMin: number | null; roundMax: number | null; squareMin: number | null; squareMax: number | null
  rectangleMin: number | null; rectangleMax: number | null; rollWidth: number | null
  rollMinThickness: number | null; rollMaxThickness: number | null; issues: string[]
}
export type LaserProduct = AvailabilityInfo & {
  id: number; slug: string; name: string; price: number | null; oldPrice?: number | null
  categoryId: number; categoryName: string; brandName?: string | null
  coverImage?: string | null; newProduct?: boolean
}
export type LaserMachine = { product: LaserProduct; capabilities: LaserCapabilities }
export type LaserOptions = { available: boolean; rootCategoryId: number | null; rootSlug: string | null; machines: LaserMachine[] }
export type LaserReason = 'materialMissing' | 'thicknessExceeded' | 'workingAreaMissing' | 'workingAreaExceeded'
  | 'pipeLengthMissing' | 'pipeLengthExceeded' | 'pipeSectionMissing' | 'pipeSectionExceeded'
  | 'rollWidthMissing' | 'rollWidthExceeded' | 'rollThicknessExceeded' | 'powerConflict'
  | 'configurationUnconfirmed' | 'parameterConflict' | 'sheetRotated' | 'atLimit' | 'modeExcluded'
export type LaserMatch = { machine: LaserMachine; status: 'match' | 'review' | 'excluded'; reasons: LaserReason[]; maxThickness: number | null }

export function laserCatalogRoot(category: CatalogTreeEntry | null, categories: readonly CatalogTreeEntry[]): CatalogTreeEntry | null {
  const flat = flattenCatalogTree(categories)
  const resolved = flat.find(c => String(c.id) === String(category?.id)) ?? category
  const path = catalogAncestors(resolved, flat)
  if (path.length && path.at(-1)?.parentId != null) return null
  if (path.some(c => c.isActive === false || /(?:accessor|component|equipment-for|osnast|zapchast|spare|consumable|комплект|оснастк|запчаст|расход|(?:^|[-\s])parts(?:$|[-\s]))/i.test(`${c.slug ?? ''} ${c.name}`))) return null
  return path.find(c => c.slug === 'lazernye-stanki') ?? null
}

const positive = (value: string): number | null => {
  const text = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null
  const numeric = Number(text)
  return Number.isFinite(numeric) && numeric > 0 && numeric <= 1e9 ? numeric : null
}
const numberOrNull = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null

export function laserRequest(draft: LaserDraft): LaserRequest | null {
  if (!['sheet', 'tube', 'roll'].includes(draft.kind) || !['mild', 'stainless', 'aluminium', 'brass'].includes(draft.material)) return null
  const thickness = positive(draft.thickness)
  if (thickness === null) return null
  const request: LaserRequest = { ...draft, thickness, length: null, width: null, diameter: null, side: null, tubeWidth: null, tubeHeight: null }
  if (draft.kind === 'sheet') {
    request.length = positive(draft.length); request.width = positive(draft.width)
    if (request.length === null || request.width === null) return null
  } else if (draft.kind === 'roll') {
    request.width = positive(draft.width)
    if (request.width === null) return null
  } else {
    request.length = positive(draft.length)
    if (request.length === null) return null
    if (draft.profile === 'round') request.diameter = positive(draft.diameter)
    else if (draft.profile === 'square') request.side = positive(draft.side)
    else if (draft.profile === 'rectangle') { request.tubeWidth = positive(draft.tubeWidth); request.tubeHeight = positive(draft.tubeHeight) }
    else return null
    const section = draft.profile === 'round' ? request.diameter : draft.profile === 'square' ? request.side :
      request.tubeWidth && request.tubeHeight ? Math.min(request.tubeWidth, request.tubeHeight) : null
    if (section === null || thickness * 2 >= section) return null
  }
  return request
}

export function readLaserDraft(params: URLSearchParams): LaserDraft {
  const result = { ...LASER_DEFAULTS }
  for (const key of Object.keys(result) as (keyof LaserDraft)[]) {
    const value = params.get(prefix + key)
    if (value !== null) (result as Record<string, string>)[key] = value
  }
  return result
}
export function clearLaserSelection(params: URLSearchParams): URLSearchParams {
  const result = new URLSearchParams(params)
  for (const key of [...result.keys()]) if (key.startsWith(prefix)) result.delete(key)
  return result
}
export function laserSelectionParams(params: URLSearchParams, draft: LaserDraft): URLSearchParams | null {
  if (!laserRequest(draft)) return null
  const result = clearLaserSelection(params)
  result.set(LASER_PICK_PARAM, 'true')
  for (const [key, value] of Object.entries(draft)) result.set(prefix + key, value)
  result.set('page', '1')
  return result
}

export function matchLaser(machine: LaserMachine, request: LaserRequest): LaserMatch {
  const c = machine.capabilities
  const reasons: LaserReason[] = [], missing: LaserReason[] = [], excluded: LaserReason[] = []
  const modeMatches = Array.isArray(c.modes) && c.modes.includes(request.kind)
  if (!modeMatches) return { machine, status: 'excluded', reasons: ['modeExcluded'], maxThickness: null }
  const ratings = request.kind === 'sheet' ? c.sheetThickness : request.kind === 'tube' ? c.tubeThickness : c.rollThickness
  const maxThickness = numberOrNull(ratings?.[request.material])
  if (maxThickness === null) missing.push('materialMissing')
  else if (request.thickness > maxThickness + 1e-9) excluded.push('thicknessExceeded')
  else if (Math.abs(request.thickness - maxThickness) < 1e-9) reasons.push('atLimit')

  if (request.kind === 'sheet') {
    const length = numberOrNull(c.workingLength), width = numberOrNull(c.workingWidth)
    if (length === null || width === null) missing.push('workingAreaMissing')
    else if (request.length! <= length && request.width! <= width) { /* normal orientation */ }
    else if (request.width! <= length && request.length! <= width) reasons.push('sheetRotated')
    else excluded.push('workingAreaExceeded')
  } else if (request.kind === 'tube') {
    const length = numberOrNull(c.pipeLength)
    if (length === null) missing.push('pipeLengthMissing')
    else if (request.length! > length) excluded.push('pipeLengthExceeded')
    const min = numberOrNull(request.profile === 'round' ? c.roundMin : request.profile === 'square' ? c.squareMin : c.rectangleMin)
    const max = numberOrNull(request.profile === 'round' ? c.roundMax : request.profile === 'square' ? c.squareMax : c.rectangleMax)
    const sides = request.profile === 'round' ? [request.diameter!] : request.profile === 'square' ? [request.side!] : [request.tubeWidth!, request.tubeHeight!]
    if (min === null || max === null) missing.push('pipeSectionMissing')
    if (sides.some(side => min !== null && side < min || max !== null && side > max)) excluded.push('pipeSectionExceeded')
  } else {
    const width = numberOrNull(c.rollWidth)
    if (width === null) missing.push('rollWidthMissing')
    else if (request.width! > width) excluded.push('rollWidthExceeded')
    const min = numberOrNull(c.rollMinThickness), max = numberOrNull(c.rollMaxThickness)
    if (min !== null && request.thickness < min || max !== null && request.thickness > max) excluded.push('rollThicknessExceeded')
  }
  const issues = Array.isArray(c.issues) ? c.issues : []
  if (issues.includes('powerConflict')) missing.push('powerConflict')
  if (issues.includes('configurationUnconfirmed')) missing.push('configurationUnconfirmed')
  const materialIssues = request.kind === 'sheet' ? ['materialConflict'] : request.kind === 'roll' ? ['rollMaterialConflict'] :
    c.modes.length === 1 ? ['tubeMaterialConflict', 'materialConflict'] : ['tubeMaterialConflict']
  const geometryIssues = request.kind === 'sheet' ? ['workingAreaConflict'] : request.kind === 'tube' ? ['pipeLengthConflict', 'geometryConflict'] : ['rollWidthConflict', 'geometryConflict']
  if (issues.some(issue => materialIssues.some(prefix => issue === `${prefix}:${request.material}`) || geometryIssues.includes(issue))) missing.push('parameterConflict')
  return { machine, status: excluded.length ? 'excluded' : missing.length ? 'review' : 'match',
    reasons: [...new Set([...excluded, ...missing, ...reasons])], maxThickness }
}

export function selectLasers(machines: readonly LaserMachine[], request: LaserRequest, inStockOnly = false, sort = 'stock') {
  const unique = [...new Map(machines.map(machine => [machine.product.id, machine])).values()]
    .filter(m => !inStockOnly || m.product.availability === 'IN_STOCK' || !m.product.availability && m.product.inStock === true)
  const evaluated = unique.map(m => matchLaser(m, request))
  const compare = (a: LaserMatch, b: LaserMatch) => {
    if (sort === 'stock') {
      const stock = (m: LaserMatch) => m.machine.product.availability === 'IN_STOCK' || !m.machine.product.availability && m.machine.product.inStock === true ? 1 : 0
      const difference = stock(b) - stock(a)
      if (difference) return difference
    }
    const price = (m: LaserMatch) => typeof m.machine.product.price === 'number' && Number.isFinite(m.machine.product.price) && m.machine.product.price > 0 ? m.machine.product.price : Number.POSITIVE_INFINITY
    const aPrice = price(a), bPrice = price(b)
    if (aPrice !== bPrice) return sort === 'price-desc' ? (aPrice === Infinity ? 1 : bPrice === Infinity ? -1 : bPrice - aPrice) : aPrice - bPrice
    return a.machine.product.id - b.machine.product.id
  }
  return { matches: evaluated.filter(m => m.status === 'match').sort(compare),
    review: evaluated.filter(m => m.status === 'review').sort(compare), excluded: evaluated.filter(m => m.status === 'excluded'), total: unique.length }
}
