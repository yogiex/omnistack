#!/usr/bin/env bash
# Quality Gate untuk OmniStack: lint → typecheck → build
# Usage: bash .opencode/skills/omnistack-quality-gate/scripts/verify.sh [--no-build]
# Exit 0 = RESULT: PASS, exit 1 = RESULT: FAIL

set -u

cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

NO_BUILD=false
[ "${1:-}" = "--no-build" ] && NO_BUILD=true

fail=0

run_step() {
  local name="$1"; shift
  echo ""
  echo "=== [$name] $* ==="
  if "$@"; then
    echo "--- $name: OK"
  else
    echo "--- $name: FAILED"
    fail=1
    return 1
  fi
}

echo "OmniStack Quality Gate"
echo "Repo: $(pwd)"

run_step "1/3 Lint" npm run lint || true
if [ "$fail" -eq 0 ]; then
  run_step "2/3 Typecheck" npx tsc --noEmit || true
fi
if [ "$fail" -eq 0 ] && [ "$NO_BUILD" = false ]; then
  run_step "3/3 Build" npm run build || true
fi

echo ""
if [ "$fail" -eq 0 ]; then
  echo "RESULT: PASS — semua quality gate lolos."
  exit 0
else
  echo "RESULT: FAIL — perbaiki error di atas, lalu jalankan ulang."
  exit 1
fi
