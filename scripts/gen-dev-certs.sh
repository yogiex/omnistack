#!/usr/bin/env bash
# =============================================================================
# Generate a self-signed certificate for local HTTPS on OmniStack.
# =============================================================================
# Run once before `docker-compose up`:
#   ./scripts/gen-dev-certs.sh
#
# This is for LOCAL DEVELOPMENT ONLY. A self-signed certificate is trusted by
# nobody: the browser will warn on every visit and `curl` needs -k. It buys you
# a real TLS handshake (so HSTS, http2 and the secure-context APIs are
# exercised locally) without needing a real domain.
#
# For anything reachable by other machines, use Let's Encrypt instead -- see
# README.docker.md §7.
# =============================================================================
set -euo pipefail

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/docker/certs"
DAYS="${CERT_DAYS:-825}"
CN="${CERT_CN:-localhost}"

mkdir -p "$CERT_DIR"

# Refuse to silently clobber a key you may still depend on.
if [[ -f "$CERT_DIR/privkey.pem" ]]; then
  read -r -p "Overwrite existing certificate in $CERT_DIR? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || { echo "Aborted. Nothing changed."; exit 0; }
fi

# SAN, not just CN: every modern browser ignores CN for hostname verification,
# so a CN-only self-signed cert fails even after you click through the warning.
# localhost + the loopback IPs are what you will actually connect to.
cat > "$CERT_DIR/openssl.cnf" <<EOF
[req]
distinguished_name = req_dn
x509_extensions    = v3_req
prompt             = no

[req_dn]
CN = ${CN}

[v3_req]
basicConstraints       = critical, CA:FALSE
keyUsage               = critical, digitalSignature, keyEncipherment
extendedKeyUsage       = serverAuth
subjectAltName         = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = omnistack.local
DNS.3 = omnistack.test
IP.1  = 127.0.0.1
IP.2  = ::1
EOF

# 2048-bit RSA. ECDSA P-256 would be faster, but RSA keeps compatibility with
# anything that might still be pinned to older ciphers, and the key is only
# read once at nginx startup.
openssl req -x509 -nodes \
  -newkey rsa:2048 \
  -days "$DAYS" \
  -sha256 \
  -keyout "$CERT_DIR/privkey.pem" \
  -out    "$CERT_DIR/fullchain.pem" \
  -config "$CERT_DIR/openssl.cnf" 2>/dev/null

# Ownership is the part that actually matters here, and it is easy to get wrong.
#
# nginx runs as uid 101. A key left at mode 600 owned by the host user is
# unreadable, and nginx does not fail gracefully -- it aborts at config-parse
# time with:
#   [emerg] cannot load certificate key "/etc/nginx/certs/privkey.pem":
#          BIO_new_file() failed ... Permission denied
#
# Preferred: mode 640 owned by 101:101, so the nginx worker can read the key and
# nobody else can. That needs root, because you cannot chown as a normal user.
# If root is unavailable we fall back to 644 and say so loudly -- readable by
# any local account, which is acceptable ONLY for a throwaway self-signed dev
# key. Re-run with sudo to get the 640 ownership back.
if [[ "$(id -u)" -eq 0 ]]; then
  chown 101:101 "$CERT_DIR/privkey.pem"
  chmod 640 "$CERT_DIR/privkey.pem"
  KEY_MODE=640
elif sudo -n true 2>/dev/null; then
  sudo chown 101:101 "$CERT_DIR/privkey.pem"
  sudo chmod 640 "$CERT_DIR/privkey.pem"
  KEY_MODE=640
else
  chmod 644 "$CERT_DIR/privkey.pem"
  KEY_MODE=644
fi
chmod 644 "$CERT_DIR/fullchain.pem"

if [[ "$KEY_MODE" == 644 ]]; then
  cat >&2 <<'WARN'

  ────────────────────────────────────────────────────────────────────────────
  WARNING: privkey.pem is mode 644 (world-readable).
  nginx runs as uid 101 and cannot read a 600 key owned by your user, so this
  is the no-root fallback. It is acceptable for a throwaway self-signed dev
  key -- NOT for a real certificate.
  To fix:  sudo ./scripts/gen-dev-certs.sh
  ────────────────────────────────────────────────────────────────────────────
WARN
fi

echo
echo "Certificate written to $CERT_DIR"
openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -subject -dates -ext subjectAltName
echo
echo "Next:  docker-compose up -d --build"
echo "Then:  curl -kI https://localhost:8443/"
echo
echo "To make browsers stop warning, trust the CA at:"
echo "  $CERT_DIR/fullchain.pem"
