#!/usr/bin/env bash
set -Eeuo pipefail

LOCK_FILE="/var/lock/serravit-docker-maintenance.lock"
IMAGE_GRACE_HOURS="${IMAGE_GRACE_HOURS:-6}"
DISK_USAGE_THRESHOLD="${DISK_USAGE_THRESHOLD:-80}"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] serravit-docker-maintenance already running"
  exit 0
fi

root_usage_percent() {
  df / | awk 'NR==2 {gsub(/%/, "", $5); print $5}'
}

stamp() {
  date -u +%Y-%m-%dT%H:%M:%SZ
}

before_usage="$(root_usage_percent)"
echo "[$(stamp)] docker maintenance start (root=${before_usage}%)"
docker system df || true

docker container prune -f --filter "until=${IMAGE_GRACE_HOURS}h" || true
# Build cache can be recreated safely; keep this aggressive to prevent silent growth.
if docker buildx version >/dev/null 2>&1; then
  docker buildx prune -af || true
else
  docker builder prune -af || true
fi

if [ "${before_usage}" -ge "${DISK_USAGE_THRESHOLD}" ]; then
  echo "[$(stamp)] root usage ${before_usage}% >= ${DISK_USAGE_THRESHOLD}% -> aggressive image prune"
  docker image prune -af || true
else
  docker image prune -af --filter "until=${IMAGE_GRACE_HOURS}h" || true
fi

after_usage="$(root_usage_percent)"
echo "[$(stamp)] docker maintenance finish (root=${after_usage}%)"
docker system df || true
