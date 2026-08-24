# Node: page-project-logs

| Field | Value |
|-------|-------|
| Class | DashboardPage |
| Files | app/(dashboard)/projects/[id]/logs/page.tsx, app/(dashboard)/projects/[id]/logs/_components/logs-client.tsx |
| Status | wip |

## Purpose

Halaman Logs & Observability (mock UI) per project di route `/projects/[id]/logs`.
Menampilkan log stream 4 kategori (Runtime/Build/Access/Database), filter level
(INFO/WARN/ERROR/DEBUG), search grep-like, pause/resume live stream (simulasi setInterval
2 detik untuk tab Runtime), AI Log Analyzer (insights mock), dan MetricsPanel
(CPU/Memory/Disk/Network). Semua data mock dari `lib/mock-data.ts` — tanpa backend.

## Relations

- uses: lib-mock-data (MOCK_LOGS, MockLogEntry, LogCategory, roleAtLeast)
- uses: lib-auth-context (useAuth)
- linked-from: page-project-detail (tombol "Logs" di header)
- sibling: page-project-ide

## Gotchas

- Live stream HANYA di tab Runtime (isPaused dipaksa true di tab lain — build/access/database statis).
- Timestamp mock memakai basis UTC tetap (LOG_TIME_BASE) untuk hindari hydration mismatch.
- RBAC: Export & AI Analyzer hanya tampil bila `roleAtLeast(user.role, "USER")`; VIEWER read-only.
- Komponen `ScrollArea` shadcn belum di-install — pakai div overflow-y-auto.
- Berbeda dari admin/audit (audit log platform-wide ADMIN-only); halaman ini log per project.
