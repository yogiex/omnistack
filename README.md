<div align="center">

# 🚀 OmniStack

### The Developer Operating System

**Any Stack. Any Cloud. Your Rules.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo](#-demo) • [Fitur](#-fitur-unggulan) • [Instalasi](#-instalasi) • [Roadmap](#-roadmap)

</div>

---

## 📖 Tentang

**OmniStack** adalah _Developer Operating System (DevOS)_ — platform PaaS (Platform as a Service) modern yang menyatukan **Cloud IDE**, **AI Prompt Engineer**, **CI/CD Pipeline**, dan **Container Orchestration** dalam satu antarmuka yang elegan.

Berbeda dengan PaaS tradisional yang mahal (Vercel, Heroku) atau Control Panel kuno (cPanel, CyberPanel), OmniStack menggunakan model **Bring Your Own Cloud (BYOC)** — Anda membawa VPS sendiri (Hetzner, AWS, DigitalOcean, IDCloudHost), kami yang mengorkestrasinya.

### 💡 Mengapa OmniStack?

| Masalah Lama                                   | Solusi OmniStack                               |
| ---------------------------------------------- | ---------------------------------------------- |
| ❌ Tagihan cloud mahal karena markup           | ✅ BYOC — bayar hanya lisensi platform         |
| ❌ Vendor lock-in                              | ✅ Self-hosted, data Anda 100% milik Anda      |
| ❌ Konfigurasi server manual (SSH, Nginx, SSL) | ✅ Zero-config deployment via Git              |
| ❌ Boilerplate berulang tiap proyek baru       | ✅ AI Architect generate kode & infrastruktur  |
| ❌ Stack terbatas (hanya Next.js/Vercel)       | ✅ Bebas pilih: React, Vue, Go, Rust, PHP, dll |

---

## ✨ Fitur Unggulan

### 🤖 AI Architect & Prompt Engineer

Ketik ide Anda dalam bahasa natural, AI kami akan men-generate:

- Struktur folder proyek
- Dockerfile & docker-compose
- Database schema & relasi ORM
- CI/CD pipeline siap pakai

```text
Prompt: "Buat SaaS Inventory dengan Next.js, Hono API, dan Postgres"
✓ Generating project structure...
✓ Creating Dockerfile...
✓ Setting up Prisma schema...
✓ Ready to deploy in 4.2s.
```

````

### 🎨 Freedom Stack Builder

Pilih kombinasi **frontend + backend + database + ORM** apa saja. OmniStack otomatis mendeteksi bahasa dengan Nixpacks/Buildpacks dan menyesuaikan environment-nya.

### 🔄 GitOps Native & Preview Environments

Setiap **Pull Request** otomatis mendapat URL staging sendiri (`pr-42.omnistack.app`) lengkap dengan database kloning. Merge PR = deploy ke production. Close PR = environment dihapus.

### 📊 Multi-Node Auto-Scaling

Gabungkan 5+ VPS menjadi satu cluster raksasa. OmniStack mendistribusikan container secara otomatis ke server yang paling sepi.

### 💰 FinOps Dashboard

Lacak estimasi biaya **per-aplikasi** secara real-time. Agensi dapat menagih klien berdasarkan resource yang pasti, tanpa kejutan tagihan di akhir bulan.

---

## 🛠️ Tech Stack

| Kategori          | Teknologi                                 |
| ----------------- | ----------------------------------------- |
| **Framework**     | Next.js 16.3 (App Router + Turbopack)     |
| **Bahasa**        | TypeScript 5                              |
| **Styling**       | Tailwind CSS v4                           |
| **UI Components** | shadcn/ui (Base UI + Preset Nova)         |
| **Icons**         | Lucide React + react-icons (Simple Icons) |
| **Font**          | Geist (by Vercel)                         |
| **Theme**         | next-themes (Dark/Light Mode)             |

---

## 🚀 Instalasi

### Prasyarat

- Node.js **≥ 20.9.0** (LTS)
- npm **≥ 10.x** atau pnpm / bun
- Git

### Langkah Cepat

```bash
# 1. Clone repository
git clone https://github.com/username/omnistack.git
cd omnistack

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Perintah yang Tersedia

| Perintah        | Deskripsi                            |
| --------------- | ------------------------------------ |
| `npm run dev`   | Jalankan dev server dengan Turbopack |
| `npm run build` | Build untuk production               |
| `npm run start` | Jalankan production build            |
| `npm run lint`  | Jalankan ESLint                      |

---

## 📁 Struktur Proyek

```
omnistack/
├── app/
│   ├── layout.tsx              # Root layout (Theme + Tooltip provider)
│   ├── page.tsx                # Landing page (Marketing)
│   ├── (dashboard)/            # Route group (Dashboard layout)
│   │   ├── layout.tsx          # Dashboard shell (Sidebar + TopNav)
│   │   └── page.tsx            # Dashboard overview
│   └── login/
│       └── page.tsx            # Halaman login
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── app-sidebar.tsx         # Sidebar navigasi
│   ├── top-nav.tsx             # Top navigation (Search, Theme, Profile)
│   └── theme-provider.tsx      # Dark/Light mode provider
├── lib/
│   └── utils.ts                # Helper functions (cn, dll)
├── hooks/                      # Custom React hooks
├── public/                     # Static assets
├── components.json             # Konfigurasi shadcn/ui
├── next.config.ts              # Konfigurasi Next.js
└── tailwind.config.ts          # Konfigurasi Tailwind
```

---

## 🗺️ Roadmap

### ✅ Fase 1 — Foundation (Selesai)

- [x] Setup Next.js 16 + shadcn/ui
- [x] Landing page komprehensif
- [x] Dashboard shell (Sidebar + TopNav)
- [x] Halaman login dengan desain split-screen
- [x] Dark mode yang smooth

### 🚧 Fase 2 — Core Features (Dalam Pengembangan)

- [ ] Halaman AI Architect dengan terminal simulasi
- [ ] Freedom Stack Builder (pemilihan tech stack)
- [ ] Cloud IDE dengan Live Preview
- [ ] Project management & Git integration

### 🔮 Fase 3 — Infrastructure

- [ ] Multi-node cluster management
- [ ] Auto-scaling container
- [ ] FinOps dashboard (cost tracking)
- [ ] Preview environments per Pull Request

### 🌟 Fase 4 — Enterprise

- [ ] SSO (SAML / OIDC)
- [ ] Audit logs & RBAC
- [ ] On-premise deployment option
- [ ] API publik & SDK

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. **Fork** repository ini
2. Buat **branch** fitur baru (`git checkout -b feature/AmazingFeature`)
3. **Commit** perubahan (`git commit -m 'Add some AmazingFeature'`)
4. **Push** ke branch (`git push origin feature/AmazingFeature`)
5. Buka **Pull Request**

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail lebih lanjut.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — Framework React yang luar biasa
- [shadcn/ui](https://ui.shadcn.com/) — Sistem komponen yang elegan
- [Vercel](https://vercel.com/) — Inspirasi desain & Geist font
- [Lucide Icons](https://lucide.dev/) — Ikon yang rapi dan konsisten
- [react-icons](https://react-icons.github.io/react-icons/) — Logo brand teknologi

---

<div align="center">

**Dibuat dengan ❤️ untuk developer di seluruh dunia**

[Website](#) • [Dokumentasi](#) • [Discord](#) • [Twitter](#)

</div>
````
