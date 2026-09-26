import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const colClass = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const

export function KpiGrid({
  children,
  cols = 4,
  className,
}: {
  children: ReactNode
  cols?: 2 | 3 | 4
  className?: string
}) {
  return (
    <div
      className={cn("grid grid-cols-1 items-stretch gap-4", colClass[cols], className)}
    >
      {children}
    </div>
  )
}
