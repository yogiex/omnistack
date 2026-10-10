# Node: lib-mock-data

| Field | Value |
|-------|-------|
| Class | DataModule |
| Files | lib/mock-data.ts |
| Status | stable |

## Purpose

Sumber tunggal data mock (users, projects, deployments, databases, backups, logs,
audit) plus helper RBAC (`getMockProjectsByUser`, `getMockDeploymentsForRole`,
`getMockDatabasesForRole`, `roleAtLeast`) dan tipe domain. Tidak ada backend;
semua dikonsumsi langsung komponen client.

## Relations

### usedBy ←
- [[page-dashboard]] — daftar proyek/deployment + helper RBAC
- [[page-login-register]] — `MOCK_USERS`, `ROLE_REDIRECTS`, `type Role`
- [[component-project-status-badge]] — `type ProjectStatus`
- [[component-route-guard]] — `roleAtLeast`, `type Role`
- [[component-app-sidebar]] — `type Role`
- [[lib-auth-context]]
- [[page-projects]]
- [[page-deployments]]
- [[page-project-logs]] — `MOCK_LOGS`, `MockLogEntry`, `LogCategory`, `roleAtLeast`
- [[component-project-import-wizard]]
- [[component-deployment-dialogs]]

## Gotchas

- File besar (>1000 baris) — pertimbangkan pecah seperti `lib/mock-finops.ts`
  untuk domain baru.
- Tipe `ProjectSource` (`kind: manual|upload|git`, `provider`, `repoUrl`, `branch`,
  `fileName`, `fileSizeBytes`, `detectedStack`, `analyzedAtLabel`) menempel
  opsional di `MockProject.source`; dianalisis oleh `lib-source-utils.ts`.
- Nilai deterministik (tanpa `Math.random()`/`toLocaleDateString`) agar tidak
  hydration mismatch.
- Status proyek: `"active" | "inactive" | "deploying" | "failed"`.