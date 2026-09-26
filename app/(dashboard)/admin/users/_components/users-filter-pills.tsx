"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  ROLE_FILTERS,
  STATUS_FILTERS,
  STATUS_LABEL,
  type RoleFilter,
  type StatusFilter,
} from "../_hooks/use-user-filters"

/**
 * Satu grup pill generik untuk role + status. Kedua filter itu bentuknya
 * identik (label + deretan tombol toggle), jadi dua salinan berarti
 * setiap perubahan style harus aplicarse di dua tempat.
 */
function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  getLabel: (value: T) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      {options.map((opt) => {
        const active = opt === value
        return (
          <ButtonPill
            key={opt}
            active={active}
            onClick={() => onChange(opt)}
            label={getLabel(opt)}
          />
        )
      })}
    </div>
  )
}

function ButtonPill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        buttonVariants({
          variant: active ? "outline" : "ghost",
          size: "sm",
        }),
        active && "border-primary/50 font-medium",
      )}
    >
      {label}
    </button>
  )
}

interface UsersFilterPillsProps {
  roleFilter: RoleFilter
  onRoleChange: (value: RoleFilter) => void
  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void
}

export function UsersFilterPills({
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}: UsersFilterPillsProps) {
  return (
    <div className="flex flex-col gap-2">
      <PillGroup
        label="Role"
        options={ROLE_FILTERS}
        value={roleFilter}
        onChange={onRoleChange}
        getLabel={(v) => (v === "all" ? "Semua" : v)}
      />
      <PillGroup
        label="Status"
        options={STATUS_FILTERS}
        value={statusFilter}
        onChange={onStatusChange}
        getLabel={(v) => STATUS_LABEL[v]}
      />
    </div>
  )
}
