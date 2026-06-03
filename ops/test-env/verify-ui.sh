#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STOREFRONT_DIR="$ROOT_DIR/harri-front-end"
ADMIN_DIR="$ROOT_DIR/harri-admin-panel"

echo "[ui] storefront unit"
(cd "$STOREFRONT_DIR" && npm run test:unit)

echo "[ui] storefront build"
(cd "$STOREFRONT_DIR" && npm run build)

echo "[ui] storefront fixture sync"
(cd "$STOREFRONT_DIR" && npm run test:env:sync)

echo "[ui] storefront env verify"
(cd "$STOREFRONT_DIR" && npm run test:env:verify)

echo "[ui] admin unit"
(cd "$ADMIN_DIR" && npm run test:unit)

echo "[ui] admin build"
(cd "$ADMIN_DIR" && npm run build)

echo "[ui] admin fixture sync"
(cd "$ADMIN_DIR" && npm run test:env:sync)

echo "[ui] admin env verify"
(cd "$ADMIN_DIR" && npm run test:env:verify)

echo "[ui] verify complete"
