# 🤖 AGENTS.md — AI Agent Guide for OmniStack

> **Universal guide** for all AI coding assistants (Claude, Cursor, GitHub Copilot, Codex, Gemini, Cline, Aider, etc.) working on this codebase.

**Last updated:** 2026-08-22  
**Project:** OmniStack — The Developer Operating System (PaaS)  
**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI)

---

## 📖 Quick Context

OmniStack adalah **Platform as a Service (PaaS)** modern yang memposisikan diri sebagai "Developer Operating System". Fitur utamanya:

- 🤖 **AI Architect** — Generate aplikasi dari prompt natural language
- 🎨 **Freedom Stack Builder** — Bebas pilih bahasa & library (React, Vue, Go, Rust, dll)
- 🔄 **GitOps Native** — Preview environments otomatis per Pull Request
- 📊 **FinOps Dashboard** — Tracking biaya per-aplikasi real-time
- 🌐 **Multi-Node Cluster** — Orchestration container di banyak VPS

**Target users:** Software engineers, startup founders, software houses.

---

## 🛠️ Tech Stack (Current)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js (App Router, Turbopack) | 16.3.x | Server Components default |
| **Language** | TypeScript | 5.x | Strict mode enabled |
| **Styling** | Tailwind CSS | v4 | Utility-first |
| **UI Library** | shadcn/ui | latest | Base UI primitives (bukan Radix UI!) |
| **Icons** | Lucide React + react-icons/si | latest | Lucide untuk UI, react-icons untuk brand logos |
| **Font** | Geist (via next/font) | — | Vercel's font |
| **Theme** | next-themes | latest | Dark/light mode |
| **State** | React hooks (useState/useReducer) | — | Zustand planned for future |
| **Package Manager** | npm | 10.x | — |

---

## 📁 Project Structure

```
omnistack/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (ThemeProvider, TooltipProvider)
│   ├── page.tsx                 # Landing page (marketing)
│   ├── globals.css              # Global styles + theme tokens
│   │
│   ├── (dashboard)/             # Route group — authenticated pages
│   │   ├── layout.tsx           # Dashboard shell (Sidebar + TopNav)
│   │   └── page.tsx             # Dashboard overview
│   │
│   ├── login/
│   │   └── page.tsx             # Login page (standalone, no dashboard layout)
│   │
│   └── api/                     # API routes (future)
│
├── components/
│   ├── ui/                      # ⚠️ shadcn/ui — JANGAN EDIT MANUAL
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sidebar.tsx
│   │   └── ... (other primitives)
│   │
│   ├── app-sidebar.tsx          # Main sidebar
│   ├── top-nav.tsx              # Top navigation bar
│   └── theme-provider.tsx       # Dark/light mode provider
│
├── lib/
│   ├── utils.ts                 # `cn()` helper & utilities
│   ├── types/                   # TypeScript type definitions
│   └── constants.ts             # Global constants
│
├── hooks/                       # Custom React hooks
│
├── public/                      # Static assets (images, fonts)
│
├── components.json              # shadcn/ui config
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎯 Critical Rules (WAJIB DIBACA)

### ✅ DO

1. **Gunakan Server Components secara default**
   ```tsx
   // ✅ Server Component (default, no "use client")
   export default async function ProjectsPage() {
     const data = await fetchData()
     return <div>{data}</div>
   }
   ```

2. **Hanya gunakan `"use client"` jika PERLU**
   - Butuh hooks (`useState`, `useEffect`, `useRef`)
   - Butuh event handlers (`onClick`, `onChange`)
   - Butuh browser APIs (`window`, `localStorage`)

3. **Gunakan `cn()` untuk conditional classes**
   ```tsx
   import { cn } from "@/lib/utils"
   
   <div className={cn(
     "base-class",
     isActive && "active-class",
     className
   )} />
   ```

4. **Import dengan `@/` path alias**
   ```tsx
   // ✅ GOOD
   import { Button } from "@/components/ui/button"
   
   // ❌ BAD
   import { Button } from "../../../components/ui/button"
   ```

5. **Gunakan named exports**
   ```tsx
   // ✅ GOOD
   export function ProjectCard() { }
   
   // ❌ BAD
   export default function ProjectCard() { }
   ```

6. **Gunakan semantic color tokens**
   ```tsx
   // ✅ GOOD — adaptif light/dark
   <div className="bg-background text-foreground" />
   <div className="bg-muted text-muted-foreground" />
   
   // ❌ BAD — hard-coded
   <div className="bg-white text-black" />
   ```

7. **Gunakan `next/link` untuk navigasi internal**
   ```tsx
   import Link from "next/link"
   <Link href="/projects">Projects</Link>
   ```

8. **Selalu sertakan `suppressHydrationWarning` di `<html>` dan `<body>`** (sudah di-setup di root layout)

### ❌ DON'T

1. **JANGAN edit file di `components/ui/` secara manual**
   - File-file ini di-generate oleh shadcn CLI
   - Jika perlu custom, buat wrapper di `components/`
   ```bash
   # Cara yang benar menambah/update komponen:
   npx shadcn@latest add button
   npx shadcn@latest add card dialog
   ```

2. **JANGAN gunakan `asChild` di Base UI components**
   - Base UI (yang kita pakai) tidak support `asChild` seperti Radix UI
   - Gunakan `buttonVariants()` langsung untuk styling
   ```tsx
   // ❌ BAD — akan error
   <DropdownMenuTrigger asChild>
     <Button>Click</Button>
   </DropdownMenuTrigger>
   
   // ✅ GOOD
   <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }))}>
     Click
   </DropdownMenuTrigger>
   ```

3. **JANGAN hardcode warna hex di Tailwind classes**
   ```tsx
   // ❌ BAD
   <div className="bg-[#ff0000]" />
   
   // ✅ GOOD
   <div className="bg-destructive" />
   ```

4. **JANGAN gunakan inline styles untuk styling statis**
   ```tsx
   // ❌ BAD
   <div style={{ padding: "16px", backgroundColor: "red" }} />
   
   // ✅ GOOD
   <div className="p-4 bg-destructive" />
   ```

5. **JANGAN gunakan `<a>` tag untuk navigasi internal**
   ```tsx
   // ❌ BAD — full page reload
   <a href="/projects">Projects</a>
   
   // ✅ GOOD — client-side navigation
   <Link href="/projects">Projects</Link>
   ```

6. **JANGAN lupa `key` prop saat mapping array**
   ```tsx
   {items.map(item => (
     <ItemCard key={item.id} item={item} />
   ))}
   ```

7. **JANGAN gunakan `any` type**
   ```tsx
   // ❌ BAD
   function process(data: any) { }
   
   // ✅ GOOD
   function process(data: unknown) { }
   function process(data: Project) { }
   ```

---

## 🎨 Component Patterns

### Standard Component Template

```tsx
"use client" // HANYA jika butuh interaktivitas

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface MyComponentProps {
  title: string
  onSubmit?: () => Promise<void>
  className?: string
}

export function MyComponent({ title, onSubmit, className }: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!onSubmit) return
    setIsLoading(true)
    try {
      await onSubmit()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("rounded-xl border p-6", className)}>
      <h3 className="text-lg font-bold">{title}</h3>
      <Button onClick={handleSubmit} disabled={isLoading} className="mt-4">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </div>
  )
}
```

### Button with Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Deploying..." : "Deploy"}
</Button>
```

### Responsive Container

```tsx
<div className="container mx-auto px-4 md:px-6 max-w-7xl">
  {/* content */}
</div>
```

### Grid Layouts

```tsx
{/* 3-col feature grid */}
<div className="grid md:grid-cols-3 gap-6">
  {features.map(f => <FeatureCard key={f.id} {...f} />)}
</div>

{/* 2-col dashboard split */}
<div className="grid lg:grid-cols-5 gap-4">
  <div className="lg:col-span-2">Sidebar</div>
  <div className="lg:col-span-3">Main content</div>
</div>
```

---

## 🔧 Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack, hot reload)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# shadcn/ui
npx shadcn@latest add button          # Add single component
npx shadcn@latest add card dialog     # Add multiple
npx shadcn@latest diff                # Check for updates
npx shadcn@latest init                # Re-initialize (rarely needed)

# Dependencies
npm install <package>                 # Install package
npm install -D <package>              # Install dev dependency
npm update                            # Update all packages
npm audit                             # Security audit

# Git
git add .
git commit -m "feat(scope): message"  # Conventional Commits
git push origin <branch>
```

---

## 🎨 Styling Guidelines

### Color Tokens (gunakan ini, bukan hex!)

| Token | Usage |
|-------|-------|
| `bg-background` / `text-foreground` | Default page colors |
| `bg-muted` / `text-muted-foreground` | Secondary content |
| `bg-primary` / `text-primary-foreground` | Primary actions |
| `bg-accent` / `text-accent-foreground` | Highlights |
| `bg-destructive` / `text-destructive-foreground` | Errors, delete actions |
| `border-border` | Default borders |

### Spacing Scale (4px base)

```
p-1  (4px)   — tight
p-2  (8px)   — compact
p-3  (12px)  — small
p-4  (16px)  — standard
p-6  (24px)  — comfortable
p-8  (32px)  — spacious
p-12 (48px)  — section padding
```

### Dark Mode

Gunakan CSS variables — mereka otomatis adaptif light/dark.

```tsx
// ✅ Auto dark mode
<div className="bg-background text-foreground border-border" />

// ✅ Jika perlu explicit
<div className="bg-white dark:bg-zinc-900" />
```

---

## 📦 Import Order (gunakan urutan ini)

```tsx
// 1. React & Next.js
import { useState, useEffect } from "react"
import Link from "next/link"

// 2. External libraries
import { useForm } from "react-hook-form"

// 3. UI Components (shadcn)
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 4. Custom components
import { ProjectCard } from "@/components/project-card"

// 5. Hooks
import { useDebounce } from "@/hooks/use-debounce"

// 6. Utils & helpers
import { cn } from "@/lib/utils"

// 7. Types
import type { Project } from "@/lib/types"

// 8. Icons
import { Loader2, Plus } from "lucide-react"
import { SiReact } from "react-icons/si"
```

---

## 🔄 Data Flow

### Server Component (untuk data fetching)

```tsx
// app/projects/page.tsx
async function getProjects() {
  const res = await fetch("https://api.example.com/projects", {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectList projects={projects} />
}
```

### Client Component (untuk interaktivitas)

```tsx
"use client"

import { useState } from "react"

export function LikeButton({ projectId }: { projectId: string }) {
  const [liked, setLiked] = useState(false)
  
  return (
    <Button onClick={() => setLiked(!liked)}>
      {liked ? "❤️" : "🤍"} Like
    </Button>
  )
}
```

### Hybrid Pattern (Recommended)

```tsx
// Server component fetches, passes to client component
export default async function Page() {
  const data = await fetchData() // Server-side
  return <InteractiveComponent data={data} /> // Client-side
}
```

---

## ⚠️ Known Issues & Gotchas

### 1. Base UI vs Radix UI
Proyek ini menggunakan **Base UI** (bukan Radix UI). Perbedaan utama:
- ❌ Tidak ada `asChild` prop
- ❌ Styling via `className` langsung, bukan wrapper
- ✅ Lebih compatible dengan React Server Components

### 2. next-themes + Turbopack
Muncul warning "Encountered a script tag" di dev mode. **Ignore saja** — ini expected behavior untuk mencegah FOUC (Flash of Unstyled Content). Tidak muncul di production.

### 3. Font Loading di Next.js 16
Ada bug internal Next.js 16 dengan Turbopack saat menggunakan `next/font/google`. Solusi: gunakan class `font-sans` dari Tailwind yang sudah di-setup shadcn.

### 4. react-icons Import Names
Beberapa icon memiliki nama unik:
- `SiNextdotjs` (bukan `SiNextjs`)
- `SiNodedotjs` (bukan `SiNodejs`)
- `SiVuedotjs` (bukan `SiVue`)
- `SiNuxtdotjs` (jika tersedia di versi Anda)

Jika error "not defined", ganti dengan icon yang pasti ada atau gunakan Lucide sebagai fallback.

### 5. Route Groups `(folder-name)`
Folder dengan tanda kurung **tidak muncul di URL**. Gunakan untuk memisahkan layout tanpa mempengaruhi routing.

```
app/(dashboard)/projects/page.tsx  →  URL: /projects
app/(marketing)/about/page.tsx     →  URL: /about
```

---

## 📝 Commit Convention (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation
- `style` — formatting (no code change)
- `refactor` — code change (no feat/fix)
- `perf` — performance
- `test` — add/fix tests
- `chore` — maintenance, deps
- `ci` — CI/CD

**Contoh:**
```
feat(dashboard): add AI Architect page with split-screen layout

fix(sidebar): resolve hydration mismatch in dark mode

docs: update README with installation steps

refactor(auth): simplify login flow
```

---

## 🧪 Testing (Future)

Saat ini belum ada test suite. Jika ditambahkan:

```bash
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

Framework yang direkomendasikan: **Vitest + React Testing Library + Playwright (E2E)**.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview & quick start |
| `ARCHITECTURE.md` | System design & technical blueprint |
| `CONVENTIONS.md` | Code conventions (lebih detail) |
| `DESIGN.md` | Design system & visual language |
| `AGENTS.md` | **This file** — AI agent guide |
| `CLAUDE.md` | Claude-specific guidelines |

---

## 🎯 When Making Changes

### Before coding, ask yourself:
1. Apakah ini Server Component atau Client Component?
2. Apakah saya perlu edit file di `components/ui/`? (seharusnya tidak)
3. Apakah saya menggunakan semantic color tokens?
4. Apakah import path pakai `@/` alias?
5. Apakah sudah support dark mode?

### Before committing:
1. Apakah sudah `npm run build` tanpa error?
2. Apakah sudah test di light & dark mode?
3. Apakah commit message mengikuti Conventional Commits?
4. Apakah perlu update dokumentasi (ARCHITECTURE.md, CONVENTIONS.md)?

---

## 🆘 Getting Help

### Documentation
- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind: https://tailwindcss.com/docs
- Base UI: https://base-ui.com

### Project-specific
- Lihat `ARCHITECTURE.md` untuk keputusan arsitektur
- Lihat `CONVENTIONS.md` untuk detail code patterns
- Lihat `DESIGN.md` untuk visual language

---

## 🤝 For AI Agents Specifically

**Jika Anda adalah AI agent (Claude, Cursor, Copilot, dll):**

1. **Selalu baca file ini dulu** sebelum membuat perubahan
2. **Prioritaskan Server Components** untuk halaman baru
3. **Jangan pernah edit** file di `components/ui/` — gunakan CLI
4. **Hindari `asChild`** — Base UI tidak support itu
5. **Gunakan `cn()` helper** untuk conditional classes
6. **Test di dark mode** jika mengubah styling
7. **Jelaskan reasoning** Anda saat membuat keputusan arsitektur
8. **Tanyakan jika ragu** — lebih baik bertanya daripada salah asumsi

**Output yang diharapkan:**
- Kode yang production-ready
- TypeScript yang properly typed (no `any`)
- Styling yang responsive & dark-mode-friendly
- Commit messages yang descriptive
- Dokumentasi update jika perlu

---

<div align="center">

**Happy coding! 🚀**

*File ini adalah living document — update saat pola baru ditemukan atau dependencies berubah.*

</div>
