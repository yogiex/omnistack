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
│   └── [business components]    # Custom components
├── lib/                          # Utilities, types, constants
├── hooks/                        # Custom React hooks
├── public/                       # Static assets (images, fonts)
├── .next/                        # Build output (git-ignored)
├── node_modules/                 # Dependencies (git-ignored)
├── components.json               # shadcn/ui configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
├── ARCHITECTURE.md               # This file
├── CONVENTIONS.md                # Code conventions
├── DESIGN.md                     # Design system
└── README.md                     # Project overview
```

### Detailed Breakdown

#### 📂 `app/` — Next.js App Router

Struktur ini mengikuti konvensi Next.js 13+ dengan App Router:

```
app/
├── layout.tsx                    # Root layout (global)
├── page.tsx                      # Landing page (URL: /)
├── globals.css                   # Global styles + Tailwind directives
│
├── (dashboard)/                  # Route Group: Authenticated pages
│   ├── layout.tsx               # Dashboard shell (Sidebar + TopNav)
│   ├── page.tsx                 # Dashboard overview (URL: /)
│   ├── projects/                # Future: Project management
│   │   ├── page.tsx             # URL: /projects
│   │   └── [id]/page.tsx        # URL: /projects/:id
│   ├── ai-architect/            # Future: AI Prompt Engineer
│   │   └── page.tsx             # URL: /ai-architect
│   └── settings/                # Future: User settings
│       └── page.tsx             # URL: /settings
│
├── (marketing)/                  # Route Group: Public pages (future)
│   ├── about/page.tsx           # URL: /about
│   └── pricing/page.tsx         # URL: /pricing
│
├── login/                        # Authentication
│   └── page.tsx                 # URL: /login (no dashboard layout)
│
├── register/                     # Future: Registration
│   └── page.tsx
│
├── api/                          # API Routes (Route Handlers)
│   ├── auth/                    # Auth endpoints
│   ├── projects/                # Project CRUD
│   └── deploy/                  # Deployment triggers
│
├── not-found.tsx                 # Custom 404 page
├── error.tsx                     # Global error boundary
├── loading.tsx                   # Global loading UI
└── sitemap.ts                    # SEO sitemap (future)
```

**Route Groups Explained:**
- `(dashboard)` — Pages yang membutuhkan authentication & layout dashboard
- `(marketing)` — Pages publik dengan layout marketing
- Tanda kurung `()` membuat nama folder **tidak muncul di URL**

#### 📂 `components/` — React Components

```
components/
├── ui/                           # shadcn/ui primitives
│   ├── button.tsx               # Generated by `npx shadcn add button`
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── tabs.tsx
│   ├── sidebar.tsx
│   └── ... (other primitives)
│
├── app-sidebar.tsx              # Main navigation sidebar
├── top-nav.tsx                  # Top navigation bar
├── theme-provider.tsx           # Dark/light mode wrapper
│
└── [future components]
    ├── project-card.tsx         # Project display card
    ├── deployment-status.tsx    # Real-time deployment status
    ├── ai-prompt-input.tsx      # AI Architect input
    └── code-preview.tsx         # Live code preview
```

**Important:** 
- ❌ **JANGAN** edit file di `components/ui/` secara manual
- ✅ Gunakan `npx shadcn@latest add <component>` untuk menambah/update
- ✅ Buat wrapper component di `components/` jika perlu customization

#### 📂 `lib/` — Utilities & Shared Code

```
lib/
├── utils.ts                     # Helper functions (cn, formatDate, etc.)
├── constants.ts                 # Global constants
│
├── types/                       # TypeScript type definitions
│   ├── user.ts                  # User-related types
│   ├── project.ts               # Project-related types
│   ├── deployment.ts            # Deployment-related types
│   └── api.ts                   # API response types
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

#### 📂 `hooks/` — Custom React Hooks

```
hooks/
├── use-debounce.ts              # Debounce input values
├── use-media-query.ts           # Responsive breakpoints
├── use-click-outside.ts         # Click outside detection
├── use-auth.ts                  # Authentication (future)
└── use-deployment.ts            # Deployment state (future)
```

#### 📂 `public/` — Static Assets

```
public/
├── favicon.ico                  # Site favicon
├── og-image.png                 # Open Graph image
├── logo.svg                     # Company logo
└── avatars/                     # User avatar placeholders
    └── 01.png
```

---

## 🛣️ Routing Strategy

### Route Groups Pattern

Kami menggunakan **Route Groups** untuk mengelompokkan halaman berdasarkan konteks tanpa mempengaruhi URL structure:

```
URL Structure:
/                              → app/(dashboard)/page.tsx
/projects                      → app/(dashboard)/projects/page.tsx
/projects/123                  → app/(dashboard)/projects/[id]/page.tsx
/ai-architect                  → app/(dashboard)/ai-architect/page.tsx
/settings                      → app/(dashboard)/settings/page.tsx
/login                         → app/login/page.tsx
```

### Layout Hierarchy

```
app/layout.tsx (Root)
│   ├── ThemeProvider (dark/light mode)
│   ├── TooltipProvider (tooltips)
│   └── Font setup (Geist)
│
├── app/(dashboard)/layout.tsx
│   │   ├── SidebarProvider
│   │   ├── AppSidebar
│   │   └── TopNav
│   │
│   ├── app/(dashboard)/page.tsx (Dashboard Overview)
│   ├── app/(dashboard)/projects/page.tsx
│   └── app/(dashboard)/settings/page.tsx
│
├── app/login/page.tsx (Standalone, no dashboard layout)
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
                                    ├── YES ──► Create inside page folder
                                    │           Or in `app/(group)/_components/`
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
- ✅ Authentication flow
- ✅ Dashboard shell
- 🔄 AI Architect page
- 🔄 Project management

### Phase 2: Core Features
- [ ] Freedom Stack Builder
- [ ] Cloud IDE integration
- [ ] Git integration (GitHub, GitLab)
- [ ] Deployment pipelines
- [ ] Logs & monitoring dashboard

### Phase 3: Advanced Features
- [ ] Multi-node cluster management
- [ ] Auto-scaling containers
- [ ] Preview environments per PR
- [ ] FinOps cost tracking
- [ ] Team collaboration (RBAC)

### Phase 4: Enterprise
- [ ] SSO (SAML / OIDC)
- [ ] Audit logs
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
- [DESIGN.md](./DESIGN.md) — Design system & visual language
- [CONVENTIONS.md](./CONVENTIONS.md) — Code conventions & best practices
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
| 1.0.0 | 2026-08-22 | OmniStack Team | Initial architecture documentation |

---

<div align="center">

**Architecture is the art of making complex things feel simple.**

*Questions? Suggestions? Open an issue or discuss with the architecture team.*

</div>
