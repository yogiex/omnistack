# Node: concept-base-ui-not-radix

| Field | Value |
|-------|-------|
| Class | Constraint |
| Files | components/ui/* |
| Status | stable |

## Purpose

Project memakai shadcn/ui dengan primitive Base UI (bukan Radix UI). Semua pola integrasi UI harus mengikuti API Base UI.

## Relations

### classifies →
- [[component-app-sidebar]]
- [[component-top-nav]]

## Gotchas

- TIDAK ada prop `asChild` — gunakan `buttonVariants()` via `cn()` untuk styling trigger.
- File `components/ui/` di-generate shadcn CLI; JANGAN edit manual.
