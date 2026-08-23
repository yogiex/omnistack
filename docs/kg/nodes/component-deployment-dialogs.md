# Node: component-deployment-dialogs

| Field | Value |
|-------|-------|
| Class | Component |
| Files | app/(dashboard)/deployments/_components/deployment-detail-modal.tsx, app/(dashboard)/deployments/_components/rollback-dialog.tsx, app/(dashboard)/deployments/_components/ai-diagnose-dialog.tsx, app/(dashboard)/deployments/_components/new-deployment-dialog.tsx |
| Status | stable |

## Purpose

Kumpulan dialog/modal page-specific untuk halaman deployments: detail deployment, rollback confirmation, AI diagnose error, dan new deployment trigger. Semua menggunakan shadcn Dialog (Base UI).

## Relations

### renderedBy ←
- [[page-deployments]]

### dependsOn →
- [[lib-mock-data]]

## Gotchas

- Base UI Dialog (bukan Radix) — tidak ada `asChild` prop.
- `AIDiagnoseDialog` menerima `deploymentId` + `errorMessage`, tanpa `projectName`.
- `RollbackDialog` menggunakan `Textarea` component yang diinstall via shadcn CLI.
- `NewDeploymentDialog` menerima `projects` array untuk selection.
