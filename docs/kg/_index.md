# OmniStack Knowledge Graph — Index

> Entry point utama untuk AI agent. Baca file ini DULU sebelum mengerjakan task apa pun,
> lalu ikuti link `[[...]]` ke node yang relevan. Node = 1 file markdown di `docs/kg/nodes/`.

## Konvensi Graf

- **Wikilink** `[[node-name]]` = edge/relasi antar node. Nama node = nama file tanpa `.md`.
- Relasi **bertipe**: dikelompokkan per heading H3 di bagian `## Relations`
  (`### dependsOn →` keluar, `### usedBy ←` masuk). Kosakata & inverse resmi:
  lihat `_ontology.md` §2.
- Setiap node wajib punya metadata `Class` (klasifikasi paling spesifik dari
  taksonomi `_ontology.md` §1), `Files`, dan `Status`.
- Jaga simetri inverse dua arah: A `dependsOn→` B ⟺ B `usedBy←` A.
  Validasi: `bash .opencode/skills/omnistack-kg/scripts/validate-kg.sh`.

## Tipe Node

| Prefix | Tipe | Cakupan |
|--------|------|---------|
| `page-` | Halaman/route | `app/**` |
| `component-` | Komponen | `components/**`, `_components/` |
| `lib-` | Modul library/context | `lib/**` |
| `concept-` | Konvensi/pattern/gotcha | lintas file |

## Dokumen Root (sumber kebijakan)

- [[doc-agents]] — AGENTS.md: aturan wajib coding
- [[doc-architecture]] — ARCHITECTURE.md: blueprint sistem
- [[doc-conventions]] — CONVENTIONS.md: pola kode detail
- [[doc-design]] — DESIGN.md: design system visual

## Pages

- [[page-root-layout]] — app/layout.tsx, ThemeProvider + TooltipProvider
- [[page-landing]] — app/page.tsx, marketing page
- [[page-dashboard-shell]] — app/(dashboard)/layout.tsx, Sidebar + TopNav
- [[page-dashboard]] — overview client dashboard
- [[page-projects]] — CRUD project lengkap
- [[page-deployments]] — Deployment history + actions
- [[page-login-register]] — login / register / forgot-password (mock auth)

## Components

- [[component-app-sidebar]]
- [[component-top-nav]]
- [[component-project-status-badge]]
- [[component-route-guard]]
- [[component-deployment-dialogs]]

## Lib

- [[lib-auth-context]] — mock auth via localStorage
- [[lib-mock-data]] — mock users/projects/deployments + RBAC helpers
- [[lib-utils]] — cn() helper

## Concepts

- [[concept-base-ui-not-radix]] — Base UI primitives, TIDAK ada asChild
- [[concept-server-first]] — Server Components default, "use client" hanya bila perlu
- [[concept-color-tokens]] — semantic tokens, dilarang hardcode hex
