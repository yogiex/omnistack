# Style Deep Specs — Key Styles for OmniStack

Full specifications (colors, CSS keywords, design-system variables, implementation checklists) for styles most relevant to OmniStack surfaces, plus the complete 50-style catalog index. Source: ui-ux-pro-max styles.csv (MIT).

## Minimalism & Swiss Style ⭐ default for OmniStack marketing + docs

- **Colors:** Monochrome (#000/#FFF); neutrals (Beige #F5F1E8, Grey #808080, Taupe #B38B6D) + ONE primary accent only
- **Effects:** Subtle hover 200–250ms, smooth transitions, sharp shadows if any, clear type hierarchy
- **CSS:** `display: grid; gap: 2rem; max-width: 1200px` · clean borders · no box-shadow unless necessary
- **Variables:** `--spacing: 2rem; --border-radius: 0px; --font-weight: 400-700; --shadow: none; --accent-color: single`
- **Checklist:** ☐ Grid 12–16 cols ☐ Clear type hierarchy ☐ Zero unnecessary decoration ☐ Contrast measured ☐ Responsive grid
- **Don't use for:** playful brands, entertainment, artistic experiments

## Glassmorphism — modals, overlays, hero accents on OmniStack landing

- **Colors:** Translucent white rgba(255,255,255,0.1–0.3) over VIBRANT bg (Electric Blue #0080FF, Neon Purple #8B00FF, Teal #20B2AA)
- **Effects:** backdrop blur 10–20px, 1px border rgba(255,255,255,0.2), light reflection, z-depth layering
- **CSS:** `backdrop-filter: blur(15px); background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2)` (+ -webkit- prefix)
- **Variables:** `--blur-amount: 15px; --glass-opacity: 0.15; --border-color: rgba(255,255,255,0.2)`
- **Checklist:** ☐ Blur 10–20px ☐ Translucent 15–30% ☐ Subtle light border ☐ Vibrant background VERIFIED behind glass ☐ Text contrast 4.5:1 checked over composed result
- **A11y risk: CONDITIONAL** — fails on low-contrast backgrounds and dark-text-on-dark; always measure composed contrast
- **Don't use for:** critical accessibility contexts, performance-limited pages

## Dark Mode (OLED) — developer console / dashboard dark theme

- **Colors:** Deep Black #000000 / Dark Grey #121212 / Midnight Blue #0A0E27; accents Neon Green #39FF14, Electric Blue #0080FF, Gold #FFD700
- **Effects:** minimal glow (`text-shadow: 0 0 10px`, sparingly), low white emission, visible focus
- **CSS:** `background: #000000 or #121212; color: #FFFFFF or #E0E0E0; color-scheme: dark`
- **Variables:** `--bg-black: #000000; --text-primary: #FFFFFF; --accent-neon: <neon>; --glow-effect: minimal`
- **Checklist:** ☐ True deep black/grey base ☐ Text contrast 7:1+ in dark ☐ Minimal glow ☐ No white backgrounds
- **Light mode: not recommended as primary** — pair with a real light scheme via semantic tokens instead of inverting

## Data-Dense Dashboard ⭐ FinOps dashboard style

- **Colors:** Neutral base (#F5F5F5/white) + data colors; status: success #22C55E, warning #F59E0B, alert #EF4444, neutral grey; text #333333
- **Effects:** hover tooltips, chart zoom on click, row highlight on hover, smooth filter animations, loading spinners for data
- **CSS:** `display: grid; grid-template-columns: repeat(12,1fr); gap: 8px; padding: 12px; font-size: 12-14px; overflow: auto` tables with sticky headers
- **Variables:** `--grid-gap: 8px; --card-padding: 12px; --table-row-height: 36px; --sidebar-width: 240px; --header-height: 56px`
- **Checklist:** ☐ 12-col grid ☐ Responsive KPI cards ☐ Sortable tables ☐ Functional filters ☐ Data loading states ☐ Export functionality

## Bento Box Grid — feature showcases, project overview cards

- **Colors:** Neutral base (#FFF/#F5F5F7) + brand accent; subtle gradients per card
- **Effects:** varied grid spans, rounded-xl/24px, subtle shadow `0 4px 6px rgba(0,0,0,0.05)`, hover scale 1.02
- **CSS:** `display: grid; grid-template-columns: repeat(4,1fr); grid-auto-rows: 200px; gap: 16px; border-radius: 24px`
- **Variables:** `--grid-gap: 16px; --card-radius: 24px; --page-bg: #F5F5F7; --hover-scale: 1.02`
- **Checklist:** ☐ Grid collapses 4→2→1 cols ☐ Varied card spans ☐ Consistent radii ☐ Content fits cards
- **Don't use for:** dense data tables, text-heavy content, real-time monitoring (use Data-Dense Dashboard)

## Flat Design — MVP surfaces, simple utility screens

- **Colors:** 4–6 solid bright colors max, complementary muted secondaries
- **Effects:** NO gradients/shadows; simple color/opacity hover 150–200ms
- **CSS:** `box-shadow: none; border-radius: 0-4px; fill: solid; stroke: 1-2px` simplified SVG icons
- **Variables:** `--shadow: none; --color-palette: 4-6 solid; --border-radius: 2px; --gradient: none`

## Soft UI Evolution — modern business-tool feel with depth

- **Colors:** Improved-contrast pastels (Soft Blue #87CEEB, Soft Green #90EE90) with clear hierarchy
- **Effects:** softer multi-layer shadows than flat but clearer than neumorphism; animations 200–300ms; visible focus outline 2–3px
- **CSS:** `box-shadow: 0 2px 4px (multi-layer soft); border-radius: 8-12px; outline: 2-3px on focus; contrast 4.5:1+`
- **Don't confuse with Neumorphism** (deprecated-adjacent, conditional a11y risk from low contrast)

## Dimensional Layering — cards/modals/navigation depth system

- **Elevation scale:** `--elevation-1: 0 1px 3px rgba(0,0,0,0.1)` → `--elevation-2: 0 4px 6px` → `--elevation-3: 0 10px 20px` → `--elevation-4: 0 20px 40px rgba(0,0,0,0.15)`; `--blur-amount: 8px`
- **A11y risk: HIGH** — overlapping layers frequently break contrast & focus visibility; audit composed results
- Use this elevation scale as OmniStack's shadow tokens rather than ad-hoc values

---

## Complete Catalog Index (50 active styles)

Minimalism & Swiss · Flat Design · Glassmorphism · Soft UI Evolution · Data-Dense Dashboard · Bento Box Grid · Dimensional Layering · Dark Mode (OLED) · Micro-interactions · Motion-Driven · Kinetic Typography · Parallax Storytelling · Exaggerated Minimalism · Editorial Grid/Magazine · Aurora UI · Claymorphism · Neumorphism · Neubrutalism · Brutalism · Bauhaus · Memphis Design · Y2K Aesthetic · Retro-Futurism · Cyberpunk UI · HUD / Sci-Fi FUI · Pixel Art · Vintage Analog/Retro Film · Gen Z Chaos/Maximalism · Anti-Polish/Raw · Skeuomorphism · 3D & Hyperrealism · 3D Product Preview · Interactive Cursor Design · Tactile Digital/Deformable · Liquid Glass (Apple material) · Spatial UI VisionOS · Material 3 Expressive (Mobile) · Fluent 2 · Shopify Polaris · Adobe Spectrum · Accessible & Ethical · Inclusive Design · Organic Biophilic · Nature Distilled · Biomimetic/Organic 2.0 · E-Ink/Paper · AI-Native UI · Zero Interface · Voice-First Multimodal

Selection rules:
1. ONE coherent primary style per surface (landing vs dashboard may differ deliberately).
2. Match product profile first (SKILL.md §5), style second.
3. Check "don't use for" before committing — e.g., Bento ≠ dense tables; Glassmorphism ≠ critical-a11y contexts.
4. All web-relevant active styles support both themes except Dark Mode OLED (dark-primary by design).
