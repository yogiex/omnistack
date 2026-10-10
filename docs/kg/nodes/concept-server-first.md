# Node: concept-server-first

| Field | Value |
|-------|-------|
| Class | Pattern |
| Files | app/**/*.tsx (lintas file) |
| Status | stable |

## Purpose

Pola arsitektur: gunakan Server Component secara default (App Router) dan tambahkan
`"use client"` HANYA bila butuh hooks, event handler, atau browser API. Halaman
tipis (server) yang merender komponen client terpisah adalah pola yang disarankan.

## Relations

### classifies →
- [[page-landing]] — server component penuh (contoh kanonik)
- [[page-dashboard]] — `page.tsx` server + `client-dashboard.tsx` client
- [[page-projects]] — `page.tsx` server + `project-list.tsx` client
- [[page-project-logs]] — server + `logs-client.tsx` client
- [[page-login-register]] — login/register client, forgot-password server
- [[component-route-guard]] — client (hooks + redirect)
- [[component-app-sidebar]] — client (usePathname/useAuth)
- [[component-top-nav]] — client (useRouter/useAuth)
- [[lib-auth-context]] — ContextModule client (localStorage)

### dependsOn →
- [[lib-utils]] — komponen server/client memakai `cn()`

## Gotchas

- Rules of Hooks: jangan letakkan return kondisional sebelum semua hooks
  (lihat gotcha #7 AGENTS.md).
- `<a>` untuk navigasi internal dilarang — wajib `next/link` (kecuali halaman
  eksternal), agar tidak full page reload.