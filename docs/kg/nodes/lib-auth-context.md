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
- [[page-login-register]]
- [[component-route-guard]]
- [[page-dashboard-shell]]

### providesContext →
- [[page-dashboard-shell]] — AuthProvider membungkus dashboard shell

## Gotchas

- localStorage hanya ada di browser — komponen pemakainya wajib client component.
