# Active Task Memory

> Recitation pattern: agent WAJIB membaca file ini di awal task dan
> meng-update-nya di setiap milestone besar. Tujuan: menjaga objectives
> tetap visible di recent tokens (anti goal-drift) dan persisten antar sesi.

## Current Task

- Status: READY_TO_COMMIT (3 feat groups done, unverified UI check)
- Branch: `dev-1` (bukan `main` — push ke main = auto-deploy)
- Last commit: `98d4611` docs(readme)

### Selesai tapi BELUM di-commit (working tree)

**A. Color Palette Theme Changer** (5 subagent paralel)
- `lib/theme/palettes.ts`, `lib/theme/palette-provider.tsx`
- `components/theme-switcher.tsx`, `components/palette-picker-inline.tsx`
- `app/layout.tsx` (PaletteProvider + init script + TooltipProvider), `app/globals.css` (10 blok palette), `components/top-nav.tsx` (swap toggle), `DESIGN.md` (dokumentasi + fix HSL→oklch)
- VERIFIED: agent claim `beforeInteractive` script TIDAK muncul di `out/index.html` — BELUM diverifikasi ulang

**B. FinOps Z-pattern refactor** (mostly by cancelled agent, saya lengkapi)
- 4 KPI: `lib/kpi/presets/finops.tsx`, `lib/kpi/types.ts` (trendLabel fungsi), `components/kpi/kpi-section.tsx`
- `finops-header.tsx`, `critical-alert-banner.tsx`, `infra-breakdown-strip.tsx` (baru)
- `cost-trend-chart.tsx`, `cost-breakdown-table.tsx` (+showOwner), `budget-settings.tsx` + `export-panel.tsx` (+collapsible)
- `finops-client.tsx`, HAPUS `finops-overview.tsx`, `lib/utils.ts` (+formatUSD)
- VERIFIED: tsc exit 0, eslint 0 error, next build sukses 77/77

**C. Favicon + icon system**
- `app/icon.svg` (3 layer isometrik), `app/apple-icon.png` (180px), `app/favicon.ico` (16/32/48)
- `scripts/favicon.mjs` (regenerate: `node scripts/favicon.mjs`)
- VERIFIED: PNG hasil render sudah dicek visual, gradient benar

**D. Kebersihan**
- `package.json` + `package-lock.json`: `npm i -D sharp png-to-ico`
- Bersih 6 import mati: `admin-overview.tsx`, `client-dashboard.tsx`

### Quality Gate (WAJIB hijau. JANGAN pakai `npm run build`; gunakan binary langsung)

```bash
./node_modules/.bin/tsc --noEmit                # WAJIB exit 0
./node_modules/.bin/eslint app lib components  # WAJIB 0 error (warning OK)
./node_modules/.bin/next build                  # WAJIB sukses
```

Current: tsc 0 ✅ | eslint 0 error / 4 warning ✅ | build 77/77 ✅

## Next Steps

1. **Verifikasi A** — cek `out/index.html` untuk string `omnistack-palette`. Kalau tidak ada, `beforeInteractive` tidak jalan di static export → ganti strategi (coba `next/script` tanpa `strategy`, atau taruh script inline di `<head>` via `dangerouslySetInnerHTML` — tapi itu forbidden, karena itu akan muncul sebagai temuan baru di audit)
2. **Cek visual palette** — belum pernah dibuka di browser. 6 palette × light/dark
3. **Cek export item FinOps** — verifikasi string "belum ada backend export" muncul, dan scroll-to-`#export-reports` bener
4. **Pisah 2 commit** — jangan campur:
   - `feat(theme): color palette system` → A
   - `feat(finops): Z-pattern refactor with owner column and alert banner` → B
   - `feat(icon): add app icon, favicon, and apple-icon` → C (+ package.json, scripts/)
5. **Update KG** — `AGENTS.md` mewajibkan. Node baru: `component-kpi-section`, `lib-kpi-presets`, `component-theme-switcher`, `lib-theme-palettes`, `page-finops` (kalau ada). `docs/kg/_index.md` masih punya 13 dead wikilink
6. **Jangan push `main`** — `deploy.yml` trigger `on: push: branches: [main]`. Push `dev-1` → PR

## Blockers

- **Tidak ada.** Semua tooling lengkap: `tsc` 5.9.3 lokal, `next` 16.3.2. JANGAN `npm install` lagi.
- 4 eslint warning tersisa di `app/(dashboard)/projects/[id]/logs/**` — pre-existing dari fitur `logs` di `dev-1`, bukan scope FinOps/palette. Biarkan atau bersihkan terpisah.
