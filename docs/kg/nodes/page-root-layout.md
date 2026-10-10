# Node: page-root-layout

| Field | Value |
|-------|-------|
| Class | Page |
| Files | app/layout.tsx |
| Status | stable |

## Purpose

Root layout App Router: memasang font lokal Inter, provider global (AuthProvider,
ThemeProvider, PaletteProvider, TooltipProvider), metadata/viewport, dan script
anti-FOUC palette. Membungkus SEMUA route — landing, area dashboard, maupun auth.

## Relations

### consumesContext ←
- [[lib-auth-context]] — AuthProvider membungkus seluruh app di sini

### usedBy ←
- [[component-route-guard]] — fragment: guard butuh AuthProvider dari root ini
- [[page-dashboard-shell]] — fragment: root layout membungkus shell dashboard
- [[page-landing]] — fragment: root layout membungkus landing
- [[page-login-register]] — fragment: root layout membungkus halaman auth

## Gotchas

- `suppressHydrationWarning` WAJIB ada di `<html>` dan `<body>` (theme + palette).
- Font memakai `next/font/local` (Inter-Variable.woff2) agar build Docker tanpa
  akses Google Fonts (lihat gotcha #3 AGENTS.md).
- `<Script id="palette-init" strategy="beforeInteractive">` men-set `data-palette`
  dari localStorage SEBELUM paint (anti-FOUC); dibungkus `try/catch` karena
  localStorage bisa throw di private mode / Safari.
- Urutan provider: AuthProvider → ThemeProvider → PaletteProvider → TooltipProvider.