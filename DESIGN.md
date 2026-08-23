<div align="center">

# 🎨 OmniStack Design System

### Design Guidelines & Visual Language

**Any Stack. Any Cloud. Your Rules.**

*Dokumen ini mendefinisikan prinsip desain, pola visual, dan pedoman estetika untuk OmniStack — The Developer Operating System.*

</div>

---

## 📖 Daftar Isi

1. [Filosofi Desain](#-filosofi-desain)
2. [Prinsip Inti](#-prinsip-inti)
3. [Sistem Warna](#-sistem-warna)
4. [Tipografi](#-tipografi)
5. [Spacing & Layout](#️-spacing--layout)
6. [Komponen UI](#-komponen-ui)
7. [Iconography](#-iconography)
8. [Motion & Animasi](#-motion--animasi)
9. [Dark Mode Strategy](#-dark-mode-strategy)
10. [Aksesibilitas](#-aksesibilitas)
11. [Brand Elements](#-brand-elements)

---

## 🧭 Filosofi Desain

OmniStack dirancang untuk **developer**, oleh developer. Setiap keputusan desain diambil dengan mempertimbangkan:

### 1. **Clarity Over Decoration**
- Informasi harus langsung terbaca tanpa gangguan visual yang tidak perlu
- White space adalah fitur, bukan kekosongan
- Hierarchy visual yang jelas untuk navigasi cepat

### 2. **Density dengan Purpose**
- Developer tools membutuhkan informasi padat (logs, code, metrics)
- Namun kepadatan harus tetap breathable dan scannable
- Progressive disclosure: tampilkan info kompleks hanya saat dibutuhkan

### 3. **Professional Yet Approachable**
- Tidak intimidating seperti terminal mentah
- Tidak terlalu playful seperti aplikasi consumer
- Sweet spot: modern SaaS premium (seperti Linear, Vercel, Stripe)

### 4. **Performance First**
- Setiap animasi harus memiliki tujuan (feedback, orientation, delight)
- Hindari animasi dekoratif yang memperlambat workflow developer
- Instant feedback untuk setiap interaksi

---

## 🎯 Prinsip Inti

### 🎨 **Intentional**
Setiap piksel, spacing, dan warna memiliki alasan. Tidak ada elemen "sekadar cantik".

### ⚡ **Responsive**
Dari 320px hingga 4K monitor, layout harus tetap fungsional dan estetis.

### 🌗 **Adaptive**
Dark mode bukan sekadar "inverse colors" — ia memiliki palet, contrast, dan depth sendiri.

### 🧩 **Consistent**
Pola yang sama digunakan di seluruh aplikasi. Belajar sekali, gunakan di mana saja.

### 🔍 **Scannable**
Developer bekerja cepat. UI harus bisa di-scan dalam 1-2 detik untuk menemukan info kritis.

---

## 🎨 Sistem Warna

OmniStack menggunakan **semantic color tokens** yang adaptif antara light & dark mode.

### Primary Palette

```css
/* Primary - Identitas utama OmniStack */
--primary: 240 5.9% 10%;        /* Light mode: Near black */
--primary-foreground: 0 0% 98%; /* White text on primary */

/* Dark mode override */
.dark {
  --primary: 0 0% 98%;          /* White */
  --primary-foreground: 240 5.9% 10%;
}
```

### Semantic Colors

| Token | Penggunaan | Light Mode | Dark Mode |
|---|---|---|---|
| `--background` | Background aplikasi | `0 0% 100%` | `240 10% 3.9%` |
| `--foreground` | Text utama | `240 10% 3.9%` | `0 0% 98%` |
| `--muted` | Konten sekunder | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--accent` | Highlight interaktif | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--destructive` | Error, delete | `0 84.2% 60.2%` | `0 62.8% 30.6%` |
| `--border` | Garis pembatas | `240 5.9% 90%` | `240 3.7% 15.9%` |
| `--ring` | Focus state | `240 5.9% 10%` | `240 4.9% 83.9%` |

### Accent Colors (Feature-Specific)

Digunakan untuk membedakan fitur utama secara visual:

```css
/* AI Architect - Purple (Intelligence) */
--ai-primary: #8B5CF6;
--ai-glow: rgba(139, 92, 246, 0.2);

/* Freedom Stack - Blue/Purple Gradient */
--stack-gradient: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);

/* GitOps Native - Green/Emerald */
--gitops-gradient: linear-gradient(135deg, #10B981 0%, #059669 100%);

/* Success/Deploy */
--success: #10B981;
--success-bg: rgba(16, 185, 129, 0.1);

/* Warning/Building */
--warning: #F59E0B;
--warning-bg: rgba(245, 158, 11, 0.1);

/* Info/Processing */
--info: #3B82F6;
--info-bg: rgba(59, 130, 246, 0.1);
```

### Color Usage Guidelines

✅ **DO:**
- Gunakan warna semantic tokens, bukan hex hardcoded
- Primary untuk CTA utama
- Muted untuk text sekunder dan placeholder
- Destructive hanya untuk aksi berbahaya (delete, reset)

❌ **DON'T:**
- Menggunakan lebih dari 2 accent colors dalam satu view
- Menggunakan warna saturated untuk background besar
- Mengandalkan warna saja untuk convey information (aksesibilitas)

---

## 📝 Tipografi

OmniStack menggunakan **Geist** sebagai font family utama — dibuat oleh Vercel, dioptimalkan untuk developer tools.

### Font Stack

```css
/* Sans-serif (UI text) */
--font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (code, terminal, technical content) */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Level | Size | Line Height | Weight | Penggunaan |
|---|---|---|---|---|
| **Display** | 48-72px | 1.1 | Bold | Hero headings |
| **H1** | 36-48px | 1.2 | Bold | Page titles |
| **H2** | 24-30px | 1.3 | Semibold | Section headers |
| **H3** | 20-24px | 1.4 | Semibold | Card titles |
| **H4** | 16-18px | 1.5 | Medium | Subsections |
| **Body** | 14-16px | 1.6 | Regular | Default text |
| **Small** | 12-14px | 1.5 | Regular | Metadata, labels |
| **Code** | 13px | 1.5 | Regular | Inline code |

### Typography Guidelines

✅ **Best Practices:**
- **Letter spacing**: -0.02em untuk headings besar (tighter), 0 untuk body
- **Paragraph max-width**: 65-75 karakter untuk readability
- **Font weight hierarchy**: Gunakan weight untuk hierarchy, bukan hanya size
- **Code snippets**: Selalu gunakan font mono dengan background subtle

### Example Usage

```tsx
<h1 className="text-4xl font-bold tracking-tight">
  Dashboard Overview
</h1>

<p className="text-muted-foreground leading-relaxed max-w-2xl">
  Deskripsi yang menjelaskan konteks halaman dengan jelas.
</p>

<code className="font-mono text-sm bg-muted px-2 py-1 rounded">
  npm run deploy
</code>
```

---

## 📐 Spacing & Layout

### Spacing Scale

OmniStack menggunakan **4px base unit** untuk semua spacing:

```css
--space-1: 4px;   /* 0.25rem */
--space-2: 8px;   /* 0.5rem */
--space-3: 12px;  /* 0.75rem */
--space-4: 16px;  /* 1rem */
--space-5: 20px;  /* 1.25rem */
--space-6: 24px;  /* 1.5rem */
--space-8: 32px;  /* 2rem */
--space-10: 40px; /* 2.5rem */
--space-12: 48px; /* 3rem */
--space-16: 64px; /* 4rem */
--space-20: 80px; /* 5rem */
```

### Layout Patterns

#### 1. **Container Widths**

```tsx
// Default container
<div className="container mx-auto px-4 md:px-6 max-w-7xl">

// Narrow content (forms, articles)
<div className="max-w-2xl mx-auto">

// Wide dashboard
<div className="max-w-[1600px] mx-auto">
```

#### 2. **Grid Systems**

```tsx
// 2-column split (common for dashboard)
<div className="grid lg:grid-cols-5 gap-4">
  <div className="lg:col-span-2">Sidebar</div>
  <div className="lg:col-span-3">Main content</div>
</div>

// 3-column feature grid
<div className="grid md:grid-cols-3 gap-6">
  {features.map(feature => <FeatureCard />)}
</div>

// 4-column stats
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map(stat => <StatCard />)}
</div>
```

#### 3. **Spacing Between Sections**

```tsx
// Section padding
<section className="py-20 md:py-32">

// Card padding
<div className="p-6 md:p-8">

// Form field spacing
<div className="space-y-4">
  <FormField />
  <FormField />
</div>
```

### Breakpoints

| Breakpoint | Width | Usage |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

---

## 🧩 Komponen UI

OmniStack dibangun di atas **shadcn/ui** dengan preset **Nova** dan **Base UI** primitives.

### Core Components

#### 1. **Button Hierarchy**

```tsx
// Primary action (highest emphasis)
<Button size="lg">Deploy Sekarang</Button>

// Secondary action
<Button variant="outline" size="lg">Lihat Dokumentasi</Button>

// Tertiary/Ghost
<Button variant="ghost" size="sm">Cancel</Button>

// Destructive
<Button variant="destructive">Hapus Project</Button>
```

**Guidelines:**
- Maksimal 1 primary button per view
- Destructive button selalu konfirmasi dengan dialog
- Loading state harus jelas (spinner + disabled)

#### 2. **Cards**

```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
    <CardDescription>Deskripsi singkat</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Konten */}
  </CardContent>
</Card>
```

**Guidelines:**
- Border radius: `rounded-xl` (12px) untuk cards besar
- Shadow subtle di hover untuk interactivity feedback
- Padding konsisten: `p-6` atau `p-8`

#### 3. **Badges**

```tsx
// Status indicators
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="outline">v1.0</Badge>
<Badge variant="destructive">Error</Badge>

// Custom colored (feature-specific)
<Badge className="bg-green-500/10 text-green-600 border-green-600">
  Live
</Badge>
```

#### 4. **Inputs**

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com"
    className="h-10"
  />
  <p className="text-sm text-muted-foreground">
    Kami tidak akan share email Anda.
  </p>
</div>
```

### Component Patterns

#### Dashboard Shell

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <TopNav />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

#### Feature Tab (Premium Style)

```tsx
<TabsTrigger className="group relative flex flex-col p-6 rounded-xl border-2 
  data-[state=active]:border-primary 
  data-[state=active]:bg-primary 
  data-[state=active]:text-primary-foreground">
  <Badge className="absolute top-3 right-3">NEW</Badge>
  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
    <Icon className="h-6 w-6" />
  </div>
  <h4 className="font-bold">Feature Name</h4>
  <p className="text-sm text-muted-foreground">Description</p>
</TabsTrigger>
```

---

## 🎨 Iconography

OmniStack menggunakan **dua icon library** untuk tujuan berbeda:

### 1. **Lucide React** (UI & Actions)
Untuk navigasi, actions, dan UI elements.

```tsx
import { Home, Settings, GitBranch, BrainCircuit } from "lucide-react"

<Home className="h-4 w-4" />
<Settings className="h-5 w-5 text-muted-foreground" />
```

**Guidelines:**
- Size default: `h-4 w-4` untuk inline, `h-5 w-5` untuk standalone
- Stroke width: konsisten 2px
- Warna: `text-current` atau semantic color

### 2. **react-icons/si** (Brand Logos)
Untuk logo teknologi (React, Docker, GitHub, dll).

```tsx
import { SiReact, SiDocker, SiGithub } from "react-icons/si"

<SiReact className="w-6 h-6 text-[#61DAFB]" />
<SiDocker className="w-8 h-8 text-[#2496ED]" />
```

**Guidelines:**
- Gunakan brand color resmi (hex)
- Size: `w-6 h-6` minimum untuk recognizability
- Selalu sertakan label text untuk accessibility

### Icon Usage Patterns

#### With Text (Navigation)
```tsx
<div className="flex items-center gap-2">
  <GitBranch className="h-4 w-4" />
  <span>Deployments</span>
</div>
```

#### Icon Only (Action Buttons)
```tsx
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
  <span className="sr-only">Settings</span>
</Button>
```

#### Icon with Background
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
  <BrainCircuit className="h-5 w-5 text-primary" />
</div>
```

---

## 🎬 Motion & Animasi

Animasi di OmniStack harus **purposeful** — setiap gerakan memiliki alasan.

### Duration Guidelines

| Type | Duration | Penggunaan |
|---|---|---|
| **Instant** | 100-150ms | Hover states, button clicks |
| **Fast** | 200-300ms | Dropdowns, tooltips, modals |
| **Normal** | 300-400ms | Page transitions, slide-ins |
| **Slow** | 500-800ms | Hero animations, onboarding |

### Easing Functions

```css
/* Default - Natural deceleration */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);

/* Entrance - Slight overshoot */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Exit - Accelerating */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);
```

### Common Animations

#### 1. **Hover Lift**
```tsx
<Button className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
  Deploy
</Button>
```

#### 2. **Fade In**
```tsx
<div className="animate-in fade-in duration-300">
  Content
</div>
```

#### 3. **Slide In**
```tsx
<div className="animate-in slide-in-from-bottom-4 duration-500">
  Modal content
</div>
```

#### 4. **Pulse (Status Indicators)**
```tsx
<div className="relative">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
</div>
```

### Animation Don'ts

❌ **Jangan:**
- Animasi di setiap elemen (visual noise)
- Animasi yang memblokir interaction
- Bounce/elastic berlebihan (tidak profesional)
- Animasi berbeda untuk pattern yang sama

---

## 🌗 Dark Mode Strategy

Dark mode di OmniStack **bukan sekadar inverse**. Ia memiliki karakter dan depth sendiri.

### Design Philosophy

- **Reduced glare**: Warna yang lebih soft untuk reduce eye strain
- **Depth through elevation**: Surface lebih tinggi = lebih terang
- **Desaturated accents**: Warna accent di-dark mode lebih desaturated
- **Preserved contrast**: WCAG AA minimum (4.5:1 untuk text)

### Dark Mode Palette Adjustments

```css
/* Light mode backgrounds */
--background: 0 0% 100%;      /* Pure white */
--card: 0 0% 100%;

/* Dark mode backgrounds */
.dark {
  --background: 240 10% 3.9%; /* Very dark blue-gray */
  --card: 240 10% 5.9%;       /* Slightly lighter for elevation */
  --muted: 240 3.7% 15.9%;    /* Muted surfaces */
}
```

### Dark Mode Guidelines

✅ **DO:**
- Gunakan elevation (card lebih terang dari background)
- Desaturate warna accent di dark mode
- Test dengan ambient light simulation
- Gunakan border subtle untuk separation

❌ **DON'T:**
- Pure black (#000) sebagai background (terlalu harsh)
- Pure white text di pure black (eye strain)
- Saturasi tinggi untuk warna large areas
- Mengabaikan contrast ratio

### Testing Checklist

- [ ] Text readable di semua lighting conditions
- [ ] Interactive elements clearly visible
- [ ] Status colors (success, error) tetap distinguishable
- [ ] Code blocks tetap readable
- [ ] Charts & graphs maintain contrast

---

## ♿ Aksesibilitas

OmniStack berkomitmen untuk **accessible by default**.

### Color Contrast

| Element | Minimum Ratio | Target |
|---|---|---|
| **Body text** | 4.5:1 (AA) | 7:1 (AAA) |
| **Large text** (18px+) | 3:1 (AA) | 4.5:1 (AAA) |
| **UI components** | 3:1 | 4.5:1 |
| **Icons** | 3:1 | 4.5:1 |

### Keyboard Navigation

Semua interactive elements harus:
- ✅ Focusable dengan `Tab` key
- ✅ Activatable dengan `Enter` atau `Space`
- ✅ Navigable dengan arrow keys (untuk menus, tabs)
- ✅ Dismissible dengan `Escape` (untuk modals, dropdowns)

```tsx
// Good: Visible focus ring
<Button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</Button>

// Good: Screen reader text
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
  <span className="sr-only">Open settings</span>
</Button>
```

### ARIA Guidelines

```tsx
// Dialog
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle>Delete Project?</DialogTitle>
      <DialogDescription id="dialog-description">
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

// Loading state
<Button disabled aria-busy="true">
  <Loader className="animate-spin" />
  Deploying...
</Button>
```

### Motion Sensitivity

```tsx
// Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🏷️ Brand Elements

### Logo

Logo OmniStack terdiri dari **icon** (box/cube) dan **wordmark**.

```tsx
// Icon only (sidebar, favicon)
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
  <Boxes className="h-4 w-4" />
</div>

// Full logo (navbar)
<Link href="/" className="flex items-center gap-2 font-bold text-xl">
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
    <Boxes className="h-4 w-4" />
  </div>
  <span>OmniStack</span>
</Link>
```

### Tagline

**Primary:** "The Developer Operating System"  
**Secondary:** "Any Stack. Any Cloud. Your Rules."

### Voice & Tone

| Context | Tone | Example |
|---|---|---|
| **Success messages** | Confident, concise | "✓ Deployed in 4.2s" |
| **Error messages** | Helpful, specific | "Database connection failed. Check your credentials." |
| **Empty states** | Encouraging, guiding | "No projects yet. Create your first deployment." |
| **Technical content** | Precise, clear | "Container scaling to 3 replicas" |

---

## 📚 Referensi & Inspirasi

OmniStack mengambil inspirasi dari produk-produk terbaik di industri:

- **Linear** - Clean UI, keyboard-first, speed
- **Vercel** - Developer experience, dark mode excellence
- **Stripe** - Documentation, precision, consistency
- **Raycast** - Speed, efficiency, power user features
- **Figma** - Collaboration, real-time feedback

---

## 🔄 Version History

| Version | Date | Changes |
|---|---|---|
| **1.0** | 2026-08-22 | Initial design system documentation |

---

<div align="center">

**Designed with ❤️ for developers who build the future.**