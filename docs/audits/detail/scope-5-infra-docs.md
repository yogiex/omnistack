# Scope 5 — Infrastructure, Config & Documentation Accuracy

**Audit date:** 2026-09-26 · **Repo:** `/mnt/storage/code/omnistack` · **Branch:** `main` @ `69bc6b2` · **Mode:** read-only (no repo file created/edited/deleted)

---

## Build & Deploy Findings

### A1. Working tree state (confirms the uncommitted/untracked claim) — CRITICAL context

```
$ git status --porcelain
 M ARCHITECTURE.md
 M README.md
 M app/layout.tsx
?? .dockerignore
?? Dockerfile
?? README.docker.md
?? docker-compose.yml
?? docker/
?? public/fonts/
```

Confirmed: **all Docker/CI-adjacent deliverables are untracked** — `Dockerfile`, `docker-compose.yml`, `docker/nginx.conf`, `.dockerignore`, `README.docker.md`, plus `public/fonts/`.

**CRITICAL — the Docker build depends on an untracked binary.** `app/layout.tsx:2-11` (uncommitted) switched from `next/font/google` to `localFont({ src: "../public/fonts/Inter-Variable.woff2" })`. `public/fonts/Inter-Variable.woff2` is **untracked** (`git ls-files` returns nothing). `next/font/local` resolves the path at build time; if `app/layout.tsx` is committed without `public/fonts/`, the build hard-fails with a module-resolution error. Today `main` is still safe (it still has `next/font/google`), so the next commit of `app/layout.tsx` is the trip-wire. `README.docker.md:6-10` is honest that nothing was actually executed, but it does not flag this.

**Note on `app/layout.tsx` being modified but the docs claiming it is synced:** `ARCHITECTURE.md:442` documents `public/fonts/Inter-Variable.woff2` as if it were committed. It is not.

### A2. `output: "export"` vs `npm start` — CRITICAL (broken documented command)

`next.config.ts:4` sets `output: "export"`. There is no Next.js server; the build emits a static tree into `./out`.

`package.json:8` still declares `"start": "next start"`. Next.js explicitly rejects this combination — `next start` errors out with *"next start" does not work with "output: export" configuration*. So:

- `README.md:802` — `npm run start # Start production server` → **broken**.
- `CONVENTIONS.md:1035` — `npm run start # Start production server` → **broken**.
- `AGENTS.md:333` — `npm run start # Start production server` → **broken**.
- `README.docker.md:460` — *"tidak ada dependensi runtime pada Node sama sekali"* → **correct**, and directly contradicts the `start` script that still exists in `package.json`.

Severity **CRITICAL** for the deploy story, because it is the one command a new operator or investor-facing reviewer will try first.

### A3. `package.json` has NO `typecheck` script — MAJOR (documented gate ≠ real gate)

`package.json:5-10` scripts are exactly: `dev`, `build`, `start`, `lint`. **No `typecheck`.**

`verify.sh:33` therefore hardcodes `run_step "2/3 Typecheck" npx tsc --noEmit`. Two concrete consequences, both verified in this working copy:

1. **Unpinned compiler.** `node_modules/` is **absent** here. `npx tsc --version` resolved to a globally-cached **TypeScript 7.0.2** — not the project's `typescript: "^5"` (`package.json:36`). A typecheck "pass" in a clean/CI-less shell can therefore be produced by a *different compiler major* than the one that built the app. `npx tsc` will silently download `latest` when the local binary is missing.
2. **`verify.sh` cannot be run to green in this tree.** `npm run lint` → `sh: 1: eslint: not found`, exit **127** (verified). The typecheck step then emits hundreds of `TS2307 Cannot find module 'react'` / `'next'` / `'@base-ui/react/*'` errors, i.e. it "passes/fails" purely on whether `npm install` was run.

So: the *documented* claim ("lint + typecheck + build", `README.md:806-807`, `INFRASTRUCTURE.md:179-181`, `AGENTS.md:606`, `SKILL.md:16-20`) is only true *after* `npm ci`, and the compiler version is unpinned. **Yes — this is a real gap.** Recommended fix: add `"typecheck": "tsc --noEmit"` to `package.json` and change `verify.sh:33` to `npm run typecheck`.

### A4. The quality gate is not wired into CI at all — MAJOR

`.github/workflows/deploy.yml` is the **only** workflow. It runs exactly:

```
setup-node → npm ci → npm run build → peaceiris/actions-gh-pages
```

No lint, no typecheck, no `verify.sh`, no Docker build. `INFRASTRUCTURE.md:35` claims the repo solves *"Lint/typecheck/build lupa dijalankan"* with the quality gate, and `AGENTS.md:606` presents it as the pre-commit gate. In reality the gate is advisory-only, human/agent-driven, and trivially bypassed. Any commit that merges to `main` ships straight to GitHub Pages with zero static analysis.

### A5. `verify.sh` — what it actually checks

`.opencode/skills/omnistack-quality-gate/scripts/verify.sh`:

- `:8` `cd "$(git rev-parse --show-toplevel || echo .)"` — repo-root anchoring. Fine.
- `:11` only `--no-build` is parsed; any other arg is silently ignored.
- `:15-26` `run_step()` uses `if "$@"` so exit codes are captured correctly; `set -u` is on, `set -e`/`pipefail` are not (deliberate, and harmless here).
- `:31-37` sequential **lint → typecheck → build**, short-circuiting after the first failure.
- **No `Class`/value validation, no tests, no `npm audit`, no Dockerfile build, no KG validation.** The KG validator is a *separate* script that `verify.sh` never calls — yet `INFRASTRUCTURE.md:203-204` describes step 3d/3e as one flow.

Minor: `verify.sh:2` and the header describe "lint → typecheck → build", matching reality; the gap is only in `package.json`.

### A6. `validate-kg.sh` — what it actually checks, and a capability overclaim

`.opencode/skills/omnistack-kg/scripts/validate-kg.sh` performs **three** checks:

1. `:20-31` dead wikilinks (with a backtick heuristic at `:26-28` to skip doc-example links)
2. `:36-42` presence of `| Class `, `| Files `, `| Status ` rows in every non-`_` node
3. `:47-51` that every `### <rel>` heading under `## Relations` is in the inverse vocabulary table (`:10-17`)

It does **NOT** validate: inverse symmetry, that `Class` values exist in `_ontology.md §1`, that `Files` paths exist, or `Status` enum membership.

Three docs claim it does check symmetry:
- `docs/kg/_ontology.md:51` — *"Validator mengecek ini"* (referring to inverse symmetry) → **FALSE**
- `docs/kg/_index.md:14` — *"Jaga simetri inverse dua arah … Validasi: validate-kg.sh"* → **FALSE**
- `INFRASTRUCTURE.md:166` — *"cek dead links, relasi ilegal, asimetri"* → **FALSE**
- `.opencode/skills/omnistack-kg/SKILL.md:62-63` — *"relasi asimetris"* → **FALSE**

**And the graph really is asymmetric, undetected.** Verified pair:
- `docs/kg/nodes/page-deployments.md:33-34` declares `### usedBy ←` → `[[page-dashboard-shell]]`
- `docs/kg/nodes/page-dashboard-shell.md:26-28` `### usedBy ←` lists only `page-dashboard` and `page-projects` — **`page-deployments` is absent**.

Second confirmed pair:
- `docs/kg/nodes/page-project-ide.md:23` declares `dependsOn → [[lib-auth-context]]`
- `docs/kg/nodes/lib-auth-context.md:18-21` `usedBy ←` lists only `page-login-register`, `component-route-guard`, `page-dashboard-shell` — **`page-project-ide` is absent**.

Severity **MAJOR**: the KG is the documented source of truth for AI agents (`AGENTS.md` Priority 🔴), and its integrity check is a third of what is claimed.

### A7. `next.config.ts` / Docker / `NEXT_PUBLIC_BASE_PATH` — MAJOR (nginx cannot serve a non-empty basePath)

`next.config.ts:6-8` conditionally sets `basePath` from `NEXT_PUBLIC_BASE_PATH`; `:5` `trailingSlash: true`; `:9` `images: { unoptimized: true }`.

`Dockerfile:21-22` plumbs the build arg:
```
ARG NEXT_PUBLIC_BASE_PATH=""
RUN NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH npm run build
```
✅ The Dockerfile **does** handle it. `docker-compose.yml:12` passes `${NEXT_PUBLIC_BASE_PATH:-}`.

**But `docker/nginx.conf` has zero basePath awareness** — verified: `grep -i "basepath\|omnistack\|prefix" docker/nginx.conf` → **NONE**.

Failure mode: `basePath` changes **URLs**, not the on-disk layout. Files still land at `out/_next/...`, but every emitted reference becomes `/omnistack/_next/...`. nginx is configured with:

- `nginx.conf:66` `location /_next/static/ { … immutable … }` → **does not match** `/omnistack/_next/static/`
- `nginx.conf:100` `try_files $uri $uri/ $uri/index.html;` → `/omnistack/_next/static/x.js` does not exist on disk → **404**

`nginx.conf:95-99` even asserts *"which is what makes this try_files chain resolve all 31 routes"* — true only for the empty-basePath case. `README.docker.md:107` actively tells the reader to run `docker-compose build --build-arg NEXT_PUBLIC_BASE_PATH=/omnistack`, which will produce a **broken site** (no CSS/JS at all, and the CSP/`nosniff` combination at `:71-76` makes the failure look like a CSP violation, not a 404).

This is exactly the failure `README.docker.md:121` warns about ("Curigai `basePath` sebelum menudah CSP") — but the doc frames it as a user error, not a config defect. Fix: either add `location ^~ /omnistack/ { … }` with a `rewrite … break` to strip the prefix, or document hard that nginx **only** supports the empty basePath.

`trailingSlash: true` ↔ `try_files $uri $uri/ $uri/index.html` — ✅ **consistent**, no issue.

### A8. GitHub Actions vs Docker vs README Node versions — MAJOR (inconsistent, and CI runs an EOL Node)

| Source | Node version |
|---|---|
| `Dockerfile:4` | `node:24-alpine` |
| `.github/workflows/deploy.yml:25` | `node-version: 20` (unpinned minor) |
| `README.md:770` | "Node.js **≥ 20.9.0** (LTS)" |
| `README.docker.md:24` | `node:24-alpine  (Node 20 EOL 30 Apr 2026)` |

`README.docker.md:24` cites Node 20's EOL as the *reason* Docker moved to 24, while the deploy workflow that actually ships to production is still pinned to 20. `package.json` has **no `engines` field** and **no `packageManager` field**, so nothing enforces a floor locally either. The two build paths (GH Pages vs Docker) can therefore produce different output from identical source, and CI is on the EOL line the project itself flags.

### A9. Caching correctness — mostly correct, one real gap

- ✅ `deploy.yml:26` `cache: npm` with `actions/setup-node` — requires a lockfile; `package-lock.json` exists (346 KB). Correct.
- ✅ `Dockerfile:13` manifests copied before `COPY . .` at `:18` → install layer invalidates only on dep change. Correct.
- ✅ `Dockerfile:16` `--mount=type=cache,target=/root/.npm` → real cache mount, not a stale layer. Correct.
- ✅ `Dockerfile:16` no `--omit=dev` / no `--ignore-scripts`, with a comment explaining why (`@tailwindcss/postcss`, `typescript`, `eslint-config-next` are build-time; swc/oxide need postinstall). Correct and well-reasoned.
- ⚠️ **MAJOR — `cache: npm` in CI will not hit on the first run after any `package.json` change and, more importantly, the cache key is derived from the lockfile only.** Combined with A8, minor drift between the Node 20 CI toolchain and the Node 24 Docker toolchain is invisible.
- ⚠️ **MINOR — no `.dockerignore`-equivalent exclusion of `.next/`.** `.dockerignore:12` does list `.next`, so the builder always compiles cold inside the image. Acceptable (and arguably correct), but it means the Docker build is slow and unpinned to any local build state.

### A10. Secrets handling — ✅ CLEAN (with one nit)

- ✅ No real secrets in `.env.example` — only `APP_PORT=18080` and `NEXT_PUBLIC_BASE_PATH=` (empty), plus a header comment at `:1-6` explaining the file is a template. **No leaked values.**
- ✅ `.dockerignore:42` `.env*` keeps `.env` out of every layer; `.gitignore:34` `.env*` keeps it out of git.
- ✅ `docker-compose.yml:92-96` explicitly documents `env_file` is absent *because* every `NEXT_PUBLIC_*` value is inlined at build time.
- ✅ No `secrets.*` usage in `deploy.yml` other than `${{ secrets.GITHUB_TOKEN }}` at `:39`, with the least-privilege `permissions: contents: write` at `:8-9` scoped to the single job. Correct.
- ⚠️ **MINOR — `.env.example` is gitignored by `.gitignore:34` (`.env*` has no `!` exception).** `git check-ignore -v .env.example` → `.gitignore:34`. It is currently **untracked**, so the moment `.dockerignore`/`README.docker.md:58` tell operators to `cp .env.example .env`, the template itself will silently vanish from the repo on any clean re-clone+regenerate cycle. Add `!.env.example` to `.gitignore`.

### A11. `docker-compose.yml` / `nginx.conf` — the good stuff (verified, no issues)

Deliberate and correct, and I want to record that these are genuinely well-reasoned:

- `docker-compose.yml:28` `127.0.0.1:${APP_PORT:-18080}:8080` loopback-only, with an accurate threat-model comment at `:18-27` about the DOCKER chain bypassing ufw.
- `:34-36` `read_only: true` + single tmpfs at `/tmp`; `nginx.conf:15-21` redirects pid + all four temp paths + logs into `/tmp`/`/dev/*` — internally consistent.
- `:40-46` `cap_drop: [ALL]`, `no-new-privileges`, explicit `user: "101:101"`; `nginx.conf:6-7` omits the `user` directive (correct — setuid is unavailable).
- `:57-58` `mem_limit: 64m` matches `nginx.conf:1` `worker_processes 1` (with a comment explaining why not `auto` on a 12-core host). Coherent.
- `:69-73` json-file `max-size: 10m` / `max-file: 3` — correctly justified (nginx logs to stdout, json-file is uncapped by default).
- `:81` healthcheck uses busybox `wget -q -O /dev/null` rather than `--spider`; `nginx.conf:57-62` `/healthz` returns `200` with `text/plain` and no duplicate `Content-Type`. Both correct and the comments show why.
- `nginx.conf:66-77` repeats the full security-header set inside `/_next/static/` because `add_header` does not merge across levels — this is a real, correctly-handled nginx footgun.
- `nginx.conf:105-113` explains why runtime `envsubst` templating is deliberately absent (it would blank `$uri`/`$host`). Correct reasoning.
- `Dockerfile:33` copies **only** `/app/out` into the runtime stage → no Node, no npm, no source, no `node_modules` in the shipped image.
- `README.docker.md:6-10` explicitly labels every size/RAM/duration figure as a **target, not a measurement**, and flags that image digests are unverified. Rare and commendable honesty — this is the model the other docs should follow.

### A12. `Dockerfile:29` LABEL source URL is a placeholder

```
org.opencontainers.image.source="https://github.com/omnistack/omnistack"
```
The real remote is `github.com:yogiex/omnistack` (per `CHANGELOG.md:287`-era placeholders and `README.md:15` demo link `yogiex.github.io/omnistack`). Wrong OCI source label → **MINOR**, but it will be permanently baked into any published image.

### A13. `package.json` / lockfile / other config — accurate as far as they go

- `package.json:16` `next: 16.3.2` (pinned exact) and `:34` `eslint-config-next: 16.3.2` match each other and match every doc that cites "Next.js 16.3". ✅
- **Zero backend dependencies** — confirmed. Full runtime dep list is `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `next`, `next-themes`, `react`, `react-dom`, `react-icons`, `react-resizable-panels`, `shadcn`, `tailwind-merge`, `tw-animate-css`, `zxcvbn`. **No Prisma, no Stripe, no NextAuth, no `@sentry/*`, no Redis client, no OpenAI/Anthropic SDK, no test runner.** Every "backend" claim in the docs is fiction.
- `package-lock.json` — exists, 346 045 bytes. ✅
- `tsconfig.json:11` `"strict": true` ✅ matches the docs' headline claim. `tsconfig.json:16-20` `plugins: [{name:"next"}]` ✅. `tsconfig.json:21-23` `@/*` ✅. Note `:6` `allowJs: true` is undocumented in AGENTS.md.
- `eslint.config.mjs:1-16` — flat config, ignores `.next`/`out`/`build`/`next-env.d.ts` (`:12` `out/**` confirms the export target is known). ✅
- `postcss.config.mjs:1-7` — single `@tailwindcss/postcss` plugin. ✅
- `components.json:3` `"style": "base-nova"`, `:8` `"css": "app/globals.css"`, `:7` `"config": ""`. ✅ The empty `tailwind.config` field is the correct Tailwind-v4 CSS-first signal; **no doc anywhere claims a `tailwind.config.ts` exists** — the two docs that mention it (`ARCHITECTURE.md:181`, `ARCHITECTURE.md:200-202`) correctly say it *does not* exist. ✅
- `.next/` — build output only (`ls .next` → `dev/`, `_events_1288076.json`); gitignored via `.gitignore:17`. ✅ Not a finding.
- ⚠️ **MINOR — `app/globals.css:1-3`** imports `"shadcn/tailwind.css"`, which only resolves because `shadcn@^4.18.0` is a **runtime** dependency (`package.json:22`). A component library is being used as a build-time CSS provider. Works, but undocumented and fragile.
- ⚠️ **MINOR — `package.json` has no `license` field** despite `README.md:13/1025` and `CHANGELOG.md:351` asserting MIT.

---

## Documentation Discrepancy Table

| Document | Claim | Reality | Verdict |
|---|---|---|---|
| `README.md:13` | MIT License badge links to `LICENSE` | No `LICENSE` file exists at repo root | ❌ FALSE (broken link) |
| `README.md:1025` | "MIT License — lihat [LICENSE](LICENSE)" | `LICENSE` does not exist | ❌ FALSE (broken link) |
| `CHANGELOG.md:351` | "lihat file [LICENSE](LICENSE) untuk detail" | `LICENSE` does not exist | ❌ FALSE (broken link) |
| `README.md:235` | Route Access Map: `/pricing` is a public route | `app/pricing/` does not exist (verified by full `find app`) | ❌ FALSE |
| `README.md:255` | Route Access Map: `/api/*` reachable by ADMIN/USER/VIEWER with RBAC | `app/api/` does not exist; `ARCHITECTURE.md:331` states this explicitly | ❌ FALSE |
| `README.md:432-448` | "API Testing with cURL" — `curl .../api/admin/users`, `POST /api/projects`, `/api/metrics` | Static export, zero route handlers. All three would 404. No `$ADMIN_TOKEN` exists anywhere in the codebase | ❌ FALSE — actively misleads testers |
| `README.md:668` | Feature Matrix Pillar 6: **SSO (SAML/OIDC)** | Zero implementation. No OIDC/SAML lib in `package.json` | ❌ FALSE |
| `README.md:674` | Feature Matrix Pillar 6: **2FA Authentication (TOTP)** | Zero implementation. No TOTP lib, no UI, no state | ❌ FALSE |
| `README.md:671` | Feature Matrix Pillar 6: **Secrets Vault (encrypted)** | Zero implementation | ❌ FALSE |
| `README.md:648` | Feature Matrix Pillar 4: **Horizontal Auto-Scaling** | Zero implementation. No autoscaler, no metrics pipeline | ❌ FALSE |
| `README.md:651` | Feature Matrix Pillar 4: **Point-in-Time Recovery** | Zero implementation. Only mock `backup-manager.tsx` UI | ❌ FALSE |
| `README.md:647` | Feature Matrix Pillar 4: **Multi-Node Cluster** | Zero implementation. Only `admin/infrastructure/` mock UI | ❌ FALSE |
| `README.md:675` | Feature Matrix Pillar 6: **On-Premise Deployment** | Zero implementation | ❌ FALSE |
| `README.md:676` | Feature Matrix Pillar 6: **White-Label Mode** | Zero implementation | ❌ FALSE |
| `README.md:650` | Feature Matrix Pillar 4: **Database-as-a-Service (1-click)** | Mock UI only, no DB driver | ⚠️ OVERSTATED (presented in a "Feature Matrix" without a mock marker) |
| `README.md:637` | Feature Matrix Pillar 3: **Preview Environments (URL staging + DB cloning)** | Only `gitops-client.tsx` mock UI; no cloning logic | ⚠️ OVERSTATED |
| `README.md:616` | Feature Matrix Pillar 1: **AI Log Analyzer (root-cause analysis)** | `ai-diagnose-dialog.tsx` renders a hardcoded `MockDeployments` string | ⚠️ OVERSTATED |
| `README.md:617` | Feature Matrix Pillar 1: **AI Infra Generator (IaC from NL)** | **No such page, component, or file anywhere** | ❌ FALSE |
| `README.md:619` | Feature Matrix Pillar 1: **Smart Prompt History (searchable)** | No such feature | ❌ FALSE |
| `README.md:626-630` | Pillar 2: **Nixpacks + Buildpacks, Live Preview (HMR), Device & Network Simulator, Mock API Server** | None implemented. IDE editor is read-only mock (`page-project-ide.md:14`) | ❌ FALSE |
| `README.md:641` | Pillar 3: **Private Artifact Registry (Docker/NPM/PyPI)** | Zero implementation | ❌ FALSE |
| `README.md:649` | Pillar 4: **Internal Service Discovery (private DNS)** | Zero implementation | ❌ FALSE |
| `README.md:652` | Pillar 4: **Edge CDN Integration** | Zero implementation | ❌ FALSE |
| `README.md:660` | Pillar 5: **Real User Monitoring (Core Web Vitals)** | No RUM, no web-vitals lib, no beacon | ❌ FALSE |
| `README.md:670` | Pillar 6: **Automated SAST/DAST** | `ai-reviewer` shows a **mock** findings list (`mock-data-reviewer.ts`); no scanner is wired | ❌ FALSE |
| `README.md:753-762` | Competitor table: ✅ for AI Prompt Engineer, Cloud IDE, RBAC, Preview Environments, **Multi-Node Cluster**, FinOps per-app, BYOC, **On-Premise** | 4 of 8 ✅ have no implementation (Multi-Node Cluster, On-Premise, plus the AI/IDE rows are mock UI). Presented as shipped, unmarked | ❌ FALSE / investor-misleading |
| `README.md:688-705` | Architecture diagram: **API (GraphQL)**, **Auth (NextAuth)**, **Billing (Stripe)**, 🔒 Middleware, Agent VPS #1/#2/#N | None of these exist. No GraphQL schema, no NextAuth, no Stripe, no middleware.ts, no agent | ❌ FALSE |
| `README.md:722` | Tech Stack: `Deployment \| Belum dikonfigurasi \| 🔮 Docker/K8s planned` | Dockerfile + docker-compose.yml + nginx.conf + GitHub Actions workflow all exist | 🕐 STALE (understates) |
| `README.md:802` | `npm run start` = "Start production server" | `output: "export"` → `next start` errors. No server exists | ❌ FALSE (broken command) |
| `README.md:806-807` | `verify.sh` = "lint + typecheck + build" | True *only after* `npm ci`; `node_modules` absent here, `npm run lint` exits 127, and `npx tsc` resolved to **global TypeScript 7.0.2** instead of project `^5` | ⚠️ MISLEADING (unpinned compiler, unenforced) |
| `README.md:770` | Prerequisite "Node.js **≥ 20.9.0** (LTS)" | Nothing enforces it — no `engines` in `package.json`. CI uses 20, Docker uses 24 | ⚠️ INCONSISTENT |
| `README.md:773` | "PostgreSQL (optional, SQLite for dev)" | No Prisma, no SQLite, no DB driver of any kind. Pure invention | ❌ FALSE |
| `README.md:779` | `git clone https://github.com/yourusername/omnistack.git` | Placeholder `yourusername`; real org is `yogiex` (cf. `README.md:15`) | ❌ FALSE |
| `README.md:833` | Project Structure: `│   │   ├── [id]/  # Detail proyek` at the `(dashboard)` level | Actual path is `app/(dashboard)/projects/[id]/` — `[id]` is nested under `projects/`, not a sibling | ❌ FALSE (wrong tree) |
| `README.md:824-844` | Project Structure omits `(ide)/`, `privacy/`, `terms/`, `forgot-password/`, and the whole `admin/*` subtree | All exist in the repo | 🕐 STALE |
| `README.md:851-854` | `lib/` = `auth-context.tsx`, `mock-data.ts`, `utils.ts` | Omits `lib/mock-ide-data.ts` (7.6 KB, real) | 🕐 STALE |
| `README.md:963` | Roadmap Phase 2: `- [ ] Cloud IDE` (not started) | Cloud IDE fully built — `app/(ide)/` + 12 components, commits `de678b8`/`cac9b3d` | 🕐 STALE |
| `README.md:964` | Roadmap Phase 2: `- [ ] User management UI (admin)` | Built — `app/(dashboard)/admin/users/` + 6 sub-components, commit `95c6914` | 🕐 STALE |
| `README.md:958-978` | Roadmap Phase 2/3 omits Deployments, AI Reviewer, Monitoring, Error Tracking, Databases, GitOps, Admin console | All 7 shipped (commits `21251a4`, `cc743ea`, `6803fc5`, `de678b8`, …) | 🕐 STALE |
| `README.md:572` | "ARCHITECTURE.md — ADR-006: Role-based Access Control Design" | `ARCHITECTURE.md` contains only ADR-001…ADR-005 (`:1023`, `:1046`, `:1069`, `:1091`, `:1114`). **There is no ADR-006** | ❌ FALSE (dangling reference) |
| `README.md:13`/`:1025`, `CHANGELOG.md:287-291` | MIT / `github.com/yourusername/omnistack` / `docs.omnistack.dev` / `demo.omnistack.dev` | No LICENSE; all four URLs are placeholders or non-resolving anchors (`(#)`) | ❌ FALSE |
| `README.md:261` | "Semua halaman di atas masih mock UI — belum ada backend" | ✅ **TRUE** — and this is the only line that correctly qualifies the entire Route Access Map | ✅ TRUE (but insufficiently prominent) |
| `README.md:884` | `dev-1` is "1 commit di depan `main`" | `git rev-list --left-right --count main...origin/dev-1` → `8  1` | ✅ TRUE |
| `README.md:873`, `:892` | `dev` → `dev-1` is "+17 commit"; `dev` has "total 5 commit" | `dev`=5, `dev-1`=22, delta=17 | ✅ TRUE |
| `README.md:938-941` | `dev`=`3029daa`, `dev-1`=`7bb7714` "feat(logs)", `main`=`69bc6b2`, `gh-pages`=`ea909d4` | All four verified by `git show -s` / `git log` | ✅ TRUE |
| `README.md:886`, `:943-944` | `gh-pages` is force-orphaned by CI, never edit manually | `deploy.yml:41` `force_orphan: true` | ✅ TRUE |
| `README.md:822-862` sidebar ASCII blocks (3 groups, 7 admin items, VIEWER read-only footer) | — | Verified against `components/app-sidebar.tsx:187-189` (Workspace/Administrasi/Akun), `:118-124` (7 admin items), `:196-198` ("Read-only mode"), `:71` (ADMIN→`/admin`), `:77-80` (All/Shared/My Projects) | ✅ TRUE |
| `ARCHITECTURE.md:101` | High-level diagram: `API LAYER — Route Handlers (app/api/*)` | `app/api/` does not exist. **Directly contradicted by `ARCHITECTURE.md:331`** in the same file | ❌ FALSE (self-contradiction) |
| `ARCHITECTURE.md:108-111` | External Services: Database (Postgres), Auth (NextAuth), Storage (S3), AI Provider (OpenAI/Claude) | None present in `package.json` | ❌ FALSE |
| `ARCHITECTURE.md:212`, `:505` | Root layout = "ThemeProvider, **TooltipProvider**, font" | `app/layout.tsx:18-38` has `AuthProvider` + `ThemeProvider` only. **No `TooltipProvider` anywhere** | ❌ FALSE (also repeated in `docs/kg/_index.md:35`) |
| `ARCHITECTURE.md:971` | "**Next.js Font** — Font optimization (**Geist**)" | `app/layout.tsx:2,8-11` uses `next/font/local` with `Inter-Variable.woff2` | ❌ FALSE |
| `ARCHITECTURE.md:993-1000` | Font optimization code sample: `import { Geist, Geist_Mono } from "next/font/google"` | Geist is no longer used anywhere in the codebase | ❌ FALSE (copy-paste error) |
| `ARCHITECTURE.md:1080` | ADR-003 Decision: "**(marketing)** untuk public marketing pages" | No `(marketing)/` group exists. **Contradicted by `ARCHITECTURE.md:335-336`** in the same file | ❌ FALSE (self-contradiction) |
| `ARCHITECTURE.md:1124-1131` | ADR-005 quotes tsconfig as containing `noUncheckedIndexedAccess: true, noImplicitOverride: true` | `tsconfig.json` contains only `"strict": true` (`:11`). Neither extra flag is present | ❌ FALSE (ADR quotes a config that doesn't exist) |
| `ARCHITECTURE.md:938-959` | Theme variables as HSL triplets: `--background: 0 0% 100%`, `--primary: 240 5.9% 10%` | `app/globals.css:52-84` uses **oklch()**: `--background: oklch(1 0 0)`, `--primary: oklch(0.205 0 0)` | ❌ FALSE (entire colour system documented in the wrong colour space) |
| `ARCHITECTURE.md:350` | `components/ui/` — "shadcn/ui primitives (**18 files**)" | 19 files (added `select.tsx`/`textarea.tsx` etc.) | ❌ FALSE (off-by-one) |
| `ARCHITECTURE.md:970` | "Next.js Image — Automatic image optimization" | `next.config.ts:9` `images: { unoptimized: true }`; `output: "export"` cannot optimize images | 🕐 STALE |
| `ARCHITECTURE.md:1226-1227` | Daily maintenance: "Monitor error tracking (**Sentry**)", "Review performance metrics (**Vercel Analytics**)" | Neither package is installed; both are the app's own *mock* pages | ❌ FALSE |
| `ARCHITECTURE.md:664`, `:708`, `:733`, `:840`, `:850` | Data-flow examples use `import { db } from "@/lib/db"` and `fetch("/api/projects")`, `fetch("/api/projects/:id/deploy")` | `@/lib/db` does not exist; `/api/*` cannot exist under `output: "export"`. These are the *canonical* patterns a developer will copy | ❌ FALSE (copy-paste trap) |
| `ARCHITECTURE.md:1023-1139` | "Key Decisions (ADRs)" — 5 records | **No ADR for `output: "export"`** (static export), despite it being the single most consequential decision in the project: it forbids Route Handlers, Server Actions, `next/image`, middleware, and any server runtime | 🚨 **CRITICAL GAP** |
| `ARCHITECTURE.md:194` | `INFRASTRUCTURE.md  # Infrastruktur & deployment` | `INFRASTRUCTURE.md` is 100% AI-agent infrastructure. `grep -i "docker\|nginx\|deploy\|container"` → **NONE** | ❌ FALSE |
| `ARCHITECTURE.md:333` | "Lihat `INFRASTRUCTURE.md` untuk detail deployment" | Deployment docs live in `README.docker.md` | ❌ FALSE (wrong pointer) |
| `ARCHITECTURE.md:1313` | Version History `1.2.0 \| 2026-09-26` records the structure sync | That sync is **uncommitted** (working tree only) | 🕐 STALE (changelog for uncommitted work) |
| `ARCHITECTURE.md:200-202` | "tidak ada `tailwind.config.ts`" | ✅ Confirmed — no such file; Tailwind v4 is CSS-first via `app/globals.css` | ✅ TRUE |
| `AGENTS.md:56` | Tech Stack: "**Font** \| Geist (via next/font) \| Vercel's font" | `app/layout.tsx` uses local **Inter** variable woff2 | ❌ FALSE |
| `AGENTS.md:489-490` | Gotcha #3: "Next.js 16 font loading bug with Turbopack … gunakan class `font-sans`" | Root cause removed — the app no longer calls `next/font/google`. The gotcha now sends agents down a dead path | 🕐 STALE |
| `AGENTS.md:100` | Project Structure: `lib/constants.ts  # Global constants` | **Does not exist** — `lib/` contains only `auth-context.tsx`, `mock-data.ts`, `mock-ide-data.ts`, `utils.ts` | ❌ FALSE (also `CONVENTIONS.md:74`) |
| `AGENTS.md:87` | Project Structure: `app/api/  # API routes (future)` | Does not exist; `ARCHITECTURE.md:331` says it never will under `output: "export"` | ❌ FALSE |
| `AGENTS.md:68` | `layout.tsx # Root layout (ThemeProvider, TooltipProvider)` | No `TooltipProvider` | ❌ FALSE |
| `AGENTS.md:333` | `npm run start` = "Start production server" | Broken under `output: "export"` | ❌ FALSE |
| `AGENTS.md:557-559` | `npm run test` / `test:watch` / `test:coverage` | **None exist** in `package.json:5-10`; no test framework installed | ❌ FALSE (guarded by a "(Future)" note at `:555`, but shown as runnable commands) |
| `AGENTS.md:71` | Structure lists `app/(dashboard)/[id]/` | Actual: `app/(dashboard)/projects/[id]/` | ❌ FALSE |
| `AGENTS.md:86-92` | Structure lists `api/` future and `lib/constants.ts` | Neither exists | ❌ FALSE |
| `AGENTS.md` 🔴 Priority table | "WAJIB baca `docs/kg/_index.md` … validate after writing" | `validate-kg.sh` **exits 1** today (see KG section) — agents following the rule are told to gate on a red check | 🕐 STALE |
| `CONVENTIONS.md:336-339` | Route Groups example: `(marketing)/about/page.tsx` → `/about`, `(marketing)/pricing/page.tsx` → `/pricing` | Neither `app/about/` nor `app/pricing/` exists | ❌ FALSE |
| `CONVENTIONS.md:713` | Client-component example: `const res = await fetch("/api/projects")` | 404 under static export | ❌ FALSE |
| `CONVENTIONS.md:808` | Error-handling example: `fetch("/api/projects/${projectId}/deploy")` | 404 under static export | ❌ FALSE |
| `CONVENTIONS.md:1035` | `npm run start` | Broken | ❌ FALSE |
| `CONVENTIONS.md:74` | `Constants` naming example: `lib/constants.ts` | File does not exist | ⚠️ illustrative, but the file is presented as an existing example |
| `CONVENTIONS.md:886`, `:894` | Import-order example: `import type { Project } from "@/lib/types"`, `import logo from "@/public/logo.svg"` | `lib/types/` does not exist; `public/logo.svg` does not exist; importing from `public/` is invalid Next.js regardless | ❌ FALSE |
| `CONVENTIONS.md:1146` | "**Last Updated:** 2026-08-23" | File mtime is 2026-08-30 and it was touched by commit `ca61cd0` | 🕐 STALE metadata |
| `DESIGN.md:151` | "OmniStack menggunakan **Geist** sebagai font family utama" | Local **Inter** variable font | ❌ FALSE |
| `DESIGN.md:157` | `--font-sans: 'Geist', -apple-system, ...` | `app/globals.css:10` is `--font-sans: var(--font-sans)` — a **self-referential** custom property with no `:root` definition anywhere in the repo | ❌ FALSE (and the real token is broken, see Fix List) |
| `DESIGN.md:160` | `--font-mono: 'Geist Mono', ...` | `app/globals.css:11` is `--font-mono: var(--font-geist-mono)`; `--font-geist-mono` is **never defined** in the repo | ❌ FALSE (broken token) |
| `DESIGN.md:84-104` | Colour system as HSL triplets (`240 5.9% 10%`, `0 84.2% 60.2%`) | `app/globals.css:52-117` is **oklch()** throughout | ❌ FALSE (wrong colour space) |
| `DESIGN.md:422-423` | `className="text-[#61DAFB]"` / `text-[#2496ED]` — hardcoded hex | Directly contradicts `AGENTS.md` "❌ DON'T #3: JANGAN hardcode warna hex" and `DESIGN.md:137` "Gunakan warna semantic tokens, bukan hex hardcoded" | ⚠️ INTERNAL CONTRADICTION (line 428 does carve out brand logos, but the rule isn't reconciled) |
| `DESIGN.md:698-700` | Version History: only `1.0 \| 2026-08-22` | `ARCHITECTURE.md:1313` is at `1.2.0 \| 2026-09-26`; DESIGN.md never updated | 🕐 STALE |
| `DESIGN.md:495-505` | `animate-in fade-in duration-300`, `slide-in-from-bottom-4` | ✅ Works — `app/globals.css:2` `@import "tw-animate-css"` provides these utilities | ✅ TRUE |
| `INFRASTRUCTURE.md:194`-context / `ARCHITECTURE.md:194` | INFRASTRUCTURE.md documents "infrastruktur & deployment" | Contains **zero** deployment content | ❌ FALSE |
| `INFRASTRUCTURE.md:166` | Validator checks "dead links, relasi ilegal, **asimetri**" | `validate-kg.sh` implements 3 checks; **symmetry is not one of them** | ❌ FALSE (capability overclaim) |
| `INFRASTRUCTURE.md:166` | "Hasil harus `RESULT: OK`" | Validator currently prints `RESULT: FAIL`, exit 1 | 🕐 STALE |
| `INFRASTRUCTURE.md:168-169` | "Status saat ini: graf belum lengkap (beberapa wikilinks menunjuk node yang belum dibuat)" | ✅ **TRUE and commendably honest** — 13 dead links confirmed | ✅ TRUE |
| `INFRASTRUCTURE.md:6` | "Last updated: 2026-08-23" | Deployment stack (Docker/CI) added 2026-09-26 and is **not** covered by this doc at all | 🕐 STALE |
| `docs/kg/_index.md:14` | "Jaga simetri inverse … Validasi: `validate-kg.sh`" | Validator does not check symmetry | ❌ FALSE |
| `docs/kg/_index.md:35` | "app/layout.tsx, ThemeProvider + **TooltipProvider**" | No `TooltipProvider` | ❌ FALSE |
| `docs/kg/_index.md:38-39,46-49,52,58-59,64-65` | 13 wikilinks to nodes with no file | All 13 targets missing (see KG section) | ❌ FALSE (graph integrity) |
| `docs/kg/_ontology.md:51` | "Semua relasi bersifat simetri-lewat-inverse … **Validator mengecek ini**" | Not implemented; and the graph has ≥2 confirmed asymmetries | ❌ FALSE |
| `docs/kg/_ontology.md:31` | "Node wajib memakai kelas paling spesifik" | Validator checks only that a `| Class ` row exists, not that the value is in §1. `_template.md:5` ships a `<kelas paling spesifik…>` placeholder and `docs/kg/nodes/_template.md` is excluded from checks, so a copy-pasted template passes | ⚠️ unenforced |
| `docs/kg/nodes/page-deployments.md:33-34` | `usedBy ← [[page-dashboard-shell]]` | `page-dashboard-shell.md:26-28` does not list `page-deployments` → **asymmetric** | ❌ FALSE (unvalidated) |
| `docs/kg/nodes/page-project-ide.md:23` | `dependsOn → [[lib-auth-context]]` | `lib-auth-context.md:18-21` `usedBy ←` omits `page-project-ide` → **asymmetric** | ❌ FALSE (unvalidated) |
| `docs/kg/nodes/page-dashboard-shell.md:33` | "Wajib `suppressHydrationWarning` di html/**body**" | `app/layout.tsx:24` sets it on `<html>` only; `<body>` (`:25`) has no such attribute | ❌ FALSE (minor but agent-actionable) |
| `CHANGELOG.md:29-69` | `[Unreleased]` documents the project state | **Missing all 24 post-1.0.0 commits**: Cloud IDE (`de678b8`, `cac9b3d`), AI Code Reviewer (`cc743ea`), Deployments (`21251a4`), per-project Databases, GitOps, Monitoring, Error Tracking, admin console (users/audit/billing/ai-config/infrastructure/settings), FinOps rebuild (`6803fc5`, `858c4f2`), RBAC VIEWER blueprint (`c9d4182`), projects UI/UX pass (`b6b8b41`), AI-agent infra (`.opencode/`, `docs/kg/`) (`67d193c`), login quick-login filter (`f3cb0df`), noise.svg (`25db115`), docs sync (`ca61cd0`) | 🕐 **STALE — major** |
| `CHANGELOG.md:245` | Version History Summary: Unreleased = "Projects Dashboard blueprint, mock RBAC data, AI Architect (WIP), FinOps" | Only 4 of ~15 shipped features named — and Cloud IDE / AI Reviewer / Admin console / Deployments are missing entirely | 🕐 STALE |
| `CHANGELOG.md:125`, `:213`, `:340` | "**Geist font** (Vercel's font family)" | Now local Inter | 🕐 STALE (historical entry, but never superseded) |
| `CHANGELOG.md:135` | "Route Groups pattern (`(dashboard)`, **`(marketing)`**)" | No `(marketing)` group has ever existed in the current tree | ❌ FALSE |
| `CHANGELOG.md:157` | "**Route conflict** — Hapus `app/page.tsx` agar `(dashboard)/page.tsx` yang render" | `app/page.tsx` **exists**; `app/(dashboard)/page.tsx` **does not**. This fix was reverted but is still logged as applied | ❌ FALSE (reverted-but-logged) |
| `CHANGELOG.md:166` | "**Image optimization** siap pakai via next/image" | `next.config.ts:9` `images: { unoptimized: true }` | 🕐 STALE |
| `CHANGELOG.md:173` | "Setup comprehensive documentation suite (**5 file markdown**)" | 8 root docs + `README.docker.md` + `docs/kg/**` (12 files) | 🕐 STALE |
| `CHANGELOG.md:287-291` | Repo/docs/demo links → `github.com/yourusername/omnistack`, `docs.omnistack.dev`, `demo.omnistack.dev`, all `(#)` | Placeholders; none resolve | ❌ FALSE |
| `CHANGELOG.md:248` | Version `0.0.0 \| 2026-08-20 \| 💡 Concept` | No such commit or tag in git history (oldest is `03c0c5e` Initial commit) | ❌ FALSE |
| `CLAUDE.md:1` | `@AGENTS.md` | ✅ Correct — 1-line import, and `AGENTS.md` is the comprehensive guide | ✅ TRUE |
| `README.docker.md:6-10` | "tidak satu pun perintah docker/npm/next dijalankan … semua ukuran adalah **target, bukan hasil ukur**" | ✅ Honest, accurate, and the best-documented file in the repo | ✅ TRUE (model behaviour) |
| `README.docker.md:24` | `node:24-alpine (Node 20 EOL 30 Apr 2026)` | Accurate rationale — and it flatly contradicts `deploy.yml:25` `node-version: 20` | ⚠️ INTERNAL CONTRADICTION across files |
| `README.docker.md:55` | `cd /mnt/storage/code/omnistack` | Machine-specific absolute path baked into operator docs | ⚠️ MINOR |
| `README.docker.md:107` | `docker-compose build --build-arg NEXT_PUBLIC_BASE_PATH=/omnistack` | Produces a **broken** site: `nginx.conf` has no basePath handling (see A7) | ❌ FALSE (instruction yields a broken deployment) |
| `README.docker.md:446` | `FROM node:24-alpine@sha256:<PLACEHOLDER_DIGEST_NODE_24_ALPINE>` | Placeholder, but disclosed at `:531-537` as unverified | ⚠️ disclosed placeholder, acceptable |
| `README.docker.md:537` | "`node_modules` tidak terpasang di host" | ✅ Confirmed — `node_modules/` absent in this working copy | ✅ TRUE |

---

## Documentation Fix List

### P0 — Actively misleads a user or investor (fix before any demo)

1. **`README.md:606-676` "Complete Feature Matrix"** — add a status column (`✅ shipped` / `🧪 mock UI` / `📋 roadmap`) and reclassify. Minimum: move to roadmap, or mark `🧪 mock`, all of: SSO (`:673`), 2FA (`:674`), Secrets Vault (`:671`), Auto-Scaling (`:648`), Point-in-Time Recovery (`:651`), Multi-Node Cluster (`:647`), On-Premise (`:675`), White-Label (`:676`), SAST/DAST (`:670`), Artifact Registry (`:641`), Service Discovery (`:649`), Edge CDN (`:652`), RUM (`:660`), AI Infra Generator (`:617`), Smart Prompt History (`:619`), Nixpacks/Buildpacks (`:626`), Live Preview HMR (`:628`), Device Simulator (`:629`), Mock API Server (`:630`), Preview Environments (`:637`), DBaaS (`:650`).
   *Rationale:* the Pillar 6 and Pillar 4 tables read as a shipped product. They are the single highest-risk block in the repo for anyone evaluating it.
2. **`README.md:751-762` competitor comparison table** — replace the 4 unsupported ✅ with `📋` / `🧪`. Currently asserts OmniStack beats Vercel/CyberPanel/Coolify on **Multi-Node Cluster** and **On-Premise**, neither of which exists in any form.
3. **`README.md:432-448` "API Testing with cURL"** — **delete the section.** All three endpoints 404 and `$ADMIN_TOKEN` is undefined anywhere. Replace with: "There is no API. OmniStack is a static export (`output: "export"`); all data is mock, in-memory, per-browser."
4. **`README.md:684-706` Control Plane / Data Plane diagram** — delete or relabel `API (GraphQL)`, `Auth (NextAuth)`, `Billing (Stripe)`, `🔒 Middleware`, and `Agent VPS #1/#2/#N`. None exist. A single grey box reading "static HTML/JS/CSS served by nginx or GitHub Pages" is the truth.
5. **`README.md:235` `/pricing` and `README.md:255` `/api/*`** — remove both rows from the Route Access Map.
6. **`README.md:572` "ADR-006: Role-based Access Control Design"** — either write ADR-006 or change the pointer to `ADR-001`/§Key Decisions. It currently points at nothing.
7. **`README.md:773` "PostgreSQL (optional, SQLite for dev)"** — delete. There is no database and no ORM.

### P1 — Config/doc inconsistency that will break a build or a deploy

8. **Add `"typecheck": "tsc --noEmit"` to `package.json:5-10`** and change `verify.sh:33` from `npx tsc --noEmit` to `npm run typecheck`. Without this, the typecheck step runs whatever `tsc` npx can find — in this tree that was a **global TypeScript 7.0.2** against a project declaring `typescript: "^5"`.
9. **Fix or remove `package.json:8` `"start": "next start"`.** Options: delete the script, or change it to `npx serve@latest out`. Then update `README.md:802`, `CONVENTIONS.md:1035`, `AGENTS.md:333`. This is the first command a new operator will run and it is guaranteed to fail.
10. **Commit `public/fonts/Inter-Variable.woff2` together with `app/layout.tsx`.** `next/font/local` hard-fails the build if the file is absent, and the font is currently untracked. Add a note to `README.docker.md` §Troubleshooting.
11. **Reconcile Node versions.** Set `deploy.yml:25` to `node-version: 24` (matching `Dockerfile:4` and `README.docker.md:24`'s own EOL rationale), and add `"engines": { "node": ">=20.9.0" }` + `"packageManager"` to `package.json` so `README.md:770` is enforced rather than aspirational.
12. **Fix the broken font tokens in `app/globals.css:10-12`.**
    ```css
    --font-sans: var(--font-sans);        /* self-referential → invalid */
    --font-mono: var(--font-geist-mono);  /* var never defined anywhere */
    ```
    `app/globals.css:127` does `@apply font-sans` on `html`, so `html`'s font-family resolves to nothing. Today the page *appears* to work only because `app/layout.tsx:25` puts `inter.className` on `<body>`, which overrides `html` for the whole subtree — and `font-mono` is broken outright. Either define `--font-sans` in `:root` (`:52`) or switch `@theme inline` to a literal stack. **Note: this is a code fix, but it is a *documentation-driven* discovery — `DESIGN.md:157-160` is the only place that states what these tokens are supposed to be, and it is wrong.**
13. **Document the nginx basePath limitation, or fix it.** `docker/nginx.conf` has zero basePath handling; `README.docker.md:107` tells the reader to build with a basePath that will 404 every asset. Either add a prefix-stripping `location ^~ /omnistack/` block, or delete the `--build-arg` example and state plainly that the container image only supports the empty basePath.
14. **Wire `verify.sh` into CI.** Add a `pull_request` job running `bash .opencode/skills/omnistack-quality-gate/scripts/verify.sh --no-build` **before** the deploy job, and make `deploy` depend on it. Today `main` → production has zero lint/typecheck.

### P2 — Architecture documentation that contradicts itself

15. **Add an ADR for `output: "export"`.** `ARCHITECTURE.md:1023-1139` stops at ADR-005. Static export is the decision that forbids Route Handlers, Server Actions, `next/image`, `middleware.ts`, ISR, and any server runtime — it deserves an ADR with its trade-offs and its escape hatch.
16. **`ARCHITECTURE.md:101` — delete the `API LAYER / Route Handlers (app/api/*)` box.** `ARCHITECTURE.md:331` already states the opposite 230 lines later. Self-contradiction in a document AI agents are told to read first.
17. **`ARCHITECTURE.md:1080` — remove `(marketing)` from ADR-003.** Contradicted by `ARCHITECTURE.md:335-336`. Same pattern as #16.
18. **`ARCHITECTURE.md:971` and `:993-1000` — replace Geist with the local Inter setup.** `app/layout.tsx:2,8-11` is the truth; also update `AGENTS.md:56`, `AGENTS.md:489-490` (Gotcha #3 is now obsolete), and `DESIGN.md:151/157/160`.
19. **`ARCHITECTURE.md:212` and `:505` — remove `TooltipProvider`** (never existed in the current tree). Same in `docs/kg/_index.md:35`.
20. **`ARCHITECTURE.md:938-959` and `DESIGN.md:84-104` — rewrite the colour tables from HSL to oklch**, matching `app/globals.css:52-117`. Every value in both docs is wrong, and the wrong colour *space* means an agent regenerating tokens from the docs will produce a broken palette.
21. **`ARCHITECTURE.md:1124-1131` — correct ADR-005's quoted tsconfig.** It cites `noUncheckedIndexedAccess` and `noImplicitOverride`; `tsconfig.json` has neither. Either add the flags (matching the ADR's intent) or fix the ADR.
22. **`ARCHITECTURE.md:194` and `:333` — repoint INFRASTRUCTURE.md references.** `INFRASTRUCTURE.md` has no deployment content at all (`grep` → NONE). Point deployment readers at `README.docker.md`, and retitle the `ARCHITECTURE.md:194` entry to "AI agent infrastructure".
23. **`ARCHITECTURE.md:1226-1227` — remove Sentry / Vercel Analytics from "Daily" tasks.** Neither is installed; both are the app's own mock pages.
24. **`ARCHITECTURE.md:664/708/733/840/850` — replace `@/lib/db` and `/api/*` examples** with the actual pattern (`lib/mock-data.ts` + `getMockProjectsByUser()`). These are the copy-paste sources.
25. **`ARCHITECTURE.md:350` — "18 files" → 19.** Trivial, but it is a count a reader may use to spot a missing primitive.
26. **`ARCHITECTURE.md:970` — note that `images: { unoptimized: true }` is forced** by `output: "export"`, so "automatic image optimization" is off.

### P3 — Consistency and staleness sweep

27. **`AGENTS.md:100` — remove `lib/constants.ts`.** The file does not exist. Also `AGENTS.md:87` (`app/api/`), `AGENTS.md:71` (`(dashboard)/[id]/` → `projects/[id]/`), `AGENTS.md:557-559` (`npm run test*` — no such scripts), `CONVENTIONS.md:74`.
28. **`CONVENTIONS.md:336-339` — drop the `(marketing)/about` + `(marketing)/pricing` example.** Neither route exists. Replace with the real `(ide)` group.
29. **`CONVENTIONS.md:713`, `:808` — remove `fetch("/api/...")` from examples.**
30. **`CONVENTIONS.md:886`, `:894` — fix `@/lib/types` and `@/public/logo.svg`.** Neither exists; importing from `public/` is invalid.
31. **`CONVENTIONS.md:1146` / `INFRASTRUCTURE.md:6` — refresh "Last Updated".** Both say 2026-08-23; the files were edited 2026-08-30 and deployment landed 2026-09-26.
32. **`CHANGELOG.md` — write the missing ~15 entries** for commits `95c6914`, `bf76c95`, `c9d4182`, `6803fc5`, `858c4f2`, `f3cb0df`, `25db115`, `67d193c`, `ca61cd0`, `b6b8b41`, `21251a4`, `cc743ea`, `de678b8`, `cac9b3d`, `a8996e9` — plus the entire Docker/CI stack. Update the summary table at `:245`.
33. **`CHANGELOG.md:135` — remove `(marketing)`. `:157` — mark the "Hapus `app/page.tsx`" fix as reverted.** `app/page.tsx` exists; `app/(dashboard)/page.tsx` does not.
34. **`CHANGELOG.md:287-291` + `README.md:779` — replace every `yourusername` / `docs.omnistack.dev` / `demo.omnistack.dev` placeholder** with the real `yogiex/omnistack`, or delete the "Links" block.
35. **Add a `LICENSE` file (MIT) or remove all three MIT claims** (`README.md:13`, `README.md:1025`, `CHANGELOG.md:351`) and the `README.md:13` badge. Add `"license": "MIT"` to `package.json`.
36. **`README.md:822-862` — refresh the project-structure tree**: add `(ide)/`, `privacy/`, `terms/`, `forgot-password/`, the `admin/*` subtree, `lib/mock-ide-data.ts`, and move `[id]/` under `projects/`.
37. **`README.md:958-978` — tick Cloud IDE and Admin User Management; add Deployments, AI Reviewer, Monitoring, Error Tracking, Databases, GitOps to Phase 2.** They are shipped.
38. **`README.md:722` — change `Deployment \| Belum dikonfigurasi`** to ✅ with pointers to `Dockerfile`, `docker-compose.yml`, `.github/workflows/deploy.yml`, `README.docker.md`.
39. **`DESIGN.md:698-700` — add a 1.2.0 row** to match `ARCHITECTURE.md:1313`.
40. **`DESIGN.md:428` vs `AGENTS.md` "no hardcoded hex"** — add an explicit carve-out sentence: "brand logo colors from `react-icons/si` are the sole exception; everything else uses semantic tokens."
41. **`Dockerfile:29` — fix `org.opencontainers.image.source`** to `https://github.com/yogiex/omnistack`.
42. **`README.docker.md:55` — replace the hardcoded `/mnt/storage/code/omnistack`** with a generic `cd omnistack`.
43. **Add `!.env.example` to `.gitignore`** after line 34, otherwise the template is not actually tracked despite being the documented entry point (`README.docker.md:58`).

---

## KG Validation

Command run (read-only, no writes):

```
$ bash .opencode/skills/omnistack-kg/scripts/validate-kg.sh
```

Verbatim output:

```
DEAD LINK:
[[component-app-sidebar]]
[[component-project-status-badge]]
[[component-route-guard]]
[[component-top-nav]]
[[concept-color-tokens]]
[[concept-server-first]]
[[lib-mock-data]]
[[lib-utils]]
[[page-dashboard]]
[[page-landing]]
[[page-login-register]]
[[page-projects]]
[[page-root-layout]]
---
---
RESULT: FAIL
EXIT=1
```

**Result: `RESULT: FAIL`, exit 1.** 13 dead wikilinks. The KG is a documented 🔴-priority gate (`AGENTS.md` Priority table; `INFRASTRUCTURE.md:166` "Hasil harus `RESULT: OK`") and it is currently red on `main`.

**What exists vs what `_index.md` claims (9 nodes exist, 13 referenced nodes are missing):**

| Present in `docs/kg/nodes/` | Referenced by `_index.md` but **no file** |
|---|---|
| `component-ai-reviewer-results.md` | `component-app-sidebar` |
| `component-cloud-ide.md` | `component-project-status-badge` |
| `component-deployment-dialogs.md` | `component-route-guard` |
| `concept-base-ui-not-radix.md` | `component-top-nav` |
| `lib-auth-context.md` | `concept-color-tokens` |
| `lib-mock-ide-data.md` | `concept-server-first` |
| `page-dashboard-shell.md` | `lib-mock-data` |
| `page-deployments.md` | `lib-utils` |
| `page-project-ide.md` | `page-dashboard` |
| `_template.md` (excluded by design) | `page-landing` |
| | `page-login-register` |
| | `page-projects` |
| | `page-root-layout` |

**Wikilink symmetry — NOT checked by the validator, and genuinely broken.** Two hand-verified asymmetric pairs (the validator's 3 checks cannot catch these):

| Declaring side | Declares | Inverse side | Reality |
|---|---|---|---|
| `docs/kg/nodes/page-deployments.md:33-34` | `### usedBy ←` → `[[page-dashboard-shell]]` | `docs/kg/nodes/page-dashboard-shell.md:26-28` | `usedBy ←` lists only `page-dashboard`, `page-projects`. **`page-deployments` absent.** |
| `docs/kg/nodes/page-project-ide.md:23` | `### dependsOn →` → `[[lib-auth-context]]` | `docs/kg/nodes/lib-auth-context.md:18-21` | `usedBy ←` lists only `page-login-register`, `component-route-guard`, `page-dashboard-shell`. **`page-project-ide` absent.** |

Additional dead links hidden inside existing node files (the same 13 names recur as *edges*, not just index entries): `page-dashboard-shell.md:16,19,20,21,27,28`, `page-deployments.md:30`, `lib-auth-context.md:16,19,20,21`.

**Nodes with no entry in `_index.md`:** none — all 9 real nodes are indexed. The graph is over-referenced, not under-indexed.

**Other KG gaps:**
- `docs/kg/_index.md:35` describes `app/layout.tsx` as "ThemeProvider + **TooltipProvider**" — no `TooltipProvider` exists (`app/layout.tsx:18-38`).
- `docs/kg/nodes/page-dashboard-shell.md:33` — "suppressHydrationWarning di html/**body**" — set on `<html>` only (`app/layout.tsx:24`).
- The validator does not verify that `Class` values exist in `_ontology.md §1`, that `Files` paths exist on disk, or that `Status` is in the enum. `_template.md:5` ships a literal `<kelas paling spesifik dari docs/kg/_ontology.md §1>` placeholder; `_template.md` is excluded from checks by name, so a copy-paste into a new file passes validation while carrying a non-class.
- Nothing has a `concept-` node for the **static-export constraint** — arguably the most important gotcha in the repo (it is why there is no `app/api/`, no `next/image`, no `middleware.ts`). `AGENTS.md` tells agents to obey node "Gotchas"; this one is not written down anywhere in the KG.

**Honesty credit where due:** `INFRASTRUCTURE.md:168-169` explicitly states *"Status saat ini: graf belum lengkap (be beberapa wikilinks menunjuk node yang belum dibuat)"*. That disclosure is accurate.

---

## Broken Doc Links

Method: extracted every markdown link target from the 8 root docs and resolved each against the filesystem. **All `./FILE.md` relative links resolve correctly** — including `README.docker.md` (untracked but present), `docs/kg/_index.md`, and `docs/kg/_ontology.md`. Zero broken `./`-prefixed links.

Broken links found:

| Location | Link | Status |
|---|---|---|
| `README.md:13` | `[![License](…)](LICENSE)` | ❌ **`LICENSE` does not exist** (badge target) |
| `README.md:1025` | `[LICENSE](LICENSE)` | ❌ **`LICENSE` does not exist** |
| `CHANGELOG.md:351` | `[LICENSE](LICENSE)` | ❌ **`LICENSE` does not exist** |
| `README.md:779` | `https://github.com/yourusername/omnistack.git` | ❌ **placeholder** — real org is `yogiex` |
| `CHANGELOG.md:287` | `[github.com/yourusername/omnistack](#)` | ❌ **placeholder + dead anchor** |
| `CHANGELOG.md:288` | `[docs.omnistack.dev](#)` | ❌ **placeholder + dead anchor** |
| `CHANGELOG.md:289` | `[demo.omnistack.dev](#)` | ❌ **placeholder + dead anchor** |
| `CHANGELOG.md:290` | `[github.com/yourusername/omnistack/issues](#)` | ❌ **placeholder + dead anchor** |
| `CHANGELOG.md:291` | `[github.com/yourusername/omnistack/discussions](#)` | ❌ **placeholder + dead anchor** |
| `ARCHITECTURE.md:1288` | `[README.docker.md](./README.docker.md)` | ⚠️ resolves on disk, but the target is **untracked** — broken for anyone who clones |
| `ARCHITECTURE.md:186` | `docker-compose.yml  # Local container orchestration` (listed in root structure) | ⚠️ untracked |
| `ARCHITECTURE.md:185` | `Dockerfile  # Multi-stage build → nginx-unprivileged` | ⚠️ untracked |
| `ARCHITECTURE.md:196` | `README.docker.md  # Panduan menjalankan via Docker` | ⚠️ untracked |
| `ARCHITECTURE.md:188` | `.env.example  # Environment variable template` | ⚠️ untracked *and* gitignored (`.gitignore:34`) |
| `ARCHITECTURE.md:171` | `.github/workflows/deploy.yml  # CI: static export → GitHub Pages` | ✅ tracked, but the workflow will not see `Dockerfile`/`docker/` — the two deployment stories are in different states |
| `README.md:572` | "ARCHITECTURE.md — **ADR-006**" | ❌ **not a broken path, but a broken *reference*** — no ADR-006 exists in the target file |
| `AGENTS.md` 🔴 Priority table | `docs/kg/nodes/<node-relevan>.md` | ❌ 13 of the nodes `_index.md` routes agents to have no file |
| `README.docker.md:446` | `node:24-alpine@sha256:<PLACEHOLDER_DIGEST_NODE_24_ALPINE>` | ⚠️ disclosed placeholder (`:531-537`) — acceptable |

Anchor check on `README.md:15` nav bar: `[Demo](https://yogiex.github.io/omnistack/) • [Features](#-complete-feature-matrix) • [Role System](#-role-system--access-control) • [Branching](#-branching-strategy) • [Quick Start](#-quick-start) • [Roadmap](#️-roadmap)` — all five anchors match real headings; the `[Roadmap](#️-roadmap)` anchor carries a stray U+FE0F variation selector before the hyphen, which is fragile but resolves on GitHub. `README.md:1035` references `#-quick-start`, `#-testing-the-roles`, `#-documentation` — all present. (The uncommitted diff replaced `[Demo](#-demo)` — a genuinely dead anchor — with the real URL. ✅ improvement.)

---

## Repo Hygiene

### H1. Stray root artifacts — all **TRACKED and committed** (worse than untracked)

`git ls-files` confirms every one of these is in the repo, not just sitting in the working tree:

| File | Size | Tracked | Introduced by | Assessment |
|---|---|---|---|---|
| `qwen-result.txt` | 50 KB | ✅ TRACKED | `a8996e9` "chore: update blueprint reference files" | **Junk.** A raw LLM output dump. No frontmatter, no filename convention, no reference from any doc. `.dockerignore:29` (`qwen-*.txt`) excludes it from the image, so the author was aware it shouldn't ship — but it is still in git and still in the repo root. |
| `qwen-uiux-page-finops.md` | 76 KB | ✅ TRACKED | `a8996e9` | **Design reference — intentional but misplaced.** Real UI/UX spec for the FinOps page. Confirmed intentional: commit `6803fc5` "feat(finops): rebuild FinOps dashboard with RBAC-aware orchestrator" follows it directly. But it is a *historical* spec, not living documentation, and it documents the wrong font (`:17` "Font \| Geist (UI), Geist Mono", `:410-414` throughout) — actively misleading if an agent reads it. → `docs/blueprints/finops.md`. |
| `ai-code-reviewer-page.md` | 32 KB | ✅ TRACKED | `cc743ea` "feat(ai-reviewer): rebuild AI Code Reviewer page with 16 components" | **Design reference — intentional.** Same commit as the implementation. Should live under `docs/blueprints/`, not at the root competing with `README.md`. |
| `next-update-fitur-competitor-v0-vercel-cyberpanel.md` | 18 KB | ✅ TRACKED | `a8996e9` | **Design reference — intentional.** Competitor-analysis / feature-update brief. Again: belongs in `docs/`. |
| `app/page.tsx.bak` | — | ✅ **TRACKED** | — | **Junk — the worst of the set.** A backup file inside `app/`, **committed to git**. Nothing routes it (Next only reads `page.tsx`), and `*.bak` is not matched by `tsconfig.json`'s include globs, so it is inert — but it is a stale duplicate of the landing page sitting in the router directory. Anyone doing `find app -name 'page*'` gets a false positive. |

**Net:** ~176 KB of design/LLM scratch at the repo root, 4 of 5 tracked, none referenced from `README.md`, `ARCHITECTURE.md`, `docs/`, or the KG. Root-directory signal-to-noise is poor: 12 `.md` files where 8 belong.

### H2. `.opencode/` gitignore — ✅ CORRECT

```
.opencode/.gitignore:
  node_modules
  package.json
  package-lock.json
  bun.lock
  .gitignore
```

Verified: `git check-ignore -v .opencode/package.json` → `.opencode/.gitignore:2:package.json`. `.opencode/package.json` (65 B), `.opencode/package-lock.json` (14.6 KB) and `.opencode/node_modules/` (29 entries) are all correctly excluded. The `.gitignore` file itself is the one file in `.opencode/` that *should* be tracked — and `.gitignore` does not ignore itself, so it is. **No issue.** (Minor: the file has no trailing newline — cosmetic.)

### H3. Secrets — ✅ CLEAN

- `.env.example` contains **no real values**: `APP_PORT=18080` (a local port) and `NEXT_PUBLIC_BASE_PATH=` (empty). The header at `:1-6` states outright: *"This repo currently contains NO real secrets: the app is a static export with no database and no auth backend."* — verified true.
- `.gitignore:34` `.env*` and `.dockerignore:42` `.env*` both exclude real env files. ⚠️ the `.env*` glob also swallows `.env.example` (see Fix List #43).
- No `secrets.*` in the workflow beyond `secrets.GITHUB_TOKEN`; `permissions: contents: write` is correctly scoped to the one job (`deploy.yml:8-9`).
- The mock credentials in `README.md:77-78/119-120/162-163/392-393` and `lib/mock-data.ts:88,98,108` (`admin@omnistack.dev`/`admin123` etc.) are **hardcoded demo fixtures in a mock-only app with no backend** — not a leak, but they *are* published in a README. The app's own `README.docker.md:388` and `docker-compose.yml:18-27` correctly acknowledge there is no real authentication.
- `grep` for private-key/PAT patterns: none found. No `.pem` tracked (`.gitignore:25` covers them).

### H4. Other hygiene notes

- ⚠️ **`ARCHITECTURE.md:1313` logs a `1.2.0 | 2026-09-26` version-history entry for a sync that is still uncommitted.** A changelog entry for work not yet in git history.
- ⚠️ `ARCHITECTURE.md:194-197` and `docs/kg` document `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `README.docker.md`, and `.env.example` as part of the root structure — all untracked or untracked+ignored. The documented tree and the committed tree disagree.
- ✅ `CLAUDE.md` is a correct 1-line `@AGENTS.md` pointer — no duplication drift possible. Good pattern.
- ⚠️ `.next/` contains only `dev/` and `_events_1288076.json` — build/dev output, gitignored (`.gitignore:17`), not committed. **Not a finding.**
- ⚠️ `node_modules/` is absent from the working copy entirely, which means `verify.sh` cannot currently be executed to green and the quality gate is unrunnable as-is. Worth confirming this is a deliberate sandbox state and not a broken checkout.

---

## Statistics

**Severity tally**

| Severity | Count | Representative |
|---|---:|---|
| 🔴 CRITICAL | 6 | `npm start` broken; untracked font breaks Docker/CI build; no ADR for `output: "export"`; Feature Matrix + competitor table overclaim ~20 unimplemented features; cURL/API-testing section; `/pricing` + `/api/*` in Route Access Map |
| 🟠 MAJOR | 11 | No `typecheck` script / unpinned `tsc`; quality gate absent from CI; nginx incompatible with `NEXT_PUBLIC_BASE_PATH`; Node 20 (EOL) in CI vs 24 in Docker; `validate-kg.sh` FAILS; validator doesn't check the symmetry it claims; colour tokens documented in HSL vs oklch; `TooltipProvider`/Geist/`(marketing)`/`app/api` self-contradictions in ARCHITECTURE.md; INFRASTRUCTURE.md contains no deployment content; CHANGELOG missing ~15 shipped features |
| 🟡 MINOR | 14 | 19-vs-18 component count; broken `LICENSE` ×3; `yourusername` placeholders ×5; obsolete font gotcha in AGENTS.md; `lib/constants.ts` references; `.env.example` gitignored; wrong OCI source label; machine-specific path in README.docker.md |
| **Total findings** | **31** | |

**Requested counters**

- **Config files audited: 18** — `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `next-env.d.ts`, `.env.example`, `.gitignore`, `.dockerignore`, `app/globals.css`, `Dockerfile`, `docker-compose.yml`, `docker/nginx.conf`, `.github/workflows/deploy.yml`, `.opencode/.gitignore`, `.opencode/package.json` (+ `.opencode/package-lock.json`)
- **Docs audited: 24** — `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `CONVENTIONS.md`, `DESIGN.md`, `INFRASTRUCTURE.md`, `CHANGELOG.md`, `CLAUDE.md`, `README.docker.md` (9 root), `docs/kg/_index.md`, `docs/kg/_ontology.md`, 9 KG nodes + `_template.md` (12), `omnistack-kg/SKILL.md`, `omnistack-quality-gate/SKILL.md` (2). Plus 4 stray root `.md` assessed for intent.
- **FALSE claims: 62** rows in the discrepancy table
- **STALE claims: 19** rows (🕐 STALE / INCONSISTENT / MISLEADING / OVERSTATED / INTERNAL CONTRADICTION)
- **Broken links: 8 hard-broken** (3 × `LICENSE`, 5 × placeholder/dead-anchor URLs) **+ 6 doc-referenced-but-untracked paths** (`Dockerfile`, `docker-compose.yml`, `docker/`, `.env.example`, `README.docker.md`, `public/fonts/`) **+ 14 dangling references** (1 missing ADR-006, 13 KG nodes with no file) = **28 total**
- **KG validator: `RESULT: FAIL`, exit 1, 13 dead links, ≥2 undetected asymmetries**
- **Quality gate: `npm run lint` exits 127** (`eslint: not found`); `npx tsc` resolved to **global TypeScript 7.0.2** vs project `typescript: "^5"`

**Single most important finding:** the docs are not *slightly* stale — `README.md` and `ARCHITECTURE.md` each contain claims that are *internally contradicted by the other file in the same repo* (`README.md:255` `/api/*` vs `ARCHITECTURE.md:331` "Tidak ada `app/api/`"; `ARCHITECTURE.md:101` Route Handlers vs its own `:331`; `ARCHITECTURE.md:1080` `(marketing)` vs its own `:335`). A reader cannot tell which half is current. The most consequential architectural decision in the project — `output: "export"` — has **no ADR**, and every doc that touches it (`DESIGN.md:422`, `CONVENTIONS.md:713/808`, `ARCHITECTURE.md:708/840/850`, `README.md:437/443/447`) still demonstrates patterns that static export makes impossible.
