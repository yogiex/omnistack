# Node: lib-auth-context

| Field | Value |
|-------|-------|
| Class | ContextModule |
| Files | lib/auth-context.tsx |
| Status | stable |

## Purpose

Mock auth berbasis localStorage. Menyediakan user context global; belum ada backend sungguhan.

## Relations

### dependsOn →
- [[lib-mock-data]] — data user mock & helper RBAC

### usedBy ←
- [[page-dashboard]] — `useAuth()` di client-dashboard
- [[component-route-guard]]
- [[component-app-sidebar]] — `useAuth()` untuk role/identitas
- [[component-top-nav]] — `useAuth()` (user, logout)
- [[page-dashboard-shell]]
- [[page-project-ide]]
- [[page-deployments]]
- [[page-project-logs]] — `useAuth()` di logs-client
- [[page-login-register]]

### governedBy ←
- [[concept-server-first]] — ContextModule client (localStorage)

### providesContext →
- [[page-root-layout]] — AuthProvider membungkus seluruh app
- [[page-dashboard-shell]] — AuthProvider membungkus dashboard shell

## Gotchas

- localStorage hanya ada di browser — komponen pemakainya wajib client component.
