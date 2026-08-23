# Error Log — Kesalahan yang Sudah Pernah Terjadi

> Jangan hapus entri error. Error context yang dipertahankan mencegah agent
> mengulangi kesalahan yang sama (pola Manus: preserve failure context).
> Format ringkas agar murah di-retrieve via grep.

## Format

```
## YYYY-MM-DD — <error singkat>
- Symptom: <pesan error / perilaku salah>
- Cause: <akar masalah>
- Fix: <solusi yang berhasil>
- Files: <file terkait>
```

## Entries

### 2026-08-23 — asChild tidak ada di Base UI
- Symptom: Error runtime/TS saat memakai `<DropdownMenuTrigger asChild>`.
- Cause: OmniStack memakai Base UI primitives, bukan Radix UI; Base UI
  tidak support prop `asChild`.
- Fix: Gunakan `buttonVariants()` langsung:
  `className={cn(buttonVariants({ variant: "ghost" }))}`.
- Files: components/ui/*, komponen pemakai dropdown.

### 2026-08-23 — next-themes warning di dev Turbopack
- Symptom: Warning "Encountered a script tag" di dev mode.
- Cause: Perilaku expected next-themes untuk mencegah FOUC dengan Turbopack.
- Fix: Ignore. Tidak muncul di production build.
- Files: app/layout.tsx

### 2026-08-23 — react-icons nama import unik
- Symptom: "not defined" saat import icon brand.
- Cause: Nama export react-icons berbeda dari ekspektasi umum.
- Fix: `SiNextdotjs` (bukan SiNextjs), `SiNodedotjs` (bukan SiNodejs),
  `SiVuedotjs` (bukan SiVue). Fallback ke Lucide jika ragu.
- Files: komponen yang memakai brand logo.

### 2026-08-23 — next/font/google bug dengan Turbopack (Next.js 16)
- Symptom: Font gagal load / error internal Next.js 16 + Turbopack.
- Cause: Bug internal Next.js 16 pada next/font/google.
- Fix: Gunakan class `font-sans` Tailwind yang sudah di-setup shadcn.
- Files: app/layout.tsx, app/globals.css
