# Node: concept-color-tokens

| Field | Value |
|-------|-------|
| Class | Constraint |
| Files | app/globals.css, components/**/*.tsx (lintas file) |
| Status | stable |

## Purpose

Aturan desain: styling WAJIB memakai token warna semantik (`bg-background`,
`text-foreground`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `border-border`,
`text-destructive`) yang adaptif light/dark. Hardcode hex (`bg-[#ff0000]`) atau
inline style untuk styling statis dilarang.

## Relations

### classifies →
- [[page-landing]] — memakai bg-background/text-muted-foreground
- [[page-login-register]] — memakai bg-background/bg-muted/text-primary
- [[page-dashboard]] — memakai text-muted-foreground/text-primary
- [[page-dashboard-shell]] — shell & komponen memakai token semantik
- [[component-project-status-badge]] — warna status via class token/utility
- [[concept-base-ui-not-radix]] — komponen Base UI tetap mematuhi token semantik

### dependsOn →
- [[lib-utils]] — `cn()` untuk menggabungkan class token

## Gotchas

- Warna status "hardcoded" (green-500/amber-500, dst.) diperbolehkan untuk badge
  status karena makna semantik status; tetapi warna UI umum tetap pakai token.
- Token otomatis berubah dark mode — jangan tambah override `dark:` manual kecuali
  perlu pengecualian eksplisit.