# PocketBase backend — Linux AMD64 (Fly.io)
# NOTE: The local macOS ARM64 binary (pocketbase/pocketbase) does NOT work on Fly.io.
# This Dockerfile downloads the correct Linux x86_64 binary at build time.

FROM alpine:3.19

# ca-certificates: needed for PocketBase HTTPS outbound requests (job APIs, etc.)
RUN apk add --no-cache ca-certificates wget unzip

# Must match the PocketBase version in use locally (see CLAUDE.md)
ARG PB_VERSION=0.22.20

RUN wget -q \
    "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pocketbase.zip \
    && unzip /tmp/pocketbase.zip -d /pb \
    && rm /tmp/pocketbase.zip \
    && chmod +x /pb/pocketbase

# Copy JS migrations — PocketBase replays these automatically on first start
# against a fresh Fly.io volume, creating all 5 collections without needing setup-pb.js
COPY pocketbase/pb_migrations /pb/pb_migrations

EXPOSE 8090

# --http=0.0.0.0 binds to all interfaces (containers default to 127.0.0.1 — would be unreachable)
# --dir points to the Fly.io persistent volume mounted at /pb/pb_data
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
