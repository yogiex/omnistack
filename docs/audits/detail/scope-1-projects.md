# Scope 1 — Projects & Databases

**Audit target:** `/mnt/storage/code/omnistack/app/(dashboard)/projects/**`
**Stack context (verified):** Next.js 16.3, `output: "export"` + `trailingSlash: true`, React 19.2.8, TypeScript 5, Tailwind v4, shadcn/ui on **Base UI** (`@base-ui/react` ^1.7.0 — `render` prop, no `asChild`).
**Data reality:** zero network calls. Every byte comes from `lib/mock-data.ts` (`MOCK_PROJECTS`, `MOCK_DATABASES`, `MOCK_BACKUPS`, `MOCK_DEPLOYMENTS`, `MOCK_COST_BREAKDOWN`, `MOCK_USERS`) or from `useState`. No Route Handlers, no Server Actions, no DB. **No mutation anywhere in this scope survives a page refresh.**

> Note on tooling: `node_modules/` is **not installed** in this checkout, so `tsc`/`eslint` could not be run. Every finding below was confirmed by reading source, not by executing the compiler. Claims are limited to what is provable from the file text.

---

## Route Map

| URL | File | Purpose | Auth gate |
|---|---|---|---|
| `/projects/` | `app/(dashboard)/projects/page.tsx` | Server wrapper + metadata, renders `<ProjectList />` | `RouteGuard` (login only) via `app/(dashboard)/layout.tsx:12` |
| `/projects/[id]/` | `app/(dashboard)/projects/[id]/page.tsx` | Server wrapper, `generateStaticParams()` over `MOCK_PROJECTS`, renders `<ProjectDetailClient projectId>` | `RouteGuard` (login only) |
| `/projects/[id]/databases/` | `.../[id]/databases/page.tsx` | Server wrapper, `generateStaticParams()` over `MOCK_PROJECTS`, renders `<DatabasesClient projectId>` | `RouteGuard` (login only) |
| `/projects/[id]/databases/[dbId]/` | `.../[dbId]/page.tsx` | Server Component: DB detail shell (status badge, 3 nav cards, info grid) | `RouteGuard` (login only) — **no role check at all** |
| `/projects/[id]/databases/[dbId]/metrics/` | `.../[dbId]/metrics/page.tsx` | Server wrapper → `<DatabaseMetrics database>` | `RouteGuard` (login only) |
| `/projects/[id]/databases/[dbId]/backups/` | `.../[dbId]/backups/page.tsx` | Server wrapper → `<BackupsClient database>` | `RouteGuard` (login only) — role only used for `disabled` |
| `/projects/[id]/databases/[dbId]/console/` | `.../[dbId]/console/page.tsx` | Server wrapper → `<QueryConsole database>` | `RouteGuard` (login only) — **no role check, no `role` prop passed at all** |
| `/projects/[id]/ide/` | *(out of scope, `app/(ide)/projects/[id]/ide/`)* | Linked from detail header; route exists | — |
| — | `.../databases/loading.tsx` | Skeleton for the databases route | n/a — **dead under `output: "export"`** |

**No `not-found.tsx` or `error.tsx` exists anywhere under `app/`** (verified by `find`). Every "not found" state is a hand-rolled card or `return null`.

---

## Inventory

| File | LOC | Client/Server | Purpose | Data source |
|---|---|---|---|---|
| `projects/page.tsx` | 11 | Server | Metadata + wrapper for project list | none |
| `projects/project-list.tsx` | 662 | Client | Master list: fetch-simulation, filters, search, sort, grid/table, pagination, create/edit/archive/clone/transfer/delete | `getMockProjectsByUser`, `MOCK_USERS`, `MOCK_COST_BREAKDOWN` (via children) |
| `projects/project-form-sheet.tsx` | 102 | Client | Create/Edit project side sheet | none (controlled by parent) |
| `projects/_components/filter-bar.tsx` | 111 | Client | Search box, owner filter (admin), sort select, grid/list toggle | `MOCK_USERS` |
| `projects/_components/project-actions-menu.tsx` | 136 | Client | Per-project overflow menu (deploy/edit/archive/clone/transfer/delete + delete-confirm state) | none (handlers via props) |
| `projects/_components/project-card.tsx` | 266 | Client | Project grid card: stack badges, status, progress bar, cost, primary action | `getProjectStackList`, `MOCK_COST_BREAKDOWN`, `ProjectStatusBadge` |
| `projects/_components/projects-stats.tsx` | 127 | Server-compatible (no `"use client"`) | 4 KPI stat cards; also exports unused `ViewerProjectsStats` | none (props) |
| `projects/_components/projects-table.tsx` | 132 | Client | Dense table view of projects | `getProjectStackList`, `MOCK_COST_BREAKDOWN`, `MOCK_USERS` |
| `projects/[id]/page.tsx` | 17 | Server | `generateStaticParams` + wrapper | `MOCK_PROJECTS` |
| `projects/[id]/project-detail-client.tsx` | 717 | Client | Detail: 4 KPI cards, 4 tabs (Overview/Deployments/Logs/FinOps), settings card, danger zone | `MOCK_PROJECTS`, `MOCK_DEPLOYMENTS`, `MOCK_USERS`, `getMockDeploymentsForRole` |
| `.../databases/page.tsx` | 15 | Server | `generateStaticParams` + wrapper | `MOCK_PROJECTS` |
| `.../databases/databases-client.tsx` | 275 | Client | DB list: stats, filters, grid, 4 dialogs, local create/delete | `getMockDatabasesForRole`, `MOCK_PROJECTS`, `DB_PLANS`, `ENGINE_META` |
| `.../databases/loading.tsx` | 56 | Server | Route skeleton | none |
| `.../databases/_components/database-card.tsx` | 281 | Client | DB card: engine icon, status, 4 resource bars, plan, 4 action buttons + menu | `ENGINE_META`, `DB_PLANS` |
| `.../databases/_components/database-filters.tsx` | 98 | Client | Search + engine + status filters | none |
| `.../databases/_components/database-stats.tsx` | 121 | Client (no hooks) | 4 KPI cards (PG count, Redis count, storage, QPS) | props only |
| `.../databases/_components/connection-dialog.tsx` | 249 | Client | Connection info: URI / env / CLI tabs, reveal + copy per field | props (`MockDatabase.connection`) |
| `.../databases/_components/create-database-dialog.tsx` | 246 | Client | 2-step create DB wizard (engine → name/version/region/plan) | `ENGINE_META`, `DB_PLANS` |
| `.../databases/_components/delete-database-dialog.tsx` | 103 | Client | Type-the-name-to-confirm delete | none |
| `.../databases/_components/rotate-password-dialog.tsx` | 61 | Client | Rotate-password confirm | none |
| `.../databases/_components/empty-state.tsx` | 58 | Client (no hooks) | Empty/filtered-empty state | none |
| `.../databases/[dbId]/page.tsx` | 161 | Server | DB detail shell | `MOCK_DATABASES`, `MOCK_PROJECTS` |
| `.../databases/[dbId]/_components/database-metrics.tsx` | 271 | Client | 4 metric cards + sparklines + slow-query table | props + 4 hardcoded series constants |
| `.../databases/[dbId]/_components/backup-manager.tsx` | 334 | Client | Backup policy form, backup table, PITR, restore dialog | `MOCK_BACKUPS` |
| `.../databases/[dbId]/_components/query-console.tsx` | 299 | Client | SQL editor, mock result table, query history, CSV export | `runMockQuery()` — regex-matched hardcoded results |
| `.../databases/[dbId]/backups/page.tsx` | 17 | Server | `generateStaticParams` + wrapper | `MOCK_DATABASES` |
| `.../databases/[dbId]/backups/backups-client.tsx` | 10 | Client | 10-line pass-through: injects `role` into `BackupManager` | `useAuth` |
| `.../databases/[dbId]/console/page.tsx` | 17 | Server | `generateStaticParams` + wrapper | `MOCK_DATABASES` |
| `.../databases/[dbId]/metrics/page.tsx` | 17 | Server | `generateStaticParams` + wrapper | `MOCK_DATABASES` |

Support files read for correctness: `lib/mock-data.ts` (types, `MOCK_PROJECTS`, `MOCK_DATABASES`, `MOCK_BACKUPS`, `MOCK_COST_BREAKDOWN`, `SHARED_PROJECT_IDS`, `roleAtLeast`, `getMockProjectsByUser`, `getMockDatabasesForRole`, `getMockDeploymentsForRole`), `lib/auth-context.tsx`, `components/route-guard.tsx`, `components/project-status-badge.tsx`, `components/app-sidebar.tsx`, `app/(dashboard)/layout.tsx`, `next.config.ts`, `package.json`, `components/ui/{button,input,select,dialog,sheet,dropdown-menu}.tsx`.

---

## Findings

### [CRITICAL] Locally created projects link to a URL that does not exist (hard 404)
- **Location:** `app/(dashboard)/projects/project-list.tsx:240` (id creation), `app/(dashboard)/projects/[id]/page.tsx:4-8` (`generateStaticParams`)
- **Problem:** Creating a project assigns `id: \`project-local-${Date.now()}\`` (`project-list.tsx:240`). The card and table render `<Link href={\`/projects/${project.id}\`}>` (`project-card.tsx:120`, `project-card.tsx:241`, `projects-table.tsx:69`). But `next.config.ts` sets `output: "export"` and `[id]/page.tsx` only pre-renders the 6 ids from `MOCK_PROJECTS`. There is no `dynamicParams`, no catch-all, no `not-found.tsx`. The exact same defect exists for databases: `databases-client.tsx:114` mints `db-${name}-${ts}`, and `[dbId]/page.tsx:39-41` / `metrics/page.tsx:4-6` / `backups/page.tsx:4-6` / `console/page.tsx:4-6` only pre-render `MOCK_DATABASES` pairs.
- **Impact:** The user creates a project, sees the green success toast `Proyek X dibuat dengan status Live.` (`project-list.tsx:250`), clicks the card title, and lands on a server 404. Same for every newly created database (its `Metrik` / `Backup` / detail links 404).
- **Fix:** Either (a) never mint local ids — render created projects with `href="#"`/disabled nav plus an explicit "not yet persisted" badge, or (b) add a `[id]/[[...slug]]`/catch-all route, or (c) add `export const dynamicParams` + a real `not-found.tsx` and switch off static export for these segments. At minimum, do not show a success toast for a create whose detail page cannot be reached.

### [CRITICAL] Delete Project / Hapus Permanen deletes nothing but claims "dihapus permanen"
- **Location:** `app/(dashboard)/projects/project-list.tsx:324-328`; also `app/(dashboard)/projects/[id]/project-detail-client.tsx:198-201`
- **Problem:** `onDelete` only filters the local `useState` array and shows `Proyek ${name} dihapus permanen.` The detail page's `handleDelete` (`project-detail-client.tsx:198-201`) does not even remove local state — it only shows `Proyek ${name} dihapus permanen (mock).` and resets the confirm flag; the project card is still on screen after "deleting" it.
- **Impact:** False destructive confirmation. A user who believes they removed a project (and stops paying attention to it) still has it — and the next refresh it is fully back, including any "archived" state.
- **Fix:** Gate the destructive copy on actual capability ("Hapus (permanen,requires backend)"), or wire to real persistence. Never print "dihapus permanen" for an in-memory `filter()`.

### [CRITICAL] Simpan Perubahan on project settings is a pure no-op that reports success
- **Location:** `app/(dashboard)/projects/[id]/project-detail-client.tsx:194-196`, called from `:672`
- **Problem:** `handleSaveSettings = () => showNotice("Pengaturan proyek diperbarui (mock).")`. The edited values live in `name`/`description`/`status` state (`:154-158`) which are bound *only* to the inputs. The page header (`:241`), the description (`:244`) and both `ProjectStatusBadge` instances (`:248`, `:272`) all read `project.*` from `MOCK_PROJECTS`, never the local state. So a user renames a project, clicks Save, gets a success toast, and the card title, detail header and status badge are unchanged. Refreshing reverts everything.
- **Impact:** The single most prominent "settings" surface on the page is a lie. This is the highest-traffic dead-end in the scope.
- **Fix:** Derive the displayed values from the local state (`{...project, ...local}`), or disable the card with an explicit "coming soon" affordance. Never emit a success notice for an empty handler body.

### [CRITICAL] Status selector on the detail page has zero observable effect
- **Location:** `app/(dashboard)/projects/[id]/project-detail-client.tsx:650-670` (buttons), `:156-158` (state), `:248` & `:272` (badges)
- **Problem:** Clicking Live/Stopped/Building/Failed calls `setStatus(opt.value)` and the button visually "selects". But `status` is never read anywhere — neither `ProjectStatusBadge` at line 248/272 nor the description logic at line 284-288 uses it. Both badges bind `project.status`.
- **Impact:** User believes they stopped a failed project; the badge still says **Failed**, and the description still says "Proyek tidak aktif".
- **Fix:** Bind the badges and the description to the local `status` state (and persist it), or remove the control.

### [CRITICAL] Database delete silently does nothing for every pre-existing (mock) database
- **Location:** `app/(dashboard)/projects/[id]/databases/databases-client.tsx:148-154`
- **Problem:** `handleDeleteConfirm` filters `extraDatabases` (the local-only list from `handleCreate`). The six databases in `MOCK_DATABASES` are merged in via `useMemo` at `databases-client.tsx:53-61` and are never removed. The confirmation dialog (`delete-database-dialog.tsx`) makes the user type the exact database name to prove intent, then the toast says `Database "X" dihapus permanen (mock).` and **the card is still on screen**.
- **Impact:** Confirmed-false success on the most destructive action in the DBaaS surface, with a deliberate friction gate (type-to-confirm) that makes the failure feel authoritative.
- **Fix:** Track deletions in a `Set<string>` of hidden mock ids and filter them out of the `databases` memo, or surface the action as unavailable.

### [CRITICAL] Rotate Password rotates nothing
- **Location:** `app/(dashboard)/projects/[id]/databases/databases-client.tsx:156-161`; dialog at `_components/rotate-password-dialog.tsx:49-56`
- **Problem:** `handleRotateConfirm` does nothing but `showNotice(... dirotasi (mock))` and close. The `MockDatabase` passed to `ConnectionDialog` is the unchanged `MOCK_DATABASES` object, so the credential the user then copies (`connection-dialog.tsx:63`, `:118`) is byte-identical to before.
- **Impact:** A user rotating a leaked credential believes they remediated it. The "Jaga kerahasiaan kredensial. Segera rotasi password jika terkompromi." warning at `connection-dialog.tsx:219` makes this the most likely action a user takes — and it is a no-op.
- **Fix:** Maintain a `rotatedPasswords: Record<dbId, string>` map in `databases-client` and pass a derived database object to `ConnectionDialog`/`DatabaseCard`.

### [CRITICAL] Query Console fabricates results and hides errors
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/query-console.tsx:51-93`
- **Problem:** `runMockQuery` pattern-matches the SQL with two regexes (`:55` `select.*from users`, `:68` `show tables`). **Anything else** — including `DROP TABLE users;`, `DELETE FROM users;`, or a typo — falls through to `:81-90` and resolves with `kolom_1 / kolom_2` rows and a fabricated `executionTime` of `8 + (sql.length % 40)` ms (`:52`). The header then prints `Hasil (3 baris, 34 ms)` (`:231`).
- **Impact:** A destructive statement appears to have "succeeded" and returned data. The console is also reachable at `/console/` (see next finding) with no role gate.
- **Fix:** Return an explicit `{ error: "Query tidak didukung pada environment demo" }` for unmatched input; never resolve unmatched SQL with synthetic rows.

### [CRITICAL] `/console/` has no RBAC gate at all — VIEWER can open the query console by URL
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/console/page.tsx:8-17` and `query-console.tsx:95` (`QueryConsole` takes **no** `role` prop)
- **Problem:** `console/page.tsx` resolves the database from `MOCK_DATABASES` with no role check and renders `<QueryConsole database={database} />`. The database object (including `connection.username` and `connection.password` from `mock-data.ts:825, 856, 887, 918, 949, 980`) is serialized into the client payload. Contrast with `backups/page.tsx:16` → `backups-client.tsx:9`, which *does* pass `role`, and with `database-card.tsx:149,166,174` which gates "Buka Query Console" behind `canManage`.
- **Impact:** A VIEWER who is blocked from the menu item can still navigate straight to the console URL. Client-side-only gating (the sidebar at `app-sidebar.tsx:86-107` merely *hides* nav items for VIEWER) is not access control. This is the clearest RBAC hole in the scope.
- **Fix:** Pass `role` into `QueryConsole` and render the editor read-only for VIEWER, matching the `BackupManager` pattern; ideally gate in the Server Component too.

### [CRITICAL] "Buat Database" is offered on projects the user does not own
- **Location:** `app/(dashboard)/projects/[id]/databases/databases-client.tsx:51` (`canWrite = roleAtLeast(role, "USER")`) and `:185-190` (button render)
- **Problem:** `canWrite` is a pure role check. It never compares `project.userId` to `user.id`. The only existence test is `MOCK_PROJECTS.find(...)` (`:50`). A `user-dev-002` (USER) who navigates to `/projects/proj-001/databases/` — a project owned by `user-admin-001` — sees an empty list (their role filter returns nothing) **plus a fully enabled "Buat Database" button**, and `handleCreate` (`:106-146`) will happily mint a database with `ownerId: user.id` inside someone else's project.
- **Impact:** Cross-tenant write. Same class of bug as the detail-page `canWrite` below, but worse because here the UI actively invites it.
- **Fix:** `const canWrite = roleAtLeast(role,"USER") && (role==="ADMIN" || project.userId === user.id)`. Extract a shared `canManageProject(user, project)` helper (see DRY finding) and use it on both the list and the detail page.

### [CRITICAL] Project detail page has no ownership check — a USER can edit and delete another user's project
- **Location:** `app/(dashboard)/projects/[id]/project-detail-client.tsx:152` (`canWrite`), `:672` (Save), `:690-711` (Danger Zone)
- **Problem:** `const canWrite = !!user && roleAtLeast(user.role, "USER")` — role only. The list screen uses the correct predicate `canManageProject = isAdmin || project.userId === user?.id` (`project-list.tsx:195-196`). The detail page does not, and it reads the project straight out of `MOCK_PROJECTS` (`:140`) with no scoping. A USER can open `/projects/proj-001/` and get an enabled Danger Zone for the admin's project. Only `getMockDeploymentsForRole` (`:143`) is role-scoped, so the deployments tab is correctly empty for them — which makes the rest of the page look even more authoritative.
- **Impact:** Privilege escalation inside the app: any USER can mutate/delete any project. The list page and the detail page disagree about who owns what.
- **Fix:** Share one `canManageProject(user, project)` predicate between `project-list.tsx` and `project-detail-client.tsx`; additionally hide (not just `disable`) the Danger Zone.

### [CRITICAL] Viewer role is promised shared projects in the sidebar and page copy, and is always given zero
- **Location:** `lib/mock-data.ts:657-661` (`getMockProjectsByUser` returns `[]` for VIEWER), `app/(dashboard)/projects/project-list.tsx:46` & `:52` (copy), `components/app-sidebar.tsx:78-82` ("Shared Projects" nav)
- **Problem:** `SHARED_PROJECT_IDS = ["proj-001","proj-003"]` exists (`mock-data.ts:255`) and *is* honoured by `getMockDeploymentsForRole` and `getMockDatabasesForRole`, but `getMockProjectsByUser` has no VIEWER branch — it falls through to `return []`. The page therefore renders the heading **"Proyek yang Di-share"** and the subtitle **"Proyek yang di-share ke Anda untuk dipantau (read-only)."** over a permanently empty list, while the sidebar offers a "Shared Projects" link.
- **Impact:** The entire VIEWER persona is non-functional on the flagship Projects page. The empty-state copy at `project-list.tsx:478-480` ("Minta admin atau developer meng-share proyek ke akun Anda") is a workaround for a bug, not a state.
- **Fix:** Add the VIEWER branch: `return MOCK_PROJECTS.filter(p => SHARED_PROJECT_IDS.includes(p.id))`. This is a one-line fix that also makes `project-card.tsx:58,182,205` (`viewerMode`, `ownerEmail`) and `_components/projects-stats.tsx:95-127` (`ViewerProjectsStats`) reachable instead of dead.

### [MAJOR] "Upgrade" button on every database card has no `onClick` — a primary-looking action that does nothing
- **Location:** `app/(dashboard)/projects/[id]/databases/_components/database-card.tsx:236-238`
- **Problem:** `<Button variant="outline" size="sm">Upgrade</Button>` — no handler, no `disabled`, no link. It is styled identically to real actions and sits next to the plan price.
- **Impact:** Dead-end. Every database card (and there is one per DB, repeated across the grid) advertises an upgrade flow that was never built. Not role-gated either, so a VIEWER sees it too.
- **Fix:** Add `disabled` + a tooltip/"segera" label, or wire it to a real route.

### [MAJOR] "Simpan" in the Query Console has no `onClick`
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/query-console.tsx:211-214`
- **Problem:** `<Button variant="outline"><Save …/>Simpan</Button>` — no handler. Its three siblings ("Jalankan", "Ekspor CSV", "Bagikan") all work, so the omission reads as a bug rather than a placeholder.
- **Impact:** Dead-end adjacent to working controls; users click it expecting their query to be saved and it silently does nothing. No query is ever persisted (not even to `localStorage`).
- **Fix:** Implement or `disabled` it.

### [MAJOR] "Buat Database Restore" in the restore dialog only closes the dialog
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/backup-manager.tsx:326-328`
- **Problem:** The confirm button is `<Button onClick={() => setRestoreOpen(false)}>Buat Database Restore</Button>`. No state is created, no toast, no navigation. The dialog copy at `:317-320` asserts "Database BARU akan dibuat dengan data pada waktu backup."
- **Impact:** Dead-end on a data-destructive path. Same for the "Restore" row buttons (`:226-237`) and "Restore ke Titik Waktu" (`:292-300`) — all funnel into this no-op.
- **Fix:** Either create a restore-database entry in local state (as `handleCreateBackup` does) or change the button to "Tutup" and mark the feature as unavailable.

### [MAJOR] The PITR enable checkbox is disabled exactly when PITR is off — it can never be turned on
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/backup-manager.tsx:165-170`
- **Problem:** `disabled={!canModify || !database.pitrEnabled}` on the control labelled "Aktifkan point-in-time recovery (PITR)". For any database with `pitrEnabled: false` (`db-cache-redis`, `db-vector-mongo`, `db-sessions-redis` — `mock-data.ts:869, 931, 962`) the toggle is permanently disabled. The `pitr` state set at `:168` is also never read: the PITR card at `:246` is gated on `database.pitrEnabled`, not on `pitr`.
- **Impact:** Inverted guard — the checkbox is a no-op in one state and dead state in the other. Users cannot enable a paid feature they are being shown.
- **Fix:** `disabled={!canModify}` and gate the PITR card on the local `pitr` state.

### [MAJOR] Entire "Kebijakan Backup" form is uncontrolled and unsaved — and has no Save button
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/backup-manager.tsx:133` (`Select defaultValue="harian"`), `:145` (`Select defaultValue="30"`), `:158-162` (`Input defaultValue="02:00 UTC"`), `:179-183` (`Checkbox defaultChecked`)
- **Problem:** All four controls are uncontrolled with **no `onValueChange`/`onChange`/`onCheckedChange`** and **no save/submit handler anywhere in the card**. Changing "Frekuensi" to Mingguan updates the DOM, re-renders nothing, and is discarded on navigation.
- **Impact:** The user configures a backup policy and it is silently discarded. Only `pitr` (`:81`) has state, and as noted it is unused.
- **Fix:** Lift all four into `useState` and add an explicit "Simpan kebijakan" button (even a mock one), or make the whole card read-only with a "belum tersedia" note.

### [MAJOR] "Segarkan" (Refresh) on DB metrics inflates the numbers and cycles fixed charts
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/database-metrics.tsx:119`, `:110`, `:106-108`
- **Problem:** `handleRefresh = () => setSeedOffset(prev => prev + 1)`. `qpsAvg` becomes `database.metrics.queriesPerSecond + seedOffset * 3` (`:110`) — **every click permanently raises the reported average by 3 qps** with no upper bound and no relation to the data. The two sparklines just index into one of 4 hardcoded arrays: `QPS_SERIES[(seedOffset + rangeIndex) % 4]` (`:106-108`).
- **Impact:** A monitoring screen that lies in a specific direction, and lies more the longer you watch it. This is the opposite of what a "Refresh" affordance promises.
- **Fix:** Make Refresh re-read the (mock) data with a small jitter bounded around the true value, or remove the button.

### [MAJOR] Time-range selector on DB metrics changes nothing but the chart array
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/database-metrics.tsx:51-56`, `:105-108`
- **Problem:** "1 Jam / 6 Jam / 24 Jam / 7 Hari" only shifts `rangeIndex`, which selects a different hardcoded `SERIES_*` constant. The 4 series are the same shape regardless; the label promises a time window the data does not reflect. The "rata-rata: N ms" text at `:202` always shows `database.metrics.avgResponseTimeMs`, unchanged by the range.
- **Impact:** Plausible-looking but meaningless analytics. Same for `SLOW_QUERIES` (`:60-77`), a hardcoded constant unrelated to `database` — every database shows identical slow queries.
- **Fix:** Generate series from `database` deterministically, or clearly label the panel "data demo".

### [MAJOR] Hardcoded fake trend deltas in the databases stat cards
- **Location:** `app/(dashboard)/projects/[id]/databases/_components/database-stats.tsx:58-59` (`+1 minggu ini`), `:117` (`↑ 18%`), `:36` (`* 11`)
- **Problem:** `PostgreSQL Instances` always shows "+1 minggu ini" and `Queries/jam` always shows "↑ 18%", regardless of any data. The QPS figure is `Σ queriesPerSecond * 11` — a magic multiplier standing in for "per hour" (QPS→hourly is ×3600), so the label "Queries/jam" and the number are both wrong.
- **Impact:** Persuasive fake telemetry. A user monitoring cost/usage will make decisions on invented numbers.
- **Fix:** Derive deltas from a real (mock) time series; correct the unit conversion or relabel to "QPS".

### [MAJOR] Rollback and Retry on the Deployments tab only print a toast
- **Location:** `app/(dashboard)/projects/[id]/project-detail-client.tsx:203-209`, buttons at `:449-468`
- **Problem:** `handleRollback` / `handleRetry` do `showNotice("Rollback ke deployment #XXX dimulai (mock).")`. The deployment's `status` never changes and nothing is appended to the list.
- **Impact:** Dead-ends on the two most consequential deploy operations. The `(mock)` suffix is the only warning.
- **Fix:** Flip the deployment status / insert a queued deployment in local state, or disable the buttons.

### [MAJOR] "Visit" links point at hostnames that do not exist
- **Location:** `app/(dashboard)/projects/[id]/project-detail-client.tsx:211-213`, `:372-383`, `:390-401`
- **Problem:** `productionUrl = project.url ?? \`https://${slugify(name)}.omni.dev\`` and `previewUrl = \`https://preview--${slugify(name)}.omni.dev\``. The `previewUrl` branch is unconditional — there is no such domain for any project, and the `preview--` double-hyphen is a bug in the template. The fallback `*.omni.dev` hostnames are also fabricated.
- **Impact:** Two prominent "Visit" buttons per project that open a dead external URL in a new tab. The `target="_blank"` + `rel="noreferrer"` makes it a clean exit from the app.
- **Fix:** Hide the Preview row when no real preview URL exists; mark the URLs as demo-only.

### [MAJOR] Three "Bagikan"/copy flows produce URLs that route nowhere
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/_components/query-console.tsx:158-164`
- **Problem:** `handleShare` copies `https://omnistack.dev/console/${database.id}/query/shared` to the clipboard and flashes "Tersalin!". No such route exists in the app (verified against the full `app/` tree).
- **Impact:** The user pastes a link into a teammate's chat; it 404s. "Tersimpan ke clipboard" is false confirmation.
- **Fix:** Point at a real route or remove the affordance.

### [MAJOR] `[dbId]/page.tsx` never verifies the database belongs to the project in the URL
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/page.tsx:70-73`
- **Problem:** It looks up `MOCK_DATABASES.find(d => d.id === dbId)` and `MOCK_PROJECTS.find(p => p.id === id)` independently and only checks that both exist. It never asserts `database.projectId === id`. `/projects/proj-002/databases/db-prod-pg` would render the admin's production Postgres inside the developer's project, including its host and username (`:151`).
- **Impact:** IDOR-shaped data leak. Currently masked because `output: "export"` only emits the correct `(projectId, dbId)` pairs from `generateStaticParams` (`:39-41`) — so today it is a 404 rather than a leak. The logic hole will surface the moment the export constraint is lifted.
- **Fix:** `if (!database || !project || database.projectId !== id)` → not-found.

### [MAJOR] `if (!database) return null` renders a blank page on three DB sub-routes
- **Location:** `app/(dashboard)/projects/[id]/databases/[dbId]/metrics/page.tsx:15`, `.../backups/page.tsx:15`, `.../console/page.tsx:15`
- **Problem:** All three return `null` when the id is unknown, producing an empty `<main>` with no heading, no message, and no back link. `[dbId]/page.tsx:73-90` does it properly with a card and a "Kembali" link.
- **Impact:** Broken UX / blank screen. Also inconsistent with the rest of the scope.
- **Fix:** Extract a shared `<DbNotFound id={dbId} />` and use it in all four routes (or add `notFound()` + a route-level `not-found.tsx`).

### [MAJOR] `loading.tsx` is dead code under `output: "export"`
- **Location:** `app/(dashboard)/projects/[id]/databases/loading.tsx:1-56`
- **Problem:** With static export the page HTML is fully prerendered at build time; there is no server round-trip, so the Suspense fallback never renders. Meanwhile `databases-client.tsx` has no artificial delay, so the skeleton is never shown by any other means either.
- **Impact:** 56 lines of unreachable UI. Worse, it makes the page *look* like it has real async loading when it does not.
- **Fix:** Delete, or add a real delay to `DatabasesClient` so the skeleton is reachable.

### [MAJOR] Artificial 600 ms delay fakes a network fetch that does not exist
- **Location:** `app/(dashboard)/projects/project-list.tsx:73` (`SKELETON_DELAY_MS = 600`), `:97-104`
- **Problem:** `setTimeout(() => setProjects(getMockProjectsByUser(...)), 600)` — a synchronous in-memory array lookup artificially delayed to display a skeleton. `isDataLoading` is never reset to `true` on subsequent `user` changes (`:97`), so a logout→login as another role shows **no** skeleton and swaps the whole list instantly.
- **Impact:** Dead code masquerading as data loading; also an inconsistent loading experience.
- **Fix:** Remove the delay and the `isDataLoading` state, or model it honestly.

### [MAJOR] Sort "Tanggal Dibuat" is a positional `.reverse()`, not a date sort
- **Location:** `app/(dashboard)/projects/project-list.tsx:172-174`
- **Problem:** `case "created": result = [...result].reverse()`. It only happens to be correct because `MOCK_PROJECTS` is hand-ordered chronologically (`mock-data.ts:158-250`). Locally created projects are **appended** to the end of the array with `createdAtLabel: "Baru saja"` (`project-list.tsx:237-249`), so a brand-new project sorts to the *bottom* of "Tanggal Dibuat".
- **Impact:** Wrong result, correct-looking. The bug is invisible with mock data and appears as soon as a user creates a project.
- **Fix:** Store a real `createdAt: string` on `ManagedProject` and sort on it; stop relying on array order.

### [MAJOR] Primary action button renders for non-manageable cards and is **not** disabled
- **Location:** `app/(dashboard)/projects/_components/project-card.tsx:250-251`
- **Problem:** `{(manageable || project.status !== "inactive") && primaryAction()}`. For any project with a status other than `inactive`, the Deploy/Pause/Start/Retry button renders **regardless of `manageable`**, with **no `disabled`**. For a `VIEWER` on an `inactive` project, the menu is replaced by "View only" but the primary action is also hidden — so the condition is doubly wrong. The intended predicate was almost certainly `!manageable || status !== "inactive"`.
- **Impact:** RBAC hole + wrong logic. Today it is masked only because `getMockProjectsByUser` gives VIEWER zero projects; the moment the VIEWER branch is fixed (see CRITICAL above) a VIEWER gets live mutating buttons on projects they don't own, wired to `handlers.onStart` / `onRetry` which **do** call `setProjects` (`project-list.tsx:284-304`). Fixing one CRITICAL bug un-hides this MAJOR.
- **Fix:** `{(!manageable || project.status !== "inactive") && primaryAction()}` and add `disabled={!manageable}` to the button returned by `primaryAction()`.

### [MAJOR] 1,000 ms of duplicated STATUS_META hex and duplicated ENGINE colors
- **Location:** `[dbId]/page.tsx:16-24` vs `_components/database-card.tsx:42-50` (identical hex sets); `_components/database-stats.tsx:49` & `:67` (re-hardcodes `ENGINE_META.POSTGRES.color` / `REDIS.color` as `#336791` / `#DC382D`); `ENGINE_ICONS` duplicated at `database-card.tsx:86-91` and `create-database-dialog.tsx:49-54`
- **Problem:** `ENGINE_META` already exports `color` (`mock-data.ts:760-788`) and `DB_PLANS`/`ENGINE_META` already export `label`. Three files re-declare the same maps and, in `database-stats.tsx`, bypass `ENGINE_META` entirely with literal hex.
- **Impact:** A palette change requires 5 edits; the stats card will silently drift from the DB card. Also directly violates AGENTS.md ("JANGAN hardcode warna hex").
- **Fix:** Export one `DB_STATUS_META` from `lib/mock-data.ts` (or a `lib/db-ui.ts`) with **semantic token classes** (`text-green-600`, `bg-destructive/10`) instead of hex, and consume `ENGINE_META[x].color` in `database-stats`.

### [MAJOR] AGENTS.md hex-color / semantic-token violations across the scope
- **Location:** 12 files. Hardcoded **hex** in inline `style`: `database-card.tsx:46-49,120-123,193`; `[dbId]/page.tsx:20-23,32`; `database-stats.tsx:49,67`; `create-database-dialog.tsx:130-133`. Hardcoded **Tailwind palette** classes: `project-card.tsx:167` (`bg-blue-500`), `project-form-sheet.tsx:98` (`text-green-500`), `projects-stats.tsx:64,71,78,108,114,120`, `database-card.tsx:53-55` (`bg-green-500/yellow/red-500`), `database-stats.tsx:100` (`bg-red-500`), `database-metrics.tsx:182,219,229`, `rotate-password-dialog.tsx:34`, `connection-dialog.tsx:105,218`, `backup-manager.tsx:215,287`, plus the shared `components/project-status-badge.tsx:13-25`.
- **Problem:** AGENTS.md mandates semantic tokens (`bg-background`, `text-muted-foreground`, `text-destructive`, …) and explicitly forbids hardcoded hex. `bg-green-500` etc. do not adapt to dark mode (`text-green-600` at `connection-dialog.tsx:105` is barely legible on the dark `--popover` background).
- **Impact:** Dark-mode contrast failures and theme drift; violates a documented, mandatory project rule in 12 of 29 files.
- **Fix:** Introduce semantic status tokens (e.g. `--success`, `--warning`) in `globals.css` and consume them. At minimum replace the `/500` fills with `text-emerald-600`/`text-amber-600`/`text-destructive` equivalents that already have dark variants.

### [MINOR] Inline `style` used for static styling (AGENTS.md violation)
- **Location:** `database-card.tsx:120-123,193`; `[dbId]/page.tsx:32`; `database-stats.tsx:49,67`; `create-database-dialog.tsx:130-133`; width bars at `database-card.tsx:78`, `database-stats.tsx:102`, `database-metrics.tsx:94,184,220,230`, `project-detail-client.tsx:168,616`, `project-card.tsx:168`
- **Problem:** AGENTS.md: "JANGAN gunakan inline styles untuk styling statis." The bar widths and the engine-icon tints are dynamic (acceptable), but the `backgroundColor`/`color` pairs at `database-stats.tsx:49,67` and `create-database-dialog.tsx:130-133` are static per engine and belong in a class map.
- **Impact:** Convention violation; also blocks any future theme override.
- **Fix:** Generate a `styleEngineTint(engine)` helper returning a class string, keep inline `style` only for the genuinely computed widths.

### [MINOR] `DropDownMenuItem` destructive variant re-implemented with className
- **Location:** `_components/project-actions-menu.tsx:64` and `:128`; `_components/database-card.tsx:176`
- **Problem:** `components/ui/dropdown-menu.tsx:82-83` already exposes `variant="destructive"` (with full dark-mode handling). All three call sites use `className="text-destructive focus:text-destructive"` instead.
- **Impact:** Inconsistent, and loses `data-[data-variant=destructive]:*:[svg]:text-destructive` so the icon stays default-colored.
- **Fix:** `variant="destructive"`.

### [MINOR] `role !== "VIEWER"` instead of `roleAtLeast()` — inconsistent RBAC primitive
- **Location:** `[dbId]/_components/backup-manager.tsx:79`
- **Problem:** `const canModify = role !== "VIEWER"`. Every other file in the scope uses `roleAtLeast(role, "USER")` (`databases-client.tsx:51`, `database-card.tsx:112`, `project-detail-client.tsx:152`). AGENTS.md says to always use the role helpers.
- **Impact:** Currently equivalent, but breaks silently if a new role is added.
- **Fix:** `roleAtLeast(role, "USER")`.

### [MINOR] `canWrite` computed three different ways in the same feature
- **Location:** `project-list.tsx:195-196` (`isAdmin || project.userId === user?.id` — correct), `project-detail-client.tsx:152` (role only), `databases-client.tsx:51` (role only), `database-card.tsx:112` (role only)
- **Problem:** Three predicates named the same concept, two of them missing the ownership half.
- **Impact:** Root cause of the two CRITICAL RBAC findings above.
- **Fix:** `lib/rbac.ts` → `canManageProject(user, project)`, `canManageDatabase(user, db)`.

### [MINOR] `notice` auto-dismiss timers are never cleared
- **Location:** `project-list.tsx:190-193`, `project-detail-client.tsx:189-192`, `databases-client.tsx:101-104`
- **Problem:** `setTimeout(() => setNotice(null), 3000)` with no `clearTimeout` and no ref. Three rapid actions queue three timers; the first one clears the newest notice early. On unmount the timer fires against a dead component.
- **Impact:** Notices vanish prematurely; potential `setState` after unmount.
- **Fix:** Store the timer in a `useRef` and clear it in a `useEffect` cleanup; or use a `useEffect` on `notice`.

### [MINOR] Toasts are not announced to assistive tech (except one)
- **Location:** `project-list.tsx:374` has `role="status" aria-live="polite"` ✅; `project-detail-client.tsx:261` and `databases-client.tsx:194-205` have **neither** ❌
- **Problem:** The same pattern implemented three times, only one accessible.
- **Impact:** Screen-reader users get no feedback for save/delete/rotate/create.
- **Fix:** Extract a `<Notice tone="success|error">{text}</Notice>` with `role="status"` and use it in all three.

### [MINOR] Connection/rotate dialogs are rendered with no close button
- **Location:** `connection-dialog.tsx:124` (`showCloseButton={false}`), `rotate-password-dialog.tsx:32`, `delete-database-dialog.tsx:53`
- **Problem:** All three suppress the X. `connection-dialog` and `rotate-password-dialog` have no in-content cancel affordance either — `delete-database-dialog:86-90` at least has a "Batal" button. The only exit is Esc or a backdrop click.
- **Impact:** Mouse-only users relying on the backdrop may not realize the dialog is dismissable; low discoverability.
- **Fix:** Keep `showCloseButton={false}` only for the type-to-confirm delete; restore it (or add "Batal") elsewhere.

### [MINOR] "Tersalin!" copy feedback is not a live region and the copy sequence is broken
- **Location:** `connection-dialog.tsx:82-91`, `:93-111`; `query-console.tsx:219-222`
- **Problem:** (a) `let copySeq = 0` at `:82` is a render-scoped local that resets to 0 on every render, so `key` is always `${text}-1`; the comment at `:45-46` claims it distinguishes entries. Clicking the same field twice makes the *first* 2 s timer clear the *second* "Tersalin!". (b) `activeCopy.startsWith(\`${text}-\`)` (`:94`) is a prefix test on a key that embeds the text. (c) The `at: Date.now()` field in state is never read. (d) The `Tersalin!` state change is not in an `aria-live` region; only the icon swaps and the `aria-label` changes.
- **Impact:** Flickering/incorrect copy confirmation, dead state, inaccessible feedback.
- **Fix:** Use a single `copiedKey: string | null` with a monotonic `useRef` counter, and wrap the feedback in `role="status"`.

### [MINOR] Region `<Select>` in the create-DB wizard is inert
- **Location:** `_components/create-database-dialog.tsx:182-193`
- **Problem:** `<Select value="ap-southeast-1">` with **no `onValueChange`** and a single hardcoded `SelectItem`. `handleCreate` then hardcodes `region: "ap-southeast-1"` regardless (`databases-client.tsx:121`).
- **Impact:** A control that looks like a choice but has none. Also the label says "Sama dengan proyek" while `project.region` is not modelled at all.
- **Fix:** Render a static definition row instead of a disabled-looking select, or wire it to real region options.

### [MINOR] Create-database dialog is not a `<form>` — Enter does not submit
- **Location:** `_components/create-database-dialog.tsx:96-245`
- **Problem:** The whole dialog is a `<div>`; the submit is `<Button onClick={...}>` (`:233-241`). Pressing Enter in the name field does nothing. Contrast `delete-database-dialog.tsx:54` and `project-form-sheet.tsx:53`, which both use real `<form onSubmit>`.
- **Impact:** Keyboard users must Tab to the button. Inconsistent with the rest of the codebase.
- **Fix:** Wrap in `<form onSubmit>` with `type="submit"` on the confirm button.

### [MINOR] `<Label>` without `htmlFor` in the create-DB wizard
- **Location:** `_components/create-database-dialog.tsx:165` (`<Label>Versi</Label>`), `:182` (`<Label>Region</Label>`), `:196` (`<Label>Paket</Label>`)
- **Problem:** No `htmlFor`/`id` pairing. The Selects carry `aria-label` (`:167`, `:184`) so they are named, but the visible label is not programmatically associated — clicking "Paket" does nothing, and the "Paket" option buttons are a `role="group"` with no accessible group name.
- **Impact:** Screen-reader users hear an unlabeled group of 4 buttons for the plan picker.
- **Fix:** `htmlFor` + `id`, or wrap the group in a `<fieldset><legend>`.

### [MINOR] Search inputs have no programmatic label
- **Location:** `_components/filter-bar.tsx:47-53` (placeholder `"Cari proyek... ( / )"`, no `<label>`, no `aria-label`); contrast `_components/database-filters.tsx:55-62` which **does** set `aria-label="Cari database"` ✅
- **Problem:** Placeholder-only naming. The decorative `Search` icon has no `aria-hidden`.
- **Impact:** axe "form elements must have labels" violation; placeholder disappears on focus.
- **Fix:** Add `aria-label="Cari proyek"` (and `aria-hidden` on the icon) to match `database-filters.tsx`.

### [MINOR] Icon-only buttons missing accessible names
- **Location:** `_components/filter-bar.tsx:95` and `:106` (grid/list toggles) — **have** `aria-label` ✅; `_components/project-actions-menu.tsx:59,86` — have `sr-only` text ✅; `database-card.tsx:139` — has `aria-label` ✅; `[dbId]/_components/query-console.tsx:291` — has `aria-label` ✅
- **Problem:** Only one gap — the view-toggle `role="group"` at `filter-bar.tsx:85` has no accessible name, and the two buttons communicate state only via `variant="secondary"` (a colour/background change), not `aria-pressed`/`aria-selected`.
- **Impact:** Screen-reader users cannot tell which view is active.
- **Fix:** `role="group" aria-label="Tampilan"` + `aria-pressed={view === "grid"}`.

### [MINOR] Resource bars convey state by colour/width only
- **Location:** `database-card.tsx:72-80` (`ResourceRow`), `database-stats.tsx:96-104`, `database-metrics.tsx:178-186, 217-222, 227-234`, `project-detail-client.tsx:610-618`
- **Problem:** No `role="progressbar"` / `aria-valuenow` (contrast `project-card.tsx:158-170`, which **does** set them correctly ✅). Fill colour is the only severity signal at `database-card.tsx:52-56` (`bg-green-500` → `bg-red-500`).
- **Impact:** Values are present as adjacent text (e.g. `"1.2/5 GB"`), so it is not blocking, but severity thresholds are colour-only and the bars are invisible to AT.
- **Fix:** Add `role="progressbar"` + `aria-valuenow/min/max` and an `aria-label` naming the resource.

### [MINOR] Two `ProjectStatusBadge` instances render the same status on the detail page
- **Location:** `app/(dashboard)/projects/[id]/project-detail-client.tsx:248` and `:272`
- **Problem:** The header shows a status badge and the "Status" KPI card shows the identical badge, 20 lines apart. Duplicated information, and it makes the broken local `status` state (CRITICAL above) twice as visible.
- **Impact:** Visual redundancy; double the surface for the stale-status bug.
- **Fix:** Remove one.

### [MINOR] `MOCK_COST_BREAKDOWN` vs detail-page cost are two different numbers for the same project
- **Location:** `_components/project-card.tsx:194` & `_components/projects-table.tsx:111` (FinOps column, `$423.18/mo` for proj-001) vs `[id]/project-detail-client.tsx:219` (`monthlyCost = 12 + deployments * 2.5` = `$72.00/mo` for the same project)
- **Problem:** Two independent cost models. The detail page's own "Rincian Komponen" card totals `$28.50` (`:106-110`, `:574-583`) which matches **neither** the headline `$72.00` nor the list's `$423.18`.
- **Impact:** Three different costs for one project across three screens. Untrustworthy FinOps.
- **Fix:** Read `MOCK_COST_BREAKDOWN.find(c => c.projectId === project.id)` in the detail page (or delete the ad-hoc formula).

### [MINOR] Budget percentage is clamped in the bar but not in the badge
- **Location:** `[id]/project-detail-client.tsx:221` (`budgetPercent = Math.min(..., 100)`) vs `:607` (`{Math.round((monthlyCost / budgetLimit) * 100)}%` — unclamped)
- **Problem:** An over-budget project shows a 100 %-full bar labelled e.g. "164%". Not wrong, but the two numbers disagree visually.
- **Fix:** Show the real percentage as text and keep the bar clamped, or clamp both.

### [MINOR] `Sparkline` duplicated across two features
- **Location:** `[id]/project-detail-client.tsx:123-136` vs `[dbId]/_components/database-metrics.tsx:83-99`
- **Problem:** Two components with the same name, same job, different sizing. Both use `key={index}`.
- **Impact:** Drift; would be a single shared `components/sparkline.tsx`.
- **Fix:** Extract one.

### [MINOR] `generateStaticParams` + entity lookup duplicated across 4 route files
- **Location:** `[dbId]/page.tsx:39-41`, `[dbId]/metrics/page.tsx:4-6`, `[dbId]/backups/page.tsx:4-6`, `[dbId]/console/page.tsx:4-6` (and `[id]/page.tsx:4-8`, `[id]/databases/page.tsx:4-6`)
- **Problem:** Six copies of the same 2-line `generateStaticParams`. The three sub-pages also repeat `MOCK_DATABASES.find(d => d.id === dbId)`.
- **Fix:** Re-export a shared `generateStaticParams` from a single module.

### [MINOR] `BackupsClient` is a 10-line pass-through
- **Location:** `[dbId]/backups/backups-client.tsx:1-10`
- **Problem:** Exists solely to call `useAuth()` and inject `role`. That is a legitimate reason for a client boundary, but `BackupManager` could own the `useAuth()` call and the whole file would disappear.
- **Fix:** Have `BackupManager` read `useAuth()` internally, or keep and document the reason.

### [MINOR] Dead exports and dead props
- **Location:** `_components/projects-stats.tsx:87-88` (`VIEWER_DEPLOYMENTS_THIS_WEEK = 8`, `VIEWER_TEAM_MEMBERS = 15` — hardcoded fake metrics) and `:95-127` (`ViewerProjectsStats`, **never imported anywhere**); `_components/project-card.tsx:57-58,68-69,182-186,205-237` (`ownerEmail` and `viewerMode` props, **never passed** by `project-list.tsx:499-510`); `lib/mock-data.ts:1031-1033` (`getDatabasesByProject`, **zero usages** — and it is the natural helper `databases-client.tsx:53-61` should be using)
- **Problem:** Roughly 130 lines of unreachable UI plus two unused mock helpers. `viewerMode` also switches the card footer to a Detail/Logs/Metrik layout (`:205-237`) that no code path can render.
- **Impact:** Dead code inflates the surface that looks like a working VIEWER experience.
- **Fix:** Either wire the VIEWER path (see the CRITICAL `getMockProjectsByUser` finding) or delete all three.

### [MINOR] Unnecessary `"use client"` on hook-free components
- **Location:** `_components/database-stats.tsx:1`, `_components/empty-state.tsx:1`, `_components/rotate-password-dialog.tsx:1`, `_components/database-filters.tsx:1`, `[dbId]/backups/backups-client.tsx:1`; conversely `_components/projects-stats.tsx` has **no** `"use client"` and is imported into a client tree
- **Problem:** Eight of the nine `_components` files carry `"use client"` even when they hold no state, effects, or handlers — they are pure presentational children. AGENTS.md says Server Components are the default. `projects-stats.tsx` shows the correct pattern is known but not applied.
- **Impact:** Larger client bundle; inconsistency makes the boundary meaningless.
- **Fix:** Drop `"use client"` from files with no hooks/handlers (a client parent can import a server-compatible module fine).

### [MINOR] `showNotice` is re-created every render and closes over nothing (DRY)
- **Location:** `project-list.tsx:190-193`, `project-detail-client.tsx:189-192`, `databases-client.tsx:101-104`
- **Problem:** Three byte-identical implementations of the same toast helper.
- **Fix:** `useNotice()` hook in `hooks/` returning `{ notice, showNotice }`, plus the accessible `<Notice>` from the a11y finding.

### [MINOR] `Pagination` renders outside the `view === "grid"`/`else` branches — duplicated JSX
- **Location:** `project-list.tsx:514-523` and `:535-544` — the same `<Pagination …/>` block with identical props appears in both branches
- **Problem:** Copy-paste; the two can drift.
- **Fix:** Render `<Pagination/>` once after the grid/table conditional.

### [MINOR] `Pagination` shows "Menampilkan 1–0 dari 0" style states / `safePage` hides a bug
- **Location:** `project-list.tsx:198-201`, `:635`
- **Problem:** `safePage = Math.min(currentPage, totalPages)` clamps the *display* but `currentPage` state is left out of range; `onNext` then does `setCurrentPage(p => p + 1)` from the stale value. Works only because `safePage` is re-derived, but the state and the rendered page can disagree. Also `if (filteredCount === 0) return null` hides the control entirely while `startIdx`/`endIdx` would render `1–0`.
- **Fix:** Clamp in an effect (`useEffect(() => setCurrentPage(p => Math.min(p, totalPages)), [totalPages])`).

### [MINOR] `ProjectsTable` has no sortable column headers
- **Location:** `_components/projects-table.tsx:46-55`
- **Problem:** The "Updated" column exists and `FilterBar` offers a sort, but the headers are plain `<TableHead>` text — clicking "Updated" does nothing. Users expect sortable tables.
- **Impact:** Looks sortable, is not.
- **Fix:** Either wire `onClick` sort to the headers or render them as non-interactive text with no hover affordance.

### [MINOR] `handleClone` copies `status`/`progress`, producing a permanently-"Building" clone
- **Location:** `project-list.tsx:270-282`
- **Problem:** `{...target}` copies `status: "deploying"` and `progress: 45`. Only `archived` is reset. The clone therefore shows a progress bar frozen at 45 % forever, with a "Pause" primary action.
- **Impact:** Dead-end state that looks like a running build.
- **Fix:** Reset `status: "inactive"`, `progress: undefined`, `deployments: 0` on clone.

### [MINOR] `handleClone` uses `Date.now()` for the id but the notice text is not unique-checked
- **Location:** `project-list.tsx:270-282`
- **Problem:** Two clones in the same millisecond collide on id → duplicate React keys. Unlikely but the pattern (`project-local-${Date.now()}`, `db-${name}-${Date.now()}`, `${target.id}-copy-${Date.now()}`) is repeated three times.
- **Fix:** `crypto.randomUUID()`.

### [MINOR] `roleAtLeast` is imported but the `Role` type import in `databases-client` is only for a default
- **Location:** `databases-client.tsx:37` (`const role: Role = user?.role ?? "VIEWER"`)
- **Problem:** Defaulting an **unauthenticated** user to the *most privileged* role name in the type system is a smell; it happens to be safe only because of the `!user` early return at `:74`.
- **Fix:** Model the loading state explicitly rather than borrowing a role.

### [MINOR] `MOCK_DEPLOYMENTS` fallback leaks all deployments pre-auth
- **Location:** `[id]/project-detail-client.tsx:146`
- **Problem:** `MOCK_DEPLOYMENTS.filter(d => d.projectId === projectId)` is used when `user` is null, i.e. **more** data than the role-scoped branch at `:143`. It is unreachable today because `RouteGuard` returns `null` without a user, but the fallback is the wrong direction.
- **Fix:** Default to `[]` when there is no user.

### [MINOR] `openEdit` / `handleSubmit` have no ownership guard (defence in depth)
- **Location:** `project-list.tsx:213-218` (`openEdit`) and `:220-255` (`handleSubmit`)
- **Problem:** Both trust the caller. `ProjectActionsMenu` only renders when `manageable` (`project-card.tsx:252`, `project-actions-menu.tsx:42-48`), so it holds today, but the handlers themselves are unguarded.
- **Fix:** Assert `canManageProject` inside `openEdit` and `handleSubmit`.

### [MINOR] `isLoading` conflates three unrelated states
- **Location:** `project-list.tsx:349` — `const isLoading = isAuthLoading || !user || isDataLoading`
- **Problem:** One flag drives the skeleton grid (`:442`), the stats skeleton (`:382`), and the `FilterBar`/pill visibility. `!user` is really "redirecting", not "loading" — the page flashes skeletons before `RouteGuard` redirects.
- **Fix:** Distinguish `isAuthLoading` from `isFetching`.

### [MINOR] Comment contradicts code
- **Location:** `project-list.tsx:379` — `{/* Stats cards (bukan VIEWER) */}` guarding `isAdmin && !isLoading` (`:380`)
- **Problem:** The comment says "not VIEWER"; the code says "ADMIN only". A USER gets no stats at all. Combined with the dead `ViewerProjectsStats`, the stats story is incoherent across all three roles.
- **Fix:** Correct the comment and decide the intended per-role stats.

### [MINOR] `role="progressbar"` in `project-card` has no `aria-valuetext`
- **Location:** `_components/project-card.tsx:158-170`
- **Problem:** `aria-label={\`Deploy progress: ${project.progress}%\`}` is fine, but the adjacent `{project.progress}%` text (`:172`) is the accessible value; a duplicate announcement is possible. Minor duplication, not a defect.
- **Fix:** Drop the label's numeric duplication.

### [MINOR] `Plan` price renders empty parentheses when the plan is unknown
- **Location:** `database-card.tsx:234` — `Paket: {plan?.label ?? database.plan} ({plan?.priceLabel})`
- **Problem:** If `DB_PLANS` ever lacks the plan, this renders `Paket: FOO ()`.
- **Fix:** `{plan?.priceLabel && \`(${plan.priceLabel})\`}`.

### [MINOR] `handleExportCsv` button is enabled with no result
- **Location:** `query-console.tsx:215` (button), `:141` (`if (!result || result.rows.length === 0) return`)
- **Problem:** "Ekspor CSV" is clickable before any query has run and then silently does nothing.
- **Fix:** `disabled={!result || result.rows.length === 0}`.

### [MINOR] Query history replay is not disabled while a query is running
- **Location:** `query-console.tsx:282-292`
- **Problem:** "Jalankan" is `disabled={running}` (`:203`) but the per-entry replay button is not, so concurrent runs race and `setHistory` can interleave.
- **Fix:** `disabled={running}` on the replay button.

### [MINOR] CSV export omits a UTF-8 BOM
- **Location:** `query-console.tsx:149` — `new Blob([lines.join("\n")], { type: "text/csv" })`
- **Problem:** Excel on Windows will mojibake non-ASCII values. The quoting logic itself (`:142-148`) is correct.
- **Fix:** `new Blob(["\uFEFF" + lines.join("\n")], …)`.

### [MINOR] `key={index}` on data rows
- **Location:** `query-console.tsx:249` (result rows), `[dbId]/_components/database-metrics.tsx:89` (sparkline bars), `[id]/project-detail-client.tsx:129` (sparkline bars)
- **Problem:** Index keys on reorderable/regenerating lists. The `query-console` rows genuinely change as results change. The sparkline bars are static-length so index keys are acceptable there.
- **Fix:** Use a stable id/label where the list can reorder.

### [MINOR] `$1.2k` label and the QPS stat are computed with unrelated magic numbers
- **Location:** `database-stats.tsx:36-41`
- **Problem:** See the CRITICAL/MAJOR fake-metrics finding; noted here as a code-quality issue (magic `11`, magic `1000`).
- **Fix:** Named constants with a comment, and derive from real data.

### [MINOR] `ENGINED`/engine label drift between the card and the DB detail page
- **Location:** `database-card.tsx:129-131` (`{meta.label} {version}`) vs `[dbId]/page.tsx:143` (`{database.engine}` → renders `POSTGRES`) and `:147` (`{database.plan}` → `STARTER`)
- **Problem:** The detail page shows raw enum keys where the card shows human labels. `ENGINE_META.label` and `DB_PLANS.label` exist and are not used.
- **Fix:** Use `ENGINE_META[database.engine].label` and `DB_PLANS.find(p => p.value === database.plan)?.label`.

### [MINOR] `create-database-dialog` uses two render-phase `setState` blocks
- **Location:** `create-database-dialog.tsx:71-81` and `:83-87`
- **Problem:** Resetting state by comparing against a `prevOpen`/`prevEngine` mirror is a legitimate React pattern, but it is duplicated twice and interleaved with ordinary hooks, which is exactly the shape AGENTS.md's "Rules of Hooks" gotcha warns about. ESLint `react-hooks/*` rules flag this shape. `delete-database-dialog.tsx:31-37` uses the same pattern a third time.
- **Impact:** Fragile; a future reordering breaks it silently. The project gotcha explicitly calls this out.
- **Fix:** Move the reset into a `useEffect` keyed on `open`, or key the dialog component on `database?.id` so React remounts it.

### [MINOR] No unique-name validation when creating a database
- **Location:** `create-database-dialog.tsx:89` (`nameValid = name.length > 0 && NAME_PATTERN.test(name)`)
- **Problem:** Only charset/length is validated. `omnistack_prod` already exists for proj-001 and can be created again, producing two cards with the same name and colliding hostnames.
- **Fix:** Pass the existing names in and reject duplicates.

### [MINOR] `"Unlimited"` for 1000 GB contradicts the value used as a hard limit
- **Location:** `create-database-dialog.tsx:219` (`p.storageGb >= 1000 ? "Unlimited"`) vs `databases-client.tsx:135` (`storageLimitGb: planMeta?.storageGb ?? 5` → 1000)
- **Problem:** The plan labelled "Unlimited" creates a database with a 1000 GB cap, and the card will then render a full red bar.
- **Fix:** Make the label match the data.

---

## Statistics

- **Total files:** 29 (all under `app/(dashboard)/projects/**`)
- **Total LOC:** 4,970
- **CRITICAL: 10 | MAJOR: 21 | MINOR: 33**
- **Dead-end interactions found: 22** (enumerated below)
- **RBAC holes: 6**

### Dead-end inventory (verifiable, with line refs)

| # | Control | Location | What actually happens |
|---|---|---|---|
| 1 | "Simpan Perubahan" (project settings) | `project-detail-client.tsx:672` → `:194` | Empty body + success toast |
| 2 | Status buttons Live/Stopped/Building/Failed | `project-detail-client.tsx:657` | `setStatus`, never read |
| 3 | "Hapus Permanen" (detail Danger Zone) | `project-detail-client.tsx:692` → `:198` | Toast only; project still on screen |
| 4 | "Rollback" per deployment | `project-detail-client.tsx:454` → `:203` | Toast only |
| 5 | "Retry" per deployment | `project-detail-client.tsx:464` → `:207` | Toast only |
| 6 | "Visit" → Preview URL | `project-detail-client.tsx:390-401` | `https://preview--*.omni.dev` — no such host |
| 7 | "Visit" → Production fallback URL | `project-detail-client.tsx:212,372` | `https://*.omni.dev` — fabricated |
| 8 | "Upgrade" (every DB card) | `database-card.tsx:236` | `<Button>` with no `onClick` |
| 9 | "Pengaturan" (every DB card) | `database-card.tsx:274` | Permanently `disabled` |
| 10 | "Hapus Database" on a mock DB | `databases-client.tsx:148` | Filters only `extraDatabases`; card stays |
| 11 | "Rotate Password" confirm | `rotate-password-dialog.tsx:50` → `databases-client.tsx:156` | Toast only; credential unchanged |
| 12 | "Buat Database Restore" | `backup-manager.tsx:326` | Closes the dialog |
| 13 | PITR "Aktifkan" checkbox | `backup-manager.tsx:169` | `disabled` whenever PITR is off |
| 14 | Backup policy: Frekuensi / Retensi / Waktu / Auto | `backup-manager.tsx:133,145,158,179` | Uncontrolled, no state, no save button |
| 15 | "Simpan" (query console) | `query-console.tsx:211` | `<Button>` with no `onClick` |
| 16 | "Bagikan" (query console) | `query-console.tsx:158` | Copies a URL that 404s |
| 17 | "Ekspor CSV" with no result | `query-console.tsx:215` | Silently returns |
| 18 | "Segarkan" (DB metrics) | `database-metrics.tsx:119` | `+3 qps` per click, cycles 4 fixed arrays |
| 19 | Time range 1h/6h/24h/7d | `database-metrics.tsx:105-108` | Selects a different hardcoded array |
| 20 | Region select | `create-database-dialog.tsx:183` | No `onValueChange`, one option |
| 21 | New project / new DB detail link | `project-list.tsx:240`; `databases-client.tsx:114` | Target path not in `generateStaticParams` → 404 |
| 22 | Table column headers | `projects-table.tsx:46-55` | Look sortable, have no `onClick` |

### RBAC holes

| # | Location | Hole |
|---|---|---|
| 1 | `[dbId]/console/page.tsx:14-16` | No role check at all; the full `MockDatabase` (incl. `connection.password`) is serialized to any authenticated VIEWER |
| 2 | `project-detail-client.tsx:152` | `canWrite` ignores ownership → any USER can edit/delete any project |
| 3 | `databases-client.tsx:51,185` | `canWrite` ignores ownership → "Buat Database" enabled inside another user's project |
| 4 | `project-card.tsx:250-251` | Primary action renders for non-manageable cards, **not** disabled; `onStart`/`onRetry` call `setProjects` |
| 5 | `mock-data.ts:657-661` | VIEWER gets `[]` projects while the sidebar and page copy promise shared projects; `database-card.tsx:58,205` `viewerMode` is unreachable dead code |
| 6 | `[dbId]/page.tsx:70-73` | No `database.projectId === id` check → cross-project DB exposure (currently masked by static export) |

**Standing caveat:** all of the above gating is **client-side only**. `components/route-guard.tsx:22` says so itself ("ini proteksi UI (gimmick MVP), bukan keamanan sungguhan"), and `app/(dashboard)/layout.tsx:12` mounts it with **no `requiredRole`**, so nothing in this scope is role-gated at the route level at all. Additionally, `lib/mock-data.ts` is imported by client components throughout, so `MOCK_USERS` (with plaintext `password` fields, `mock-data.ts:5,85+`) and every `MockDatabase.connection.password` are shipped to the browser regardless of role. Any RBAC work done purely in these client components is UI cosmetics until a real backend exists.

### What is genuinely done well (for balance)

- Base UI is used correctly everywhere: **zero `asChild`** occurrences in the scope; `render={<Link … />}` is the right pattern (`database-card.tsx:150,155,162`), and destructive styling mostly uses `variant="destructive"` semantics in the UI primitives.
- Rules of Hooks hold in every component: all early returns (`project-detail-client.tsx:163`, `databases-client.tsx:74`, `connection-dialog.tsx:50`, `rotate-password-dialog.tsx:28`, `delete-database-dialog.tsx:39`) occur **after** every `useState`/`useMemo`/`useEffect` in that component. Helper functions used inside effects are declared before the effect (`project-list.tsx:106` before `:114`; `backup-manager.tsx:91` before `:230`).
- No `any`, no `as unknown as`, no unused imports across all 29 files (verified programmatically).
- `key` is present on every mapped array except the three sparkline/result-row cases noted above.
- Type-only delete is genuinely well built: type-the-exact-lowercase-name to confirm, `form onSubmit`, disabled submit until match (`delete-database-dialog.tsx:43-49,94`).
- `project-card.tsx:158-170` sets `role="progressbar"` with `aria-valuenow/min/max` — the correct pattern the rest of the scope should copy.
- Icon-only buttons are consistently named (`project-actions-menu.tsx:60,87` `sr-only`; `database-card.tsx:139,246,258,269`; `query-console.tsx:285`; `filter-bar.tsx:88,99`).
- CSV export (`:142-148`) has correct RFC-4180 quote doubling.
