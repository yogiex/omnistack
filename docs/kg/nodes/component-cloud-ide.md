# Node: component-cloud-ide

| Field | Value |
|-------|-------|
| Class | Component |
| Files | app/(ide)/projects/[id]/ide/_components/ide-shell.tsx, ide-top-bar.tsx, ide-activity-bar.tsx, ide-file-explorer.tsx, ide-editor.tsx, ide-right-panel.tsx, ide-bottom-panel.tsx, ide-status-bar.tsx, ide-command-palette.tsx, ide-deploy-dialog.tsx |
| Status | wip |

## Purpose

Kumpulan komponen page-specific yang membentuk layout 5-zona Cloud IDE: top bar, activity bar,
explorer, editor, right panel (Preview/AI Pilot/Metrics), bottom panel (Terminal/Problems/Output),
status bar, command palette, dan deploy dialog. Semua client component, data dari lib-mock-ide-data.

## Relations

### renderedBy ←
- [[page-project-ide]]

### dependsOn →
- [[lib-mock-ide-data]]

## Gotchas

- Base UI primitives (Tabs, Dialog, Tooltip, DropdownMenu) — tanpa `asChild`.
- Tooltip/activity bar memakai `TooltipTrigger` dengan `className` langsung (bukan `render`).
- Data (file tree, code, terminal, AI, problems, palette) sumbernya di `lib/mock-ide-data.ts`,
  bukan hardcode di komponen.
