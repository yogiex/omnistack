# Node: page-login-register

| Field | Value |
|-------|-------|
| Class | AuthPage |
| Files | app/login/page.tsx, app/register/page.tsx, app/forgot-password/page.tsx |
| Status | stable |

## Purpose

Tiga halaman auth mock (tanpa backend): login (email/password + quick-login akun
uji), register (4 langkah: info → OTP → password → sukses dengan zxcvbn), dan
forgot-password (form dummy, tombol kirim disabled). Semua memakai mock auth dari
`lib/auth-context.tsx`.

## Relations

### dependsOn →
- [[lib-auth-context]] — `useAuth().login` / `startDemoSession`
- [[lib-mock-data]] — `MOCK_USERS`, `ROLE_REDIRECTS`, `type Role`
- [[lib-utils]] — `cn()` untuk conditional class
- [[page-root-layout]] — fragment: layout root membungkus halaman auth

### governedBy ←
- [[concept-server-first]] — login/register `"use client"`; forgot-password server
- [[concept-color-tokens]] — memakai token semantik (bg-background, text-primary)

## Gotchas

- Login redirect mengikuti `ROLE_REDIRECTS[role]`; ada timer agar animasi sukses
  tampil dulu sebelum `router.push`.
- Register memakai `zxcvbn` (password strength) dan membuat sesi demo via
  `startDemoSession` (role selalu USER).
- forgot-password tombol "Kirim Tautan Reset" `disabled` — memang belum ada backend.