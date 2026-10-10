# Node: page-admin-users

| Field | Value |
|-------|-------|
| Class | Pages |
| Files | app/(dashboard)/admin/users/page.tsx, app/(dashboard)/admin/users/users-page-client.tsx, app/(dashboard)/admin/users/_components/*.tsx, app/(dashboard)/admin/users/_hooks/*.ts |
| Status | stable |

## Purpose

Halaman User Management (/admin/users) khusus ADMIN: invite, edit role,
suspend, 2FA, reset password, delete (2-step type-to-confirm email), plus
bulk select/role/delete. Data via `useUsers` (state lokal + guard bisnis) dan
`useUserFilters` (search debounced, filter role/status, pagination).

## Relations

### dependsOn →
- [[lib-mock-data]] — MOCK_USERS, getUserStatus, formatRelativeTime, getMockUsersByRole
- [[lib-auth-context]] — currentUser via useAuth
- [[component-route-guard]] — requiredRole="ADMIN"
- [[concept-color-tokens]] — role badge amber/blue/emerald, tanpa hex
- [[component-stat-card]] — StatCard/StatGrid untuk 4 kartu metrik
- [[lib-use-debounce]] — debounce search 300ms

### usedBy ←
- (tidak ada — halaman leaf)

## Gotchas

- Checkbox select-all grup memakai properti `indeterminate` via ref + useEffect;
  Base UI Checkbox.Root tidak menerima `"indeterminate"` sebagai nilai `checked`.
- Guard "min. 1 ADMIN aktif" menghitung ADMIN berstatus active saja
  (`isLastActiveAdmin` + `activeAdminCount`), bukan total ADMIN.
- Delete dialog 2-step: info → type-to-confirm email (state internal, bukan
  2 dialog bertumpuk).
- `UserFormSheet` menonaktifkan opsi non-ADMIN untuk ADMIN terakhir via
  `disabled` pada SelectItem — bukan dengan mematikan tombol submit.
- State selection tidak otomatis clear saat ganti filter — hanya via tombol
  clear di bulk bar.
