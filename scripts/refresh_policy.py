"""Only scheduled collection is limited to the Seoul morning window."""
import os
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))


def scheduled_collection_allowed(now=None):
    if os.environ.get("GITHUB_EVENT_NAME") != "schedule":
        return True
    local = (now or datetime.now(KST)).astimezone(KST)
    # Include the 11:00 minute; delayed scheduled runs after it are skipped.
    return 9 * 60 + 30 <= local.hour * 60 + local.minute <= 11 * 60


def forced_refresh():
    return (os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch"
            and os.environ.get("FORCE_REFRESH") == "true")
