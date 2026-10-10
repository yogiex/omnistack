# Node: component-app-sidebar

| Field | Value |
|-------|-------|
| Class | UIComponent |
| Files | components/app-sidebar.tsx |
| Status | stable |

## Purpose

Sidebar navigasi utama area dashboard. Menampilkan grup "Workspace",
"Administrasi" (ADMIN saja), dan "Akun" plus identitas role user. Item menu
disaring berdasarkan role: VIEWER kehilangan Preview Environments, AI Architect,
dan AI Code Reviewer; menu admin hanya untuk ADMIN.

## Relations

### dependsOn →
- [[lib-auth-context]] — `useAuth()` untuk role/identitas user
- [[lib-mock-data]] — `type Role`
- [[lib-utils]] — `cn()`

### governedBy ←
- [[concept-base-ui-not-radix]] — primitif shadcn Sidebar/Badge berbasis Base UI
- [[concept-server-first]] — client component (usePathname/useAuth)

### renderedBy ←
- [[page-dashboard-shell]] — dirender di layout dashboard

## Gotchas

- Client component (`usePathname`, `useAuth`).
- Menu admin & fitur role-specific TIDAK boleh di-hardcode; ikuti peta akses route
  dan sembunyikan item VIEWER (mis. /gitops, /ai-architect, /ai-reviewer).
- `user` null saat guard memproses redirect → mengembalikan `null` lebih awal.