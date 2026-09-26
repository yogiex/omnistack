# README.docker.md — Docker Setup OmniStack

Dokumentasi operator menjalankan OmniStack (Next.js 16, `output: "export"`) sebagai
static site di dalam container.

> **Status verifikasi:** tidak satu pun perintah `docker`/`npm`/`next` dijalankan untuk
> menulis dokumen ini. Yang terukur hanya build context **691 MB → ~2 MB** setelah
> `.dockerignore`. Semua ukuran image, RAM, dan durasi build adalah **target, bukan
> hasil ukur**. Registry Docker Hub tidak dapat dijangkau saat penulisan, sehingga
> tag/digest image **belum diverifikasi**.

---

## 1. Arsitektur

OmniStack di-build sebagai static export ke `./out/`. Tidak ada API route, tidak ada
database, tidak ada auth backend. Runtime-nya hanya **file server**. Dua tahap build,
hanya `./out` yang menyeberang ke image akhir.

```
BUILD TIME
  source + package.json + package-lock.json
        │
        ▼  STAGE 1  node:24-alpine        (Node 20 EOL 30 Apr 2026)
        │    npm ci  →  next build  →  /app/out
        │
        │  COPY --from=builder /app/out   ← satu-satunya yang lolos
        ▼  STAGE 2  nginxinc/nginx-unprivileged:alpine
             uid 101 · port 8080 · tanpa Node / npm / source
═══════════════════════════════════════════════════════════════════
RUNTIME · rootfs read-only · satu-satunya tmpfs di /tmp
═══════════════════════════════════════════════════════════════════
        │
  Browser ──► 127.0.0.1:18080 ──► docker publish (loopback only)
        │                             │
        └─────────────────────────────▼
                         nginx :8080 (non-root, uid 101)
                                    │  read-only rootfs;
                                    │  semua path temp → /tmp (tmpfs 16 MB)
        ┌───────────────────────────┼──────────────────────────┐
        ▼                           ▼                          ▼
 /usr/share/nginx/html       /healthz                 *.log → stdout
 (file statis dari ./out)    (healthcheck)            (rotasi 10 MB × 3)
```

---

## 2. Quick start

> ⚠️ **Plugin `docker compose` v2 TIDAK terpasang di mesin ini.** Yang ada hanya binary
> standalone `docker-compose` v2.27.1. Semua perintah di sini memakai `docker-compose`
> (dengan tanda hub). `docker compose ...` dengan spasi akan gagal.

```bash
cd /mnt/storage/code/omnistack

# 1. Siapkan env
cp .env.example .env

# 2. Build image (npm ci + next build di dalam container)
docker-compose build

# 3. Jalankan
docker-compose up -d

# 4. Verifikasi healthcheck
docker-compose ps
docker inspect --format '{{.State.Health.Status}}' $(docker-compose ps -q omnistack)
#   tunggu: starting → healthy

# 5. Buka
#    http://127.0.0.1:18080
```

```bash
curl -I http://127.0.0.1:18080/          # cek header
curl -s http://127.0.0.1:18080/healthz   # cek health
docker-compose logs -f                   # ikuti log
docker-compose logs --tail=100
```

**Port di-bind ke `127.0.0.1` saja** — hanya dapat diakses dari mesin lokal. Device lain
di WiFi/LAN yang sama tidak akan bisa membuka. Itu disengaja; lihat §6.

---

## 3. Konfigurasi

`cp .env.example .env` dulu, lalu edit:

| Variabel | Default | Kapan dipakai | Efek |
|---|---|---|---|
| `APP_PORT` | `18080` | runtime compose | Port host di-publish ke `127.0.0.1:$APP_PORT`. Tidak masuk image. |
| `NEXT_PUBLIC_BASE_PATH` | *(kosong)* | ⚠️ **BUILD TIME** | `basePath` Next.js — mengubah penulisan URL aset. |

### 🔴 `NEXT_PUBLIC_BASE_PATH` bukan variabel runtime

Nilainya **di-bake ke URL aset saat `next build` berjalan** dan ter-hardcode di
HTML/CSS/JS hasil export. Mengeditnya di `.env` saja **tidak melakukan apa-apa** sampai
image dibangun ulang.

```bash
# ❌ TIDAK BERJALAN — hanya menulis ulang .env; container tetap serve aset lama
nano .env

# ✅ WAJIB build ulang setelah mengubahnya
docker-compose build --no-cache --build-arg NEXT_PUBLIC_BASE_PATH=/omnistack
docker-compose up -d
```

Bukti di `next.config.ts:6-8` — dibaca sekali saat config dievaluasi, lalu di-hardcode
Next.js ke setiap aset:

```ts
...(process.env.NEXT_PUBLIC_BASE_PATH
  ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH }
  : {}),
```

Gejala lupa rebuild: HTML nyesa tapi **styling mati total** karena file `.js`/`.css`
404. Curigai `basePath` sebelum menuduh CSP. Nilai kosong = tanpa `basePath`, aset dari
root domain — perilaku normal untuk akses via `127.0.0.1:18080`.

---

## 4. Perintah umum

```bash
# Build
docker-compose build

# Rebuild setelah ubah source
docker-compose up -d --build

# Lifecycle
docker-compose up -d            # start
docker-compose down             # stop + hapus container

# Logs
docker-compose logs -f
docker-compose logs --tail=200

# Healthcheck & restart
docker-compose ps
docker-compose restart

# Masuk ke container (rootfs read-only, tapi shell tetap bisa)
docker-compose exec omnistack sh
docker-compose run --rm --entrypoint sh omnistack   # container sekali pakai
```

> Nama service compose adalah `omnistack`. Compose sengaja **tidak** menetapkan
> `container_name`, jadi nama container sebenarnya berawalan `omnistack-` (suffix `-1`).
> Karena itu lebih aman selalu panggil lewat `docker-compose <cmd>` daripada
> `docker exec <nama>`.

### Rebuild bersih total

```bash
docker-compose down
docker rmi omnistack:local
docker builder prune -f
docker-compose build --no-cache
```

Cache build sengaja dipakai: `package.json` + `package-lock.json` di-`COPY` lebih dulu,
jadi `npm ci` hanya ulang kalau dependency berubah. Karena itu `--no-cache` dibutuhkan
**saat lockfile berubah**, bukan setiap saat.

### ⚠️ Soal volume dan `down -v`

**Jangan menjalankan `docker-compose down -v` tanpa INTENTI yang jelas** — perintah itu
menghapus volume. Pada setup ini aplikasi **tidak menyimpan state apa pun**: tidak ada
database, tidak ada upload, tidak ada session server. Satu-satunya yang perlu dibuang
adalah **image**.

```
docker-compose down -v
                 ↑ menghapus volume. Di sini dampaknya nol (tidak ada state),
                   tapi tetap destruktif. JANGAN pernah menambah --volumes
                   ke prune tanpa dipastikan tidak ada volume lain yang dipakai.
```

---

## 5. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `address already in use` | Port 18080 dipakai proses lain | Ubah `APP_PORT` di `.env` → `docker-compose up -d` |
| `nginx: [emerg] "client_body_temp_path" directive is not allowed here` | Directive taruh di main context, bukan `http {}` | §5.0 |
| Container langsung `Exited` | Hampir pasti **rootfs read-only** | §5.1 |
| Halaman nyesa, styling/avatar rusak | CSP di `docker/nginx.conf` | §5.2 |
| Build gagal, error jaringan | npm butuh registry (font sudah di-vendor) | §5.3 |
| `permission denied` `/etc/nginx/...` | Bind mount read-only | §5.4 |
| Ubah kode tapi tidak berubah | Butuh rebuild image | §5.5 |
| `docker-compose: command not found` | Binary tidak di PATH | §5.6 |
| Disk penuh | Image + builder cache | §5.7 |

### 5.0 `nginx: [emerg] "... directive is not allowed here"`

Error yang **sudah pernah terjadi** di repo ini, jadi bukan hipotesis:

```
nginx: [emerg] "client_body_temp_path" directive is not allowed here in /etc/nginx/nginx.conf:17
```

**Penyebab:** `client_body_temp_path`, `proxy_temp_path`, `fastcgi_temp_path`,
`uwsgi_temp_path`, dan `scgi_temp_path` **hanya sah di dalam blok `http {}`**. nginx
menolaknya di main context — yang isinya `worker_processes`, `pid`, `error_log`, dan
`events`. `pid` dan `error_log` justru **boleh** di main context; jadi tidak semua
directive bisa dipindah bersama.

**Gejalanya khas:** container restart loop (exit berulang), dan `/docker-entrypoint.d/...`
tetap tercetak sebelum error — log entrypoint `Configuration complete; ready for start up`
**bukan** berarti config valid, karena entrypoint tidak memvalidasi syntax.

**Cara cek cepat tanpa menjalankan aplikasi:**

```bash
docker run --rm \
  -v "$PWD/docker/nginx.conf:/etc/nginx/nginx.conf:ro" \
  nginxinc/nginx-unprivileged:alpine nginx -t
```

Target: `syntax is ok` + `test is successful`, tanpa `emerg` maupun `warn`.

> ⚠️ `10-listen-on-ipv6-by-default.sh: info: can not modify
> /etc/nginx/conf.d/default.conf (read-only file system?)` itu **normal dan aman**.
> Script-nya memang mengecek `-w` lalu melewatkan file yang tidak writable. Selama
> config kita tidak meng-`include /etc/nginx/conf.d/*.conf`, file itu memang tidak
> dipakai sama sekali.

### 5.1 Container exit / nginx tidak mau start

Penyebab paling mungkin: **root filesystem read-only**. nginx selalu perlu menulis
pid dan temp path saat startup; kalau satu tidak bisa ditulis, proses langsung mati
(`Exited (1)` / `Exited (255)`).

```bash
docker-compose logs --tail=50
```

Verifikasi di `docker/nginx.conf` — semua harus menunjuk ke `/tmp`:

| Directive | Nilai di config |
|---|---|
| `pid` | `/tmp/nginx.pid` (bukan `/var/run/nginx.pid`) |
| `error_log` | `/dev/stderr warn` (bukan file di disk) |
| access log | `/dev/stdout` (default image) |
| `client_body_temp_path` | `/tmp/client_temp` |
| `proxy_temp_path` | `/tmp/proxy_temp` |
| `fastcgi_temp_path` | `/tmp/fastcgi_temp` |
| `uwsgi_temp_path` | `/tmp/uwsgi_temp` |
| `scgi_temp_path` | `/tmp/scgi_temp` |

Plus tmpfs di compose: `/tmp:size=16m,mode=1777` — satu-satunya lokasi writable di container
yang dikunci. nginx `mkdir()` temp dir saat startup dan **abort kalau gagal**, jadi satu
path yang salah sudah cukup untuk membunuh container. Tidak ada directive `user` — itu
disengaja: image sudah menjalankan master+worker sebagai uid 101, dan setuid butuh
privilege yang tidak dimiliki container.

Kalau container Anda **memakai config asli repo**, semua directive di atas sudah benar dan
penyebab klasik ini mustahil terjadi. Kecurigaan Anda baru beralasan pada dua hal:
(a) `docker/nginx.conf` diedit lalu di-bind ulang tanpa `docker-compose restart`, atau
(b) tmpfs `/tmp` hilang dari override Anda.

**Escap hatch untuk membuktikan diagnosis** (bukan solusi):

```yaml
# sementara di docker-compose.yml:
read_only: false
```

```bash
docker-compose up -d && docker-compose logs --tail=50
```

Kalau container **hidup** begitu `read_only` dimatikan, diagnosisnya pasti. Solusinya
tetap: kembalikan `read_only: true` dan perbaiki path yang salah di `docker/nginx.conf`.
Ingat: hanya `/tmp` boleh writable.

### 5.2 Halaman nyesa, styling atau avatar rusak

Penyebab hampir pasti **Content-Security-Policy** di `docker/nginx.conf`.

- Avatar diambil saat runtime dari pihak ketiga —
  `https://api.dicebear.com/7.x/avataaars/svg?seed=...` (`lib/mock-data.ts:92,102,112`),
  dirender lewat `AvatarImage` di `components/top-nav.tsx` (layout global) + tiga halaman
  dashboard. Kalau `img-src` tidak mengizinkan domain itu, avatar tidak muncul.
- Preview AI Architect memakai `<iframe srcDoc={...}>`
  (`app/(dashboard)/ai-architect/_components/preview-panel.tsx:593`). `srcDoc` mewarisi
  policy halaman induk, jadi CSP ketat bisa memblokir isi preview.

Harus ada di `img-src` — dan di `docker/nginx.conf` itu **sudah ada**:

```
img-src 'self' data: https://api.dicebear.com
```

Baris CSP lengkap di file itu juga memuat `style-src 'self' 'unsafe-inline'`,
`script-src 'self' 'unsafe-inline'`, `font-src 'self' data:`, `connect-src 'self'`,
`frame-src 'self'`, plus `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`.

Jadi kalau config asli, CSP **bukan** penyebab. Kemungkinan lain: Anda menjalankan
container dari image lama sebelum CSP ini ada, atau memakai override compose sendiri.

⚠️ Jebakan nyata di config ini: `add_header` nginx **tidak merge antar level** — satu
`add_header` di dalam `location` membatalkan seluruh set yang diwarisi dari block `server`.
Karena itu header keamanan sengaja **diulang verbatim** di `location /_next/static/`
(`docker/nginx.conf:71-82`). Kalau Anda menambah location baru dan hanya menaruh satu
`add_header`, seluruh header keamanan lenyap di sana.

Cara memastikan: DevTools → Console, cari pelanggaran `Content Security Policy`. Kalau
styling hilang total, periksa `style-src` — dan ingat `basePath` salah juga bisa
menghasilkan gejala serupa (§3).

### 5.3 Build gagal di tahap font / jaringan

`app/layout.tsx` sudah dirombak ke `next/font/local` dengan font di-vendor di
`public/fonts/Inter-Variable.woff2`, jadi **build seharusnya tidak lagi menyentuh Google
Fonts.** Kalau `public/fonts/` kosong, build gagal dengan pesan font — itu masalah font,
bukan jaringan.

Kalau yang muncul error **registry** (ECONNREFUSED, ETIMEDOUT, unable to resolve
registry.npmjs.org), itu **npm** yang butuh akses registry, bukan font. Perbaikannya
akses jaringan ke registry:

```bash
curl -I https://registry.npmjs.org/
```

Lihat juga `Dockerfile:16` — `npm ci` sengaja **tidak** memakai `--ignore-scripts` karena
SWC dan Tailwind Oxide mengunduh binary platform-specific lewat `postinstall`. Blokir
jaringan akan menggagalkan build di titik itu juga.

### 5.4 `permission denied` pada `/etc/nginx/...`

Itu bind mount **read-only** `docker/nginx.conf` → `/etc/nginx/nginx.conf:ro`; tidak
seharusnya ditulis dari dalam container. Mount `:ro` disengaja — image tetap reusable dan
config bisa diedit tanpa rebuild.

Untuk menguji config **tanpa** menyentuh file yang di-mount, jalankan container sekali pakai:

```bash
docker-compose run --rm --entrypoint sh omnistack -c 'nginx -t 2>&1 || true'
```

Untuk mengubah: edit `docker/nginx.conf` di host, lalu `docker-compose restart`
(bind mount dibaca ulang saat container start, bukan saat sinyal restart).

### 5.5 Ubah kode tapi halaman tidak berubah

Wajar dan by-design. Container menyajikan **snapshot static yang sudah di-build** — bukan
bind mount source, bukan volume hot-reload. `npm run dev` tidak berjalan di dalam image.
**Tidak ada hot reload sama sekali.**

```bash
docker-compose up -d --build
# masih tidak berubah? pertimbangkan:
docker-compose build --no-cache
```

### 5.6 `docker-compose: command not found`

Mesin ini **tidak punya plugin `docker compose` v2**, hanya binary standalone
`docker-compose` v2.27.1. Jangan pakai `docker compose ...` (spasi) — akan gagal.

```bash
docker-compose --version   # harus: Docker Compose version v2.27.1
which docker-compose
```

Symlink rusak biasanya disembuhkan dengan: `docker-compose down && rm -rf ~/.docker/cli-plugins && docker-compose up -d`

### 5.7 Disk penuh

```bash
docker system df        # laporan pemakaian
docker images
```

```bash
# AMAN: hanya image/builder/network yang tidak terpakai
docker system prune -f

# ⚠️ DESTRUKTIF: ikut menghapus volume
docker system prune --volumes
```

Jalankan `docker system df` dulu. Instance lain di mesin ini yang punya database atau
state persisten bisa ikut kehilangan volume. Untuk OmniStack sendiri tidak ada volume yang
perlu disimpan.

---

## 6. Security model dan batasnya

### ❌ Tidak ada autentikasi sungguhan

Semua gating **client-side** dan bisa dilewati dengan mudah. Authors project sendiri sudah
menulis di `components/route-guard.tsx:22`:

> *"Catatan: ini proteksi UI (gimmick MVP), bukan keamanan sungguhan."*

Role gating (ADMIN / USER / VIEWER) murni kosmetik. Data `lib/mock-data.ts` ikut
ter-bundle ke JS yang dikirim ke browser; siapa pun yang buka DevTools bisa melihat
seluruh data mock dan memalsukan state auth.

**Loopback bind adalah satu-satunya kontrol akses yang nyata.** Mengubah publish port
dari `127.0.0.1:18080` ke `0.0.0.0:18080` akan mengexpose **permukaan admin tanpa
autentikasi** ke seluruh LAN.

### ⚠️ Published port bisa menembus firewall host

Docker publish port memakai chain `DOCKER` di iptables yang **dilewati sebelum** aturan
ufw/iptables biasa. Artinya `ufw deny` terhadap port 18080 bisa tetap tidak berguna kalau
port di-publish ke `0.0.0.0`. Alasan kedua untuk tetap di `127.0.0.1`.

### ⚠️ HTTP polos, tanpa TLS

`http://127.0.0.1:18080` adalah HTTP biasa — tanpa TLS, tanpa cookie `Secure`/`HttpOnly`.
**Cukup untuk development lokal, tidak cocok untuk paparan ke jaringan.** Kalau butuh
akses dari device lain, pakai SSH tunnel, bukan publish ke `0.0.0.0`:

```bash
ssh -L 18080:127.0.0.1:18080 user@localhost
```

### ✅ Yang memang di-hardening (container)

Semua nilai di bawah terbaca langsung dari `docker-compose.yml`.

| Hardening | Nilai |
|---|---|
| User | `101:101` (eksplisit, bukan diwarisi dari image) |
| Root filesystem | `read_only: true` |
| Writable area | tmpfs tunggal `/tmp:size=16m,mode=1777` |
| Capabilities | `cap_drop: [ALL]` |
| Privilege escalation | `no-new-privileges: true` |
| PID | `pids_limit: 100`, `init: true` (tini Jadi PID 1) |
| Memori | `mem_limit: 64m`, `mem_reservation: 32m` |
| CPU | `cpus: 0.5` |
| Shutdown | `stop_signal: SIGQUIT` (graceful), `stop_grace_period: 10s` |
| Restart policy | `restart: unless-stopped` |
| Log | json-file, `max-size: 10m`, `max-file: 3` |
| Publish | `127.0.0.1` only |
| nginx | `worker_processes 1` |

`init: true` penting: tanpa PID 1 yang benar, `docker-compose stop` mengirim sinyal yang
ditelan init dan nginx **tidak** shutdown dengan rapi. `SIGQUIT` = graceful (menyelesaikan
request in-flight), bukan `SIGTERM` yang dropping koneksi.

**Ini tidak membuat aplikasinya aman.** Hardening melindungi *runtime*. Aplikasi di
dalamnya tetap tanpa auth dan tanpa validasi input server-side.

### ⚠️ Egress pihak ketiga

Setiap page load yang merender avatar menghubungi `api.dicebear.com` — **IP user terbuka
ke layanan tersebut.** Kalau tidak diinginkan, ganti URL di `lib/mock-data.ts` ke aset
lokal.

### ⚠️ Supply chain: tag mengambang, belum digest-pinned

`Dockerfile` memakai `node:24-alpine` dan `nginxinc/nginx-unprivileged:alpine` — keduanya
**tag mengambang**, bukan digest. Registry tidak dapat dijangkau saat dokumen ini ditulis,
jadi tag maupun digest **belum pernah diverifikasi**. Kalau upstream mendorong isi tag
yang sudah dipakai, build Anda berubah diam-diam tanpa disadari.

Resolve digest (jalankan sendiri; hasilnya **belum diketahui**):

```bash
docker buildx imagetools inspect node:24-alpine
docker buildx imagetools inspect nginxinc/nginx-unprivileged:alpine
```

Output-nya memuat baris `Digest: sha256:...` untuk tag tersebut. Lalu di `Dockerfile`:

```dockerfile
FROM node:24-alpine@sha256:<PLACEHOLDER_DIGEST_NODE_24_ALPINE> AS builder
FROM nginxinc/nginx-unprivileged:alpine@sha256:<PLACEHOLDER_DIGEST_NGINX_UNPRIV> AS runtime
```

bermanfaat: mengunci apa yang benar-benar dijalankan — tag yang bergerak tidak bisa
diam-diam menukar isi image di build berikutnya, dan Anda mudah melihat tag mana yang
berubah. Trade-off: digest tidak pernah "kedaluwarsa" otomatis, tapi juga tidak
mendapatkan security patch tanpa update manual — jadi pasangkan dengan proses update
berkala.

### ℹ️ Lifecycle script `npm ci`

`npm ci` menjalankan `postinstall` dari dependency (diperlukan untuk mengunduh binary
SWC dan Tailwind Oxide). Ini paparan **build-time only**. Artifact yang dikirim ke image
akhir hanya file statis — **tidak ada dependensi runtime pada Node sama sekali**, jadi
script yang jalan di host build tidak ikut ke produksi.

---

## 7. Catatan performa

Nilai di bawah adalah **konfigurasi yang diset di compose**, bukan hasil pengukuran:

| Resource | Nilai konfigurasi |
|---|---|
| Memori | `mem_limit: 64m` (+ `mem_reservation: 32m`) |
| CPU | `cpus: 0.5` |
| `worker_processes` | `1` — bukan `auto`, karena host 12 core akan fork 12 worker |
| PID | `pids_limit: 100` |
| Log | 10 MB × 3 file |
| Port | `8080` internal → `127.0.0.1:18080` host |

Host: 12 core, 32 GB RAM. `cpus: 0.5` dan `worker_processes 1` konservatif untuk
stateless file server yang menyajikan file sudah di-pre-bake dari disk lokal. Naikkan hanya
kalau `docker stats` menunjukkan CPU mentok di 50%.

> ⚠️ **Angka ini belum pernah diukur.** Tidak ada build atau container yang dijalankan
> selama penyusunan dokumen ini. Ukuran image final, RAM aktual, dan durasi build
> **semua masih target**. Ukur sendiri:
>
> ```bash
> docker images                    # ukuran image
> docker stats --no-stream         # RAM & CPU runtime
> docker system df                 # total space terpakai
> ```
>
> Satu-satunya angka terukur: build context **691 MB → ~2 MB** setelah `.dockerignore`.

---

## 8. Kapan rebuild diperlukan

**Rebuild** (`docker-compose up -d --build`):

- Perubahan source (`app/`, `components/`, `lib/`, `hooks/`, `public/`)
- Perubahan dependency (`package.json` / `package-lock.json`)
- Perubahan `NEXT_PUBLIC_BASE_PATH`
- Perubahan `Dockerfile` atau `docker/nginx.conf`
- Naikkan versi base image

**Cukup `docker-compose restart`:**

- Hampir tidak ada. Untuk static site, restart hanya memuat ulang **file statis yang sama**.
  Berguna hanya untuk hal non-aplikasi: memuat ulang container setelah config nginx,
  atau mereset state sementara di `/tmp`.

**`down` + `up`:** hapus container rusak tanpa menyentuh image; ganti nilai runtime-level
di `.env` (mis. `APP_PORT`).

**`--no-cache`:** lockfile berubah, atau curiga cache build basi.

Rule of thumb: kalau berubahnya sesuatu yang masuk ke `./out/`, rebuild. Kalau tidak,
`restart` cukup.

---

## Appendix — provenance dokumen ini

Bagian di atas membaca file yang ada di repo: `Dockerfile`, `.dockerignore`,
`docker-compose.yml`, `docker/nginx.conf`, `.env.example`, `next.config.ts`, dan
`lib/mock-data.ts` / `components/route-guard.tsx` /
`app/(dashboard)/ai-architect/_components/preview-panel.tsx` untuk klaim spesifik.

Yang **tidak** terverifikasi dan harus dicek setelah run pertama:

- Image `node:24-alpine` dan `nginxinc/nginx-unprivileged:alpine` **belum pernah
  di-pull** — registry tidak dapat dijangkau saat penulisan ini.
- Ukuran image, RAM aktual, dan durasi build — semua masih **target** (§7).
- Perilaku `try_files` terhadap 31 route — config terlihat benar di `docker/nginx.conf:105`
  (`$uri $uri/ $uri/index.html`, cocok dengan `trailingSlash: true`), tapi belum pernah
  diuji terhadap output nyata.
- Apakah `npm ci` berhasil di environment ini — `node_modules` tidak terpasang di host dan
  project belum pernah di-build di sini, jadi ini benar-benar resolve dependency pertama.

Verifikasi mandatory: jalankan §2 Quick start sampai `healthy`, lalu cocokkan hasilnya
dengan dokumen ini dan perbarui angka mana pun yang ternyata berbeda.
