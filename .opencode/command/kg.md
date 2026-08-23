---
description: Kelola knowledge graph markdown OmniStack (docs/kg/) via kg-curator.
agent: kg-curator
---

Jalankan maintenance knowledge graph di `docs/kg/`.

Permintaan: $ARGUMENTS

Jika argumen kosong atau berisi "init"/"sync", lakukan sinkronisasi penuh:
1. Baca `docs/kg/_index.md`.
2. Scan kode aktual (app/, components/, lib/).
3. Buat node yang hilang dari `docs/kg/nodes/_template.md`, perbarui yang kadaluarsa,
   hapus node untuk entitas yang sudah tidak ada.
4. Sinkronkan `_index.md` dan validasi tidak ada wikilink mati.

Laporkan ringkasan: node dibuat/diubah/dihapus + sisa wikilink mati (harus 0).
