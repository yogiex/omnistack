# 📊 UI/UX Blueprint: FinOps Dashboard
## File: `uiux-page-finops.md`

```markdown
# 📊 FinOps Dashboard — UI/UX Blueprint

##  Page Metadata

| Property | Value |
|----------|-------|
| **Route** | `/finops` (ADMIN, USER, VIEWER) |
| **File** | `app/(dashboard)/finops/page.tsx` |
| **Component Type** | Server Component (default) |
| **Layout** | Dashboard Shell (Sidebar + TopNav) |
| **Access Control** | RBAC: ADMIN (all), USER (own), VIEWER (shared, RO) |
| **Theme** | Dark/Light mode (semantic tokens) |
| **Font** | Geist (UI), Geist Mono (numbers/code) |

---

## 🎯 Page Purpose

FinOps Dashboard memberikan visibilitas real-time terhadap biaya infrastruktur per-aplikasi, per-tim, dan per-klien. Memungkinkan:
- **Track spending** harian/bulanan dengan granularitas tinggi
- **Allocate costs** ke klien atau project spesifik
- **Set budgets** dan receive alerts saat threshold tercapai
- **Export reports** untuk billing dan compliance
- **Identify optimization opportunities** untuk reduce costs

---

## 🏗️ Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│   OmniStack Dashboard                                                                  👑 ADMIN      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────
│                                                                                                         │
│  WORKSPACE                                                                                              │
│  🏠 Overview                                                                                            │
│  📦 All Projects                                                                                        │
│   Deployments                                                                                         │
│  📊 Monitoring                                                                                          │
│  ⚠️  Error Tracking                                                                                     │
│  🌐 Preview Environments                                                                                │
│  💰 FinOps  ── Active                                                                                   │
│  🤖 AI Architect                                                                                        │
│   AI Code Reviewer                                                                                    │
│                                                                                                         │
│  ADMINISTRASI                                                                                           │
│  👥 User Management                                                                                     │
│  ️  Databases                                                                                          │
│  📋 Audit Logs                                                                                          │
│  ️  System Settings                                                                                    │
│  🖥️  Infrastructure                                                                                     │
│  🔧 AI Config                                                                                           │
│  💳 Billing                                                                                             │
│                                                                                                         │
│  AKUN                                                                                                   │
│  ⚙️  Settings                                                                                           │
│                                                                                                         │
│  ┌─ N ─────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                    │  │
│  │  ──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  💰 FinOps Dashboard                                                          [📥 Export ▼]  │ │  │
│  │  │                                                                                              │ │  │
│  │  │  Track biaya infrastruktur real-time per-aplikasi, per-tim, dan per-klien.                   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │   Date Range & Filters                                                                     │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  Period:  [● This Month] [○ Last Month] [○ Last 7 Days] [○ Custom Range]             │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Custom:  [📅 2026-08-01] — [📅 2026-08-31]                                          │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Group By:  [○ Project] [● Team] [○ Client] [○ Service Type]                         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Currency:  [USD $ ▼]   Comparison:  [○ None] [● vs Last Month] [○ vs Last Year]    │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  │                                                                                              │ │  │
│  │  │  [Apply Filters]  [Reset]  [ Save View]                                                    │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  💵 Cost Overview (August 2026)                                                                │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐                  │ │  │
│  │  │  │  💰 Total Cost      │  │  🖥️  Compute        │  │   Storage         │                  │ │  │
│  │  │  │                     │  │                     │  │                     │                  │ │  │
│  │  │  │    $1,247.83        │  │      $687.42        │  │      $342.18        │                  │ │  │
│  │  │  │  ───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │                  │ │  │
│  │  │  │  │ ↑ 15.2%       │  │  │  │ 55.1% of total│  │  │  │ 27.4% of total│  │                  │ │  │
│  │  │  │  │ vs last month │  │  │  │ ↑ 12%         │  │  │  │ ↑ 18%         │  │                  │ │  │
│  │  │  │  └───────────────┘  │  │  └───────────────┘  │  │  └───────────────  │                  │ │  │
│  │  │  │                     │  │                     │  │                     │                  │ │  │
│  │  │  │  Budget: $1,500     │  │  CPU: 68% avg       │  │  Used: 342 GB       │                  │ │  │
│  │  │  │  Remaining: $252    │  │  Peak: 89%          │  │  Growth: +12 GB     │                  │ │  │
│  │  │  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘                  │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ─────────────────────┐  ─────────────────────┐  ┌─────────────────────┐                  │ │  │
│  │  │  │  🌐 Network       │  │  🗄️  Database        │  │  ⚠️  Alerts         │                  │ │  │
│  │  │  │                     │  │                     │  │                     │                  │ │  │
│  │  │  │      $218.23        │  │      $156.47        │  │       3             │                  │ │  │
│  │  │  │  ───────────────┐  │  │  ┌───────────────┐  │  │  ───────────────┐  │                  │ │  │
│  │  │  │  │ 17.5% of total│  │  │  │ 12.5% of total│  │  │  │ 🔴 1 Critical │  │                  │ │  │
│  │  │  │  │ ↑ 22%         │  │  │  │ ↑ 8%          │  │  │  │ 🟡 2 Warning  │  │                  │ │  │
│  │  │  │  └───────────────┘  │  │  └───────────────  │  │  └───────────────┘  │                  │ │  │
│  │  │  │                     │  │                     │  │                     │                  │ │  │
│  │  │  │  Bandwidth: 847 GB  │  │  Queries: 2.4M      │  │  Action needed      │                  │ │  │
│  │  │  │  Egress: 234 GB     │  │  Slow: 12           │  │  View details →     │                  │ │  │
│  │  │  └─────────────────────  └─────────────────────┘  ─────────────────────┘                  │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  📈 Cost Trend (Last 30 Days)                                                                  │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  $60 ┤                                                                               │   │ │  │
│  │  │  │  $50 ┤                    ╱╲                                                         │   │ │  │
│  │  │  │  $40 ┤              ╱╲╱╱╱  ╲╲╱╲                                                     │   │ │  │
│  │  │  │  $30 ┤        ╱╲╱╱╱╱╱╱╱╱╱╱╱╱╱╱╲╲╱╲╱╲                                             │   │ │  │
│  │  │  │  $20   ╱╲╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╲╱╲                                         │   │ │  │
│  │  │  │  $10 ┤╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╲╱╲╱╲                         │   │ │  │
│  │  │  │   $0 ┼──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬─  │   │ │  │
│  │  │  │      Aug 1   5   10   15   20   25   30                                             │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ┌──────────────────────────────────────────────────────────────────────────────┐   │   │ │  │
│  │  │  │  │  Legend:   Compute  🟩 Storage  🟨 Network  🟥 Database                    │   │   │ │  │
│  │  │  │  └──────────────────────────────────────────────────────────────────────────────┘   │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Average: $41.59/day · Peak: $58.23 (Aug 15) · Lowest: $28.47 (Aug 3)              │   │ │  │
│  │  │  │  Projected (30d): $1,247.83 · Budget: $1,500.00 · Remaining: $252.17               │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  📊 Cost Breakdown by Project                                                                  │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  🔍 Search projects...          [Sort: Cost ▼] [View: List] [Group: Team]            │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  Project Name          Team        This Month    Last Month    Trend    % of Total   │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🌐 client-portal      Backend     $423.18       $389.42       ↑ 8.7%   33.9%        │   │ │  │
│  │  │  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Compute: $245 · Storage: $112 · Network: $66                                         │   │ │  │
│  │  │  │  [View Details →]  [Export]  [Set Budget]                                             │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │   mobile-app         Mobile      $312.47       $287.15       ↑ 8.8%   25.0%        │   │ │  │
│  │  │  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Compute: $178 · Storage: $89 · Network: $45                                          │   │ │  │
│  │  │  │  [View Details →]  [Export]  [Set Budget]                                             │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📊 analytics-dash     Data        $247.83       $198.27       ↑ 25.0%  19.9%        │   │ │  │
│  │  │  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  ⚠️  Over budget by $47.83                                                            │   │ │  │
│  │  │  │  Compute: $134 · Storage: $78 · Network: $36                                          │   │ │  │
│  │  │  │  [View Details →]  [Export]  [Adjust Budget]                                          │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ⚙️  api-service         Backend     $165.92       $142.38       ↑ 16.5%  13.3%        │   │ │  │
│  │  │  │  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Compute: $98 · Storage: $45 · Network: $23                                           │   │ │  │
│  │  │  │  [View Details →]  [Export]  [Set Budget]                                             │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🔐 auth-service       Backend     $98.43        $92.15        ↑ 6.8%   7.9%         │   │ │  │
│  │  │  │  █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Compute: $56 · Storage: $28 · Network: $14                                           │   │ │  │
│  │  │  │  [View Details →]  [Export]  [Set Budget]                                             │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Showing 5 of 12 projects · Total: $1,247.83                                         │   │ │  │
│  │  │  │  [← Previous]  Page 1 of 3  [Next →]  Rows: [10 ▼]                                   │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  💡 Cost Optimization Recommendations                                                          │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │   High Impact (Save $150+/month)                                                    │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ⚠️  analytics-dash: Downsize unused database instance                               │   │ │  │
│  │  │  │     Current: db.r5.xlarge ($247/mo) → Recommended: db.r5.large ($123/mo)             │   │ │  │
│  │  │  │     Utilization: 23% CPU, 31% Memory · Last peak: 45% (30 days ago)                  │   │ │  │
│  │  │  │     Potential Savings: $124/month ($1,488/year)                                      │   │ │  │
│  │  │  │     [Apply Recommendation]  [Dismiss]  [Learn More]                                  │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  💡 mobile-app: Enable auto-scaling during off-peak hours                            │   │ │  │
│  │  │  │     Current: 3 instances 24/7 ($312/mo)                                              │   │ │  │
│  │  │  │     Recommended: 1 instance off-peak, 3 instances peak (6AM-10PM)                    │   │ │  │
│  │  │  │     Traffic pattern: 78% of requests during peak hours                               │   │ │  │
│  │  │  │     Potential Savings: $156/month ($1,872/year)                                      │   │ │  │
│  │  │  │     [Apply Recommendation]  [Dismiss]  [Learn More]                                  │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🟡 Medium Impact (Save $50-150/month)                                                │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  💡 client-portal: Switch to reserved instances (1-year term)                        │   │ │  │
│  │  │  │     Current: On-demand ($423/mo) → Reserved ($338/mo)                                │   │ │  │
│  │  │  │     Commitment: 1 year · Utilization: 94% (stable workload)                          │   │ │  │
│  │  │  │     Potential Savings: $85/month ($1,020/year)                                       │   │ │  │
│  │  │  │     [Apply Recommendation]  [Dismiss]  [Learn More]                                  │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🟢 Already Optimized                                                                 │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ✅ api-service: Good resource utilization (87% CPU, 72% Memory)                     │   │ │  │
│  │  │  │  ✅ auth-service: Efficient scaling (1-3 instances based on traffic)                 │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Total Potential Savings: $365/month ($4,380/year)                                   │   │ │  │
│  │  │  │  [Apply All Recommendations]  [Export Report]                                        │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │   Cost Allocation by Team / Client                                                           │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  Team/Client          Projects    This Month    Last Month    Trend    Budget Status  │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🏢 Backend Team      3           $687.53       $623.95       ↑ 10.2%  🟢 On Track   │   │ │  │
│  │  │  │  ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Budget: $800 · Used: $687.53 (85.9%) · Remaining: $112.47                          │   │ │  │
│  │  │  │  [View Details →]  [Adjust Budget]  [Export]                                         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │   Mobile Team       2           $312.47       $287.15       ↑ 8.8%   🟢 On Track   │   │ │  │
│  │  │  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Budget: $400 · Used: $312.47 (78.1%) · Remaining: $87.53                           │   │ │  │
│  │  │  │  [View Details →]  [Adjust Budget]  [Export]                                         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📊 Data Team         1           $247.83       $198.27       ↑ 25.0%  🔴 Over Budget│   │ │  │
│  │  │  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Budget: $200 · Used: $247.83 (123.9%) · Over by: $47.83                            │   │ │  │
│  │  │  │  ⚠️  Alert sent to team lead · [View Details →]  [Increase Budget]  [Export]         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🌐 Client: Acme Corp 2           $735.65       $676.57       ↑ 8.7%   🟢 On Track   │   │ │  │
│  │  │  │  ██████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │ │  │
│  │  │  │  Budget: $900 · Used: $735.65 (81.7%) · Remaining: $164.35                          │   │ │  │
│  │  │  │  [View Details →]  [Generate Invoice]  [Export]                                      │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Showing 4 of 8 teams/clients · Total Allocated: $1,983.48                          │   │ │  │
│  │  │  │  [← Previous]  Page 1 of 2  [Next →]                                                 │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  ⚠️  Budget Alerts & Notifications                                                             │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  🔴 Critical (3)                                                                      │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📊 analytics-dash exceeded budget by $47.83 (123.9% of $200)                        │   │ │  │
│  │  │  │     2 hours ago · Auto-alert sent to data-team@omnistack.dev                         │   │ │  │
│  │  │  │     [View Details]  [Dismiss]  [Adjust Budget]                                       │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │   Warning (5)                                                                       │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🌐 client-portal reached 85% of budget ($680 of $800)                               │   │ │  │
│  │  │  │     6 hours ago · Projected to exceed by end of month                                │   │ │  │
│  │  │  │     [View Details]  [Dismiss]  [Increase Budget]                                     │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📱 mobile-app reached 78% of budget ($312 of $400)                                  │   │ │  │
│  │  │  │     1 day ago · On track to stay within budget                                       │   │ │  │
│  │  │  │     [View Details]  [Dismiss]                                                        │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🟢 Info (12)                                                                         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │   Cost optimization recommendation available for analytics-dash                    │   │ │  │
│  │  │  │     1 day ago · Potential savings: $124/month                                        │   │ │  │
│  │  │  │     [View Recommendation]  [Dismiss]                                                 │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Showing 3 of 20 alerts · [View All Alerts →]                                        │   │ │  │
│  │  │  │  [Mark All as Read]  [Export Alerts]  [Configure Alert Rules]                        │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  📥 Export & Reports                                                                           │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │   Generate Report                                                                   │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Report Type:  [● Monthly Summary] [○ Detailed Breakdown] [○ Client Invoice]         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Format:  [● PDF] [○ CSV] [○ Excel] [○ JSON]                                         │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Include:  ☑️  Cost breakdown  ☑️  Trends  ☑️  Recommendations  ☐  Raw data          │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  [Generate Report]  [Schedule Recurring Report]                                      │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📁 Recent Exports                                                                    │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📄 finops-report-august-2026.pdf · Generated 2 hours ago · 2.4 MB                   │   │ │  │
│  │  │  │     [Download]  [Share]  [Delete]                                                    │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📄 client-invoice-acme-corp-august-2026.pdf · Generated 1 day ago · 1.8 MB          │   │ │  │
│  │  │  │     [Download]  [Send to Client]  [Delete]                                           │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  📊 cost-breakdown-all-projects-august-2026.csv · Generated 3 days ago · 456 KB      │   │ │  │
│  │  │  │     [Download]  [Import to Spreadsheet]  [Delete]                                    │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Showing 3 of 15 exports · [View All Exports →]                                      │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  ⚙️  Budget Settings & Alerts Configuration                                                    │ │  │
│  │  │                                                                                              │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │  🎯 Global Budget Settings                                                            │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Monthly Budget:  $ [1,500.00]  USD                                                  │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Alert Thresholds:                                                                    │   │ │  │
│  │  │  │  ☑️  Warning at 75% of budget                                                         │   │ │  │
│  │  │  │  ☑️  Critical at 90% of budget                                                        │   │ │  │
│  │  │  │  ☑️  Alert when budget exceeded                                                       │   │ │  │
│  │  │  │  ☑️  Daily cost spike detection (>50% increase)                                       │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  Notification Preferences:                                                            │   │ │  │
│  │  │  │  ☑️  Email alerts to admin@omnistack.dev                                              │   │ │  │
│  │  │  │  ☑️  In-app notifications                                                             │   │ │  │
│  │  │  │  ☐  Slack webhook (configure in Settings)                                             │   │ │  │
│  │  │  │    PagerDuty integration (configure in Settings)                                     │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  [Save Settings]  [Test Alert]  [Reset to Defaults]                                   │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ─────────────────────────────────────────────────────────────────────────────────── │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  🔗 Integrations                                                                      │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ☑️  AWS Cost Explorer API · Connected (last sync: 1 hour ago)                        │   │ │  │
│  │  │  │     [Configure]  [Sync Now]  [Disconnect]                                            │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ☑️  Google Cloud Billing API · Connected (last sync: 1 hour ago)                     │   │ │  │
│  │  │  │     [Configure]  [Sync Now]  [Disconnect]                                            │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ☐  Azure Cost Management API · Not configured                                        │   │ │  │
│  │  │  │     [Configure]                                                                      │   │ │  │
│  │  │  │                                                                                      │   │ │  │
│  │  │  │  ☐  Stripe Billing API · Not configured                                               │   │ │  │
│  │  │  │     [Configure]                                                                      │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                                    │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │  │
│                                                                                                         │  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System Integration

### Color Tokens (Semantic)

| Element | Token | Usage |
|---------|-------|-------|
| **Background** | `bg-background` | Page background |
| **Card Background** | `bg-card` | Stats cards, tables |
| **Primary Text** | `text-foreground` | Headings, values |
| **Secondary Text** | `text-muted-foreground` | Labels, metadata |
| **Success** | `text-emerald-600` / `bg-emerald-500/10` | On budget, optimized |
| **Warning** | `text-amber-600` / `bg-amber-500/10` | Approaching budget |
| **Critical** | `text-red-600` / `bg-red-500/10` | Over budget |
| **Border** | `border-border` | Card borders, dividers |
| **Primary Action** | `bg-primary` / `text-primary-foreground` | Main CTAs |

### Typography

| Element | Class | Font |
|---------|-------|------|
| **Page Title** | `text-3xl font-bold tracking-tight` | Geist |
| **Section Headers** | `text-xl font-semibold` | Geist |
| **Card Titles** | `text-lg font-medium` | Geist |
| **Body Text** | `text-sm` | Geist |
| **Numbers/Metrics** | `text-2xl font-bold font-mono` | Geist Mono |
| **Code/Technical** | `text-xs font-mono` | Geist Mono |

### Spacing

| Element | Class | Value |
|---------|-------|-------|
| **Page Padding** | `p-6 md:p-8` | 24-32px |
| **Card Padding** | `p-6` | 24px |
| **Section Gap** | `space-y-6` | 24px |
| **Grid Gap** | `gap-4` | 16px |
| **Stats Card Gap** | `gap-4` | 16px |

---

## 🧩 Component Architecture

### Server Components (Default)

```typescript
// app/(dashboard)/finops/page.tsx
import { getServerSession } from "@/lib/auth"
import { getFinOpsData } from "@/lib/services/finops"
import { FinOpsOverview } from "./_components/finops-overview"
import { CostBreakdownTable } from "./_components/cost-breakdown-table"
import { CostTrendChart } from "./_components/cost-trend-chart"
import { OptimizationRecommendations } from "./_components/optimization-recommendations"
import { BudgetAlerts } from "./_components/budget-alerts"
import { ExportPanel } from "./_components/export-panel"

export default async function FinOpsPage() {
  const session = await getServerSession()
  const data = await getFinOpsData(session.user.id, session.user.role)

  return (
    <div className="space-y-6">
      <FinOpsOverview data={data.overview} />
      <CostTrendChart data={data.trends} />
      <CostBreakdownTable data={data.breakdown} />
      <OptimizationRecommendations data={data.recommendations} />
      <BudgetAlerts data={data.alerts} />
      <ExportPanel />
    </div>
  )
}
```

### Client Components (Interactive)

```typescript
// app/(dashboard)/finops/_components/date-range-picker.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  onDateChange: (range: { from: Date; to: Date }) => void
  className?: string
}

export function DateRangePicker({ onDateChange, className }: DateRangePickerProps) {
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}
                </>
              ) : (
                date.from.toLocaleDateString()
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDate({ from: range.from, to: range.to })
                onDateChange({ from: range.from, to: range.to })
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

---

## 🔐 Role-Based Access Control (RBAC)

### ADMIN Role

**Permissions:**
- ✅ View all projects across all users
- ✅ View all teams and clients
- ✅ Set and adjust budgets for any project/team
- ✅ Export all reports (PDF, CSV, Excel, JSON)
- ✅ Configure global budget settings and alerts
- ✅ Manage integrations (AWS, GCP, Azure, Stripe)
- ✅ View and dismiss all alerts
- ✅ Apply optimization recommendations

**UI Differences:**
- "Set Budget" button enabled for all projects
- "Adjust Budget" button visible for all teams
- "Configure Integrations" section accessible
- "Global Budget Settings" section visible
- Export options include all data

### USER Role

**Permissions:**
- ✅ View own projects only
- ✅ View teams they belong to
- ✅ Set budgets for own projects (if permitted)
- ✅ Export reports for own projects
- ✅ View and dismiss own alerts
- ✅ Apply optimization recommendations for own projects

**UI Differences:**
- "Set Budget" button enabled only for own projects
- "Adjust Budget" button visible only for own teams
- "Configure Integrations" section hidden
- "Global Budget Settings" section hidden
- Export options limited to own data

### VIEWER Role

**Permissions:**
- ✅ View shared projects (read-only)
- ✅ View reports and dashboards (read-only)
- ✅ Export reports (PDF, CSV)
- ❌ Cannot set or adjust budgets
- ❌ Cannot configure settings
- ❌ Cannot dismiss alerts
- ❌ Cannot apply recommendations

**UI Differences:**
- All action buttons disabled or hidden
- "Set Budget" / "Adjust Budget" buttons hidden
- "Configure Integrations" section hidden
- "Global Budget Settings" section hidden
- Export options available but limited to view-only data
- "Read-Only" badge visible in header

---

## 📊 Data Structure

### FinOps Data Model

```typescript
interface FinOpsData {
  overview: CostOverview
  trends: CostTrend[]
  breakdown: ProjectCostBreakdown[]
  recommendations: OptimizationRecommendation[]
  alerts: BudgetAlert[]
}

interface CostOverview {
  totalCost: number
  computeCost: number
  storageCost: number
  networkCost: number
  databaseCost: number
  budget: number
  remaining: number
  percentageUsed: number
  trend: number // percentage change vs last period
}

interface CostTrend {
  date: string // ISO date
  totalCost: number
  computeCost: number
  storageCost: number
  networkCost: number
  databaseCost: number
}

interface ProjectCostBreakdown {
  projectId: string
  projectName: string
  team: string
  thisMonth: number
  lastMonth: number
  trend: number
  percentageOfTotal: number
  computeCost: number
  storageCost: number
  networkCost: number
  databaseCost: number
  budget?: number
  budgetStatus?: "on-track" | "warning" | "over"
}

interface OptimizationRecommendation {
  id: string
  projectId: string
  projectName: string
  type: "high-impact" | "medium-impact" | "low-impact"
  title: string
  description: string
  currentCost: number
  recommendedCost: number
  potentialSavings: number
  potentialSavingsYearly: number
  effort: "low" | "medium" | "high"
  applied: boolean
}

interface BudgetAlert {
  id: string
  projectId: string
  projectName: string
  type: "critical" | "warning" | "info"
  title: string
  description: string
  timestamp: string
  read: boolean
  dismissed: boolean
}
```

---

## 🎯 Key Features & Interactions

### 1. Date Range Picker
- **Default**: Current month
- **Presets**: This Month, Last Month, Last 7 Days, Last 30 Days, Custom
- **Custom Range**: Calendar picker with from/to dates
- **Comparison**: vs Last Month, vs Last Year, vs Previous Period

### 2. Cost Overview Cards
- **Total Cost**: Large number with trend indicator
- **Compute Cost**: CPU + RAM usage costs
- **Storage Cost**: Disk + database storage
- **Network Cost**: Bandwidth + egress
- **Database Cost**: Query + connection costs
- **Budget Status**: Progress bar with remaining amount

### 3. Cost Trend Chart
- **Type**: Stacked area chart
- **Granularity**: Daily (30 days), Hourly (7 days), Monthly (12 months)
- **Breakdown**: By service type (Compute, Storage, Network, Database)
- **Annotations**: Peak, average, projected values
- **Interactions**: Hover for details, zoom, pan

### 4. Cost Breakdown Table
- **Columns**: Project, Team, This Month, Last Month, Trend, % of Total
- **Sorting**: By cost, trend, name, team
- **Filtering**: By team, project, budget status
- **Grouping**: By team, client, service type
- **Actions**: View details, export, set budget

### 5. Optimization Recommendations
- **Categorization**: High impact ($150+/mo), Medium ($50-150/mo), Low (<$50/mo)
- **Details**: Current vs recommended configuration
- **Savings**: Monthly and yearly projections
- **Effort**: Low, medium, high implementation effort
- **Actions**: Apply, dismiss, learn more

### 6. Budget Alerts
- **Severity**: Critical (red), Warning (yellow), Info (blue)
- **Triggers**: Budget threshold (75%, 90%, 100%), cost spike, trend anomaly
- **Notifications**: Email, in-app, Slack, PagerDuty
- **Actions**: View details, dismiss, adjust budget

### 7. Export & Reports
- **Formats**: PDF, CSV, Excel, JSON
- **Types**: Monthly summary, detailed breakdown, client invoice
- **Scheduling**: Daily, weekly, monthly recurring reports
- **History**: Recent exports with download/share/delete

### 8. Budget Settings
- **Global Budget**: Monthly limit for entire workspace
- **Alert Thresholds**: Configurable percentages
- **Notification Preferences**: Email, in-app, integrations
- **Integrations**: AWS, GCP, Azure, Stripe APIs

---

## 🔄 State Management

### Client State (useState)

```typescript
// Date range
const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
})

// Filters
const [groupBy, setGroupBy] = useState<"project" | "team" | "client" | "service">("project")
const [currency, setCurrency] = useState<"USD" | "EUR" | "IDR">("USD")
const [comparison, setComparison] = useState<"none" | "last-month" | "last-year">("last-month")

// Table state
const [sortField, setSortField] = useState<"cost" | "trend" | "name">("cost")
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
const [currentPage, setCurrentPage] = useState(1)
const [rowsPerPage, setRowsPerPage] = useState(10)

// Alerts
const [alertFilter, setAlertFilter] = useState<"all" | "critical" | "warning" | "info">("all")
const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
```

### Server State (Data Fetching)

```typescript
// Server Component fetches data based on role
async function getFinOpsData(userId: string, role: UserRole, filters: FinOpsFilters) {
  const response = await fetch("/api/finops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role, filters }),
    cache: "no-store", // Real-time data
  })

  if (!response.ok) throw new Error("Failed to fetch FinOps data")
  return response.json()
}
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| **Mobile** | < 640px | Single column, stacked cards, hidden sidebar |
| **Tablet** | 640-1024px | 2-column grid, condensed stats |
| **Desktop** | 1024-1536px | Full layout, 4-column stats grid |
| **Large Desktop** | > 1536px | Max-width container, wider charts |

### Mobile Adaptations

```typescript
// Stats cards: 1 column on mobile, 2 on tablet, 4 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>

// Cost breakdown table: horizontal scroll on mobile
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>

// Charts: reduced height on mobile
<CostTrendChart
  data={trends}
  height={isMobile ? 200 : 400}
/>
```

---

## ♿ Accessibility

### Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons, links
- **Arrow Keys**: Navigate charts, tables
- **Escape**: Close modals, dropdowns

### ARIA Labels
```typescript
<Button aria-label="Export FinOps report as PDF">
  <FileDown className="h-4 w-4" />
  <span className="sr-only">Export as PDF</span>
</Button>

<div role="alert" aria-live="polite">
  Budget alert: analytics-dash exceeded budget by $47.83
</div>
```

### Color Contrast
- **Text**: Minimum 4.5:1 ratio (WCAG AA)
- **Large Text**: Minimum 3:1 ratio
- **UI Components**: Minimum 3:1 ratio
- **Status Colors**: Always paired with icons/text (not color-only)

### Screen Reader Support
```typescript
<span className="sr-only">Total cost: $1,247.83, up 15.2% from last month</span>
<span aria-hidden="true">↑ 15.2%</span>
```

---

##  Testing Checklist

### Visual Testing
- [ ] All stats cards display correct values
- [ ] Charts render with correct data points
- [ ] Tables sort and filter correctly
- [ ] Color coding matches status (green/yellow/red)
- [ ] Responsive layout works at all breakpoints
- [ ] Dark mode colors are correct

### Functional Testing
- [ ] Date range picker updates data
- [ ] Filters apply correctly
- [ ] Export generates correct files
- [ ] Budget alerts trigger at thresholds
- [ ] Optimization recommendations calculate correctly
- [ ] Role-based access control works

### Accessibility Testing
- [ ] All interactive elements keyboard-navigable
- [ ] Screen reader announces all content
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present

### Performance Testing
- [ ] Page loads in < 2 seconds
- [ ] Charts render smoothly (60fps)
- [ ] No layout shift on data load
- [ ] Images optimized (if any)
- [ ] Code splitting working

---

## 📝 Implementation Notes

### File Structure
```
app/(dashboard)/finops/
├── page.tsx                          # Server component (main page)
├── loading.tsx                       # Loading skeleton
├── error.tsx                         # Error boundary
└── _components/
    ├── finops-overview.tsx           # Stats cards
    ├── cost-trend-chart.tsx          # Trend visualization
    ├── cost-breakdown-table.tsx      # Project breakdown
    ├── optimization-recommendations.tsx  # AI recommendations
    ├── budget-alerts.tsx             # Alert notifications
    ├── export-panel.tsx              # Export options
    ├── date-range-picker.tsx         # Date selection
    ├── budget-settings.tsx           # Configuration
    └── stat-card.tsx                 # Reusable stat card
```

### Dependencies
```json
{
  "dependencies": {
    "recharts": "^2.12.0",           // Charts
    "date-fns": "^3.6.0",            // Date utilities
    "lucide-react": "^0.400.0"       // Icons
  }
}
```

### API Endpoints (Future)
```typescript
// GET /api/finops/overview
// POST /api/finops/breakdown
// GET /api/finops/trends
// POST /api/finops/recommendations
// GET /api/finops/alerts
// POST /api/finops/export
// PUT /api/finops/budget
// POST /api/finops/alerts/:id/dismiss
```

---

##  Design Inspiration

| Source | Element | Inspiration |
|--------|---------|-------------|
| **Vercel Analytics** | Cost charts | Clean, minimal data visualization |
| **AWS Cost Explorer** | Breakdown tables | Detailed cost allocation |
| **Linear** | UI polish | Smooth interactions, dark mode |
| **Stripe Dashboard** | Financial data | Professional financial reporting |
| **Datadog** | Monitoring | Real-time metrics and alerts |

---

## 📚 References

- **DESIGN.md**: Color tokens, typography, spacing
- **ARCHITECTURE.md**: Component structure, routing
- **CONVENTIONS.md**: Code patterns, TypeScript types
- **AGENTS.md**: AI agent guidelines
- **README.md**: RBAC permissions, role system

---

*Last Updated: 2026-08-23*
*Version: 1.0.0*
*Status: Ready for Implementation*
```

---

## 🎯 Summary

Blueprint ini mencakup:

✅ **Complete Page Layout** — Semua section dari header sampai footer
✅ **Design System Integration** — Color tokens, typography, spacing
✅ **Component Architecture** — Server & Client components
✅ **RBAC Implementation** — ADMIN, USER, VIEWER permissions
✅ **Data Models** — TypeScript interfaces
✅ **Interactive Features** — Date picker, filters, charts, tables
✅ **Responsive Design** — Mobile, tablet, desktop
✅ **Accessibility** — WCAG AA compliance
✅ **Testing Checklist** — Visual, functional, accessibility, performance
✅ **Implementation Notes** — File structure, dependencies, API endpoints

AI kamu sekarang punya blueprint lengkap untuk implementasi halaman FinOps yang production-ready! 🚀
