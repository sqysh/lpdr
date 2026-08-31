export function calculateStripeFees(amount: number) {
  if (!amount || amount <= 0) return 0
  return Math.round(((amount + 0.3) / (1 - 0.029) - amount) * 100) / 100
}
