#!/usr/bin/env bash
# Validator lokal untuk OmniStack Knowledge Graph (docs/kg/).
# Murni bash + grep. Exit 1 jika ada pelanggaran.
set -u
KG_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)/docs/kg"
NODES_DIR="$KG_DIR/nodes"
fail=0

# Kosakata relasi + inverse (dari _ontology.md §2)
declare -A INV=(
  [dependsOn]=usedBy [usedBy]=dependsOn
  [renders]=renderedBy [renderedBy]=renders
  [guards]=guardedBy [guardedBy]=guards
  [providesContext]=consumesContext [consumesContext]=providesContext
  [classifies]=governedBy [governedBy]=classifies
  [documents]=documentedBy [documentedBy]=documents
)

# 1. Wikilink mati (kecuali doc-* yang menunjuk dokumen root)
kg_files="$KG_DIR/*.md $(find "$NODES_DIR" -name '*.md' ! -name '_*')"
dead=$(grep -rEoh '\[\[[a-z0-9-]+' $kg_files 2>/dev/null \
  | sed 's/\[\[//' | sort -u | while read -r target; do
    [[ "$target" == doc-* ]] && continue
    [[ -f "$NODES_DIR/$target.md" ]] && continue
    # semua kemunculan di dalam backticks = contoh dokumentasi, bukan edge nyata
    total=$(grep -rhE '\[\['"$target"'\]\]' $kg_files 2>/dev/null | wc -l)
    plain=$(grep -rhE '\[\['"$target"'\]\]' $kg_files 2>/dev/null | grep -vc '`\[\['"$target"'\]\]`')
    (( plain == 0 )) && continue
    echo "[[$target]]"
done)
[[ -n "$dead" ]] && { echo "DEAD LINK:"; echo "$dead"; fail=1; }

echo "---"

# 2. Field metadata wajib (Class, Files, Status) di setiap node non-template
for f in "$NODES_DIR"/*.md; do
  base=$(basename "$f")
  [[ "$base" == _* ]] && continue
  for field in Class Files Status; do
    grep -q "^| $field " "$f" || { echo "MISSING FIELD: $base -> $field"; fail=1; }
  done
done

echo "---"

# 3. Relasi di luar kosakata (heading H3 di ## Relations)
while IFS= read -r rel; do
  [[ -n "${INV[$rel]:-}" ]] || { echo "UNKNOWN RELATION: $rel"; fail=1; }
done < <(awk '/^## Relations/{inrel=1;next} /^## /{inrel=0} inrel && /^### /{
  gsub(/^### /,""); gsub(/ ←$/,""); gsub(/ →$/,""); print}' \
  "$NODES_DIR"/*.md 2>/dev/null | sort -u)

if (( fail )); then echo "RESULT: FAIL"; exit 1; else echo "RESULT: OK"; fi
