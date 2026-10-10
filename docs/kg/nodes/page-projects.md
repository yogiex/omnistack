# Node: page-projects

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/projects/page.tsx, app/(dashboard)/projects/project-list.tsx, app/(dashboard)/projects/_hooks/use-projects.ts, app/(dashboard)/projects/_hooks/use-project-filters.ts, app/(dashboard)/projects/_hooks/use-project-shortcuts.ts |
| Status | stable |

## Purpose

Halaman manajemen proyek (URL `/projects`) dengan CRUD lengkap, filter/search/sort,
grid & table view, KPI admin, transfer ownership, dan arsitektur role-based
(ADMIN semua, USER milik sendiri, VIEWER read-only). Pembuatan proyek kini
mendukung tiga sumber: Manual, Upload arsip, dan Git URL via wizard impor.

## Sub-Components (`_components/`)

- `project-card.tsx` — kartu proyek + badge sumber
- `projects-table.tsx`, `filter-bar.tsx`, `projects-header.tsx`
- `project-form-sheet.tsx` — wizard impor (lihat [[component-project-import-wizard]])
- `transfer-ownership-sheet.tsx`
- `projects-empty-none.tsx`, `projects-empty-filtered.tsx`, `projects-notice.tsx`, `projects-skeleton.tsx`, `projects-pagination.tsx`

## Relations

### renders →
- [[component-project-import-wizard]]
- [[component-project-status-badge]] — badge di kartu & tabel proyek

### dependsOn →
- [[page-dashboard-shell]] — fragment: halaman di dalam shell dashboard
- [[lib-mock-data]]
- [[lib-source-utils]]
- [[lib-utils]] — `cn()` di project-list & komponen _components

### guardedBy ←
- [[component-route-guard]] — dilindungi transitif via dashboard shell

### governedBy ←
- [[concept-server-first]] — `page.tsx` server tipis + klien terpisah

## Gotchas

- `project-form-sheet.tsx` kini di `_components/` (sebelumnya di `projects/`).
- `useProjects().create()` menurunkan `status`: terimpor (git/upload) mulai
  `deploying`, manual langsung `active`; mengisi `url` + `stack` dari `source`.
- ID proyek baru berprefix `local-*` — route `/projects/[id]` static export
  hanya punya `generateStaticParams` dari mock, jadi proyek sesi ini 404 saat
  dibuka (isu lama, lihat `docs/audits/PROJECT-AUDIT.md` C7).
- RBAC pakai helper (`getMockProjectsByUser`), jangan filter manual.