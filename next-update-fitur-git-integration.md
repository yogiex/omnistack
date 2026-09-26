# OmniStack — Nice-to-Have: Git Integration & Source Control

> **Date:** 2026-09-26
> **Status:** Draft — nice-to-have (bukan blocker MVP)
> **Sumber:** proposal "import proyek hanya dari GitHub / GitLab"
> **Relasi:** turunan dari **Fitur 4 (GitOps & Preview Environments)** di
> `next-update-fitur-competitor-v0-vercel-cyberpanel.md`
> **Target deployment saat ini:** GitHub Pages via static export
> (`next.config.ts` → `output: "export"`, `.github/workflows/deploy.yml` →
> `peaceiris/actions-gh-pages`)

---

## 1. Ringkasan

OmniStack sudah mendeklarasikan diri **GitOps Native** dengan klaim *preview
environment per PR* (README baris 100), tetapi alur pembuatan proyek masih
sepele: user mengetik nama dan deskripsi sendiri, tanpa hubungan ke sumber kode
mana pun. Repo Git baru ada di data mock (`MockProject` tidak punya field repo
sama sekali — `branch` hanya ada di `Deployment`).

Proposal ini menutup celah itu dengan menggeser sumber kebenaran proyek dari
"form manual" ke "repository Git". Arahnya sudah benar dan memang standar
 industri (Laravel Cloud, Strapi, Vercel, Railway, Coolify, Dokploy semua
begini). Yang perlu dibentuk ulang adalah urutan layer-nya, karena proposal
melewati satu blocker arsitektural yang besar.

---

## 2. Alur Kerja Standar

| # | Langkah | Status di OmniStack |
|---|---------|--------------------|
| 1 | Buka "New Project", pilih provider (GitHub / GitLab) | 🟡 Ada (`project-form-sheet.tsx`), tapi hanya 2 field: nama + deskripsi |
| 2 | Autentikasi OAuth / GitHub App, grants akses repo | ❌ Tidak ada. Butuh backend |
| 3 | Platform menampilkan daftar repo yang bisa diakses | ❌ Tidak ada. `app/api/` belum ada sama sekali |
| 4 | User pilih satu repo → clone, deteksi framework, buat proyek dengan metadata repo | ❌ Belum ada. Clone hanya jadi log mock di `Deployment.steps` |

Alternatif tanpa OAuth: input URL repo manual, tapi butuh **Personal Access
Token** untuk repo privat. Vercel dan Dokploy menyediakan jalur ini juga.

---

## 3. Komponen yang Perlu Dibangun

| Komponen | Kondisi Aktual | Yang Dibutuhkan |
|----------|----------------|-----------------|
| Git Provider OAuth | ❌ Tidak ada | GitHub App (disarankan) + OAuth GitLab. Butuh backend |
| Repository List API | ❌ Tidak ada (`app/api/` kosong) | `GET /api/git/repos` sebagai proxy server-side |
| Project Creation Flow | 🟡 `project-form-sheet.tsx` ada, tapi di luar `_components/` | Ubah jadi: tombol connect → repo picker → auto-fill nama |
| Auth | 🟡 `lib/auth-context.tsx` (localStorage) | NextAuth v5 + session server |
| Backend / Hosting | ❌ `output: "export"` di GitHub Pages | Node host (Docker) atau layanan backend terpisah |
| Model data repo | ❌ `MockProject` tanpa field repo | `provider`, `repoUrl`, `repoId`, `defaultBranch`, `installId` |
| Framework detection | 🟡 `MockProjectStack` ada, nilainya hardcode | Deteksi dari `package.json` / file manifest setelah clone |
| Webhook receiver | ❌ Tidak ada | Endpoint publik + verifikasi signature |
| RBAC enforcement | ❌ Client-side only | Gerbang di server, bukan hanya `route-guard.tsx` |

---

## 4. Koreksi Teknis terhadap Proposal

Bagian ini penting. Enam asumsi di proposal perlu dikoreksi **sebelum** masuk
dokumen implementasi, kalau tidak resulted-nya adalah rasa aman semu.

### 4.1 GitHub `repo` scope **bukan** read-only

Proposal menulis *"Minta hanya `repo` scope (read-only)"*. Itu keliru.
OAuth scope `repo` di GitHub memberi **read/write ke seluruh repo privat**
milik user — termasuk push, delete branch, dan akses ke repo yang tidak
pernah tersentuh. Itu kebocoran data yang paling sering
terjadi di integrasi Git.

Yang benar, urut dari terbaik:

| Mekanisme | Permission | Hanya repo terpasang? | Token kedaluwarsa | Rekomendasi |
|-----------|-----------|----------------------|-------------------|-------------|
| **GitHub App** | `Contents: Read-only` | ✅Ya (per org/user install) | ✅ 1 jam | **Pakai ini** |
| Fine-grained PAT | `Contents: Read-only` | ✅Ya (dipilih per repo) | ✅ bisa diatur | Cadangan |
| OAuth `repo` scope | read/write semua repo privat | ❌ Tidak | ❌ Tidak ada | **Jangan dipakai** |
| GitLab OAuth | `read_api` + `read_repository` | ✅Ya | ✅30 menit | ✅ Sudah benar |

GitLab sudah punya scope read-only yang benar sejak awal. GitHub tidak —
itulah alasan GitHub App exist.

### 4.2 "Migrasi ke `standalone`" = pindah hosting, bukan ganti konfigurasi

Ini bukan membalik satu baris di `next.config.ts`. Kenyataannya:

- `next.config.ts` sekarang `output: "export"` + `trailingSlash: true`.
- `.github/workflows/deploy.yml` deploy ke branch `gh-pages` via
  `peaceiris/actions-gh-pages` — **static hosting**.
- `README.md` baris 886 mendokumentasikan `gh-pages` sebagai target produksi.

GitHub Pages tidak bisa menjalankan Route Handler, tidak bisahostname callback
OAuth, dan tidak bisa menerima webhook. Jadi "migrasi ke standalone" berarti
**menyerah pada GitHub Pages sebagai target produksi** dan pindah ke Node host
— padahal `README.docker.md` + `docker/` (nginx-unprivileged, TLS,
`docker-compose.yml`) baru saja selesai dibangun persis untuk itu.

Artinya fitur ini **bergantung pada keputusan hosting**, dan keputusan itu
sebaiknya dibuat lebih dulu, terpisah dari fitur Git.

### 4.3 NextAuth v5 tidak bisa jalan di static export

`next-auth` butuh Route Handler (`/api/auth/[...nextauth]`) dan(session
cookie) yang di-set server. Keduanya mustahil di static export. Jadi urutan
yang benar: **pindah hosting → NextAuth → OAuth Git → repo picker**, bukan
sebaliknya.

### 4.4 Webhook butuh URL publik

Setelah proyek dibuat, daemon harus mendaftarkan webhook ke GitHub/GitLab.
GitHub hanya mengantar ke URL HTTPS publik. Kalau hostingnya GH Pages, tidak
bisa. Kalau di VPS sendiri, harus ada TLS + domain — segmen TLS di `docker/`
yang baru dibuat adalah prasyaratnya, bukan_afterthought.

### 4.5 RBAC sekarang hanya client-side

`components/route-guard.tsx:38` melakukan `router.replace(redirectTo)` dari
`useAuth()`, yang sumbernya `localStorage` (`lib/auth-context.tsx:56`).
Siapa pun yang bisa memuat halaman bisa mengedit localStorage danENU SKIP seluruh
kontrol. Jadi *"pastikan hanya role ADMIN/USER yang bisa menambahkan proyek
dari Git"* **tidak bisa dijamin** sampai auth pindah ke server. Ini prasyarat,
bukan task paralel.

### 4.6 Bertabrakan dengan roadmap yang sudah ada

`next-update-fitur-competitor-v0-vercel-cyberpanel.md` menaruh "Git
Integration + Webhook" di **P2 / Phase 2 (Bulan 3-4)**. Proposal ini
menjadikan Git sebagai **blokir Phase 1** karena proyek tidak boleh dibuat
tanpa repo. DuaStatements itu belum direkonsiliasi — lihat §9.

---

## 5. Perubahan File-Level yang Diperlukan

```
next.config.ts                    # output: "export" → "standalone" (atau hosting lain)
.github/workflows/deploy.yml      # gh-pages → deploy container ke Node host
lib/auth-context.tsx              # localStorage → useSession() dari NextAuth
components/route-guard.tsx        # gating pindah ke server middleware
app/api/auth/[...nextauth]/route.ts        # baru
app/api/git/repos/route.ts                  # baru — proxy ke provider
app/api/git/connect/route.ts                # baru — tukar code → token server-side
app/api/webhooks/github/route.ts            # baru
app/api/webhooks/gitlab/route.ts            # baru
app/(dashboard)/projects/project-form-sheet.tsx   # jadi repo picker
app/(dashboard)/projects/_components/         # sheet ini SEBAIKNYA pindah ke sini
```

> **Catatan konvensi:** `project-form-sheet.tsx` sekarang berada di
> `app/(dashboard)/projects/`, bukan `_components/`. Ini melanggar gotcha #6
> di `AGENTS.md` (page-specific component harus di `_components/`). Sekalian
> dirapikan saat-she­ret-nya diubah.

### Model Data

```ts
export interface MockProject {
  // …field yang sudah ada
  git?: {
    provider: "github" | "gitlab"
    repoId: string          // opaque numeric id, bukan nama
    repoUrl: string         //https://github.com/org/repo
    defaultBranch: string   // biasanya "main"
    visibility: "public" | "private"
    connectedAtLabel: string
    installedBy: string     // userId yang memasang GitHub App
  }
}
```

`repoId` disimpan, bukan `repoFullName` saja, karena repo bisa di-rename
tanpa ID berubah. Resolve `repoUrl` dari ID saat sync, jangan menyimpannya
sebagai sumber kebenaran.

---

## 6. Rancangan UX

**Sheet "New Project" redesigned:**

```
┌─────────────────────────────────────────────┐
│  New Project                                 │
│                                             │
│  ┌──────────────┐   ┌──────────────┐        │
│  │  GitHub      │   │  GitLab      │        │
│  │  (connect)   │   │  (connect)   │        │
│  └──────────────┘   └──────────────┘        │
│                                             │
│  Repository ▾  omni-labs/omnistack-web       │
│  Branch     ▾  main                          │
│                                             │
│  Name        omni-web            (auto-fill) │
│  Description ...                  (auto-fill) │
│                                             │
│  Detected: Next.js 16 · TypeScript · Tailwind│
│                                             │
│  [Cancel]                    [Create]        │
└─────────────────────────────────────────────┘
```

Detected stack ditampilkan **read-only** sebagai baris konfirmasi, bukan input —
user bisa keliru baca dan menyalakan framework yang tidak ada di repo.

---

## 7. Keamanan

| Area | Aturan |
|------|--------|
| Scope | `Contents: Read-only` saja. Jangan pernah `repo` scope GitHub |
| Penyimpanan token | **Jangan** pernah menyentuh client. Token tetap di server, di-enkripsi at rest. Kalau GitHub App, pakai installation token (auto-expire 1 jam) dan simpan hanya installation ID |
| Repo picker | Server-side proxy. Browser tidak pernah melihat token, hanya daftar `fullName` |
| Webhook | Verifikasi HMAC: `X-Hub-Signature-256` (GitHub) dan `X-Gitlab-Token` (GitLab). Tolak yang tidak cocok, sebelum parse body |
| Ref/branch | Validasi ketat sebelum masuk shell: `^[A-Za-z0-9._/-]+$`, plus tolak `..`. Kalau ref dipakai sebagai argumen `git clone`/`checkout`, ini command injection |
| Clone URL | **Allowlist host** (`github.com`, `gitlab.com`, + self-hosted yang diizinkan). Kalau URL repositori boleh diisi bebas user, itu SSRF ke jaringan internal |
| Secrets |Repo privat berarti secrets ikut ter-clone. Satu produksi yangReporter ter-expose karena owner berubah — butuh review saat transfer ownership |
| Rate limit | GitHub 5.000 request/jam per token. Repo picker harus server-side cache per `installationId`, bukan fetch tiap keystroke |
| Multi-tenant | Satu org bisa punya banyak member. Kalau buka self-service signup, tiap user memasang GitHub App-nya sendiri — dan itu identitas yang harus di-model-kan di data, bukan diasumsikan global |

---

## 8. "Hanya Bisa dari Git" — Trade-off

Proposal menyebut opsi eksklusif: proyek **hanya** bisa dibuat dari link Git.
Itu perlu dipertimbangkan ulang karena berbenturan dengan fitur lain yang
sudah ada:

- **AI Architect** menghasilkan aplikasi dari prompt. Kalau proyek wajib punya
  repo, platform harus **membuat repo baru** lewat provider API dulu, lalu
  push hasil generate ke sana. Jadi mandatory-Git bukan sekadar "ganti form" —
  ia menambah satu operasi write yang belum pernah ada di OmniStack.
- **Zero-config / first run** jadi lebih berat: user tidak bisa sekadar
  membuat proyek kosong untuk bereksperimen.

Rekomendasi: **repo opsional, tapi template wajib GitHub-first.** Form
menawarkan dua jalur — "Connect repository" (utama, di atas) atau "Buat repo
baru dari provider" (menaungi kasus AI Architect). Proyek kosong manual
tetap ada, tapi jadi jalur sekunder, bukan default.

Kalau mandatory-Git tetap jadi keputusan produk, tulis eksplisit di README
bahwa klaim "AI Architect → prompt to production" sekarang berarti
"prompt → repo → deploy", bukan "prompt → deploy".

---

## 9. Rekonsiliasi Roadmap

| Sumber | Git Integration | Catatan |
|--------|-----------------|---------|
| `next-update-fitur-competitor-...md` §Phase Roadmap | P2, Phase 2 (Bulan 3-4) | Bagian dari "GitOps & Preview Environments" |
| Proposal ini | Blocker, sebelum Phase 1 | Menggeser prioritas cukup jauh |
| Realita teknis | Butuh hosting Node lebih dulu | Prasyarat yang belum ada di roadmap mana pun |

Usulan rekonsiliasi: jadikan **"Hosting migration: GH Pages → Node/Docker"**
sebagai Phase 1.5, terpisah dari fitur Git. Setelah itu Git Integration naik
ke P1, dan Preview Environment per PR tetap P2 seperti rencana semula.

---

## 10. Perbandingan Kompetitor

| Platform | Import dari Git | Metode | Skor |
|----------|-----------------|--------|------|
| **OmniStack (target)** | GitHub + GitLab | GitHub App + repo picker | — |
| Coolify | GitHub, GitLab, Bitbucket, Gitea | Push + PAT | 4 provider |
| Dokploy | GitHub, Git URL, Docker image | Manual URL | Paling luas |
| Vercel | GitHub, GitLab, Bitbucket | OAuth integration | Standar de facto |
| Railway | GitHub | OAuth | Sederhana |
| Laravel Cloud | GitHub, GitLab | OAuth + template | Punya AI scaffolding |

Tidak ada competitor yang **tahu** semua repositori milik user di halaman
tersebut; semua memakai repo picker. OmnibusStack tidak perlu mendukung
Bitbucket/Gitea di v1 — dua provider sudah menutup kesenjangan dengan Coolify
dan Vercel.

---

## 11. Estimasi Kerja

| # | Item | Estimasi | Blocker |
|---|------|----------|---------|
| 1 | Hosting migration ke Node/Docker | 3-5 hari | ✅ Ya — mengunci semua item lain |
| 2 | NextAuth v5 + session server | 2-3 hari |  ✅ Ya |
| 3 | Middleware RBAC server-side | 1-2 hari |  ✅ Ya |
| 4 | GitHub App + consent screen | 2-3 hari | Review GitHub, bisa berminggu |
| 5 | GitLab OAuth | 1-2 hari | GitHub dulu |
| 6 | `/api/git/repos` + picker UI | 2-3 hari | Butuh 4 & 5 |
| 7 | Auto-fill metadata + framework detect | 1-2 hari | Butuh 6 |
| 8 | Clone + build pipeline (BYOC agent) | 1-2 minggu | Butuh backend, bukan cuma UI |
| 9 | Webhook receiver + auto-deploy | 3-5 hari | Butuh 1 |
| 10 | Preview environment per PR | 1-2 minggu | Butuh 8 & 9 |

Item 4 punya risiko jadwal di luar estimator: GitHub App harus direview kalau
permintaan permission-nya luas, dan review yang sama tidak bisa dipercepat.
Rencanakan itu dari awal, jangan dianggap sebagai pekerjaan dua hari.

---

## 12. Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Salah konfigurasi token | 🔴 Akses seluruh repo privat user | GitHub App `Contents: Read-only`; review keamanan sebelum live |
| Hosting migration mundur | 🔴 Produksi mati | Jalankan GH Pages dan Node host berdampingan selama transisi |
| GitHub App review lama | 🟡 Jadwal meleset | Ajukan review paralel dengan pengerjaan item 6-7 |
| Stale `repoId` setelah rename/transfer | 🟡 Deploy gagal diam-diam | Resolve dari ID saat sync, bukan dari URL tersimpan |
| `app/globals.css` belum pernah di-build | 🟠 Build bisa gagal | Jalankan `npm run build` lokal sebelum merge (AGENTS.md mewajibkan quality gate) |

---

## 13. Metrik Keberhasilan

| Metrik | Target | Cara ukur |
|--------|--------|-----------|
| Time-to-first-deploy dari signup | < 5 menit | Timestamp signup → deploy pertama sukses |
| % proyek dibuat via Git | > 80% | Hitung dari `git.provider` |
| Median durasi OAuth → repo terpasang | < 60 detik | Timing di repo picker |
| Kegagalan sync metadata | < 1% | Hitung 404 dari `repoId` saat sync |
| Insiden kebocoran token | 0 | Audit log akses token |

---

## 14. Yang Sengaja Ditunda

- **Bitbucket / Gitea** — dua provider sudah cukup untuk parity Coolify/Vercel
- **SSH deploy key per project** — GitHub App cukup untuk 90% kasus
- **Submodule & monorepo** —yte/issues terpisah, jangan dicampur ke milestone ini
- **Self-hosted runner** — butuh produk sendiri

---

## Kesimpulan

Arahnya benar dan fondasi UI-nya memang sudah ada. Tapi urutan yang benar
adalah:

```
Hosting Node  →  NextAuth  →  RBAC server  →  GitHub App  →  Repo picker  →  Webhook
```

Proposal aslinya melompati lima langkah pertama dan langsung menyebut
NextAuth, padahal hosting-nya masih static export di GitHub Pages. Dan satu
koreksi keamanan yang harus masuk sebelum kode apa pun ditulis: **jangan
pernah pakai GitHub `repo` scope** — itu read/write ke semua repo privat,
bukan read-only.

Sampai lima langkah pertama selesai, fitur ini tetap nice-to-have. Yang bisa
dibangun sekarang tanpa backend apa pun hanya bagian UX: merapikan
`project-form-sheet.tsx` ke `_components/`, dan menyiapkan state form agar
nanti bisa diisi dari repo picker tanpa mengubah struktur.
