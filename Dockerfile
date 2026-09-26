# syntax=docker/dockerfile:1

# ---------- Stage 1: build the static export ----------
FROM node:24-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Deliberately NOT setting CI=1: it suppresses nothing extra now that Next 16
# removed `next lint`, while a set CI variable makes several tools in the
# dependency tree promote warnings into hard build failures.

# Manifests first so the install layer is cached until deps actually change.
COPY package.json package-lock.json ./
# No --omit=dev (the build needs typescript/tailwind/eslint-config-next) and
# no --ignore-scripts (swc + Tailwind Oxide fetch platform binaries in postinstall).
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

# Empty default => no basePath, assets served from the domain root.
ARG NEXT_PUBLIC_BASE_PATH=""
RUN NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH npm run build

# ---------- Stage 2: serve the static files ----------
# Pinned to a minor version rather than a floating `alpine` tag: a moving tag
# means two rebuilds a week apart can produce different images from an identical
# Dockerfile, which is how "it worked yesterday" bugs happen. To pin harder,
# resolve the digest once and append @sha256:<digest>.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="OmniStack" \
      org.opencontainers.image.description="Static export of the OmniStack Next.js app served by unprivileged nginx" \
      org.opencontainers.image.source="https://github.com/omnistack/omnistack"

# Only ./out crosses the stage boundary: the runtime holds no Node, no npm
# and no application source. That is where nearly all the image size goes.
COPY --from=builder /app/out /usr/share/nginx/html

# Bake the nginx config in as the image's own default, then delete the stock
# server block. Two reasons:
#   1. the image is usable on its own (`docker run -p 58443:58443 omnistack:local`)
#      without mounting anything;
#   2. the stock default.conf listens on :8080 and would collide with our own
#      :8080 redirect block the moment someone includes conf.d/*.conf.
# compose still bind-mounts these paths over the top for editing without a
# rebuild. TLS material is NOT baked in -- certs stay on the host and are
# mounted read-only (see .dockerignore).
COPY docker/nginx/nginx.conf           /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/               /etc/nginx/conf.d/
COPY docker/nginx/snippets/             /etc/nginx/snippets/
RUN rm -f /etc/nginx/conf.d/default.conf

# Unprivileged nginx cannot bind ports below 1024, so both listeners are >1024.
# 58443 must stay in sync with HTTPS_PORT in compose and with the `listen`
# directive in conf.d/omnistack.conf -- see the PORT CONTRACT comment there.
EXPOSE 8080 58443

CMD ["nginx", "-g", "daemon off;"]
