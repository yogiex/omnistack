---
name: omnistack-kg
description: Local markdown knowledge graph with ontology for OmniStack at docs/kg/. Use when starting ANY coding task in this repo (read relevant nodes first), and after finishing a task that changed pages, components, or lib modules (update affected nodes). Also use when the user says "kg", "knowledge graph", "ontology", "klasifikasi", "update graf", or asks how parts of OmniStack connect.
---

# OmniStack Knowledge Graph (Markdown + Ontology, Lokal)

Graf pengetahuan project ini hidup di `docs/kg/` — plain markdown, tanpa database,
tanpa tool eksternal. Ada dua layer:

- **`_index.md`** — entry point + peta semua node (ABox: instance).
- **`_ontology.md`** — skema klasifikasi (TBox): hierarki kelas, kosakata relasi
  bertipe, dan aturan inferensi praktis.

Node = satu file di `docs/kg/nodes/`; relasi = wikilink `[[nama-node]]` yang dikelompokkan
per relasi bertipe di bawah heading `## Relations`.

## Workflow 1 — Sebelum mengerjakan task (READ)

1. Baca `docs/kg/_ontology.md` §1 untuk tahu kelas entitas yang akan disentuh,
   lalu `docs/kg/_index.md`.
2. Identifikasi node yang relevan dengan file/fitur yang akan diubah
   (grep nama file atau topik di `docs/kg/nodes/*.md`).
3. Baca node tersebut + ikuti relasi keluarnya (`dependsOn →`, `renders →`, dst).
4. Terapkan inferensi murah dari `_ontology.md` §4:
   constraint yang `classifies→` node wajib dipatuhi; blast radius perubahan LibModule
   = semua node yang `dependsOn→` node itu.
5. Patuhi bagian **Gotchas** di setiap node yang dibaca.

## Workflow 2 — Setelah selesai mengubah kode (WRITE)

1. Untuk setiap file yang berubah, temukan nodenya via tabel Files / grep path.
2. Update node: Purpose, Relations, Gotchas — sesuai kondisi baru.
3. Pilih relasi **paling spesifik** dari kosakata `_ontology.md` §2
   (pakai `renders`, bukan `dependsOn`, untuk page→component).
4. Jaga simetri inverse di kedua sisi:
   A `renders→` B ⟺ B punya `renderedBy ←` A. Tabel lengkap inverse ada di §2.
5. Jika membuat entitas baru → buat node baru dari template
   `docs/kg/nodes/_template.md`, klasifikasikan ke kelas paling spesifik §1,
   lalu daftarkan di `_index.md`.
6. Jika menghapus/mengganti nama entitas → hapus/rename node dan bersihkan semua wikilinks
   yang menunjuk kepadanya (`grep -rn "\[\[nama\]\]" docs/kg/`).

## Aturan Node

- Satu node = satu entitas koheren. Jangan buat node per-file trivia.
- Field metadata wajib: `Class` (dari taksonomi §1), `Files`, `Status`.
- Nama file = nama node = prefix tipe level-2 (`page-`/`component-`/`lib-`/`concept-`) + kebab-case.
- Wikilink TANPA `.md`. Path file selalu relative ke repo root.
- Maksimal ~40 baris per node.

## Anti-pattern

- Memakai relasi di luar kosakata `_ontology.md` §2 tanpa amendemen ontologi.
- Menyalin isi file kode ke dalam node — node berisi ringkasan + relasi, bukan source.
- Wikilink mati atau relasi asimetris (satu sisi hilang) — jalankan validator skill ini.
- Membuat node untuk halaman/komponen yang belum ada di repo.

## Validator

Jalankan `bash .opencode/skills/omnistack-kg/scripts/validate-kg.sh` setelah menulis node.
Script lokal murni (bash+grep) memeriksa: wikilink mati, relasi di luar kosakata,
relasi asimetris, dan field metadata wajib.
