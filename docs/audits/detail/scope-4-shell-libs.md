# Scope 4 — App Shell, Auth, Shared Components & Libs

Audit date: 2026-09-26 · Repo: `/mnt/storage/code/omnistack` @ `69bc6b2` (+ uncommitted `app/layout.tsx`, `Dockerfile`, `public/fonts/`)
Stack: Next.js 16.3.2 App Router, React 19.2.8, TS 5 strict, Tailwind v4 (CSS-only config), shadcn/ui **on Base UI** (`@base-ui/react@^1.7.0`), `next-themes@0.4.6`.
`next.config.ts`: `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, optional `basePath` via `NEXT_PUBLIC_BASE_PATH`.

> Research only. No repo file was modified.

---

## Route Map

| URL | File | Purpose | Auth gate |
|---|---|---|---|
| `/` | `app/page.tsx` (895 L, Server) | Marketing landing: hero, feature tabs, comparison, pricing, FAQ, final CTA | **none** |
| `/login/` | `app/login/page.tsx` (493 L, Client) | Email login + one-click test-account login; redirects by role | none (auto-redirects *away* if session exists) |
| `/register/` | `app/register/page.tsx` (678 L, Client) | 4-step fake signup: info → OTP → password → success | none |
| `/forgot-password/` | `app/forgot-password/page.tsx` (70 L, Server) | Dead-end stub; submit button hard-`disabled` | none |
| `/privacy/` | `app/privacy/page.tsx` (65 L, Server) | 4-section privacy policy (partly false — see F3) | none |
| `/terms/` | `app/terms/page.tsx` (64 L, Server) | 4-section ToS, honestly labels itself a mock demo MVP | none |
| `/dashboard/` … `/settings/` (all `(dashboard)` children) | `app/(dashboard)/layout.tsx` | App shell: `RouteGuard` → `SidebarProvider` → `AppSidebar` + `TopNav` + `<main>` | `RouteGuard` (login only) |
| `/admin/`, `/admin/users`, `/admin/databases`, `/admin/audit`, `/admin/settings`, `/admin/infrastructure`, `/admin/ai-config`, `/admin/billing` | `app/(dashboard)/admin/**/page.tsx` | Admin console | `RouteGuard` (layout) **+** `RouteGuard requiredRole="ADMIN"` (page) — nested |
| `/gitops/` | `app/(dashboard)/gitops/page.tsx:6` | Preview environments | `requiredRole="USER"` |
| `/ai-architect/` | `app/(dashboard)/ai-architect/page.tsx:12` | AI app generator mock | `requiredRole="USER"` |
| `/ai-reviewer/` | `app/(dashboard)/ai-reviewer/page.tsx:11` | AI code reviewer mock | `requiredRole="USER"` |
| `/projects/[id]/ide/` | `app/(ide)/layout.tsx` (15 L, Server) | Fullscreen Cloud IDE, no dashboard chrome | `RouteGuard` (login only) |

No `app/api/`, no Route Handlers, no Server Actions, no `middleware.ts` — confirmed (no `middleware.*` exists).

---

## Inventory

| File | LOC | Client/Server | Purpose |
|---|---:|---|---|
| `app/layout.tsx` | 39 | Server | Root shell: `localFont` Inter, `AuthProvider` → `ThemeProvider` (next-themes, class attr, system default), static `metadata` |
| `app/page.tsx` | 895 | Server | Landing page; renders client `Tabs`/`Accordion`/`Table` |
| `app/page.tsx.bak` | 981 | — | **Stray duplicate of `page.tsx`** (pre-lint-cleanup). Excluded from tsconfig (`**/*.tsx` doesn't match `.tsx.bak`) and from ESLint default extensions |
| `app/globals.css` | 130 | CSS | Tailwind v4 entry: 3 `@import`s, `@custom-variant dark`, `@theme inline` token map, `:root` + `.dark` token blocks, `@layer base` |
| `app/favicon.ico` | 25 931 B | binary | Real multi-resolution MS icon (16/32 px, 32 bpp) |
| `app/(dashboard)/layout.tsx` | 25 | Server | Dashboard shell composition |
| `app/(ide)/layout.tsx` | 15 | Server | IDE shell (`h-svh`, no chrome) |
| `app/login/page.tsx` | 493 | Client | Login form, password reveal, remember-me, quick-login, role-styled success |
| `app/register/page.tsx` | 678 | Client | 4-step signup, `zxcvbn` strength meter, OTP input, password generator |
| `app/forgot-password/page.tsx` | 70 | Server | Disabled stub |
| `app/privacy/page.tsx` | 65 | Server | Privacy policy |
| `app/terms/page.tsx` | 64 | Server | Terms of service |
| `components/app-sidebar.tsx` | 211 | Client | Role-aware nav (client-side only) |
| `components/top-nav.tsx` | 120 | Client | Header: sidebar trigger, search box, theme menu, avatar menu, logout |
| `components/theme-provider.tsx` | 11 | Client | Thin `next-themes` re-export |
| `components/route-guard.tsx` | 61 | Client | Login + optional `requiredRole` gate, effect-based redirect |
| `components/project-status-badge.tsx` | 40 | Server-safe | Live/Building/Failed/Stopped pill |
| `components/deployment-status-badge.tsx` | 44 | Server-safe | Success/Building/Failed/Queued pill |
| `components/ui/accordion.tsx` | 72 | Server-safe wrapper | Base UI `accordion` (Root/Item/Trigger/Panel) |
| `components/ui/avatar.tsx` | 109 | Client | Base UI `avatar` + 3 extra local sub-components |
| `components/ui/badge.tsx` | 52 | Server-safe | `cva` + Base UI `useRender` (correct `render` prop) |
| `components/ui/button.tsx` | 58 | Server-safe | Base UI `button` + `buttonVariants` (9 variants × 9 sizes) |
| `components/ui/card.tsx` | 103 | Server-safe | 7 div-based card parts |
| `components/ui/checkbox.tsx` | 29 | Client | Base UI `checkbox` |
| `components/ui/dialog.tsx` | 160 | Client | Base UI `dialog`; close button via `render={<Button/>}` |
| `components/ui/dropdown-menu.tsx` | 268 | Client | Base UI `menu` → `DropdownMenu*`; `GroupLabel` inside `Group` |
| `components/ui/input.tsx` | 20 | Server-safe | Base UI `input` |
| `components/ui/label.tsx` | 20 | Client | Plain `<label>` (client directive unnecessary) |
| `components/ui/select.tsx` | 201 | Client | Base UI `select` (11 exports) |
| `components/ui/separator.tsx` | 25 | Client | Base UI `separator` |
| `components/ui/sheet.tsx` | 138 | Client | Base UI `dialog` re-skinned as Sheet |
| `components/ui/sidebar.tsx` | 723 | Client | Full shadcn/Base-UI sidebar kit (24 exports), `useIsMobile` consumer |
| `components/ui/skeleton.tsx` | 13 | Server-safe | Pulse div |
| `components/ui/table.tsx` | 116 | Client | 8 table parts (plain HTML, no Base UI) |
| `components/ui/tabs.tsx` | 82 | Client | Base UI `tabs` (Tab/Panel, not Radix Trigger/Content) |
| `components/ui/textarea.tsx` | 18 | Server-safe | Plain `<textarea>` |
| `components/ui/tooltip.tsx` | 66 | Client | Base UI `tooltip` + `TooltipProvider` (never mounted) |
| `lib/utils.ts` | 6 | — | `cn()` only |
| `lib/auth-context.tsx` | 151 | Client | Session provider, `login`/`logout`/`startDemoSession`, `useAuth`/`useHasRole`/`useIsAdmin` |
| `lib/mock-data.ts` | 1312 | — | Types + 3+3 users, projects, deployments, audit, roles/RBAC helpers, DBaaS, FinOps |
| `lib/mock-ide-data.ts` | 289 | — | 15 exports of IDE fixtures (tree, code, tabs, terminal, problems, AI history, palette, metrics, deploy checklist) |
| `hooks/use-mobile.ts` | 23 | hook | `useIsMobile()` via `matchMedia` + rAF-deferred first read |

**Base UI / Radix audit of `components/ui/` — all 18 clean:**
- `grep -rn "asChild" app components lib hooks` → **0 hits**. ✅
- `grep -rn "@radix-ui" app components lib` → **0 hits**. ✅
- 13 files import from `@base-ui/react/*`; the other 5 (`card`, `label`, `skeleton`, `table`, `textarea`) are plain-HTML and legitimately need no primitive.
- All "Radix-isms" correctly translated to Base UI: `TabsPrimitive.Tab`/`Panel` (`tabs.tsx:58,74`), `MenuPrimitive.GroupLabel` (`dropdown-menu.tsx:64`), `useRender`+`mergeProps`+`render` prop instead of `asChild` (`badge.tsx:36-49`, `sidebar.tsx:398,513`), `MenuPrimitive.CheckboxItem`/`RadioItem` with `items`-less `value` arrays, `SelectPrimitive.ScrollUpArrow/DownArrow`.
- All 18 files are imported by at least one non-`ui` file (min: `textarea` 1, `tooltip` 1). **No dead `components/ui/` file.**

---

## Auth & Security Analysis

### Exact mechanism

`lib/auth-context.tsx` is the entire auth system. There is no server, no token, no signature, no expiry.

**Hydration (load) — `auth-context.tsx:48-77`**
1. `useState<SessionUser|null>(null)` + `isLoading=true` (`:43-44`).
2. `useEffect` (`:48`) runs `hydrate()`; `await Promise.resolve()` (`:52`) defers one microtask so no synchronous `setState` happens inside the effect (comment at `:46-47`).
3. `localStorage.getItem("omnistack_user")` (`:56`) → `JSON.parse` (`:58`).
4. **Validation is one line:** `MOCK_USERS.find(u => u.id === parsed.id && u.isActive)` (`:59`). Only the `id` is checked. The stored `email`, `name`, `role`, `avatar`, `createdAt` are **discarded** and rebuilt from the server-side (bundle-side) record via `toSessionUser(valid)` (`:30-40, :61`).
5. No match → `localStorage.removeItem` (`:63`). Parse throw → `removeItem` (`:67`).
6. `setIsLoading(false)` (`:70`).

**Login — `auth-context.tsx:79-100`**
`await new Promise(r => setTimeout(r, 800))` (`:81`, a hard-coded 800 ms fake latency) → `MOCK_USERS.find(u => u.email === email && u.password === password)` (`:83-85`) → `isActive` check (`:91-93`) → write `toSessionUser(mockUser)` (no password field, since `SessionUser = Omit<MockUser,"password">` at `mock-data.ts:29`) to localStorage (`:96`) → `setUser` (`:97`).

**Logout — `auth-context.tsx:102-105`:** `removeItem` + `setUser(null)`. `TopNav` then `router.push("/login")` (`top-nav.tsx:30-33`).

**`startDemoSession` — `auth-context.tsx:111-123`:** mints `id: \`user-local-${Date.now()}\``, `role:"USER"`, writes it to localStorage (`:120`). **This id can never be found by the hydrator** — see F1.

### Is the session validated? Is it forgeable?

**It is validated only against the bundle's own hard-coded user table, and it is trivially forgeable.** Concretely, in DevTools on any deployed static export:

```js
localStorage.setItem("omnistack_user",
  JSON.stringify({ id: "user-admin-001" }))   // that's the whole payload needed
location.reload()
```

`hydrate()` matches `id === "user-admin-001" && isActive` (`auth-context.tsx:59`), and `toSessionUser` copies `role: "ADMIN"` straight out of `MOCK_USERS` (`mock-data.ts:91`). After reload the visitor is a full ADMIN: `ROLE_REDIRECTS.ADMIN = "/admin"` (`mock-data.ts:629`), every `requiredRole="ADMIN"` guard passes, and the sidebar renders the "Administrasi" group (`app-sidebar.tsx:115-126`). Equivalent one-liner for `user-dev-002` or `user-viewer-003`. There is no secret to steal because the "credential store" is `MOCK_USERS[].password` in the client bundle (`mock-data.ts:89,99,109`) — visible to anyone who opens the JS bundle.

### Does `route-guard.tsx` prevent access?

It **prevents rendering, not access.** `route-guard.tsx:58` (`if (!user || roleDenied) return null`) means guarded children are never mounted, so no admin markup or mock data ever enters the DOM for an under-privileged viewer. That is the strongest thing a static export can do.

But it is *not* access control:
- The redirect is **effect-based** (`:35-44`), so it happens strictly after first paint; the guard is a client component, so the decision is made in the browser.
- The entire `/admin/**` JS chunk plus `MOCK_USERS`, `MOCK_AUDIT_LOGS`, and the DBaaS fixtures are shipped to **every** anonymous visitor of the static site. `output: "export"` means there is no origin that could have withheld them.
- The code is honest about this: `route-guard.tsx:22` — *"ini proteksi UI (gimmick MVP), bukan keamanan sungguhan."*

**Verdict: this is UI gating, not security.** It is acceptable for a mock demo (no real data or secrets exist behind it) but it must not be described as authentication, and it provides zero protection the moment a real backend is added without replacing it.

### Hydration risk

**Auth: none.** All localStorage access is inside `useEffect` (`auth-context.tsx:48-77`); the first client render is identical to SSR (`isLoading=true` → spinner), and both `RouteGuard` (`:46-56`) and `LoginPage` (`login/page.tsx:133-139`) render a spinner for that state. `<html suppressHydrationWarning>` (`app/layout.tsx:24`) covers the next-themes class swap. This is a correct, deliberate implementation — the two comments at `auth-context.tsx:46-47` and `use-mobile.ts:14` show the author already worked around the React 19 "setState synchronously inside an effect" lint.

**Non-auth hydration-adjacent defect:** `useIsMobile()` initialises to `undefined` and only reads the viewport inside a `requestAnimationFrame` (`use-mobile.ts:6,15`), returning `false` on the first paint. `SidebarProvider` consumes it (`sidebar.tsx:69`) and `Sidebar` branches on it (`sidebar.tsx:182`). Not a hydration mismatch (server and first client render agree), but on a phone the first frame renders the desktop branch — which is `hidden md:block` (`sidebar.tsx:210`) — so the sidebar is simply absent for one frame, then swaps to the Sheet variant.

### Persistence, per feature

| Feature | Survives refresh? | Mechanism |
|---|---|---|
| Auth session (login) | ✅ Yes | `localStorage["omnistack_user"]`, no expiry |
| Theme (light/dark/system) | ✅ Yes | `next-themes` → `localStorage["theme"]` |
| Registration "account" | ❌ **No** | Session id is rejected by the hydrator → user is logged out on the very next load (F1) |
| "Remember me for 30 days" | ❌ No-op | Checkbox state is never read; `login` always writes an identical, non-expiring record (F11) |
| Sidebar collapsed/expanded | ❌ No | Cookie is **written** (`sidebar.tsx:86`) but **never read** — `SIDEBAR_COOKIE_NAME` appears only at `:28` and `:86` (F20) |
| Anything typed in the dashboard search box | ❌ No | Input is fully uncontrolled and unwired |
| Everything else (projects, deployments, IDE buffer, FinOps edits) | ❌ No | In-memory React state over `lib/mock-data.ts` fixtures |

---

## Findings

### [CRITICAL] F1 — A freshly "registered" account is silently deleted on the next page load
- **Location:** `lib/auth-context.tsx:113` (id minting), `lib/auth-context.tsx:59-64` (rejection), triggered from `app/register/page.tsx:660-665`
- **Problem:** `startDemoSession` writes `id: \`user-local-${Date.now()}\`` (`auth-context.tsx:113`) to `localStorage["omnistack_user"]`. The hydrator validates the stored session with `MOCK_USERS.find(u => u.id === parsed.id && u.isActive)` (`auth-context.tsx:59`). `user-local-1789…` is not in `MOCK_USERS`, so the `else` branch fires `localStorage.removeItem(STORAGE_KEY)` (`:63`) and `setUser` is never called. On the next full page load the brand-new user is anonymous → `RouteGuard` (`route-guard.tsx:37-39`) bounces them to `/login`.
- **Impact:** The register flow's headline promise — `app/register/page.tsx:630` *"Akun Berhasil Dibuat! 🎉"* with a green **"Email Terverifikasi"** checkmark at `:643` and a *"Workspace Default"* at `:652-654` — evaporates on refresh. The user believes they created an account; nothing was created, and the session they were just given is destroyed. This is a data-loss-class defect on the only write path in the entire app.
- **Fix:** Either (a) drop the whole registration flow and link to `/login` only, or (b) add a client-side user store (e.g. `localStorage["omnistack_users"]`) that the hydrator also consults, so `startDemoSession` users survive reload. The `role`/`isActive`/expiry of that record must be set by the store, not by the caller.

### [CRITICAL] F2 — Email OTP verification accepts any six digits
- **Location:** `app/register/page.tsx:194-200`
- **Problem:** `handleVerifyOtp` checks only `if (otp.length !== 6) return` (`:195`) then waits 1200 ms and advances to `step = "password"` (`:199`). There is no expected code, no comparison, no server. The same is true of resend (`:203-209`).
- **Impact:** Any 6 digits — `000000` — "verifies" an email address the visitor does not own, and the app then asserts *"Email Terverifikasi"* (`app/register/page.tsx:643`) and the marketing copy at `:258` advertises *"Verifikasi email untuk keamanan akun"*. A user is told a security control exists when none does. Note that for a purely local demo the "verification" has no server to talk to, so the honest options are to remove the step entirely or label it unmistakably as a UI prototype.
- **Fix:** Delete the OTP step, or gate the whole page behind a visible "DEMO — no email is sent" banner and stop rendering the "Email Terverifikasi" success row.

### [CRITICAL] F3 — Privacy policy promises account deletion that is a disabled button
- **Location:** `app/privacy/page.tsx:49-51` vs `app/(dashboard)/settings/settings-client.tsx:528-532`
- **Problem:** The policy states *"Anda dapat menghapus akun beserta seluruh datanya kapan saja dari halaman Settings."* The corresponding control is `<Button variant="destructive" disabled>` with a "Segera" badge.
- **Impact:** A false statement in a published legal document, on a page reachable from the footer of the marketing site (`app/page.tsx:890`) and from the registration consent checkbox (`app/register/page.tsx:389`). A user relying on it to exercise a data-deletion right is told the feature exists when it does not.
- **Fix:** Change the policy text to state that self-service deletion is not yet available and describe how to request deletion (the hello@omnistack.dev address already listed at `:51`).

### [CRITICAL] F4 — RBAC is client-side only and one localStorage edit away from ADMIN
- **Location:** `lib/auth-context.tsx:59`, `components/route-guard.tsx:35-44`, `next.config.ts` (`output: "export"`), `lib/mock-data.ts:85-115`
- **Problem:** Credentials (`admin123`/`dev123`/`viewer123`) live in `MOCK_USERS` inside the client bundle (`lib/mock-data.ts:89,99,109`). Session validation is a single `id` lookup against that same bundle table (`auth-context.tsx:59`). All `/admin/**` guards are client components (`route-guard.tsx:1`) and every route is pre-rendered to static HTML by `output: "export"`, so the admin chunks and fixtures are downloaded by anonymous visitors.
- **Impact:** Privilege escalation to full ADMIN is a one-line DevTools command (see Auth analysis). The code self-documents this at `route-guard.tsx:22`. No real data is exposed today because all data is mock — the risk is that this pattern is carried into a version with a real backend, where the identical code would be a genuine authorization bypass.
- **Fix:** Keep the guard for UI purposes but rename it (`UiRoleGate`) and add a prominent `SECURITY.md` note; the moment any real data exists, move authorization server-side and treat the client role as display-only. Also stop shipping `password` in `MOCK_USERS` to the client (see F34).

### [MAJOR] F5 — Remaining runtime network dependencies: remote avatars and a third-party CDN asset
- **Location:** `lib/mock-data.ts:92`, `lib/mock-data.ts:102`, `lib/mock-data.ts:112` (avatars); `components/top-nav.tsx:81-83` (rendered); `app/register/page.tsx:227` (CDN background)
- **Problem:** Three independent external fetches survive the offline-build work:
  1. `avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=…"` on all three test accounts, rendered through `<AvatarImage src={user.avatar}>` in the top nav.
  2. `app/register/page.tsx:227` — `bg-[url('https://grainy-gradients.vercel.app/noise.svg')]`. The *login* page does the identical effect with the **local** asset `bg-[url('/noise.svg')]` (`app/login/page.tsx:149`) and `public/noise.svg` exists — so this is a plain inconsistency, not a necessity.
- **Impact:** The Docker deployment is nginx serving `./out` (`Dockerfile`, runtime stage) with no egress assumptions documented; on an air-gapped or egress-filtered host every avatar 404s and the register hero loses its texture. Beyond availability, the dicebear call leaks the visitor's IP and a stable per-account identifier to a third party, which directly contradicts `app/privacy/page.tsx:42-43` (*"kami tidak menjual atau membagikan data apa pun kepada pihak ketiga"*).
- **Fix:** Vendor three local SVGs into `public/avatars/` (or render initials only) and change `app/register/page.tsx:227` to `/noise.svg`. Then grep the whole `app/` tree for `https://` inside `src`/`url()` to prove egress-independence.

### [MAJOR] F6 — `font-sans`, `font-mono` and `font-heading` resolve to nothing
- **Location:** `app/globals.css:10-12`, consumed at `app/globals.css:128`, `components/ui/card.tsx:41`, `components/ui/dialog.tsx:125`, `components/ui/sheet.tsx:108`
- **Problem:** Three broken token declarations:
  - `app/globals.css:10` — `--font-sans: var(--font-sans);` is **self-referential**. A custom property that (transitively) references itself is invalid at computed-value time.
  - `app/globals.css:11` — `--font-mono: var(--font-geist-mono);` references **`--font-geist-mono`, which is defined nowhere in the repo** (`grep -rn -- "--font-geist-mono" app components lib *.ts *.css` → only this one hit).
  - `app/globals.css:12` — `--font-heading: var(--font-sans);` inherits the breakage.
  These are leftovers from the pre-Docker font setup. `app/layout.tsx:8-11` now uses `localFont` **without** a `variable:` option, so no `--font-inter` is emitted either; the only working font application is `className={inter.className}` on `<body>` (`app/layout.tsx:25`).
- **Impact:** `html { @apply font-sans }` (`app/globals.css:128`) emits an invalid `font-family`; every `font-mono` code block (landing page `:90,248,356-388`; login `:46`; register `:90`) and every `font-heading` card/dialog/sheet title falls back to the inherited family instead of monospace / the heading face. This also invalidates the workaround documented in `AGENTS.md` §Known Issue 3 ("gunakan class `font-sans` … yang sudah di-setup shadcn") — it is not set up.
- **Fix:** Either add `variable: "--font-inter"` to the `localFont` call and map `--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif`, or delete the three `--font-*` lines from `@theme inline` so Tailwind's defaults apply, and change `font-heading` usages to `font-sans`.

### [MAJOR] F7 — Four nested `<main>` landmarks on dashboard pages
- **Location:** `components/ui/sidebar.tsx:305-316` (`SidebarInset` renders `<main>`), `app/(dashboard)/layout.tsx:18` (a second `<main>` **inside** it), `app/(dashboard)/projects/project-list.tsx:352`, `app/(dashboard)/deployments/deployments-list.tsx:258`
- **Problem:** `SidebarInset` is typed `React.ComponentProps<"main">` and renders a `<main>` element (`sidebar.tsx:307`). The dashboard layout then nests another `<main>` inside it (`app/(dashboard)/layout.tsx:18`). Two page components add a third and fourth.
- **Impact:** `<main>` must appear at most once per document; nested/duplicated main landmarks break screen-reader landmark navigation (the core way a screen-reader user jumps past a long sidebar) and are an explicit HTML validity error. The top-nav `<header>` (`top-nav.tsx:36`) plus the sidebar's unlabeled divs mean there is no `banner`/`navigation` landmark pair to fall back on either.
- **Fix:** Change `SidebarInset` to render a `<div>` (or `<div role="region" aria-label="Content">`), keep the single `<main>` in `app/(dashboard)/layout.tsx:18`, and change the two page-level `<main>`s to `<section>`/`<div>`.

### [MAJOR] F8 — Every sidebar nav item is an `<a>` wrapping a `<button>`, with no `aria-current`
- **Location:** `components/app-sidebar.tsx:142-155`; `components/ui/sidebar.tsx:499-528` (`defaultTagName: "button"` at `:514`); `components/ui/sidebar.tsx:455-475` (`<ul>`/`<li>`)
- **Problem:** `AppSidebar` renders `<Link href={item.url} className="w-full block">` (`app-sidebar.tsx:143`) around `<SidebarMenuButton>` (`:144`), and `SidebarMenuButton` renders a real `<button>` because no `render` prop is passed. So each of the ~17 nav entries is an interactive `<button>` nested inside an `<a>` — invalid HTML (interactive content inside a link), two tab stops per item, and ambiguous activation semantics. Separately, active state is communicated **only** visually: `isActive` feeds `data-active` and a `bg-primary/10 text-primary` class (`:145-150`); there is no `aria-current="page"`. `grep -rn "aria-\|role=" components/top-nav.tsx components/app-sidebar.tsx` returns **zero** hits.
- **Impact:** Screen-reader users get no indication of which page they are on, and keyboard users tab through 34 stops to traverse 17 links.
- **Fix:** Pass Base UI's `render` prop through: `<SidebarMenuButton render={<Link href={item.url} />} …>` (the mechanism already used correctly at `sidebar.tsx:521`), so a single `<a>` is produced, and add `aria-current={isActive ? "page" : undefined}`.

### [MAJOR] F9 — Top-nav search box is a completely non-functional, unlabeled control with a fake ⌘K affordance
- **Location:** `components/top-nav.tsx:39-49`
- **Problem:** A `<input type="search" placeholder="Search projects, services, or docs...">` with no `name`, no `<label>`, no `aria-label`, no `value`, no `onChange`, and no submit handler. The adjacent `<kbd>⌘K</kbd>` (`:46-48`) advertises a keyboard shortcut, but `grep -rn "metaKey" app components` finds exactly two handlers: `ide-shell.tsx:47` (⌘K → IDE command palette) and `query-console.tsx:128` (⌘+Enter). **Nothing in the dashboard binds ⌘K.**
- **Impact:** Two defects in one: an unlabeled form control (screen readers announce only "edit, search") and a prominent, entirely fake affordance. Users will type, get no results, and press ⌘K with no effect.
- **Fix:** Until implemented, remove the input and the `⌘K` hint (or render them `disabled` with an "coming soon" tooltip). If implemented, wrap in `<form role="search">`, add `aria-label`, and bind the shortcut in the dashboard layout.

### [MAJOR] F10 — "Ingat saya selama 30 hari" checkbox has no effect whatsoever
- **Location:** `app/login/page.tsx:73`, `app/login/page.tsx:350-366`; `lib/auth-context.tsx:96`
- **Problem:** `rememberMe` is declared (`:73`) and bound to the checkbox (`:354-357`), and the label promises 30 days (`:364`) — but it is **never passed to `login()`**. `handleLogin` calls `finishLogin(email, password)` (`:122`) → `login(email, password)` (`lib/auth-context.tsx:79`), whose signature has no third parameter, and `:96` always writes the same non-expiring record. `grep -n "rememberMe" app/login/page.tsx` returns exactly two hits: the declaration and the `checked` prop.
- **Impact:** Users who tick "remember me" get no persistent session, and users who *don't* tick it get one anyway — the control inverts the user's actual expectation. Minor data, real trust cost.
- **Fix:** Either implement it (e.g. `localStorage` vs `sessionStorage`, or a stored `expiresAt` checked in the hydrator at `auth-context.tsx:56-64`), or delete the checkbox and the label.

### [MAJOR] F11 — VIEWER sidebar advertises "Shared Projects" but the data layer returns an empty array for VIEWER
- **Location:** `components/app-sidebar.tsx:74-83` vs `lib/mock-data.ts:657-661`
- **Problem:** The nav item is labelled **"Shared Projects"** for VIEWER and points at `/projects` (`app-sidebar.tsx:78-81`). But `getMockProjectsByUser` ends with `return []` for any non-ADMIN/non-USER role (`lib/mock-data.ts:660`), and its doc comment says so: *"VIEWER → kosong (shared projects menyusul)"* (`:655`). `app/(dashboard)/projects/project-list.tsx:100` is the only consumer, so VIEWER always lands on an empty list — even though `SHARED_PROJECT_IDS = ["proj-001","proj-003"]` (`lib/mock-data.ts:255`) exists and *is* honoured for deployments (`:690`) and databases (`:1028`).
- **Impact:** A labelled navigation destination that is permanently empty for one of the three supported roles. The role model is inconsistent between the projects and deployments/DB views.
- **Fix:** Make `getMockProjectsByUser` return `MOCK_PROJECTS.filter(p => SHARED_PROJECT_IDS.includes(p.id))` for VIEWER, or rename the nav item and drop the `/projects` link for VIEWER.

### [MAJOR] F12 — Register flow's "Masuk ke Dashboard" creates the session only on a left-click
- **Location:** `app/register/page.tsx:658-670`
- **Problem:** The only call to `startDemoSession` in the entire app is inside the `<Link>`'s `onClick` (`:660-665`). Session creation is therefore coupled to a plain primary-button activation.
- **Impact:** Middle-click, ctrl/cmd-click, "open link in new tab", a browser extension rewriting the click, or a screen reader's activate action routed through the context menu all skip it — the user reaches `/dashboard`, has no session, and is silently bounced to `/login` with no error. This is the same class of bug as F1: the "account" only exists inside a DOM event handler.
- **Fix:** Call `startDemoSession` in the `handleFinalSubmit` success path (`app/register/page.tsx:212-218`) and make the final CTA a plain `router.push`.

### [MAJOR] F13 — Register page's GitHub button is inert and looks actionable
- **Location:** `app/register/page.tsx:330-333`
- **Problem:** `<Button variant="outline" className="w-full" size="lg">` with `<SiGithub /> Daftar dengan GitHub` has **no `onClick` and is not `disabled`**. Contrast the login page, which handles the identical situation honestly: `app/login/page.tsx:236-238` sets the error *"Login via GitHub belum tersedia."*
- **Impact:** A full-width primary-looking OAuth button that does nothing on click — worse than a disabled one, because the absence of feedback reads as a bug rather than an absent feature.
- **Fix:** Add `disabled` plus a "Segera" badge (the pattern already used at `app/forgot-password/page.tsx:45-48` and `settings-client.tsx:528-531`), or mirror the login page's error message.

### [MAJOR] F14 — No skip link anywhere in the application
- **Location:** `app/layout.tsx:23-38` (the only place a global landmark could be introduced); `grep -rn "skip-to\|skipTo\|Skip to" app components` → **0 hits**
- **Impact:** Every keyboard user must tab through the entire `AppSidebar` (up to 17 `<a>`-wrapped `<button>`s, see F8) plus `SidebarTrigger` and both dropdown triggers in `TopNav` on *every* page load before reaching page content. This is the single highest-impact accessibility defect in the shell, and it compounds F8.
- **Fix:** Add `<a href="#main-content" className="sr-only focus:not-sr-only …">Skip to content</a>` as the first child of `<body>` in `app/layout.tsx`, and give the dashboard `<main>` (`app/(dashboard)/layout.tsx:18`) `id="main-content"` + `tabIndex={-1}`.

### [MAJOR] F15 — Auth and legal pages have no `<main>` landmark
- **Location:** `app/login/page.tsx:142`, `app/register/page.tsx:221`, `app/forgot-password/page.tsx:16`, `app/privacy/page.tsx:6`, `app/terms/page.tsx:6`; contrast `app/page.tsx:63` (which does use `<main>`)
- **Problem:** These five routes render their content in a bare `<div>`. The only `<main>` elements in the app are `app/page.tsx:63`, `app/(dashboard)/layout.tsx:18`, and `components/ui/sidebar.tsx:307` (see F7).
- **Impact:** No landmark to navigate to on the pages a screen-reader user lands on after authentication. The landing page gets this right, so the shell and the marketing page are inconsistent.
- **Fix:** Wrap each page's primary column in `<main id="main-content">`.

### [MAJOR] F16 — Landing page violates the AGENTS.md colour and inline-style rules in 26 places
- **Location:** `app/page.tsx:139-150` (12 hardcoded hex pairs), `app/page.tsx:469-474`, `493-498`, `517-522`, `541-546` (24 more hex literals in `color:` fields), consumed via inline styles at `app/page.tsx:477`, `501`, `525`, `549`
- **Problem:** `AGENTS.md` §Critical Rules ❌DON'T #3 forbids hardcoded hex in Tailwind classes and ❌DON'T #4 forbids inline styles for static styling. This file uses `text-[#61DAFB]`, `bg-[#61DAFB]/10`, … for brand logos (`:139-150`) and `style={{ color: tech.color }}` (`:477,501,525,549`) for the "Freedom Stack" grids.
- **Impact:** Pure convention violation, but the hex set is *unthemeable* — it will not follow a dark-mode rebrand and cannot be corrected by changing tokens. The inline styles additionally bypass `twMerge`, so a `className` colour passed alongside can be silently overridden.
- **Fix:** Define a `--brand-react`, `--brand-vue`, … set in `@theme inline` (`app/globals.css`) and reference them as `text-brand-react`; replace `style={{color}}` with a `Record<name, string>` of class names. Note the same rule is broken by the two status badges (F26) and `ROLE_META` (F31).

### [MINOR] F17 — `app/page.tsx.bak` is 981 lines of dead duplicate
- **Location:** `app/page.tsx.bak` (whole file)
- **Problem:** A pre-lint-cleanup copy of `app/page.tsx` differing only in trailing whitespace and import wrapping (`diff` shows whitespace-only deltas plus a reformatted import block). It is invisible to `tsc` (tsconfig `include` globs are `**/*.ts`/`**/*.tsx`; the file is `page.tsx.bak`) and to ESLint (default lint extensions), so it silently rots.
- **Impact:** Dead weight; a future reader may edit the wrong file. It is already excluded from the image by `.dockerignore`'s `*.bak` rule, so it costs nothing at runtime.
- **Fix:** `git rm app/page.tsx.bak` (it is tracked — it did not appear in `git status`).

### [MINOR] F18 — Dead exports across the shell and lib layer
- **Location:** `lib/mock-data.ts:647` (`getMockUserByEmail`), `lib/mock-data.ts:1031` (`getDatabasesByProject`), `lib/mock-ide-data.ts:9` (`IDE_PROJECT_NAME`), `lib/auth-context.tsx:143` (`useHasRole`), `lib/auth-context.tsx:149` (`useIsAdmin`), `components/ui/tooltip.tsx:7` (`TooltipProvider`)
- **Problem:** Verified zero call sites outside their own definition:
  - `getMockUserByEmail` and `getDatabasesByProject` appear only at their definition lines in `lib/mock-data.ts` — no internal use either.
  - `IDE_PROJECT_NAME` has no consumer (all 14 sibling exports do).
  - `useHasRole` / `useIsAdmin` have no consumers; every page calls `roleAtLeast(user.role, …)` directly instead (e.g. `route-guard.tsx:41`, `project-detail-client.tsx:152`).
  - `TooltipProvider` is never mounted — `app/layout.tsx` has only `AuthProvider` and `ThemeProvider`, despite `AGENTS.md` claiming *"Root layout (ThemeProvider, TooltipProvider)"*. Both real consumers (`sidebar.tsx:541`, `ide-activity-bar.tsx:85`) render bare `<Tooltip>`.
- **Impact:** Dead API surface; the AGENTS.md claim about `TooltipProvider` is documentation drift that will mislead the next agent.
- **Fix:** Delete the five unused symbols; either mount `TooltipProvider` in `app/layout.tsx` or delete the export and correct `AGENTS.md`.

### [MINOR] F19 — Sidebar collapse state is written to a cookie that is never read
- **Location:** `components/ui/sidebar.tsx:28-29` (constants), `components/ui/sidebar.tsx:86` (the write)
- **Problem:** `setOpen` writes `document.cookie = \`${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}\`` (`:86`, 7-day max-age). `SIDEBAR_COOKIE_NAME` appears at exactly two lines in the repo: the declaration and this write. `SidebarProvider` initialises from `defaultOpen = true` (`:57,74`) and never reads `document.cookie`.
- **Impact:** The comment at `:85` says *"This sets the cookie to keep the sidebar state"* — it does not. Every reload resets the sidebar. In a static export there is no server to read it either, so a client-side read would be required.
- **Fix:** Read the cookie in a `useEffect` on mount and pass it as `defaultOpen`, or drop the write and the comment.

### [MINOR] F20 — Dead "Profile" menu item in the avatar dropdown
- **Location:** `components/top-nav.tsx:103-106`
- **Problem:** `<DropdownMenuItem><UserRound />Profile</DropdownMenuItem>` has no `onClick` and no destination. It sits between the identity `GroupLabel` and the Logout item (`:108-114`), i.e. in the most-used menu in the app.
- **Impact:** Clicking it closes the menu and does nothing.
- **Fix:** Link it to `/settings`, or remove it until a profile page exists.

### [MINOR] F21 — Two dead `href="#"` links on the landing page
- **Location:** `app/page.tsx:73` (the v1.0 announcement badge), `app/page.tsx:802` (Enterprise tier "Hubungi Sales")
- **Problem:** Both are `next/link` with `href="#"`, which pushes a `#` entry and can reset scroll. The announcement badge is styled as a prominent marketing CTA.
- **Impact:** Two visible dead ends on the highest-traffic page. (The four anchor links in the header at `:46-49` are fine — `#features`, `#compare`, `#pricing`, `#faq` all have matching `id`s at `:171, 673, 739, 809`.)
- **Fix:** Point the badge at a changelog or release post, and "Hubungi Sales" at a `mailto:`.

### [MINOR] F22 — Dark-mode chart tokens are byte-identical to the light ones
- **Location:** `app/globals.css:70-74` (`:root`) vs `app/globals.css:105-109` (`.dark`)
- **Problem:** `--chart-1` … `--chart-5` are `oklch(0.87 0 0)` … `oklch(0.269 0 0)` in **both** blocks. Every other token in `.dark` is re-valued.
- **Impact:** Charts and cost visualisations (FinOps trend, cost breakdown) render identically in both themes; on the dark background the light end of the ramp will be the only distinguishable band. The palette is also fully achromatic (all chroma `0`), so the five series are distinguished by lightness alone — a grayscale/colour-vision concern.
- **Fix:** Give `.dark` its own chart ramp with real chroma, and verify the series remain distinguishable under deuteranopia.

### [MINOR] F23 — `RouteGuard` is mounted twice on every guarded page
- **Location:** `app/(dashboard)/layout.tsx:12` + e.g. `app/(dashboard)/admin/page.tsx:6`, `app/(dashboard)/gitops/page.tsx:6`
- **Problem:** All 11 role-gated pages wrap themselves in a `RouteGuard` *inside* the `RouteGuard` already provided by the layout. Two `useEffect`s then both evaluate `router.replace` for a denied user.
- **Impact:** Harmless today (idempotent `replace` to the same URL) but it means the login-only check runs twice per navigation, and it invites the illusion that the page-level guard is the enforcement point.
- **Fix:** Keep the layout guard for authentication and the page guard for authorisation, and add a comment saying so — or move both into the layout with a per-segment role map.

### [MINOR] F24 — Blank-screen flash between "auth resolved" and "redirect fired"
- **Location:** `components/route-guard.tsx:46-58`
- **Problem:** Once `isLoading` flips to `false` with `user === null`, the component returns `null` (`:58`) and only *then* does the effect call `router.replace(redirectTo)` (`:38`). Between those two frames the user sees an empty page.
- **Impact:** A brief white flash on every protected-route visit by an anonymous user — most visible on the login→dashboard bounce after a failed deep link.
- **Fix:** Keep rendering the `Loader2` spinner (`:47-55`) until the redirect completes, e.g. return the spinner whenever `!user` rather than `null`.

### [MINOR] F25 — Redundant `roleDenied` derivation duplicates the effect's check
- **Location:** `components/route-guard.tsx:32-33` vs `components/route-guard.tsx:41-43`
- **Problem:** `roleDenied` is computed as `!!user && !!requiredRole && !roleAtLeast(...)` and used only in the render guard (`:58`). The effect re-derives the identical predicate inline (`:41-42`).
- **Impact:** Two sources of truth for the same rule; they can drift.
- **Fix:** Depend on `roleDenied` in the effect: `if (roleDenied) router.replace("/dashboard")`.

### [MINOR] F26 — Inconsistent colour strategy between the two status badges
- **Location:** `components/project-status-badge.tsx:9-28` vs `components/deployment-status-badge.tsx:9-29`
- **Problem:** `ProjectStatusBadge` uses raw Tailwind palette classes for every state (`text-green-500 border-green-500/40 bg-green-500/10`, `:11`; `text-yellow-500 …`, `:16`; `text-red-500 …`, `:21`). `DeploymentStatusBadge` uses the same palette for `success`/`building` (`:11,16`) but the **semantic token** for `failed`: `text-destructive border-destructive/40 bg-destructive/10` (`:21`).
- **Impact:** Two sibling components, same visual language, two different strategies. The palette versions also have no dark-mode variant, so `text-green-500` on `--card` in dark mode is not contrast-tuned (the login page solves this properly with `-600 dark:-400` pairs at `app/login/page.tsx:44-62`).
- **Fix:** Add semantic status tokens (`--success`, `--warning`) to `app/globals.css` and use them in both files, or align both to the existing `destructive` pattern.

### [MINOR] F27 — Sidebar role colours bypass the token system
- **Location:** `components/app-sidebar.tsx:43-50` (`ROLE_META`), applied at `app-sidebar.tsx:174-178`
- **Problem:** `color: "text-amber-500" | "text-blue-500" | "text-emerald-500"` are raw palette values, again with no dark-mode pair — while the very same three roles are styled correctly with `-600 dark:-400` in `ROLE_CONFIG` on the login page (`app/login/page.tsx:44,52,60`).
- **Impact:** Same defect class as F26; the role identity colour differs between the login screen and the sidebar for the same role.
- **Fix:** Extract the `ROLE_CONFIG` colour pairs into a shared module and consume them from both.

### [MINOR] F28 — Redundant `as boolean` cast on the Base UI checkbox callback
- **Location:** `app/login/page.tsx:355-357`
- **Problem:** `onCheckedChange={(checked) => setRememberMe(checked as boolean)}`. Base UI's `Checkbox.Root` already provides `checked: boolean` in that callback (the prop type flows from `CheckboxPrimitive.Root.Props` at `components/ui/checkbox.tsx:8`), so the cast asserts something the type system already knows.
- **Impact:** A cast that hides future type changes; also a signal the callback signature was assumed rather than checked.
- **Fix:** Drop the cast.

### [MINOR] F29 — `useIsMobile()` reports `false` for the first frame
- **Location:** `hooks/use-mobile.ts:6`, `hooks/use-mobile.ts:15`; consumed at `components/ui/sidebar.tsx:69,182`
- **Problem:** State starts `undefined` → `!!undefined === false` (`:22`), and the first real measurement is deferred to `requestAnimationFrame` (`:15`) to avoid a synchronous `setState` in the effect. `Sidebar` branches on `isMobile` (`sidebar.tsx:182`) and otherwise renders the desktop branch, which is `hidden md:block` (`:210`).
- **Impact:** On viewports < 768 px the sidebar is absent for the first frame and then swapped for a Sheet — a small layout shift on every load of every dashboard page. Not a hydration mismatch (server and first client render agree).
- **Fix:** Render nothing (or a skeleton) until `isMobile` has been measured once, instead of defaulting to the desktop branch.

### [MINOR] F30 — No mobile navigation on the landing page
- **Location:** `app/page.tsx:45-50`
- **Problem:** The only `<nav>` is `className="hidden md:flex gap-6 …"`. There is no hamburger, sheet, or alternate mobile menu anywhere in the file.
- **Impact:** Below 768 px, the Fitur / Perbandingan / Harga / FAQ entries are unreachable, so mobile visitors cannot jump to `#pricing` or `#faq` at all (the `Deploy Aplikasi Pertama` CTA at `:101` still works, and the page is one long scroll).
- **Fix:** Add a `Sheet`-based mobile menu, or surface the four sections as a compact row.

### [MINOR] F31 — Realistic-looking database credentials are committed to a client-shipped bundle
- **Location:** `lib/mock-data.ts:825-826`, `856-857`, `887-888`, `918-919`, `949-950`, `980-981`
- **Problem:** Six `DbConnection` fixtures carry plaintext `password` values with production-looking shapes — `sk-live-9f2b7c41ae` (`:825`), `redis-tk81mz04` (`:856`), `pg-an-338bd1c9f2` (`:887`) — and hostnames under the real project domain (`db.omnistack.dev`, `analytics.omnistack.dev`, `vector.omnistack.dev`, `portal.omnistack.dev`). The `uri` fields mask the password with `••••••••` (`:826` etc.), which shows the author knew these were sensitive.
- **Impact:** All mock data ships to every visitor in the JS bundle. The `sk-live-` prefix will trip secret scanners (GitHub push protection, `gitleaks`, `trufflehog`) and could block a push; the habit of pasting realistic credentials into `mock-data.ts` is exactly how a real key eventually gets committed.
- **Fix:** Replace with obviously-fake values (`password: "demo-not-a-real-secret"`, hostnames `db.example.invalid`).

### [MINOR] F32 — `shadcn` CLI is a production dependency
- **Location:** `package.json:19`
- **Problem:** `"shadcn": "^4.18.0"` sits in `dependencies`, not `devDependencies`. It is a CLI/registry tool, needed at build time only for the `@import "shadcn/tailwind.css"` in `app/globals.css:3`.
- **Impact:** Inert for the Docker build (the runtime stage copies only `./out`, and the builder runs `npm ci` without `--omit=dev`, so the CLI is required either way), but it ships the whole CLI into any `npm install --omit=dev` production install and misrepresents the project's runtime surface.
- **Fix:** Move to `devDependencies` (the Docker build installs dev deps, so `globals.css:3` still resolves).

### [MINOR] F33 — `zxcvbn` is genuinely used, but is bundled whole into `/register`
- **Location:** `app/register/page.tsx:12`, `app/register/page.tsx:101`; `package.json:25`
- **Problem:** Verified: `zxcvbn` **is** imported and used (`useMemo(() => zxcvbn(password))`), so it is not an unused dependency. Two caveats: (a) the default import pulls the full frequency dictionary into the `/register` client chunk; (b) `@types/zxcvbn` (`package.json:32`) is listed separately — `zxcvbn@4.4.2` ships its own `index.d.ts`, so the `@types` package is very likely redundant (**could not be confirmed: `node_modules/` is not installed in this checkout**).
- **Impact:** Bundle weight on a page most visitors never reach, plus a probable duplicate-types package.
- **Fix:** Confirm with `ls node_modules/zxcvbn/*.d.ts` after an install; if types are bundled, drop `@types/zxcvbn`. Consider `zxcvbn/dist/zxcvbn` (no dictionaries) or a lighter meter.

### [MINOR] F34 — `password` is stored in a module that is imported by client components
- **Location:** `lib/mock-data.ts:85-115` (`MOCK_USERS[].password`), `lib/auth-context.tsx:10`
- **Problem:** `auth-context.tsx` is `"use client"` (`:1`) and imports `MOCK_USERS` (`:10`), so the three plaintext passwords and the entire 1312-line fixture module are pulled into the client bundle. `SessionUser = Omit<MockUser,"password">` (`lib/mock-data.ts:29`) correctly keeps the password out of *storage*, but not out of the *bundle*.
- **Impact:** Anyone can read the demo credentials — harmless for published test accounts, but it means the pattern "credentials in `lib/mock-data.ts`" is already normalised in this codebase. Pair this with F4: when a real backend arrives, credentials must never come from this module.
- **Fix:** Keep the credentials in a module only ever imported by a non-`"use client"` file, or move validation behind a real endpoint.

---

## Cross-cutting notes (no defect)

- **No `fetch`, no Route Handlers, no Server Actions, no `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`** anywhere in the audited scope. (`grep -rn "dangerouslySetInnerHTML\|innerHTML" app components lib hooks` matches only two *string literals inside mock review findings* at `app/(dashboard)/ai-reviewer/_components/mock-data-reviewer.ts:118,120`, which are data describing an XSS pattern, not code.)
- **No `any`, no `as any`, no `: any`** in any audited file — the `AGENTS.md` ban is respected. The only casts are `as boolean` (F28), `as React.CSSProperties` (sidebar CSS vars, idiomatic), and `JSON.parse(raw) as SessionUser` (`auth-context.tsx:58`, immediately re-validated against `MOCK_USERS` at `:59`, so the cast is sound).
- **Rules of hooks are clean in every audited file.** All early returns follow the last hook: `app-sidebar.tsx:62` (after `usePathname`/`useAuth` at `:59-60`), `top-nav.tsx:28` (after `useTheme`/`useAuth`/`useRouter` at `:23-25`), `login/page.tsx:133` (after 7 hooks + 2 effects at `:68-96`), `register/page.tsx:100-103` (`useMemo` at `:101` precedes the return at `:103`), `sidebar.tsx:167`/`:182`, `tooltip.tsx`/`dropdown-menu.tsx` (n/a). No helper function is declared *after* the `useEffect` that consumes it — the reverse of the `react-hooks/immutability` trap — in `auth-context.tsx`, `route-guard.tsx`, `use-mobile.ts`, or any `components/ui/` file. The only non-trivial pattern worth noting is `route-guard.tsx:32` deriving `roleDenied` before the effect, which is correct.
- **`cn()` is used everywhere** conditional classes are needed, and every mapped array in scope has a `key` (`app-sidebar.tsx:142`, `login/page.tsx:407`, `register/page.tsx:140,295`, `page.tsx:153,339,613`). `app/page.tsx:613` uses `key={idx}` on a static 4-element literal array — a `key={pr.branch}` would be better, but it is not a correctness bug for non-reordering data.
- **Server Components are used by default** where correct: `app/layout.tsx`, both route-group layouts, `app/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/forgot-password/page.tsx`, `components/project-status-badge.tsx`, `components/deployment-status-badge.tsx` all have no `"use client"`. `"use client"` appears only where hooks/handlers are genuinely needed.
- **`@apply` usage in `globals.css` is minimal and correct** — 3 uses in `@layer base` (`:122,125,128`), the shadcn default. No duplicated token definitions between `:root` and `.dark` other than the chart ramp (F22). **No hardcoded hex anywhere in `globals.css`** — every value is `oklch()`. `--radius: 0.625rem` **is** set (`:75`) and drives the 7 derived `--radius-*` scales (`:42-48`).
- `hooks/use-mobile.ts` has **no `"use client"` directive**, which is correct and deliberate: it is only ever imported from `components/ui/sidebar.tsx:8`, which is already a client module. Importing it from a Server Component would fail the build, so this coupling is worth a one-line comment.
- `components/ui/label.tsx:1` carries a `"use client"` directive on a component that has no hooks or handlers. Harmless, but inconsistent with the other plain-HTML primitives (`card`, `skeleton`, `textarea`), which omit it.

---

## Statistics

- **Total files inspected:** 40 (39 text + `app/favicon.ico`); plus `app/page.tsx.bak` (981 L) examined and recommended for deletion
- **Total LOC (in scope, excluding the `.bak`):** 7 010
  - `app/` root + layouts + auth + legal: 2 470 · `components/ui/` (18 files): 2 273 · `components/` top-level (6): 486 · `lib/` + `hooks/`: 1 781
- **CRITICAL: 4 | MAJOR: 12 | MINOR: 18** — 34 findings
- **Unused deps/files/exports: 7**
  - Dead file: `app/page.tsx.bak`
  - Dead exports: `getMockUserByEmail`, `getDatabasesByProject`, `IDE_PROJECT_NAME`, `useHasRole`, `useIsAdmin`, `TooltipProvider`
  - Probably-redundant dep: `@types/zxcvbn` (**unverified** — `node_modules/` absent)
  - Misfiled dep: `shadcn` in `dependencies`
- **Unused `components/ui/` files: 0 of 18** — every primitive is imported by at least one non-`ui` module
- **Remaining network dependencies in scope: 2** (dicebear avatar CDN ×3 URLs; `grainy-gradients.vercel.app` noise SVG ×1) — both runtime, neither breaks `next build`, both break an air-gapped deploy and contradict `app/privacy/page.tsx:42-43`
- **Base UI compliance: 18/18 correct** — zero `asChild`, zero `@radix-ui`, correct `render`/`useRender`/`GroupLabel`/`Tab`+`Panel` translations
- **Docs drift found:** `AGENTS.md` §Project Structure claims a root-layout `TooltipProvider` that does not exist (F18); `AGENTS.md` §Known Issue 3 recommends the `font-sans` class, which resolves to nothing (F6)
