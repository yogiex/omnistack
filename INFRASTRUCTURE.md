# 🏗️ OmniStack AI Infrastructure

> Dokumentasi infrastruktur **context engineering** untuk AI coding agents —
> dirancang agar agent bekerja otonom tanpa prompt berulang.

**Last updated:** 2026-08-23
**Target pembaca:** Developer, AI agents, maintainer infrastruktur project

---

## 📋 Daftar Isi

1. [Overview](#-overview)
2. [Arsitektur](#-arsitektur)
3. [Skills (.opencode/skills/)](#-skills-opencodeskills)
4. [Sub-Agents (.opencode/agent/)](#-sub-agents-opencodeagent)
5. [Commands (.opencode/command/)](#-commands-opencodecommand)
6. [Memory Externalization (.opencode/memory/)](#-memory-externalization-opencodememory)
7. [Knowledge Graph (docs/kg/)](#-knowledge-graph-docskg)
8. [Quality Gate](#-quality-gate)
9. [Workflow: /mvp End-to-End](#-workflow-mvp-end-to-end)
10. [Maintenance](#-maintenance)

---

## 🧭 Overview

Masalah yang diselesaikan infrastruktur ini:

| Masalah | Solusi di repo ini |
|---------|-------------------|
| Agent lupa konteks antar sesi | Memory externalization (`.opencode/memory/`) |
| Aturan project di-prompt berulang | `AGENTS.md` + skills on-demand |
| Kode tidak konsisten dengan conventions | Sub-agent `code-reviewer` independen |
| Lint/typecheck/build lupa dijalankan | Quality gate script (`verify.sh`) |
| Dokumentasi codebase basi | Knowledge graph (`docs/kg/`) + validator |

Prinsip desain (dari praktik context engineering 2026):

- **Write** — state persisten ke filesystem, bukan context window.
- **Select** — load konteks on-demand via skills, jangan eager-load semua.
- **Compress** — node KG berisi ringkasan + relasi, bukan salinan kode.
- **Isolate** — maker-checker split: implementer dan reviewer adalah agent terpisah.

---

## 🗺️ Arsitektur

```
┌───────────────────────────────────────────────────────────┐
│                      USER ENTRY POINTS                     │
│         /mvp <fitur>          /kg init|sync|<node>        │
└──────────────┬────────────────────────┬───────────────────┘
               ▼                        ▼
┌──────────────────────────┐  ┌─────────────────────┐
│   mvp-implementer        │  │    kg-curator       │
│   (edit: allow)          │  │    (write kg only)  │
│                          │  └─────────────────────┘
│  1. Baca AGENTS.md       │
│  2. Baca docs/kg/        │
│  3. Skill mvp-feature ───┼──► .opencode/skills/*
│  4. Tulis kode           │
│  5. verify.sh (gate)     │
└──────────────┬───────────┘
               ▼
┌──────────────────────────┐
│   code-reviewer          │
│   (edit: deny)           │
│   Review independen →    │
│   APPROVE / REQUEST_     │
│   CHANGES / BLOCK        │
└──────────────┬───────────┘
               ▼
┌──────────────────────────┐     ┌─────────────────────┐
│   Laporan ke user        │ ◄── │ .opencode/memory/*  │
│   (+ update memory)      │     │ todo/decisions/errors│
└──────────────────────────┘     └─────────────────────┘
```

---

## 🛠️ Skills (.opencode/skills/)

Skill = instruksi on-demand dengan trigger deskripsi. Format: folder +
`SKILL.md` (frontmatter `name` + `description`).

| Skill | Trigger kapan dipakai | Isi utama |
|-------|----------------------|-----------|
| `omnistack-mvp-feature` | Tambah fitur/page baru | Workflow 6 langkah + referensi pola komponen |
| `omnistack-quality-gate` | Sebelum selesai/commit | Prosedur lint+typecheck+build + aturan perbaikan error |
| `omnistack-kg` | Awal & akhir task yang menyentuh kode | Workflow read/write knowledge graph + validator |
| `omnistack-shadcn` | Bekerja dengan `components/ui/` | CLI registry, Base UI vs Radix |
| `omnistack-uiux-pro-max` | Desain visual | Style catalog, motion presets, aksesibilitas |

**Aturan menulis skill baru:**
- Frontmatter wajib: `name`, `description`.
- `description` harus eksplisit menyebut kata pemicu ("use when ...") —
  agent memilih skill dari deskripsi, bukan nama.
- Simpan referensi panjang di `references/*.md`, bukan di SKILL.md.

---

## 🤖 Sub-Agents (.opencode/agent/)

Agent = role dengan permission terpisah (frontmatter `mode`, `permission`).

| Agent | Permission | Role |
|-------|-----------|------|
| `mvp-implementer` | `edit: allow`, `bash: ask` | Implementasi fitur mengikuti skill MVP + quality gate + KG update |
| `code-reviewer` | `edit: deny`, `bash: ask` | Review independen; verdict APPROVE / REQUEST_CHANGES / BLOCK |
| `kg-curator` | `edit: allow` (kg only), `bash: ask` | Sinkronisasi `docs/kg/` dengan kode aktual |

**Maker-checker split:** implementer menulis, reviewer menilai. Jangan biarkan
agent yang sama menilai kodenya sendiri untuk fitur besar (menghindari
"cognitive surrender" — agent memberi nilai bagus pada kodenya sendiri).

---

## ⌨️ Commands (.opencode/command/)

Command = entry point user yang memicu orchestrator.

| Command | Fungsi |
|---------|--------|
| `/mvp <deskripsi-fitur>` | Spec singkat → implement via `mvp-implementer` → review via `code-reviewer` → perbaikan → laporan akhir |
| `/kg init\|sync\|<node>` | Maintenance knowledge graph via `kg-curator`; `sync` = sinkronisasi penuh |

---

## 💾 Memory Externalization (.opencode/memory/)

Filesystem sebagai persistent memory antar sesi (pola Manus/recitation).

| File | Isi | Protokol |
|------|-----|----------|
| `todo.md` | Task aktif + next steps + blockers | Baca di awal task; **update di tiap milestone** (recitation — menjaga objectives di recent tokens) |
| `decisions.md` | Keputusan arsitektur + rationale + alternatif yang ditolak | Baca sebelum memutuskan; tambah entri baru — **jangan re-litigate keputusan final** |
| `errors.md` | Error yang pernah terjadi + symptom/cause/fix | Konsultasi saat debug; tambah entri setelah fix non-trivial — **jangan hapus entri lama** (preserve failure context) |

---

## 📚 Knowledge Graph (docs/kg/)

Graf pengetahuan markdown lokal — peta semua entitas (pages, components,
lib modules, concepts) beserta relasi bertipe.

```
docs/kg/
├── _index.md      # Peta semua node (ABox)
├── _ontology.md   # Skema: kelas + kosakata relasi (TBox)
└── nodes/
    ├── _template.md
    ├── page-*.md        # satu file = satu entitas
    ├── component-*.md
    ├── lib-*.md
    └── concept-*.md
```

**Relasi bertipe** dengan simetri inverse wajib:
`renders ↔ renderedBy`, `dependsOn ↔ usedBy`, dll (daftar lengkap di `_ontology.md` §2).

**Protokol:**
1. Awal task: baca `_index.md` + node relevan (patuhi bagian Gotchas).
2. Akhir task: update node terdampak / buat node baru dari template.
3. Validasi: `bash .opencode/skills/omnistack-kg/scripts/validate-kg.sh`
   — cek dead links, relasi ilegal, asimetri. Hasil harus `RESULT: OK`.

> **Status saat ini:** graf belum lengkap (beberapa wikilinks menunjuk node
> yang belum dibuat). Jalankan `/kg sync` untuk sinkronisasi penuh.

---

## ✅ Quality Gate

Script tunggal untuk verifikasi kesehatan kode:

```bash
bash .opencode/skills/omnistack-quality-gate/scripts/verify.sh
# Tahap: npm run lint → npx tsc --noEmit → npm run build
# --no-build untuk skip tahap build (lebih cepat)
# Exit 0 = RESULT: PASS
```

Aturan:
- Wajib PASS sebelum commit / sebelum melaporkan task selesai.
- Maksimal 3 iterasi perbaikan otomatis; jika masih gagal, laporkan apa adanya.
- Dilarang lolos dengan cara: `eslint-disable`, `@ts-ignore`, turunkan strictness,
  atau edit `components/ui/`.

---

## 🔄 Workflow: /mvp End-to-End

Saat user menjalankan `/mvp <deskripsi-fitur>`:

```
1. Klarifikasi      → tanya user jika scope ambigu
2. Spec singkat     → route, komponen, data, interaksi (5-10 baris)
3. Implement        → delegasi ke mvp-implementer:
   3a. Baca AGENTS.md + docs/kg/_index.md + node relevan
   3b. Ikuti skill omnistack-mvp-feature (6 langkah)
   3c. Tulis kode (Server Components default, cn(), tokens, no any)
   3d. Jalankan verify.sh → wajib PASS
   3e. Update node KG + validate-kg.sh → RESULT: OK
4. Review           → delegasi ke code-reviewer (read-only)
5. Perbaikan        → temuan high/medium diperbaiki, gate diulang
6. Laporan          → file berubah, hasil review, status gate, node KG
```

Hasilnya: fitur selesai tanpa satu pun prompt pengulangan aturan project.

---

## 🔁 Maintenance

| Kapan | Apa yang dilakukan |
|-------|--------------------|
| Menambah fitur besar | Update node KG terkait; pertimbangkan entri baru di memory jika ada keputusan arsitektur |
| Error non-trivial terselesaikan | Tambah entri `.opencode/memory/errors.md` |
| Keputusan arsitektur final | Tambah entri `.opencode/memory/decisions.md` |
| Pola kode baru disepakati | Update `CONVENTIONS.md` + references skill terkait |
| Dependencies berubah | Update README.md (Tech Stack), CONVENTIONS.md, AGENTS.md |
| Setiap edit di docs/kg/ | Jalankan `validate-kg.sh` |
| Berkala (bulanan) | Audit AGENTS.md tetap ≤ ~150-200 aturan efektif; audit memory files agar tidak membengkak |

**Dokumen terkait:** [AGENTS.md](./AGENTS.md) · [CONVENTIONS.md](./CONVENTIONS.md) ·
[ARCHITECTURE.md](./ARCHITECTURE.md) · [README.md](./README.md)
