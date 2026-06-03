#!/usr/bin/env bash

set -euo pipefail

STOREFRONT_BASE="${STOREFRONT_BASE:-http://localhost:3000}"
ADMIN_BASE="${ADMIN_BASE:-http://localhost:3001}"
MAX_PAGE_MS="${MAX_PAGE_MS:-3000}"

measure_page() {
  local url="$1"
  local label="$2"

  local result
  result="$(curl -sS -L -o /tmp/serravit-ui-body.$$ -w '%{http_code} %{time_total}' "$url")"
  local status="${result%% *}"
  local seconds="${result##* }"
  local millis
  millis="$(python3 - <<PY
seconds = float("${seconds}")
print(round(seconds * 1000))
PY
)"

  if [[ "$status" != "200" ]]; then
    echo "ERROR: ${label} status=${status} url=${url}"
    cat /tmp/serravit-ui-body.$$ || true
    rm -f /tmp/serravit-ui-body.$$
    exit 1
  fi

  if (( millis > MAX_PAGE_MS )); then
    echo "ERROR: ${label} latency=${millis}ms threshold=${MAX_PAGE_MS}ms"
    rm -f /tmp/serravit-ui-body.$$
    exit 1
  fi

  echo "OK: ${label} status=${status} latency=${millis}ms"
  rm -f /tmp/serravit-ui-body.$$
}

echo "Storefront base: ${STOREFRONT_BASE}"
measure_page "${STOREFRONT_BASE}/" "home"
measure_page "${STOREFRONT_BASE}/shop" "shop"
measure_page "${STOREFRONT_BASE}/blog" "blog"
measure_page "${STOREFRONT_BASE}/contact" "contact"
measure_page "${STOREFRONT_BASE}/faq" "faq"

echo "Admin base: ${ADMIN_BASE}"
measure_page "${ADMIN_BASE}/login" "admin-login"
