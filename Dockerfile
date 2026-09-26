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
FROM nginxinc/nginx-unprivileged:alpine AS runtime

LABEL org.opencontainers.image.title="OmniStack" \
      org.opencontainers.image.description="Static export of the OmniStack Next.js app served by unprivileged nginx" \
      org.opencontainers.image.source="https://github.com/omnistack/omnistack"

# Only ./out crosses the stage boundary: the runtime holds no Node, no npm
# and no application source. That is where nearly all the image size goes.
COPY --from=builder /app/out /usr/share/nginx/html

# Unprivileged nginx cannot bind ports below 1024.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
