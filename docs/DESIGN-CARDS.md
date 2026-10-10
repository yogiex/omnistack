# 🎴 OmniStack — Desain Stat Card

> **Status:** stable · **Berlaku untuk:** seluruh dashboard, halaman admin, dan detail proyek
> **Komponen:** `components/stat-card.tsx` ( StatCard, StatGrid ) dan
> `components/kpi/kpi-card.tsx` ( KpiCard )

Dokumen ini adalah sumber kebenaran desain **stat card** OmniStack: kartu metrik
satu angka (uptime, jumlah user, error rate, dsb). Semua kartu metrik di app
wajib mengikuti pola ini agar konsisten.

---

## 1. Prinsip

- **Satu kartu = satu metrik.** Kalau butuh dua angka, buat dua kartu.
- **Hierarki jelas:** judul kecil → nilai besar → keterangan kecil.
- **Ikon dekoratif,** di kanan header, kecil (16px), muted. Tidak pernah
  mengambil ruang nilai.
- **Tanpa kotak warna di belakang ikon.** Accent (biru/emerald/amber/…)
  hanya meresap ke **warna ikon**, bukan ke background kotak. Kotak accent
  memecah bentuk stat card dan membuat baris terlihat ramai.
- **Nilai selalu `tabular-nums`** agar angka sejajar antar kartu.

---

## 2. Markup Kanonis

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <div
    data-slot="card"
    data-size="default"
    class="group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] …"
  >
    <div
      data-slot="card-header"
      class="… flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <div data-slot="card-title" class="font-heading text-sm font-medium">
        Uptime
      </div>
      <svg class="lucide lucide-activity h-4 w-4 text-muted-foreground" aria-hidden="true">
        …
      </svg>
    </div>
    <div data-slot="card-content" class="px-(--card-spacing)">
      <div class="text-2xl font-bold">99.9%</div>
      <p class="text-xs text-muted-foreground">30 hari terakhir</p>
    </div>
  </div>
</div>
```

Render di React memakai komponen, bukan menulis class di tangan:

```tsx
import { StatCard, StatGrid } from "@/components/stat-card"
import { Activity } from "lucide-react"

<StatGrid cols={4}>
  <StatCard
    title="Uptime"
    value="99.9%"
    hint="30 hari terakhir"
    icon={<Activity />}
  />
</StatGrid>
```

---

## 3. Anatomi

| Bagian | Class | Token | Keterangan |
|--------|-------|-------|------------|
| Root | `rounded-xl bg-card py-(--card-spacing) ring-1 ring-foreground/10` | shadcn Card default | `--card-spacing` = `--spacing(4)` |
| Header | `flex flex-row items-center justify-between space-y-0 pb-2` | — | Judul kiri, ikon kanan |
| Judul | `text-sm font-medium` (`CardTitle`) | Tipografi H5 | Maksimal 1 baris |
| Ikon | `[&_svg]:size-4` + warna muted/accent | — | `aria-hidden="true"` |
| Konten | `px-(--card-spacing)` | — | Jarak dari tepi card |
| Nilai | `text-2xl font-bold tabular-nums` | Tipografi 2XL | Angka/angka+satuan |
| Keterangan | `text-xs text-muted-foreground` | — | 1 baris, `hint` |

> Ukuran `sm` (`data-size="sm"`, `--card-spacing: --spacing(3)`) dipakai untuk
> kartu padat di dalam panel/table, bukan untuk baris metrik utama.

---

## 4. Token yang Digunakan

Semua warna lewat **semantic token** — dilarang hex (lihat `concept-color-tokens`).

| Peran | Token |
|-------|-------|
| Latar kartu | `bg-card` |
| Teks utama | `text-card-foreground` |
| Garis | `ring-foreground/10` |
| Judul | `text-sm font-medium` (foreground) |
| Keterangan | `text-muted-foreground` |
| Ikon default | `text-muted-foreground` |
| Ikon accent | `text-{blue,emerald,amber,rose,violet}-600 dark:text-…-400` |
| Nilai error | `text-destructive` |

---

## 5. Varian

### 5.1 Tanpa ikon
```tsx
<StatCard title="Total Database" value={12} hint="dari mock layer" />
```

### 5.2 Nilai destruktif / negatif
```tsx
<StatCard
  title="Butuh Perhatian"
  value={3}
  valueClassName="text-destructive"
  hint="Database non-sehat"
/>
```

### 5.3 Nilai non-angka (teks pendek)
Untuk nilai seperti nama/label, turunkan bobot agar tidak mendominasi:
```tsx
<StatCard
  title="Pemilik"
  value="Admin OmniStack"
  valueClassName="text-base font-medium"
  icon={<User />}
/>
```

### 5.4 Dengan progress bar
```tsx
<StatCard title="User Aktif" value={activeUsers} hint="dari total user">
  <div className="mt-3 h-1.5 …bg-muted">
    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
  </div>
</StatCard>
```

### 5.5 Dengan sparkline (KpiCard)
`KpiCard` menambah tren (`TrendBadge`), tooltip (`?`), progress, dan sparkline
di bawah nilai — semua tetap memakai anatomi header yang sama.

---

## 6. Kapan Pakai `StatCard` vs `KpiCard`?

| | `StatCard` | `KpiCard` |
|-|-----------|-----------|
| Peran | stat card sederhana | KPI kaya fitur |
| Data | props langsung | `KpiSection` + preset |
| Tren/tooltip/sparkline | ✗ (manual) | ✓ bawaan |
| Contoh | monitoring, billing, error-tracking, detail proyek | baris "Ringkasan Sistem" di admin/dashboard |
| Config | props langsung | `KpiSection` + preset di `lib/kpi/presets/*` |

Aturan: **jangan** merakit kartu KPI di halaman. Pakai `KpiSection` dengan
preset bila butuh tren/tooltip; pakai `StatCard` untuk stat card biasa.

---

## 7. Aksesibilitas

- Ikon dekoratif selalu `aria-hidden="true"`.
- Baris progress memakai `role="progressbar"` + `aria-valuenow/min/max` +
  `aria-label` deskriptif.
- Nilai angka memakai `tabular-nums` agar mudah dibandingkan antar kartu.
- Kartu yang jadi tautan dibungkus `<Link>` (Base UI tidak punya `asChild`),
  bukan `<a>`.

---

## 8. Anti-Pattern

```tsx
// ❌ Kotak accent di belakang ikon — memecah bentuk stat card
<div className="flex size-10 rounded-lg bg-blue-500/10 text-blue-600">…</div>

// ❌ Nilai jadi label kecil, label jadi nilai besar (terbalik)
<p className="text-xs">99.9%</p><p className="text-2xl">Uptime</p>

// ❌ Hex langsung
<div className="bg-[#1e293b] text-[#38bdf8]" />

// ❌ Mengasumsikan ikon selalu ada / hardcode warna per usage
```

---

## 9. Checklist Refactor Card

- [ ] Kartu adalah metrik satu angka → pakai `StatCard`/`StatGrid`
- [ ] Header `justify-between`, judul kiri, ikon `size-4` kanan
- [ ] Nilai `text-2xl font-bold tabular-nums`
- [ ] Keterangan `text-xs text-muted-foreground`
- [ ] Tanpa kotak accent di belakang ikon
- [ ] Warna lewat semantic token (tidak ada hex)
- [ ] Dark mode aman (token adaptif)
- [ ] Ikon `aria-hidden`; progress bar punya aria lengkap

---

## 10. Berkas Related

| Berkas | Isi |
|--------|-----|
| `components/stat-card.tsx` | StatCard + StatGrid |
| `components/kpi/kpi-card.tsx` | KpiCard (KPI kaya fitur) |
| `components/ui/card.tsx` | Primitive Card shadcn (jangan diedit manual) |
| `lib/kpi/presets/*` | Konfigurasi KPI per halaman |

> Lihat juga `DESIGN.md` (§ Komponen UI → Cards) untuk bahasa desain umum.