# Node: component-route-guard

| Field | Value |
|-------|-------|
| Class | GuardComponent |
| Files | components/route-guard.tsx |
| Status | stable |

## Purpose

Guard client-side untuk static export: mencegah render children bila belum login
(redirect ke `redirectTo`, default `/login`) atau role kurang (redirect ke
`/dashboard`). Menampilkan spinner saat `isLoading`. Dipasang di layout dashboard
dan layout `(ide)` serta dibungkus per-halaman admin (ADMIN-only).

## Relations

### dependsOn →
- [[lib-auth-context]] — `useAuth()` (user, isLoading)
- [[lib-mock-data]] — `roleAtLeast`, `type Role`
- [[lib-utils]] — `cn()`
- [[page-root-layout]] — fragment: root layout memasang AuthProvider yang dibutuhkan guard

### guards →
- [[page-dashboard-shell]] — melindungi shell dashboard
- [[page-dashboard]] — transitive: halaman di dalam shell
- [[page-project-ide]] — melindungi layout `(ide)`
- [[page-projects]] — transitive: halaman di dalam shell

### renderedBy ←
- [[page-dashboard-shell]] — dirender di layout dashboard

### governedBy ←
- [[concept-server-first]] — client component (hooks + redirect)

## Gotchas

- Proteksi ini UI (gimmick MVP), BUKAN keamanan sungguhan — data tetap statis.
- Rules of Hooks: `useEffect` dideklarasikan sebelum early-return render.
- DIAMOND: jaga simetri — menghapus `guards →` di sini wajib menghapus
  `guardedBy ←` terkait di node page.