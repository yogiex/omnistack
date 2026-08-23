---
name: omnistack-shadcn
description: "Manages shadcn/ui components in OmniStack (Next.js 16 + Tailwind v4 + Base UI primitives): adding, searching, updating, styling, composing, and debugging UI via the shadcn CLI. Use when working with any component in components/ui/, when running shadcn CLI commands (add/search/docs/info/diff/view/preset), working with registries or MCP, building forms with Field primitives, choosing/composing components, or theming via CSS variables. Encodes Base UI-specific APIs (render prop, items prop, array values) that differ from Radix examples found online. Skip for non-component work."
---

# OmniStack shadcn/ui

Adapted from the official [shadcn skill](https://github.com/shadcn-ui/ui/tree/main/skills/shadcn) (shadcn-ui/ui). Hard-adapted for **OmniStack**: Next.js 16 App Router, Tailwind v4, npm, **Base UI** (`"base"` field in components.json — NOT Radix).

> Run all CLI via npm runner: `npx shadcn@latest <cmd>`. Config lives in `components.json`.

## Project Context (OmniStack specifics)

| Field | Value | Consequence |
|-------|-------|-------------|
| `base` | `base` (Base UI) | ❌ NEVER use Radix `asChild` — use `render` prop. See [references/base-vs-radix.md](./references/base-vs-radix.md) |
| `tailwindVersion` | v4 | Theming via `@theme inline` in globals.css — never tailwind.config.js |
| `iconLibrary` | lucide | Import icons from `lucide-react`; react-icons/si ONLY for brand logos |
| `packageManager` | npm | Non-shadcn deps: `npm install <pkg>` |
| aliases | `@/` | `@/components/ui/button`, `@/lib/utils` |
| RSC | true | Interactive components need `"use client"` |

Refresh anytime with `npx shadcn@latest info`. Get per-component doc URLs with `npx shadcn@latest docs <component>` — **fetch those URLs before creating/fixing/debugging any component** instead of guessing APIs.

## Principles

1. **Existing components first.** Check installed components (list `components/ui/`) before writing custom UI; check registries via `search` before hand-rolling.
2. **Compose, don't reinvent.** Settings = Tabs + Card + form controls. Dashboard = Sidebar + Card + Chart + Table.
3. **Built-in variants before custom styles.** `variant="outline"`, `size="sm"` — not className overrides.
4. **Semantic colors only.** `bg-primary`, `text-muted-foreground` — never `bg-blue-500`, never raw status colors (`text-emerald-600` → `<Badge variant="secondary">`).
5. **Never edit `components/ui/` source** (OmniStack law — stronger than upstream). Customize via variants → className (layout only) → CSS variables → **wrapper component**. If a new cva variant seems necessary, ask the user first.

## Critical Rules (always enforced)

### Styling
- `className` for LAYOUT only (`max-w-md`, `mt-4`) — never override component colors/typography through it.
- ❌ `space-x-*`/`space-y-*` → ✅ `flex gap-*` / `flex flex-col gap-*`.
- Equal width+height → `size-10`, not `w-10 h-10`.
- `truncate` shorthand over the long-form trio.
- ❌ Manual `dark:` color overrides → ✅ semantic tokens handle both themes.
- Conditional classes via `cn()` from `@/lib/utils` — no template-literal ternaries.
- ❌ Manual z-index on overlays (Dialog/Sheet/Popover…) — they self-stack.
- Loading-text shimmer → utility `className="shimmer"`; scroll-edge fading → `scroll-fade*` utilities. No custom @keyframes/bg-clip-text sweeps.

### Forms
- Layout: `FieldGroup` + `Field` (+ `FieldLabel htmlFor`, `FieldDescription`) — never raw div + space-y.
- Validation state needs BOTH: `data-invalid` on Field + `aria-invalid` on control. Disabled: `data-disabled` + `disabled`.
- `InputGroup` requires `InputGroupInput`/`InputGroupTextarea` — never bare Input inside.
- Buttons inside inputs → `InputGroupAddon`, not absolute-positioned Button.
- 2–7 choice option set → `ToggleGroup`, not a mapped loop of Buttons with active state.
- Related checkbox/radio groups → `FieldSet` + `FieldLegend`.
- Control picker: text→Input · dropdown→Select · searchable→Combobox · settings toggle→Switch vs form toggle→Checkbox · few-option single choice→RadioGroup · OTP→InputOTP.

### Composition
- Items ALWAYS inside their Group: `SelectItem`→`SelectGroup`, `DropdownMenuItem`→`DropdownMenuGroup`, `CommandItem`→`CommandGroup`, etc.
- Triggers compose via `render` (Base UI): `<DialogTrigger render={<Button />}>Open</DialogTrigger>` — no extra wrapper divs, no asChild.
- Dialog/Sheet/Drawer ALWAYS have a Title (`DialogTitle`…); use `sr-only` if visually hidden.
- Full Card composition: CardHeader/CardTitle/CardDescription/CardContent/CardFooter.
- Button loading: NO `isPending` prop → `<Button disabled><Spinner data-icon="inline-start" />Saving...</Button>`.
- `TabsTrigger` always inside `TabsList`. `Avatar` always has `AvatarFallback`.
- Callouts → `Alert`; empty states → `Empty` (EmptyHeader/EmptyMedia/EmptyTitle/EmptyDescription/EmptyContent); separators → `Separator`; loading placeholders → `Skeleton`; labels → `Badge`.
- **Toast (Base UI project!):** `import { toast } from "@/components/ui/toast"` then `toast.add({ title })`. Do NOT use sonner (that's the Radix/Aria path).
- Overlay chooser: input task→Dialog · destructive confirm→AlertDialog · side panel→Sheet · bottom mobile panel→Drawer · hover info→HoverCard · click context→Popover.

### Icons
- In Button/menu items: `<Icon data-icon="inline-start" />` or `inline-end` — NO sizing classes (`size-4` etc.) inside components; CSS handles sizing.
- Pass icons as component objects (`icon={CheckIcon}`), never string keys into lookup maps.

## Key Patterns (correct-by-default)

```tsx
// Form layout + validation state
<FieldGroup>
  <Field data-invalid>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" aria-invalid />
    <FieldDescription>Invalid email address.</FieldDescription>
  </Field>
</FieldGroup>

// Trigger composition (Base UI — NOT asChild)
<DialogTrigger render={<Button />} >Open</DialogTrigger>
<Button render={<a href="/docs" />} nativeButton={false}>Docs</Button>

// Select REQUIRES items prop (Base UI)
const fruits = [
  { label: "Select a fruit", value: null },
  { label: "Apple", value: "apple" },
]
<Select items={fruits}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent><SelectGroup>
    {fruits.map((f) => f.value && <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
  </SelectGroup></SelectContent>
</Select>

// ToggleGroup / Accordion / Slider (Base UI shapes)
<ToggleGroup defaultValue={["daily"]}>…</ToggleGroup>   // single: array default, no type prop
<ToggleGroup multiple>…</ToggleGroup>                    // multi
<Accordion defaultValue={["item-1"]}>…</Accordion>       // array default, no type/collapsible
<Slider defaultValue={50} max={100} />                   // scalar for single thumb
```

Full Incorrect/Correct pairs for Select/ToggleGroup/Slider/Accordion/render-vs-asChild → [references/base-vs-radix.md](./references/base-vs-radix.md).

## Workflow

1. **Context**: run `npx shadcn@latest info` if unsure of config.
2. **Check installed first** — list `components/ui/`; never import un-added components, never re-add installed ones.
3. **Find**: `npx shadcn@latest search [@registry|-q query]`. Registry must be EXPLICIT — if the user doesn't say which registry for a block/component, ask; never guess.
4. **Docs**: `npx shadcn@latest docs <component>` → fetch returned URLs before coding.
5. **Install/update**: `npx shadcn@latest add <item>` — preview first with `--dry-run` / `--diff [file]` / `--view [file]` (also audits third-party code). ⚠️ `diff` command is deprecated; `add --diff` replaces it.
6. **Third-party fixups**: after adding community registry items, rewrite hardcoded import paths to match project aliases and swap icon imports to lucide.
7. **Review added files** against Critical Rules above; verify group nesting, titles, fallbacks.
8. **Update flow (smart merge)**: `add <c> --dry-run` → `add <c> --diff <file>` per file → overwrite untouched files, merge locally-modified ones manually. ❌ `--overwrite` without explicit user approval.

## Presets & Theming

- Apply preset to existing project: `apply <code|named|--preset url>`; partial: `apply <code> --only theme,font` (only `theme`/`font` supported).
- Inspect: `preset resolve [--json]` (current), `preset decode <code>` (incoming). Never decode/build preset codes manually.
- Switching presets: ask user — overwrite (`apply`) / partial (`apply --only …`) / merge or skip (`init --preset <code> --force --no-reinstall`). CLI auto-preserves current `base`; scratch dirs need explicit `--base base`.
- Custom colors: add `--name`/`--name-foreground` OKLCH vars to `:root` AND `.dark` in `app/globals.css`, register under `@theme inline { --color-name: var(--name); }`, use as `bg-name text-name-foreground`. Never create a new CSS file.
- `--radius` drives all corner rounding globally.
- Dark mode: class-based via next-themes (already wired in root layout).

## Registries & MCP (details → [references/cli-registry-mcp.md](./references/cli-registry-mcp.md))

- Address schemes: bare `button` = official only · `@acme/item` = namespaced registry · `owner/repo/item` = public GitHub repo with root registry.json · URL/file JSON also accepted.
- MCP server (`shadcn mcp init` supports opencode.json) exposes 7 tools incl. `get_project_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_audit_checklist`. MCP handles registry ops only — project config still via `info`.
