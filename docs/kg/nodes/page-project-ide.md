# Node: page-project-ide

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(ide)/projects/[id]/ide/page.tsx, app/(ide)/projects/[id]/ide/ide-client.tsx |
| Status | wip |

## Purpose

Halaman Cloud IDE (mock UI) yang terikat konteks proyek di route `/projects/[id]/ide`.
Menampilkan workspace VS Code-like fullscreen: editor, file explorer, live preview, AI Pilot,
terminal, status bar, command palette, dan deploy dialog — semuanya memakai data mock, tanpa
backend/BYOC nyata. Belum ada Monaco/xterm/WebSocket (hanya rendering tiruan).

## Relations

### renders →
- [[component-cloud-ide]]

### dependsOn →
- [[lib-mock-ide-data]]
- [[lib-auth-context]]

## Gotchas

- Berada di route group `(ide)` dengan `layout.tsx` sendiri (RouteGuard + `h-svh`), sehingga
  **tidak** memakai dashboard shell — sidebar & top nav dashboard hilang (fullscreen takeover).
- Hanya editor read-only; perataan via props `canWrite` dari `roleAtleast(user.role, "USER")`.
- Command palette dipicu `Ctrl+K`/`Meta+K` lewat event listener global di `ide-shell`.
