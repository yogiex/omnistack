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
├── app/                          # Next.js App Router (pages & layouts)
├── components/                   # React components
│   ├── ui/                      # shadcn/ui primitives (DO NOT EDIT)
│   └── [business components]    # Cross-page custom components
├── lib/                          # Utilities, mock data, auth context
├── hooks/                        # Custom React hooks
├── public/                       # Static assets (svg, local fonts)
├── docs/                         # Documentation
│   └── kg/                       # Knowledge graph (ontology + nodes)
├── docker/                       # Runtime container config
│   └── nginx.conf
├── .github/
│   └── workflows/deploy.yml      # CI: static export → GitHub Pages
├── .opencode/                    # Agent context engineering
│   ├── agent/                    # Sub-agents (mvp-implementer, code-reviewer, kg-curator)
│   ├── command/                  # Slash commands (/mvp, /kg)
│   ├── skills/                   # On-demand skills + scripts
│   └── memory/                   # todo.md, decisions.md, errors.md
├── .next/                        # Build output (git-ignored)
├── node_modules/                 # Dependencies (git-ignored)
├── components.json               # shadcn/ui configuration
├── next.config.ts                # Next.js configuration (output: "export")
├── postcss.config.mjs            # PostCSS (Tailwind v4 — no tailwind.config.ts)
├── eslint.config.mjs             # ESLint flat config
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
├── Dockerfile                    # Multi-stage build → nginx-unprivileged
├── docker-compose.yml            # Local container orchestration
├── .dockerignore                 # Docker build context exclusions
├── .env.example                  # Environment variable template
├── AGENTS.md                     # AI agent guide (wajib dibaca)
├── CLAUDE.md                     # Claude-specific agent notes
├── ARCHITECTURE.md               # This file
├── CONVENTIONS.md                # Code conventions
├── DESIGN.md                     # Design system
├── INFRASTRUCTURE.md             # Infrastruktur & deployment
├── CHANGELOG.md                  # Version history
├── README.docker.md              # Panduan menjalankan via Docker
└── README.md                     # Project overview
```

> **Catatan Tailwind v4:** tidak ada `tailwind.config.ts`. Konfigurasi Tailwind
> (theme tokens, plugin, `@source`) ditulis inline di `app/globals.css` melalui
> directive `@theme` / `@plugin` / `@source`.

### Detailed Breakdown

#### 📂 `app/` — Next.js App Router

Struktur ini mengikuti konvensi Next.js 13+ dengan App Router:

```
app/
├── layout.tsx                    # Root layout (ThemeProvider, PaletteProvider, TooltipProvider, font)
├── page.tsx                      # Landing page (URL: /)
├── globals.css                   # Global styles + Tailwind v4 @theme tokens + blok palette
├── icon.svg                      # Favicon SVG (App Router — preferred, scalable)
├── apple-icon.png                # Apple touch icon (180×180)
├── favicon.ico                   # Fallback legacy ICO
│
│   # ── Route Group: Authenticated pages (AppSidebar + TopNav) ──
├── (dashboard)/
│   ├── layout.tsx                # Dashboard shell (Sidebar + TopNav)
│   │
│   ├── dashboard/                # ✅ Overview dashboard
│   │   ├── page.tsx              # URL: /dashboard
│   │   └── client-dashboard.tsx  # Client component utama
│   │
│   ├── projects/                 # ✅ Project management (CRUD lengkap)
│   │   ├── page.tsx              # URL: /projects (shell statis)
│   │   ├── project-list.tsx      # Client orchestrator (RBAC + handlers + render)
│   │   ├── project-form-sheet.tsx
│   │   ├── _hooks/               # ✅ Hooks page-specific
│   │   │   ├── use-projects.ts           # State proyek + mutasi (create/clone/transfer/…)
│   │   │   ├── use-project-filters.ts    # Search, filter, sort, pagination
│   │   │   ├── use-project-shortcuts.ts  # Keyboard: N = buat, / = fokus search
│   │   │   └── use-notice.ts             # Notifikasi transien + auto-dismiss
│   │   ├── _components/          # Page-specific components (13 files)
│   │   │   ├── project-card.tsx          # Card grid + tipe ManagedProject
│   │   │   ├── projects-table.tsx        # Tampilan list
│   │   │   ├── project-actions-menu.tsx
│   │   │   ├── filter-bar.tsx            # Search, sort, owner filter, view toggle
│   │   │   ├── projects-header.tsx       # Judul + CTA per role
│   │   │   ├── projects-notice.tsx       # Toast in-line
│   │   │   ├── projects-pagination.tsx
│   │   │   ├── projects-skeleton.tsx
│   │   │   ├── projects-empty-none.tsx
│   │   │   ├── projects-empty-filtered.tsx
│   │   │   └── transfer-ownership-sheet.tsx  # Sheet ADMIN (shadcn Select)
│   │   └── [id]/                 # URL: /projects/:id
│   │       ├── page.tsx
│   │       ├── project-detail-client.tsx   # canWrite = role AND owner (audit C2)
│   │       ├── logs/              # ✅ Log streaming + AI log analyzer
│   │       │   ├── page.tsx, loading.tsx
│   │       │   ├── logs-client.tsx
│   │       │   └── _components/  # log-stream, ai-log-analyzer, metrics-panel, log-filters
│   │       └── databases/        # ✅ Database per project
│   │           ├── page.tsx              # URL: /projects/:id/databases
│   │           ├── databases-client.tsx
│   │           ├── loading.tsx
│   │           ├── _components/          # 8 files (5 dialogs + card/filters/stats/empty)
│   │           └── [dbId]/                # URL: /projects/:id/databases/:dbId
│   │               ├── page.tsx          # Database overview
│   │               ├── _components/
│   │               │   ├── backup-manager.tsx
│   │               │   ├── database-metrics.tsx
│   │               │   └── query-console.tsx
│   │               ├── backups/page.tsx         # .../:dbId/backups
│   │               ├── console/page.tsx         # .../:dbId/console
│   │               └── metrics/page.tsx         # .../:dbId/metrics
│   │
│   ├── admin/                    # ✅ Admin console (role-gated)
│   │   ├── page.tsx              # URL: /admin (overview)
│   │   ├── admin-overview.tsx    # Z-pattern shell (KPI → focal → bottom bar)
│   │   ├── _components/          # recent-activity, role-distribution,
│   │   │                         # system-health, alerts-panel
│   │   ├── users/                # URL: /admin/users
│   │   │   ├── page.tsx, loading.tsx
│   │   │   ├── users-page-client.tsx
│   │   │   ├── user-form-sheet.tsx
│   │   │   └── _components/      # role-badge, stats-grid, invite/delete dialog, empty-state
│   │   ├── ai-config/            # URL: /admin/ai-config
│   │   ├── audit/                # URL: /admin/audit
│   │   ├── billing/              # URL: /admin/billing
│   │   ├── databases/            # URL: /admin/databases (cluster-wide)
│   │   ├── infrastructure/       # URL: /admin/infrastructure
│   │   └── settings/             # URL: /admin/settings
│   │
│   ├── ai-architect/             # ✅ AI Prompt Engineer
│   │   ├── page.tsx              # URL: /ai-architect
│   │   └── _components/          # ai-studio, prompt-panel, preview-panel, mock-previews.ts
│   │
│   ├── ai-reviewer/              # ✅ AI code review + security posture
│   │   ├── page.tsx              # URL: /ai-reviewer
│   │   └── _components/          # review-shell, finding-detail-sheet, types.ts
│   │       ├── mock-data-reviewer.ts
│   │       ├── dashboard/        # dashboard-view, stats-grid, recent-reviews-table, banner
│   │       ├── results/          # results-view/header/tabs, findings-list/filters, overview-tab
│   │       └── shared/           # score-badge, severity-badge
│   │
│   ├── deployments/              # ✅ Deployment history + actions
│   │   ├── page.tsx              # URL: /deployments
│   │   ├── deployments-list.tsx
│   │   └── _components/          # 8 files (table, filters, stats, new/rollback/detail/AI-diagnose)
│   │
│   ├── finops/                   # ✅ Cost tracking
│   │   ├── page.tsx              # URL: /finops
│   │   ├── finops-client.tsx     # Orchestrator (RBAC filter + Z-pattern sections)
│   │   └── _components/          # 9 files
│   │       ├── finops-header.tsx            # Judul, subtitle per role, link alert, export
│   │       ├── critical-alert-banner.tsx    # Banner kritis (border-l, tanpa dismiss)
│   │       ├── infra-breakdown-strip.tsx    # Strip kategori infrastruktur
│   │       ├── cost-trend-chart.tsx
│   │       ├── cost-breakdown-table.tsx
│   │       ├── optimization-recommendations.tsx
│   │       ├── budget-alerts.tsx
│   │       ├── budget-settings.tsx
│   │       └── export-panel.tsx
│   │
│   ├── gitops/                   # ✅ GitOps / PR preview environments
│   │   ├── page.tsx              # URL: /gitops
│   │   └── gitops-client.tsx
│   │
│   ├── monitoring/               # ✅ Metrics & uptime monitoring
│   │   ├── page.tsx              # URL: /monitoring
│   │   └── monitoring-client.tsx
│   │
│   ├── error-tracking/           # ✅ Error tracking
│   │   ├── page.tsx              # URL: /error-tracking
│   │   └── error-tracking-client.tsx
│   │
│   └── settings/                 # ✅ User settings
│       ├── page.tsx              # URL: /settings
│       └── settings-client.tsx
│
│   # ── Route Group: Cloud IDE shell (immersive, no dashboard chrome) ──
├── (ide)/
│   ├── layout.tsx                # IDE shell layout (full-bleed)
│   └── projects/
│       └── [id]/
│           └── ide/              # URL: /projects/:id/ide
│               ├── page.tsx
│               ├── ide-client.tsx
│               └── _components/  # 10 files (shell, editor, explorer, activity-bar,
│                                  #  top-bar, status-bar, right-panel, bottom-panel,
│                                  #  command-palette, deploy-dialog)
│
│   # ── Standalone public pages (no dashboard layout) ──
├── not-found.tsx                 # URL: */404 (file konvensi → out/404.html)
├── 401/                          # URL: /401 (route biasa, bukan file konvensi)
│   └── page.tsx                  # Countdown auto-redirect ke /login, bisa dibatalkan
├── 403/                          # URL: /403 (route biasa, bukan file konvensi)
│   └── page.tsx                  # Panel "Request Access" (mailto + copy email)
├── login/                        # URL: /login
│   └── page.tsx
├── register/                     # URL: /register
│   └── page.tsx
├── forgot-password/              # URL: /forgot-password
│   └── page.tsx
├── privacy/                      # URL: /privacy
│   └── page.tsx
└── terms/                        # URL: /terms
    └── page.tsx
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
├── ui/                           # shadcn/ui primitives (20 files)
│   ├── accordion.tsx             # npx shadcn@latest add accordion
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── chart.tsx                 # ChartContainer/Tooltip/Legend wrapper (Recharts)
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx               # Base UI sidebar primitive
│   ├── skeleton.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   └── tooltip.tsx
│
├── kpi/                          # ✅ Sistem KPI config-driven (reusable lintas page)
│   ├── index.ts                  # Entry point — page import dari sini
│   ├── kpi-card.tsx
│   ├── kpi-card-skeleton.tsx
│   ├── kpi-grid.tsx
│   └── kpi-section.tsx           # Config + data + role → grid (filtering per role)
│
├── app-sidebar.tsx               # Main navigation sidebar
├── top-nav.tsx                   # Top navigation bar
├── theme-provider.tsx            # Dark/light mode wrapper (next-themes)
├── theme-switcher.tsx            # Mode + color palette dropdown (top-nav)
├── palette-picker-inline.tsx     # Preview palette (dipakai di settings)
├── route-guard.tsx               # Client-side role gate (ADMIN / USER / VIEWER)
├── project-status-badge.tsx      # Badge status proyek (Live/Building/Failed/Stopped)
├── deployment-status-badge.tsx   # Badge status deployment
│
└── [future components]
    ├── deployment-status.tsx    # Real-time deployment status
    ├── ai-prompt-input.tsx      # AI Architect input
    └── code-preview.tsx         # Live code preview
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
├── utils.ts                     # Helper functions (cn, formatUSD, dll)
├── auth-context.tsx             # ✅ Auth context mock (localStorage-based)
├── mock-data.ts                 # ✅ Mock users/projects/deployments/audit + RBAC helpers
├── mock-ide-data.ts             # ✅ Mock Cloud IDE data (file tree, code, terminal, AI, problems)
├── mock-finops.ts               # ✅ Data biaya/budget/alert/rekomendasi + helper
│
├── kpi/                         # ✅ Sistem KPI config-driven
│   ├── types.ts                 # KpiItem, KpiGridConfig, KpiTrend, KpiAccent
│   └── presets/                 # 6 config per halaman
│       ├── admin.tsx
│       ├── dashboard.tsx
│       ├── deployments.tsx
│       ├── finops.tsx
│       ├── monitoring.tsx
│       └── projects.tsx
│
├── theme/                       # ✅ Color palette system
│   ├── palettes.ts              # Definisi palette + storage key
│   └── palette-provider.tsx     # Context, persistence, atribut data-palette
│
├── constants.ts                 # (planned — belum ada)
├── types/                       # TypeScript type definitions (future)
│
├── validators/                  # Zod schemas (future)
│   ├── auth.ts
│   └── project.ts
│
└── services/                    # API clients (future)
    ├── api.ts                   # Base API client
    ├── projects.ts              # Project service
    └── auth.ts                  # Auth service
```

**Catatan:** Saat ini belum ada backend. Semua data berasal dari `mock-data.ts` dengan helper role (`getMockProjectsByUser`, `roleAtLeast`) untuk data isolation per role (ADMIN/USER/VIEWER). Saat backend siap, ganti sumber data di level halaman tanpa mengubah komponen.

> **RBACOwnership:** RBAC berbasis role saja tidak cukup. Aksi tulis pada data milik user
> (edit, hapus, arsip, deploy, clone) wajib dicek `role` **dan** `userId === resource.userId`.
> Contoh implementasi: `canManageProject` di `projects/project-list.tsx` dan `canWrite`
> di `projects/[id]/project-detail-client.tsx` (audit C2).

#### 📂 `hooks/` — Custom React Hooks

```
hooks/
├── use-mobile.ts                # ✅ Media query breakpoint helper
│
├── use-debounce.ts              # (future) Debounce input values
├── use-media-query.ts           # (future) Responsive breakpoints
├── use-click-outside.ts         # (future) Click outside detection
├── use-auth.ts                  # (future) Authentication
└── use-deployment.ts            # (future) Deployment state
```

> **Hook page-specific TIDAK ada di `hooks/`.** Hook yang hanya dipakai satu page
> diletakkan di `app/(group)/page/_hooks/` — contoh: `projects/_hooks/`
> (`use-projects`, `use-project-filters`, `use-project-shortcuts`, `use-notice`).
> `hooks/` hanya berisi hook yang dipakai lintas halaman.

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
// components/project-card.tsx
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
| 1.2.0 | 2026-09-26 | OmniStack Team | Sinkronisasi struktur file: route group `(ide)`, `admin/*`, `ai-reviewer`, `databases` nested, `gitops`/`monitoring`/`error-tracking`, `docs/kg/`, `.opencode/`, `docker/`, `.github/`; hapus entri yang tidak ada (`app/api/`, `(marketing)/`, `tailwind.config.ts`); koreksi route `/` → landing, `/dashboard` → dashboard; update Phase 1 |
| 1.1.0 | 2026-08-23 | OmniStack Team | Update struktur projects (`_components/`), mock data & RBAC helpers, status Phase 1 |
| 1.0.0 | 2026-08-22 | OmniStack Team | Initial architecture documentation |

---

<div align="center">

**Architecture is the art of making complex things feel simple.**

*Questions? Suggestions? Open an issue or discuss with the architecture team.*

</div>
