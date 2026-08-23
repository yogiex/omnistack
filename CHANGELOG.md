<div align="center">

# 📋 Changelog

Semua perubahan penting pada proyek **OmniStack** didokumentasikan di file ini.

Format ini berdasarkan [Keep a Changelog](https://keepachangelog.com),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org).

**The Developer Operating System** • Any Stack. Any Cloud. Your Rules.

</div>

---

## 📌 Kategori Perubahan

- **`Added`** — Fitur baru yang ditambahkan
- **`Changed`** — Perubahan pada fitur yang sudah ada
- **`Deprecated`** — Fitur yang akan dihapus di versi mendatang
- **`Removed`** — Fitur yang sudah dihapus
- **`Fixed`** — Perbaikan bug
- **`Security`** — Perbaikan keamanan
- **`Documentation`** — Perubahan dokumentasi
- **`Performance`** — Peningkatan performa

---

## [Unreleased]

Perubahan yang sudah di-merge tapi belum di-release.

### Added
- Halaman **AI Architect** dengan Cloud IDE dan terminal simulasi (WIP)
- Integrasi **Freedom Stack Builder** untuk pemilihan tech stack
- **Preview Environments** otomatis per Pull Request
- **FinOps Dashboard** untuk tracking biaya per-aplikasi
- Multi-node cluster management UI
- **Projects Dashboard** lengkap sesuai UI/UX blueprint:
  - Stats cards (Total / Live / Building / Failed) dengan persentase
  - Project card dengan 4 state: Live (Deploy), Building (progress bar %), Failed (error message + Retry), Stopped (Start)
  - Tech stack badges per proyek dari data `stack[]`
  - View toggle Grid/List (tabel responsive dengan actions dropdown)
  - Sort (Terakhir Diupdate / Nama / Tanggal Dibuat) & pills filter status
  - Loading skeleton (`animate-pulse`) untuk initial load
  - Empty state dengan CTA "Buat Proyek Baru"
  - Keyboard shortcuts: `N` (proyek baru), `/` (fokus pencarian)
  - Pagination & role-based view dipertahankan (ADMIN/USER/VIEWER)
- Komponen page-specific di `app/(dashboard)/projects/_components/`:
  - `project-card.tsx`, `projects-table.tsx`, `filter-bar.tsx`, `projects-stats.tsx`
- Mock data diperluas: `ProjectStatus` ditambah `"failed"`, field `stack`, `url`, `lastDeployLabel`, `progress`, `errorMessage`; total 6 mock proyek mencakup semua state
- Helper `getProjectStackList()` di `lib/mock-data.ts`

### Changed
- Label status badge diperbarui: Active→Live, Deploying→Building, Inactive→Stopped, plus state baru **Failed**
- Halaman detail proyek: opsi status editor kini menyertakan "Failed"
- Refactor `project-list.tsx`: ekstraksi komponen ke `_components/`, urutan hooks dirapikan sesuai Rules of Hooks

### Planned
- [ ] Authentication real dengan NextAuth.js v5
- [ ] Integrasi AI Provider (OpenAI, Anthropic Claude)
- [ ] Database integration (PostgreSQL via Prisma)
- [ ] Real-time deployment logs via WebSocket
- [ ] GitHub/GitLab OAuth integration
- [ ] Email notifications dengan Resend
- [ ] Payment integration dengan Stripe
- [ ] Internationalization (i18n) dengan next-intl
- [ ] E2E testing dengan Playwright
- [ ] Unit testing dengan Vitest

---

## [1.0.0] - 2026-08-22

### 🎉 Initial Public Release

Release pertama OmniStack — The Developer Operating System.

### Added

#### 🌐 Landing Page (Marketing)
- **Hero Section** premium dengan:
  - Animated badge announcement (v1.0 release)
  - Gradient headline "The Developer Operating System"
  - Trust indicators (SOC2, Uptime SLA, GitOps Native)
  - Tech stack grid dengan 12+ real brand icons (React, Vue, Docker, K8s, dll)
- **Interactive Features Tabs** dengan 3 pilar utama:
  - 🤖 AI Architect — Split-screen demo dengan terminal simulasi & code preview
  - 🎨 Freedom Stack — 4 kategori teknologi (Frontend, Backend, Database, DevOps)
  - 🔄 GitOps Native — Workflow 3-step & live PR environments demo
- **Comparison Table** — OmniStack vs Vercel/Heroku vs cPanel/CyberPanel
- **Pricing Section** — 3 tier (Hobby, Pro, Enterprise) dengan model BYOC
- **FAQ Accordion** — 4 pertanyaan umum dengan jawaban detail
- **Final CTA** — Call-to-action dengan gradient background
- **Footer** — Links & copyright
- **Navbar Publik** — Responsive dengan mobile menu

#### 🔐 Authentication Flow
- **Login Page** dengan split design:
  - Sisi kiri: Branding dengan gradient glow & feature highlights
  - Sisi kanan: Form login (email/password + GitHub OAuth placeholder)
  - Responsive design (sidebar hide di mobile)
  - "Remember me" checkbox
  - Forgot password link
  - Register link

#### 📊 Dashboard Shell
- **App Sidebar** dengan navigasi:
  - Overview, Projects, Deployments
  - Git Repos, AI Architect, Settings
  - Logo OmniStack dengan icon
- **Top Navigation** dengan:
  - Sidebar trigger (mobile responsive)
  - Search bar dengan shortcut hint (`⌘K`)
  - Dark/Light mode toggle
  - Profile dropdown dengan avatar
- **Dashboard Overview** page dengan:
  - 4 stats cards (Deployments, Clusters, PRs, AI Prompts)
  - Recent deployments placeholder
  - Resource usage placeholder

#### 🎨 Design System
- **shadcn/ui** integration dengan preset Nova (Base UI primitives)
- **Dark mode** yang smooth dengan next-themes
- **Geist font** (Vercel's font family)
- **Lucide Icons** untuk UI elements
- **react-icons/si** untuk brand logos
- **CSS Variables** untuk semantic color tokens
- **Responsive design** (mobile, tablet, desktop)

#### 🏗️ Infrastructure
- **Next.js 16.3** dengan App Router & Turbopack
- **TypeScript 5** strict mode
- **Tailwind CSS v4** utility-first
- **Route Groups** pattern (`(dashboard)`, `(marketing)`)
- **Path aliases** (`@/components`, `@/lib`, dll)
- **ESLint** dengan Next.js config

#### 📚 Documentation
- **README.md** — Project overview, features, quick start, roadmap
- **AGENTS.md** — Universal guide untuk semua AI agents
- **ARCHITECTURE.md** — System design & technical blueprint
- **CONVENTIONS.md** — Code conventions & best practices
- **DESIGN.md** — Design system & visual language
- **CHANGELOG.md** — File ini 😄

### Fixed

#### 🐛 Bug Fixes
- **Base UI compatibility** — Hapus `asChild` prop yang tidak support di Base UI
- **Turbopack font loading** — Workaround untuk bug Next.js 16 font import
- **Hydration mismatch** — Tambah `suppressHydrationWarning` di root layout
- **DropdownMenu button nesting** — Gunakan `buttonVariants()` langsung, bukan `<Button>` wrapper
- **Icon imports** — Perbaiki nama icon react-icons (`SiNextdotjs`, `SiNodedotjs`, dll)
- **Accordion props** — Hapus `type="single" collapsible` yang tidak support Base UI
- **next-themes script warning** — Ignore warning karena expected behavior untuk FOUC prevention
- **Route conflict** — Hapus `app/page.tsx` agar `(dashboard)/page.tsx` yang render
- **Terminal icon import** — Tambahkan `Terminal` dan `Globe` dari lucide-react

### Performance

#### ⚡ Optimizations
- **Server Components by default** — Minimalkan client-side JavaScript
- **Turbopack** untuk dev server (10x faster dari Webpack)
- **Font optimization** via next/font
- **Image optimization** siap pakai via next/image
- **Code splitting** otomatis per-route
- **Bundle size** minimal dengan tree-shaking

### Documentation

#### 📖 Docs
- Setup comprehensive documentation suite (5 file markdown)
- Architecture Decision Records (ADRs) untuk keputusan penting
- Code conventions dengan examples konkret
- Design system dengan color tokens & typography scale
- AI agent guide untuk vibe coding workflow

---

## [0.1.0] - 2026-08-21

### 🏁 Project Initialization

Setup awal proyek OmniStack.

### Added

#### 🛠️ Foundation
- Initialize Next.js 16.3 project dengan TypeScript
- Setup Tailwind CSS v4
- Install & configure shadcn/ui dengan Base UI + Nova preset
- Install dependencies:
  - `next-themes` untuk dark mode
  - `react-icons` untuk brand logos
  - `lucide-react` untuk UI icons
  - `clsx` & `tailwind-merge` untuk `cn()` helper
- Configure path aliases (`@/`)
- Setup ESLint dengan Next.js config

#### 📁 Project Structure
- Create basic folder structure:
  - `app/` — Next.js App Router
  - `components/` — React components
  - `components/ui/` — shadcn primitives
  - `lib/` — Utilities & helpers
  - `hooks/` — Custom React hooks
  - `public/` — Static assets

#### 🎨 Theme System
- Setup dark/light mode dengan CSS variables
- Configure Tailwind theme tokens
- Setup Geist font family
- Create `theme-provider.tsx` component

#### 🧩 Core UI Components (via shadcn CLI)
- `button` — Button variants (primary, outline, ghost, destructive)
- `card` — Card, CardHeader, CardContent, CardFooter
- `input` — Form input
- `label` — Form label
- `checkbox` — Checkbox dengan label
- `dialog` — Modal dialogs
- `dropdown-menu` — Dropdown menus
- `avatar` — User avatars
- `separator` — Visual dividers
- `tooltip` — Hover tooltips
- `sidebar` — Collapsible sidebar
- `tabs` — Tab navigation
- `table` — Data tables
- `accordion` — FAQ-style accordions
- `badge` — Status badges
- `sheet` — Slide-in panels

### Documentation
- Initial README.md dengan quick start guide
- Create CLAUDE.md untuk Claude Code guidelines
- Create AGENTS.md untuk universal AI agent guide

---

## 📊 Version History Summary

| Version | Release Date | Status | Major Features |
|---------|--------------|--------|----------------|
| **Unreleased** | — | 🚧 WIP | Projects Dashboard blueprint, mock RBAC data, AI Architect (WIP), FinOps |
| **1.0.0** | 2026-08-22 | ✅ Released | Landing page, Auth, Dashboard, Docs |
| **0.1.0** | 2026-08-21 | 🏁 Initial | Project setup & foundation |
| **0.0.0** | 2026-08-20 | 💡 Concept | Idea & planning phase |

---

## 🗺️ Roadmap (High-Level)

### Q3 2026 — Foundation ✅
- [x] Project initialization
- [x] Landing page
- [x] Authentication UI
- [x] Dashboard shell
- [x] Documentation suite

### Q4 2026 — Core Features 🚧
- [ ] AI Architect real implementation
- [ ] Freedom Stack Builder UI
- [ ] Authentication backend (NextAuth.js)
- [ ] Database integration
- [ ] Project CRUD
- [ ] Deployment pipeline UI

### Q1 2027 — Infrastructure 🔮
- [ ] Multi-node cluster management
- [ ] Preview environments
- [ ] FinOps dashboard
- [ ] Real-time logs
- [ ] Team collaboration

### Q2 2027 — Enterprise 🌟
- [ ] SSO (SAML/OIDC)
- [ ] Audit logs & RBAC
- [ ] On-premise deployment
- [ ] White-label for agencies
- [ ] Public API & SDK

---

## 🔗 Links

- **Repository:** [github.com/yourusername/omnistack](#)
- **Documentation:** [docs.omnistack.dev](#)
- **Live Demo:** [demo.omnistack.dev](#)
- **Issue Tracker:** [github.com/yourusername/omnistack/issues](#)
- **Discussions:** [github.com/yourusername/omnistack/discussions](#)

---

## 📝 How to Update This File

Saat membuat perubahan, ikuti langkah ini:

### 1. Tambahkan ke Section `[Unreleased]`
```markdown
## [Unreleased]

### Added
- Your new feature here

### Fixed
- Bug fix description
```

### 2. Saat Release, Pindahkan ke Versi Baru
```markdown
## [Unreleased]
(kosongkan setelah release)

## [1.1.0] - 2026-09-15
### Added
- (pindahkan dari Unreleased)
```

### 3. Gunakan Format yang Konsisten
- ✅ "Added user authentication with OAuth"
- ❌ "added auth"
- ✅ "Fixed hydration mismatch in dark mode toggle"
- ❌ "fix bug"

### 4. Link ke Issues/PRs jika Ada
```markdown
- Added user authentication ([#42](https://github.com/...))
- Fixed login redirect loop ([#38](https://github.com/...))
```

---

## 🙏 Credits

Terima kasih kepada semua kontributor dan open-source projects yang membuat OmniStack möglich:

- **[Next.js](https://nextjs.org)** — The React Framework
- **[shadcn/ui](https://ui.shadcn.com)** — Beautiful component library
- **[Vercel](https://vercel.com)** — Hosting & Geist font
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first CSS
- **[Lucide](https://lucide.dev)** — Beautiful icons
- **[react-icons](https://react-icons.github.io/react-icons/)** — Brand logos
- **[Base UI](https://base-ui.com)** — Headless UI primitives
- **[next-themes](https://github.com/pacocoursey/next-themes)** — Theme management

---

## 📄 License

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail.

---

<div align="center">

**Built with ❤️ by developers, for developers.**

[⬆ Back to Top](#-changelog)

</div>
