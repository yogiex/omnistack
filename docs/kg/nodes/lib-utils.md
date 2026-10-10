# Node: lib-utils

| Field | Value |
|-------|-------|
| Class | UtilModule |
| Files | lib/utils.ts |
| Status | stable |

## Purpose

Modul utilitas murni lintas aplikasi: `cn()` (clsx + tailwind-merge) untuk
menggabungkan class Tailwind, dan `formatUSD()` (Intl.NumberFormat) untuk format
nominal USD di tabel/chart/KPI. Dipakai hampir semua komponen dan halaman.

## Relations

### usedBy ←
- [[page-landing]]
- [[page-dashboard]]
- [[page-login-register]]
- [[component-app-sidebar]]
- [[component-top-nav]]
- [[component-project-status-badge]]
- [[component-route-guard]]
- [[page-dashboard-shell]]
- [[page-projects]]
- [[page-deployments]]
- [[page-project-ide]]
- [[page-project-logs]]
- [[component-deployment-dialogs]]
- [[component-project-import-wizard]]
- [[component-cloud-ide]]
- [[component-ai-reviewer-results]]
- [[concept-base-ui-not-radix]]
- [[concept-server-first]]
- [[concept-color-tokens]]

## Gotchas

- `formatUSD` default 2 desimal; pass `0` untuk KPI headline yang ringkas.
- `cn()` = `twMerge(clsx(inputs))` — kelas Tailwind yang konflik akan di-merge,
  jadi selalu pakai `cn()` untuk conditional class (jangan string concat).