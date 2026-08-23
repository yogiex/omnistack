# Node: component-ai-reviewer-results

| Field | Value |
|-------|-------|
| Class | Component |
| Files | app/(dashboard)/ai-reviewer/_components/results/results-view.tsx, app/(dashboard)/ai-reviewer/_components/results/results-header.tsx, app/(dashboard)/ai-reviewer/_components/results/results-tabs.tsx, app/(dashboard)/ai-reviewer/_components/results/overview-tab.tsx, app/(dashboard)/ai-reviewer/_components/results/findings-list.tsx, app/(dashboard)/ai-reviewer/_components/results/findings-filters.tsx |
| Status | wip |

## Purpose

Tabbed results view for AI Code Reviewer — displays review findings organized by severity with filtering, overview stats, and severity breakdown. Core deliverable of the reviewer feature (v1 scope).

## Relations

### dependsOn →
- [[concept-base-ui-not-radix]] (Tabs, Select from Base UI)

### usedBy ←
- (rendered by review-shell.tsx in the ai-reviewer page)

## Gotchas

- Base UI Select `onValueChange` receives `string | null`, not `string` — always null-check.
- Tabs use Base UI (not Radix) — `value` prop on TabsTrigger/TabsContent, `defaultValue` on Tabs root.
- All 6 files are client components ("use client") except results-header.tsx and overview-tab.tsx which are server-compatible but rendered from client parent.
