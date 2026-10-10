# Node: component-top-nav

| Field | Value |
|-------|-------|
| Class | UIComponent |
| Files | components/top-nav.tsx |
| Status | stable |

## Purpose

Top navigation bar area dashboard: tombol toggle sidebar, search, theme switcher,
dan dropdown profil (nama/email/role + logout). Menampilkan badge "Read-Only"
untuk role VIEWER. Logout lalu redirect ke `/login`.

## Relations

### dependsOn →
- [[lib-auth-context]] — `useAuth()` (user, logout)
- [[lib-utils]] — `cn()` + `buttonVariants()` untuk trigger dropdown

### governedBy ←
- [[concept-base-ui-not-radix]] — DropdownMenu/Avatar shadcn (Base UI)
- [[concept-server-first]] — client component (useRouter/useAuth)

### renderedBy ←
- [[page-dashboard-shell]] — dirender di layout dashboard

## Gotchas

- Client component (`useRouter`, `useAuth`).
- Trigger `DropdownMenu` memakai `buttonVariants()` via `cn()`, BUKAN `asChild`
  (Base UI tidak support `asChild`).
- `DropdownMenuGroup` wajib membungkus `DropdownMenuLabel` di Base UI.
- `user` null → render `null` (menunggu RouteGuard menyelesaikan redirect).