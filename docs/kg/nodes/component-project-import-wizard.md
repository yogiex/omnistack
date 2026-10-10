# Node: component-project-import-wizard

| Field | Value |
|-------|-------|
| Class | Component |
| Files | app/(dashboard)/projects/_components/project-form-sheet.tsx, import-upload-tab.tsx, import-git-tab.tsx, source-stack-preview.tsx |
| Status | stable |

## Purpose

Wizard "Buat Proyek Baru" bertab yang menggantikan form manual lama: tiga jalur
sumber — Manual, Upload (arsip .zip/.tar/.tgz), dan Git URL (GitHub/GitLab/generic).
Menghasilkan `ProjectSource` (kind, repoUrl/branch atau fileName/size, detectedStack)
yang diteruskan ke `useProjects().create()`. Sheet lama dipindah dari
`projects/` ke `projects/_components/` (perbaikan gotcha #6 AGENTS.md).

## Relations

### renderedBy ←
- [[page-projects]]

### dependsOn →
- [[lib-source-utils]]
- [[lib-mock-data]]
- [[lib-utils]] — `cn()` di `project-form-sheet.tsx`

## Gotchas

- Base UI `Tabs` terkontrol lewat `value` + `onValueChange` (tanpa `asChild`).
- Reset tab saat `open` berubah memakai pola adjust-during-render
  (`if (open !== prevOpen)`), bukan `useEffect` — lihat gotcha #7 AGENTS.md.
- `ImportUploadTab` TIDAK mengunggah file di mode mock; hanya membaca
  nama/ukuran lalu menjalankan `analyzeSource()` lokal. Backend menyusul.
- Stack ditampilkan read-only (`SourceStackPreview`) — user tidak boleh
  mengedit deteksi (lihat `next-update-fitur-git-integration.md` §6).
- Nama proyek di-autofill dari nama repo/arsip hanya jika field masih kosong.
- `SheetContent` di-override ke `w-full sm:max-w-lg` agar tab muat.