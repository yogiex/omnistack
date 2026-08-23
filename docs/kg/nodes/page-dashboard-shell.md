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
- [[lib-auth-context]]

### renders →
- [[component-app-sidebar]]
- [[component-top-nav]]
- [[component-route-guard]]

### guardedBy ←
- [[component-route-guard]]

### usedBy ←
- [[page-dashboard]]
- [[page-projects]]

## Gotchas

- Route group `(dashboard)` tidak muncul di URL.
- Wajib `suppressHydrationWarning` di html/body (sudah disetel di root layout).
