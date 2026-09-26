"use client"

import { useTheme } from "next-themes"
import {
  Check,
  Monitor,
  Moon,
  Palette as PaletteIcon,
  Sun,
  type LucideIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePalette } from "@/lib/theme/palette-provider"
import { PALETTES } from "@/lib/theme/palettes"
import { cn } from "@/lib/utils"

type ThemeMode = "light" | "dark" | "system"

const THEME_MODES: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

/**
 * Dropdown all-in-one untuk mengatur mode (light/dark/system) dan color palette.
 *
 * Anti-hydration: `useTheme()` mengembalikan `theme === undefined` pada render
 * pertama, dan nilai palette hanya diketahui setelah provider selesai mount.
 * Karena itu semua penanda aktif (centang + highlight) hanya dirender ketika
 * `mounted` sudah `true`, sehingga HTML render pertama server & client identik.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const { palette, setPalette, mounted } = usePalette()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Ubah tema & palette"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), className)}
      >
        <PaletteIcon className="size-[1.2rem]" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* --- Mode --- */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mode</DropdownMenuLabel>
          {THEME_MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = mounted && theme === mode.value

            return (
              <DropdownMenuItem
                key={mode.value}
                onClick={() => setTheme(mode.value)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  isActive && "bg-accent/60 font-medium text-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{mode.label}</span>
                {isActive && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* --- Color Palette --- */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Color Palette</DropdownMenuLabel>
          {PALETTES.map((p) => {
            const isActive = mounted && palette === p.id

            return (
              <DropdownMenuItem
                key={p.id}
                onClick={() => setPalette(p.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  isActive && "bg-accent/60 font-medium text-accent-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/15"
                  style={{ backgroundColor: p.swatch }}
                />
                <span className="truncate">{p.name}</span>
                {isActive && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
