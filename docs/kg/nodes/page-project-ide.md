# Node: page-project-ide

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/projects/[id]/ide/page.tsx, app/(dashboard)/projects/[id]/ide/ide-client.tsx |
| Status | wip |

## Purpose

Halaman Cloud IDE (mock UI) yang terikat konteks proyek di route `/projects/[id]/ide`.
Menampilkan workspace VS Code-like: editor, file explorer, live preview, AI Pilot, terminal,
status bar, command palette, dan deploy dialog — semuanya memakai data mock, tanpa backend/BYOC
nyata. Belum ada Monaco/xterm/WebSocket (hanya rendering tiruan).

## Relations

### renders →
- [[component-cloud-ide]]

### dependsOn →
- [[lib-mock-ide-data]]
- [[lib-auth-context]]

## Gotchas

- Belum fullscreen takeover — masih di dalam dashboard shell (Sidebar + TopNav dari layout dashboard).
- Hanya editor read-only; perataan via props `canWrite` dari `roleAtleast(user.role, "USER")`.
- Command palette dipicu `Ctrl+K`/`Meta+K` lewat event listener global di `ide-shell`.
