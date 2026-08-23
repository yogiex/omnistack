# 📏 OmniStack Code Conventions

> Panduan standar penulisan kode untuk konsistensi, maintainability, dan kolaborasi yang efektif di proyek OmniStack.

**Target Pembaca:** Developer, AI Agents (Claude, Cursor, Copilot), Code Reviewer

---

## 📋 Daftar Isi

1. [Prinsip Umum](#-prinsip-umum)
2. [File & Folder Naming](#-file--folder-naming)
3. [Component Structure](#-component-structure)
4. [TypeScript Conventions](#-typescript-conventions)
5. [Next.js Patterns](#-nextjs-patterns)
6. [shadcn/ui Usage](#-shadcnui-usage)
7. [Styling & Tailwind](#-styling--tailwind)
8. [State Management](#-state-management)
9. [Data Fetching](#-data-fetching)
10. [Error Handling](#-error-handling)
11. [Import Order](#-import-order)
12. [Git & Commit Messages](#-git--commit-messages)
13. [Anti-Patterns](#-anti-patterns)
14. [Quick Reference](#-quick-reference)

---

## 🎯 Prinsip Umum

### 1. **Readability Over Cleverness**
Kode yang mudah dibaca lebih berharga daripada kode yang "pintar" tapi sulit dipahami.

### 2. **Explicit Over Implicit**
Lebih baik kode yang verbose tapi jelas, daripada singkat tapi ambigu.

### 3. **Small Functions, Single Responsibility**
Satu fungsi = satu tugas. Jika fungsi > 30 baris, pertimbangkan untuk memecahnya.

### 4. **Fail Fast, Fail Loud**
Validasi input di awal. Jangan biarkan error tersembunyi sampai runtime jauh.

### 5. **Types Are Documentation**
TypeScript type yang baik mengurangi kebutuhan komentar.

---

## 📁 File & Folder Naming

### Pages (App Router)

| Type | Pattern | Contoh |
|------|---------|--------|
| Page | `page.tsx` | `app/page.tsx` |
| Layout | `layout.tsx` | `app/layout.tsx` |
| Loading | `loading.tsx` | `app/projects/loading.tsx` |
| Error | `error.tsx` | `app/projects/error.tsx` |
| Not Found | `not-found.tsx` | `app/not-found.tsx` |

### Components

| Type | Pattern | Contoh |
|------|---------|--------|
| UI Components | `kebab-case.tsx` | `components/ui/button.tsx` |
| Business Components | `kebab-case.tsx` | `components/app-sidebar.tsx` |
| Page-specific | `PascalCase.tsx` | `app/(dashboard)/page.tsx` |

### Utilities & Helpers

| Type | Pattern | Contoh |
|------|---------|--------|
| Utils | `camelCase.ts` | `lib/utils.ts`, `lib/format-date.ts` |
| Types | `PascalCase.ts` | `lib/types/user.ts` |
| Constants | `UPPER_SNAKE_CASE.ts` | `lib/constants.ts` |

### Hooks

| Pattern | Contoh |
|---------|--------|
| `use` + `PascalCase` | `hooks/use-debounce.ts`, `hooks/use-auth.ts` |

### Folder Structure

```
omnistack/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Route group (tidak muncul di URL)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui (JANGAN EDIT MANUAL)
│   ├── app-sidebar.tsx          # Custom components
│   ├── top-nav.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── utils.ts                 # Helper `cn()` dan lainnya
│   ├── types/                   # Type definitions
│   └── constants.ts
├── hooks/                       # Custom React hooks
└── public/                      # Static assets
```

---

## 🧩 Component Structure

### Standard Component Template

```tsx
"use client" // HANYA jika komponen butuh interaktivitas/hook

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

// 1. TYPES
interface ProjectCardProps {
  title: string
  description?: string
  onDeploy?: () => Promise<void>
  className?: string
}

// 2. COMPONENT
export function ProjectCard({ 
  title, 
  description, 
  onDeploy,
  className 
}: ProjectCardProps) {
  // 3. HOOKS (di paling atas)
  const [isLoading, setIsLoading] = useState(false)

  // 4. HANDLERS
  const handleDeploy = async () => {
    if (!onDeploy) return
    setIsLoading(true)
    try {
      await onDeploy()
    } finally {
      setIsLoading(false)
    }
  }

  // 5. RENDER
  return (
    <div className={cn(
      "rounded-xl border bg-background p-6",
      className
    )}>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <Button 
        onClick={handleDeploy}
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Deploy
      </Button>
    </div>
  )
}
```

### Component Rules

✅ **DO:**
- Gunakan **named exports** (`export function ComponentName`)
- Props interface di dalam file yang sama (kecuali reused)
- Destructure props di parameter fungsi
- Gunakan `cn()` untuk conditional classes
- Selalu sertakan `className` prop untuk fleksibilitas styling

❌ **DON'T:**
- Default export (sulit di-refactor, tidak tree-shakeable)
- Inline style object (kecuali benar-benar dinamis)
- Props yang terlalu banyak (> 7 props, pertimbangkan grouping)
- Mutasi props langsung

---

## 🔷 TypeScript Conventions

### Type vs Interface

```tsx
// ✅ Interface untuk objek/component props
interface User {
  id: string
  name: string
  email: string
}

interface ButtonProps {
  variant: "primary" | "secondary"
  onClick: () => void
}

// ✅ Type untuk unions, primitives, utilities
type Status = "pending" | "active" | "archived"
type ID = string | number
type Nullable<T> = T | null
```

### Naming Types

```tsx
// Props: PascalCase + "Props"
interface UserCardProps { }

// Response/DTO: PascalCase + "Response"
interface CreateUserResponse { }

// Enum-like: PascalCase
type UserRole = "admin" | "user" | "guest"

// Generics: single uppercase letter atau descriptive
type Result<T> = { data: T; error: null } | { data: null; error: Error }
```

### Strict Rules

```tsx
// ✅ Explicit return types untuk public functions
export function formatDate(date: Date): string {
  return date.toISOString()
}

// ❌ Hindari `any`
function process(data: any) { } // ❌
function process(data: unknown) { } // ✅

// ✅ Type assertions dengan hati-hati
const user = data as User // Hanya jika yakin 100%

// ✅ Type guards untuk narrowing
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "id" in obj
}
```

### Null & Undefined

```tsx
// ✅ Gunakan optional chaining
const userName = user?.profile?.name

// ✅ Nullish coalescing untuk default
const count = data.count ?? 0

// ✅ Type narrowing dengan if
if (user) {
  console.log(user.name) // user sudah non-null
}
```

---

## ⚡ Next.js Patterns

### Server vs Client Components

```tsx
// ✅ SERVER COMPONENT (default) - untuk data fetching, SEO
export default async function ProjectsPage() {
  const projects = await fetchProjects() // Server-side
  
  return (
    <div>
      <h1>Projects</h1>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

// ✅ CLIENT COMPONENT - untuk interaktivitas
"use client"

export function ProjectCard({ project }) {
  const [liked, setLiked] = useState(false) // Hook = harus client
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? "❤️" : "🤍"} {project.name}
    </button>
  )
}
```

### When to Use "use client"

✅ Gunakan `"use client"` jika komponen:
- Menggunakan hooks (`useState`, `useEffect`, `useRef`, dll)
- Menggunakan event listeners (`onClick`, `onChange`, dll)
- Menggunakan browser APIs (`window`, `localStorage`, dll)
- Menggunakan class components

❌ **JANGAN** gunakan `"use client"` jika komponen:
- Hanya menampilkan data statis
- Hanya melakukan data fetching
- Tidak ada interaktivitas

### Route Groups

```
app/
├── (dashboard)/           # Tidak muncul di URL
│   ├── layout.tsx         # Layout khusus dashboard
│   ├── projects/page.tsx  # URL: /projects
│   └── settings/page.tsx  # URL: /settings
├── (marketing)/
│   ├── layout.tsx         # Layout khusus marketing
│   ├── about/page.tsx     # URL: /about
│   └── pricing/page.tsx   # URL: /pricing
└── login/page.tsx         # URL: /login (tanpa layout dashboard)
```

### Metadata

```tsx
// Static metadata
export const metadata: Metadata = {
  title: "OmniStack - Dashboard",
  description: "Manage your deployments",
}

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await getProject(params.id)
  return {
    title: project.name,
    description: project.description,
  }
}
```

### Navigation

```tsx
// ✅ Gunakan next/link untuk navigasi internal
import Link from "next/link"

<Link href="/projects">Projects</Link>

// ✅ Gunakan useRouter untuk programmatic navigation
import { useRouter } from "next/navigation"

const router = useRouter()
router.push("/dashboard")
router.replace("/login") // Replace history

// ❌ JANGAN gunakan <a> tag atau window.location
<a href="/projects">Projects</a> // ❌ Full page reload
```

---

## 🎨 shadcn/ui Usage

### Adding Components

```bash
# Selalu gunakan CLI, JANGAN copy manual
npx shadcn@latest add button
npx shadcn@latest add dialog card
```

### DO NOT Edit UI Components

```tsx
// ❌ JANGAN edit file di components/ui/ langsung
// components/ui/button.tsx - BIARKAN ASLI

// ✅ Buat wrapper jika butuh custom behavior
// components/primary-button.tsx
import { Button } from "@/components/ui/button"

export function PrimaryButton({ children, ...props }) {
  return (
    <Button size="lg" className="bg-primary text-primary-foreground" {...props}>
      {children}
    </Button>
  )
}
```

### Common Patterns

```tsx
// Button dengan loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Deploying..." : "Deploy"}
</Button>

// Dialog dengan form
<Dialog>
  <DialogTrigger asChild>
    <Button>Create Project</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogDescription>
        Fill in the details below.
      </DialogDescription>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>

// Form dengan react-hook-form + zod
<form onSubmit={form.handleSubmit(onSubmit)}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="you@example.com" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</form>
```

---

## 🎨 Styling & Tailwind

### Class Ordering (Prettier Plugin)

Urutan class yang disarankan:

```tsx
<div className="[layout] [display] [flex/grid] [spacing] [sizing] [typography] [visual] [misc]">

// Contoh konkret
<div className="
  flex items-center justify-between    // layout & flex
  gap-4 p-6                            // spacing
  w-full max-w-md                      // sizing
  text-sm font-medium                  // typography
  rounded-xl border bg-background      // visual
  hover:shadow-lg transition-shadow    // misc/interactive
">
```

### Conditional Classes dengan `cn()`

```tsx
import { cn } from "@/lib/utils"

// ✅ Gunakan cn() untuk conditional classes
<div className={cn(
  "rounded-xl border p-6",
  isActive && "border-primary bg-primary/5",
  isDisabled && "opacity-50 pointer-events-none",
  className // Allow override dari parent
)} />

// ❌ JANGAN gunakan template literal untuk conditional
<div className={`rounded-xl border p-6 ${isActive ? "border-primary" : ""}`} />
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  p-4           // Mobile (default)
  md:p-6        // Tablet (768px+)
  lg:p-8        // Desktop (1024px+)
  xl:p-10       // Large desktop (1280px+)
">

// Hide/show berdasarkan breakpoint
<div className="hidden md:block">Hanya di tablet ke atas</div>
<div className="block md:hidden">Hanya di mobile</div>
```

### Dark Mode

```tsx
// Gunakan variant dark:
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">

// Lebih baik: gunakan semantic tokens
<div className="bg-background text-foreground">
<div className="bg-muted text-muted-foreground">
```

### Spacing Scale

```tsx
// Gunakan spacing scale Tailwind yang konsisten
p-1  // 4px   - sangat kecil
p-2  // 8px   - kecil
p-3  // 12px  - compact
p-4  // 16px  - standard
p-6  // 24px  - comfortable
p-8  // 32px  - spacious
p-12 // 48px  - section padding
```

---

## 🔄 State Management

### Local State (useState)

```tsx
// ✅ Untuk UI state sederhana
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)

// ✅ Function update untuk state yang bergantung pada previous
setCount(prev => prev + 1)
```

### Complex State (useReducer)

```tsx
// ✅ Untuk state kompleks dengan banyak update
type State = {
  projects: Project[]
  isLoading: boolean
  error: Error | null
}

type Action = 
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Project[] }
  | { type: "FETCH_ERROR"; payload: Error }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null }
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, projects: action.payload }
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload }
  }
}

const [state, dispatch] = useReducer(reducer, initialState)
```

### Global State (Zustand - Future)

```tsx
// lib/store.ts
import { create } from "zustand"

interface AuthStore {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// Usage
const { user, logout } = useAuthStore()
```

### Server State (TanStack Query - Future)

```tsx
// Untuk data fetching dengan caching, refetching, dll
const { data, isLoading, error } = useQuery({
  queryKey: ["projects"],
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000, // 5 menit
})
```

---

## 🌐 Data Fetching

### Server Components (Recommended)

```tsx
// app/projects/page.tsx
async function getProjects() {
  const res = await fetch("https://api.example.com/projects", {
    cache: "no-store", // Untuk data real-time
    // cache: "force-cache", // Untuk data statis
    // next: { revalidate: 3600 }, // ISR: revalidate tiap jam
  })
  
  if (!res.ok) throw new Error("Failed to fetch projects")
  
  return res.json()
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### Client Components

```tsx
"use client"

import { useEffect, useState } from "react"

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects")
        const data = await res.json()
        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  if (isLoading) return <LoadingSpinner />
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### API Routes

```tsx
// app/api/projects/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const projects = await db.projects.findMany()
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = await db.projects.create({ data: body })
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 400 }
    )
  }
}
```

---

## 🚨 Error Handling

### Error Boundaries

```tsx
// app/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()} className="mt-4">
        Try again
      </Button>
    </div>
  )
}
```

### Try-Catch Pattern

```tsx
// ✅ Selalu handle error di async functions
async function deployProject(projectId: string) {
  try {
    const response = await fetch(`/api/projects/${projectId}/deploy`, {
      method: "POST",
    })
    
    if (!response.ok) {
      throw new Error(`Deploy failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    // Log ke error tracking service (Sentry, dll)
    console.error("Deploy error:", error)
    
    // Tampilkan user-friendly message
    toast.error("Failed to deploy project. Please try again.")
    
    // Re-throw jika perlu ditangani parent
    throw error
  }
}
```

### Form Validation

```tsx
// ✅ Gunakan zod untuk validasi
import { z } from "zod"

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  framework: z.enum(["nextjs", "vite", "astro"]),
})

type ProjectFormData = z.infer<typeof projectSchema>

// Di component
const form = useForm<ProjectFormData>({
  resolver: zodResolver(projectSchema),
})
```

---

## 📦 Import Order

Urutan import yang konsisten (gunakan Prettier plugin):

```tsx
// 1. React & Next.js
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// 2. External libraries
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// 3. UI Components (shadcn)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

// 4. Custom components
import { ProjectCard } from "@/components/project-card"
import { AppSidebar } from "@/components/app-sidebar"

// 5. Hooks
import { useDebounce } from "@/hooks/use-debounce"
import { useAuth } from "@/hooks/use-auth"

// 6. Utils & helpers
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format-date"

// 7. Types
import type { Project } from "@/lib/types"
import type { Metadata } from "next"

// 8. Icons
import { Loader2, Plus, Settings } from "lucide-react"
import { SiReact, SiDocker } from "react-icons/si"

// 9. Assets (jika ada)
import logo from "@/public/logo.svg"
```

---

## 🔀 Git & Commit Messages

### Branch Naming

```bash
# Format: <type>/<short-description>
feature/ai-architect-page
fix/sidebar-mobile-responsive
refactor/auth-flow
docs/update-readme
```

### Commit Message Format

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Fitur baru
- `fix`: Bug fix
- `docs`: Dokumentasi
- `style`: Formatting, semicolon, dll (no code change)
- `refactor`: Code change yang bukan feat/fix
- `perf`: Performance improvement
- `test`: Menambah/memperbaiki test
- `chore`: Maintenance, dependencies
- `ci`: CI/CD configuration

**Contoh:**

```bash
feat(dashboard): add AI Architect page with split-screen layout

- Implement prompt input with syntax highlighting
- Add terminal simulation with progress steps
- Include code preview with file tabs
- Responsive design for mobile/tablet/desktop

Closes #42
```

```bash
fix(sidebar): resolve hydration mismatch in dark mode

Add mounted state check to prevent SSR/client mismatch
when using next-themes.

Fixes #38
```

---

## ⚠️ Anti-Patterns

### ❌ Hindari Hal-Hal Berikut

```tsx
// 1. Inline styles (kecuali benar-benar dinamis)
<div style={{ padding: "16px", backgroundColor: "red" }}> // ❌
<div className="p-4 bg-red-500"> // ✅

// 2. Magic numbers
setTimeout(() => { }, 3000) // ❌ Apa itu 3000?
const DEBOUNCE_DELAY = 3000
setTimeout(() => { }, DEBOUNCE_DELAY) // ✅

// 3. Nested ternary
value >= 0 ? value <= 10 ? "low" : "high" : "negative" // ❌

// Gunakan if statement atau extract ke function
function getStatus(value: number) {
  if (value < 0) return "negative"
  if (value <= 10) return "low"
  return "high"
} // ✅

// 4. Prop drilling berlebihan
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data}> // ❌
      <GreatGrandChild data={data}>

// Gunakan Context, Composition, atau state management

// 5. useEffect tanpa dependency array
useEffect(() => {
  fetchData()
}) // ❌ Jalan di setiap render

useEffect(() => {
  fetchData()
}, []) // ✅ Hanya sekali saat mount

// 6. Mutasi state langsung
state.user.name = "John" // ❌
setState({ ...state, user: { ...state.user, name: "John" } }) // ✅

// 7. console.log di production
console.log("debug:", data) // ❌
// Gunakan proper logging atau hapus sebelum commit

// 8. Unused variables
const unused = 5 // ❌ Hapus jika tidak dipakai

// 9. Hardcoded strings (untuk i18n future)
<h1>Welcome to OmniStack</h1> // ❌ (untuk app multilingual)
// Gunakan i18n library nanti

// 10. Business logic di component
function ProjectCard({ project }) {
  // ❌ Business logic tidak boleh di component
  const tax = project.price * 0.11
  const discount = calculateDiscount(project.category)
  
  // ✅ Pindahkan ke utils/service
  const finalPrice = calculateFinalPrice(project)
}
```

---

## 📚 Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# shadcn/ui
npx shadcn@latest add <component>     # Add component
npx shadcn@latest add button card     # Add multiple
npx shadcn@latest diff                # Check for updates

# Git
git add .
git commit -m "feat(scope): message"
git push origin feature/branch-name
```

### Useful Snippets

```tsx
// cn() helper usage
import { cn } from "@/lib/utils"
<div className={cn("base-class", condition && "conditional-class", className)} />

// Loading button
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>

// Responsive container
<div className="container mx-auto px-4 md:px-6 max-w-7xl">

// Dark mode aware
<div className="bg-background text-foreground dark:bg-zinc-900">

// Safe array mapping
{items?.map(item => <Item key={item.id} />)}
{items && items.length > 0 && <List items={items} />}

// Form with react-hook-form
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "", email: "" },
})
```

### File Templates

**New Page Template:**
```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Title - OmniStack",
  description: "Page description",
}

export default function PageName() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Page Title</h1>
    </div>
  )
}
```

**New Component Template:**
```tsx
"use client"

import { cn } from "@/lib/utils"

interface ComponentNameProps {
  className?: string
  children?: React.ReactNode
}

export function ComponentName({ className, children }: ComponentNameProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}
```

**New Hook Template:**
```tsx
import { useState, useEffect } from "react"

export function useHookName() {
  const [state, setState] = useState()
  
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    }
  }, [])
  
  return { state, setState }
}
```

---

## 🔄 Updates & Maintenance

Dokumen ini adalah **living document**. Update saat:
- Pola baru ditemukan dan disepakati tim
- Teknologi/dependencies berubah
- Best practices industri berkembang

**Last Updated:** 2026-08-22  
**Maintained by:** OmniStack Team

---

<div align="center">

*Konsistensi adalah kunci kode yang maintainable. Happy coding! 🚀*

</div>

