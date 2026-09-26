# Docker Compose — OmniStack

OmniStack adalah **Next.js static export** (`output: "export"`). Tidak ada Node.js
di runtime, tidak ada database, tidak ada API route, tidak ada secret. Yang
dilakukan runtime hanyalah nginx menyajikan file statis dari `out/`.

Karena tidak ada yang dinamis, surface serangannya kecil — dan bisa dikunci
 Almost semua keputusan di file ini lahir dari dua batasan nyata:

- **0.5 CPU / 128 MB.** Semua tuning disyarkan ke angka itu, bukan ke kemampuan
  host 12-core.
- **Filesystem read-only.** Satu-satunya path yang boleh ditulis adalah tiga tmpfs.

---

## 1. Mulai cepat

```bash
cp .env.example .env          # opsional; default sudah benar
./scripts/gen-dev-certs.sh    # WAJIB sekali sebelum start pertama
docker-compose up -d --build
```

Buka **https://localhost:58443** — akan muncul peringatan sertifikat karena
sertifikatnya self-signed. Itu diharapkan untuk pengembangan lokal.

```bash
docker-compose logs -f web
docker-compose ps
docker-compose down
```

---

## 2. File

| File | Isi |
|---|---|
| `Dockerfile` | 2 stage: `node:24-alpine` build → `nginxinc/nginx-unprivileged:1.27-alpine` |
| `docker-compose.yml` | 1 service, 1 port publish, seluruh hardening |
| `docker/nginx/nginx.conf` | Main config: `events`, `http`, MIME, gzip, cache |
| `docker/nginx/conf.d/omnistack.conf` | Dua server block: `:8080` redirect, `:58443` TLS |
| `docker/nginx/snippets/security-headers.conf` | Sumber tunggal semua security header |
| `scripts/gen-dev-certs.sh` | Generate sertifikat self-signed + SAN |
| `.env.example` | `BIND_ADDR`, `HTTPS_PORT`, `NEXT_PUBLIC_BASE_PATH` |
| `docker/certs/` | Sertifikat (git-ignored, `*.pem`) |

---

## 3. KenapaKeputusan

### 3.1 Port

| Aspek | Nilai | Alasan |
|---|---|---|
| Container | `58443` | > 1024, wajib untuk non-root |
| Host | `58443` | **Harus sama dengan container** — lihat §3.2 |
| Bind | `127.0.0.1` | Aplikasi tidak punya autentikasi server |
| HTTP | `8080`, **tidak dipublish** | Hanya untuk health probe + redirect internal |

Hanya **satu** port yang dibuka ke host. Memublish juga listener HTTP akan
membuka port kedua di host yang hanya punya satu tujuan: redirect ke port di sebelahnya.

**Tradeoff yang perlu diketahui:** `58443` berada **di dalam** ephemeral port
range Linux (32768–60999). Koneksi outbound browser/Node bisa mendapat
`58443` sebagai source port, setelah itu server gagal bind dan muncul
`address already in use` yang jarang dan sulit dikaitkan. Lingkupnya sempit dan
jarang terjadi di mesin single-user, tapi kalau ketemu, pindah ke port di atas
60999 (misal `64433`) sebelum menebak hal lain.

### 3.2 Port container dan host harus identik

Ini bukan Kebetulan, tapi kontrak. Redirect HTTP→HTTPS harus menyebut port
eksternal, dan `$host` di nginx **sudah kehilangan port** — jadi satu-satunya
cara menulis URL absolut adalah menulis port-nya hardcode.

Kalau dua port berbeda, redirect diam-diam menunjuk port yang tidak ada
listener-nya. Kalau mengganti `HTTPS_PORT` di `.env`, ganti juga `listen` di
`docker/nginx/conf.d/omnistack.conf`.

### 3.3 Loopback-only

Aplikasi **tidak punya autentikasi**. `components/route-guard.tsx` hanya
menyembunyikan UI di browser — siapa pun yang bisa memuat halaman bisa membaca
mock data dan menjalankan setiap "deploy". Mempublish di `0.0.0.0` tanpa auth
nyata setara mempublikasi panel admin tanpa password.

Perlu diketahui: **published port Docker melewati ufw/firewalld**, karena DNAT
terjadi sebelum chain INPUT host dievaluasi. Firewall yang terlihat tertutup
tidak menyelamatkan Anda kalau `BIND_ADDR=0.0.0.0`.

### 3.4 `worker_processes 1`, bukan `auto`

Host punya 12 core. `auto` akan mem-fork 12 worker di dalam container yang
dibatasi 0.5 CPU / 128 MB — tekanan memori yang pasti, dan `auto` juga
mengabaikan batas CPU cgroup sepenuhnya.

### 3.5 Rate limiting: mati secara default

`rate=30r/s burst=60` akan mengembalikan **429 pada JS/CSS aplikasi sendiri**.
Satu muat halaman Next.js menembakkan 30–60 request aset paralel; cold cache
first paint bisa melampaui burst, dan itu terbaca sebagai "aplikasi rusak",
bukan sebagai throttling.

Zona `limit_req_zone`/`limit_conn_zone` tetap dideklarasikan, dan enforcement-nya
ready di `conf.d/omnistack.conf` dalam bentuk komentar. Untuk mengaktifkan:

1. Hapus dua baris `limit_req_status` / `limit_conn_status`
2. Aktifkan tiga baris `limit_req` / `limit_conn`
3. Jalankan dulu dengan `limit_req_dry_run on;` — mencatat tanpa memblokir,
   cek `docker-compose logs` untuk melihat apa yang *akan* diblokir

### 3.6 HSTS: `max-age=300`, bukan `preload`

HSTS **tidak bisa di-override browser**. Begitu di-cache, host itu jadi
HTTPS-only **selamanya** — `curl -k` dan "Proceed anyway" sama-sama tidak
tolong, satu-satunya jalan adalah menghapus state profil browser.

Dengan `max-age=63072000; includeSubDomains; preload` pada sertifikat self-signed
lokal, satu kunjungan tidak sengaja bisa memblokir `localhost:58443` selama dua
tahun tanpa jalur pemulihan. Untuk produksi publik yang sungguhan, aktifkan
policy kuat di `snippets/security-headers.conf` — tapi hanya setelah sertifikat
benar-benar valid.

### 3.7 OCSP stapling mati

Butuh sertifikat publik yang punya OCSP responder **dan** direktif `resolver`.
Dengan sertifikat self-signed default, ini hanya menghasilkan badai error log
dan tidak menambah keamanan. Baris untuk Let's Encrypt tersedia dalam bentuk
komentar.

### 3.8 `script-src 'unsafe-inline'` memang tidak bisa dihilangkan

Bukan sekadar-malasan, tapi memang tidak bisa di(static export):

- `mock-previews.ts` menyisipkan `<script>` inline (preview "Realtime Collab")
- panel preview AI Architect merender iframe lewat `srcDoc`
- `next-themes` menyuntikkan script inline blocking untuk mencegah FOUC

Menghilangkannya butuh nonce per-request, yang butuh server dinamis — mustahil
bersama static export. CSP di sini defense-in-depth, bukan pengganti penuh
untuk escaping.

---

## 4. Hardening

| Setting | Nilai | Efek |
|---|---|---|
| `read_only` | `true` | Rootfs tak bisa dimodifikasi |
| `user` | `101:101` | Tidak ada root di mana pun |
| `cap_drop` | `[ALL]` | Semua capability dibuang |
| `security_opt` | `no-new-privileges:true` | Cegah privilege escalation via setuid |
| tmpfs | 3 path, `noexec,nosuid` | Satu-satunya area writable |
| `cpus` / `mem_limit` | `0.50` / `128m` | Batas keras per container |
| `pids_limit` | `100` | Cegah fork bomb |
| log rotation | `10m` × `3` | Maks 30 MB, cegah disk penuh |
| `stop_signal` | `SIGQUIT` | Graceful: selesaikan request in-flight |
| cert mounts | `:ro` | Private key tak pernah masuk image |

Semua `*_temp_path` diarahkan ke `/var/cache/nginx` (tmpfs) secara eksplisit,
dan `pid` ke `/var/run` (tmpfs). **Mode tmpfs wajib `1777`, bukan `755`** —
uid 101 harus bisa membuat `nginx.pid` dan direktori temp di sana.

Sertifikat tidak pernah di-`COPY` ke image. Kalau private key masuk layer, ia
bisa diekstrak dari `docker history` dan dari setiap layer cache lama, jauh
setelah `docker rmi` — itulah cara private key bocor.

---

## 5. Troubleshooting

### 5.0 `nginx: [emerg] "... directive is not allowed here"`

Pernah terjadi nyata di repo ini:

```
nginx: [emerg] "client_body_temp_path" directive is not allowed here in /etc/nginx/nginx.conf:17
```

`client_body_temp_path`, `proxy_temp_path`, `fastcgi_temp_path`,
`uwsgi_temp_path`, `scgi_temp_path` **hanya sah di dalam blok `http {}`**.
`pid` dan `error_log` justru **boleh** di main context — jadi tidak bisa
dipindah semua sekaligus.

Cek cepat **tanpa menjalankan aplikasi**:

```bash
docker run --rm -u 101:101 --read-only --cap-drop=ALL \
  --security-opt no-new-privileges:true \
  --tmpfs /var/cache/nginx:size=64m,mode=1777,uid=101,gid=101 \
  --tmpfs /var/run:size=1m,mode=1777,uid=101,gid=101 \
  --tmpfs /tmp:size=16m,mode=1777,uid=101,gid=101 \
  -v "$PWD/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
  -v "$PWD/docker/nginx/conf.d:/etc/nginx/conf.d:ro" \
  -v "$PWD/docker/nginx/snippets:/etc/nginx/snippets:ro" \
  -v "$PWD/docker/certs:/etc/nginx/certs:ro" \
  nginxinc/nginx-unprivileged:1.27-alpine nginx -t
```

> ⚠️ `10-listen-on-ipv6-by-default.sh: info: can not modify
> /etc/nginx/conf.d/default.conf (read-only file system?)` itu **normal**.
> Script-nya mengecek `-w` lalu melewatkan file yang tidak writable.
>
> ⚠️ `Configuration complete; ready for start up` **bukan** berarti config
> valid. Entrypoint tidak memvalidasi syntax — ia mencetak itu lalu menyerahkan
> ke nginx yang bisa gagal di baris berikutnya.

### 5.1 `cannot load certificate key ... Permission denied`

nginx jalan sebagai uid 101; key owned oleh user host dengan mode `600` tidak
bisa dibaca. `listen ... ssl` membaca sertifikat **saat parse**, jadi container
langsung exit.

```bash
sudo ./scripts/gen-dev-certs.sh     # menghasilkan 640 + owner 101:101
```

Tanpa root, script jatuh ke mode `644` dan mencetak peringatan. Itu hanya
layak untuk kunci dev sekali pakai.

### 5.2 Redirect ke port yang salah

Gejala: buka `http://...` →|location] ke port yang tidak ada listener. Karena
kontrak port (§3.2): `HTTPS_PORT` di `.env` dan `listen` di
`conf.d/omnistack.conf` harus sama.

### 5.3 Halaman 301 di setiap route

Gejala: `/projects` → 301 → `/projects/`. Cause: ada langkah `$uri/` di
`try_files` yang menabrak directory. Lihat §3.2 rationale di `conf.d`.

### 5.4 Header security hilang di asset

`add_header` **tidak merge** — satu `add_header` di `location` menggantikan
seluruh set yang diwarisi. Karena itu setiap location yang punya header sendiri
harus `include /etc/nginx/snippets/security-headers.conf`.

Verifikasi:

```bash
curl -skI https://localhost:58443/_next/static/<any>.js | grep -iE 'cache-control|strict-transport'
```

Harus muncul **dua-duanya**. Kalau hanya `cache-control`, snippet belum
di-include.

### 5.5 Container `unhealthy`

`restart: unless-stopped` **tidak** bereaksi pada container yang unhealthy —
Docker hanya restart saat proses keluar. Healthcheck adalah sinyal untuk Anda,
bukan auto-heal. Kalau healthcheck gagal, cek log, jangan panik dengan
menambah `retries`.

### 5.6 Lainnya

| Gejala | Penyebab | Solusi |
|---|---|---|
| `address already in use` | Port dipakai proses lain / ephemeral collision | Ganti `HTTPS_PORT` **dan** `listen`; atau `ss -tlnp \| grep 58443` |
| Halaman berantakan, styling hilang | CSP terlalu ketat | Lihat §3.8, jangan longgarkan tanpa alasan |
| Avatar tidak muncul | `img-src` | CSP sudah izinkan `https:`;Dicebear butuh egress |
| Build gagal, error jaringan | npm butuh registry | Font sudah di-vendor, tapi `npm ci` tetap butuh network |
| Konten tak berubah | Static export | `docker-compose up -d --build` |
| `docker-compose: command not found` | Binary tidak di PATH | Gunakan `docker-compose`, bukan `docker compose` |

---

## 6. Checklist verifikasi

```bash
# 1. Headers ada di HTML
curl -skI https://localhost:58443/ | grep -iE 'strict-transport|content-security|x-frame'

# 2. Header TIDAK hilang di asset (regression add_header)
curl -skI https://localhost:58443/_next/static/<any>.js \
  | grep -iE 'cache-control|strict-transport'

# 3. Route dapat 200, bukan 301
for p in / /projects /dashboard /settings /ai-architect /login; do
  printf "%-16s %s\n" "$p" "$(curl -sk -o /dev/null -w '%{http_code}' https://localhost:58443$p)"
done

# 4. Hardening benar-benar aktif
docker inspect omni-web --format 'RO={{.HostConfig.ReadonlyRootfs}} User={{.Config.User}} Cap={{.HostConfig.CapDrop}}'

# 5. Health probe (plain HTTP internal)
docker exec omni-web wget -qO- http://127.0.0.1:8080/healthz

# 6. Tidak ada root shell
docker exec omni-web id          # uid=101(nobody|nginx)
```

---

## 7. Untuk produksi

Yang **tidak** otomatis berlaku untuk publik:

1. **Sertifikat asli.** Ganti self-signed dengan Let's Encrypt. Ganti
   `ssl_certificate*` ke `/etc/letsencrypt/live/<domain>/`, atau tambahkan
   sidecar certbot. HSTS baru layak diaktifkan setelah ini (§3.6).
2. **Autentikasi sungguhan.** Selama route guard hanya client-side, jangan
   set `BIND_ADDR=0.0.0.0`.
3. **Rate limiting aktif** (§3.5).
4. **Digest pinning.** `Dockerfile` mengunci versi minor (`1.27-alpine`) tapi
   masih tag yang bisa bergeser. Untuk reproduktibilitas penuh, tambahkan
   `@sha256:<digest>`.
5. **Cache di belakang.** Kalau ada CDN/reverse proxy di depan, HSTS + OCSP +
   rate limit lebih baik ditangani di sana.

---

## 8. Referensi

- nginx security headers (OWASP): HSTS, CSP, X-Frame-Options, nosniff
- Read-only container + tmpfs: pola hardening nginx
- nginx performance: `sendfile`, `tcp_nopush`, `open_file_cache`
- Next.js static export + nginx
- `nginxinc/nginx-unprivileged` — image yang berjalan sebagai uid 101
