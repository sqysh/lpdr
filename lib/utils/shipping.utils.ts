/**
 * Shipping is charged once per line item, not per unit: two of the same shirt
 * ships once, two different products ship twice. The cart and the server both
 * use this so the displayed total matches what gets charged.
 */
export const shippingForLines = (lines: { shippingPrice?: number | null }[]) =>
  lines.reduce((sum, line) => sum + Number(line.shippingPrice ?? 0), 0)
