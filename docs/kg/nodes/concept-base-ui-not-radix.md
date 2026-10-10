# Node: concept-base-ui-not-radix

| Field | Value |
|-------|-------|
| Class | Constraint |
| Files | components/ui/* |
| Status | stable |

## Purpose

Project memakai shadcn/ui dengan primitive Base UI (bukan Radix UI). Semua pola integrasi UI harus mengikuti API Base UI.

## Relations

### dependsOn →
- [[lib-utils]] — `cn()` + `buttonVariants()` untuk styling trigger

### usedBy ←
- [[component-ai-reviewer-results]] — Tabs/Select Base UI

### governedBy ←
- [[concept-color-tokens]] — komponen Base UI tetap mematuhi token semantik

### classifies →
- [[component-app-sidebar]]
- [[component-top-nav]]

## Gotchas

- TIDAK ada prop `asChild` — gunakan `buttonVariants()` via `cn()` untuk styling trigger.
- File `components/ui/` di-generate shadcn CLI; JANGAN edit manual.
