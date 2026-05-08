// Helper utilities placeholder
export function formatDate(date: Date): string {
  return date.toISOString();
}

export function formatCurrency(amount: number, currency: string = "MNT"): string {
  return `${amount.toLocaleString()} ${currency}`;
}
