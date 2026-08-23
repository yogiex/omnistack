"use client"

import { useState } from "react"
import { Cloud, Loader2, Plug, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Integration {
  id: string
  name: string
  provider: string
  connected: boolean
  lastSync?: string
}

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: "aws", name: "AWS Cost Explorer API", provider: "Amazon Web Services", connected: true, lastSync: "1 jam lalu" },
  { id: "gcp", name: "Google Cloud Billing API", provider: "Google Cloud", connected: true },
  { id: "azure", name: "Azure Cost Management", provider: "Microsoft Azure", connected: false },
  { id: "stripe", name: "Stripe Billing", provider: "Stripe", connected: false },
]

interface BudgetState {
  monthlyBudget: string
  warnThreshold: boolean
  criticalThreshold: boolean
  exceeded: boolean
  dailySpike: boolean
  emailNotif: boolean
  inAppNotif: boolean
  slackWebhook: boolean
  pagerDuty: boolean
}

const DEFAULT_BUDGET_STATE: BudgetState = {
  monthlyBudget: "1500",
  warnThreshold: true,
  criticalThreshold: true,
  exceeded: true,
  dailySpike: true,
  emailNotif: true,
  inAppNotif: true,
  slackWebhook: false,
  pagerDuty: false,
}

export function BudgetSettings({ isAdmin }: { isAdmin: boolean }) {
  const [budget, setBudget] = useState<BudgetState>(DEFAULT_BUDGET_STATE)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessageVisible, setSaveMessageVisible] = useState(false)
  const [testAlertSent, setTestAlertSent] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [configureFeedback, setConfigureFeedback] = useState<string | null>(null)

  function handleSaveSettings() {
    if (isSaving) return
    setIsSaving(true)
    window.setTimeout(() => {
      setIsSaving(false)
      setSaveMessageVisible(true)
      window.setTimeout(() => setSaveMessageVisible(false), 3000)
    }, 700)
  }

  function handleTestAlert() {
    setTestAlertSent(true)
    window.setTimeout(() => setTestAlertSent(false), 3000)
  }

  function handleResetDefaults() {
    setBudget(DEFAULT_BUDGET_STATE)
  }

  function handleSync(id: string) {
    if (syncingId) return
    setSyncingId(id)
    window.setTimeout(() => {
      setSyncingId(null)
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, lastSync: "Baru saja" } : i))
      )
    }, 1200)
  }

  function handleConfigure(name: string) {
    setConfigureFeedback(`${name}: configuration saved (mock)`)
    window.setTimeout(() => setConfigureFeedback(null), 3000)
  }

  if (!isAdmin) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings &amp; Alerts Configuration</CardTitle>
        <CardDescription>Configure global spending limits and alert delivery.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        {/* A) Global Budget Settings */}
        <section className="grid gap-5">
          <h3 className="text-sm font-semibold">Global Budget Settings</h3>

          <div className="grid gap-2">
            <Label htmlFor="monthly-budget" className="text-muted-foreground text-xs">
              Monthly Budget
            </Label>
            <div className="relative flex max-w-xs items-center">
              <span className="text-muted-foreground pointer-events-none absolute left-3 font-mono text-sm">$</span>
              <Input
                id="monthly-budget"
                type="number"
                min={0}
                value={budget.monthlyBudget}
                onChange={(e) => setBudget((b) => ({ ...b, monthlyBudget: e.target.value }))}
                className="pl-7 pr-14 font-mono"
              />
              <span className="text-muted-foreground pointer-events-none absolute right-3 font-mono text-xs">USD</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs">Alert Thresholds</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={budget.warnThreshold}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, warnThreshold: checked === true }))}
                />
                Warning at 75%
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={budget.criticalThreshold}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, criticalThreshold: checked === true }))}
                />
                Critical at 90%
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={budget.exceeded}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, exceeded: checked === true }))}
                />
                Budget exceeded
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={budget.dailySpike}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, dailySpike: checked === true }))}
                />
                Daily spike &gt;50%
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs">Notification Preferences</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={budget.emailNotif}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, emailNotif: checked === true }))}
                />
                Email to admin@omnistack.dev
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={budget.inAppNotif}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, inAppNotif: checked === true }))}
                />
                In-app notification
              </label>
              <label className="flex items-center gap-2 text-sm opacity-60">
                <Checkbox
                  disabled
                  checked={budget.slackWebhook}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, slackWebhook: checked === true }))}
                />
                Slack webhook
                <span className="text-muted-foreground text-[11px]">(requires integration)</span>
              </label>
              <label className="flex items-center gap-2 text-sm opacity-60">
                <Checkbox
                  disabled
                  checked={budget.pagerDuty}
                  onCheckedChange={(checked) => setBudget((b) => ({ ...b, pagerDuty: checked === true }))}
                />
                PagerDuty
                <span className="text-muted-foreground text-[11px]">(requires integration)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleTestAlert}>
              Test Alert
            </Button>
            <Button variant="ghost" onClick={handleResetDefaults}>
              Reset to Defaults
            </Button>
            {saveMessageVisible && (
              <span aria-live="polite" className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                Settings saved (mock)
              </span>
            )}
            {testAlertSent && (
              <span aria-live="polite" className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                Test alert sent (mock)
              </span>
            )}
          </div>
        </section>

        {/* B) Integrations */}
        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">Integrations</h3>

          {configureFeedback && (
            <p className="text-muted-foreground text-xs" aria-live="polite">
              Mock: {configureFeedback}
            </p>
          )}

          <ul className="divide-border grid divide-y rounded-lg border">
            {integrations.map((integration) => (
              <li key={integration.id} className="hover:bg-muted/50 flex flex-wrap items-center gap-3 px-3 py-3 transition-colors sm:flex-nowrap">
                <Cloud className="text-muted-foreground size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{integration.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {integration.provider}
                    {integration.connected && integration.lastSync && ` · last sync ${integration.lastSync}`}
                  </p>
                </div>
                {integration.connected ? (
                  <>
                    <Badge variant="secondary" className="gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      Connected
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleSync(integration.id)} disabled={syncingId !== null}>
                      {syncingId === integration.id && <Loader2 className="animate-spin" />}
                      {syncingId !== integration.id && <RefreshCw />}
                      Sync Now
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground text-xs">Not configured</span>
                    <Button variant="outline" size="sm" onClick={() => handleConfigure(integration.name)}>
                      <Plug />
                      Configure
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  )
}
