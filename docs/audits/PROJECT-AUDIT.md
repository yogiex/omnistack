# 🔍 OmniStack Project Audit

> **Audit menyeluruh terhadap seluruh codebase** — 149 file, 27.271 LOC.
> 5 subagent paralel. Semua temuan sudah diverifikasi ulang terhadap
> source code sebelum masuk laporan ini.

| | |
|---|---|
| **Tanggal** | 2026-09-26 |
| **Commit** | `main` @ `69bc6b2` (+ 2 file uncommitted) |
| **Branch** | `main` (produksi) · `dev-1` (aktif, 1 commit di depan) |
| **Metode** | 5 subagent paralel, read-only, temuan diverifikasi manual |
| **Bukti mentah** | [`detail/`](./detail/) — 2.834 baris `file:line` references |

---

## 📊 Ringkasan Eksekutif

**289 temuan** di 149 file:

| Severity | Jumlah | Arti |
|----------|-------:|------|
| 🔴 CRITICAL | **61** |lubang keamanan, crash, atau fitur yang *terlihat berfungsi tapi diam-diam palsu* |
| 🟠 MAJOR | **96** | UX rusak, state handling salah, a11y blocking, pelanggaran konvensi |
| 🟡 MINOR | **132** | polish, naming, dead code |

Plus: **137 dead-end interaction** dan **13 RBAC hole**.

### ⚖️ Verdict

Ini **MVP yang matang secara visual, nol secara fungsional**. 28k LOC, 31 route,
design system lengkap — tapi tidak satu pun fitur menyentuh server.

| Dimensi | Status |
|---|---|
| Lebar (jumlah halaman, kualitas UI, RBAC modeling) | 🟢 **Sangat baik** — di atas rata-rata MVP |
| Dalam (backend, persistensi, auth nyata, integrasi) | 🔴 **Nol** |
| Konsistensi dokumentasi vs kenyataan | 🔴 **81 klaim salah / basi** |
| Kualitas kode (konvensi, hooks, types) | 🟢 **Baik** — lihat [Yang Sudah Benar](#-yang-sudah-benar) |

---

## 🎯 5 Akar Masalah (yang Menyusun 289 Temuan)

Ini bukan 289 bug terpisah. **Hampir semuanyaicism berasal dari 5 hal ini:**

### 1. Tidak ada backend → semua aksi berakhir sebagai toast

> account for **137 dari 289 temuan (47%)**

`output: "export"`, nol Route Handler, nol Server Action, nol dependency database.
Setiap tombol "Deploy", "Rollback", "Export CSV", "Save" **tidak melakukan apa-apa
selain menampilkan toast "Berhasil"**.

Contoh terverifikasi:

| Kontrol | Lokasi | Kenyataan |
|---|---|---|
| "Simpan Perubahan" project | `project-detail-client.tsx:672` | Function kosong + toast sukses |
| Status Live/Stopped/Building/Failed | `project-detail-client.tsx:657` | `setStatus` dipanggil, **tidak pernah dibaca** |
| 6 tombol System Settings | `system-settings.tsx:164,261,328,606,676` | `setSaved(true)` 2 detik, form di-discard |
| Maintenance Mode | `system-settings.tsx:253` | Checkbox dibaca oleh tidak ada |
| 2FA Enforcement / Session Timeout | `system-settings.tsx:575,583` | Sepenuhnya inert |
| Filter tanggal audit log | `audit-log.tsx:170` | 4 chip dirender, tidak pernah dibaca |
| Export FinOps | 5 lokasi | Fabricate sukses |
| Ubah password / simpan profil | `settings-client.tsx:229-244` | No-op, tetap tulis "Tersimpan" |
| 2FA | `settings-client.tsx:203` | Render **ON** secara default, tidak ada yang ter-enroll |

**Risiko:** user mengira sistemnya bekerja. Ini yang paling merusak kepercayaan.

### 2. Auth client-side only → RBAC adalah UX, bukan keamanan

**Tidak ada `middleware.ts`.** `route-guard.tsx:1` = `"use client"`. Tidak ada
server yang bisa mengevaluasi role. Terverifikasi:

```bash
# Sesi bisa dipalsukan sepenuhnya dari browser:
localStorage.setItem("omnistack_user", '{"id":"user-admin-001"}')
# reload → full ADMIN
```

`role-guard.tsx:22` sendiri mengakui ini *"gimmick MVP"*.

**Semua 8 route `/admin/*` sudah correctly di-wrap** `requiredRole="ADMIN"` — jadi
tidak ada guard yang hilang. Tapi guard itu hanya redirect, dan **"admin-only" data
ikut terkirim ke setiap pengunjung** di dalam JS bundle publik, termasuk password
database plaintext (`mock-data.ts:825,856,887`).

Tidak ada mutating action yang bisa dieksploitasi non-ADMIN — **tapi hanya karena
page-level guard adalah satu-satunya gate**. Belum ada primitif `can(user, action)`.

**13 RBAC hole**, termasuk:
- `project-detail-client.tsx:152` — `canWrite = roleAtLeast(user.role, "USER")`
  **mengabaikan kepemilikan**. Variabel `owner` dihitung di `:148` lalu **tidak
  dipakai**. → USER bisa edit/hapus proyek orang lain.
- `databases-client.tsx:51` — pola sama
- `/console/` — **tidak ada cek role sama sekali**, menyerialkan `connection.password`
- FinOps hanya scope cost table; overview/trend/alerts org-wide (`finops-client.tsx:88-102`)
- Monitoring & Error Tracking: **nol scoping sama sekali**
- VIEWER bisa generate/revoke API key

### 3. Static export + in-memory state → data hilang & ID baru 404

`getMockProjectsByUser` untuk VIEWER **mengembalikan `[]`** (`mock-data.ts:660`) —
dan komentar di kodenya mengakui: *"VIEWER → kosong (shared projects menyusul)"*.
Padahal sidebar menulis **"Shared Projects"** dan heading halaman **"Proyek yang
Di-share"**. Persona VIEWER mati total.

Id lokal yang baru dibuat (`project-local-*`, `db-*`) **tidak ada di
`generateStaticParams`** → di bawah `output: "export"` mengklik proyek yang baru
dibuat = **hard 404**.

Plus `loading.tsx` tidak pernah tereksekusi di static export, dan
`app/(dashboard)/admin/ai-reviewer/_components/mock-data-reviewer.ts:6` memakai
`Date.now()` di module scope → **frozen saat build + hydration mismatch**.

### 4. Dokumentasi ditulis mendahului kode → 81 klaim salah

**62 FALSE + 19 STALE.** Detail di [section khusus](#-dokumentasi-tidak-akurat).
Yang paling berbahaya: **README mencentang ✅ untuk fitur yang tidak ada**, dan
menyuruh user menjalankan `curl` ke endpoint yang tidak pernah ada.

### 5. some config rusak

| Masalah | Lokasi | Dampak |
|---|---|---|
| `--font-sans: var(--font-sans)` | `globals.css:10` | Self-referential → `font-sans` resolve ke nol |
| `--font-mono: var(--font-geist-mono)` | `globals.css:11` | Token **tidak didefinisikan di mana pun** |
| `npm start` = `next start` | `package.json:8` | **Pasti crash** — tidak ada server pada `output: "export"` |
| Tidak ada script `typecheck` | `package.json` | `verify.sh:33` jatuh ke global `tsc` (TS 7.0.2 vs project `^5`) |
| nginx tanpa basePath | `docker/nginx.conf` | Build dengan `NEXT_PUBLIC_BASE_PATH=/omnistack` → semua asset 404 |
| Node 20 (EOL) di CI vs 24 di Docker | `deploy.yml:25` / `Dockerfile:4` | Inkonsisten |
| `validate-kg.sh` → **FAIL**, 13 dead link | `docs/kg/` | Knowledge graph tidak valid |

**`--font-heading`resolve ke nol berarti Card/Dialog/Sheet titles kehilangan font.**

---

## 🔴 Temuan CRITICAL Terpenting

Sudah diverifikasi ulang manual. 61 CRITICAL lengkap ada di [`detail/`](./detail/).

### C1 — Security: sesi bisa dipalsukan sepenuhnya
`auth-context.tsx` + `route-guard.tsx` — lihat [akar masalah #2](#2-auth-client-side-only--rbac-adalah-ux-bukan-keamanan)

### C2 — Security: USER bisa edit/hapus proyek milik orang lain
```ts
// app/(dashboard)/projects/[id]/project-detail-client.tsx:148-152
const owner = project ? MOCK_USERS.find((u) => u.id === project.userId) : undefined
const canWrite = !!user && roleAtLeast(user.role, "USER")   // ← owner tidak dipakai
```
Pola identik di `databases-client.tsx:51`.

### C3 — Security: `/console/` bocorkan password database
Tidak ada cek role; menyerialkan `connection.password` ke user terautentikasi
mana pun. Password plaintext ada di `mock-data.ts:825,856,887` dan **dikirim ke
public JS bundle**.

### C4 — Auth: setiap akun terdaftar langsung logout
```ts
// lib/auth-context.tsx:113 — startDemoSession
id: `user-local-${Date.now()}`
// lib/auth-context.tsx:59 — hydrator
const valid = MOCK_USERS.find((u) => u.id === parsed.id && u.isActive)
//                          ↑ tidak akan pernah match → :63 removeItem
```
User daftar →.ptrings "Akun Berhasil Dibuat 🎉" → **refresh → logout**.

### C5 — OTP "verifikasi" hanya cek panjang
`register/page.tsx:195` → `otp.length !== 6`. Kode apa pun sepanjang 6 angka lolos.

### C6 — `runMockQuery` fabricate hasil untuk SQL sembarang
Termasuk `DROP TABLE` — mengembalikan baris `kolom_1`/`kolom_2` yang dikarang.

### C7 — ID baru 404 di static export
`project-local-*` / `db-*` tidak ada di `generateStaticParams`.

### C8 — `npm start` mustahil
`package.json:8` vs `next.config.ts:4`. Tapi didokumentasikan di 3 file.

### C9 — Font untracked = build Docker/CI hard-fail
`app/layout.tsx` → `localFont("../public/fonts/Inter-Variable.woff2")`, tapi file-nya
**untracked**. Commit layout tanpa font = build break.

### C10 — Tidak ada ADR untuk `output: "export"`
Keputusan arsitektural **paling menentukan** di repo ini sama sekali tidak
terdokumentasi. README:572 malah menunjuk "ADR-006" yang tidak pernah ada.

---

## 🟢 Yang Sudah Benar

Penting untuk dicatat — ini **bukan** codebase yang asal jadi:

| Aspek | Status |
|---|---|
| **Base UI compliance** | **18/18 benar** — nol `asChild`, nol `@radix-ui`, semua `render`/`useRender`/`GroupLabel`/`Tab`+`Panel` benar |
| **`any` type** | **0** di seluruh 149 file |
| **Rules of Hooks** | **0 pelanggaran** di 21 file ber-hook (semua early return setelah hook terakhir, tidak ada helper-setelah-effect) |
| **`key` prop** |nol yang hilang |
| **`cn()`** | Konsisten dipakai |
| **Hydration** | Auth **aman** — semua akses localStorage effect-only, spinner di first paint |
| **`dangerouslySetInnerHTML`** | **0** |
| **`components/ui/` terpakai** | **18/18** — nol dead primitive |
| **`any`/`ts-ignore`** | 0 di scope admin/AI |
| **Key prop** | 0 missing di scope admin/AI |

**Pelanggaran konvensi yang ada:** 17 hardcoded hex/palette color (terbesar
`cost-trend-chart.tsx:19-22,172`, `database-stats.tsx:49`, `database-card.tsx:46-49`),
6 native `<select>`, 13 emoji-sebagai-ikon, 8 index-key, 1 dead file
(`app/page.tsx.bak`, **sudah ter-commit** di dalam direktori router).

---

## 📚 Dokumentasi Tidak Akurat

**62 FALSE + 19 STALE.** Yang paling merusak:

| Dokumen | Klaim | Kenyataan |
|---|---|---|
| `README.md:255` | Route `/api/*` punya RBAC | `app/api/` **tidak ada** |
| `README.md:434-447` | "API Testing with cURL" | 3 endpoint tidak pernah ada → 404 |
| `README.md:235` | Route `/pricing` | `app/pricing` **tidak ada** |
| `README.md:753-761` | 8 fitur ✅ vs Vercel/CyberPanel | Semua mock |
| `README.md:665-676` | SSO, 2FA, Secrets Vault, Auto-Scaling, PITR | **Nol implementasi** |
| `README.md:722` | "Deployment: Belum dikonfigurasi" | Dockerfile + CI **sudah ada** (stale arah sebaliknya) |
| `ARCHITECTURE.md:101` | "Route Handlers (app/api/*)" | Kontradiksi `ARCHITECTURE.md:331` |
| `ARCHITECTURE.md:1080` | Route group `(marketing)` | Kontradiksi `ARCHITECTURE.md:335` |
| `ARCHITECTURE.md:971,994` | Geist via `next/font/google` | App sekarang pakai local Inter woff2 |
| `ARCHITECTURE.md:940` | Token warna HSL | `app/globals.css:52` = **`oklch()`** |
| `DESIGN.md:98,540` | Token warna HSL | Sama — **`oklch()`** |
| `README.md:572` | "ADR-006" | Tidak ada ADR-006 (hanya 001–005) |
| `README.md:939` | Lisensi MIT | **Tidak ada file `LICENSE`** (3 klaim) |
| `README.md:779` | `git clone .../yourusername/...` | Placeholder ×5 |
| `AGENTS.md` | `lib/constants.ts` | File **tidak ada** |
| `CHANGELOG.md` | — | **~15 fitur terkirim tidak tercatat** |

**`ARCHITECTURE.md` kontradiksi dengan dirinya sendiri di 3 tempat.**

Broken link antar dokumen: `docs/kg/` 13 dead wikilink, `validate-kg.sh` **FAIL**.

---

## 🗺️ Urutan Remediasi

Disusun berdasarkan *root cause*, bukan nomor temuan.

| # | Aksi | Menghapus | Effort |
|---|---|---|---|
| **1** | **Jujurkan README** — turunkan klaim, tandai mock, hapus cURL & `/api/*` & `/pricing` | 81 temuan docs | 🟢 2 jam |
| **2** | **Tambah ADR-006**: static export + dual deploy + konsekuensinya | 3 temuan | 🟢 30 menit |
| **3** | **Perbaiki 2 font token** + `npm start` + tambah script `typecheck` | 5 config | 🟢 30 menit |
| **4** | **Commit font + Docker sebagaiatomic unit** | C9 | 🟢 15 menit |
| **5** | **Perbaiki `owner` di `canWrite`** + tambah `can(user, action)` | 3 RBAC | 🟡 2 jam |
| **6** | **Hapus klaim yang tidak ada Implementasinya** atau beri banner "Mock" di UI | 137 dead end | 🔴 1–2 minggu |
| **7** | **Backend**: NextAuth + DB + Route Handler → ubah `output` ke `standalone` | akar masalah #1 & #2 | 🔴 2+ bulan |
| **8** | **Hapus 17 hex → semantic tokens** | semua MAJOR visual | 🟡 3 jam |

**Rekomendasi strategi:** prokreasi dulu, baru tambah fitur. Langkah 1–5
menghapus **~100 temuan** dengan effort < 1 hari, dan yang paling penting
menghapus **risiko someone percaya produk ini sudah jadi**. Menambah halaman baru
sementara 137 tombol masih jadi toast hanya memperbesar masalah.

Kalau harus memilih satu: **kerjakan langkah 1 (jujurkan README)**. Perubahan
paling murah, dan tanpa itu semua kerja lain tidak terlihat keberhasilannya.

---

## 📎 Bukti Mentah

Detail lengkap per-scope dengan `file:line` untuk **setiap** temuan:

| File | Cakupan | Temuan | LOC |
|---|---|---:|---:|
| [`detail/scope-1-projects.md`](./detail/scope-1-projects.md) | `projects/**` + databases nested | 64 | 4.970 |
| [`detail/scope-2-admin-ai.md`](./detail/scope-2-admin-ai.md) | `admin/**` + AI Architect + AI Reviewer | 77 | 7.617 |
| [`detail/scope-3-ops-ide.md`](./detail/scope-3-ops-ide.md) | FinOps, GitOps, Monitoring, Error Tracking, Deployments, Settings, **Cloud IDE** | 83 | 7.674 |
| [`detail/scope-4-shell-libs.md`](./detail/scope-4-shell-libs.md) | App shell, auth, `components/`, `lib/`, `hooks/` | 34 | 7.010 |
| [`detail/scope-5-infra-docs.md`](./detail/scope-5-infra-docs.md) | Config, Docker, CI, **akurasi 8 dokumen** | 31 | 18 config |

Scope 1–4 = kode aplikasi. Scope 5 = infrastruktur & dokumentasi.

---

<div align="center">

**Audit ini bukan judgment — ini peta.** Kalau ada yang terasa tidak adil,
itu Almost pasti backed oleh `file:line` di folder `detail/`.

*Generated by 5 read-only subagents, verified 2026-09-26.*

</div>