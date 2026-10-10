# Node: page-dashboard

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/dashboard/page.tsx, app/(dashboard)/dashboard/client-dashboard.tsx |
| Status | stable |

## Purpose

Overview client dashboard (URL `/dashboard`): KPI, daftar proyek terbaru, aktivitas
deployment, dan panel role-aware. `page.tsx` adalah server component tipis yang
merender `client-dashboard.tsx` (client). Data dan RBAC dari `lib/mock-data.ts`.

## Relations

### renders →
- [[component-project-status-badge]] — badge status di daftar proyek

### dependsOn →
- [[page-dashboard-shell]] — fragment: halaman di dalam shell dashboard
- [[lib-auth-context]] — `useAuth()` di client-dashboard
- [[lib-mock-data]] — KPI & daftar proyek/deployment (helper RBAC)
- [[lib-utils]] — `cn()` di client-dashboard.tsx

### governedBy ←
- [[concept-server-first]] — page.tsx server, wrapper client terpisah
- [[concept-color-tokens]] — memakai token semantik (text-muted-foreground dsb)

### guardedBy ←
- [[component-route-guard]] — dilindungi transitif via dashboard shell

## Gotchas

- `page.tsx` sengaja minipis: logika berat ada di `client-dashboard.tsx` ber-`"use client"`.
- RBAC memakai helper (`getMockProjectsByUser`, `getMockDeploymentsForRole`) —
  jangan filter manual berdasarkan `user.role`.