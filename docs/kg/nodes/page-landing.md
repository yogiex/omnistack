# Node: page-landing

| Field | Value |
|-------|-------|
| Class | MarketingPage |
| Files | app/page.tsx |
| Status | stable |

## Purpose

Landing page marketing publik di `/` (server component, tanpa `"use client"`):
hero, navbar publik, grid compatibility stack (React/Vue/Go/Rust, dst. via
react-icons/si), tabel perbandingan, dan accordion FAQ. Satu-satunya route
publik tingkat atas selain auth.

## Relations

### dependsOn →
- [[lib-utils]] — `cn()` untuk conditional class
- [[page-root-layout]] — fragment: layout root membungkus landing

### governedBy ←
- [[concept-server-first]] — server component default (tanpa hooks/event handler)
- [[concept-color-tokens]] — memakai token semantik (bg-background, text-muted-foreground)

## Gotchas

- Import brand icon dari `react-icons/si` memakai nama unik: `SiNextdotjs`,
  `SiNodedotjs`, `SiVuedotjs` (bukan SiNextjs/SiNodejs/SiVue) — lihat AGENTS.md #4.
- Tetap server component meski memakai banyak komponen shadcn; jangan tambah
  `"use client"` kecuali benar-benar perlu interaktivitas.