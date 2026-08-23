# Landing Patterns, Charts & Typography — Distilled Catalogs

Source: ui-ux-pro-max landing.csv (34 patterns), charts.csv (25 types), typography.csv (74 pairings) — MIT. Web-relevant subset, adapted for OmniStack.

## 1. Landing Page Patterns (34)

Pick a pattern BEFORE writing sections. Section order matters — it's the pattern's core value.

| Pattern | Section Order | CTA Placement | Conversion Notes |
|---------|--------------|---------------|------------------|
| **Hero + Features + CTA** ⭐ SaaS default | Hero > Value prop > Features (3–5) > CTA > Footer | Hero sticky + bottom | Deep CTA; label contrast ≥4.5:1 vs button fill |
| **Hero + Testimonials + CTA** | Hero > Problem > Solution > Testimonials > CTA | Hero + post-testimonials | Social proof BEFORE cta; carousel needs pause/prev/next controls |
| Product Demo + Features | Hero > Video/mockup > Feature breakdown > Comparison > CTA | Video center + bottom | Captions + transcript + visible pause; no autoplay |
| Minimal Single Column | Hero headline > Short desc > ≤3 benefits > CTA | Center, large | Single-CTA focus, whitespace, no nav clutter |
| Funnel (3-Step) | Hero > Step1 problem > Step2 solution > Step3 action | Mini per step + main final | Progressive disclosure + progress indicators |
| Comparison Table + CTA | Hero > Problem > Comparison vs competitors > Pricing? > CTA | Right col + below table | Highlight own product row |
| Lead Magnet + Form | Hero > Magnet preview > Minimal form > Submit | Submit button | Ask only what's needed to deliver the magnet |
| Pricing Page + CTA ⭐ PaaS | Hero > Price cards (3 tiers) > Feature table > FAQ > Final CTA | Per card + sticky nav | Show annual savings transparently; FAQ handles objections |
| Video-First Hero | Video hero > Features overlay > Benefits > CTA | Overlay + bottom | Overlay must guarantee text contrast; captions + pause |
| Scroll-Triggered Storytelling | Hook > Ch.1 problem > Ch.2 journey > Ch.3 solution > Climax CTA | End chapters + climax | Narrative works WITHOUT scroll effects; DOM order complete; reduced-motion fallback |
| Waitlist / Coming Soon | Countdown hero > Teaser > Email capture > Waitlist count | Capture form | Pre-launch Micro-SaaS |
| FAQ/Documentation Landing ⭐ docs/API portal | Hero with search > Categories > FAQ accordion > Support CTA | Support/contact | Search bar in hero is the pattern signature |
| Enterprise Gateway | Hero (mission/video) > Solutions by industry > By role > Client logos > Contact Sales | Contact Sales | Credibility-first |
| Bento Grid Showcase ⭐ feature-rich | Hero > Bento grid features > Detail cards > Tech specs > CTA | After specs | See styles-detail.md for bento spec |
| AI-Driven Dynamic Landing ⭐ AI Architect | Prompt/input hero > Generated preview > How it works > Value prop | After preview | Input-first hero is the signature |
| Feature-Rich Showcase | Hero > Feature grid (4–6) > Use cases > Logos/social proof > CTA | Bottom | Standard product marketing |
| Hero-Centric Design | Full-bleed hero > Value prop strip > Key proof > Primary CTA | Single primary | One message, one action |
| Trust & Authority + Conversion ⭐ infra/PaaS | Hero (credibility) > Proof (logos/certs/stats) > Solution > Clear CTA path | Post-proof | Trust before pitch |

Others (use when relevant): App Store Style · Event/Conference · Review/Ratings Focused · Community/Forum · Before-After Transformation · Marketplace/Directory · Newsletter/Content First · Webinar Registration · Portfolio Grid · Horizontal Scroll Journey · Interactive 3D Configurator.

**Universal conversion rules:** one primary CTA per screen · CTA label ≥4.5:1 against fill · social proof adjacent to CTA decisions · every video/carousel has controls + reduced-motion behavior · content readable without JS-driven effects.

## 2. Chart Types (25) — mapped to data questions

| Data Question | Best Chart | Secondary | Notes |
|---------------|-----------|-----------|-------|
| Trend over time | Line | Area, smooth area | FinOps spend-over-time default |
| Compare categories | Bar (H/V) | Grouped bar | Horizontal when labels long |
| Part-to-whole | Pie/Donut | Stacked bar, waffle | ≤5 slices max, else bar |
| Correlation/distribution | Scatter/Bubble | Heat map, matrix | Cluster analysis |
| Intensity/density | Heat map / choropleth | Grid heat map | Calendar heatmaps for activity |
| Geographic | Choropleth / bubble map | Geo heat map | Region deployment maps |
| Funnel/flow | Funnel / Sankey | Waterfall | Deployment pipeline drop-off |
| Performance vs target | Gauge / Bullet chart | Dial, thermometer | KPI cards |
| Compact target | Bullet chart | Progress bar | Dashboard rows of KPIs |
| Forecast | Line + confidence band | Ribbon | Projected costs |
| Anomaly/outlier | Line + highlights | Scatter + alert | Spend spike alerts |
| Hierarchical | Treemap | Sunburst, icicle | Cost breakdown by service |
| Flow/process | Sankey | Alluvial, chord | Resource → app cost flow |
| Cumulative change | Waterfall | Stacked bar | Month-over-month delta |
| Multi-variable | Radar / Spider | Parallel coords | Rarely; prefer grouped bars |
| Stock/OHLC | Candlestick | OHLC bar | Trading only |
| Network/relationship | Network graph | Adjacency matrix | Service dependency graphs |
| Statistical distribution | Box plot | Violin, beeswarm | Latency distributions |
| Proportional compact | Waffle | Pictogram | Quota usage |
| Real-time streaming | Streaming area | Ticker, moving gauge | Live status feeds |
| Root cause decomposition | Decomposition tree | Decision tree | Drill-down cost attribution |

**Chart implementation rules (OmniStack):** use shadcn `ChartContainer` + `chartConfig` (semantic colors from tokens) + `ChartTooltip`; never inline hex. Legends clickable to toggle series; tooltips keyboard-accessible; skeleton while loading (never empty axis frame); error state with retry; empty state "No data yet" + guidance; aggregate at 1000+ points; `tabular-nums` on all data labels; gridlines gray-200-level subtle; text summary via aria-label for screen readers.

## 3. Typography Pairings — OmniStack-relevant (from 74)

| Pairing Name | Heading + Body | Mood | Best For |
|--------------|---------------|------|----------|
| **Minimal Swiss** ⭐ dashboards/docs | Inter + Inter | minimal, functional, neutral | Dashboards, admin panels, enterprise apps, design systems |
| **Tech Startup** ⭐ landing | Space Grotesk + DM Sans | tech, bold, futuristic | Startups, SaaS, developer tools, AI products |
| Developer Mono ⭐ console | JetBrains Mono + IBM Plex Sans | code, precise, technical | Dev tools, documentation, CLI apps |
| Friendly SaaS | Plus Jakarta Sans + Plus Jakarta Sans | friendly, clean, approachable | SaaS products, web apps, B2B productivity |
| Modern Professional | Poppins + Open Sans | modern, corporate, approachable | Corporate sites, business apps |
| Corporate Trust (a11y) | Lexend + Source Sans 3 | trustworthy, accessible, readable | Enterprise, finance, accessibility-focused |
| Financial Trust | IBM Plex Sans + IBM Plex Sans | financial, secure, professional | Banking, fintech, investment |
| Dashboard Data | Fira Code + Fira Sans | data, technical, precise | Analytics dashboards, admin panels |
| Science/Tech | Exo + Roboto Mono | research, futuristic, precise | Data-heavy sites, tech docs |
| Modern Dark Cinema | Inter + Inter | dark, premium, precision | Dev tools, AI dashboards, trading |
| Terminal CLI Monospace | mono stack | hacker, terminal | Dev tools, security aesthetics |

**Rules:**
- Pairing = heading personality × body readability; don't mix two display fonts.
- OmniStack ships Geist — treat Geist as body/UI default; add a display font (e.g., Space Grotesk) for landing heroes if brand direction calls for it. Monospace accents (JetBrains Mono/Fira Code) fit dev-tool surfaces (code snippets, IDs, logs).
- Load via self-hosted variable fonts (next/font); reserve space to avoid CLS; tabular figures (`font-feature-settings: "tnum"`) for all numeric columns.
