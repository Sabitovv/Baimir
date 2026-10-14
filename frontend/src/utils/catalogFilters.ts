// Manufacturer is easy to find; laser-source brands remain a separate filter.
export function prioritizeManufacturerFilters<T extends { code: string }>(filters: readonly T[]): T[] {
  return [...filters].sort((a, b) => Number(b.code === 'manufacturer') - Number(a.code === 'manufacturer'))
}
