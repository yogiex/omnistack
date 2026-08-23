# Node: page-deployments

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/deployments/page.tsx, app/(dashboard)/deployments/deployments-list.tsx |
| Status | stable |

## Purpose

Halaman deployment lengkap dengan stats cards, active deployments live progress, deployment history table, detail modal, logs viewer, rollback/AI diagnose/new deployment dialogs. Mendukung filter, search, Grid/List view toggle, dan role-based view (ADMIN/USER/VIEWER).

## Sub-Components (`_components/`)

- `deployment-stats.tsx` — 5 stat cards (Total, Success, Active, Failed, Avg Duration)
- `active-deployments.tsx` — Live pipeline progress with expand/cancel, auto-refresh
- `deployments-table.tsx` — Table view with commit, branch, env, author, dropdown actions
- `deployments-filter-bar.tsx` — Search, status, project, environment, date sort, Grid/List toggle
- `deployment-detail-modal.tsx` — Full detail modal with pipeline timeline, commit details, health check
- `rollback-dialog.tsx` — Confirmation with reason textarea + checkbox
- `ai-diagnose-dialog.tsx` — AI error analysis with root cause, fix command, impact
- `new-deployment-dialog.tsx` — Project/branch/environment selection, skip tests, zero-downtime options

## Relations

### renders →
- [[component-deployment-dialogs]]

### dependsOn →
- [[lib-mock-data]]
- [[lib-auth-context]]

### usedBy ←
- [[page-dashboard-shell]]

## Gotchas

- Role VIEWER hanya melihat deployment dari shared projects (read-only).
- Status deployment: `"success" | "building" | "failed" | "queued"`.
- PipelineStep interface: `{ name, status, durationSeconds?, logs? }`.
- MockDeployments extended: environment, commitSha, authorEmail, trigger, startedAt, pipeline array.
- Log panel menggunakan terminal-style dark theme (bg-zinc-950).
