# Node: concept-kpi-grid

| Field | Value |
|-------|-------|
| Class | Pattern |
| Files | components/kpi/, lib/kpi/types.ts, lib/kpi/presets/ |
| Status | stable |

## Purpose

Pola baku untuk **baris metrik KPI** di dashboard: config-driven, terfilter
per role, dengan tren/tooltip/progress/sparkline opsional. Tujuannya satu
entry point (`KpiSection`) agar halaman tidak pernah merakit kartu KPI
sendiri — cukup kirim `config` + `data`.

## Layer

- `lib/kpi/types.ts` — `KpiItem`, `KpiGridConfig`, `KpiAccent`, `KpiTrend`
- `lib/kpi/presets/*.tsx` — config per halaman (`admin`, `gitops`)
- `components/kpi/kpi-section.tsx` — entry point; filter role + loading
- `components/kpi/kpi-card.tsx` — render satu kartu
- `components/kpi/kpi-grid.tsx`, `kpi-card-skeleton.tsx` — layout & placeholder

## Relations

### classifies →
- [[concept-server-first]] — `kpi-section` dan `kpi-card` adalah client component
- [[concept-color-tokens]] — accent memakai semantic token, bukan hex

### usedBy ←
- [[page-dashboard]] — KPI utama dashboard
- [[page-projects]] — KPI proyek
- [[page-deployments]] — KPI deployment
- [[page-gitops]] — "Ringkasan Preview"

> Preset `admin` dan `finops` juga memakainya, tapi kedua halaman itu belum
> punya node sendiri di graf — lihat `docs/audits/` bila butuh rujukan.

## Gotchas

- **`value` boleh fungsi** `(data) => ReactNode` untuk angka turunan runtime.
  Preset yang stateless (mis. admin) tetap homesafe, tapi preset yang
  bergantung state client (mis. gitops) WAJIB lewat fungsi — jangan tulis
  konstanta, kartu tidak akan ikut berubah saat state berubah.
- **Jangan dobel relasi**: kalau sudah `renders`, jangan tambah `dependsOn`
  juga. Lihat `_ontology.md` §2.
- `accent` maksimal 2 per view (DESIGN.md §Color) supaya baris tidak ramai.
- Item yang fiturnya belum berfungsi pakai `disabled: { reason }` — jangan
  pakai toast sukses palsu.
- Untuk stat card sederhana tanpa tren, pakai `StatCard`/`StatGrid` dari
  `components/stat-card.tsx` (pola dicatat di `docs/DESIGN-CARDS.md`)
  daripada `KpiSection`.
- `disabled` pada `KpiItem` bisa berupa fungsi `(data) => { reason } | undefined`.