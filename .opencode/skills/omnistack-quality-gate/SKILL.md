---
name: omnistack-quality-gate
description: Quality gate untuk OmniStack — menjalankan lint, typecheck, dan build secara berurutan lalu melaporkan hasil. Gunakan setiap kali selesai mengubah kode, sebelum commit, saat user bilang "verify", "check", "quality gate", "lint", "typecheck", atau "pastikan build jalan". Juga dipanggil otomatis oleh skill omnistack-mvp-feature.
---

# Skill: OmniStack Quality Gate

Verifikasi otomatis bahwa kode tetap sehat. Jalankan script verify:

```bash
bash .opencode/skills/omnistack-quality-gate/scripts/verify.sh
```

Script menjalankan 3 tahap berurutan:

| Tahap | Command | Arti gagal |
|-------|---------|-----------|
| 1. Lint | `npm run lint` | Ada pelanggaran style/rule ESLint |
| 2. Typecheck | `npx tsc --noEmit` | Ada error TypeScript (strict mode) |
| 3. Build | `npm run build` | Next.js gagal compile / route error |

## Jika Gagal

1. **Baca pesan error lengkap** — jangan tebak.
2. Perbaiki di file yang ditunjuk, dengan urutan prioritas:
   - Error TypeScript → perbaiki tipe, JANGAN pakai `any` atau `@ts-ignore`
   - ESLint `react-hooks/*` → deklarasikan semua hooks dulu, baru early-return;
     helper yang dipakai di dalam `useEffect` dideklarasikan sebelum effect
   - Import error → pastikan path pakai `@/` alias
3. Jalankan ulang `verify.sh` sampai RESULT: PASS.
4. Maksimal 3 iterasi perbaikan. Jika masih gagal setelah 3x, laporkan
   error tersisa ke user — jangan mengubah aturan project demi lolos check.

## Aturan Saat Memperbaiki

- ❌ JANGAN disable rule ESLint (`// eslint-disable-next-line`) tanpa
  persetujuan user
- ❌ JANGAN turunkan strictness TypeScript
- ❌ JANGAN edit `components/ui/` demi memperbaiki error
- ✅ Preservasi error context: catat error + solusinya ke
  `.opencode/memory/errors.md` agar sesi berikutnya tidak mengulangi kesalahan

## Interpretasi Hasil

- **RESULT: PASS** — aman lanjut (commit / update KG / laporkan selesai).
- **RESULT: FAIL** — kerjakan langkah "Jika Gagal" di atas.
- Warning lint non-blocking boleh dilaporkan saja, tidak wajib diperbaiki,
  KECUALI warning `react-hooks/*` — itu wajib diperbaiki.
