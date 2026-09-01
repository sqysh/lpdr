const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatMoney(amount: number) {
  return usd.format(amount)
}

export function formatWithCommas(value: number | string) {
  return Number(value).toLocaleString('en-US')
}
