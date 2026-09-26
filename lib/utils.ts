import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type UsdFractionDigits = 0 | 1 | 2

/**
 * Format nominal USD. Default 2 desimal (dipakai tabel, chart, dan tooltip).
 * Pass `0` untuk ringkas pada KPI headline.
 */
export function formatUSD(
  value: number,
  fractionDigits: UsdFractionDigits = 2
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
