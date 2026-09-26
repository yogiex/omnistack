# Scope 2 — Admin Console & AI Features

**Repo:** `/mnt/storage/code/omnistack` · Next.js 16.3.2 App Router · React 19.2.8 · `output: "export"`
**Audit method:** full read of all 45 files. No files modified.
**Build note:** `npm run build` could **not** be run — `node_modules` is absent (`ls node_modules` → *No such file or directory*), so `next` is not on PATH. All findings below are derived from source reading and are cited to `file:line`. The one place where a built artifact would have been required (static-HTML exposure) is called out explicitly and argued from App Router SSR semantics rather than claimed as observed.

---

## Route Map

| URL | File | Purpose | Intended role | Actual gate |
|---|---|---|---|---|
| `/admin` | `admin/page.tsx` | Admin dashboard: stats, recent activity, role distribution, service health, alerts | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/admin/users` | `admin/users/page.tsx` | User management: invite, edit/role, suspend, delete, 2FA, reset password | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/admin/ai-config` | `admin/ai-config/page.tsx` | AI provider toggles, API keys, per-role quotas, usage history | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/admin/audit` | `admin/audit/page.tsx` | Audit log table with actor/action/date filters, CSV + PDF export | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/admin/billing` | `admin/billing/page.tsx` | Subscriptions, payment methods, invoices, coupons, revenue chart | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/admin/databases` | `admin/databases/page.tsx` | Cross-project DB inventory with project/engine/status filters | ADMIN | `<RouteGuard requiredRole="ADMIN">` + `getMockDatabasesForRole()` re-filter at `admin-databases-client.tsx:52-55` |
| `/admin/infrastructure` | `admin/infrastructure/page.tsx` | VPS nodes, clusters, autoscale rules, services, DB provisioning | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/admin/settings` | `admin/settings/page.tsx` | System settings: general, SMTP, OAuth, API keys, security, backup (6 tabs) | ADMIN | `<RouteGuard requiredRole="ADMIN">` — **client-side only** |
| `/ai-architect` | `ai-architect/page.tsx` | Prompt → "generate app" → preview/code/terminal studio | USER | `<RouteGuard requiredRole="USER">` — client-side only |
| `/ai-reviewer` | `ai-reviewer/page.tsx` | Security-posture dashboard, review results, finding detail | USER | `<RouteGuard requiredRole="USER">` — client-side only |

**All 8 admin routes are correctly wrapped.** There is no missing-guard hole. The problem is the *kind* of guard.

### The guard, quoted

`components/route-guard.tsx:1` — `"use client"`. The whole component is a browser-side component:

```tsx
// components/route-guard.tsx:35-44
useEffect(() => {
  if (isLoading) return
  if (!user) { router.replace(redirectTo); return }
  if (requiredRole && !roleAtLeast(user.role, requiredRole)) {
    router.replace("/dashboard")
  }
}, [user, isLoading, requiredRole, router, redirectTo])
```

There is **no `middleware.ts`** anywhere in the repo (verified), no Route Handler, no Server Action. `next.config.ts` sets `output: "export"`, so there is no server process that could ever evaluate `roleAtLeast`. The role check is a `useEffect` and a render-time branch, both in the browser.

**This is UX, not security, and the code already says so** — `route-guard.tsx:22`: *"Catatan: ini proteksi UI (gimmick MVP), bukan keamanan sungguhan."* That comment is the correct framing. The problem is that the rest of the product presents these pages as if the guard were real (see CRITICAL-1, CRITICAL-2, CRITICAL-3).

### Precise trace: a `USER` types `/admin/users` in the URL bar

1. Static host serves `out/admin/users/index.html`. **No server-side check is possible** — there is no server.
2. During the static prerender, `AuthProvider` is at `useState(true)` for `isLoading` (`lib/auth-context.tsx:44`) and `user === null` (`auth-context.tsx:43`). The localStorage hydration lives in a `useEffect` (`auth-context.tsx:48-77`), which **does not run on the server**. So `RouteGuard` takes the `isLoading` branch (`route-guard.tsx:46-56`) and the prerendered HTML body is just a spinner.
3. Hydration. `AuthProvider`'s effect reads `omnistack_user` from localStorage, finds `user-dev-002` (`mock-data.ts:97-105`, `isActive: true`), calls `setUser`, then `setIsLoading(false)` (`auth-context.tsx:61,70`).
4. `RouteGuard` re-renders. `roleDenied = !!user && !!requiredRole && !roleAtLeast("USER","ADMIN")` (`route-guard.tsx:32-33`) → `ROLE_HIERARCHY.USER (2) >= ROLE_HIERARCHY.ADMIN (3)` is `false` → `roleDenied === true`.
5. Render: `isLoading` is false, `roleDenied` is true → **`return null`** (`route-guard.tsx:58`).
6. The effect fires → `router.replace("/dashboard")` (`route-guard.tsx:41-43`).

**Net user-visible behaviour: a spinner, then a blank page, then a redirect.** There is no "Access denied" message, no explanation, no 403 — the user just sees the page blink out. And because the check is a browser `if`, this is the *entire* enforcement mechanism: there is nothing on the other side of it. A logged-out visitor gets the same treatment via `route.replace("/login")` (`route-guard.tsx:38`).

The sidebar *also* hides admin nav for non-ADMINs (`components/app-sidebar.tsx:115-124`, `user.role === "ADMIN" ? [...] : []`) — so the links are hidden **and** the pages redirect. Two client-side layers, zero server-side layers.

---

## Inventory

| File | LOC | Client/Server | Purpose | Data source |
|---|---|---|---|---|
| `admin/page.tsx` | 10 | Server | Route → `RouteGuard` → `AdminOverview` | — |
| `admin/admin-overview.tsx` | 308 | Client | Admin dashboard shell | `MOCK_USERS`, `MOCK_PROJECTS`, `getTotalDeployments` + 3 hardcoded arrays |
| `admin/users/page.tsx` | 10 | Server | Route → `RouteGuard` → `UsersPageClient` | — |
| `admin/users/users-page-client.tsx` | 646 | Client | User table: search/sort/filter/paginate + all mutations | `useState(MOCK_USERS)` — **copy, mutates locally** |
| `admin/users/user-form-sheet.tsx` | 122 | Client | Edit-user sheet (name/email/role) | Props only |
| `admin/users/loading.tsx` | 55 | Server | Skeleton for the one route that has one | — |
| `admin/users/_components/invite-user-dialog.tsx` | 126 | Client | Invite dialog with role select | Props; parent mutates `useState` |
| `admin/users/_components/delete-user-dialog.tsx` | 99 | Client | Type-to-confirm delete dialog | Props |
| `admin/users/_components/role-badge.tsx` | 51 | Server module | `RoleBadge`, `InvitedBadge` | Static `ROLE_META` |
| `admin/users/_components/stats-grid.tsx` | 80 | Server module | 4 user-count cards | `getUserStatus` over props |
| `admin/users/_components/empty-state.tsx` | 46 | Client | Filtered/no-results empty state | Props |
| `admin/audit/page.tsx` | 10 | Server | Route → `RouteGuard` → `AuditLogList` | — |
| `admin/audit/audit-log.tsx` | 473 | Client | Audit table, 3 filters, pagination, CSV/PDF export | `MOCK_AUDIT_LOGS` + local `EXTRA_LOGS` |
| `admin/ai-config/page.tsx` | 10 | Server | Route → `RouteGuard` → `AiConfigClient` | — |
| `admin/ai-config/ai-config-client.tsx` | 297 | Client | Provider toggles, quotas, usage history | Local `INITIAL_PROVIDERS`/`INITIAL_LIMITS`/`AI_HISTORY` |
| `admin/billing/page.tsx` | 10 | Server | Route → `RouteGuard` → `BillingClient` | — |
| `admin/billing/billing-client.tsx` | 620 | Client | Subs, payment methods, invoices, coupons | `MOCK_USERS` + 6 hardcoded arrays |
| `admin/databases/page.tsx` | 10 | Server | Route → `RouteGuard` → `AdminDatabasesClient` | — |
| `admin/databases/admin-databases-client.tsx` | 240 | Client | Cross-project DB table + 3 filters | `getMockDatabasesForRole(user.id, user.role)` |
| `admin/infrastructure/page.tsx` | 10 | Server | Route → `RouteGuard` → `InfrastructureClient` | — |
| `admin/infrastructure/infrastructure-client.tsx` | 747 | Client | Nodes, clusters, autoscale, services, DBs | 4 local `INITIAL_*` arrays |
| `admin/settings/page.tsx` | 10 | Server | Route → `RouteGuard` → `SystemSettingsForm` | — |
| `admin/settings/system-settings.tsx` | 687 | Client | 6-tab system settings form | Local `useState` only |
| `ai-architect/page.tsx` | 18 | Server | Route → `RouteGuard` → `AIStudio` | — |
| `ai-architect/_components/ai-studio.tsx` | 42 | Client | Resizable split: prompt ⇄ preview | `useState` for `previewUrl`/`isGenerating`/`promptType` |
| `ai-architect/_components/prompt-panel.tsx` | 641 | Client | Prompt input, stack builder, examples, advanced settings | `MOCK_HISTORY`, `EXAMPLE_PROMPTS`, `MENTION_FILES` |
| `ai-architect/_components/preview-panel.tsx` | 746 | Client | Device/network/theme toolbar, iframe, file tree, code, terminal | `FILE_TREE`, `MOCK_FILES`, `TERMINAL_LINES` |
| `ai-architect/_components/mock-previews.ts` | 399 | Client module | `PromptType`, `detectPromptType`, 6 hardcoded terminal logs + 6 hardcoded HTML docs | — |
| `ai-reviewer/page.tsx` | 15 | Server | Route → `RouteGuard` → `ReviewShell` | — |
| `ai-reviewer/_components/review-shell.tsx` | 76 | Client | `useReducer` view state machine (dashboard/results/finding) | — |
| `ai-reviewer/_components/types.ts` | 62 | Client module | **The** domain type file: `Severity`, `Review`, `Finding`, `ReviewStats`… | — |
| `ai-reviewer/_components/mock-data-reviewer.ts` | 187 | Client module | 4 reviews, 4 findings, posture, stats + selector fns + colour maps | — |
| `ai-reviewer/_components/finding-detail-sheet.tsx` | 103 | Client | Finding detail drawer | `MOCK_FINDINGS` direct import |
| `ai-reviewer/_components/dashboard/dashboard-view.tsx` | 37 | Server module | Composes posture + stats + table | `getReviews/getStats/getPosture` |
| `ai-reviewer/_components/dashboard/stats-grid.tsx` | 65 | Server module | 4 stat cards with trend arrows | Props |
| `ai-reviewer/_components/dashboard/security-posture-banner.tsx` | 77 | Server module | Score ring + bar + "last scan" | Props; local `formatTimeAgo` |
| `ai-reviewer/_components/dashboard/recent-reviews-table.tsx` | 81 | Client | Clickable reviews table | Props; local `formatTimeAgo` |
| `ai-reviewer/_components/results/results-view.tsx` | 34 | Client | Review results container | `getReviewById`, `getFindingsByReview` |
| `ai-reviewer/_components/results/results-header.tsx` | 29 | Server module | Repo / PR / branch / score / status strip | Props |
| `ai-reviewer/_components/results/results-tabs.tsx` | 73 | Client | Overview / Security / Quality tabs + filter state | Props |
| `ai-reviewer/_components/results/overview-tab.tsx` | 80 | Server module | Severity grid + review metadata | Props |
| `ai-reviewer/_components/results/findings-list.tsx` | 81 | Client | Sorted finding cards | Props |
| `ai-reviewer/_components/results/findings-filters.tsx` | 60 | Client | Severity select + search input | Own `useState`, lifted via callback |
| `ai-reviewer/_components/shared/score-badge.tsx` | 16 | Server module | `score/100` badge | `getScoreColor` |
| `ai-reviewer/_components/shared/severity-badge.tsx` | 18 | Server module | Severity badge | `getSeverityConfig` |

**No network calls anywhere in scope.** Zero `fetch`/`XMLHttpRequest`. Everything is `lib/mock-data.ts` or a module-local constant.

### Rules-of-Hooks audit (every component checked)

No violations found. Specifically verified clean:

- Every `if (!x) return …` early-return sits **after** all hooks. `admin-databases-client.tsx:64`, `finding-detail-sheet.tsx:22`, `results-view.tsx:16`, `admin-overview.tsx:91`, `preview-panel.tsx` (none), `delete-user-dialog.tsx:41` (after `useState` at 30-31), `findings-list.tsx:33` (no hooks at all in that component).
- `admin-databases-client.tsx:64` (`if (!user) return null`) comes *after* `useMemo` at 52 — correct order.
- No helper function is declared after the `useEffect` that uses it. The one forward reference is `selectedStackBadges` (`prompt-panel.tsx:627`) used at line 403 — a hoisted `function` declaration, so it is safe at runtime (see MINOR-4).

### Conventions audit — what is actually clean

Worth stating explicitly, because these were the requested checks and several came back clean:

- **`asChild`: zero occurrences** in scope. The Base-UI-not-Radix rule is respected.
- **`any`: zero occurrences.** No `@ts-ignore`, no `@ts-expect-error`, no `eslint-disable` anywhere in scope.
- **Missing `key` props: zero.** All 40+ JSX `.map()` call sites have a `key`. (The two `key={idx}` uses are quality nits, not violations — see MINOR-2.)
- **Semantic tokens:** used in most places. Exceptions listed under MAJOR-19 / MINOR-1.
- **Server Components by default:** the 10 route files are server components. But **only 1 of 8 admin routes has a `loading.tsx`** (`admin/users/loading.tsx`) — see MINOR-13.
- **Prop drilling:** negligible. `review-shell.tsx` passes `reviewId`/`onSelectFinding` exactly one level. The one real duplication is filter state (MAJOR-26 / MINOR-8).

---

## Findings

### [CRITICAL] Admin RBAC is client-side only, and the admin dataset is shipped to every visitor in the public JS bundle
- **Location:** `components/route-guard.tsx:1,35-44,58`; `lib/mock-data.ts:85-149` (users), `576-623` (audit), `808+` (databases incl. passwords); `app/(dashboard)/admin/*/page.tsx:6`
- **Problem:** `RouteGuard` is `"use client"` and every admin `page.tsx` is a server component that merely *renders* it — so no server ever evaluates the role. With `output: "export"`, `next.config.ts` there is no server process, and there is no `middleware.ts`. The role decision is `roleAtLeast(user.role, "ADMIN")` running in the browser (`route-guard.tsx:33,41`). Consequently the "admin-only" data is not behind the "admin-only" UI: `MOCK_USERS` is imported by `users-page-client.tsx:41` and `admin-overview.tsx:28`, `MOCK_AUDIT_LOGS` by `audit-log.tsx:41`, and `MOCK_DATABASES` by `admin-databases-client.tsx:26` — all `"use client"` modules. Every one of those arrays, **including plaintext DB passwords** (`mock-data.ts:825` `sk-live-9f2b7c41ae`, `:856` `redis-tk81mz04`, `:887` `pg-an-338bd1c9f2`), is compiled into publicly-served `_next/static/chunks/*.js`. No login required to read it.
- **Impact:** Two distinct problems. (a) *As a mock demo:* harmless but the pages are labelled "Hanya ADMIN yang dapat mengakses" (`users-page-client.tsx:307`, `audit-log.tsx:238-239`) and "hanya dapat diubah oleh ADMIN" (`system-settings.tsx:161`) — claims of protection that do not exist. (b) *As a template:* this is the dangerous part. The RBAC pattern here is the pattern a developer copies when a real backend arrives. `roleAtLeast` (`mock-data.ts:641-643`) is the *only* authorization primitive in the codebase and it is called exclusively from `route-guard.tsx:33,41` and `auth-context.tsx:146` — i.e. only ever in the browser. There is **no action-level authorization at all**: no `can(user, "delete_user")`, no server-side role assertion. If a developer wires `deleteUser()` to a real API and keeps this guard, every non-ADMIN can delete users. The `getMockProjectsByUser` / `getMockDatabasesForRole` helpers (`mock-data.ts:657-661,1025-1029`) scope *reads* by role, and that is genuinely good — but scoping reads while leaving writes unguarded is the exact shape of a privilege-escalation bug.
- **Fix:** Keep `RouteGuard` for UX but stop calling it security. (1) Change the copy on all gated pages from "hanya ADMIN" to a neutral framing, or add a visible "Demo — client-side gating only" banner. (2) Move the real authorization to where it belongs the moment a backend exists: a server-side session check (middleware for coarse route gating + a per-action permission check in the data layer). (3) Never ship secrets or privileged fixtures to the client — `MOCK_DATABASES[].connection.password` should not exist in a client-imported module at all. (4) Add `middleware.ts` as the single place that answers "may this request see this page".

### [CRITICAL] "Apply AI Fix" and "Mark False Positive" have no `onClick` — the AI Reviewer's headline actions do nothing
- **Location:** `app/(dashboard)/ai-reviewer/_components/finding-detail-sheet.tsx:92-95` and `:96-98`
- **Problem:**
  ```tsx
  <Button size="sm">
    <ExternalLink className="mr-2 h-3.5 w-3.5" />
    Apply AI Fix
  </Button>
  <Button size="sm" variant="outline">
    Mark False Positive
  </Button>
  ```
  Neither has an event handler, and `finding-detail-sheet.tsx` holds no state for `Finding.status` at all. The type layer even anticipates the feature — `types.ts:7` declares `FindingStatus = "open" | "fixed" | "false_positive"` — but nothing writes to it.
- **Impact:** A user opens a Critical finding, reads a confident "Recommended Fix" diff, clicks **Apply AI Fix**, and… nothing happens. No error, no toast, no disabled state. This is the single most misleading interaction in the app: the button is styled as the primary action of the sheet, carries an "external link" icon implying a real code change, and is completely inert. There is also no "Mark Fixed" action, so `FindingStatus` is entirely unused in the codebase.
- **Fix:** Either wire them (`onStatusChange` prop + optimistic local update) or disable them with a visible "Demo — not connected" tooltip. Do not ship a primary CTA that silently no-ops.

### [CRITICAL] "Open in Cloud IDE" has no `onClick`
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:677-684`
- **Problem:**
  ```tsx
  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
    <Code2 className="h-3.5 w-3.5" />
    Open in Cloud IDE
  </Button>
  ```
  No `onClick`. Zero handler.
- **Impact:** Same class of deception as above, in the AI Architect's code drawer. Placed next to working tabs, it reads as "take this generated app into the IDE". Clicking does nothing at all. The repo *does* have an IDE route (`app/(ide)/projects/[id]/ide/page.tsx`), so the wiring is one `router.push` away.
- **Fix:** Wire it to the IDE route or remove it.

### [CRITICAL] Every "Save" in System Settings is fake — 6 buttons that discard the entire form
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:116-124` (`handleSave`), and its callers at `:164-167` (header "Simpan Semua"), `:261` (General), `:328` (SMTP), `:606` (Security), `:676` (Backup)
- **Problem:** The entire save implementation is:
  ```tsx
  const handleSave = (tab?: string) => {
    if (tab) { setSavedTab(tab); setTimeout(() => setSavedTab(null), 2000) }
    else     { setSaved(true);     setTimeout(() => setSaved(false), 2000) }
  }
  ```
  It flips a boolean, shows a ✓ and the word "Tersimpan" for two seconds, and throws the change away. No `fetch`, no `localStorage.setItem`, no Server Action. Every field in the form is uncontrolled (`defaultValue` at `:210,216,229,285,289,293,297,301,367,376,586,644,657`) or local `useState` (`:87-97`), so **even without pressing Save, a refresh reverts everything.**
- **Impact:** An ADMIN configures SMTP credentials, sets a 30-minute session timeout, adds env vars, rotates API keys — sees "Tersimpan ✓" five times — and then refreshes and loses all of it. The success state is worse than no feedback: it *certifies* an outcome that did not occur. The page header reinforces the fiction: "Konfigurasi tingkat sistem — hanya dapat diubah oleh ADMIN" (`:161`).
- **Fix:** Persist to `localStorage` under a versioned key (honest for a static export) and hydrate on mount, or remove the save affordances and label the page "read-only preview". Never show a success state for an action with no effect.

### [CRITICAL] Maintenance Mode does not maintain anything
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:244-257`
- **Problem:** The copy reads *"Menonaktifkan akses semua user non-ADMIN."* (`:245`). The implementation is `<Checkbox checked={maintenance} onCheckedChange={...} />` (`:253-256`) plus a badge at `:247-251`. `maintenance` is read nowhere else in the codebase — it is not consumed by `RouteGuard`, `AuthProvider`, the layout, or any page.
- **Impact:** This is the most dangerous item in the app after the RBAC issue, because it is a *security control that reports itself as armed*. An ADMIN ticks "Maintenance Mode", sees the reassuring badge "Aktif — sistem dalam maintenance", and reasonably concludes the platform is locked down. Non-ADMINs continue to browse, deploy, and read everything. There is no code path in which this flag has any effect.
- **Fix:** Do not ship an inert kill switch. Either implement it (a `maintenance` flag in `AuthProvider` + a check in `RouteGuard` that blocks non-ADMIN) or remove the control and its copy.

### [CRITICAL] 2FA Enforcement, Session Timeout, Default Role and Backup Schedule are all inert
- **Location:** `system-settings.tsx:575` (2FA), `:583-589` (session timeout), `:214-222` (default role), `:634` (backup), `:598-603` (password policy), `:642-650` (backup schedule)
- **Problem:**
  - `:575` — `<Checkbox defaultChecked aria-label="Wajibkan 2FA untuk admin" />`. **No `onCheckedChange` and no `checked`** → fully uncontrolled, un-readable, un-undoable, and consulted by nothing. There is no 2FA anywhere in `auth-context.tsx`.
  - `:583-589` — Session Timeout is a `defaultValue={30}` number input. `auth-context.tsx` has **no session expiry logic at all**; the session lives in `localStorage` until `logout()` (`auth-context.tsx:102-105`) or until the user is deactivated in the mock list.
  - `:214-222` — "Default Role for New Users" is a `defaultValue="USER"` select with no handler. Meanwhile `auth-context.tsx:111-123` (`startDemoSession`) **hardcodes** `role: "USER"`. The setting cannot change what the code does.
  - `:634` — Backup checkbox, `defaultChecked`, no handler.
  - `:598-603` — Password Policy is a static `<p>` string. Not an input, not a rule, nothing validates against it.
- **Impact:** Four independent claims of security configuration that do nothing. Combined with the "Tersimpan ✓" from CRITICAL-4, an ADMIN leaves this page believing the platform enforces 2FA, times out sessions after 30 minutes, and applies a password policy. None of it is true. This is the most likely place for a real deployment to be compromised, because the admin console *asserts* the controls are on.
- **Fix:** Remove controls that cannot be enforced. If a control is genuinely planned, render it disabled with a "not available in demo" note rather than as a live checkbox.

### [CRITICAL] "Salin" on API keys copies the *masked* string, not the key
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:441`
- **Problem:** `onClick={() => handleCopyKey(key.id, key.masked)}` — and `key.masked` is literally `"osk_live_••••••••7f2a"` (`:66-68`). The button reports "Tersalin ✓" (`:443-447`) after writing bullet characters to the clipboard.
- **Impact:** The user copies the value, pastes it into CI, and gets a broken secret. The success state actively misleads. Contrast with the same file's clipboard handler at `:126-133`, which is otherwise correct (it `try/catch`es). Here the handler is fine and the *argument* is wrong.
- **Fix:** Either hold the real secret in state and copy that, or relabel the button "Copy masked" — but never show "Tersalin" for a value that cannot be used.

### [CRITICAL] AI Architect "Generate App" fabricates a URL, then tries to iframe a host that does not exist
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:324-333`; `preview-panel.tsx:605-616`
- **Problem:**
  ```tsx
  // prompt-panel.tsx:324-333
  const handleGenerate = useCallback(() => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true); setHasGenerated(true)
    setTimeout(() => {
      setIsLoading(false)
      onGenerate(`https://app.omnistack.dev/project-${Date.now()}`)
    }, 2500)
  }, [prompt, isLoading, setIsLoading, onGenerate])
  ```
  A 2.5-second fake delay, then a URL assembled from `Date.now()`. `handleRefactor` (`:335-343`) does the same with `refactor-${Date.now()}`. That string becomes `previewUrl` in `ai-studio.tsx:11,19`, and the preview panel's **fallback** branch renders `<iframe src={previewUrl} sandbox="allow-scripts allow-same-origin" />` (`preview-panel.tsx:605-616`).
- **Impact:** The `srcDoc` mock-preview branch (`preview-panel.tsx:591-603`) only runs when `promptType` is truthy — and `onPromptType` is called from **exactly one place**: the example-prompt buttons (`prompt-panel.tsx:431`). `handleGenerate` never calls it (`:324-333`, deps at `:333`). `ai-studio.tsx:13` initialises `promptType` to `null` and nothing else sets it. So **for any prompt the user types themselves — i.e. the primary use case — `promptType` stays `null`, the `srcDoc` branch is skipped, and the iframe loads `https://app.omnistack.dev/project-1756…`, a domain that does not resolve.** The user watches a convincing terminal animation scroll for 2.5s, then gets a blank/error frame and a fabricated URL in the address bar. Secondary: `sandbox="allow-scripts allow-same-origin"` (`:609`) is the documented-dangerous combination — harmless against a dead cross-origin host, but it would void the sandbox entirely if that host ever resolved to the app's own origin.
- **Fix:** Call `onPromptType(detectPromptType(prompt))` from `handleGenerate` (and from `handlePromptChange`). Never show a URL that was not actually deployed; use the `srcDoc` mock for every path, and drop `allow-same-origin`.

### [CRITICAL] The Freedom Stack Builder has zero effect on the generated output
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:377-399` (the three `StackSelect`s) and `:402-410` (badges); `preview-panel.tsx:99-218` (`MOCK_FILES`) and `:51-97` (`FILE_TREE`)
- **Problem:** `frontend` / `backend` / `database` are real `useState` (`:253-255`) and the selects work. But they are passed to **nothing**. `handleGenerate`'s dependency array is `[prompt, isLoading, setIsLoading, onGenerate]` (`:333`) — the stack is absent, confirming it is not read. Meanwhile the preview's file tree and file contents are a single hardcoded Next.js + Prisma + Postgres snapshot:
  - `preview-panel.tsx:121` — `provider = "postgresql"` in `schema.prisma`
  - `preview-panel.tsx:115` — `POSTGRES_DB: omnistack` in `docker-compose.yml`
  - `preview-panel.tsx:56-57,71-72,96` — `layout.tsx`, `page.tsx`, `button.tsx`, `package.json` all Next.js/React
- **Impact:** `AGENTS.md` markets "🎨 Freedom Stack Builder — Bebas pilih bahasa & library (React, Vue, Go, Rust, dll)" as a headline capability. In reality: select **Svelte + FastAPI + MongoDB**, and the "generated" project is still a Next.js app with `prisma/schema.prisma` targeting PostgreSQL. The stack badges at `:402-410` update, reinforcing the belief that the choice took effect. The three selects and the option lists are the most elaborately-built controls in the entire scope, and they are pure decoration.
- **Fix:** Either drive `FILE_TREE`/`MOCK_FILES` from the selection (at minimum: a `Record<engine, {files, deps}>` lookup), or remove the control. A configurator that provably does not configure anything is worse than no configurator.

### [CRITICAL] AI Architect "Advanced Settings" toggles are never read
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:258-260` (state), `:535-552` (the three `SettingToggle`s)
- **Problem:** `mockApi`, `enableAuth`, `generateTests` are set by the toggles and read **nowhere in the codebase**. `handleGenerate` (`:324-333`) does not consult them, and its `useCallback` deps do not include them. Descriptions promise real scaffolding: "Generate a mock API server with sample data" (`:537`), "Include authentication setup with NextAuth.js and session management" (`:543`), "Scaffold Vitest configuration and sample test files" (`:549`).
- **Impact:** Three toggles in a drawer titled "Configure generation options for your project" that change nothing. The `mockApi` toggle is the most deceptive — "Mock API Server" sounds like a runtime feature, but there is no runtime.
- **Fix:** Same as CRITICAL-8 — wire them or remove them.

### [CRITICAL] Prompt History never records anything the user generates
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:47-72` (`MOCK_HISTORY`), `:559-593` (render), `:345-348` (`handleHistoryClick`)
- **Problem:** `MOCK_HISTORY` is a frozen module constant of 4 entries. `handleGenerate` (`:324-333`) never appends to it. The panel is headed "Recent Prompts" (`:561-563`).
- **Impact:** The user generates an app, opens History, and sees only the four hardcoded entries — none of them theirs. Worse, the list is *timestamped relative to nothing* ("1h ago", "3h ago") and one entry is permanently `status: "failed"` (`:64`) rendering a red "Failed" badge (`:581-588`). The user cannot retry, cannot clear, and cannot tell which entry (if any) is theirs.
- **Fix:** Append to local state on generate. If that is out of scope, remove the History button rather than showing a fiction.

### [CRITICAL] AI Config "Simpan Semua" persists nothing; the API key field is read-only
- **Location:** `app/(dashboard)/ai-config/ai-config-client.tsx:89-92` (`handleSave`), `:110-113` (header button), `:174-179` (key input)
- **Problem:**
  ```tsx
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  ```
  Identical fake-save pattern to CRITICAL-4. Separately, the API key input is `readOnly` (`:177`) while the card description says *"Aktifkan atau nonaktifkan provider AI, kelola API key"* (`:143`) — **"kelola API key" is false; the key cannot be managed, only revealed.** The eye toggle (`:180-190`) switches `type` between `password` and `text` on a string that is already a mask (`"sk-••••••••••••••••7f2a"`, `:39-40`), so "revealing" reveals bullet characters.
- **Impact:** An ADMIN disables Claude, changes the USER quota from 100 to 5,000, clicks "Simpan Semua", sees "Tersimpan ✓", refreshes, and is back to the defaults. The role quotas are additionally decorative: nothing in the codebase reads `limits` (`mock-data-reviewer.ts` aside, no enforcement anywhere), and the help text at `:243-249` **hardcodes "USER: 100 request/hari"** — so changing the field to 500 makes the page contradict itself on screen.
- **Fix:** Persist to `localStorage`, make the key input editable (or relabel to "read-only demo key"), and derive the help text from `limits` instead of hardcoding it.

### [CRITICAL] Admin Billing: "Export Report", "Buat Invoice", "Kelola subscription" and the coupon box are all fake
- **Location:** `app/(dashboard)/admin/billing/billing-client.tsx:518` (Export Report), `:570-577` (Simpan Invoice), `:166-168` (Kelola), `:170-173` (Apply coupon)
- **Problem:**
  - `:518` — `onClick={() => showNotice("Billing report exported (mock)")}`. No file is produced.
  - `:570-577` — "Simpan Invoice" shows `"Invoice dibuat (mock)"` and closes the sheet. `INVOICES` (`:103-108`) is a module constant and is **never appended to** — the invoice list below does not change. `invoiceUser`, `invoiceAmount`, `invoiceDue` are collected (`:157-159`) and thrown away.
  - `:166-168` — "Kelola" per subscription → `"Kelola subscription ${email} (mock)"`.
  - `:170-173` — the coupon input accepts **any non-empty string**, validates nothing, and reports success. There is no coupon table to validate against.
- **Impact:** Four money-adjacent workflows that report success and change nothing. The invoice one is worst: the user selects a customer, types an amount and a due date, clicks "Simpan Invoice", and the invoice they just created is not in the list. `billing` is the page where fake success does the most damage.
- **Fix:** Wire to local state so the list actually updates, or disable the buttons.

### [CRITICAL] "Unduh PDF" on every invoice is permanently disabled
- **Location:** `app/(dashboard)/admin/billing/billing-client.tsx:475-477`
- **Problem:** `<Button variant="outline" size="sm" disabled>Unduh PDF</Button>` — hardcoded `disabled`, no handler, on all four invoice rows.
- **Impact:** A permanently dead control rendered as a normal action, with no explanation. The user cannot tell whether invoices are downloadable, not yet implemented, or broken.
- **Fix:** Remove it, or label it "Coming soon".

### [CRITICAL] "Export PDF" on the audit log is fake
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:223-226`
- **Problem:** `const handleExportPDF = () => { setExportNotice("Audit trail PDF exported (mock)."); setTimeout(...) }`. No PDF is generated.
- **Impact:** Directly adjacent to a **working** CSV export (`:200-221`, which genuinely builds a `Blob` and triggers a download). The pairing makes the fake one look real — a user who succeeds with CSV will reasonably expect PDF to work too. It is labelled "(mock)", which is honest, but the button itself is not.
- **Fix:** Remove it or disable it with a reason.

### [CRITICAL] `Date.now()` at module scope freezes every AI Reviewer timestamp at build time
- **Location:** `app/(dashboard)/ai-reviewer/_components/mock-data-reviewer.ts:6, 35, 48, 61, 74`
- **Problem:**
  ```ts
  lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),   // :6
  scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),   // :35
  ```
  These run once, when the module is evaluated. In a static export the module is evaluated **at build time** for the prerender and again **at page load** in the browser — two different `Date.now()` values.
- **Impact:** Two failures. (a) **Correctness:** the export is a build artifact. Deploy it on 1 Sep and "Last scan: 2h ago" now reads as 1 Sep; a month later it reads "32d ago" on a page whose next scan is "daily 02:00 UTC" (`mock-data.ts` `nextScheduled`). A security-posture dashboard whose freshness indicator is frozen at build time is actively misleading. (b) **Hydration:** the prerendered HTML and the client render compute different `Date.now()`, and `formatTimeAgo` (`security-posture-banner.tsx:12-21`, `recent-reviews-table.tsx:15-24`) formats them into different strings → React hydration mismatch on the "Time" column and the "Last scan" line.
- **Fix:** Store absolute ISO strings as literals, and compute relative time in a `useEffect` + state (or gate it behind a mounted flag) so SSR and client agree.

### [MAJOR] The audit log "Date Range" filter does not filter
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:170` (state), `:181-192` (the filter that omits it), `:323-340` (the chips)
- **Problem:** `dateFilter` is created at `:170`, rendered as four selectable chips at `:323-340`, and set by `onClick` at `:328` — but the `useMemo` that produces `filteredLogs` (`:181-192`) has deps `[actionFilter, actorFilter, search]`. **`dateFilter` is never read.** The `isDeployFailed` / `isDeleteAction` helpers (`:160-166`) work on `detail` strings, not dates, so there is no date comparison anywhere in the file.
- **Impact:** Four chips ("All Time", "Last 24h", "Last 7 days", "Last 30 days") that highlight when clicked and change nothing. This is the archetypal dead control: it has complete hover/active styling, it looks selected, and it lies. A user filtering an audit trail by date — an ordinary compliance task — gets undifferentiated results with no indication that the filter was ignored.
- **Fix:** Add real timestamps to `MockAuditLog` (`mock-data.ts:567-574` only has `timeLabel: string`) and filter on them, or remove the chips.

### [MAJOR] AI Reviewer: the security counts and the findings list come from different data and can never agree
- **Location:** `app/(dashboard)/ai-reviewer/_components/results/results-tabs.tsx:24, 47`; `results/overview-tab.tsx:19-22, 38-40`; `mock-data-reviewer.ts:30, 43` (severity) vs `:78-140` (findings)
- **Problem:** `securityCount` comes from the review's *summary* field: `review.severity.Critical + review.severity.High` (`results-tabs.tsx:24`). The list below it comes from `getFindingsByReview(reviewId)` (`results-view.tsx:14`), which filters the `MOCK_FINDINGS` array. **These are unrelated data.** `MOCK_REVIEWS[0].severity` is `{Critical:4, High:3, Medium:8, Low:5, Info:3}` (`:30`) = 23 findings, but `MOCK_FINDINGS` contains 4 objects total, all with `reviewId: "rev-001"` (`:81, 96, 111, 126`).
- **Impact:** For `rev-001` the tab reads **"Security (7)"** and lists **4** items, while the Overview tab simultaneously reports 4 Critical / 8 Medium / 5 Low / 3 Info. Worse for `rev-002`: its severity summary is `{Critical:0, High:0, Medium:1, Low:2, Info:1}`, so the tab reads **"Security (0)"** while Overview claims 4 findings — and the list renders `findings-list.tsx:33-38`'s message **"No findings match the current filters"**, blaming the user's filters when no filter is active and no findings exist. Reviews 3 and 4 behave the same way.
- **Fix:** Derive the counts from `MOCK_FINDINGS`, or generate one finding object per declared severity count. Distinguish "no findings" from "no matches".

### [MAJOR] Stat-card trend colours are semantically inverted for the two security metrics
- **Location:** `app/(dashboard)/ai-reviewer/_components/dashboard/stats-grid.tsx:18, 27-30`, applied at `:45-56`
- **Problem:** `const isPositive = trend > 0` (`:18`) drives colour and icon for **all four** cards uniformly:
  ```tsx
  className={cn(..., isPositive ? "text-green-500" : "text-red-500")}   // :27
  {isPositive ? <TrendingUp .../> : <TrendingDown .../>}                // :28
  ```
  But for "Open Findings" (`:45-50`) and "Critical & High" (`:51-56`), an increase is **bad**. "Fixed this Week" (`:57-62`) and "Total Reviews" (`:39-44`) are the opposite.
- **Impact:** If open findings rise, the card turns **green with an upward-trend arrow**. A rising count of open security findings is the single worst thing that can happen on this dashboard, and the UI signals it as success. The same class drives "Critical & High". (`MOCK_STATS.trends.openFindings: -8` happens to render red today, so the bug is latent — but the mock data is not load-bearing, and the moment someone tunes the fixture to a plausible value the dashboard starts lying.) `StatCardProps` (`:10-15`) has no field to express "higher is worse".
- **Fix:** Add `higherIsBetter: boolean` (or an `invertTrend` flag) to `StatCardProps` and pass it per card.

### [MAJOR] "Total Reviews: 148" sits above a 4-row table
- **Location:** `app/(dashboard)/ai-reviewer/_components/dashboard/stats-grid.tsx:41`; `dashboard-view.tsx:34`; `mock-data-reviewer.ts:11, 23`
- **Problem:** `MOCK_STATS.totalReviews: 148` while `MOCK_REVIEWS` (`:23`) has **4** entries, and that is exactly what `RecentReviewsTable` renders.
- **Impact:** The headline KPI contradicts the table directly beneath it, by a factor of 37. The same pattern recurs across the scope (§ "Numbers that contradict each other"). The "vs last month" trend of `+12%` (`:16`) compounds it: 12% growth against a total of 4 visible reviews.
- **Fix:** Make the fixture self-consistent, or label the KPI as lifetime-total vs. the table as recent.

### [MAJOR] Clickable `<TableRow>`s are unreachable by keyboard — in two places, one of them the only navigation path
- **Location:** `app/(dashboard)/ai-reviewer/_components/dashboard/recent-reviews-table.tsx:46-50`; `app/(dashboard)/admin/databases/admin-databases-client.tsx:198-202`
- **Problem:** Both render
  ```tsx
  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectReview(review.id)}>
  ```
  A `<tr>` with an `onClick` and `cursor-pointer`, but no `tabIndex`, no `role="button"`, no `onKeyDown`. It is not focusable and Enter/Space do nothing.
- **Impact:** In `recent-reviews-table.tsx` this is the **sole entry point** into the entire results experience — `DashboardView` passes only `onSelectReview` (`dashboard-view.tsx:34`), and `ReviewShell`'s reducer requires `SELECT_REVIEW` to leave the dashboard (`review-shell.tsx:24-25`). **A keyboard-only user cannot get past the AI Reviewer's first screen.** The same pattern in `admin-databases-client.tsx:198-202` makes every database row unreachable.
- **Fix:** Put a real `<Link>` or `<button>` inside the first cell, or add `tabIndex={0}` + `role="button"` + an `onKeyDown` handler for Enter/Space.

### [MAJOR] The Code tab shows `// No content for …` for every file inside a folder
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:285` (path building), `:706` (lookup)
- **Problem:** `TreeNode` builds nested paths by concatenation: `onSelect={`${entry.name}/${childPath}`}` (`:285`), producing `src/lib/auth.ts`, `src/components/ui/button.tsx`, `prisma/schema.prisma`. But `MOCK_FILES` (`:99-218`) is keyed by **bare filenames**: `"schema.prisma"`, `"auth.ts"`, `"db.ts"`, `"button.tsx"`, `"layout.tsx"`, `"page.tsx"`, `"package.json"`, `"docker-compose.yml"`. The lookup `MOCK_FILES[selectedFile]` therefore misses, and the fallback renders `// No content for ${selectedFile}`.
- **Impact:** Only the 3 root-level files work. **All 8 files under `src/` and `prisma/` — i.e. the entire `src/app/`, `src/components/ui/`, `src/lib/` and `prisma/` subtrees — show the "no content" comment.** The fallback is also wrong in kind: a `//` JS comment displayed as the contents of a `.prisma` schema or a `docker-compose.yml`. The most likely thing a user does after "Generate App" is open the Code tab and click `page.tsx`… which is under `src/app/`, and shows nothing.
- **Fix:** Key `MOCK_FILES` by full path (`"src/app/page.tsx"`), or normalise the lookup with `selectedFile.split("/").pop()`.

### [MAJOR] "Open in new tab" silently no-ops when nothing has been generated
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:546-548`
- **Problem:** `onClick={() => { if (previewUrl) window.open(previewUrl, "_blank") }}` — no `disabled` prop, no else branch.
- **Impact:** Before the first generation the button is live-looking and does nothing. It is also a `window.open` in a component that is otherwise fine — worth noting that a popup blocker will also swallow it silently, since there is no fallback for `null`.
- **Fix:** Drive `disabled={!previewUrl}` from state.

### [MAJOR] The address bar displays a fabricated URL before anything has been generated
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:470, 528`
- **Problem:** `{previewUrl || "pr-ai-8f7d.omnistack.app"}` (`:528`) and `const url = previewUrl || "pr-ai-8f7d.omnistack.app"` (`:470`). The toolbar (`:479-553`) renders unconditionally.
- **Impact:** On first paint, before the user has typed or clicked anything, the simulator shows a plausible production URL. Combined with the dead `Open in new tab` next to it, the panel asserts a deployed app exists from the moment the page loads. The same fake host also appears in the terminal output (`preview-panel.tsx:226, 728`).
- **Fix:** Show a neutral placeholder (`"— not generated —"`) when `previewUrl` is null, and disable the adjacent actions.

### [MAJOR] The "4G (Throttle)" network option applies no throttle; "Offline" is a CSS overlay
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:298-361` (`NetworkDropdown`), `:566`, `:620-627`
- **Problem:** The dropdown offers `WiFi (No throttle)` / `4G (Throttle)` / `Offline (Block)` (`:309-311`). `network` is used in exactly two places: `network === "offline" && "pointer-events-none"` (`:566`) and the offline overlay (`:620-627`). **The `"4g"` value is read by nothing.** There is no `throttle`, no debounce, no artificial latency.
- **Impact:** A developer-facing tool whose entire purpose is testing responsive/offline behaviour. "Offline" does not stop the iframe from loading or executing — the `src` is already fetched, and `pointer-events-none` only blocks mouse input on the wrapper. Scripts keep running, `setTimeout`s keep firing, and the overlay is a `bg-background/80` div that a user can trivially see past at the edges. Both options are theatre.
- **Fix:** Implement throttling (or drop the 4G option), and for offline actually unmount the iframe / set `srcDoc=""` and block network via a `Service Worker`.

### [MAJOR] "Dark mode" in the preview is a CSS invert filter
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:598-601, 612-614`
- **Problem:** `filter: iframeTheme === "dark" ? "invert(0.88) hue-rotate(180deg)" : undefined` — applied identically to both the `srcDoc` and `src` iframes.
- **Impact:** Not dark mode; a colour inversion. On the `srcDoc` mocks — which are hand-written light-theme HTML with near-black sidebars (`mock-previews.ts:359, 365, 370` use `#18181b`, `#09090b`) — inverting produces washed-out, wrong-hue output rather than a dark theme. Images and brand colours invert too. The button is labelled "Switch to dark mode" (`:513`).
- **Fix:** Give the mock HTML a `prefers-color-scheme` block and pass the theme in, or apply a real dark stylesheet to the `srcDoc` document.

### [MAJOR] Seven icon-only buttons use `title` instead of `aria-label`
- **Location:** `app/(dashboard)/admin/infrastructure/infrastructure-client.tsx:335, 344, 354, 431, 443, 635, 644`
- **Problem:** `size="icon"` buttons containing only `<ArrowDown/>`, `<Power/>`, `<Trash2/>`, `<ArrowUp/>`, `<RefreshCw/>`, each with a `title` attribute. There is no `aria-label`.
- **Impact:** `title` is a hover tooltip; it is inconsistently exposed by screen readers and does not survive touch input. Seven controls — including **destructive** ones (delete node at `:354`, delete database at `:644`) — have no accessible name. Two of them (`ArrowDown` at `:336` "Drain node" and `ArrowDown` at `:447` "Scale down") share an identical glyph, so even the tooltip is ambiguous.
- **Fix:** `aria-label` on every icon-only button. Prefer distinct glyphs where the action differs.

### [MAJOR] The threshold-confirm button has no accessible name
- **Location:** `app/(dashboard)/admin/infrastructure/infrastructure-client.tsx:495-502`
- **Problem:** `<Button variant="ghost" size="icon" className="h-6 w-6" onClick={...}><Check className="h-3 w-3" /></Button>` — no `title`, no `aria-label`. It is the only commit affordance for editing an autoscale threshold.
- **Impact:** An unlabelled control that writes to cluster configuration. Keyboard users can reach it (it is a real `<button>`) but cannot determine what it does.
- **Fix:** `aria-label="Simpan threshold"`.

### [MAJOR] An `<Input>` and a `<Button>` are nested inside a `<p>`
- **Location:** `app/(dashboard)/admin/infrastructure/infrastructure-client.tsx:478-515`
- **Problem:**
  ```tsx
  <p className="text-sm font-medium">
    {rule.metric} {rule.condition}{" "}
    {editingThresholdId === rule.id ? (
      <span className="inline-flex items-center gap-1">
        <Input type="number" ... />        {/* renders a block-level container */}
        <Button ...><Check/></Button>
      </span>
    ) : ( <button ...>{rule.threshold}%</button> )}
  </p>
  ```
  `Input` (shadcn) renders `<div><input/></div>` and `Button` renders `<button>`. A `<button>` inside a `<p>` is already invalid; block-level `<div>` inside `<p>` is unambiguously invalid.
- **Impact:** The HTML parser auto-closes the `<p>` before the `<div>`, so the client DOM differs from the JSX tree → **React hydration mismatch** on every autoscale rule row in edit mode. It also produces invalid markup for assistive tech.
- **Fix:** Change the `<p>` to a `<div>` (or `<span>` with `inline-flex` children only).
- **Related (same file, different class):** `preview-panel.tsx:496, 513, 534, 545` use `title` on icon-only buttons for the device toggles, theme toggle, copy-URL and open-in-new-tab.

### [MAJOR] The @-mention dropdown is not keyboard-operable
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:466-486`, triggered by `:273-295`
- **Problem:** A plain `<div className="absolute …">` containing `<button>`s. There is no `role="listbox"`, no `role="option"`, no `aria-expanded`/`aria-controls`/`aria-activedescendant` on the `<textarea>`, no arrow-key handling, and no Escape handler.
- **Impact:** The mention feature is mouse-only. A keyboard user types `@` and the popup appears, but ArrowDown/Enter do nothing and Escape does not dismiss it — the popup just sits there overlaying the input. Focus never enters the list.
- **Fix:** Use the shadcn/Base UI `Command` or `Popover`+`Listbox` primitive (already a dependency pattern in this repo) instead of a hand-rolled div.

### [MAJOR] Typing an email address in the prompt triggers the mention popup
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:278-290`
- **Problem:**
  ```tsx
  const atIndex = textBeforeCursor.lastIndexOf("@")
  if (atIndex !== -1) {
    const textAfterAt = textBeforeCursor.slice(atIndex + 1)
    const hasSpace = textAfterAt.includes(" ")
    if (!hasSpace) { setShowMentions(true); setMentionFilter(textAfterAt); return }
  }
  ```
  There is no check for a preceding word character and no requirement that the text before `@` be empty. Type `contact@` and the file picker opens, filtering for `"contact"`.
- **Impact:** Any email address, handle, or `user@host` string in a prompt spuriously opens the file picker over the textarea. The user must press space to dismiss it, which then *inserts a space into their email address* if they were about to keep typing. `MENTION_FILES` (`:139-164`) has only 4 entries, none matching, so `filteredMentions.length > 0` at `:466` hides the popup — masking the bug for most inputs, but not for `@schema`, `@api`, `@lib`, `@components`, or any prefix of those, which is exactly the advertised usage.
- **Fix:** Require `atIndex === 0` or a whitespace/`(` immediately before `@`.

### [MAJOR] Unlabelled form controls across the AI surfaces
- **Location:**
  - `prompt-panel.tsx:447-455` — the main `<textarea>` has only a `placeholder`, no `<label>` and no `aria-label`. It is the primary input of the entire feature.
  - `prompt-panel.tsx:183-185` — `StackSelect`'s group label is a `<span>`, not programmatically associated with `Select.Trigger` (`:193-206`), which has no `aria-label`.
  - `prompt-panel.tsx:619-621` — `SettingToggle`'s label/description are plain `<span>`s; `Switch.Root` (`:612`) has no accessible name.
  - `results/findings-filters.tsx:51-56` — search `Input` has `placeholder="Search findings..."` only.
  - `results/findings-filters.tsx:37` — `SelectTrigger` has no label; relies on the placeholder.
- **Impact:** Placeholder-as-label is a well-known anti-pattern: it vanishes on input and is not reliably announced. The prompt textarea and the findings search are the two controls a screen-reader user needs most, and both are unnamed.
- **Fix:** Add `<Label htmlFor>` (or `aria-label`) to each; the repo already has `@/components/ui/label` and uses it correctly elsewhere (`infrastructure-client.tsx:676, 686, 716, 726`; `billing-client.tsx:537, 550, 559, 594, 603`; `system-settings.tsx:209, 213, 225, 284, …`), so the correct pattern is established and simply not applied here.

### [MAJOR] Unlabelled OAuth credential fields in System Settings
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:365-370` (Client ID), `:373-379` (Client Secret)
- **Problem:** `<Label>Client ID</Label>` with **no `htmlFor`**, and the adjacent `Input` has **no `id`** — the two are not associated. Same for Client Secret. Both inputs are also `readOnly` (`:368, 377`), so — as in CRITICAL-9 — the credentials cannot be configured despite the section being titled "OAuth".
- **Impact:** Two unlabelled, uneditable credential fields in an admin console. The association failure means a screen reader announces nothing for either field.
- **Fix:** Give the inputs `id`s and the labels `htmlFor`s. (Note the same file does this correctly at `:209-210`, `:284-285`, `:641-642`.)

### [MAJOR] "Test Connection" reports success unconditionally
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:136-143`, rendered `:320-324`
- **Problem:** `setTimeout(() => { setSmtpTesting(false); setSmtpTestResult("success") }, 1000)`. No SMTP connection is attempted; the outcome is hardcoded. The badge reads "Koneksi SMTP berhasil (mock)" (`:322`).
- **Impact:** The "(mock)" suffix is honest, but the interaction still performs a fake success ritual — spinner, then green success badge — for a host that was never contacted. Combined with the never-persisted host/port/user/password fields (`defaultValue` at `:285-301`), the SMTP tab is entirely non-functional while looking operational.
- **Fix:** Disable the button, or state up front that SMTP is not configurable in the demo.

### [MAJOR] "Buat Database" navigates to the project list
- **Location:** `app/(dashboard)/admin/databases/admin-databases-client.tsx:93-96`
- **Problem:** `<Button onClick={() => router.push("/projects")}><Plus/>Buat Database</Button>`. It routes to the projects index, not to any database-creation UI.
- **Impact:** A create action that lands the user on an unrelated list page. They will reasonably assume the button is broken. (A real create-database dialog does exist, but at `/projects/[id]/databases`, not reachable from here.)
- **Fix:** Point it at the project-scoped database page, or rename it.

### [MAJOR] Hardcoded hex colors and inline styles in Admin Databases
- **Location:** `app/(dashboard)/admin/databases/admin-databases-client.tsx:38-41` (hex constants), `:207-210` (inline style), `:226` (inline style)
- **Problem:**
  ```tsx
  HEALTHY:     { label: "Sehat", color: "#22c55e" },   // :38
  BACKUPING:   { label: "Mem-backup", color: "#eab308", pulse: true },
  ERROR:       { label: "Error", color: "#ef4444" },
  MAINTENANCE: { label: "Pemeliharaan", color: "#3b82f6" },
  ```
  then
  ```tsx
  style={{ backgroundColor: `${ENGINE_META[db.engine].color}1a`, color: ENGINE_META[db.engine].color }}  // :207-210
  style={{ backgroundColor: status.color }}                                                              // :226
  ```
  `AGENTS.md` forbids both hardcoded hex in classes and inline styles for styling, and mandates semantic tokens. These are the **only** hex literals in the entire scope (verified across all 45 files) — the rest of the codebase correctly uses `text-green-500`, `bg-destructive/10`, etc.
- **Impact:** Direct convention violation, and a genuine dark-mode defect: `#22c55e` on a dark background and `#3b82f6` for MAINTENANCE have no `dark:` variant, so the status dot and engine badge will not meet contrast requirements in dark theme. The engine badge is also built by string-concatenating a hex with `1a` alpha (`:208`) — a hex-alpha trick that bypasses Tailwind entirely.
- **Fix:** Map to semantic tokens (`text-green-500`, `text-destructive`, …) and Tailwind opacity modifiers (`bg-green-500/10`), as `infrastructure-client.tsx:59-63` already does correctly with `NODE_STATUS_META`.

### [MAJOR] Plaintext database passwords in a client-imported module
- **Location:** `lib/mock-data.ts:825, 856, 887` (`sk-live-9f2b7c41ae`, `redis-tk81mz04`, `pg-an-338bd1c9f2`), consumed by `admin-databases-client.tsx:26`
- **Problem:** `MOCK_DATABASES[].connection.password` holds realistic-looking live secrets. `admin-databases-client.tsx` is `"use client"`, so this module is in the public browser bundle. The masked `uri` field (`:826`) shows the authors intended to hide them — but `password` sits right beside it unmasked, and `DbConnection` (`:706-714`) requires it.
- **Impact:** Out of scope as a *mock*, but it is a landmine: the field is named `password`, typed as required, and shaped like a real secret. Copy-paste this fixture into a real project and real credentials ship to the browser. It is also why CRITICAL-1's bundle-exposure note matters.
- **Fix:** Make `password` optional or drop it from the client-facing type; keep secrets server-side.

### [MAJOR] "Create user" is a completely unreachable code path
- **Location:** `app/(dashboard)/admin/users/users-page-client.tsx:87, 159-164, 166-197`; `user-form-sheet.tsx:54, 57, 103-111, 116`
- **Problem:** `sheetMode` initialises to `"create"` (`:87`), but `setSheetOpen(true)` appears **only once** in the file — at `:163`, inside `openEdit`, which always sets `"edit"` first (`:160`). Nothing ever opens the sheet in create mode. Consequently `handleSheetSubmit`'s create branch is unreachable: with `sheetMode !== "edit"`, control falls straight to `setSheetOpen(false)` (`:196`) and **no user is created**. Also dead: `EMPTY_USER_FORM` (`:22` in the sheet), the "Buat User" label (`:116`), and the "Password awal akan diset ke `demo1234`" note (`:103-111`).
- **Impact:** Currently harmless because it is unreachable — but it is a loaded gun. The moment someone wires a "Tambah User" button to `setSheetOpen(true)`, the form will validate, show no error, close, and silently create nothing. Roughly 40 lines of dead code (`user-form-sheet.tsx:103-111` is a user-facing lie about a default password).
- **Fix:** Implement the create branch (call `handleInvite`) or delete the `"create"` mode entirely.

### [MAJOR] The role description is screen-reader-only exactly when it should be visible
- **Location:** `app/(dashboard)/admin/users/_components/invite-user-dialog.tsx:105-112`
- **Problem:**
  ```tsx
  <p className={cn("text-xs text-muted-foreground", !isValid && "sr-only")}>
    {ROLE_DESCRIPTIONS[role]}
  </p>
  ```
  The condition is **inverted**. `isValid` is `email.includes("@")` (`:58`). So the consequence text — "Admin memiliki akses penuh termasuk manajemen user." — is `sr-only` when the email is **invalid**, and visible when the email is **valid**.
- **Impact:** A blind user typing a malformed email is read the role description; a blind user with a valid email hears nothing. Sighted users see it at the worst possible time — after they've finished the email field, when they are deciding whether the selected role is right. The whole point of `ROLE_DESCRIPTIONS` (`:31-35`) is to inform the role choice.
- **Fix:** Drop the `!isValid && "sr-only"` entirely — the description should always be visible.

### [MAJOR] `dateFilter`-style dead filters aside, three more filters/charts are decorative
- **Location:** `billing-client.tsx:67-71, 376-380`; `admin-overview.tsx:110-113, 257`; `infrastructure-client.tsx:257`
- **Problem:**
  - `BILLING_STATUS` (`:67-71`) has entries for only 3 of the 6 mock users. The 3 invited users (`dave@startup.io`, `rina@client.co`, `budi@agency.dev` — `mock-data.ts:116-148`) render in the Subscription list with a plan and price (from `getPlanMeta(role)`, `:376-380`) but `billing` is `undefined`, so the entire `Next: …` / status block (`:413-429`) is silently omitted. The stat card above claims **"Active Subs: 3"** (`:41-44`) while **6** rows are listed.
  - `admin-overview.tsx:110` — the "Total User" card shows `MOCK_USERS.length` (**6**) with the note **"3 akun demo aktif"**. The note contradicts the number directly above it.
  - `infrastructure-client.tsx:257` — the Clusters card shows the literal text **"Semua sehat"**, hardcoded, while `Cluster.status` (`:69`) is typed `"healthy" | "degraded"` and rendered conditionally at `:425`. The `degraded` branch is unreachable: nothing in the file ever sets a cluster's status.
- **Impact:** A recurring pattern — hardcoded annotations that contradict the computed values beside them. Individually minor; collectively they mean an admin cannot trust any number on any of these pages. `admin-overview.tsx:112-113` adds `"+12 minggu ini"` and `"99.9%"` as literals.
- **Fix:** Derive every annotation from the same data as the value it annotates, or delete it.

### [MAJOR] Five severity cards in a fixed 5-column grid
- **Location:** `app/(dashboard)/ai-reviewer/_components/results/overview-tab.tsx:26`
- **Problem:** `<div className="grid grid-cols-5 gap-3">` with no responsive prefix, containing five severity cards (`:27-46`) each with a `text-2xl` number and a label.
- **Impact:** On a 375px viewport each column is ~60px wide. The labels "Critical", "Medium", "Info" and the counts are forced into ~60px, wrapping or overflowing. There is no `sm:`/`md:` variant at all.
- **Fix:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`.

### [MAJOR] "Mark False Positive" is unrepresentable in the UI even though the type supports it
- **Location:** `app/(dashboard)/ai-reviewer/_components/types.ts:7`; `finding-detail-sheet.tsx:96-98`
- **Problem:** `FindingStatus = "open" | "fixed" | "false_positive"` is declared, and `mock-data-reviewer.ts:141` findings carry a `status`, but no component reads or writes `finding.status`. The button at `:96` has no handler.
- **Impact:** A user triaging findings — the core workflow of a code-review tool — has no way to dismiss noise. Every finding stays "open" forever, and the counts never move. The data model is complete; only the wiring is missing.
- **Fix:** Add a status control and thread it into local state; filter the list by status.

### [MAJOR] `onPromptType` is never called for user-typed prompts (root cause of CRITICAL-7)
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:431` (only call site) vs `:324-333` (`handleGenerate`) and `:273-295` (`handlePromptChange`)
- **Problem:** `onPromptType(detectPromptType(ex.prompt))` runs **only** in the example-prompt `onClick`. Neither `handleGenerate` nor the textarea's `onChange` calls it. `detectPromptType` (`mock-previews.ts:19-24`) is a pure prefix match against 6 hardcoded strings and would return `null` for free-form text regardless — so even if it were called, hand-typed prompts would still get `null`.
- **Impact:** This is the mechanism behind the blank-iframe path in CRITICAL-7, and it is listed separately because the fix is different: calling `detectPromptType` is not sufficient. `EXAMPLE_MAP` (`mock-previews.ts:10-17`) only matches the 6 canned example prompts, so typed prompts can *never* be classified. The detection is not a heuristic over the prompt — it is an exact-match lookup table for the example buttons that call it.
- **Fix:** Either derive a preview from real keyword matching, or stop branching on `promptType` and always render a mock preview.

### [MAJOR] Invalid stack value `"nest"` breaks the Blog Platform example
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:108` vs `:126-131`
- **Problem:** `BACKEND_OPTIONS` values are `hono | nestjs | django | fastapi` (`:127-130`). The Blog Platform example declares `stack: { frontend: "nextjs", backend: "nest", database: "mysql" }`. Clicking it calls `setBackend("nest")` (`:429`).
- **Impact:** `StackSelect`'s `selected = options.find((o) => o.value === value)` (`:179`) returns `undefined`, so the brand icon is not rendered (`:199-201`) and `Select.Value` (`:202`) has no matching item — the trigger renders blank or shows the raw unmatched value. This is the **only** one of the 6 examples with a bad value (I checked all six; the other five are valid), and it is a visible, reproducible broken state.
- **Fix:** `"nest"` → `"nestjs"`. Better: type the stack field as a union of the option values so this cannot compile.

### [MAJOR] `formatTimeAgo` is duplicated verbatim
- **Location:** `app/(dashboard)/ai-reviewer/_components/dashboard/security-posture-banner.tsx:12-21`; `dashboard/recent-reviews-table.tsx:15-24`
- **Problem:** The same 10-line function, byte-identical, in two files. Neither is exported from a shared module.
- **Impact:** Two copies of time maths that must stay in sync, in a codebase that has an explicit `_components/shared/` directory for exactly this (`shared/score-badge.tsx`, `shared/severity-badge.tsx`). The duplication is also where the build-time `Date.now()` problem (CRITICAL-13) is duplicated.
- **Fix:** Move to `_components/shared/format-time-ago.ts` and fix the SSR issue in one place.

### [MINOR] `cn()` bypassed with template literals
- **Location:** `app/(dashboard)/admin/ai-config/ai-config-client.tsx:123, 217`; `app/(dashboard)/admin/users/_components/role-badge.tsx:30, 45`
- **Problem:** `` className={`h-5 w-5 ${stat.color}`} ``, `` className={`gap-1.5 ${roleClassName} ${className ?? ""}`} ``. `AGENTS.md` mandates `cn()` for conditional classes — `cn()` runs `tailwind-merge`, which is what lets a caller's `className` *override* a component's defaults.
- **Impact:** Real (if small) behavioural difference: in `role-badge.tsx:30` and `:45`, a caller passing `className="text-red-500"` produces `text-amber-500 … text-red-500` in the DOM. Without `tailwind-merge` the winner depends on CSS source order, not on the caller's intent.
- **Fix:** `cn("gap-1.5", roleClassName, className)`.

### [MINOR] Index used as a React key
- **Location:** `app/(dashboard)/admin/ai-config/ai-config-client.tsx:276`; `app/(dashboard)/ai-architect/_components/preview-panel.tsx:401, 729`
- **Problem:** `AI_HISTORY.map((entry, idx) => <tr key={idx}>)` (`:276`); `lines.slice(...).map((line, i) => <div key={i}>)` (`:401`); the terminal array `.map((line, i) => <div key={i}>)` (`:729`).
- **Impact:** Harmless today because these lists are static and append-only. `preview-panel.tsx:401` is the one to watch: the list grows incrementally as `visibleLines` advances, and index keys make React reuse DOM nodes by position — correct here, fragile if the list ever becomes dynamic.
- **Fix:** Use a stable id (`finding.id`, `line.text + i`, `entry.user + entry.timestamp`).

### [MINOR] Dead `success?: boolean` field in the audit action map
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:85`
- **Problem:** `ACTION_META`'s value type declares `success?: boolean`, but no entry sets it and nothing reads it (verified: no `meta.success` anywhere).
- **Impact:** Dead code that implies a success/failure model the code does not have. Success/failure is instead inferred from the `detail` string via `isDeployFailed` (`:160-162`), which is fragile string matching.
- **Fix:** Remove the field, or add a real `outcome` to `MockAuditLog`.

### [MINOR] `EXTRA_LOGS` reuses `project_created` for a deletion
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:56-63`, detected by `:164-166, 368, 410-412`
- **Problem:** `{ actionType: "project_created", detail: "Menghapus proyek Legacy Monolith dari sistem" }`. `AuditActionType` (`mock-data.ts:559-565`) has no `project_deleted`, so a delete is filed as a create and then special-cased with `isDeleteAction()` string matching (`:164-166`).
- **Impact:** Any future filter or count on `project_created` silently includes deletions. The `isDeleteAction` helper is load-bearing purely because the taxonomy is missing a member.
- **Fix:** Add `project_deleted` to `AuditActionType` and give the log an explicit `outcome`.

### [MINOR] `OAUTH_PROVIDERS.connected` is never read
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:45, 53, 61` vs `:93-97, 341`
- **Problem:** Each provider declares `connected: true | false`, but the rendered state comes from `oauthStatus` (`:93-97`) via `oauthStatus[provider.id]` (`:341`). The `connected` field is dead.
- **Impact:** Two sources of truth for the same fact. They happen to agree today (`github: true`), so a future edit to one will silently diverge.
- **Fix:** Delete `connected` from the constant.

### [MINOR] `selectedStackBadges` is declared after the component that uses it
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:627` (declared) vs `:403` (used)
- **Problem:** `PromptPanel` is defined at `:246` and calls `selectedStackBadges(...)` at `:403`; the helper is declared at `:627`, ~380 lines later. This is the shape `AGENTS.md` Gotcha #7 warns about (helper declared after the effect that uses it).
- **Impact:** **None at runtime** — it is a hoisted `function` declaration, so this is safe. I verified it is not a `const` arrow (which would throw a TDZ `ReferenceError`). It is a readability/ordering nit, and worth fixing only because the codebase has an explicit rule about helper ordering that this violates in spirit.
- **Fix:** Move it above `PromptPanel`, next to `StackSelect`/`StackBadge`.

### [MINOR] `StackSelect`'s `options` prop is typed as the frontend list specifically
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:174`
- **Problem:** `options: typeof FRONTEND_OPTIONS` — yet it is passed `BACKEND_OPTIONS` (`:387`) and `DATABASE_OPTIONS` (`:394`). This compiles only because all three arrays are structurally identical `{value: string; label: string; Icon: …}`.
- **Impact:** The type is a lie: it claims "a list of frontend options" for what is a generic list. It also cannot catch the `"nest"` bug (MAJOR-22) because `value` is just `string`.
- **Fix:** `options: ReadonlyArray<{value: string; label: string; Icon: React.ComponentType<{className?: string}>}>`.

### [MINOR] `.filter(Boolean)` followed by an `as` cast
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:636-640`
- **Problem:**
  ```ts
  return [ fe && {...}, be && {...}, db && {...} ].filter(Boolean) as {…}[]
  ```
  `filter(Boolean)` does not narrow, so the result needs an unchecked assertion. `AGENTS.md` forbids `any` and pushes for proper types; this is the same smell one level up.
- **Impact:** If the array shape changes, the cast hides the mismatch until runtime (a `badge.icon` of `undefined` would render `<undefined/>`).
- **Fix:** Use a type predicate: `.filter((b): b is Badge => b !== null)` after mapping to `Badge | null`.

### [MINOR] Non-null assertion on a `find`
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:314`
- **Problem:** `const current = options.find((o) => o.value === network)!`. `Network` (`:40`) is `"wifi" | "4g" | "offline"` and all three are in `options` (`:309-311`), so it is safe — but it is the one non-null assertion in the scope, and `current.icon` is dereferenced immediately at `:334`.
- **Impact:** None today. It would throw on render if `Network` ever gained a member.
- **Fix:** Handle the `undefined` case, or derive `current` from a lookup object typed as `Record<Network, …>`.

### [MINOR] Unchecked `as` casts on select values
- **Location:** `app/(dashboard)/admin/users/user-form-sheet.tsx:91`; `admin-databases-client.tsx:147, 160`; `ai-reviewer/_components/results/results-tabs.tsx:21, 28`
- **Problem:** `onFormChange({ ...form, role: e.target.value as Role })` (`user-form-sheet.tsx:91`); `setEngineFilter(e.target.value as DatabaseEngine | "ALL")` (`admin-databases-client.tsx:147`); `useState<string>("all")` compared against `f.severity` (`results-tabs.tsx:21, 28`).
- **Impact:** `user-form-sheet.tsx:91` is the most exposed: the value comes from a hardcoded `<option>` list (`:95-99`) so it is safe, but the cast means a future option with a typo'd value becomes an invalid `Role` that `roleAtLeast` would then silently mis-rank (`ROLE_HIERARCHY[bad]` → `undefined >= 3` → `false`). `results-tabs.tsx` uses `string` where `Severity | "all"` is available, losing the type link to `types.ts` that the rest of the reviewer feature maintains well.
- **Fix:** Derive the union from the options array (`typeof ROLES[number]`) and type the filter as `Severity | "all"`.

### [MINOR] Empty `catch` swallows clipboard failures
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:126-133`
- **Problem:** `catch { // abaikan di demo }` — the comment is accurate but the user gets no feedback. The button simply never flips to "Tersalin".
- **Impact:** On a static export served over plain HTTP (a very likely deployment for this Docker/VPS setup), `navigator.clipboard` is **undefined** in a non-secure context. So "Salin" can fail for *every* user with no explanation. Note the sibling implementation at `preview-panel.tsx:471` has no `.catch()` at all — an unhandled promise rejection.
- **Fix:** Show a failure state, or fall back to `document.execCommand("copy")` / a selectable `<code>` element.

### [MINOR] `navigator.clipboard.writeText` with no error handling
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:471`
- **Problem:** `navigator.clipboard.writeText(url)` is not awaited and has no `.catch()`. The `setCopied(true)` on the next line runs regardless.
- **Impact:** The "copied ✓" state (`:536-537`) is shown even if the write failed, and the rejection is unhandled. Same non-secure-context caveat as above.
- **Fix:** `await` it in a `try/catch` and only set `copied` on success.

### [MINOR] Filter state duplicated between parent and child
- **Location:** `app/(dashboard)/ai-reviewer/_components/results/findings-filters.tsx:19-20` and `results/results-tabs.tsx:21-22, 37-40, 59`
- **Problem:** `severity` and `search` live in **both** components, kept in sync through `onFilterChange(severity, search)` (`findings-filters.tsx:25, 31`; `results-tabs.tsx:37-40`). The parent stores values it never uses except to pass to `filteredFindings` (`:26-35`).
- **Impact:** Two sources of truth synchronised by an imperative callback. Adding a third filter means touching both files and hoping the pairs stay aligned. The child could be fully controlled, or the parent could own the state and pass values down.
- **Fix:** Lift to `results-tabs.tsx` and pass `severity`/`search`/`onSeverityChange`/`onSearchChange` down.

### [MINOR] Duplicated hardcoded "activity" datasets that contradict each other
- **Location:** `app/(dashboard)/admin/admin-overview.tsx:31-62` vs `app/(dashboard)/admin/audit/audit-log.tsx:47-81`
- **Problem:** `RECENT_ACTIVITIES` (`admin-overview.tsx:31-62`) and `EXTRA_LOGS` + `MOCK_AUDIT_LOGS` (`audit-log.tsx:47-81`) are two independent hardcoded activity feeds. The overview's "Lihat Semua →" link (`admin-overview.tsx:191-196`) points at `/admin/audit`, which shows a **different** set of events.
- **Impact:** The dashboard's activity feed and the audit log it links to tell different stories — e.g. the overview shows "Role ditetapkan: dev@omnistack.dev sebagai USER · 3 jam lalu" (`admin-overview.tsx:45-49`) while the audit log's equivalent entry (`mock-data.ts:600-607`) says "5 jam lalu". Two sources of truth for the audit trail.
- **Fix:** Render `RECENT_ACTIVITIES` from `MOCK_AUDIT_LOGS` (+ `EXTRA_LOGS`) instead of a parallel literal.

### [MINOR] The audit log's own copy calls the CSV export a "trail"
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:200-221`
- **Problem:** The CSV *does* work (real `Blob` + object URL + programmatic click, `:209-215`) — credit where due. But: (a) no UTF-8 BOM, so Excel mangles the Indonesian text; (b) no quote-escaping of the `detail` field, which is wrapped in `"` at `:204` — any embedded `"` breaks the row, and a leading `=`, `+`, `-` or `@` in a field is a **CSV-injection** vector when opened in Excel; (c) `URL.revokeObjectURL(url)` at `:215` runs synchronously right after `link.click()`, which can race the download in some browsers.
- **Impact:** Low in a demo, but the export is the one genuinely functional feature on the page and it has real correctness gaps.
- **Fix:** Add `\uFEFF`, escape `"` by doubling, prefix dangerous leading characters, and revoke in a `setTimeout`.

### [MINOR] Wrong icon on the "Kelola User" link
- **Location:** `app/(dashboard)/admin/admin-overview.tsx:144-147`
- **Problem:** `<Link href="/admin/users" className={...}><Settings className="mr-2 h-4 w-4" />Kelola User</Link>`. A `Settings` (gear) icon on a link labelled "Kelola User" — and the identical `Settings` icon is already used on the "Settings" link two lines above (`:138-142`).
- **Impact:** Two adjacent buttons with the same glyph and different meanings.
- **Fix:** Use `Users` (already imported at `:16`).

### [MINOR] Redundant wrapper `<div>` in the reviewer dashboard header
- **Location:** `app/(dashboard)/ai-reviewer/_components/dashboard/dashboard-view.tsx:18-28`
- **Problem:** `<div><div className="flex items-center gap-3">…</div></div>` — the outer div has no className and no purpose.
- **Fix:** Remove the outer element.

### [MINOR] Raw `<table>` instead of the `Table` primitive
- **Location:** `app/(dashboard)/admin/ai-config/ai-config-client.tsx:266-291`
- **Problem:** A hand-rolled `<table className="w-full text-sm">` with hand-rolled `<thead>`/`<th>` styling, while `audit-log.tsx:350-358` and `admin-databases-client.tsx:174-183` in the *same admin section* use `@/components/ui/table`.
- **Impact:** Inconsistent styling, and the raw table misses whatever the `Table` primitive provides (responsive overflow wrapper, sticky header, consistent cell padding).
- **Fix:** Use the `Table` components.

### [MINOR] Native `<select>` used where the codebase has a shadcn `Select`
- **Location:** `app/(dashboard)/admin/users/user-form-sheet.tsx:87-100`; `admin-databases-client.tsx:131, 144, 157`; `system-settings.tsx:214-222, 642-650`; `billing-client.tsx:538-547`
- **Problem:** Hand-styled native `<select>` elements with long inline class strings (e.g. `billing-client.tsx:542`, `system-settings.tsx:217, 645`) sitting next to the shadcn `Select` used in `invite-user-dialog.tsx:93-104` and `findings-filters.tsx:36-48`. The class strings are duplicated verbatim across `system-settings.tsx:217` and `:645`.
- **Impact:** Visual inconsistency, duplicated style strings, and no Base UI keyboard/focus behaviour. Note the native selects in `admin-databases-client.tsx` *do* have `aria-label`s (`:132, 145, 158`) — better a11y than the shadcn ones they should be using.
- **Fix:** Replace with `@/components/ui/select` and add `aria-label` to the triggers.

### [MINOR] Direct `@base-ui/react` imports bypass the shadcn wrapper
- **Location:** `app/(dashboard)/ai-architect/_components/prompt-panel.tsx:15-16` (`Select`, `Switch`)
- **Problem:** `import { Select } from "@base-ui/react/select"` and `import { Switch } from "@base-ui/react/switch"`, then a fully hand-rolled `StackSelect` (`:166-229`) and `SettingToggle` (`:599-625`) built on the raw primitives. Every other dropdown/switch in scope uses `@/components/ui/*`.
- **Impact:** `AGENTS.md` is explicit that `components/ui/` is the shadcn layer and that components should be added/managed via the CLI. Hand-rolling on the primitives means these two controls will not pick up theme tokens or behaviour fixes applied to the shared versions. The hand-rolled `StackSelect` is also a **duplicate** of the existing `Select` usage in `invite-user-dialog.tsx:93-104` and `findings-filters.tsx:36-48` — ~60 lines of reimplementation, and it lacks the `aria-label` those versions at least approximate.
- **Fix:** `npx shadcn@latest add select switch` and delete the local reimplementations.

### [MINOR] `setTimeout` without cleanup in seven places
- **Location:** `users-page-client.tsx:105-108`; `billing-client.tsx:161-164`; `audit-log.tsx:220, 225`; `ai-config-client.tsx:91`; `system-settings.tsx:119, 122, 130`; `prompt-panel.tsx:316-319`; `preview-panel.tsx:473`; `infrastructure-client.tsx:182-184, 218-220`
- **Problem:** `showNotice` in particular (`users-page-client.tsx:105-108`) schedules `setNotice(null)` on an untracked timer. Two rapid actions queue two timers; the first clears the second's notice early. `infrastructure-client.tsx:182-184` and `:218-220` schedule node/DB state transitions (`handleRebootNode`, `handleRestartDb`) with no cancellation — clicking Reboot twice schedules two overlapping transitions, and navigating away fires `setState` on an unmounted component.
- **Impact:** Race-y toasts and state transitions; no crash in React 19, but incorrect behaviour.
- **Fix:** Store the timeout id in a ref and `clearTimeout` on the next call and in a cleanup effect.

### [MINOR] "Code Quality" tab is a hardcoded placeholder
- **Location:** `app/(dashboard)/ai-reviewer/_components/results/results-tabs.tsx:66-70`
- **Problem:** `<div className="rounded-lg border p-6 text-center text-muted-foreground">Coming in v2</div>`.
- **Impact:** Honest, but it is one third of the primary tab bar with no content. The "Security" count badge (`:47`) is the only element with a number, so the bar reads as if the other two are secondary.
- **Fix:** Acceptable as a placeholder; consider disabling the trigger so it is not focusable-but-useless.

### [MINOR] Severity signalled with coloured-circle emoji
- **Location:** `app/(dashboard)/ai-reviewer/_components/results/findings-filters.tsx:42-46`; `results-tabs.tsx:49`
- **Problem:** `🔴 Critical`, `🟠 High`, `🟡 Medium`, `🔵 Low`, `⚪ Info` in the filter options, and a bare `🔴` in the Security tab trigger.
- **Impact:** Inconsistent with the rest of the app, which uses `SeverityBadge` (`shared/severity-badge.tsx`) and Lucide icons. Emoji rendering varies by platform (notably on Windows, where 🔴/🟠/🟡 render as flat monochrome glyphs), so the severity distinction degrades to near-nothing. `AGENTS.md` also asks to avoid emoji. The tab's `🔴` is a *second*, conflicting severity indicator sitting next to `SeverityBadge`-styled content.
- **Fix:** Use `SeverityBadge` in the filter options and a Lucide icon in the tab trigger.

### [MINOR] `settings_changed` badge has no visual distinction between connected states
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:350-356`
- **Problem:**
  ```tsx
  className={cn(isConnected ? "text-muted-foreground border-border" : "text-muted-foreground")}
  ```
  Both branches resolve to the same colour; only `border-border` differs. The `cn()` call is decorative.
- **Impact:** Cosmetic only — the "Connected"/"Not Connected" text label carries the meaning, so it is not a colour-only failure.
- **Fix:** Use `text-green-500`/`text-muted-foreground`, or drop the conditional.

### [MINOR] Same icon for the "OAuth" and "API Keys" tabs
- **Location:** `app/(dashboard)/admin/settings/system-settings.tsx:181` and `:185`
- **Problem:** Both `TabsTrigger`s render `KeyRound` (imported once at `:8`).
- **Impact:** Two adjacent tabs with identical glyphs.
- **Fix:** Use `KeyRound` for API Keys and something like `Fingerprint`/`LogIn` for OAuth.

### [MINOR] `Loader2` (a spinner) used as a static stat icon
- **Location:** `app/(dashboard)/admin/ai-config/ai-config-client.tsx:59`
- **Problem:** `{ label: "Request Hari Ini", value: "84", icon: Loader2, ... }`. `Loader2` is the app's loading spinner, and it is also reused for "Estimasi Biaya" alongside `Coins` (`:60`).
- **Impact:** A spinner glyph in a static KPI card reads as "this number is loading". Two of the three stat cards share an icon.
- **Fix:** Use `Activity`/`Zap` for requests and a distinct icon for cost.

### [MINOR] `previewUrl` shows in three places at once
- **Location:** `app/(dashboard)/ai-architect/_components/preview-panel.tsx:528` (URL bar), `:585-587` (iframe chrome), and the `src`/`srcDoc` at `:593, 606`
- **Problem:** The same (possibly 40-character `Date.now()`) URL is rendered twice, and the raw timestamp URL is also what gets loaded.
- **Impact:** Visual noise; the `project-1756…` URL is long and breaks the centred chrome layout.
- **Fix:** Derive a short display label from the URL.

### [MINOR] Pagination is unreachable — fewer rows than `PAGE_SIZE`
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:158` (`PAGE_SIZE = 10`) with 10 total rows (`:81`); `admin/users/users-page-client.tsx:59` (`PAGE_SIZE = 10`) with 6 users
- **Problem:** Both pages build a full pagination control (`audit-log.tsx:439-468`, `users-page-client.tsx:589-618`) but neither dataset reaches 10 rows without filtering. The "1 / 1" indicator and the disabled prev/next buttons are the only visible state.
- **Impact:** ~50 lines of pagination machinery that can never paginate, and a "Menampilkan 1–10 dari 10 log" affordance implying a larger dataset exists. The users page becomes exercisable only after deleting users.
- **Fix:** Keep it (it is correct code and the data could grow) but note it is untestable in the current fixture.

### [MINOR] `safePage` clamps for display but not for state
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:195`; `admin/users/users-page-client.tsx:154`
- **Problem:** `const safePage = Math.min(page, totalPages)` — the rendered page is clamped, but `page` state is not written back. The prev button's handler uses `Math.max(1, p - 1)` on the *unclamped* `p` (`users-page-client.tsx:599`).
- **Impact:** Harmless in practice (the clamp makes the UI correct), but the state and the view can disagree, which is a latent bug if the clamp is ever removed.
- **Fix:** Reset `page` to 1 inside the filter `useMemo`/handlers (which is already done everywhere) and drop the clamp, or sync via an effect.

### [MINOR] `handleAddNode`/`handleRemoveNode` mutate cluster counts with no membership model
- **Location:** `app/(dashboard)/admin/infrastructure/infrastructure-client.tsx:164, 172`
- **Problem:** `setClusters(prev => prev.map(c => c.name === "production" ? {...c, nodeCount: c.nodeCount + 1} : c))`. `VPSNode` (`:42-50`) has no `clusterId`, so *any* node added increments `production`, and *any* node removed decrements it — including a node the user might conceptually associate with `staging`. `INITIAL_CLUSTERS` says production=3, staging=1, while `INITIAL_NODES` has 4 nodes (`:52-57`): the numbers are already inconsistent before any interaction.
- **Impact:** The cluster node counts drift arbitrarily and are already wrong on load. The "Scale down" button is also disabled at `nodeCount <= 1` (`:445`) while `Math.max(1, ...)` (`:448`) is a redundant second guard.
- **Fix:** Add `clusterId` to `VPSNode` and derive counts, or label the clusters card as illustrative.

### [MINOR] `ACTORS` are matched by display name, not ID
- **Location:** `app/(dashboard)/admin/audit/audit-log.tsx:125-129, 364`
- **Problem:** `ACTOR_ROLE[log.actor] ?? "USER"` maps the hardcoded strings `"Admin OmniStack"` → `ADMIN`. Any actor not in the map is silently labelled `USER`.
- **Impact:** A system actor, a renamed user, or a deleted user is mislabelled `USER` with no warning. `MockAuditLog.actor` (`:567-574`) should be a `userId`.
- **Fix:** Store `actorId` and look up `MOCK_USERS`; render `?? "SYSTEM"` for non-user actors.

### [MINOR] Redundant conditional around a single value
- **Location:** `app/(dashboard)/admin/billing/billing-client.tsx:409` — `cn(plan.badgeClass)`
- **Problem:** `cn()` with one argument. `plan.badgeClass` may be `""` (the Free plan, `:99`).
- **Impact:** Noise; suggests a merge is happening when it is not.
- **Fix:** `className={plan.badgeClass || undefined}`.

---

## Statistics

- **Total files:** 45
- **Total LOC:** 7,617
- **CRITICAL:** 16 · **MAJOR:** 29 · **MINOR:** 32 · **Total: 77**

**Dead-end interactions found: 31** (interactive UI that produces no real effect)
- No `onClick` at all: 3 — `finding-detail-sheet.tsx:92` "Apply AI Fix", `:96` "Mark False Positive", `preview-panel.tsx:677` "Open in Cloud IDE"
- Fake success, no persistence: 12 — `system-settings.tsx` ×6 save buttons (`:164, 261, 328, 606, 676` + the shared `handleSave:116`), `ai-config-client.tsx:110`, `audit-log.tsx:223` "Export PDF", `billing-client.tsx:518` "Export Report", `:570` "Simpan Invoice", `:166` "Kelola", `:170` coupon
- Security/diagnostic controls that do nothing: 5 — `system-settings.tsx:253` Maintenance Mode, `:575` 2FA Enforcement, `:583` Session Timeout, `:214` Default Role, `:634` Backup schedule
- Controls that are read but have no consumer: 4 — `prompt-panel.tsx:258-260` (3 advanced toggles), `preview-panel.tsx:310` 4G throttle
- Non-persisting / mis-wired actions: 4 — `system-settings.tsx:441` copy masked key, `prompt-panel.tsx:324` "Generate App" fabricated URL, `preview-panel.tsx:546` "Open in new tab" no-op, `admin-databases-client.tsx:93` "Buat Database" → `/projects`
- Inert filters: 1 — `audit-log.tsx:170` `dateFilter` (rendered, never read)
- Permanently disabled: 1 — `billing-client.tsx:475` "Unduh PDF"
- Inert features: 1 — `system-settings.tsx:598` Password Policy (static text, no input)

**RBAC holes: 4**
1. **Client-side-only enforcement** (`route-guard.tsx:1,35-44`) with no `middleware.ts` and no server — UX, not security, as the code's own comment at `:22` concedes. Stated plainly: **in this static export, nothing stops a non-ADMIN from reading the admin data; they only get redirected after the browser has already downloaded it.**
2. **Admin dataset is public.** `MOCK_USERS` (emails), `MOCK_AUDIT_LOGS`, and `MOCK_DATABASES` (plaintext passwords) are all reachable from `"use client"` modules → public JS chunks.
3. **No action-level authorization primitive exists.** `roleAtLeast` is called only from `route-guard.tsx` and `auth-context.tsx` — i.e. only in the browser. `getMockProjectsByUser` / `getMockDeploymentsForRole` / `getMockDatabasesForRole` scope *reads* correctly, but there is no `can(user, action)` check guarding any mutation. The mutating admin actions (delete user, change role, suspend, system settings) rely **solely** on the page-level guard.
4. **Guards render nothing on denial** (`route-guard.tsx:58 return null`) — a blank screen, not an access-denied state, and the loading spinner (`:46-56`) has no `role="status"`/`aria-label`/sr-only text, so the entire auth resolution is silent to assistive tech.

**Not defects — verified clean:**
- Zero `asChild` (Base-UI-not-Radix rule respected throughout).
- Zero `any`, zero `@ts-ignore`, zero `@ts-expect-error`, zero `eslint-disable` in scope.
- Zero missing `key` props across all ~40 JSX `.map()` sites.
- Zero rules-of-hooks violations: every early return follows all hooks in its component; no helper is referenced before its `const` initialisation.
- `app/(dashboard)/admin/databases/page.tsx` is the one route with **defence in depth** — `RouteGuard` *plus* `getMockDatabasesForRole(user.id, user.role)` re-scoping the data at `admin-databases-client.tsx:52-55`. Worth using as the template for the other seven.
- `audit-log.tsx:200-221` CSV export genuinely works (real `Blob`, object URL, programmatic click) — the one fully functional export in scope.
- `types.ts` is used consistently across the whole ai-reviewer feature (`Review`, `Finding`, `Severity`, `ReviewStats`, `SecurityPosture`); the only leaks are `results-tabs.tsx:21` (`string` instead of `Severity | "all"`) and `findings-filters.tsx:15` (`severity: string`).
- No network calls, no `fetch`, no Server Actions, no database dependency in scope.

**Highest-priority five, in order:**
1. CRITICAL-1 (RBAC is UX; secrets in the client bundle; no action-level authz primitive) — the architectural one.
2. CRITICAL-2 / CRITICAL-3 (AI Reviewer's two primary CTAs and AI Architect's "Open in Cloud IDE" have no handler at all).
3. CRITICAL-4 through CRITICAL-6 (System Settings: fake saves, inert maintenance mode, inert security controls) — the admin console actively asserts protections that do not exist.
4. CRITICAL-7 / CRITICAL-8 (Generate App fabricates a URL; the Freedom Stack Builder does not configure anything) — the two headline AI Architect claims.
5. MAJOR-6 / MAJOR-7 / MAJOR-8 (severity counts contradict the findings list; trend colours inverted for security metrics; keyboard users cannot leave the reviewer dashboard) — correctness and blocking a11y in the same components.
