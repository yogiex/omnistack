---
name: omnistack-mvp-feature
description: End-to-end workflow untuk mengembangkan fitur MVP di OmniStack (Next.js 16 + Tailwind v4 + shadcn/ui Base UI). Gunakan saat user meminta "tambah fitur", "bikin page baru", "implement MVP", "add feature", "new page", atau menyebut nama fitur spesifik yang belum ada. Mencakup baca KG, cek pola existing, implementasi, quality gate, dan update KG.
---

# Skill: OmniStack MVP Feature Development

Workflow terstandar untuk menambahkan fitur baru tanpa harus diingatkan
aturan project berulang kali. Ikuti 6 langkah ini secara berurutan.

## Langkah 1 — Discovery (WAJIB sebelum tulis kode)

1. Baca `docs/kg/_index.md` — peta semua entitas.
2. Grep node relevan di `docs/kg/nodes/` (nama fitur, halaman, komponen serupa).
3. Patuhi bagian **Gotchas** di setiap node yang dibaca.
4. Identifikasi pola serupa yang sudah ada:
   - Page serupa? Lihat struktur `app/(dashboard)/<page-serupa>/`
   - Komponen serupa? Cek `components/` dan `app/(dashboard)/*/_components/`
   - Data/helper serupa? Cek `lib/mock-data.ts`, `lib/auth-context.tsx`

## Langkah 2 — Rancang (cepat, sebelum kode)

Tentukan dan nyatakan singkat ke user:
- Route: `app/(dashboard)/<fitur>/page.tsx` (URL: `/fitur`)
- Server Component atau Client Component? (default: **Server**)
- Komponen page-specific → `app/(dashboard)/<fitur>/_components/`
- Komponen reusable lintas halaman → `components/`
- Node KG baru atau update node existing?

## Langkah 3 — Implementasi (aturan non-negotiable)

- ✅ Named exports (`export function X()`) — bukan default export untuk komponen
- ✅ Import via `@/` alias
- ✅ `cn()` dari `@/lib/utils` untuk conditional classes
- ✅ Semantic color tokens (`bg-background`, `text-muted-foreground`, dll)
- ✅ Responsive + dark mode friendly (CSS variables otomatis adaptif)
- ✅ TypeScript strict, **no `any`**
- ❌ JANGAN edit file di `components/ui/` (shadcn CLI only)
- ❌ JANGAN gunakan `asChild` (Base UI, bukan Radix)
- ❌ JANGAN hardcode hex colors / inline styles statis
- ❌ JANGAN `<a>` untuk navigasi internal (pakai `next/link`)
- ❌ JANGAN return kondisional sebelum semua hooks

Untuk UI primitives: load skill `omnistack-shadcn`. Untuk desain visual:
load skill `omnistack-uiux-pro-max`.

## Langkah 4 — Data & Auth (mock pattern)

- Auth: pakai `useAuth()` dari `lib/auth-context.tsx`
- RBAC: gunakan helper dari `lib/mock-data.ts`
  (`getMockProjectsByUser`, `roleAtLeast`) — jangan filter manual
- Status proyek: `"active" | "inactive" | "deploying" | "failed"`
  (badge label: Live/Stopped/Building/Failed)
- Data mock baru → tambah di `lib/mock-data.ts`, jangan hardcode di komponen

## Langkah 5 — Quality Gate (wajib sebelum selesai)

Jalankan skill `omnistack-quality-gate`:

```bash
bash .opencode/skills/omnistack-quality-gate/scripts/verify.sh
```

Semua check harus pass. Jika gagal, perbaiki lalu jalankan ulang.

## Langkah 6 — Knowledge Graph Update (jangan skip)

1. Update node KG yang terdampak (Purpose, Relations, Gotchas).
2. Entitas baru → buat node dari template `docs/kg/nodes/_template.md`,
   klasifikasi sesuai `_ontology.md`, daftarkan di `_index.md`.
3. Jaga simetri inverse relasi (renders↔renderedBy, dependsOn↔usedBy).
4. Validasi: `bash .opencode/skills/omnistack-kg/scripts/validate-kg.sh`

## Definition of Done

Fitur dianggap selesai HANYA jika semua ini benar:

- [ ] Kode mengikuti semua aturan Langkah 3
- [ ] `verify.sh` pass (lint + typecheck + build)
- [ ] Visual sudah dicek light & dark mode
- [ ] Node KG dibuat/diupdate, validator RESULT: OK
- [ ] Ringkasan perubahan dilaporkan ke user (file apa saja yang berubah)

## Gotchas Khusus MVP Development

1. **next-themes warning** "Encountered a script tag" di dev = expected, ignore.
2. **react-icons naming**: `SiNextdotjs` (bukan SiNextjs), `SiNodedotjs`,
   `SiVuedotjs`. Jika error, fallback ke Lucide.
3. **Font**: gunakan class `font-sans` dari Tailwind (bug next/font/google
   dengan Turbopack).
4. **Route groups** `(folder)` tidak muncul di URL.
5. **`_components/`** dengan underscore = bukan route.
