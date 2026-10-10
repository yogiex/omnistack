# Node: page-gitops

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/gitops/page.tsx, app/(dashboard)/gitops/gitops-client.tsx |
| Status | stable |

## Purpose

Halaman GitOps Native (URL `/gitops`): manages **preview environments** per
Pull Request. Menampilkan daftar env aktif (Live / Building / Sleeping) dengan
hapus-konfirmasi, sheet "Buat Preview Env" (mock), serta panel read-only untuk
status Webhook dan Branch Protection. KPI ringkasan preview di bagian atas
nilainya diturunkan dari state `envs`, jadi ikut berubah saat env dibuat/dihapus.

## Sub-Components

Tidak ada `_components/` — seluruh UI ada di `gitops-client.tsx` (317 baris),
kecuali KPI yang dipakai ulang dari [[concept-kpi-grid]].

## Relations

### dependsOn →
- [[page-dashboard-shell]] — fragment: halaman di dalam shell dashboard
- [[lib-utils]] — `cn()` untuk class status badge
- [[concept-kpi-grid]] — `KpiSection` + preset `gitOpsKpis`

### guardedBy ←
- [[component-route-guard]] — `requiredRole="USER"`

### governedBy ←
- [[concept-server-first]] — `page.tsx` server tipis + klien terpisah

## Gotchas

- Data env sepenuhnya lokal (`INITIAL_ENVS` + `useState`), bukan mock layer.
  KPI harus menerima array status itu apa adanya — jangan buat data turunan
  terpisah, cukup teruskan `data={{ envs }}`.
- `handleCreate` menambah env baru berstatus `BUILDING` dan menaikkan
  `nextPr`; tidak ada transisi status otomatis ke LIVE (mock).
- Tombol "Buka URL" sengaja `disabled` — belum ada routing preview nyata.
- Hapus env memakai konfirmasi in-line (bukan dialog) via `confirmDeleteId`.