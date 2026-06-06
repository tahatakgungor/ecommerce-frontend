# Docker Maintenance Automation

This server-side maintenance job keeps the Serravit production host from silently filling up with unused Docker artifacts.

## What it does

- runs every hour via `cron`
- prunes stopped containers older than 6 hours
- prunes all Docker build cache aggressively
- prunes unused Docker images older than 6 hours
- switches to aggressive full unused-image pruning when `/` usage reaches 80%
- never touches Docker volumes

## Files

- Script source of truth: `ops/server/serravit-docker-maintenance.sh`
- Installed server path: `/usr/local/sbin/serravit-docker-maintenance.sh`
- Cron log: `/var/log/serravit-docker-maintenance.log`

## Cron entry

```cron
17 * * * * /usr/local/sbin/serravit-docker-maintenance.sh >> /var/log/serravit-docker-maintenance.log 2>&1
```

## Notes

- The 6-hour image grace period is a compromise between fast cleanup and giving a short rollback window.
- Build cache is intentionally pruned aggressively because it was the main source of silent disk growth on this host.
- If the server starts filling faster than expected, lower `IMAGE_GRACE_HOURS` or the cron interval.
