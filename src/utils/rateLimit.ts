const actionMap = new Map<string, number[]>()

export function isRateLimited(key: string, limit = 5, windowMs = 5000): boolean {
  const now = Date.now()
  const prev = actionMap.get(key) ?? []
  const active = prev.filter((t) => now - t <= windowMs)
  if (active.length >= limit) {
    actionMap.set(key, active)
    return true
  }
  actionMap.set(key, [...active, now])
  return false
}
