export function getProgressPct(value: number, goal: number): number {
  if (!goal) return 0
  return Math.min(100, Math.round((value / goal) * 100))
}

export function sumAmount(arr: { totalAmount?: unknown }[]) {
  return arr.reduce((acc, r) => acc + Number(r.totalAmount ?? 0), 0)
}
