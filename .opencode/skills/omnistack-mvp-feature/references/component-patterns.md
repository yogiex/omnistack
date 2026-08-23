# Component Patterns — OmniStack

Referensi pola komponen yang sudah terbukti di repo ini.
Salin pola, jangan ciptakan ulang.

## Standard Client Component (dengan loading state)

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

## Server Component Page (default)

```tsx
// app/(dashboard)/fitur/page.tsx — TANPA "use client"
import Link from "next/link"

export default function FiturPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <h1 className="text-2xl font-bold">Fitur</h1>
      {/* konten */}
    </div>
  )
}
```

## Hybrid Pattern (recommended untuk data + interaktivitas)

```tsx
// Server component fetches, passes to client component
export default async function Page() {
  const data = await fetchData()          // Server-side
  return <InteractiveComponent data={data} /> // Client-side
}
```

## Layout Patterns

```tsx
// Responsive container
<div className="container mx-auto px-4 md:px-6 max-w-7xl">

// Grid 3 kolom fitur
<div className="grid md:grid-cols-3 gap-6">
  {features.map(f => <FeatureCard key={f.id} {...f} />)}
</div>

// Split dashboard 2 kolom
<div className="grid lg:grid-cols-5 gap-4">
  <div className="lg:col-span-2">Sidebar</div>
  <div className="lg:col-span-3">Main</div>
</div>
```

## Base UI Gotcha — Tanpa asChild

Base UI tidak support `asChild` seperti Radix. Gunakan `buttonVariants()`:

```tsx
import { buttonVariants } from "@/components/ui/button"

// ❌ BAD — error di Base UI
<DropdownMenuTrigger asChild><Button>Click</Button></DropdownMenuTrigger>

// ✅ GOOD
<DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }))}>
  Click
</DropdownMenuTrigger>
```

## Import Order Convention

1. React & Next.js (`useState`, `next/link`)
2. External libraries
3. UI Components shadcn (`@/components/ui/*`)
4. Custom components (`@/components/*`, `_components/*`)
5. Hooks (`@/hooks/*`)
6. Utils (`@/lib/utils` — `cn()`)
7. Types (`type X from ...`)
8. Icons (`lucide-react`, `react-icons/si`)
