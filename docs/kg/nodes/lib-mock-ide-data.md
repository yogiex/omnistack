# Node: lib-mock-ide-data

| Field | Value |
|-------|-------|
| Class | DataModule |
| Files | lib/mock-ide-data.ts |
| Status | wip |

## Purpose

Data mock untuk halaman Cloud IDE: file tree proyek, konten kode per file, terminal lines,
daftar problems, riwayat chat AI Pilot, aksi command palette, metrik mini-APM, dan deploy checklist.
Menjaga data mock terpusat di lib (bukan hardcode di komponen IDE).

## Relations

### usedBy ←
- [[page-project-ide]]
- [[component-cloud-ide]]

## Gotchas

- `IDE_CODE` merupakan `Record<path, string[]>` (array baris) untuk render line-number.
- `IDE_OPEN_TABS` menentukan tab default yang terbuka di editor.
- Environment mock `.env` disembunyikan nilainya (`***REDACTED***`).
