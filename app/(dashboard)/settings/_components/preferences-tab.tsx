"use client"

import { useTheme } from "next-themes"
import { BadgeCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/settings/constants"
import { NOTIF_OPTION_GROUPS, type NotifPrefs } from "@/lib/settings/mock-settings"

const THEME_LABEL: Record<(typeof THEME_OPTIONS)[number], string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

interface PreferencesTabProps {
  notifPrefs: NotifPrefs
  onToggleNotif: (key: keyof NotifPrefs) => void
  prefsDirty: boolean
  prefsSaved: boolean
  onSavePrefs: () => void
  language: string
  onLanguageChange: (value: string) => void
  timezone: string
  onTimezoneChange: (value: string) => void
  localeDirty: boolean
  localeSaved: boolean
  onSaveLocale: () => void
}

export function PreferencesTab({
  notifPrefs,
  onToggleNotif,
  prefsDirty,
  prefsSaved,
  onSavePrefs,
  language,
  onLanguageChange,
  timezone,
  onTimezoneChange,
  localeDirty,
  localeSaved,
  onSaveLocale,
}: PreferencesTabProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>
            Sesuaikan tampilan OmniStack dengan preferensi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant={theme === opt ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(opt)}
              >
                {THEME_LABEL[opt]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Notifikasi</CardTitle>
          <CardDescription>Atur bagaimana OmniStack mengabari Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIF_OPTION_GROUPS.map((group) => (
            <div key={group.group} className="space-y-2">
              <p className="text-sm font-medium">{group.group}</p>
              {group.options.map((opt) => (
                <div key={opt.key} className="flex items-center gap-3">
                  <Checkbox
                    id={`notif-${opt.key}`}
                    checked={notifPrefs[opt.key]}
                    onCheckedChange={() => onToggleNotif(opt.key)}
                  />
                  <Label htmlFor={`notif-${opt.key}`} className="font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" onClick={onSavePrefs} disabled={!prefsDirty}>
              Simpan Preferensi
            </Button>
            {prefsSaved && (
              <span
                role="status"
                className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
              >
                <BadgeCheck aria-hidden="true" />
                Tersimpan
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Bahasa &amp; Zona Waktu</CardTitle>
          <CardDescription>Lokalisasi tampilan dashboard (mock).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-language">Bahasa</Label>
            <Select
              value={language}
              onValueChange={(v) => onLanguageChange(v ?? language)}
            >
              <SelectTrigger id="settings-language" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-timezone">Zona Waktu</Label>
            <Select
              value={timezone}
              onValueChange={(v) => onTimezoneChange(v ?? timezone)}
            >
              <SelectTrigger id="settings-timezone" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" onClick={onSaveLocale} disabled={!localeDirty}>
              Simpan Bahasa &amp; Zona Waktu
            </Button>
            {localeSaved && (
              <span
                role="status"
                className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
              >
                <BadgeCheck aria-hidden="true" />
                Tersimpan
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
