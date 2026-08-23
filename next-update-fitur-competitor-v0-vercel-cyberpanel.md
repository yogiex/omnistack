# OmniStack — Competitor Feature Update Plan

> **Date:** 2026-08-23
> **Status:** Draft
> **Competitors:** v0 (AI generator), CyberPanel (server panel), Vercel (managed PaaS/hosting)
> **Positioning:** AI-native PaaS + DevOS + BYOC

---

## 1. Competitive Positioning

OmniStack bukan "alternatif Vercel" — OmniStack adalah **AI-native Developer Operating System with BYOC**: generate, edit, deploy, monitor, and manage cost in one place.

| Kompetitor | Kekuatan | Kelemahan | Cara OmniStack Menang |
|------------|----------|-----------|----------------------|
| **v0** | AI UI generation, cepat, UX bagus | Hanya frontend/UI, tidak production-ready, tidak ada infra | Full-stack prompt-to-production, sampai deploy live |
| **CyberPanel** | Murah, server control, panel untuk VPS | Satu server, tidak modern, tidak ada GitOps, tidak ada AI | Multi-node BYOC orchestration, AI-native, GitOps, RBAC |
| **Vercel** | DX bagus, managed PaaS, edge network | Vendor lock-in, mahal untuk multi-project, BYOC tidak ada | BYOC multi-cloud, FinOps, on-premise, white-label |

---

## 2. Ten Feature Breakdown

### Fitur 1: AI Prompt-to-Production

**Mengapa harus ada:** Bukan hanya generate UI — menghasilkan aplikasi full-stack (frontend, backend, database, auth, API, deploy config) lalu langsung deploy.

**Mengalahkan:** v0 (hanya frontend), CyberPanel (tidak ada AI), Vercel (tidak ada AI generator).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Prompt Engine | Natural language → spec (tech stack, architecture, features) |
| Code Generator | Multi-file generation: frontend (React/Next), backend (API routes), DB schema (Prisma/Drizzle), auth config |
| Preview | Live preview langsung dari generated code (iframe/hot reload) |
| Deploy Pipeline | Generated app → build → deploy ke VPS/cloud dalam 1 klik |
| Iterasi | Prompt refinement → regenerate → update deployed app |

**Tech decisions:**
- LLM backend: OpenAI GPT-4o / Claude (configurable per admin)
- Code sandbox: isolasi per-app, filesystem virtual sebelum commit
- Output: monorepo structure sesuai STACK manifold user pilih

**Dependencies:** Feature 3 (BYOC) untuk deployment target.

---

### Fitur 2: Cloud IDE dengan Live Preview/HMR

**Mengapa harus ada:** User edit kode langsung di browser, preview real-time, jalankan command, deploy tanpa pindah tools. Ini yang buat OmniStack terasa seperti "Developer Operating System."

**Mengalahkan:** v0 (tidak ada IDE), CyberPanel (tidak ada modern dev experience), Vercel (tidak ada Cloud IDE).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Monaco Editor | Code editor di browser, syntax highlighting, IntelliSense, multi-file |
| Terminal | Web terminal (xterm.js), bisa jalankan `npm`, `git`, `prisma`, dll |
| Live Preview | HMR — edit kode → preview update instant (WebSocket) |
| File Explorer | Browse, create, rename, delete files dalam project |
| Git Integration | Stage, commit, push, pull, branch — dari dalam IDE |
| Command Palette | Cmd+K untuk quick actions (deploy, preview, settings) |

**Tech decisions:**
- Editor: Monaco (bukan CodeMirror — lebih familiar untuk VS Code users)
- Terminal: xterm.js + WebSocket backend (Docker container per project)
- HMR: WebSocket proxy ke dev server dalam container
- Layout: Split pane (editor + preview) — resizable, tabbed

**Dependencies:** Feature 3 (BYOC) untuk container runtime, Feature 4 (GitOps) untuk version control.

---

### Fitur 3: BYOC Multi-Cloud Orchestrator

**Mengapa harus ada:** User bawa VPS sendiri (Hetzner, AWS, DO, IDCloudHost, Biznet), OmniStack orkestrasikan jadi satu platform PaaS.

**Mengalahkan:** Vercel (vendor lock-in), CyberPanel (single server), v0 (tidak ada infra).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Agent Install | `curl` command untuk install OmniStack agent di VPS user |
| Node Registration | VPS terdaftar ke dashboard: status, resources (CPU/RAM/disk), region |
| Resource Pooling | Semua node terlihat sebagai satu resource pool untuk deploy |
| Auto-provision | Deploy target dipilih otomatis berdasarkan availability & region |
| Health Monitoring | Agent kirim heartbeats, resource usage, container status |
| Multi-cloud | Support: bare metal VPS, AWS EC2, GCP, Azure, Docker, k3s |

**Tech decisions:**
- Agent: Go binary (lightweight, single binary deployment)
- Protocol: gRPC for heartbeats + commands, REST for dashboard API
- Container runtime: Docker (default) atau k3s (optional)
- Network: WireGuard tunnel antar nodes untuk internal communication

**Dependencies:** Foundation — ini adalah infrastruktur dasar untuk semua fitur deployment.

---

### Fitur 4: GitOps & Preview Environments per Pull Request

**Mengapa harus ada:** Setiap PR otomatis dapat URL preview, database clone, pipeline CI/CD. Merge ke main otomatis deploy.

**Mengalahkan:** Vercel (setara), CyberPanel (jauh lebih modern), v0 (tidak ada workflow GitOps).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Git Integration | Connect GitHub/GitLab repo ke project |
| Webhook Listener | Trigger pipeline on push, PR open, PR update, PR merge |
| Preview Environment | Per-PR: isolated container + URL unik + DB clone |
| Deploy Pipeline | Build → Test → Preview → (merge) → Production |
| Status Checks | PR status: build passing, preview ready, security scan OK |
| Cleanup | Otomatis hapus preview environment saat PR closed/merged |

**Tech decisions:**
- Webhook: GitHub App / GitLab webhook → internal event bus
- Preview: Container per branch, auto-destroy on merge/close
- DB clone: Copy-on-write (dump + restore) atau referensi ke main DB
- Pipeline: YAML config (`.omnistack.yml`) — mirip Vercel config tapi lebih fleksibel

**Dependencies:** Feature 3 (BYOC) untuk deployment target, Feature 6 (DBaaS) untuk database clone.

---

### Fitur 5: Zero-Downtime Deployment & Instant Rollback

**Mengapa harus ada:** Deploy tanpa downtime, blue/green, health check, rollback 1 klik.

**Mengalahkan:** Vercel (setara), CyberPanel (jauh lebih modern), v0 (tidak ada deployment production).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Blue/Green Deploy | Traffic switching antar versi, zero-downtime |
| Health Check | Liveness + readiness probe sebelum traffic switch |
| Rollback | 1 klik rollback ke versi sebelumnya (semua container ada) |
| Deploy Log | Full log per deploy: build output, container status, traffic status |
| Notifications | Slack/email/webhook notifikasi deploy success/failure |

**Tech decisions:**
- Blue/green: 2 container berjalan, traffic switch via reverse proxy (Caddy/Traefik)
- Health check: HTTP endpoint `/healthz` + TCP port check
- Rollback: Container image versi sebelumnya selalu tersedia (keep last 5)
- Rollback speed: < 30 detik (traffic switch saja, tanpa rebuild)

**Dependencies:** Feature 3 (BYOC) untuk container orchestration.

---

### Fitur 6: Database-as-a-Service 1-Click + Backup/PITR

**Mengapa harus ada:** PostgreSQL/MySQL/Redis/MongoDB instan + backup otomatis + point-in-time recovery.

**Mengalahkan:** v0 (tidak fokus infra), CyberPanel (DB management kuno), Vercel (managed DB mahal).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| DB Provision | 1 klik: PostgreSQL, MySQL, Redis, MongoDB |
| Connection String | Auto-generate + auto-inject ke app environment |
| Backup | Otomatis harian + manual trigger |
| PITR | Point-in-time recovery ke timestamp spesifik |
| Monitor | Connection count, query performance, storage usage |
| Scaling | Vertical (resize) + horizontal (replica) |

**Tech decisions:**
- DB runtime: Docker container per database instance
- Backup: pg_dump (PostgreSQL), mysqldump (MySQL) → compressed → stored di object storage
- PITR: WAL archiving (PostgreSQL) atau binlog (MySQL)
- Storage: Backup ke S3-compatible storage (user bisa pakai sendiri)

**Dependencies:** Feature 3 (BYOC) untuk node deployment.

---

### Fitur 7: RBAC + Team/Client Collaboration Portal

**Mengapa harus ada:** Project sharing, invite collaborator, client access, approval flow, audit per project.

**Mengalahkan:** Vercel (role terbatas), CyberPanel (tidak dirancang kolaborasi tim).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Roles | ADMIN, USER, VIEWER (sudah ada) + PROJECT_OWNER, COLLABORATOR, CLIENT |
| Project Sharing | Invite user ke project dengan role spesifik |
| Client Portal | Client hanya lihat project tertentu (read-only atau deploy access) |
| Approval Flow | Deploy ke production butuh approval dari PROJECT_OWNER |
| Audit per Project | Log semua aksi per project: deploy, config change, access |
| Team Management | Group users dalam team, assign team ke projects |

**Tech decisions:**
- Role hierarchy: `ADMIN > PROJECT_OWNER > USER > COLLABORATOR > VIEWER`
- Invitation: email-based + link-based (invite token)
- Client portal: view-only dashboard untuk non-technical stakeholders
- Approval: configurable per-project (some projects auto-deploy, some need approval)

**Dependencies:** Feature 9 (Observability) untuk audit logs, Feature 10 (Enterprise Security).

---

### Fitur 8: FinOps Dashboard & Cost Allocation per Project/Client

**Mengapa harus ada:** Biaya per aplikasi, per environment, per client, per tim. Estimasi resource, storage, bandwidth, AI usage.

**Mengalahkan:** Vercel (mahal, kurang transparan), CyberPanel (tidak ada FinOps), v0 (tidak ada cost governance).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Cost Dashboard | Total cost, cost per project, cost per client, cost trend |
| Resource Usage | CPU, RAM, storage, bandwidth — per container, per project |
| AI Usage | Token usage per AI action (generate, review, refactor) |
| Cost Allocation | Tag cost ke project/client/team untuk billing |
| Alerts | Threshold alerts: "Project X melebihi budget $50/bulan" |
| Export | CSV/PDF report untuk finance team |

**Tech decisions:**
- Data collection: Agent kirim resource metrics → time-series DB (SQLite untuk MVP, InfluxDB untuk scale)
- Cost calculation: Resource usage × pricing per provider (Hetzner: $X/vCPU, AWS: $Y/vCPU, dll)
- AI cost: Token count × LLM pricing (GPT-4o: $X/1M tokens)
- Dashboard: Chart.js atau Recharts — line chart (trend), bar chart (per project), donut (allocation)

**Dependencies:** Feature 3 (BYOC) untuk resource metrics, Feature 9 (Observability) untuk log data.

---

### Fitur 9: Observability Terpusat — Logs, APM, Error Tracking, AI Log Analyzer

**Mengapa harus ada:** Semua log, metric, tracing, error, deployment event dalam satu dashboard. AI menganalisis error + root-cause analysis.

**Mengalahkan:** v0 (aplikasi hanya dibuat, tidak dipantau), CyberPanel (observability terbatas), Vercel (menyaingi dengan lebih terintegrasi + AI).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| Centralized Logs | Semua container logs → satu dashboard, filterable per project/deployment |
| APM | Response time, throughput, error rate per endpoint |
| Error Tracking | Error aggregation, grouping, frequency, first/last seen |
| Deployment Events | Log setiap deploy: build time, success/failure, rollback |
| AI Log Analyzer | AI menganalisis error logs → root cause suggestion |
| Alerting | Threshold + anomaly detection → Slack/email/webhook |

**Tech decisions:**
- Log collection: Fluentd/Vector → ClickHouse (MVP: SQLite + grep)
- APM: OpenTelemetry SDK di aplikasi user → collector → dashboard
- Error tracking: Sentry-compatible API (bisa integrate existing Sentry)
- AI analyzer: Feed error logs ke LLM → structured root cause analysis

**Dependencies:** Feature 3 (BYOC) untuk agent-based log collection.

---

### Fitur 10: Enterprise Security & White-Label Deployment

**Mengapa harus ada:** 2FA, SSO SAML/OIDC, audit logs, secrets vault, SAST/DAST, API key scoping, on-premise, white-label.

**Mengalahkan:** v0 dan Vercel (enterprise/regulated industry), CyberPanel (security governance modern).

**Implementation scope:**

| Komponen | Detail |
|----------|--------|
| 2FA | TOTP (Google Authenticator) + backup codes |
| SSO | SAML 2.0 + OIDC (Okta, Azure AD, Google Workspace) |
| Audit Logs | Immutable log semua aksi user: login, deploy, config change |
| Secrets Vault | Encrypted storage untuk API keys, DB passwords, env vars |
| SAST/DAST | Static + Dynamic security scanning (integrate Feature: AI Code Reviewer) |
| API Key Scoping | API keys bisa di-scoping ke project tertentu + permission tertentu |
| On-premise | OmniStack bisa di-install di infra sendiri |
| White-label | Custom branding: logo, domain, colors untuk agency |

**Tech decisions:**
- 2FA: speakeasy/totp + QR code
- SSO: Use library like `@boxyhq/saml-jwt` atau custom OIDC
- Audit: Append-only log (SQLite with append-only table, atau event sourcing)
- Secrets: AES-256 encryption at rest, vault pattern (bukan plaintext di .env)
- White-label: Configurable via admin settings → theme variables

**Dependencies:** Feature 7 (RBAC) untuk permission model, Feature 9 (Observability) untuk audit logs.

---

## 3. MVP Priority — 5 Fitur Utama

| Priority | Feature | Effort | Impact | Phase |
|----------|---------|--------|--------|-------|
| **P0** | AI Prompt-to-Production | Large | Core differentiator vs all competitors | Phase 1 |
| **P1** | BYOC Multi-Cloud Orchestrator | Large | Foundation untuk semua deployment | Phase 1 |
| **P2** | GitOps & Preview Environments | Large | Production workflow essential | Phase 2 |
| **P3** | Cloud IDE + Live Preview | Large | Developer experience — "DevOS" feeling | Phase 2 |
| **P4** | RBAC + Team/Client Collaboration | Medium | Enterprise readiness | Phase 3 |

### Phase Roadmap

```
Phase 1 — Foundation (Bulan 1-2)
├── P0: AI Prompt-to-Production (generate + preview + deploy)
├── P1: BYOC Agent (install, register, health check, deploy target)
└── P1: Basic Deploy Pipeline (build → deploy → health check)

Phase 2 — Developer Experience (Bulan 3-4)
├── P2: Git Integration + Webhook (GitHub/GitLab connect)
├── P2: Preview Environment (per-PR, auto-cleanup)
├── P3: Cloud IDE (Monaco + terminal + live preview)
└── P3: File Explorer + Command Palette

Phase 3 — Enterprise (Bulan 5-6)
├── P4: Advanced RBAC (project sharing, client portal, approval)
├── P4: Audit Logs per project
├── P5: FinOps Dashboard (basic cost tracking)
└── P6: Observability (logs + error tracking + AI analyzer)

Phase 4 — Polish (Bulan 7-8)
├── P7: Zero-downtime deploy + rollback
├── P8: Database-as-a-Service
├── P9: Enterprise Security (2FA, SSO, secrets vault)
└── P10: White-label + on-premise
```

---

## 4. Feature Mapping vs Competitors

| Feature | v0 | CyberPanel | Vercel | OmniStack Target |
|---------|-----|-----------|--------|-----------------|
| AI Generate | ✅ UI only | ❌ | ❌ | ✅ Full-stack |
| Cloud IDE | ❌ | ❌ | ❌ | ✅ Monaco + terminal |
| BYOC | ❌ | ⚠️ Single VPS | ❌ | ✅ Multi-cloud |
| GitOps | ❌ | ❌ | ✅ | ✅ + DB clone |
| Preview Env | ❌ | ❌ | ✅ | ✅ + AI preview |
| Zero-Downtime | ❌ | ❌ | ✅ | ✅ + instant rollback |
| DBaaS | ❌ | ⚠️ Basic | ✅ Managed | ✅ 1-click + PITR |
| RBAC | ❌ | ❌ | ⚠️ Basic | ✅ Full + client portal |
| FinOps | ❌ | ❌ | ❌ | ✅ Unique selling point |
| Observability | ❌ | ⚠️ Basic | ✅ Logs | ✅ + AI analyzer |
| Enterprise Sec | ❌ | ❌ | ✅ | ✅ + white-label |
| **Win count** | **0** | **0** | **3** | **12/12** |

---

## 5. Technical Stack Requirements

| Feature | New Tech Needed | Existing in Repo |
|---------|----------------|-----------------|
| AI Generate | LLM API (OpenAI/Claude), code sandbox (Docker) | AI Architect page (mock) |
| Cloud IDE | Monaco Editor, xterm.js, WebSocket | — |
| BYOC | Go agent, gRPC, WireGuard | — |
| GitOps | GitHub/GitLab API, webhook server | GitOps page (mock) |
| Deploy | Docker, Caddy/Traefik reverse proxy | — |
| DBaaS | Docker containers, pg_dump/mysqldump | Databases admin page (mock) |
| RBAC | Role model, invite system, approval workflow | AuthContext + RouteGuard (existing) |
| FinOps | Time-series metrics, cost calculation | FinOps page (mock) |
| Observability | Fluentd/Vector, OpenTelemetry | Error Tracking page (mock) |
| Enterprise | TOTP, SAML, AES encryption, audit logs | Audit Logs page (mock) |

---

## 6. Risk & Mitigation

| # | Risk | Mitigation |
|---|------|-----------|
| 1 | Scope too large | Strict phase gates — Phase 1 shippable independently |
| 2 | BYOC agent complexity | Start with Docker-only, add k3s later |
| 3 | Cloud IDE resource heavy | Container per project with resource limits |
| 4 | LLM cost for AI generate | Token budget per user, cache common patterns |
| 5 | Enterprise features need backend | Mock data for MVP, real backend in Phase 4 |
| 6 | Competitor parity with Vercel | Focus on BYOC + FinOps as unique differentiators |

---

## 7. Success Metrics

| Metric | v0 Baseline | Vercel Baseline | OmniStack Target |
|--------|-------------|-----------------|-----------------|
| Time from prompt to live app | N/A (UI only) | ~30 min (manual) | < 5 min |
| Deploy cost per month | Free (limited) | $20-500+ | $5-100 (BYOC) |
| Rollback time | N/A | ~2 min | < 30 sec |
| Supported clouds | 0 | 1 (Vercel) | 5+ (BYOC) |
| RBAC roles | 0 | 3 | 6+ |
| Cost transparency | None | Dashboard | Per-project allocation |
