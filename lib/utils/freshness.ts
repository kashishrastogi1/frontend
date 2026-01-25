export function isStale(lastUpdated: string, maxHours = 24): boolean {
  const last = new Date(lastUpdated).getTime()
  const now = Date.now()

  const diffHours = (now - last) / (1000 * 60 * 60)
  return diffHours >= maxHours
}