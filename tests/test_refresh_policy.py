import os
import re
import unittest
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import patch
from scripts.refresh_policy import KST, forced_refresh, scheduled_collection_allowed


class RefreshPolicyTests(unittest.TestCase):
    def test_workflow_has_exactly_four_seoul_morning_slots(self):
        workflow = (Path(__file__).resolve().parents[1] / '.github/workflows/sync-coupons.yml').read_text(encoding='utf-8')
        slots = []
        for expression in re.findall(r"cron: '([^']+)'", workflow):
            minute, hour, day, month, weekday = expression.split()
            self.assertEqual((day,month,weekday), ('*','*','*'))
            for utc_hour in map(int, hour.split(',')):
                for utc_minute in map(int, minute.split(',')):
                    slots.append(((utc_hour + 9) % 24) * 60 + utc_minute)
        self.assertEqual(sorted(slots), [570,600,630,660])

    def test_scheduled_seoul_window(self):
        with patch.dict(os.environ, {"GITHUB_EVENT_NAME": "schedule"}):
            for hour, minute, allowed in [(9,29,False),(9,30,True),(10,0,True),
                    (10,30,True),(11,0,True),(11,1,False),(23,59,False),(0,0,False)]:
                with self.subTest(hour=hour, minute=minute):
                    self.assertEqual(scheduled_collection_allowed(datetime(2026,10,15,hour,minute,tzinfo=KST)), allowed)
            self.assertTrue(scheduled_collection_allowed(datetime(2026,10,15,0,30,tzinfo=timezone.utc)))

    def test_manual_request_is_allowed_outside_window(self):
        with patch.dict(os.environ, {"GITHUB_EVENT_NAME":"workflow_dispatch", "FORCE_REFRESH":"true"}):
            self.assertTrue(scheduled_collection_allowed(datetime(2026,10,15,21,0,tzinfo=KST)))
            self.assertTrue(forced_refresh())
        with patch.dict(os.environ, {"GITHUB_EVENT_NAME":"schedule", "FORCE_REFRESH":"true"}):
            self.assertFalse(forced_refresh())
