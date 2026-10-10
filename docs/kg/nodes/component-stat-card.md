# Node: component-stat-card

| Field | Value |
|-------|-------|
| Class | Components |
| Files | components/stat-card.tsx |
| Status | stable |

## Purpose

Komponen `StatCard` + `StatGrid` untuk kartu metrik satu angka. Dipakai seragam
di seluruh dashboard (monitoring, billing, infra, user management, dst).
Aturan anatomi: judul kiri, ikon muted kanan, nilai `text-2xl font-bold
tabular-nums`, hint `text-xs`. Tanpa kotak accent di belakang ikon.

## Relations

### dependsOn →
- [[concept-color-tokens]] — warna ikon via Tailwind scale, bukan hex

### usedBy ←
- [[page-admin-users]] — StatsGrid 4 kartu (Total/Admin/Developer/Viewer)

## Gotchas

- Base UI tidak punya `asChild` — varian link membungkus Card dengan `<Link>`,
  bukan sebaliknya.
- Warna accent (`valueClassName`) hanya untuk teks nilai, bukan background.
