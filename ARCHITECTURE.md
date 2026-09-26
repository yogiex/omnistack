<div align="center">

# 🏗️ OmniStack Architecture

### System Design & Technical Blueprint

**The Developer Operating System**

*Dokumen ini menjelaskan arsitektur teknis, pola desain, dan keputusan struktural di balik OmniStack.*

</div>

---

## 📋 Daftar Isi

1. [Overview](#-overview)
2. [System Architecture](#-system-architecture)
3. [Directory Structure](#-directory-structure)
4. [Routing Strategy](#️-routing-strategy)
5. [Component Architecture](#-component-architecture)
6. [Data Flow Patterns](#-data-flow-patterns)
7. [State Management](#-state-management)
8. [Styling System](#-styling-system)
9. [Build & Performance](#-build--performance)
10. [Key Decisions (ADRs)](#-key-decisions-adrs)
11. [Future Scalability](#-future-scalability)
12. [Maintenance](#-maintenance)

---

## 🌐 Overview

OmniStack adalah **Platform as a Service (PaaS)** modern yang memposisikan diri sebagai "Developer Operating System". Arsitektur frontend dibangun dengan prinsip:

### Core Principles

1. **Server-First** — Maksimalkan Server Components untuk performa & SEO
2. **Type-Safe** — TypeScript strict mode di seluruh codebase
3. **Composable** — Komponen modular yang bisa di-reuse
4. **Performance-Oriented** — Turbopack + optimasi otomatis Next.js
5. **Developer Experience** — Hot reload, type safety, predictable patterns

### Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                  │
│  (Pages, Components, UI Primitives)                 │
├─────────────────────────────────────────────────────┤
│                 APPLICATION LAYER                   │
│  (Hooks, Context, State Management)                 │
├─────────────────────────────────────────────────────┤
│                  BUSINESS LAYER                     │
│  (Services, Utils, API Clients)                     │
├─────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE LAYER                │
│  (Next.js Runtime, Turbopack, Vercel/Docker)        │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 System Architecture

### High-Level Architecture Diagram

```
                              ┌────────────────────┐
                              │     END USER       │
                              │   (Web Browser)    │
                              └──────────┬─────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────┐
│                         CDN / EDGE                              │
│              (Vercel Edge Network / Cloudflare)                 │
└────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ROUTING LAYER                          │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │  │
│  │   │  Landing    │  │   Login     │  │  Dashboard   │    │  │
│  │   │   Page      │  │   Page      │  │   (Group)    │    │  │
│  │   └─────────────┘  └─────────────┘  └──────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  RENDERING LAYER                          │  │
│  │   ┌──────────────────┐    ┌──────────────────┐           │  │
│  │   │ Server Components│    │ Client Components│           │  │
│  │   │ (Data Fetching)  │◄──►│ (Interactivity)  │           │  │
│  │   └──────────────────┘    └──────────────────┘           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API LAYER                              │  │
│  │              Route Handlers (app/api/*)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Database │  │   Auth   │  │  Storage │  │  AI Provider │   │
│  │(Postgres)│  │(NextAuth)│  │  (S3)    │  │(OpenAI/Claude)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture Components

```
┌──────────────────────────────────────────────────────────────┐
│                        UI LAYER                               │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pages (app/*/page.tsx)                                  │ │
│  │  ├── Landing Page (marketing)                            │ │
│  │  ├── Login Page (auth)                                   │ │
│  │  └── Dashboard Pages (authenticated)                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ▲                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Layouts                                                 │ │
│  │  ├── Root Layout (app/layout.tsx)                        │ │
│  │  ├── Dashboard Layout (app/(dashboard)/layout.tsx)       │ │
│  │  └── Auth Layout (future)                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ▲                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Feature Components (components/*)                       │ │
│  │  ├── app-sidebar.tsx                                     │ │
│  │  ├── top-nav.tsx                                         │ │
│  │  └── [business-specific components]                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ▲                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  UI Primitives (components/ui/*)                         │ │
│  │  ├── button.tsx    ├── card.tsx    ├── input.tsx         │ │
│  │  ├── dialog.tsx    ├── tabs.tsx    ├── dropdown-menu.tsx │ │
│  │  └── [other shadcn/ui components]                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

### Root Structure

```
omnistack/
├── app/                          # Next.js App Router (203 file)
├── components/                   # React components lintas-page (33 file)
│   ├── ui/                       # shadcn/ui primitives — 20 file, DO NOT EDIT
│   ├── kpi/                      # Sistem KPI config-driven — 5 file
│   └── [8 komponen root]
├── lib/                          # Utilities, mock data, context (19 file)
│   ├── kpi/                      # Types + 6 preset config
│   ├── settings/                 # Data + konstanta halaman Settings
│   └── theme/                    # Palette system
├── hooks/                        # Hook lintas-halaman (2 file)
├── public/                       # Static assets (svg, local font)
├── scripts/                      # Build-time Node/shell scripts
│   ├── favicon.mjs               # Generator icon set dari app/icon.svg
│   └── gen-dev-certs.sh          # Sertifikat TLS self-signed untuk lokal
├── docker/                       # Runtime container config
│   ├── nginx/
│   │   ├── nginx.conf            # Config utama
│   │   ├── conf.d/omnistack.conf # Server block (error_page 404 → /404.html)
│   │   └── snippets/security-headers.conf
│   └── certs/                    # TLS (git-ignored, isi .gitkeep saja)
├── docs/                         # Dokumentasi tambahan
│   ├── audits/PROJECT-AUDIT.md   # Audit codebase — 289 finding
│   └── kg/                       # Knowledge graph (_index, _ontology, nodes/)
├── .github/
│   └── workflows/deploy.yml      # CI: static export → branch gh-pages
├── .opencode/                    # Agent context engineering
│   ├── agent/                    # Sub-agents (mvp-implementer, code-reviewer, kg-curator)
│   ├── command/                  # Slash commands (/mvp, /kg)
│   ├── skills/                   # On-demand skills + scripts
│   └── memory/                   # todo.md, decisions.md, errors.md
│
├── .next/                        # Build output (git-ignored)
├── node_modules/                 # Dependencies (git-ignored)
│
├── components.json               # shadcn/ui configuration
├── next.config.ts                # output: "export", trailingSlash, basePath opsional
├── postcss.config.mjs            # PostCSS (Tailwind v4 — no tailwind.config.ts)
├── eslint.config.mjs             # ESLint flat config
├── tsconfig.json                 # TypeScript strict
├── package.json                  # Dependencies & scripts
├── Dockerfile                    # Multi-stage build → nginx-unprivileged
├── docker-compose.yml            # Local container orchestration + TLS
├── .dockerignore                 # Docker build context exclusions
├── .env.example                  # Environment variable template
│
├── AGENTS.md                     # AI agent guide (wajib dibaca)
├── CLAUDE.md                     # Claude-specific agent notes
├── ARCHITECTURE.md               # This file
├── CONVENTIONS.md                # Code conventions
├── DESIGN.md                     # Design system
├── INFRASTRUCTURE.md             # Infrastruktur & deployment
├── CHANGELOG.md                  # Version history
├── README.docker.md              # Panduan menjalankan via Docker
├── README.md                     # Project overview
│
└── [dokumen fitur — bukan dokumentasi struktur]
    ├── next-update-fitur-competitor-v0-vercel-cyberpanel.md
    ├── next-update-fitur-git-integration.md
    ├── ai-code-reviewer-page.md
    └── qwen-uiux-page-finops.md
```

> **Catatan Tailwind v4:** tidak ada `tailwind.config.ts`. Konfigurasi Tailwind
> (theme tokens, plugin, `@source`) ditulis inline di `app/globals.css` melalui
> directive `@theme` / `@plugin` / `@source`.

### Detailed Breakdown

#### 📂 `app/` — Next.js App Router

Struktur ini mengikuti konvensi Next.js 13+ dengan App Router:

```
app/
├── layout.tsx                    # Root layout — ThemeProvider, PaletteProvider, TooltipProvider,
│                                 #   init script anti-FOUC palette, viewport.themeColor
├── page.tsx                      # Landing page (URL: /) — marketing
├── not-found.tsx                 # URL: */404 — file konvensi → out/404.html
├── globals.css                   # Tailwind v4 @theme inline + 6 blok [data-palette]
│                                 #   + token --chart-1..5 per palette
├── icon.svg                      # Favicon utama (App Router — scalable)
├── apple-icon.png                # Apple touch icon 180×180
├── favicon.ico                   # Fallback ICO
├── page.tsx.bak                  # ⚠️ leftover — bukan bagian app, slated for deletion
│
├── 401/
│   └── page.tsx                  # URL: /401 — countdown 8s → /login (bisa dibatalkan)
├── 403/
│   └── page.tsx                  # URL: /403 — panel Request Access (mailto + copy)
├── login/
│   └── page.tsx                  # URL: /login
├── register/
│   └── page.tsx                  # URL: /register
├── forgot-password/
│   └── page.tsx                  # URL: /forgot-password
├── privacy/
│   └── page.tsx                  # URL: /privacy
└── terms/
    └── page.tsx                  # URL: /terms
│
│   # ── Route Group: Authenticated pages (AppSidebar + TopNav) ──
├── (dashboard)/
│   ├── layout.tsx                # Dashboard shell (SidebarProvider + AppSidebar + TopNav)
│   │
│   ├── dashboard/                # URL: /dashboard
│   │   ├── page.tsx              # Server Component shell
│   │   └── client-dashboard.tsx  # KPI + chart + tabel deploy
│   │
│   ├── projects/                 # URL: /projects — CRUD lengkap
│   │   ├── page.tsx              # Shell statis
│   │   ├── project-list.tsx      # Client orchestrator (RBAC + handlers + render)
│   │   ├── project-form-sheet.tsx# Sheet create/edit proyek
│   │   ├── _hooks/               # 3 file
│   │   │   ├── use-projects.ts          # State + mutasi (create/clone/transfer/archive/status)
│   │   │   ├── use-project-filters.ts   # Search, status, owner, sort, pagination
│   │   │   └── use-project-shortcuts.ts # Keyboard: N = buat, / = fokus search
│   │   ├── _components/          # 11 file
│   │   │   ├── project-card.tsx           # Card grid + tipe ManagedProject
│   │   │   ├── projects-table.tsx         # Tampilan tabel
│   │   │   ├── filter-bar.tsx             # Search, sort, owner filter, view toggle
│   │   │   ├── project-actions-menu.tsx   # Menu aksi per baris
│   │   │   ├── transfer-ownership-sheet.tsx # Sheet khusus ADMIN
│   │   │   ├── projects-header.tsx        # Judul + CTA per role
│   │   │   ├── projects-notice.tsx        # Notifikasi in-line (dismissable)
│   │   │   ├── projects-pagination.tsx
│   │   │   ├── projects-skeleton.tsx
│   │   │   ├── projects-empty-none.tsx
│   │   │   └── projects-empty-filtered.tsx
│   │   └── [id]/                 # URL: /projects/:id
│   │       ├── page.tsx
│   │       ├── project-detail-client.tsx  # canWrite = role AND owner (audit C2)
│   │       ├── logs/              # URL: /projects/:id/logs
│   │       │   ├── page.tsx
│   │       │   └── _components/   # 5 file
│   │       │       ├── logs-client.tsx      # Orchestrator log explorer
│   │       │       ├── log-stream.tsx       # Live stream
│   │       │       ├── log-filters.tsx
│   │       │       ├── metrics-panel.tsx
│   │       │       └── ai-log-analyzer.tsx  # Analisis log by AI
│   │       └── databases/        # URL: /projects/:id/databases
│   │           ├── page.tsx
│   │           ├── loading.tsx
│   │           ├── databases-client.tsx    # Orchestrator
│   │           ├── _components/   # 8 file
│   │           │   ├── database-card.tsx
│   │           │   ├── database-filters.tsx
│   │           │   ├── database-stats.tsx
│   │           │   ├── create-database-dialog.tsx
│   │           │   ├── delete-database-dialog.tsx
│   │           │   ├── connection-dialog.tsx
│   │           │   ├── rotate-password-dialog.tsx
│   │           │   └── empty-state.tsx
│   │           └── [dbId]/        # URL: /projects/:id/databases/:dbId
│   │               ├── page.tsx    # Database overview
│   │               ├── _components/  # 3 file
│   │               │   ├── backup-manager.tsx
│   │               │   ├── database-metrics.tsx
│   │               │   └── query-console.tsx
│   │               ├── backups/    # .../:dbId/backups
│   │               │   ├── page.tsx
│   │               │   └── backups-client.tsx
│   │               ├── console/    # .../:dbId/console
│   │               │   └── page.tsx
│   │               └── metrics/    # .../:dbId/metrics
│   │                   └── page.tsx
│   │
│   ├── admin/                    # URL: /admin — semua role-gated ADMIN
│   │   ├── page.tsx              # URL: /admin
│   │   ├── admin-overview.tsx    # Z-pattern shell (KPI → focal zone → bottom bar)
│   │   ├── _components/          # 4 file
│   │   │   ├── recent-activity.tsx    # Timeline dot + garis vertikal
│   │   │   ├── role-distribution.tsx  # Progress bar per role + legend
│   │   │   ├── system-health.tsx     # Warna berbasis threshold
│   │   │   └── alerts-panel.tsx       # Kartu alert yang bisa diklik
│   │   │
│   │   ├── users/                # URL: /admin/users
│   │   │   ├── page.tsx          # RouteGuard requiredRole="ADMIN"
│   │   │   ├── loading.tsx       # Skeleton mirror struktur final
│   │   │   ├── users-page-client.tsx  # Orchestrator tipis
│   │   │   ├── user-form-sheet.tsx    # Edit-only (shadcn Select)
│   │   │   ├── _hooks/           # 2 file
│   │   │   │   ├── use-users.ts         # State, mutasi, semua guard bisnis
│   │   │   │   └── use-user-filters.ts  # Search, role, status, sort, pagination
│   │   │   └── _components/      # 11 file
│   │   │       ├── users-header.tsx
│   │   │       ├── users-toolbar.tsx     # Search + sort dropdown
│   │   │       ├── users-filter-pills.tsx # PillGroup generik (role + status)
│   │   │       ├── users-list.tsx        # Container + pagination
│   │   │       ├── user-row.tsx          # Baris + action menu
│   │   │       ├── users-pagination.tsx
│   │   │       ├── role-badge.tsx        # RoleBadge + InvitedBadge
│   │   │       ├── stats-grid.tsx
│   │   │       ├── invite-user-dialog.tsx
│   │   │       ├── delete-user-dialog.tsx
│   │   │       └── empty-state.tsx
│   │   │
│   │   ├── databases/            # URL: /admin/databases — cluster-wide
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx       # Re-export DatabasesSkeleton
│   │   │   ├── admin-databases-client.tsx # Orchestrator
│   │   │   ├── _hooks/
│   │   │   │   └── use-database-filters.ts # Search, project, engine, status, pagination
│   │   │   └── _components/      # 8 file
│   │   │       ├── databases-header.tsx
│   │   │       ├── databases-toolbar.tsx   # Search + 3 Select filter
│   │   │       ├── databases-table.tsx     # <Link> di sel nama, bukan onClick di row
│   │   │       ├── database-engine-badge.tsx  # Tailwind tone, tanpa hex
│   │   │       ├── database-status-badge.tsx  # Dot + animate-ping
│   │   │       ├── databases-empty-state.tsx # 2 varian (filter vs belum ada data)
│   │   │       ├── databases-pagination.tsx
│   │   │       └── databases-skeleton.tsx
│   │   │
│   │   ├── ai-config/            # URL: /admin/ai-config
│   │   │   ├── page.tsx
│   │   │   └── ai-config-client.tsx
│   │   ├── audit/                # URL: /admin/audit
│   │   │   ├── page.tsx
│   │   │   └── audit-log.tsx
│   │   ├── billing/              # URL: /admin/billing
│   │   │   ├── page.tsx
│   │   │   └── billing-client.tsx
│   │   ├── infrastructure/       # URL: /admin/infrastructure
│   │   │   ├── page.tsx
│   │   │   └── infrastructure-client.tsx
│   │   └── settings/             # URL: /admin/settings
│   │       ├── page.tsx
│   │       └── system-settings.tsx
│   │
│   ├── deployments/              # URL: /deployments
│   │   ├── page.tsx
│   │   ├── loading.tsx           # Re-export DeploymentsSkeleton
│   │   ├── deployments-list.tsx  # Orchestrator tipis
│   │   ├── _hooks/               # 3 file
│   │   │   ├── use-deployments.ts        # Seed + mutasi, guard canWrite per mutasi
│   │   │   ├── use-deployment-filters.ts # Search, project, status, env, sort, pagination
│   │   │   └── use-deployment-modals.ts  # Discriminated union { type, deploymentId }
│   │   └── _components/          # 12 file
│   │       ├── deployments-header.tsx
│   │       ├── deployments-filter-bar.tsx
│   │       ├── deployments-table.tsx
│   │       ├── deployment-stats.tsx      # Turunan dari `deployments` (rates + avg duration)
│   │       ├── active-deployments.tsx
│   │       ├── deployments-pagination.tsx
│   │       ├── deployments-skeleton.tsx
│   │       ├── deployments-empty-state.tsx
│   │       ├── new-deployment-dialog.tsx
│   │       ├── rollback-dialog.tsx
│   │       ├── deployment-detail-modal.tsx
│   │       └── ai-diagnose-dialog.tsx
│   │
│   ├── finops/                   # URL: /finops
│   │   ├── page.tsx
│   │   ├── finops-client.tsx     # Orchestrator — RBAC filter + Z-pattern sections
│   │   └── _components/          # 9 file
│   │       ├── finops-header.tsx             # Judul, subtitle per role, link alert, export
│   │       ├── critical-alert-banner.tsx     # Border-l accent, non-dismissible
│   │       ├── infra-breakdown-strip.tsx
│   │       ├── cost-trend-chart.tsx          # ChartContainer + 4 stacked Area
│   │       ├── cost-breakdown-table.tsx
│   │       ├── optimization-recommendations.tsx
│   │       ├── budget-alerts.tsx
│   │       ├── budget-settings.tsx
│   │       └── export-panel.tsx
│   │
│   ├── ai-architect/             # URL: /ai-architect
│   │   ├── page.tsx
│   │   └── _components/          # 4 file
│   │       ├── ai-studio.tsx
│   │       ├── prompt-panel.tsx
│   │       ├── preview-panel.tsx
│   │       └── mock-previews.ts  # Data mock, bukan komponen
│   │
│   ├── ai-reviewer/              # URL: /ai-reviewer
│   │   ├── page.tsx
│   │   └── _components/          # 16 file
│   │       ├── review-shell.tsx
│   │       ├── finding-detail-sheet.tsx
│   │       ├── types.ts
│   │       ├── mock-data-reviewer.ts
│   │       ├── dashboard/
│   │       │   ├── dashboard-view.tsx
│   │       │   ├── stats-grid.tsx
│   │       │   ├── recent-reviews-table.tsx
│   │       │   └── security-posture-banner.tsx
│   │       ├── results/
│   │       │   ├── results-view.tsx
│   │       │   ├── results-header.tsx
│   │       │   ├── results-tabs.tsx
│   │       │   ├── findings-list.tsx
│   │       │   ├── findings-filters.tsx
│   │       │   └── overview-tab.tsx
│   │       └── shared/
│   │           ├── score-badge.tsx
│   │           └── severity-badge.tsx
│   │
│   ├── gitops/                   # URL: /gitops
│   │   ├── page.tsx
│   │   └── gitops-client.tsx
│   ├── monitoring/               # URL: /monitoring
│   │   ├── page.tsx
│   │   └── monitoring-client.tsx
│   ├── error-tracking/           # URL: /error-tracking
│   │   ├── page.tsx
│   │   ├── loading.tsx           # Re-export ErrorTrackingSkeleton
│   │   ├── error-tracking-client.tsx  # Orchestrator tipis
│   │   ├── _hooks/               # 2 file
│   │   │   ├── use-errors.ts         # State, mutasi (status/assign), stats
│   │   │   └── use-error-filters.ts  # Search, project, status, severity
│   │   └── _components/          # 9 file
│   │       ├── error-header.tsx
│   │       ├── error-stats-cards.tsx
│   │       ├── error-filter-bar.tsx      # Search + 3 Select (semua shadcn)
│   │       ├── error-row.tsx            # Baris expandable (aria-expanded + aria-controls)
│   │       ├── error-empty-state.tsx
│   │       ├── error-skeleton.tsx
│   │       ├── error-status-badge.tsx
│   │       ├── error-severity-badge.tsx
│   │       └── error-assign-menu.tsx    # shadcn DropdownMenu (bukan div+button)
│   │
│   └── settings/                 # URL: /settings — 4 tab
│       ├── page.tsx
│       ├── settings-client.tsx   # Orchestrator: Tabs shell
│       ├── _hooks/               # 5 file
│       │   ├── use-profile-form.ts        # Nama + 2FA + isDirty
│       │   ├── use-api-keys.ts            # Generate / copy / revoke (crypto, bukan Math.random)
│       │   ├── use-notification-prefs.ts  # Toggle + dirty tracking
│       │   ├── use-locale-prefs.ts        # Bahasa + zona waktu
│       │   └── use-transient-flag.ts      # Flag "Tersimpan" dengan timer + cleanup
│       └── _components/          # 8 file
│           ├── settings-header.tsx
│           ├── profile-tab.tsx           # Profil + 2FA + ganti password
│           ├── api-keys-tab.tsx
│           ├── integrations-tab.tsx      # GitHub / GitLab
│           ├── preferences-tab.tsx       # Tema, notifikasi, bahasa
│           └── shared/           # 3 file
│               ├── role-permissions-card.tsx
│               ├── active-sessions-card.tsx
│               └── danger-zone-card.tsx
│
│   # ── Route Group: Cloud IDE shell (immersive, no dashboard chrome) ──
├── (ide)/
│   ├── layout.tsx                # IDE shell (full-bleed, tanpa sidebar dashboard)
│   └── projects/
│       └── [id]/
│           └── ide/              # URL: /projects/:id/ide
│               ├── page.tsx
│               ├── ide-client.tsx
│               └── _components/  # 10 file
│                   ├── ide-shell.tsx
│                   ├── ide-editor.tsx
│                   ├── ide-file-explorer.tsx
│                   ├── ide-activity-bar.tsx
│                   ├── ide-top-bar.tsx
│                   ├── ide-status-bar.tsx
│                   ├── ide-right-panel.tsx
│                   ├── ide-bottom-panel.tsx
│                   ├── ide-command-palette.tsx
│                   └── ide-deploy-dialog.tsx
```

> **Tidak ada `app/api/`.** Proyek berjalan sebagai static export (`output: "export"`)
> per `next.config.ts`, sehingga Route Handlers / Server Actions tidak tersedia.
> Lihat `INFRASTRUCTURE.md` untuk detail deployment.
>
> **Error pages.** Hanya `not-found.tsx` yang file konvensi Next.js — diprerender
> jadi `out/404.html` dan dipakai nginx lewat `error_page 404 /404.html`
> (`docker/nginx/conf.d/omnistack.conf`). `app/401/` dan `app/403/` hanyalah route
> biasa (`/401`, `/403`): static export tidak punya server yang mengembalikan status
> 401/403, jadi keduanya harus dipanggil secara eksplisit. `RouteGuard` saat ini
> mengarahkan role kurang ke `/dashboard`, bukan `/403`.
>
> **Tidak ada `(marketing)/` route group.** Landing page berada di root `app/page.tsx`,
> sedangkan `/privacy` & `/terms` adalah folder standalone.
>


**Route Groups Explained:**
- `(dashboard)` — Pages yang membutuhkan authentication & layout dashboard (Sidebar + TopNav)
- `(ide)` — Cloud IDE: layout full-bleed **tanpa** sidebar dashboard, untuk immersive editing
- Tanda kurung `()` membuat nama folder **tidak muncul di URL**

#### 📂 `components/` — React Components

```
components/
├── ui/                           # shadcn/ui primitives — 20 file, DO NOT EDIT
│   ├── accordion.tsx             # npx shadcn@latest add accordion
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx                # cva variants + buttonVariants() helper
│   ├── card.tsx
│   ├── chart.tsx                 # ChartContainer/Tooltip/Legend wrapper (Recharts 3)
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx         # Base UI — item sudah punya gap-1.5 + [&_svg]:size-4
│   ├── input.tsx                 # h-8 default
│   ├── label.tsx
│   ├── select.tsx                # Base UI — trigger punya size="sm" | "default"
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx               # Base UI sidebar primitive
│   ├── skeleton.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   └── tooltip.tsx
│
├── kpi/                          # ✅ Sistem KPI config-driven (lintas page)
│   ├── index.ts                  # Entry point — page import dari sini
│   ├── kpi-card.tsx              # 1 kartu: label, value, tren, aksen, tooltip
│   ├── kpi-card-skeleton.tsx     # Placeholder saat data belum ada
│   ├── kpi-grid.tsx              # Wrapper grid (1/2/3/4 kolom responsif)
│   └── kpi-section.tsx           # config + data + role → KpiGrid (filtering per role)
│
├── app-sidebar.tsx               # Navigasi utama (SidebarProvider)
├── top-nav.tsx                   # Top bar — search, ThemeSwitcher, user menu
├── route-guard.tsx               # Client-side role gate (ADMIN / USER / VIEWER)
├── theme-provider.tsx            # Dark/light mode (next-themes)
├── theme-switcher.tsx            # Mode + palette dropdown (dipakai top-nav)
├── palette-picker-inline.tsx     # Preview palette (dipakai settings)
├── project-status-badge.tsx      # Badge status proyek (Live/Building/Failed/Stopped)
└── deployment-status-badge.tsx   # Badge status deployment
```

> **Komponen spesifik halaman TIDAK ada di `components/`.** Semua berada di
> `_components/` di dalam folder page masing-masing (lihat `app/` breakdown di atas).
> `components/` hanya berisi komponen yang dipakai lintas halaman.

**Important:**
- ❌ **JANGAN** edit file di `components/ui/` secara manual
- ✅ Gunakan `npx shadcn@latest add <component>` untuk menambah/update
- ✅ Buat wrapper component di `components/` jika perlu customization

#### 📂 `components/ui/chart.tsx` — Chart Wrappers

Chart memakai **shadcn/ui Charts** (`npx shadcn@latest add chart`), yaitu wrapper
di atas **Recharts 3**. Wrapper ini meng centralised tiga hal:

- `ChartContainer` — `ResponsiveContainer` + `<style>` yang memaparkan
  `--color-<key>` dari `ChartConfig` ke CSS
- `ChartTooltip` / `ChartTooltipContent` — tooltip yang konsisten dengan tema
- `ChartLegend` / `ChartLegendContent` — legend yang membaca label dari config

Warna chart **tidak boleh ditulis hex di komponen**. Pakai token:

```tsx
const chartConfig = {
  compute: { label: "Compute", color: "var(--color-chart-1)" },
} satisfies ChartConfig

// di JSX
<Area dataKey="compute" fill="var(--color-chart-1)" stroke="var(--color-chart-1)" />
```

`--chart-1..5` adalah 5 warna kategorikal berjarak 72° pada hue wheel, di-anchor ke
hue palette aktif. Nilainya didefinisikan di `app/globals.css` untuk `:root`, `.dark`,
dan setiap blok `[data-palette]`, jadi mengganti palette ikut mengganti warna chart.
Jangan tambah warna chart langsung di komponen — tambah blok token di `globals.css`.

#### 📂 `lib/` — Utilities & Shared Code

```
lib/
├── utils.ts                      # cn(), formatUSD, formatBytes, dll
├── auth-context.tsx              # ✅ AuthProvider mock — hydrate dari localStorage
│                                 #   Exports: useAuth(), roleAtLeast()
├── mock-data.ts                  # ✅ Mock users/projects/deployments/audit/databases/logs
│                                 #   + helper RBAC (getMockProjectsByUser, getMockDatabasesForRole)
├── mock-finops.ts                # ✅ Data biaya/budget/alert/rekomendasi
│                                 #   + getCategoryShares, getTrendStats, summarizeAlerts, getBudgetStatus
├── mock-ide-data.ts              # ✅ Data Cloud IDE (file tree, code, terminal, AI, problems)
├── mock-errors.ts                # ✅ Data + tipe Error Tracking (TrackedError, MOCK_ERRORS)
├── error-tracking-utils.ts       # ✅ Peta tone status/severity (Tailwind, bukan hex)
├── deployment-utils.ts           # ✅ Helper deployment: getEffectiveStatus,
│                                 #   timeLabelToSecondsAgo, tipe EffectiveDeploymentStatus
│
├── settings/                     # ✅ Data + konstanta halaman Settings
│   ├── constants.ts              # PERMISSION_SUMMARY, ROLE_META, opsi bahasa/timezone/tema
│   └── mock-settings.ts          # INITIAL_API_KEYS, MOCK_SESSIONS, NotifPrefs, maskKey()
│
├── kpi/
│   ├── types.ts                  # KpiItem, KpiGridConfig, KpiTrend, KpiAccent
│   └── presets/                  # 6 config, satu per halaman
│       ├── admin.tsx
│       ├── dashboard.tsx
│       ├── deployments.tsx
│       ├── finops.tsx
│       ├── monitoring.tsx
│       └── projects.tsx
│
└── theme/                        # ✅ Color palette system
    ├── palettes.ts               # Definisi 6 palette + storage key
    └── palette-provider.tsx      # Context, persistence, atribut data-palette
```

> **Pola pemecahan `lib/`.** `mock-data.ts` sudah melewati 1100 baris dan
> menanggung users/projects/deployments/databases/logs. Modul yang punya domain
> sendiri dipisah ke fileNya sendiri, dan **tidak di-re-export** dari
> `mock-data.ts` — supaya tidak ada dua jalur import ke simbol yang sama.
> Contoh: `lib/mock-finops.ts`, `lib/mock-errors.ts`, `lib/settings/`.
> Tipe lokal (`ErrorStatus`, `EffectiveDeploymentStatus`, `DeployView`) import
> langsung dari modul pemiliknya, bukan lewat barrel.

> **Folder yang sengaja tidak ada di `lib/`:** `types/`, `validators/`, dan `services/`
> pernah dicantumkan sebagai rencana tapi tidak pernah dibuat, jadi tidak didokumentasikan
> sebagai file yang ada. `services/` baru relevan setelah ada backend. Constant yang dulu
> direncanakan di `lib/constants.ts` sekarang hidup berdampingan dengan domain-nya,
> di `lib/settings/constants.ts`.

**Catatan:** Saat ini belum ada backend. Semua data berasal dari `mock-data.ts` dengan helper role (`getMockProjectsByUser`, `roleAtLeast`) untuk data isolation per role (ADMIN/USER/VIEWER). Saat backend siap, ganti sumber data di level halaman tanpa mengubah komponen.

> **RBACOwnership:** RBAC berbasis role saja tidak cukup. Aksi tulis pada data milik user
> (edit, hapus, arsip, deploy, clone) wajib dicek `role` **dan** `userId === resource.userId`.
> Contoh implementasi: `canManageProject` di
> `app/(dashboard)/projects/project-list.tsx` dan `canWrite` di
> `app/(dashboard)/projects/[id]/project-detail-client.tsx` (audit C2).

#### 📂 `hooks/` — Custom React Hooks

```
hooks/
├── use-mobile.ts                 # ✅ Media query breakpoint helper
└── use-notice.ts                 # ✅ Notifikasi transien + auto-dismiss 3 detik
```

> **Hook page-specific TIDAK ada di `hooks/`.** Hook yang hanya dipakai satu page
> diletakkan di `app/(group)/page/_hooks/`. Saat ini ada enam folder:
> - `projects/_hooks/` — `use-projects`, `use-project-filters`, `use-project-shortcuts`
> - `admin/users/_hooks/` — `use-users`, `use-user-filters`
> - `admin/databases/_hooks/` — `use-database-filters`
> - `deployments/_hooks/` — `use-deployments`, `use-deployment-filters`, `use-deployment-modals`
> - `error-tracking/_hooks/` — `use-errors`, `use-error-filters`
> - `settings/_hooks/` — `use-profile-form`, `use-api-keys`, `use-notification-prefs`,
>   `use-locale-prefs`, `use-transient-flag`
>
> `useNotice` pernah ada di `projects/_hooks/` lalu dipromosi ke sini setelah dipakai
> dua page. Indikator pemindahan yang sama: kalau sebuah hook dipakai lintas page,
> naik ke `hooks/`.
>
> Hook filter yang punya pagination (`projects`, `admin/users`, `admin/databases`,
> `deployments`) semuanya mereset `page` **di dalam setter**, bukan lewat
> `useEffect(() => setPage(1), [deps])` — pola ini menghindari render berantai dan
> lolos rule `react-hooks/set-state-in-effect`.
>
> **Pola `useTransientFlag`.** Flag "Tersimpan"/"Tersalin" yang muncul sesaat lalu
> hilang memakai hook ini: timer disimpan di ref dan dibersihkan saat unmount.
> Pola lama `setX(true); setTimeout(() => setX(false), 2000)` memanggil `setState`
> pada komponen yang sudah tidak ada kalau user pindah halaman sebelum timer habis —
> bug yang sama berulang di `settings`, `deployments`, dan `admin/users`.

#### 📂 `public/` — Static Assets

```
public/
├── noise.svg                    # Grain/noise texture overlay
├── globe.svg
├── file.svg
├── window.svg
├── next.svg
├── vercel.svg
└── fonts/
    └── Inter-Variable.woff2     # Local variable font (self-hosted, no next/font fetch)
```

> **Favicon** berada di `app/` (App Router), bukan di `public/`: `icon.svg` (utama),
> `apple-icon.png` (touch icon iOS), `favicon.ico` (fallback legacy).

#### 📂 `docker/` & `scripts/` — Runtime & Build Tooling

```
docker/
├── nginx/
│   ├── nginx.conf                        # Config utama (user nginx, PID, temp path)
│   ├── conf.d/
│   │   └── omnistack.conf                # Server block: 404 → /404.html, TLS,
│   │                                     #   security headers, cache-control per aset
│   └── snippets/
│       └── security-headers.conf         # CSP, X-Frame-Options, HSTS, dll
└── certs/                                # TLS — git-ignored, hanya .gitkeep yang di-commit
    ├── .gitkeep
    ├── openssl.cnf                       # Config untuk gen-dev-certs.sh
    ├── fullchain.pem                     # ⚠️ hasil generate — JANGAN di-commit
    └── privkey.pem                       # ⚠️ hasil generate — JANGAN di-commit

scripts/
├── favicon.mjs                           # Baca app/icon.svg → tulis apple-icon.png + favicon.ico
└── gen-dev-certs.sh                      # Buat sertifikat self-signed untuk TLS lokal
```

> **Sertifikat tidak boleh masuk image.** `docker/certs/` di-bind-mount read-only saat
> runtime, tapi kalau ikut ter-`COPY` saat build, private key bisa dipulihkan dari
> `docker history` dan dari setiap layer build cache jauh setelah `docker rmi`.
> Karena itu `docker/certs`, `*.pem`, `*.key`, dan `*.crt` ada di `.dockerignore`
> **dan** `.gitignore` — sementara `docker/nginx/*.conf` sengaja tidak di-ignore
> karena runtime stage membacanya sebagai config default.
>
> Lihat `INFRASTRUCTURE.md` dan `README.docker.md` untuk detail deployment.

---

## 🛣️ Routing Strategy

### Route Groups Pattern

Kami menggunakan **Route Groups** untuk mengelompokkan halaman berdasarkan konteks tanpa mempengaruhi URL structure:

```
URL Structure:
/                              → app/page.tsx
/login                         → app/login/page.tsx
/register                      → app/register/page.tsx
/forgot-password               → app/forgot-password/page.tsx
/privacy                       → app/privacy/page.tsx
/terms                         → app/terms/page.tsx

/dashboard                     → app/(dashboard)/dashboard/page.tsx
/projects                      → app/(dashboard)/projects/page.tsx
/projects/:id                  → app/(dashboard)/projects/[id]/page.tsx
/projects/:id/databases        → app/(dashboard)/projects/[id]/databases/page.tsx
/projects/:id/databases/:dbId  → app/(dashboard)/projects/[id]/databases/[dbId]/page.tsx
/projects/:id/databases/:dbId/backups   → .../[dbId]/backups/page.tsx
/projects/:id/databases/:dbId/console   → .../[dbId]/console/page.tsx
/projects/:id/databases/:dbId/metrics   → .../[dbId]/metrics/page.tsx
/projects/:id/ide              → app/(ide)/projects/[id]/ide/page.tsx

/ai-architect                  → app/(dashboard)/ai-architect/page.tsx
/ai-reviewer                   → app/(dashboard)/ai-reviewer/page.tsx
/deployments                   → app/(dashboard)/deployments/page.tsx
/finops                        → app/(dashboard)/finops/page.tsx
/gitops                        → app/(dashboard)/gitops/page.tsx
/monitoring                    → app/(dashboard)/monitoring/page.tsx
/error-tracking                → app/(dashboard)/error-tracking/page.tsx
/settings                      → app/(dashboard)/settings/page.tsx
/401                           → app/401/page.tsx (route, bukan file konvensi)
/403                           → app/403/page.tsx (route, bukan file konvensi)
*tak ditemukan*               → app/not-found.tsx (file konvensi)

/admin                         → app/(dashboard)/admin/page.tsx
/admin/users                   → app/(dashboard)/admin/users/page.tsx
/admin/ai-config               → app/(dashboard)/admin/ai-config/page.tsx
/admin/audit                   → app/(dashboard)/admin/audit/page.tsx
/admin/billing                 → app/(dashboard)/admin/billing/page.tsx
/admin/databases               → app/(dashboard)/admin/databases/page.tsx
/admin/infrastructure          → app/(dashboard)/admin/infrastructure/page.tsx
/admin/settings                → app/(dashboard)/admin/settings/page.tsx
```

> **Penting:** `/` hanya dilayani oleh `app/page.tsx` (landing). Dashboard overview
> berada di `/dashboard`, bukan di root — `app/(dashboard)/page.tsx` tidak ada.
>
> **Route group `(ide)`** mewarisi `app/(ide)/layout.tsx`, bukan layout dashboard,
> sehingga `/projects/:id/ide` bisa full-bleed tanpa sidebar. Route `/projects/*`
> lainnya dilayani oleh `(dashboard)/layout.tsx`.

### Layout Hierarchy

```
app/layout.tsx (Root)
│   ├── ThemeProvider (dark/light mode)
│   ├── TooltipProvider (tooltips)
│   └── Font setup
│
├── app/(dashboard)/layout.tsx
│   │   ├── SidebarProvider
│   │   ├── AppSidebar
│   │   └── TopNav
│   │
│   ├── app/(dashboard)/dashboard/page.tsx        → /dashboard
│   ├── app/(dashboard)/projects/page.tsx         → /projects
│   ├── app/(dashboard)/projects/[id]/page.tsx    → /projects/:id
│   ├── app/(dashboard)/admin/**                  → /admin/*
│   ├── app/(dashboard)/{ai-architect,ai-reviewer}/page.tsx
│   ├── app/(dashboard)/{deployments,finops,gitops,monitoring,error-tracking}/page.tsx
│   └── app/(dashboard)/settings/page.tsx         → /settings
│
│   Route yang punya `loading.tsx` (skeleton mirror struktur akhir):
│   ├── admin/users, admin/databases
│   ├── deployments, error-tracking
│   └── projects/[id]/databases
│
│   `/settings` = satu route dengan 4 tab di dalamnya (profil / api-keys /
│   integrasi / preferensi). Tab bukan route terpisah, jadi tidak punya URL
│   sendiri dan tidak bisa di-share.
│
├── app/(ide)/layout.tsx
│   └── app/(ide)/projects/[id]/ide/page.tsx      → /projects/:id/ide
│
├── app/not-found.tsx (semua route, tanpa dashboard layout)
├── app/401/page.tsx (Standalone, no dashboard layout)
├── app/403/page.tsx (Standalone, no dashboard layout)
├── app/login/page.tsx (Standalone, no dashboard layout)
├── app/register/page.tsx (Standalone)
├── app/forgot-password/page.tsx (Standalone)
├── app/privacy/page.tsx (Standalone)
├── app/terms/page.tsx (Standalone)
└── app/page.tsx (Landing page)
```

### Dynamic Routes (Future)

```
app/
└── (dashboard)/
    └── projects/
        └── [id]/
            ├── page.tsx         # /projects/:id
            ├── settings/page.tsx  # /projects/:id/settings
            └── deployments/page.tsx  # /projects/:id/deployments
```

### Catch-All Routes (Future)

```
app/
└── docs/
    └── [...slug]/
        └── page.tsx            # /docs/intro/getting-started
```

---

## 🧩 Component Architecture

### Component Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: PAGE COMPONENTS                                    │
│  ├── LandingPage                                            │
│  ├── LoginPage                                              │
│  ├── DashboardPage                                          │
│  └── ProjectsPage                                           │
└─────────────────────────────────────────────────────────────┘
                           ▲
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: FEATURE COMPONENTS                                 │
│  ├── AppSidebar, TopNav                                     │
│  ├── ProjectCard, DeploymentList                            │
│  └── AIPromptInput, CodePreview                             │
└─────────────────────────────────────────────────────────────┘
                           ▲
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: COMPOSITE COMPONENTS                               │
│  ├── DataTable (Card + Table + Pagination)                  │
│  ├── FormField (Label + Input + Error)                      │
│  └── Modal (Dialog + Form + Buttons)                        │
└─────────────────────────────────────────────────────────────┘
                           ▲
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: UI PRIMITIVES (shadcn/ui)                          │
│  ├── Button, Input, Card, Dialog                            │
│  ├── Tabs, DropdownMenu, Avatar                             │
│  └── Badge, Separator, Tooltip                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Composition Pattern

```tsx
// ✅ GOOD: Compose from primitives
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={getStatusVariant(project.status)}>
          {project.status}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button size="sm">Deploy</Button>
      </CardFooter>
    </Card>
  )
}

// ❌ BAD: Reimplementing UI from scratch
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">{project.name}</h3>
      <p>{project.description}</p>
      <span className="px-2 py-1 bg-blue-500 text-white rounded">
        {project.status}
      </span>
      <button className="px-4 py-2 bg-black text-white rounded">
        Deploy
      </button>
    </div>
  )
}
```

### Component Decision Flowchart

```
Start: "I need a new component"
    │
    ▼
Does it exist in shadcn/ui?
    │
    ├── YES ──► Use `npx shadcn@latest add <component>`
    │           Import from `@/components/ui/<component>`
    │
    └── NO ───► Is it reusable across pages?
                    │
                    ├── YES ──► Create in `components/`
                    │           Export as named export
                    │
                    └── NO ───► Is it page-specific?
                                    │
                                    ├── YES ──► UI → `app/(group)/page/_components/`
                                    │           State/hook → `app/(group)/page/_hooks/`
                                    │
                                    └── NO ───► Reconsider: it should be reusable
```

---

## 🔄 Data Flow Patterns

### Server Components (Default)

```tsx
// app/(dashboard)/projects/page.tsx
// ✅ Server Component - runs on server, sends HTML

import { db } from "@/lib/db"

export default async function ProjectsPage() {
  // Data fetching happens on server
  const projects = await db.projects.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1>Your Projects</h1>
      <div className="grid gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

**Benefits:**
- Zero client-side JavaScript untuk data fetching
- Akses langsung ke backend resources (DB, file system)
- Automatic code splitting
- SEO friendly

### Client Components

```tsx
// app/(dashboard)/projects/_components/project-card.tsx
// ✅ Client Component - runs on browser

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async () => {
    setIsDeploying(true)
    await fetch(`/api/projects/${project.id}/deploy`, { method: "POST" })
    setIsDeploying(false)
  }

  return (
    <Card>
      <CardContent>{project.name}</CardContent>
      <Button onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? "Deploying..." : "Deploy"}
      </Button>
    </Card>
  )
}
```

**When to use "use client":**
- ✅ Menggunakan `useState`, `useEffect`, `useRef`
- ✅ Event handlers (`onClick`, `onChange`)
- ✅ Browser APIs (`window`, `localStorage`)
- ✅ Class components

### Hybrid Pattern (Recommended)

```tsx
// app/(dashboard)/projects/page.tsx (Server Component)
import { db } from "@/lib/db"
import { ProjectCard } from "@/components/project-card" // Client Component

export default async function ProjectsPage() {
  const projects = await db.projects.findMany() // Server-side fetch

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} /> // Interactive
      ))}
    </div>
  )
}
```

**Pattern:** Server component fetches data, passes ke client component sebagai props. Best of both worlds!

### Data Flow Diagram

```
┌─────────────────┐
│  User Action    │  (click, input, navigate)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  CLIENT COMPONENT                       │
│  ├── Handles UI state (useState)        │
│  ├── Event handlers                     │
│  └── Calls API / Server Actions         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  SERVER (API Route / Server Action)     │
│  ├── Validates input                    │
│  ├── Business logic                     │
│  ├── Database operations                │
│  └── Returns JSON / revalidates cache   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  CLIENT COMPONENT                       │
│  ├── Updates UI state                   │
│  ├── Shows success/error                │
│  └── Triggers re-render                 │
└─────────────────────────────────────────┘
```

---

## 🎯 State Management

### Current Strategy (Local State)

Saat ini kami menggunakan **local component state** dengan `useState` dan `useReducer`:

```tsx
// Simple state
const [isOpen, setIsOpen] = useState(false)

// Complex state
const [formState, dispatch] = useReducer(formReducer, initialState)
```

### Future Strategy (Zustand + TanStack Query)

Seiring pertumbuhan aplikasi, kami akan memperkenalkan:

#### 1. **Zustand** untuk Global UI State

```tsx
// lib/store/auth-store.ts
import { create } from "zustand"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
```

**Use cases:**
- User authentication state
- Theme preferences
- Sidebar open/closed state
- Global notifications/toasts

#### 2. **TanStack Query** untuk Server State

```tsx
// hooks/use-projects.ts
import { useQuery, useMutation } from "@tanstack/react-query"

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}
```

**Use cases:**
- API data fetching dengan caching
- Automatic background refetch
- Optimistic updates
- Loading & error states

### State Management Decision Tree

```
Where should this state live?
    │
    ├── Used in only one component?
    │   └── YES ──► useState (local)
    │
    ├── Shared between sibling components?
    │   └── YES ──► Lift state up to parent
    │
    ├── Shared across unrelated components?
    │   └── YES ──► Context or Zustand
    │
    └── Server data (API responses)?
        └── YES ──► TanStack Query / Server Components
```

---

## 🎨 Styling System

### Tech Stack

- **Tailwind CSS v4** — Utility-first CSS framework
- **shadcn/ui** — Copy-paste component library (Base UI primitives)
- **CSS Variables** — Theme tokens untuk dark/light mode
- **tailwind-merge** — Conflict resolution untuk class names
- **class-variance-authority (cva)** — Component variants

### Styling Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Component-Specific Styles                      │
│  (Inline Tailwind classes di JSX)                        │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Component Variants (cva)                       │
│  (Button variants: primary, secondary, ghost)            │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Theme Tokens (CSS Variables)                   │
│  (--primary, --background, --muted, etc.)                │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Tailwind Base (Preflight, utilities)           │
└─────────────────────────────────────────────────────────┘
```

### cn() Helper Pattern

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  "base-class p-4 rounded",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 pointer-events-none",
  className // Allow external override
)} />
```

### Theme Variables

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --border: 240 5.9% 90%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --border: 240 3.7% 15.9%;
  }
}
```

---

## ⚡ Build & Performance

### Build Tools

- **Turbopack** — Rust-based bundler (Next.js 16 default)
- **SWC** — Super-fast TypeScript/JavaScript compiler
- **Next.js Image** — Automatic image optimization
- **Next.js Font** — Font optimization (Geist)

### Performance Optimizations

#### 1. **Automatic Code Splitting**
Next.js secara otomatis split code per-route. User hanya download JavaScript untuk halaman yang dikunjungi.

#### 2. **Image Optimization**
```tsx
import Image from "next/image"

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Preload for LCP
/>
```

#### 3. **Font Optimization**
```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})
```

#### 4. **Dynamic Imports**
```tsx
import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("@/components/heavy-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only
})
```

### Bundle Analysis (Future)

```bash
# Analyze bundle size
ANALYZE=true npm run build
```

---

## 💡 Key Decisions (ADRs)

### ADR-001: Next.js App Router over Pages Router

**Status:** Accepted
**Date:** 2026-08-21

**Context:**
Next.js menyediakan dua routing systems: Pages Router (legacy) dan App Router (modern).

**Decision:**
Menggunakan **App Router** karena:
- Server Components by default
- Layout yang lebih flexible (nested layouts)
- Streaming & Suspense built-in
- Future-proof (Vercel's focus)

**Consequences:**
- ✅ Performance lebih baik dengan Server Components
- ✅ Better DX dengan nested layouts
- ❌ Learning curve untuk tim yang terbiasa Pages Router
- ❌ Beberapa library belum fully compatible

---

### ADR-002: shadcn/ui with Base UI over Radix UI

**Status:** Accepted
**Date:** 2026-08-21

**Context:**
shadcn/ui support multiple primitive libraries: Radix UI (mature), Base UI (new, RSC-friendly).

**Decision:**
Memilih **Base UI** karena:
- Lebih kompatibel dengan React Server Components
- Bundle size lebih kecil
- Designed by MUI team dengan modern patterns
- Future of headless UI libraries

**Consequences:**
- ✅ Performance lebih baik dengan RSC
- ✅ Modern API design
- ❌ Tutorial online masih banyak yang pakai Radix UI
- ❌ Beberapa edge cases belum terdokumentasi

---

### ADR-003: Route Groups untuk Layout Separation

**Status:** Accepted
**Date:** 2026-08-21

**Context:**
Butuh cara untuk memisahkan halaman yang butuh authentication (dashboard) vs halaman publik (landing, login) tanpa mempengaruhi URL.

**Decision:**
Menggunakan **Route Groups** dengan naming convention:
- `(dashboard)` untuk authenticated pages
- `(marketing)` untuk public marketing pages
- Root-level folders untuk standalone pages (login, register)

**Consequences:**
- ✅ URL structure tetap clean
- ✅ Layout inheritance yang flexible
- ✅ Easy to reason about auth boundaries
- ❌ Perlu disiplin dalam penamaan folder

---

### ADR-004: BYOC (Bring Your Own Cloud) Architecture

**Status:** Accepted
**Date:** 2026-08-20

**Context:**
Model deployment untuk PaaS: managed infrastructure (Vercel/Heroku) vs self-hosted.

**Decision:**
Menggunakan **BYOC model** di mana:
- Frontend (OmniStack UI) di-host sebagai SaaS
- User menyediakan VPS sendiri (Hetzner, AWS, DigitalOcean)
- Platform mengorkestrasi deployment ke VPS user via SSH agent

**Consequences:**
- ✅ Margin tinggi (no infrastructure cost)
- ✅ No vendor lock-in untuk user
- ✅ Data sovereignty (user owns their data)
- ❌ Kompleksitas remote agent management
- ❌ Need robust error handling untuk network issues

---

### ADR-005: TypeScript Strict Mode

**Status:** Accepted
**Date:** 2026-08-20

**Context:**
TypeScript menyediakan berbagai strictness levels.

**Decision:**
Mengaktifkan **strict mode** di `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**Consequences:**
- ✅ Catch bugs di compile time
- ✅ Better IDE autocomplete
- ✅ Self-documenting code
- ❌ Initial setup lebih lambat (lebih banyak types)
- ❌ Learning curve untuk developer baru

---

## 🚀 Future Scalability

### Phase 1: Foundation (Current)
- ✅ Landing page
- ✅ Authentication flow (mock, localStorage-based)
- ✅ Dashboard shell + overview dashboard
- ✅ Project management (CRUD + RBAC mock)
- ✅ AI Architect (WIP — prompt panel + preview panel)
- ✅ Cloud IDE di `/projects/:id/ide`
- ✅ Database management per project (backups, query console, metrics)
- ✅ Deployments + rollback + AI diagnose
- ✅ FinOps dashboard (cost trend, breakdown, budget, recommendations)
- ✅ GitOps / preview environments
- ✅ Monitoring & Error tracking
- ✅ AI Reviewer (code review + security posture)
- ✅ Admin console (users, billing, audit, AI config, infrastructure, settings)

### Phase 2: Core Features
- [ ] Freedom Stack Builder (production-grade, bukan mock)
- [ ] Backend service API (saat ini `output: "export"` — belum ada Route Handlers)
- [ ] Cloud IDE: real remote execution (terminal, file persistence)
- [ ] Git integration (GitHub, GitLab) — real webhook
- [ ] Deployment pipelines (real, bukan mock)
- [ ] Auth production (ganti `lib/auth-context.tsx` mock)

### Phase 3: Advanced Features
- [ ] Multi-node cluster management (agent-side, via SSH)
- [ ] Auto-scaling containers
- [ ] Preview environments per PR (real)
- [ ] Team collaboration (RBAC real, database-backed)
- [ ] Observability stack (Sentry, Vercel Analytics)

### Phase 4: Enterprise
- [ ] SSO (SAML / OIDC)
- [ ] Audit logs (persistent, bukan mock)
- [ ] On-premise deployment
- [ ] White-label for agencies
- [ ] API publik & SDK

### Architectural Considerations for Growth

#### 1. **Monorepo Migration**
Saat features bertambah, pertimbangkan migrasi ke monorepo (Turborepo / Nx):

```
apps/
├── web/              # Main Next.js app
├── docs/             # Documentation site
└── landing/          # Marketing site (separate)

packages/
├── ui/               # Shared components
├── config/           # Shared configs
├── types/            # Shared types
└── utils/            # Shared utilities
```

#### 2. **Microfrontends (Future)**
Jika app terlalu besar, split ke microfrontends:
- Dashboard app
- AI Architect app
- Settings app
- Shared shell app

#### 3. **Edge Functions**
Untuk low-latency operations:
- Authentication checks
- A/B testing
- Geo-routing
- Rate limiting

#### 4. **Database Scaling**
- Read replicas untuk query heavy operations
- Connection pooling (PgBouncer)
- Caching layer (Redis)

---

## 🛠️ Maintenance

### Regular Tasks

#### Daily
- Monitor error tracking (Sentry)
- Review performance metrics (Vercel Analytics)
- Check failed deployments

#### Weekly
- Update dependencies (`npm update`)
- Review bundle size trends
- Update documentation jika ada perubahan arsitektur

#### Monthly
- Security audit (`npm audit`)
- Performance review (Lighthouse scores)
- Architectural review (does current architecture still serve us?)

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update shadcn/ui components
npx shadcn@latest diff
npx shadcn@latest add button --overwrite
```

### Monitoring & Observability (Future)

```tsx
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs"

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context })
}

export function trackEvent(name: string, properties?: Record<string, any>) {
  // Analytics tracking (PostHog, Mixpanel, etc.)
}
```

### Documentation Updates

ARCHITECTURE.md ini adalah **living document**. Update saat:
- ✅ Pola arsitektur baru diadopsi
- ✅ Struktur folder berubah signifikan
- ✅ Dependencies major berubah
- ✅ Keputusan arsitektur baru dibuat (tambah ADR baru)

**Review Schedule:** Setiap quarter atau setelah major feature release.

---

## 📚 References

### Internal Documentation
- [AGENTS.md](./AGENTS.md) — AI agent guide (wajib dibaca sebelum coding)
- [DESIGN.md](./DESIGN.md) — Design system & visual language
- [CONVENTIONS.md](./CONVENTIONS.md) — Code conventions & best practices
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) — Infrastruktur, container, & deployment
- [README.docker.md](./README.docker.md) — Panduan menjalankan via Docker
- [CHANGELOG.md](./CHANGELOG.md) — Version history
- [Knowledge Graph](./docs/kg/_index.md) — Graf entitas project (`docs/kg/`)
- [README.md](./README.md) — Project overview & quick start

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Base UI Documentation](https://base-ui.com)

### Inspiration
- **Vercel Dashboard** — DX & dark mode excellence
- **Linear** — Clean UI & keyboard-first
- **Stripe** — Documentation & precision
- **Railway** — Modern PaaS design
- **Coolify** — Self-hosted PaaS patterns

---

## 🔄 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.3.0 | 2026-09-26 | OmniStack Team | Struktur detail setelah 5 refactor: `deployments/_hooks` (3) + `_components` (12), `error-tracking/_hooks` (2) + `_components` (9), `settings/_hooks` (5) + `_components` (8,incl. `shared/`), `lib/settings/`, `lib/mock-errors.ts`, `lib/deployment-utils.ts`, `lib/error-tracking-utils.ts`; pola `useTransientFlag`; daftar route yang punya `loading.tsx` |
| 1.2.0 | 2026-09-26 | OmniStack Team | Sinkronisasi struktur file: route group `(ide)`, `admin/*`, `ai-reviewer`, `databases` nested, `gitops`/`monitoring`/`error-tracking`, `docs/kg/`, `.opencode/`, `docker/`, `.github/`; hapus entri yang tidak ada (`app/api/`, `(marketing)/`, `tailwind.config.ts`); koreksi route `/` → landing, `/dashboard` → dashboard; update Phase 1 |
| 1.1.0 | 2026-08-23 | OmniStack Team | Update struktur projects (`_components/`), mock data & RBAC helpers, status Phase 1 |
| 1.0.0 | 2026-08-22 | OmniStack Team | Initial architecture documentation |

---

<div align="center">

**Architecture is the art of making complex things feel simple.**

*Questions? Suggestions? Open an issue or discuss with the architecture team.*

</div>
