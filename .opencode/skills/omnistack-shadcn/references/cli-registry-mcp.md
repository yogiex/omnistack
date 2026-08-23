# shadcn CLI, Registry & MCP Reference

Distilled from shadcn-ui/ui skills (cli.md, registry.md, mcp.md — MIT) for OmniStack: npm runner (`npx shadcn@latest`), Base UI project.

## CLI Commands

Config read from `components.json`. **Never invent flags** — no `--package-manager` flag exists (lockfile auto-detect).

### init / create
```bash
npx shadcn@latest init [components...] [options]
```
| Flag | Short | Purpose |
|------|-------|---------|
| `--template <t>` | `-t` | next · start · vite · next-monorepo · react-router |
| `--preset <p>` | `-p` | Named (`nova`…), preset code, or URL |
| `--defaults` | `-d` | = `--template=next --preset=base-nova` |
| `--yes/-y` | | skip confirm (default true) |
| `--force/-f` | | overwrite existing config |
| `--name <n>` | `-n` | name for NEW project |
| `--monorepo / --no-monorepo` | | scaffold/skip monorepo prompt |
| `--rtl`, `--reinstall`, `--cwd/-c`, `--silent/-s` | | misc |

`create` is an alias of `init`.

### apply
```bash
npx shadcn@latest apply [preset] [options]   # presets overwrite config/fonts/CSS/detected components
```
Partial: `apply <code> --only theme,font` (only `theme` and `font` supported; `icon` intentionally unsupported).

### add ⭐ most-used
```bash
npx shadcn@latest add [components...] [options]
```
Accepts: bare names (`button`), namespaced (`@magicui/shimmer-button`), GitHub (`owner/repo/item`), URLs, local paths.

| Flag | Purpose |
|------|---------|
| `--overwrite/-o` | overwrite existing files (needs explicit user approval!) |
| `--dry-run` | preview without writing |
| `--diff [path]` | show diffs vs upstream (top 5 files w/o path; implies --dry-run) |
| `--view [path]` | inspect source without installing (implies --dry-run) |
| `--all/-a`, `--yes/-y`, `--path/-p`, `--cwd/-c`, `--silent/-s` | misc |

⚠️ `diff` standalone command is DEPRECATED → always `add --diff`.

### search (alias: list)
```bash
npx shadcn@latest search [registries...] [-q query] [-t ui,block,...] [-l limit] [--json]
```
Fuzzy; namespaces (`@acme`), GitHub sources (`owner/repo`); no registries arg = all configured in components.json.

### view / docs / info
```bash
npx shadcn@latest view @shadcn/button        # registry item details (not installed)
npx shadcn@latest docs button dialog select  # doc/example/API URLs — fetch them before coding
npx shadcn@latest info                       # project context JSON ⭐ run FIRST when unsure
```
`info` reports: framework(+version), isRSC, isSrcDir, tailwindVersion (v3/v4), tailwindCssFile, aliasPrefix, packageManager, and components.json fields incl. **base (radix|base)**, style (nova/vega…), iconLibrary, aliases, resolvedPaths, registries.

### preset subcommands
```bash
npx shadcn@latest preset decode <code>   # inspect incoming preset
npx shadcn@latest preset url <code>      # builder URL
npx shadcn@latest preset open <code>     # open in browser
npx shadcn@latest preset resolve [--json] # current project's preset state
```
Presets are opaque — never decode/build codes manually. Named presets: nova, vega, maia, lyra, mira, luma. Preset codes do NOT encode base — scratch dirs need explicit `--base base`.

### build (registry authoring)
```bash
npx shadcn@latest build [registry] [--output public/r]   # input default ./registry.json
```

## Registry System

**Two forms:** source `registry.json` (authored, may use `include`) → built item JSONs (usually `public/r/`) served to consumers via `build`.

Item shape:
```json
{
  "name": "login-form",
  "type": "registry:block",
  "dependencies": ["zod"],
  "registryDependencies": ["button", "input", "label"],
  "files": [{ "path": "...", "type": "registry:block", "target": "..." }],
  "cssVars": { "light": { "brand": "oklch(0.62 0.18 250)" }, "dark": { "brand": "oklch(0.72 0.16 250)" } }
}
```
Types: `registry:ui` · `block` · `lib` · `hook` · `file` · `page` · `theme` · `style` · `font` · `item`. `registry:file`/`registry:page` files require `target`. Root registry.json must have `name` + `homepage`; `include` paths are relative, must point to registry.json files, no traversal; duplicate item names fail.

**Address schemes (classify before resolving):**

| Address | Scheme |
|---------|--------|
| `button` | official shadcn ONLY (bare names never mean same-repo items) |
| `@acme/button` / `@acme/ui/button` | configured namespace (slashful = item name, not path) |
| `owner/repo/item[#ref]` | public GitHub repo with root registry.json |
| `https://…/r/button.json` / `./button.json` | URL / local built JSON |

GitHub deps: pin with `#ref`; refs NOT inherited (write full ref on every dep). `.json`-suffixed addresses keep file precedence. Public github.com only; moving branch refs resolve to commit SHA for caching.

**Configure extra registries** in components.json (`${VAR}` from env):
```json
{ "registries": { "@acme": { "url": "https://acme.com/r/{name}.json", "headers": { "Authorization": "Bearer ${MY_TOKEN}" } } } }
```
URLs must contain `{name}`. Community index: https://ui.shadcn.com/r/registries.json

Verify workflow: `list @acme` → `search @acme -q login` → `view @acme/login-form` → `add @acme/login-form --dry-run`.

## MCP Integration

```bash
shadcn mcp        # stdio server
shadcn mcp init   # writes editor config — supports opencode.json for OpenCode
```

7 tools (registry ops only — project config still via `info`):

| Tool | Purpose |
|------|---------|
| `get_project_registries` | registries from components.json |
| `list_items_in_registries` | list (optional registries/types/limit/offset) |
| `search_items_in_registries` | fuzzy + required query |
| `view_items_in_registries` | full file contents |
| `get_item_examples_from_registries` | usage examples by query (e.g. "accordion-demo") |
| `get_add_command_for_items` | returns install command |
| `get_audit_checklist` | verification checklist (imports, deps, lint, TS) |
