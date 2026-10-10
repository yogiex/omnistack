# Node: component-project-status-badge

| Field | Value |
|-------|-------|
| Class | UIComponent |
| Files | components/project-status-badge.tsx |
| Status | stable |

## Purpose

Badge presentasional status proyek. Memetakan `ProjectStatus` ke label + warna:
`active` → Live (hijau), `deploying` → Building (kuning, dot berdenyut),
`failed` → Failed (merah), `inactive` → Stopped (abu). Server component (tanpa
`"use client"`).

## Relations

### dependsOn →
- [[lib-mock-data]] — `type ProjectStatus`
- [[lib-utils]] — `cn()`

### renderedBy ←
- [[page-dashboard]] — badge status di daftar proyek
- [[page-projects]] — kartu & tabel proyek

### governedBy ←
- [[concept-color-tokens]] — warna status memakai class token/utility

## Gotchas

- Label badge berbeda dari nilai status: status `active/inactive/deploying/failed`
  vs label `Live/Stopped/Building/Failed`.
- `deploying` memakai `animate-pulse` pada dot.
- Murni presentasional — jangan tambah data fetching di sini.