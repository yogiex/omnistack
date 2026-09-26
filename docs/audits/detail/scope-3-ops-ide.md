# Scope 3 — Ops Dashboards, Deployments & Cloud IDE

Audit target: `/mnt/storage/code/omnistack` · Next.js 16.3 App Router, `output: "export"` (static export), TypeScript, Tailwind v4, shadcn/ui on **Base UI**.
Research only — no repo file was modified. Note: `node_modules` is not installed in this checkout, so `npx eslint` / `tsc` could not be run; every finding below was verified by reading the source (and cross-checking `lib/mock-data.ts`, `lib/mock-ide-data.ts`, `components/ui/*`, `app/(dashboard)/layout.tsx`, `components/route-guard.tsx`, `lib/auth-context.tsx`).

**Confirmed context used throughout:** no Route Handlers, no Server Actions, no DB, no git provider, no AI provider. `grep` for `localStorage|sessionStorage|fetch(|axios` across the entire scope returns **zero hits** — nothing in this scope persists across a refresh (the only exception is the theme selector, which `next-themes` persists itself).

---

## Route Map

| URL | File | Purpose | Auth gate |
|---|---|---|---|
| `/finops` | `app/(dashboard)/finops/page.tsx` | FinOps cost dashboard shell | `RouteGuard` (login only) in `app/(dashboard)/layout.tsx:9` |
| `/gitops` | `app/(dashboard)/gitops/page.tsx` | Preview Environments (GitOps) | `RouteGuard requiredRole="USER"` (`gitops/page.tsx:6`) — **only page in scope with a role gate** |
| `/monitoring` | `app/(dashboard)/monitoring/page.tsx` | APM / logs / errors / cluster health | `RouteGuard` (login only) |
| `/error-tracking` | `app/(dashboard)/error-tracking/page.tsx` | Error list with stack traces | `RouteGuard` (login only) |
| `/deployments` | `app/(dashboard)/deployments/page.tsx` | Deployment history + active builds | `RouteGuard` (login only) |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Profile / API keys / integrations / prefs | `RouteGuard` (login only) |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Role-aware overview | `RouteGuard` (login only) |
| `/projects/:id/ide` | `app/(ide)/projects/[id]/ide/page.tsx` | Cloud IDE (server shell, `generateStaticParams`) | `RouteGuard` (login only) in `app/(ide)/layout.tsx:9` |

All 7 dashboard pages are thin server wrappers (`return <XClient />`) — no data is fetched on the server, and none of them can be, because the session lives in `localStorage` (`lib/auth-context.tsx:56`).

---

## Inventory

| File | LOC | Client/Server | Purpose | Data source |
|---|---|---|---|---|
| `app/(dashboard)/finops/page.tsx` | 5 | Server | Renders `FinOpsClient` | — |
| `app/(dashboard)/finops/finops-client.tsx` | 109 | Client | FinOps page composition + role title + partial RBAC | `lib/mock-data.ts` (`FINOPS_OVERVIEW`, `MOCK_BUDGET_ALERTS`, `MOCK_COST_BREAKDOWN`, `MOCK_FINOPS_TREND`, `MOCK_OPTIMIZED_PROJECTS`, `MOCK_RECOMMENDATIONS`) |
| `finops/_components/finops-overview.tsx` | 180 | Client | 6 KPI cards + budget progress bar | `FINOPS_OVERVIEW` (prop) |
| `finops/_components/cost-trend-chart.tsx` | 234 | Client | 30-day stacked area chart (hand-rolled SVG) | `MOCK_FINOPS_TREND` |
| `finops/_components/cost-breakdown-table.tsx` | 359 | Client | Per-project cost table, search/sort/expand/export | `MOCK_COST_BREAKDOWN` |
| `finops/_components/budget-alerts.tsx` | 193 | Client | Alert list, severity filters, dismiss/read | `MOCK_BUDGET_ALERTS` |
| `finops/_components/budget-settings.tsx` | 271 | Client | ADMIN-only budget + alert + integration config | module-local `INITIAL_INTEGRATIONS`, `DEFAULT_BUDGET_STATE` |
| `finops/_components/export-panel.tsx` | 286 | Client | Report generator + "recent exports" list | module-local `INITIAL_EXPORTS` |
| `finops/_components/optimization-recommendations.tsx` | 197 | Client | Savings recommendations, apply/dismiss/learn-more | `MOCK_RECOMMENDATIONS`, `MOCK_OPTIMIZED_PROJECTS` |
| `app/(dashboard)/gitops/page.tsx` | 10 | Server | `RouteGuard` + `GitOpsClient` | — |
| `app/(dashboard)/gitops/gitops-client.tsx` | 317 | Client | Preview env list, create/delete, webhook cards | module-local `INITIAL_ENVS` |
| `app/(dashboard)/monitoring/page.tsx` | 5 | Server | Renders `MonitoringClient` | — |
| `app/(dashboard)/monitoring/monitoring-client.tsx` | 839 | Client | 5 tabs: overview, performance, logs, errors, APM | module-local `AP_STATS`, `NODES`, `MOCK_LOGS`, `INITIAL_ALERT_RULES`, `CPU_SERIES`, `MOCK_PROJECTS` |
| `app/(dashboard)/error-tracking/page.tsx` | 5 | Server | Renders `ErrorTrackingClient` | — |
| `app/(dashboard)/error-tracking/error-tracking-client.tsx` | 503 | Client | Error list, filters, stack traces, status/assign | module-local `MOCK_ERRORS`, `USERS` |
| `app/(dashboard)/deployments/page.tsx` | 5 | Server | Renders `DeploymentsList` | — |
| `app/(dashboard)/deployments/deployments-list.tsx` | 366 | Client | Page state, filters, rollback/retry/cancel/new-deploy handlers | `getMockDeploymentsForRole`, `getMockProjectsByUser` |
| `deployments/_components/deployment-stats.tsx` | 122 | **Server-compatible** (no `"use client"`) | 5 stat cards from `MockDeployment[]` | props |
| `deployments/_components/active-deployments.tsx` | 208 | Client | "Live" builds + pipeline progress + cancel | props |
| `deployments/_components/ai-diagnose-dialog.tsx` | 147 | Client | "Analyze with AI" dialog | hardcoded string |
| `deployments/_components/deployment-detail-modal.tsx` | 195 | Client | Pipeline timeline + commit + health check | props |
| `deployments/_components/deployments-filter-bar.tsx` | 177 | Client | Search + 3 selects + sort + view toggle | props |
| `deployments/_components/deployments-table.tsx` | 235 | Client | History table + per-row action menu | props |
| `deployments/_components/new-deployment-dialog.tsx` | 184 | Client | Project/branch/env form | props |
| `deployments/_components/rollback-dialog.tsx` | 108 | Client | Rollback confirm + reason | props |
| `app/(dashboard)/settings/page.tsx` | 5 | Server | Renders `SettingsClient` | — |
| `app/(dashboard)/settings/settings-client.tsx` | 814 | Client | 4 tabs: profile, API keys, integrations, preferences | `useAuth`, `next-themes`, module-local `INITIAL_API_KEYS`, `MOCK_SESSIONS` |
| `app/(dashboard)/dashboard/page.tsx` | 5 | Server | Renders `ClientDashboard` | — |
| `app/(dashboard)/dashboard/client-dashboard.tsx` | 408 | Client | Role-aware overview + quick actions | `getMockProjectsByUser`, `getMockDeploymentsForRole`, `MOCK_USERS`, `MOCK_PROJECTS` |
| `app/(ide)/layout.tsx` | 15 | Server | Full-bleed `h-svh` shell + `RouteGuard` | — |
| `app/(ide)/projects/[id]/ide/page.tsx` | 22 | Server (async) | `generateStaticParams` + `notFound()` guard | `MOCK_PROJECTS` (server, real) |
| `app/(ide)/projects/[id]/ide/ide-client.tsx` | 16 | Client | Derives `canWrite` from role, renders `IdeShell` | `useAuth` |
| `ide/_components/ide-shell.tsx` | 131 | Client | IDE composition, ⌘K listener, file state | `lib/mock-ide-data.ts` (static) |
| `ide/_components/ide-top-bar.tsx` | 78 | Client | Breadcrumb, branch, save state, Run/Deploy | props |
| `ide/_components/ide-activity-bar.tsx` | 125 | Client | 7 icon buttons + tooltips | props |
| `ide/_components/ide-file-explorer.tsx` | 79 | Client | Recursive file tree | `IDE_FILE_TREE` |
| `ide/_components/ide-editor.tsx` | 65 | Client | Tab strip + line numbers + `<pre>` | `IDE_OPEN_TABS`, `IDE_CODE` |
| `ide/_components/ide-right-panel.tsx` | 220 | Client | Preview / AI Pilot / Metrics tabs | `IDE_AI_HISTORY`, `IDE_AI_SUGGESTION`, `IDE_METRICS` |
| `ide/_components/ide-bottom-panel.tsx` | 106 | Client | Terminal / Problems / Output | `IDE_TERMINAL_LINES`, `IDE_PROBLEMS` |
| `ide/_components/ide-status-bar.tsx` | 81 | Client | Branch, problems, env, node, ⌘K | props |
| `ide/_components/ide-command-palette.tsx` | 98 | Client | ⌘K palette, label filter | `IDE_PALETTE` |
| `ide/_components/ide-deploy-dialog.tsx` | 146 | Client | Target/node selection + pre-deploy checklist | `DEPLOY_CHECKLIST`, `IDE_NODE` |

---

## Findings

### Client/Server boundary & rules-of-hooks (negative results, stated explicitly)

- **No rules-of-hooks violations found.** Every component in scope declares all hooks before any early `return`. Verified for all 21 hook-using files: the `return null` guards at `finops-client.tsx` (none — uses `isLoading`), `budget-settings.tsx:95`, `monitoring-client.tsx:231`, `error-tracking-client.tsx:213`, `deployments-list.tsx:150`, `active-deployments.tsx:98`, `settings-client.tsx:224`, `client-dashboard.tsx:87`, `deployment-detail-modal.tsx:58` all come *after* the last hook. The `react-hooks/immutability` gotcha (helper declared after the `useEffect` that uses it) does not trigger: the only two `useEffect`s in scope (`deployments-list.tsx:79-92`, `active-deployments.tsx:89-92`) reference no component-scoped helpers.
- **No `asChild` anywhere in the repo** (`grep -rn "asChild"` → 0 hits). Base UI is respected; the correct Base UI pattern is used at `ide-deploy-dialog.tsx:137` (`<DialogClose render={<Button …/>} />`) and `dialog.tsx:112`.
- **No `any`** in scope.
- **`cn()`** is used consistently for conditional classes.

---

### [CRITICAL] FinOps export chain is entirely fake (5 separate dead interactions)
- **Location:** `app/(dashboard)/finops/finops-client.tsx:75-78`, `finops/_components/cost-breakdown-table.tsx:112-115` + `311-320`, `finops/_components/export-panel.tsx:96-121`
- **Problem:** (a) The page-header `Export` button has **no `onClick` at all**. (b) The per-row `Export` button calls `handleExport`, which only sets `exportedId` and flips the label to `"Terekspor!"` for 2 s — no file, no blob, no `download` attribute. (c) `handleGenerateReport` invents a filename and a size from a rotating `SIZES` array (`export-panel.tsx:44,102-108`) and prepends it to the list; no file is produced. (d) `handleScheduleRecurring` only shows "(mock)" for 3 s. (e) The 4 `Include` checkboxes (`export-panel.tsx:189-212`) are never read by `handleGenerateReport` — the generated report would be identical regardless. (f) Download/Share icon buttons print `— Mock: Download` text.
- **Impact:** FinOps is the flagship "cost tracking" surface; every plausible way to get data out of it silently produces nothing while reporting success. Data loss of the user's only artifact.
- **Fix:** Either implement client-side export (`Blob` + `URL.createObjectURL` + `<a download>` for CSV/JSON; declare PDF/Excel as unimplemented and disable them), or remove the whole `ExportPanel` and the export buttons until a backend exists. Never render a success state without a produced artifact.

### [CRITICAL] "Set Budget" button is a `console.log`
- **Location:** `app/(dashboard)/finops/_components/cost-breakdown-table.tsx:322-331`
- **Problem:** `onClick={() => console.log(\`Mock: set budget ${item.projectName}\`)}` — no dialog, no value, no persistence. It is the only mutating budget control exposed to USER/ADMIN (`canManageBudget`, `finops-client.tsx:49`).
- **Impact:** The single most important FinOps write action is a no-op; users believe a budget was set.
- **Fix:** Gate the button behind a real budget dialog, or render it disabled with a "Segera" affordance like `settings-client.tsx:528`.

### [CRITICAL] Budget Settings card: every control is theatre
- **Location:** `app/(dashboard)/finops/_components/budget-settings.tsx:60-93` (Save 700 ms → "Settings saved (mock)", Test Alert → "Test alert sent (mock)", Sync Now → `lastSync: "Baru saja"`, Configure → `"…configuration saved (mock)"`), `:178-181` and `:188-191` (Slack webhook / PagerDuty checkboxes permanently `disabled`)
- **Problem:** Seven interactive controls, zero real effects; state is `useState` only and dies on refresh. The two disabled checkboxes imply a "requires integration" reason that is never explained beyond a `text-[11px]` suffix.
- **Impact:** ADMIN believes alerting is configured; a real incident would page nobody.
- **Fix:** Persist to a real store or mark the entire card as a preview with a single banner, matching what the dialog descriptions already hint at elsewhere in the app.

### [CRITICAL] "Lihat Detail" / "Learn More" / Apply / Dismiss are placeholders or cosmetic
- **Location:** `finops/_components/budget-alerts.tsx:167-172` ("Detail lengkap alert ini akan tersedia setelah integrasi backend."), `finops/_components/optimization-recommendations.tsx:57-63` (Apply), `:96-111` (Learn More → same placeholder text), `budget-alerts.tsx:66-76` (Dismiss / mark-read write into a `Set` in `useState` only)
- **Problem:** Apply removes the card into a "✅ Diterapkan" list (`:138-160`) implying the recommendation was executed against infrastructure; it was not. Dismiss/read are lost on refresh.
- **Impact:** Cost-optimisation claims are unverifiable and vanish on reload, eroding trust in every number on the page.
- **Fix:** Prefix the whole card with a "Preview data" state, or persist dismiss/apply in `localStorage` so at least the interaction is durable.

### [CRITICAL] FinOps RBAC scoping hole — org-wide data leaks to USER and VIEWER
- **Location:** `app/(dashboard)/finops/finops-client.tsx:88` (`FinOpsOverviewCards overview={FINOPS_OVERVIEW}` — unscoped), `:90` (`CostTrendChart data={MOCK_FINOPS_TREND}` — unscoped), `:98` (`optimized={MOCK_OPTIMIZED_PROJECTS}` — unscoped), `:102` (`BudgetAlerts alerts={MOCK_BUDGET_ALERTS}` — unscoped)
- **Problem:** Only `CostBreakdownTable` is scoped (`:35-39`, via `getMockProjectsByUser`, which returns `[]` for VIEWER — `lib/mock-data.ts:657-661`). Everything else shows the whole organisation. A VIEWER is shown the banner "Anda dapat melihat dan mengekspor laporan" (`:84`) plus an empty cost table, while `MOCK_BUDGET_ALERTS` leaks every project name, budget and overrun percentage (`lib/mock-data.ts:1267+`), and the "Sudah Optimal" list leaks project names and CPU/memory utilisation.
- **Impact:** The page title for USER is literally "FinOps Dashboard — Proyek Anda" (`:27`) while the numbers are global. RBAC is applied inconsistently within a single page.
- **Fix:** Derive one `visibleProjectIds` set in `finops-client.tsx` and filter the trend series, alerts and optimised list through it; for VIEWER either scope to `SHARED_PROJECT_IDS` or replace the page with an explicit "no shared projects" state.

### [CRITICAL] Monitoring "Export CSV / Download Full Log / Export PDF" are toast-only
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:632-658`
- **Problem:** All three buttons call `showNotice("…sedang disiapkan…")`, which sets a string and clears it after 3 s (`:266-269`). No file, no request.
- **Impact:** Log export is the entire justification for the Logs tab in an ops tool; users lose incident evidence.
- **Fix:** Implement CSV generation from `MOCK_LOGS` (or the real log source) via Blob, and disable the PDF button.

### [CRITICAL] Monitoring alert rules never leave the browser
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:243-264` (`toggleRule`, `deleteRule`, `addRule`), rendered at `:387-419`
- **Problem:** The UI advertises delivery to `Slack #alerts`, `Discord #ops`, `Email admin@omnistack.dev` (`:97-104`). Nothing is ever sent, nothing is persisted; the "Aktif/Nonaktif" badge is purely local.
- **Impact:** On-call illusion. This is the highest-severity class of "looks real, is fake" in the ops surface.
- **Fix:** Label the card "Preview" and disable mutations, or wire to a real alerting backend.

### [CRITICAL] Monitoring and Error Tracking apply no data scoping at all
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:72-81` (`MOCK_LOGS` contains all 4 projects) and `:568-570` (project filter iterates **all** `MOCK_PROJECTS` for every role); `app/(dashboard)/error-tracking/error-tracking-client.tsx:47-185` (`MOCK_ERRORS` for all projects, including a `STRIPE_WEBHOOK_SECRET` reference at `:151`) and `:313-315` (same unscoped project filter)
- **Problem:** `deployments-list.tsx:85` and `finops-client.tsx:37` both call `getMockDeploymentsForRole` / `getMockProjectsByUser`; these two pages do not. A logged-in VIEWER (who by the project's own model owns zero projects, `lib/mock-data.ts:660`) sees every project's logs, error rates and full stack traces, and can filter/expand them. Conversely, selecting a project the user does not own is offered.
- **Impact:** The mock dataset is shipped in the JS bundle anyway, so this is not a real breach — but the UI *claims* isolation elsewhere, and these two pages contradict the product's stated model. Consistency failure in the demo's core RBAC story.
- **Fix:** Reuse `getMockProjectsByUser` + `SHARED_PROJECT_IDS` here as well, and add a `RouteGuard requiredRole` to match `/gitops`.

### [CRITICAL] "AI Diagnose" returns a hardcoded answer unrelated to the error
- **Location:** `app/(dashboard)/deployments/_components/ai-diagnose-dialog.tsx:39-52`
- **Problem:** `handleAnalyze` waits 2 s and always sets the *same* `rootCause`/`fix`/`impact` about React 19 vs React 18, regardless of the `errorMessage` prop (`:23`, fed from `deployments-list.tsx:353-356`). There is no AI provider in the codebase. Also: `Create Issue` (`:136-139`) has **no `onClick` at all**; the copy icon button (`:106-112`) has no `aria-label`; `result` state (`:33-37`) is never reset, so reopening the dialog for a *different* deployment shows the previous diagnosis.
- **Impact:** Actively misleading: a user debugging a `docker build` OOM is told to downgrade React.
- **Fix:** Remove the feature, or clearly label it "示例 diagnosis (sample output)". Reset `result` on `deploymentId` change. Wire `Create Issue` or remove it.

### [CRITICAL] New deployments and retries never progress past "building"
- **Location:** `app/(dashboard)/deployments/deployments-list.tsx:221-251` (`handleNewDeployment`) and `:177-193` (`handleRetry`)
- **Problem:** Both insert a `MockDeployment` with `status: "building"` and a pipeline whose first step is `running`. No timer, no effect, no interval ever advances it. The row sits in "Active Deployments" with a spinner (`active-deployments.tsx:114-116`) forever.
- **Impact:** A user who clicks "Deploy Now" sees a build that never succeeds and can only "Cancel" it (`active-deployments.tsx:141-151`, which then marks it `failed`, `deployments-list.tsx:195-204`). The whole deployment feature is unusable end-to-end.
- **Fix:** Drive the pipeline with a single `setInterval`-based simulation (the file already imports `useEffect`), or make the dialog say "queued (demo)" and stop pretending to stream.

### [CRITICAL] "Auto-refresh setiap 10 detik" is a fake re-render loop
- **Location:** `app/(dashboard)/deployments/_components/active-deployments.tsx:88-92` and the caption at `:111`
- **Problem:** `const [, setTick] = useState(0)` + `setInterval(() => setTick(t => t + 1), 10000)`. The tick is never read; it re-renders the card (pipeline progress, up to 5 deployments) every 10 s to display the exact same data, while the caption asserts a live poll.
- **Impact:** Wasted CPU/battery forever, and it manufactures false confidence that a real build is being watched.
- **Fix:** Delete the interval and the caption, or replace it with a real poll.

### [CRITICAL] Rollback only appends a log line
- **Location:** `app/(dashboard)/deployments/deployments-list.tsx:159-175`
- **Problem:** `handleConfirmRollback` sets `status: "success"` and pushes `"✓ Rollback successful (reason)"` into `logLines`. Nothing is reverted: the pipeline steps still show the old build as `success`, `durationSeconds` is unchanged, and `commitSha`/`commitMessage` still describe the failed build. The reason text from `rollback-dialog.tsx:72-78` is string-concatenated into a log line, so it is not even an audit record.
- **Impact:** A destructive, production-affecting action is simulated. The badge flips to "Rolled Back" (`deployments-table.tsx:43-52`) which reads as a real state transition.
- **Fix:** Model rollback as a new deployment record referencing the target version, and mark the original as superseded. Until then, hide the action.

### [CRITICAL] GitOps preview environments are fabricated; "Buka URL" is permanently disabled
- **Location:** `app/(dashboard)/gitops/gitops-client.tsx:103-121` (create), `:208-211` (`Buka URL` with hardcoded `disabled`), `:113` + `STATUS_META.BUILDING` at `:80-84` (status frozen), `:239-279` (webhook/branch-protection cards are static badges)
- **Problem:** `handleCreate` mints `pr-${nextPr}.app.omnistack.dev` from a local counter; the URL is rendered as plain text (`:169-171`) with no link, no copy button, and the "open" button is disabled, so it is provably not reachable. Created envs stay `BUILDING` forever with an `animate-pulse` dot. The webhook card claims "✓ Aktif".
- **Impact:** The headline marketing feature ("GitOps Native — setiap Pull Request otomatis mendapat environment preview") is a 3-row local array. `nextPr` in `useState` (`:96`) resets on refresh, so PR numbers repeat.
- **Fix:** Keep the page as an explicitly labelled mock, or remove the "Buka URL"/"✓ Aktif" affordances that promise a working integration.

### [CRITICAL] Settings: profile save and password change are no-ops that report success
- **Location:** `app/(dashboard)/settings/settings-client.tsx:229-233` (`handleSave`), `:240-244` (`handleChangePassword`), `:390-407` (the two password `Input`s are **uncontrolled with no `value`/`onChange` and are never read**)
- **Problem:** "Simpan Perubahan" shows a "Tersimpan" `BadgeCheck` for 2 s and throws the typed name away. "Ganti Password" shows the *same* `saved` flag next to the *save* button, so a password change renders the profile's success indicator. Neither touches `localStorage["omnistack_user"]` (`lib/auth-context.tsx:28`), so the name is lost on refresh while the input still shows it.
- **Impact:** Users are told their credentials changed when nothing did — the most security-relevant lie in the scope.
- **Fix:** Persist to the session store and re-hydrate, or disable both controls with an explanatory banner.

### [CRITICAL] Settings 2FA renders as ENABLED by default with nothing enrolled
- **Location:** `app/(dashboard)/settings/settings-client.tsx:203` (`useState(true)`) and `:411-428`
- **Problem:** The checkbox starts checked and the label reads "· Aktif" before the user touches anything. Unchecking it writes nowhere.
- **Impact:** A user auditing their own account sees a green "2FA · Aktif" on an account that has no second factor. Same severity class as a fake session cookie.
- **Fix:** Default to `false` and label the control "(demo, tidak aktif)" until a provider exists.

### [CRITICAL] Settings API keys, sessions and integrations are local-only; "Kelola Repos" has no handler
- **Location:** `app/(dashboard)/settings/settings-client.tsx:262-270` (revoke/generate), `:294-298` + `:495-509` (revoke sessions), `:272-276` + `:660-674` (GitLab connect), `:634-641` (**`Kelola Repos` has no `onClick`**), `:179-182` (`MOCK_SESSIONS` is a module constant identical for every user)
- **Impact:** "Revoke" on an API key looks like a security action; the key returns on refresh. Generated keys use `Math.random()` and the `osk_live_` prefix (`:121-133`) — presenting them as live production secrets.
- **Fix:** Mark the tab as a demo, or move key management to the ADMIN area with real storage.

### [CRITICAL] Cloud IDE: the "Deploy Now" button does nothing — the entire IDE deploy flow terminates in a dead button
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-deploy-dialog.tsx:138-141`; also `:127-131` (the `view` button for the failing checklist item has no handler) and `:91-101` (the node `Select` uses `defaultValue`, so the chosen node is never read)
- **Problem:** `<Button disabled={!canWrite}><CircleX …/>Deploy Now</Button>` — no `onClick`, no state change, no feedback. The dialog's own description (`:57`) says "Mock — tidak memicu proses nyata", so the deception is at least documented, but the primary CTA still does nothing at all.
- **Impact:** The IDE's headline action is inert; combined with `ide-top-bar.tsx:71-74` (Deploy button) and the command palette, the IDE has three entry points to a no-op.
- **Fix:** Disable the button with a "not available in demo" label, or wire it to the same simulation as `deployments-list.tsx`.

### [CRITICAL] Cloud IDE "AI Pilot" is a black hole
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-right-panel.tsx:162-181` (form), `:151-157` (Apply Diff / Reject)
- **Problem:** The form's `onSubmit` only calls `e.preventDefault()` and `setAiInput("")` — the message is never appended to `IDE_AI_HISTORY` (imported as a module constant at `:20`), no request is made, no reply is rendered. `Apply Diff` and `Reject` have no `onClick`, so the "Saya generate 3 file" diff card (`:136-159`) is a screenshot.
- **Impact:** The IDE's headline AI feature accepts user input and silently discards it.
- **Fix:** Disable the composer with a "AI provider belum dikonfigurasi" placeholder, and remove the diff card.

### [CRITICAL] Command palette: 7 of 9 commands do nothing, and it cannot be driven from the keyboard
- **Location:** `app/(ide)/projects/[id]/ide/ide-shell.tsx:115-120` (handler), `ide/_components/ide-command-palette.tsx:30-32` (filter), `:47-54` (input)
- **Problem:** `onAction` only handles `"deploy-prod"` and `"deploy-preview"`. The remaining 7 entries in `IDE_PALETTE` (`lib/mock-ide-data.ts:261-271`: `ai-explain`, `preview-pr`, `change-stack`, `device-sim`, `switch-branch`, `ai-optimize`, `ai-adr`) close the palette and do nothing. There is no `ArrowUp/ArrowDown/Enter` handling, no `role="listbox"`/`option`, no `aria-activedescendant` — a "command palette" that is mouse-only. `query` (`:27`) is never reset on close, so a stale filter persists. Filtering matches `label` only, not `shortcut`.
- **Impact:** A VS-Code-style affordance that is ~78% non-functional and inaccessible to keyboard users.
- **Fix:** Implement a `cmdk`-style listbox with roving focus, or trim the palette to the 2 real actions.

### [CRITICAL] Cloud IDE "editor" is a read-only `<pre>`, and the disclaimer is hidden
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-editor.tsx:44-58` (`<pre>{lines.join("\n")}</pre>`), `:60-62` (the only disclosure, wrapped in `className="hidden …"`)
- **Problem:** No `contentEditable`, no textarea, no `onChange`, no syntax highlighting, no `tabIndex`/`role="textbox"`. The honest note ("read-only preview (mock). Editing membutuhkan Monaco di fase berikutnya.") is `display:none`, so a user never learns the editor cannot be typed into. Additionally, tab **close** buttons have no `onClick` (`:32-38`) and the tab strip itself is not clickable (`:18-41`) — the active file only changes via the explorer. `canWrite` is not even consulted by the editor.
- **Impact:** This is the central promise of a "Cloud IDE" product and it is a `<pre>` tag.
- **Fix:** Make the disclosure visible, or remove the IDE route until a real editor exists.

### [CRITICAL] IDE terminal prints a static array; Problems are inert; Output is a sentence
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-bottom-panel.tsx:56-69` (terminal), `:71-96` (problems), `:98-102` (output)
- **Problem:** The terminal maps `IDE_TERMINAL_LINES` (`lib/mock-ide-data.ts:194-204`, a captured `npm run dev` transcript) with no input, no prompt, no cursor, no scrollback. Problem rows are not clickable (cannot jump to `path:line`) and are not derived from the editor. The Output tab renders "Build log akan muncul di sini … — mock."
- **Impact:** Three tabs of a terminal panel, zero function.
- **Fix:** Label the panel "Sample output (read-only)".

### [CRITICAL] IDE activity bar: Search/Git mis-wired, 3 triggers with no handler, fake shortcuts
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-activity-bar.tsx:56` and `:63` (both `onClick: onToggleExplorer`), `:102` (Run & Debug), `:109` (Stack Builder), `:117` (Settings) — the last three have **no `onClick` at all**; shortcuts at `:46,54,61,69` advertise `⌘⇧E/⌘⇧F/⌘⇧G/⌘⇧A` but `ide-shell.tsx:45-54` implements only `⌘K`
- **Problem:** Clicking the magnifier or the git icon toggles the file explorer — a wrong-panel bug, not just a dead one. The explorer item's `active` flag is `explorerOpen && rightMode !== "ai"` (`:47`), so the Explorer icon de-highlights while the Explorer *is* open, whenever the AI panel is selected.
- **Impact:** A VS-Code-parity affordance bar that lies about both its icons and its shortcuts.
- **Fix:** Wire the shortcuts (one `keydown` handler already exists) and either implement the panels or remove the icons.

### [CRITICAL] IDE status bar: hardcoded counts, dead buttons, and a false "AI ready" claim
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-status-bar.tsx:23-26` (`{errors: 1, warnings: 2}` hardcoded, duplicating `IDE_PROBLEMS`), `:30-36` (branch button, no `onClick`), `:57-65` (node button, no `onClick`), `:67-69` (`<span title="AI provider siap">🤖 AI ready</span>`), `:49-52` (`env: development` rendered with a `ChevronDown` implying a dropdown)
- **Problem:** There is no AI provider in the codebase. The status bar is the most trusted surface in an IDE and it asserts one is ready.
- **Impact:** Misleading security/capability claim; the branch switcher is also duplicated as a second dead control (`ide-top-bar.tsx:49-55`).
- **Fix:** Delete the "AI ready" chip; derive counts from `IDE_PROBLEMS`.

### [CRITICAL] All RBAC in this scope is client-side only, and three mutating paths are reachable by a VIEWER
- **Location:** `components/route-guard.tsx:22-24` (the guard itself documents "ini proteksi UI (gimmick MVP), bukan keamanan sungguhan"); concrete holes: `app/(ide)/projects/[id]/ide/ide-shell.tsx:115-120` (the ⌘K palette opens the deploy dialog **without** the `canWrite` check that `ide-top-bar.tsx:71` applies — a VIEWER can open a production-deploy dialog), `app/(dashboard)/settings/settings-client.tsx:549` + `:590-598` (Generate New Key and Revoke are **not** gated by `isViewer`, while their neighbours — GitHub/Connect `:634,664` and "Cabut Semua Sesi Lain" `:499` — are), and `app/(dashboard)/deployments/deployments-table.tsx:196-224` (rollback/retry/AI-diagnose hidden by `isViewer` at the render layer only; the handlers `deployments-list.tsx:154-204` have no role check)
- **Problem:** In a static export every one of these datasets, plus `MOCK_USERS` **including plaintext passwords** (`lib/mock-data.ts:85-150`, e.g. `password: "admin123"`), is in the JS bundle. Any role check here is cosmetic.
- **Impact:** The RBAC narrative in `settings-client.tsx:57-62` ("Tidak ada aksi tulis apa pun" for VIEWER) is not true, and cannot be made true without a backend.
- **Fix:** State plainly in the UI/README that RBAC is a demo affordance; add the missing `isViewer` gates so the demo is at least internally consistent.

### [CRITICAL] "Hubungkan Git Provider" toggles a sentence
- **Location:** `app/(dashboard)/dashboard/client-dashboard.tsx:185-197`
- **Problem:** `onClick={() => setShowGitNotice(v => !v)}` renders "Integrasi Git segera hadir" next to a primary-looking button.
- **Impact:** The most prominent CTA on the landing dashboard is a text toggle.
- **Fix:** Render it as a `<Badge variant="secondary">Segera</Badge>` instead of a button.

---

### [MAJOR] Cost trend chart: hardcoded hex colours and a hardcoded budget that duplicates the source of truth
- **Location:** `app/(dashboard)/finops/_components/cost-trend-chart.tsx:19-22` (`#10b981`, `#f59e0b`, `#ef4444`, `#3b82f6`), `:172` (`#94a3b8`), `:59` (`const budgetRemaining = 1500 - projection30d`), `:198` (literal `Budget: $1,500`)
- **Problem:** (a) The 5 hex literals violate AGENTS ("JANGAN hardcode warna hex") and do not adapt to dark mode, unlike every other chart in the app. (b) The `1500` is a second copy of `FINOPS_OVERVIEW.budget` (`lib/mock-data.ts:1139`) hardcoded in the view; changing the budget in mock data leaves this card wrong. (c) The field is confusingly named `className` while holding a colour used as `fill`/`backgroundColor` (`:70,122,176`).
- **Impact:** Dark-mode contrast is unverified; budget figures can silently diverge.
- **Fix:** Accept `budget: number` as a prop and use the existing palette/Tailwind colour classes used elsewhere in the app.

### [MAJOR] Cost trend chart accessibility: no semantics, mouse-only tooltip, colour-only encoding
- **Location:** `app/(dashboard)/finops/_components/cost-trend-chart.tsx:89-93` (`<svg>` with no `role="img"` and no `aria-label` — contrast `monitoring-client.tsx:188-189`, which does it correctly), `:138-149` (hit areas are `<rect onMouseEnter/onMouseLeave>` only — no `onFocus`, no touch handling, no `tabIndex`), `:66-75` (legend swatches are colour-only dots), `:160-183` (tooltip is a `<div>` with no `role="tooltip"`, no `aria-live`, no `id`/`aria-describedby`)
- **Problem:** A screen-reader user gets an unlabelled SVG; a keyboard user cannot discover any data point; the four series are distinguished only by hue. The `SummaryItem` row (`:186-200`) gives avg/peak/lowest in text, which is the only accessible alternative and covers 4 of 30 days.
- **Impact:** Blocking a11y on the page's primary visualisation.
- **Fix:** Add `role="img"` + `aria-label` + `<title>`/`<desc>`, make hit areas focusable with `role="button"`, and render a visually-hidden `<table>` of the 30-day series.

### [MAJOR] Cost trend chart geometry bugs
- **Location:** `app/(dashboard)/finops/_components/cost-trend-chart.tsx:40` (`y1: Math.min(acc, Y_MAX)`), `:166` (tooltip `left` percentage)
- **Problem:** (a) Values above `Y_MAX = 60` are silently clipped, so a cost spike renders as a flat plateau with no indication that data was truncated. (b) The tooltip's `left` is a percentage of the **whole** relative container, but the SVG is offset by `ml-14` (`:92`) inside that container — the tooltip is systematically shifted left of the hovered column by the axis gutter. (c) `preserveAspectRatio="none"` (`:91`) distorts the strokes.
- **Fix:** Clamp with a visible "clipped" indicator, position the tooltip against the SVG's own box, and use `preserveAspectRatio="xMidYMid"`.

### [MAJOR] Nested interactive elements in the budget alerts card
- **Location:** `app/(dashboard)/finops/_components/budget-alerts.tsx:117-173` — a `<button type="button">` wraps the whole alert row, and two `<Button>` components (`:142-153` "Lihat Detail", `:155-165` "Dismiss") are rendered **inside** it
- **Problem:** `<button>` inside `<button>` is invalid HTML; browsers reparent the inner nodes, so the `e.stopPropagation()` guards (`:146,159`) are papering over a real DOM bug. Assistive tech and keyboard users get unpredictable focus behaviour; nested buttons are not reliably focusable.
- **Impact:** Blocking a11y + invalid markup on a whole card.
- **Fix:** Make the row a `<div>` (or `<li>`) with an explicit "expand" `<button>` for the title only.

### [MAJOR] Unassociated labels and unnamed icon buttons across monitoring / error-tracking
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:427,439,448` and `:562,574` — `<label>` with **no `htmlFor`** and no `id` on the `<select>`; `:410-417` — delete-rule `<Button>` contains only `<Trash2/>` with no `aria-label`/`sr-only`; `app/(dashboard)/error-tracking/error-tracking-client.tsx:307-337` — three `<select>` filters with **no label at all**; `app/(dashboard)/deployments/_components/new-deployment-dialog.tsx:74,90,105` — `<Label>` with no `htmlFor` on the Base UI `SelectTrigger`
- **Problem:** None of these controls have an accessible name from the label element. The project already demonstrates the fix elsewhere: `export-panel.tsx:141-147` uses `role="radiogroup"` + `aria-checked`, `cost-breakdown-table.tsx:162,202-207` uses `aria-label`/`aria-expanded`, `deployments-table.tsx:178-180` uses `sr-only`.
- **Impact:** Blocking a11y; the raw `<select>` elements are also a design-system violation (see MINOR list).
- **Fix:** Add `id`/`htmlFor` pairs and `aria-label` to every icon-only control.

### [MAJOR] Toasts are missing live-region semantics in two of four implementations
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:285-289`, `app/(dashboard)/error-tracking/error-tracking-client.tsx:346-350` — both render `className="fixed bottom-6 right-6 z-50 …"` with no `role="status"` / `aria-live`; contrast `app/(dashboard)/deployments/deployments-list.tsx:274` which does it correctly (`role="status" aria-live="polite"`)
- **Impact:** Deploy/cancel/rollback feedback is announced; monitoring and error-tracking feedback is silent for screen-reader users.
- **Fix:** Extract one shared `<Notice>` component and use it in all four places.

### [MAJOR] Deployments "Timeline view" toggle changes nothing
- **Location:** `app/(dashboard)/deployments/deployments-list.tsx:68` (`useState<DeployView>("list")`) and `:294` (passed to the filter bar); `deployments/_components/deployments-filter-bar.tsx:141-164` (the two icon buttons); the render at `deployments-list.tsx:320-330` always renders `<DeploymentsTable>`
- **Problem:** `view` is written by `onViewChange` and read nowhere else — `grep -n "view"` on `deployments-list.tsx` returns only lines 68 and 294. The "Timeline view" button is pure decoration and the two buttons look like a working view switcher.
- **Fix:** Implement the timeline, or remove the toggle and the `DeployView` type.

### [MAJOR] New Deployment dialog: two checkboxes whose state is discarded
- **Location:** `app/(dashboard)/deployments/_components/new-deployment-dialog.tsx:45` (`skipTests`), `:46` (`zeroDowntime`), consumed only at `:142` (display string) and never passed through `handleDeploy` (`:50-57`) or the `onDeploy` prop type (`:29-33`)
- **Problem:** "Skip tests (not recommended)" is a plausible, safety-relevant control that has no effect whatsoever on the created deployment. "Enable zero-downtime" only changes the word in a summary box.
- **Impact:** A user can tick "Skip tests" and believe tests were bypassed (they were not) — the inverse of the intended warning.
- **Fix:** Thread both flags into `onDeploy` and reflect them in the created `MockDeployment`, or remove them.

### [MAJOR] Monitoring time-range selector is decorative
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:323-333` (4 buttons), consumed only in the chart description at `:494` and `:501`
- **Problem:** Choosing "Last 1h" vs "Last 30d" leaves `CPU_SERIES`/`MEMORY_SERIES_MB` (`:130-131`, both always 12 points labelled 0m–55m) untouched. The card descriptions still say "Realtime terakhir" and the x-axis still shows the same fixed 12 labels (`:132,205-209`).
- **Impact:** Standard ops expectation ("zoom the time range") is unmet with no indication.
- **Fix:** Scale the series per range, or relabel the control as a display-only filter.

### [MAJOR] Web Vitals are hardcoded "Good"
- **Location:** `app/(dashboard)/monitoring/monitoring-client.tsx:49-53` (`good: true` on all three entries) and `:527-534` (the badge always renders the literal `Good`, with `vital.good &&` only toggling the *colour*)
- **Problem:** There is no threshold evaluation. A future LCP of 9 s would still render a green "Good" badge. The copy below ("Data dikumpulkan dari 1,248 sesi pengunjung", `:538-540`) asserts real RUM collection that does not exist.
- **Fix:** Compute `good` from the documented thresholds and render the failing state.

### [MAJOR] Error tracking: "Assign ke…" discards the assignment
- **Location:** `app/(dashboard)/error-tracking/error-tracking-client.tsx:240-243` (`assignTo` only calls `showNotice`) and `:467-489` (the dropdown)
- **Problem:** `TrackedError` has no `assignee` field (`:32-45`); choosing a user produces a toast and nothing else — the dropdown closes, the row is unchanged, and after a second assignment the first is unrecoverable. The dropdown also has no `role="menu"`, no keyboard navigation, no outside-click dismissal, and its inner `<button>`s lack `type="button"` (`:479-485`).
- **Fix:** Add `assignee` to the type and render it on the row.

### [MAJOR] Error tracking allocates a 664-element Set on every render
- **Location:** `app/(dashboard)/error-tracking/error-tracking-client.tsx:225-227`
- **Problem:** `new Set(errors.flatMap(e => Array.from({length: e.affectedUsers}, (_, i) => \`${e.id}-user-${i}\`)))` builds 664 unique strings and a Set on **every** render, purely to compute what is arithmetically `sum(affectedUsers)` (all ids are unique by construction). `filteredErrors` (`:217-223`) is likewise recomputed on every render with no `useMemo`, unlike `cost-breakdown-table.tsx:77-101` which memoises the equivalent derivation.
- **Impact:** Unnecessary allocation on the most-interacted page in scope; inconsistent with the FinOps pattern.
- **Fix:** `errors.reduce((s, e) => s + e.affectedUsers, 0)` and wrap `filteredErrors` in `useMemo`.

### [MAJOR] Deployment detail modal: fabricated health check and fabricated commit SHA
- **Location:** `app/(dashboard)/deployments/_components/deployment-detail-modal.tsx:166-191` (four hardcoded "Passed" metrics — `Error rate: 0.0%`, `Response p95: 142ms`) and `:47-50` + `:159` (`getShortCommitHash` hashes `deployment.id` with char codes to invent a 7-hex "SHA")
- **Problem:** A green "Health Check" panel with invented numbers is the most trusted element in a post-deploy review. The same fake-SHA helper is duplicated at `deployments-table.tsx:72-75`, so both places render the same fabricated hash as if it came from git.
- **Fix:** Remove the panel; use `deployment.commitSha`, which the type already carries (`deployments-list.tsx:234`).

### [MAJOR] IDE: the file explorer is hard-wired to `acme-store` and folders cannot be opened
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-file-explorer.tsx:68` (hardcoded root label), `:71-75` (renders only `IDE_FILE_TREE[0].children`; any other root would be dropped), `:20-28` (folder `<button>` has **no `onClick`** → no collapse/expand), `:14,23,43` (inline `style={{ paddingLeft }}` — AGENTS forbids inline styles), missing `role="tree"`/`aria-expanded`/`aria-current`
- **Impact:** Combined with the next finding, `/projects/proj-002/ide` shows the breadcrumb "AI Chatbot" above an `acme-store` file tree. Directories are always expanded with no way to collapse, and the tree is a set of plain buttons with no tree semantics.
- **Fix:** Derive the tree from the project id; add expand state and ARIA tree roles; replace the padding style with a class or a CSS variable.

### [MAJOR] IDE renders one hardcoded project for every project id
- **Location:** `app/(ide)/projects/[id]/ide/page.tsx:21` (passes **only** `projectName`), `ide/_components/ide-shell.tsx:5-11` + `:43` (imports `IDE_FILE_TREE`, `IDE_CODE`, `IDE_OPEN_TABS`, `IDE_BRANCH`, `IDE_NODE` as module constants), `lib/mock-ide-data.ts:9` (`IDE_PROJECT_NAME = "acme-store"`)
- **Problem:** `generateStaticParams` correctly emits 6 routes (`page.tsx:5-7`) and `notFound()` correctly rejects unknown ids (`:17-19`), but all 6 pages are byte-identical apart from the breadcrumb text. Files, code, terminal output, problems, AI history and branch come from one hardcoded `acme-store` fixture.
- **Impact:** The IDE appears project-specific and is not. A VIEWER opening another team's project sees that project's name and the first project's source.
- **Fix:** Either scope the mock data per project id, or state the demo limitation in the top bar.

### [MAJOR] IDE panels are fixed-width and not resizable; `react-resizable-panels` is unused here
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-shell.tsx:73-99` (plain flex row; widths hardcoded at `ide-activity-bar.tsx:83` `w-11`, `ide-file-explorer.tsx:61` `w-60`, `ide-right-panel.tsx:50` `w-72`, and `ide-bottom-panel.tsx:28` `h-44`)
- **Problem:** The audit brief states `react-resizable-panels` v4.12.3 "IS installed (used by the IDE)". Verified otherwise: `grep -rn "react-resizable-panels"` matches **only** `app/(dashboard)/ai-architect/_components/ai-studio.tsx:4`. No IDE component imports it and no drag handles or separators exist.
- **Impact:** On a laptop the fixed `w-60 + w-72` side panels leave very little for the editor; users cannot reclaim space, which is the single most expected behaviour of an IDE.
- **Fix:** Wrap the shell in `Group`/`Panel`/`Separator` (already a dependency), or drop the dependency claim from the docs.

### [MAJOR] IDE save-state indicator lies
- **Location:** `app/(ide)/projects/[id]/ide/ide-shell.tsx:56-61` (`handleOpenFile` sets `saveState` to `"saving"` then back after 600 ms), `ide/_components/ide-top-bar.tsx:57-64` (renders "Saving…", and `"Saved · 12s ago"` with the `12s` hardcoded)
- **Problem:** *Opening* a file is reported as a save. Nothing is ever written. The "12s ago" is a literal, so the timestamp is wrong on load.
- **Impact:** The single most trust-bearing indicator in an editor (unsaved-changes state) is decorative.
- **Fix:** Remove the indicator, or tie it to a real (mock) save that also changes the buffer.

### [MAJOR] IDE top bar: "Run" and the branch switcher have no handlers
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-top-bar.tsx:67-70` (**`Run` has no `onClick`**), `:49-55` (branch `<button>` with `ChevronDown`, **no `onClick`**)
- **Problem:** Both look fully enabled (only gated by `canWrite`) and both are the primary actions of a top bar. The branch control is duplicated as a dead button in the status bar (`ide-status-bar.tsx:30-36`).
- **Fix:** Disable with tooltips, or implement.

### [MAJOR] IDE right panel: preview claims a live iframe, device buttons are dead, memory bar is faked
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-right-panel.tsx:74` (URL text), `:80-83` (a `LIVE · HMR` badge with an `animate-pulse` dot), `:86-87` ("Aplikasi rendered dalam iframe sandbox (mock)" — **there is no `<iframe>` anywhere in the file**), `:99-108` (Mobile/Tablet/Desktop buttons, **no `onClick`**), `:205` (memory bar `style={{ width: "25%" }}` hardcoded while the label reads `{metrics.ram}` = "128 MB")
- **Problem:** The Preview tab is the second headline claim of the IDE and it is a static box. The memory bar's width has no relationship to the value beside it, so a user comparing bars is reading noise.
- **Fix:** Either mount a real `<iframe src>` or rename the tab "Preview (disabled)".

### [MAJOR] IDE: "VIEWER: AI Pilot disembunyikan" is shown *and* the panel is displayed
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-right-panel.tsx:115-119` (message) vs `:120-134` (history rendered unconditionally) and `:35-66` (the mode tab is always clickable)
- **Problem:** The copy says the feature is hidden, then renders it. A VIEWER sees the full AI conversation; only the composer and the diff card are withheld (`:136`, `:162`). This also makes the RBAC story incoherent: the "hidden" panel is fully readable.
- **Fix:** Pick one: hide the tab for VIEWER, or reword to "read-only".

### [MAJOR] `projectNameOf` is a render-scoped function captured by `useMemo` without being a dependency
- **Location:** `app/(dashboard)/deployments/deployments-list.tsx:99-100` (definition) used inside the memo at `:107-140` whose dep array is `[deployments, searchQuery, projectFilter, statusFilter, environmentFilter, dateSort]`
- **Problem:** `react-hooks/exhaustive-deps` will flag this. It happens to be pure and dependency-free (`MOCK_PROJECTS` is a module constant), so there is no live bug — but it is the exact pattern the project gotcha warns about, and if the lookup ever becomes dynamic the memo will serve stale results. The identical helper is also used inside `handleRetry`/`handleNewDeployment`/`showNotice` call sites, so it is re-created on every render regardless.
- **Fix:** Hoist `projectNameOf` to module scope (it needs no closure) or wrap it in `useCallback` and add it to the deps.

### [MAJOR] Uncleaned timers everywhere; state updates can fire after unmount
- **Location:** `monitoring-client.tsx:266-269`, `error-tracking-client.tsx:229-232`, `deployments-list.tsx:94-97`, `deployments/_components/ai-diagnose-dialog.tsx:42-51`, `settings/settings-client.tsx:232,243,259,275,285,291,297` (7), `finops/_components/budget-settings.tsx:63-67,66,72,82-87,92`, `finops/_components/export-panel.tsx:99-111,116,120`, `finops/_components/cost-breakdown-table.tsx:114`, `ide/_components/ide-shell.tsx:60`
- **Problem:** Every one is a bare `window.setTimeout`/`setTimeout` with no `clearTimeout` and no effect cleanup. In the dialogs (`ai-diagnose-dialog`, `export-panel`, `budget-settings`) closing the dialog mid-animation leaves the timer to fire later — `ai-diagnose-dialog.tsx:42` in particular calls `setAnalyzing(false)`/`setResult(...)` after the component may be unmounted, and the nested `budget-settings.tsx:66` timeout can clobber a newer state.
- **Impact:** Leaked timers, and stale writes that can resurrect a dismissed dialog's state. The codebase already has the correct pattern at `deployments-list.tsx:79-92` and `active-deployments.tsx:89-92`.
- **Fix:** Route all simulated latency through one `useFakeTimeout(cb, ms)` hook that clears on unmount.

### [MAJOR] Server-Component-by-default violated on 6 pages whose data is entirely static
- **Location:** `app/(dashboard)/finops/page.tsx:1-5`, `monitoring/page.tsx:1-5`, `error-tracking/page.tsx:1-5`, `settings/page.tsx:1-5`, `dashboard/page.tsx:1-5`, `deployments/page.tsx:1-5` (all thin server wrappers) plus their `"use client"` clients; contrast `app/(dashboard)/deployments/_components/deployment-stats.tsx:1` which has **no** `"use client"` and is therefore a server component
- **Problem:** AGENTS mandates "Gunakan Server Components secara default" and only permits `"use client"` for hooks/browser APIs. FinOps' overview cards, the cost chart, the trend series, the monitoring stat cards, the entire error list and the deployment stats read only module constants — they are all server-renderable, as `deployment-stats.tsx` already proves. Because the whole tree is a client component, the full mock dataset (`lib/mock-data.ts`, ~1300 lines incl. 8 KB of HTML stack traces, and `lib/mock-ide-data.ts`) plus the shadcn/Base UI runtime is shipped in the client bundle for content that never changes.
- **Impact:** Violates the stated convention and inflates the JS payload of every ops page.
- **Fix:** Convert the presentational cards back to server components and keep only the interactive islands (`CostBreakdownTable`, filters, dialogs) as `"use client"`. The auth dependency is the only genuine reason for client rendering, and it can be isolated to a single provider consumer.

### [MAJOR] `MOCK_SESSIONS` and the "Hapus Akun" placeholder
- **Location:** `app/(dashboard)/settings/settings-client.tsx:179-182` (module constant, identical for every account), `:520-533` (a permanently `disabled` "Hapus Akun" in a "Zona Berbahaya" card that says "Aksi permanen yang tidak dapat dibatalkan")
- **Problem:** The danger zone advertises an irreversible action that can never be performed, and the session list is fictional and static.
- **Fix:** Remove the card until implemented, or label it "coming soon" as a badge instead of a disabled destructive button.

### [MAJOR] Dashboard: "Total User 6" contradicts its own caption "3 akun demo aktif"
- **Location:** `app/(dashboard)/dashboard/client-dashboard.tsx:118-124` — `value: String(MOCK_USERS.length)` (6: 3 active + 3 invited, `lib/mock-data.ts:85-150`) with `note: "3 akun demo aktif"`
- **Problem:** The card shows `6` above "3 akun demo aktif". An ADMIN sees a self-contradicting metric on the overview page.
- **Fix:** Compute `MOCK_USERS.filter(u => u.isActive).length` and use one number.

### [MAJOR] Dashboard: "Logs" navigates to the deployments list, not to logs
- **Location:** `app/(dashboard)/dashboard/client-dashboard.tsx:388-396` — `<Link href="/deployments">` with a `ScrollText` icon and the label "Logs", rendered per deployment row
- **Problem:** Every row's "Logs" link goes to the same unfiltered list page; the specific deployment is lost. A user debugging one failed build cannot reach its logs from the overview.
- **Fix:** Link to the detail modal/deep link (`/deployments?d=<id>`) or rename to "Riwayat".

### [MAJOR] Dashboard: VIEWER sees an empty project list but a populated deployment list
- **Location:** `app/(dashboard)/dashboard/client-dashboard.tsx:233-239` ("Data proyek tidak tersedia untuk role Viewer.") vs `:346-352` / `:94-97` (which uses `getMockDeploymentsForRole`, which returns the `SHARED_PROJECT_IDS` deployments for VIEWER — `lib/mock-data.ts:690`)
- **Problem:** `getMockProjectsByUser` returns `[]` for VIEWER but `getMockDeploymentsForRole` returns 2 shared deployments, so the same page says "no projects" and then lists deployments whose project name resolves through `projectNameById` (`MOCK_PROJECTS`, `:98-100`) — i.e. it shows project names in the deployment rows while claiming no projects are shared. The deployment links point at `/projects/proj-001`, whose own page will show a different (empty) result for the same VIEWER.
- **Fix:** Use `SHARED_PROJECT_IDS` consistently for the project list in VIEWER mode.

### [MAJOR] Nested `<main>` landmark on the deployments page
- **Location:** `app/(dashboard)/deployments/deployments-list.tsx:258` (`<main className="flex flex-col gap-6">`) inside `app/(dashboard)/layout.tsx`'s `<main className="flex flex-1 flex-col gap-4 p-4 …">`
- **Problem:** Two `main` landmarks on one page; the other six clients correctly use a `<div>`.
- **Fix:** Change to `<div>`.

---

### [MINOR] Hardcoded hex colours (AGENTS violation) — 5 occurrences, all in one file
- **Location:** `app/(dashboard)/finops/_components/cost-trend-chart.tsx:19,20,21,22,172`
- **Fix:** Use the Tailwind palette classes already used by the sibling charts, or a CSS variable.

### [MINOR] Raw Tailwind palette colours instead of semantic tokens (≈30 sites)
- **Location (representative):** `finops/_components/finops-overview.tsx:28` (`bg-red-500/amber-500/emerald-500`), `finops/_components/budget-alerts.tsx:37-46`, `finops/_components/export-panel.tsx:72-77`, `deployments/_components/deployment-stats.tsx:36` (`text-green-500`/`text-red-500`), `deployments/_components/active-deployments.tsx:26-30,47`, `deployments/_components/deployments-table.tsx:49-50,146-150`, `gitops/gitops-client.tsx:78-87,259`, `monitoring/monitoring-client.tsx:84-86,357,366,530,723-724,778`, `error-tracking/error-tracking-client.tsx:188-197`, `settings/settings-client.tsx:72-86,423,486,625`, `client-dashboard.tsx:59-79`, `ide/_components/ide-top-bar.tsx:59`, `ide-activity-bar.tsx`(none), `ide-right-panel.tsx:80-81,205`
- **Problem:** `bg-destructive`, `text-muted-foreground` and friends are used correctly elsewhere (e.g. `monitoring-client.tsx:86`, `:366`), so the app is internally inconsistent. Note this is *not* the "hex" rule — it is a design-token consistency issue, and the raw classes are not verified for dark-mode contrast.
- **Fix:** Map severity → token in one shared record (there are already 5 near-duplicate severity maps: `finops-overview.tsx:27-28`, `budget-alerts.tsx:32-48`, `cost-breakdown-table.tsx:43-59`, `gitops-client.tsx:72-89`, `error-tracking-client.tsx:187-197`).

### [MINOR] Raw `<select>` / `<input type="radio">` instead of the design-system components
- **Location:** `monitoring-client.tsx:428-436,449-457,562-571,575-584`; `error-tracking-client.tsx:307-316,318-327,328-337`; `deployments/_components/new-deployment-dialog.tsx:107-120`
- **Problem:** The app has `components/ui/select` (Base UI) and uses it in `deployments-filter-bar.tsx:88-139` and `settings-client.tsx:760-794`. These six raw `<select>`s have different focus rings, heights and dropdown rendering, and none of them support the Base UI keyboard/typeahead behaviour.
- **Fix:** Replace with `Select`.

### [MINOR] Emoji used as functional icons
- **Location:** `finops/_components/cost-breakdown-table.tsx:120` (📊), `budget-alerts.tsx:81` (⚠️), `:178` (🎉), `optimization-recommendations.tsx:119,127,133,140,164` (💡🔴🟡🟢✅), `deployments/_components/deployments-table.tsx:153-157` (🌐🔀), `new-deployment-dialog.tsx:117`, `monitoring-client.tsx:278` (no), `ide/_components/ide-status-bar.tsx:68` (🤖), `ide-right-panel.tsx:92` (🛒)
- **Problem:** AGENTS specifies Lucide for UI icons and `react-icons/si` for brands; emoji render inconsistently across platforms, cannot be sized/coloured via Tailwind, and are announced by screen readers.
- **Fix:** Use Lucide, or mark decorative emoji `aria-hidden`.

### [MINOR] Index keys on mapped arrays
- **Location:** `deployments/_components/active-deployments.tsx:53,177`; `deployments/_components/deployment-detail-modal.tsx:117,145`; `ide/_components/ide-editor.tsx:50`; `ide/_components/ide-bottom-panel.tsx:58,75`; `ide/_components/ide-right-panel.tsx:122`; `monitoring-client.tsx:765`
- **Problem:** AGENTS requires a `key` on every mapped item (satisfied) but index keys are an anti-pattern; the pipeline/terminal/log lists are static so the risk is low today, though `deployments-list.tsx:191` prepends new deployments, which would make `ide`-style index keys unstable if the pattern spread.
- **Fix:** Key by `step.name` / `log` / `p.path + p.line`.

### [MINOR] Dead fields in metadata records
- **Location:** `app/(dashboard)/error-tracking/error-tracking-client.tsx:187-191` (`STATUS_META[…].bg` never read — only `.className` at `:385`) and `app/(dashboard)/monitoring/monitoring-client.tsx:83-87` (`LEVEL_META[…].bg` never read — only `.className` at `:607`)
- **Fix:** Delete the unused `bg` keys or use them on the row container.

### [MINOR] Budget-alert filter badge styling is inverted for the "Semua" tab
- **Location:** `app/(dashboard)/finops/_components/budget-alerts.tsx:94-104`
- **Problem:** `activeFilter` is `undefined` for the `all` key (`:95`), so `variant={filter === activeFilter ? "secondary" : "ghost"}` evaluates `"all" === undefined` → `false` → the count badge on the **active** "Semua" tab is rendered `ghost` (lowest contrast), while on "Kritis"/"Peringatan" the active badge is `secondary`. The count of the selected tab is the least visible one.
- **Fix:** `variant={filter === key ? "secondary" : "ghost"}`.

### [MINOR] Threshold logic duplicated between the badge and the settings form
- **Location:** `finops/_components/cost-breakdown-table.tsx:52` (`label: "Warning (75%+)"`) and `lib/mock-data.ts:1309` (`pct >= 0.75`) vs `finops/_components/budget-settings.tsx:41,134` ("Warning at 75%") — three independent places encode 75%, and `budget-settings.tsx:43,141` encode 90% with no consumer at all.
- **Fix:** Export `BUDGET_THRESHOLDS` from `lib/constants.ts` and derive both.

### [MINOR] `BudgetSettings` returns `null` for non-admins, shrinking the page without explanation
- **Location:** `app/(dashboard)/finops/_components/budget-settings.tsx:95` (`if (!isAdmin) return null`) — legal (all 7 hooks precede it) but the USER role gets no hint that a global budget exists.
- **Fix:** Render a locked card with a "requires ADMIN" note.

### [MINOR] GitOps: URL is inert text; PR counter is component state
- **Location:** `app/(dashboard)/gitops/gitops-client.tsx:169-171` (URL as `<p>`), `:96` (`nextPr` in `useState`), `:137-140` (create button has no role gate — reachable by USER and ADMIN only because of the page-level guard).
- **Fix:** Render the URL as a copyable `<code>` with a copy button; derive the next PR from the list length.

### [MINOR] GitOps: `Sheet` needs no `SheetHeader` padding hack, and the confirm-delete is inline
- **Location:** `app/(dashboard)/gitops/gitops-client.tsx:283-314` (Base UI `Sheet` used correctly, no `asChild` ✓), `:189-205` (two-button inline confirm rather than a dialog)
- **Impact:** The inline confirm collapses the row's actions, which is a reasonable pattern; noted only because every other destructive action in scope (rollback, delete DB, delete user) uses a dialog.
- **Fix:** Acceptable as-is; note the inconsistency.

### [MINOR] `ExportPanel` fabricates file sizes from a rotating array
- **Location:** `app/(dashboard)/finops/_components/export-panel.tsx:44` (`SIZES = ["2.4 MB", "1.8 MB", "456 KB"]`), `:102` (`SIZES[totalExports % SIZES.length]`)
- **Problem:** A CSV can never be 2.4 MB here; the size is chosen by list length.
- **Fix:** Compute the real byte length of the generated payload.

### [MINOR] `export-panel.tsx` "Delete" silently removes a file the user never had
- **Location:** `app/(dashboard)/finops/_components/export-panel.tsx:123-126` (filter out of state) and `:262-270` (Trash2 button)
- **Fix:** Remove the delete affordance until exports are real.

### [MINOR] `formatIcon` sniffs the extension with `endsWith` chains
- **Location:** `app/(dashboard)/finops/_components/export-panel.tsx:70-78`
- **Fix:** Derive the icon from the `Format` that produced the entry instead of parsing the filename.

### [MINOR] Five different money/number formatters
- **Location:** `finops/_components/finops-overview.tsx:16-18` (`Intl` USD), `cost-trend-chart.tsx:25-27` (`Intl` USD), `cost-breakdown-table.tsx:61-63` (`"$" + toLocaleString`, no currency style), `optimization-recommendations.tsx:28-30` (`toLocaleString` with **no currency**, then a manual `$` at the call sites `:78,190`), `deployment-stats.tsx:80-81` (duration)
- **Problem:** `formatMoney` produces `$1,234` via string concatenation while the others produce `$1,234.00`; the same page can show two different formats of the same number.
- **Fix:** One `formatCurrency(value, {compact})` in `lib/utils.ts`.

### [MINOR] `TITLE_BY_ROLE` is declared three times
- **Location:** `finops/finops-client.tsx:25-29` (as a `const` with an inferred type), `monitoring/monitoring-client.tsx:35-39` (`Record<Role, string>`), `deployments/deployments-list.tsx:22-26` (`Record<Role, string>`)
- **Fix:** One `usePageTitle(scope)` hook or a `ROLE_SCOPES` constant in `lib/constants.ts`.

### [MINOR] The notice/toast pattern is re-implemented four times
- **Location:** `monitoring-client.tsx:285-289`, `error-tracking-client.tsx:346-350`, `deployments-list.tsx:273-277`, `client-dashboard.tsx:193-197`, plus 6 further "saved (mock)" spans in `finops/_components/budget-settings.tsx:209-218`, `export-panel.tsx:225-229,237-241`, `settings-client.tsx:437-442,510-515,669-674,740-745,800-805`
- **Fix:** One `<Notice tone>` + `useTransientMessage()` hook (which would also fix the timer-cleanup issue above).

### [MINOR] `StatCard` is implemented three times
- **Location:** `deployments/_components/deployment-stats.tsx:14-50` (private, but exactly the reusable shape), `monitoring-client.tsx:41-46` + `:303-316` and `:135-139` + `:794-807` (inline duplication of the same card), `client-dashboard.tsx:104-149` + `:203-216`, `error-tracking-client.tsx:259-290` (inline, hand-written)
- **Fix:** Promote `StatCard` to `components/stat-card.tsx` and reuse in all four dashboards.

### [MINOR] Duplicated helpers across sibling files
- **Location:** `getShortCommitHash` — `deployments/_components/deployments-table.tsx:72-75` and `deployment-detail-modal.tsx:47-50`; `PipelineStepIcon` — `active-deployments.tsx:23-36` and `deployment-detail-modal.tsx:32-45`; `ROLE_META` — `client-dashboard.tsx:42-81` and `settings-client.tsx:65-87`; problem counts — `lib/mock-ide-data.ts:213-232` vs `ide-status-bar.tsx:23-26`
- **Fix:** Extract to `_lib/` or `lib/`.

### [MINOR] `PERMISSION_SUMMARY` is marketing copy that the code does not honour
- **Location:** `app/(dashboard)/settings/settings-client.tsx:44-63` — VIEWER is told "Tidak ada aksi tulis apa pun", yet VIEWER can generate and revoke API keys (`:549`, `:590-598`), export FinOps reports, dismiss alerts, and mark all alerts read (`finops/_components/budget-alerts.tsx:154-165`, `:184-186`).
- **Fix:** Make the code match the copy, or soften the copy to "no destructive actions in the demo".

### [MINOR] "Read-only" is displayed next to the Role for every role
- **Location:** `app/(dashboard)/settings/settings-client.tsx:368-380` — the Role card always renders a `Read-only` chip, including for ADMIN and USER.
- **Fix:** Only show it for VIEWER.

### [MINOR] Pointless single-argument `cn()`
- **Location:** `ide/_components/ide-command-palette.tsx:72-74` (`cn("flex w-full …")` with one literal), `ide-shell.tsx` n/a, `client-dashboard.tsx:179,190` (`cn(buttonVariants(...))`), `cost-breakdown-table.tsx:305-307`, `client-dashboard.tsx:281-284,291-294,381-383,390-392`
- **Fix:** Call the class string directly.

### [MINOR] `ide-shell` computes the active buffer on every render and keeps a state for it
- **Location:** `app/(ide)/projects/[id]/ide/ide-shell.tsx:43` (`const activeCode = IDE_CODE[activePath] ?? ["// no content"]`) and `:59-60` (the fake save timer)
- **Fix:** Hoist to a `Map` lookup or `useMemo` keyed on `activePath` (trivial today, but the pattern is the one the rest of the scope uses inconsistently).

### [MINOR] `ide-shell` keeps `bottomOpen` state that is only ever toggled by the status bar
- **Location:** `app/(ide)/projects/[id]/ide/ide-shell.tsx:37,101-103,108`
- **Problem:** The terminal has no close button of its own and no ⌘J`-style shortcut, even though the status bar advertises toggling it.
- **Fix:** Add a close affordance to the panel header.

### [MINOR] `ide-command-palette.tsx:37` positions the dialog with an arbitrary `top-[20%]`
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-command-palette.tsx:36-39`
- **Problem:** `DialogContent` is `fixed top-1/2 -translate-y-1/2` by default; overriding only `top` leaves the `-translate-y-1/2` transform in place, so the popup is not where it appears to be. Also `sm:max-w-lg` duplicates the base `max-w-lg`.
- **Fix:** Use `className="top-[20%] translate-y-0 sm:max-w-lg"`.

### [MINOR] `ide-deploy-dialog.tsx` renders two close affordances
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-deploy-dialog.tsx:136-137` — `<DialogFooter showCloseButton>` (which injects a "Close" button, `components/ui/dialog.tsx:111-114`) *plus* an explicit `<DialogClose render={<Button>Cancel</Button>} />`.
- **Fix:** Drop `showCloseButton` or the explicit Cancel.

### [MINOR] `ide-deploy-dialog.tsx` node option label is broken across JSX lines
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-deploy-dialog.tsx:99`
- **Problem:** `hetzner-02 · healthy · 12% CPU</SelectItem>` puts the `</SelectItem>` inside the text node, so the rendered option includes the literal closing tag text.
- **Fix:** Move the closing tag to its own line.

### [MINOR] `ide-right-panel.tsx` mode buttons are not a radiogroup
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-right-panel.tsx:52-66` (three buttons with `aria-pressed` but no `role="tab"`/`role="radio"` and no arrow-key support); same pattern at `ide-bottom-panel.tsx:30-51`
- **Problem:** Three views of the same region with no `tablist`/`tab`/`tabpanel` semantics; screen readers are not told the panels are exclusive views.
- **Fix:** Use `role="tablist"`/`role="tab"`/`aria-selected`, or the existing shadcn `Tabs`.

### [MINOR] `ide-file-explorer.tsx` has no `aria-current` on the active file
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-file-explorer.tsx:15,41`
- **Problem:** The active file is distinguished by `bg-accent` only — no `aria-current="page"`.
- **Fix:** Add `aria-current`.

### [MINOR] `ide-editor.tsx` nested scroll containers will desynchronise the gutter
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-editor.tsx:44` (`overflow-auto`) containing `:55` (`<pre className="… overflow-auto">`)
- **Problem:** When a line exceeds the viewport width the inner `pre` scrolls horizontally while the line-number gutter (outside it) does not, so numbers drift from their lines. A single scroll container with a sticky gutter is required.
- **Fix:** Make the gutter `sticky left-0` inside one scroller.

### [MINOR] `ide-file-explorer.tsx` colours files by language with no legend and no `title`
- **Location:** `app/(ide)/projects/[id]/ide/_components/ide-file-explorer.tsx:48-52` (`tsx`→sky, `ts`→blue, else muted)
- **Problem:** Colour is the only differentiator and `.env`/`package.json` get the muted default despite having declared `language` values (`lib/mock-ide-data.ts:88,95`) that this ternary ignores.
- **Fix:** Handle `"json"`/`"dotenv"`, or drop the colour coding.

### [MINOR] `rollback-dialog.tsx` explicit event-type annotation
- **Location:** `app/(dashboard)/deployments/_components/rollback-dialog.tsx:76` (`(e: React.ChangeEvent<HTMLTextAreaElement>) =>`) — the only handler in scope annotated this way; `React` is not imported in the file (it relies on the global JSX namespace).
- **Fix:** Drop the annotation; `React.ChangeEvent` here will not resolve if `jsx` types are ever tightened.

### [MINOR] `finops-client.tsx` memoises a module constant
- **Location:** `app/(dashboard)/finops/finops-client.tsx:41-47` — `useMemo(..., [])` over `MOCK_BUDGET_ALERTS`, a module constant.
- **Fix:** Compute at module scope.

### [MINOR] `finops-client.tsx` has no `isLoading` skeleton parity with other pages
- **Location:** `app/(dashboard)/finops/finops-client.tsx:52-64` (skeleton) vs `monitoring-client.tsx:231` (`return null` → blank flash), `error-tracking-client.tsx:213`, `deployments-list.tsx:150`, `settings-client.tsx:224`, `client-dashboard.tsx:87`
- **Problem:** `useAuth` exposes `isLoading` but only FinOps uses it. The other six pages render nothing for a frame while `RouteGuard` re-checks, producing a visible flash on every navigation.
- **Fix:** Extract the `isLoading` skeleton to a shared component and use it in all seven.

### [MINOR] Unused prop threading
- **Location:** `deployments/deployments-list.tsx:206-214` — `handleViewLogs` and `handleViewDetail` are byte-identical bodies (both open the same modal); `deployments-table.tsx:183-194` renders both menu items.
- **Problem:** Two menu entries ("View Logs", "View Details") open the same modal, so the labels promise different content that is identical.
- **Fix:** Merge into one entry, or make the modal accept a `tab` prop.

### [MINOR] `getTimeLabelSecondsAgo` parses localised strings and silently degrades
- **Location:** `app/(dashboard)/deployments/deployments-list.tsx:28-51`
- **Problem:** Sorting depends on Indonesian/English string parsing of `timeLabel`. Any unparseable label returns `Number.MAX_SAFE_INTEGER` (`:49`), which makes the deployment sort **last** in `newest` order rather than being flagged. `TIME_UNIT_SECONDS` also lacks `weeks`/`months` in English (`:33-34`) even though the regex accepts them (`:47`), so "2 weeks ago" silently becomes 2 seconds.
- **Fix:** Sort on `startedAt` (already in the type, used at `deployments-list.tsx:238`), and drop the string parser.

---

## Statistics

- **Total files inspected:** 35 (8 route trees, 27 components/clients)
- **Total LOC:** 7,674
- **CRITICAL:** 25 | **MAJOR:** 23 | **MINOR:** 35
- **Dead-end interactions found:** 84 (enumerated below)
- **RBAC holes:** 7 (FinOps unscoped panels, Monitoring unscoped, Error Tracking unscoped, Settings API-key actions, IDE command-palette deploy, GitOps client role-blind, plus the global client-side-only gating of every mutation in a static export)
- **Convention violations:** 5 hardcoded hex colours, 0 `asChild`, 0 `any`, 6 raw `<select>`/radio, 13 emoji-as-icon sites, 8 index-key sites, 2 dead metadata fields, 2 duplicate money-formatter sets, 3 duplicate `TITLE_BY_ROLE`
- **Rules-of-hooks violations:** 0 (verified across all 21 hook-using files; all early returns follow the last hook, and no `useEffect` references a later-declared helper)
- **Persistence across refresh:** 1 of 35 files has any durable effect — the theme selector (`settings-client.tsx:198,696`, via `next-themes`). Everything else is `useState` only; `grep` for `localStorage|sessionStorage|fetch(|axios` in scope returns zero hits.
- **Network calls:** 0

### Dead-end interaction index (grouped)

| Area | Dead interactions (file:line) |
|---|---|
| FinOps export | header Export no handler `finops-client.tsx:75-78`; per-row fake success `cost-breakdown-table.tsx:112-115,311-320`; fabricated report row `export-panel.tsx:96-112`; fake size `export-panel.tsx:44,102`; 4 unused include checkboxes `export-panel.tsx:189-212`; schedule recurring `:114-117`; download/share text-only `:119-121,254-261`; delete fake files `:123-126,262-270` |
| FinOps budget | Set Budget = `console.log` `cost-breakdown-table.tsx:322-331`; Save Settings `:60-68`; Test Alert `:70-73`; Sync Now `:79-88`; Configure `:90-93`; 2 permanently disabled checkboxes `:178-181,188-191`; alert "Lihat Detail" placeholder `budget-alerts.tsx:167-172`; dismiss/mark-read not persisted `:66-76`; rec Apply `:57-59`; rec Learn More placeholder `optimization-recommendations.tsx:96-111`; rec Dismiss not persisted `:61-63` |
| FinOps chart | mouse-only hover `cost-trend-chart.tsx:146-147`; hardcoded budget `:59,198`; silent Y_MAX clipping `:40`; tooltip offset `:166` |
| GitOps | "Buka URL" `disabled` `gitops-client.tsx:208-211`; create fabricates env `:103-121`; status frozen BUILDING `:113,80-84`; URL is inert text `:169-171`; webhook/protection cards static `:239-279`; `nextPr` resets on refresh `:96` |
| Monitoring | Export CSV `:632-640`; Download Full Log `:641-649`; Export PDF `:650-658`; alert rules CRUD local-only `:243-264`; time-range cosmetic `:323-333,494,501`; Web Vitals always "Good" `:49-53,527-534`; RUM session count fiction `:538-540`; "OpenAI API timeout" log for a non-existent integration `:75` |
| Error tracking | assign discarded `:240-243`; status change not persisted `:234-238`; no error source at all (module array) `:47` |
| Deployments | Timeline view toggle `:68,294` + `deployments-filter-bar.tsx:141-164`; skipTests ignored `new-deployment-dialog.tsx:45,50-57`; zeroDowntime display-only `:46,142`; new deploy never progresses `deployments-list.tsx:221-251`; retry never progresses `:177-193`; 10 s fake auto-refresh `active-deployments.tsx:88-92,111`; AI Diagnose canned answer `ai-diagnose-dialog.tsx:39-52`; Create Issue no handler `:136-139`; stale diagnosis on reopen `:33-37`; fake Health Check `deployment-detail-modal.tsx:166-191`; fake commit SHA `:47-50,159`; rollback = log append `deployments-list.tsx:159-175`; "View Logs" == "View Details" `:206-214` |
| Settings | profile save no-op `:229-233`; password change no-op + uncontrolled inputs `:240-244,390-407`; 2FA on by default, not enrolled `:203,411-428`; API key generate/revoke local-only `:262-270`; revoke sessions notice only `:294-298`; GitLab connect notice only `:272-276`; "Kelola Repos" no handler `:634-641`; "Hapus Akun" permanently disabled `:528-532`; language/timezone save is a flash `:288-292`; Cancel corrupts the form `:235-238`; notification prefs local-only `:278-286` |
| Dashboard | "Hubungkan Git Provider" text toggle `client-dashboard.tsx:185-197`; "Logs" → wrong target `:388-396`; "System Health 99.9%" hardcoded `:126-128`; Total User 6 vs "3 aktif" `:118-124` |
| IDE | "Run" no handler `ide-top-bar.tsx:67-70`; branch switcher no handler `:49-55`; "Saved · 12s ago" hardcoded `:57-64`; saveState lies on file open `ide-shell.tsx:56-61`; editor not editable `ide-editor.tsx:44-58` (disclaimer hidden `:60-62`); tab close no handler `:32-38`; tabs not clickable `:18-41`; folders no handler `ide-file-explorer.tsx:20-28`; terminal static `ide-bottom-panel.tsx:56-69`; problems not clickable `:71-96`; Output placeholder `:98-102`; 7/9 palette commands no-op `ide-shell.tsx:115-120`; palette no keyboard nav `ide-command-palette.tsx:47-54`; palette stale query `:27`; deploy "Deploy Now" no handler `ide-deploy-dialog.tsx:138-141`; checklist "view" no handler `:127-131`; node select uncontrolled `:91-101`; device buttons no handler `ide-right-panel.tsx:99-108`; fake iframe preview `:74-96`; AI submit discards input `:162-181`; Apply/Reject no handler `:151-157`; memory bar 25% hardcoded `:205`; Search/Git → explorer `ide-activity-bar.tsx:56,63`; Run&Debug/Stack Builder/Settings no handler `:102,109,117`; 4 advertised shortcuts unimplemented `:46,54,61,69`; status-bar branch/node no handler `ide-status-bar.tsx:30-36,57-65`; hardcoded problem counts `:23-26`; false "AI ready" `:67-69`; non-resizable panels `ide-shell.tsx:73-99` |
