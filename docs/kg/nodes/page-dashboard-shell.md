# Node: page-dashboard-shell

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/layout.tsx |
| Status | stable |

## Purpose

Layout shell untuk seluruh area terautentikasi: Sidebar + TopNav + route guard.

## Relations

### dependsOn →
- [[page-root-layout]] — fragment: root layout membungkus shell dashboard
- [[lib-auth-context]]
- [[lib-utils]] — `cn()` di komponen shell/page di dalamnya

### renders →
- [[component-app-sidebar]]
- [[component-top-nav]]
- [[component-route-guard]]

### guardedBy ←
- [[component-route-guard]]

### consumesContext ←
- [[lib-auth-context]] — AuthProvider membungkus dashboard shell

### governedBy ←
- [[concept-color-tokens]]

### usedBy ←
- [[page-dashboard]]
- [[page-projects]]
- [[page-deployments]]

## Gotchas

- Route group `(dashboard)` tidak muncul di URL.
- Wajib `suppressHydrationWarning` di html/body (sudah disetel di root layout).
