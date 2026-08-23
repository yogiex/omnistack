# Motion Presets — Interaction & Animation Recipes

Distilled from ui-ux-pro-max motion.csv (17 GSAP presets across 3 intensity tiers) + animation rules from ux-guidelines.csv. MIT. Adapted for React/Next.js + Tailwind.

## Intensity Tiers

| Tier | Use For | Character |
|------|---------|-----------|
| **Subtle** | Dashboards, admin panels, OmniStack default | Fade/lift ≤2px, 150–350ms, power1.out |
| **Standard** | Marketing pages, landing sections | Slide-up 24px, stagger 80ms, 400–600ms, power2.out |
| **Complex** | Hero moments, storytelling (max 1–2 per page) | Pin/scrub/magnetic, elastic curves |

## Preset Library

### Hover Micro-interactions
- **Subtle (buttons):** `y: -1, opacity: 0.9, duration: 0.15` — displacement <2px reads as feedback, not motion. Tailwind equivalent: `hover:-translate-y-0.5 transition-all duration-150`.
- **Standard (cards):** `y: -4, scale: 1.02, shadow-elevate, duration: 0.25` — pair with matching mouseleave reverse; use `quickTo()` when a list has 20+ hover targets (avoids tween churn).
- **Complex (magnetic cursor):** pointer-follow with pull strength clamped ×0.3; max 1–2 focal elements per screen; `will-change: transform`; cleanup listener on unmount.

### Scroll Reveal
- **Subtle:** fade + y:12, start 'top 90%', `toggleActions: 'play none none reverse'`.
- **Standard:** children stagger 0.08s, y:24 — scope to section container; never stagger >8 items.
- **Complex (scrollytelling):** pin + scrub 0.5–1.5 (never instant); pin needs deterministic height; refresh after images/fonts load; max 1–2 pinned sections per page; test mid-tier mobile.
- SEO rule: below-fold content must not be invisible-by-default without no-JS fallback.

### Stagger List
- 30–50ms per item entrance; grid/list reveals; cap at ~8 visible staggered children before the tail feels laggy.

### Page Transition
- Maintain spatial continuity: forward = slide left/up, backward = right/down; shared-element transitions for drill-down (project card → project detail).

### Parallax Scroll
- Sparingly; MUST respect prefers-reduced-motion with static fallback; never disorienting.

### Loading / Skeleton
- Skeleton matches final content dimensions exactly (CLS prevention); shimmer via opacity pulse, not layout movement.

### Carousel / Auto-Rotation
- Always prev/next + pause controls; stop on focus/hover; stop permanently under reduced-motion.

## Universal Motion Laws (non-negotiable)

1. **transform/opacity only** — animating width/height/top/left triggers reflow.
2. **Reduced motion:** every effect needs a `prefers-reduced-motion: reduce` path that shows the FINAL readable state.
3. **Interruptible:** user input cancels in-flight animation immediately; correctness NEVER waits for `animationend`.
4. **Exit faster than enter:** exit ≈60–70% of enter duration.
5. **Meaning:** every animation expresses cause-effect; decorative infinite motion is banned except loaders.
6. **Budget:** ≤2 animated key elements per view (dashboards); unified duration/easing tokens globally (`--duration-fast/base/slow`, `--ease-out/entry` etc. as CSS vars).
7. **Easing:** decelerate (ease-out) entering · accelerate (ease-in) leaving · linear only for constant-rate (spinners/progress).
8. **Scale feedback:** press scale 0.95–1.05, restore on release. Tailwind: `active:scale-[0.98]`.
9. **Opacity floor:** nothing lingers below 0.2 opacity — fade fully or stay visible.
10. **Modal motion:** animate from trigger source (scale+fade); scrim fades independently.

## React/Next.js Implementation Notes

- Prefer CSS transitions/Tailwind utilities for hover/focus/press states (compositor-friendly, zero JS).
- Reach for JS animation (GSAP/Framer Motion) only for scroll-driven, staggered orchestration, or shared-element work; register plugins once; scope to container refs; cleanup in effect teardown.
- Respect reduced-motion in JS: check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip/short-circuit tweens; in CSS use the media query to zero durations.
