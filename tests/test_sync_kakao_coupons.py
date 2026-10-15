import copy
import os
from unittest.mock import patch
import unittest
from datetime import date
from scripts.sync_kakao_coupons import parse_period, synchronize


def card(title, period, token="example"):
    return {"title": title, "contents": [{"t": "text", "v": period}],
            "button": {"title": "사은 참여하기", "link_type": "url",
                       "link_to": f"https://m.lotteshopping.com/cpn/gate/{token}/C10902"}}


def feed(cards):
    return {"items": [{"id": 123, "status": "published", "published_at": 1791607519000,
                       "updated_at": 1791607519000, "media": cards}]}


class CouponSyncTests(unittest.TestCase):
    def setUp(self):
        environment = patch.dict(os.environ, {"GITHUB_EVENT_NAME":"test", "FORCE_REFRESH":"false"})
        environment.start()
        self.addCleanup(environment.stop)
        self.data = {"steps": [{"title": "앱 설치"}], "giftStep": {
            "id": "step3", "primaryOffer": {"title": "old"},
            "secondaryOffer": {"title": "old sports"}, "showSecondOffer": True}}
        self.monthly = card("[10월] 10만원 이상 구매 시 5천원 쿠폰 증정",
                            "사용기한 : 10.1(목) - 10.31(토)", "monthly")
        self.sports = card("스포츠/아웃도어 5~10%", "기간 : 2026.10.09~2026.10.11", "sports")

    def test_current_cards_and_idempotence(self):
        source = feed([self.monthly, card("[가구] 10% 사은", ""), self.sports])
        result = synchronize(self.data, source)
        self.assertEqual(result["giftStep"]["primaryOffer"]["validUntil"], "2026-10-31")
        self.assertEqual(result["giftStep"]["secondaryOffer"]["validUntil"], "2026-10-11")
        self.assertIn("/sports/", result["giftStep"]["secondaryOffer"]["link"])
        self.assertEqual(result["steps"], self.data["steps"])
        self.assertEqual(synchronize(result, source), result)

    def test_november_changed_amounts_and_order(self):
        monthly = card("[11월] 20만원 이상 구매 시 1만원 쿠폰 증정", "11.1(일)~11.30(월)", "new")
        result = synchronize(self.data, feed([self.sports, monthly]))
        self.assertEqual(result["giftStep"]["primaryOffer"]["title"], monthly["title"])
        self.assertEqual(result["giftStep"]["primaryOffer"]["validFrom"], "2026-11-01")

    def test_absent_sports_preserves_second_offer(self):
        result = synchronize(self.data, feed([self.monthly]))
        self.assertNotIn("showSecondOffer", result["giftStep"])
        self.assertEqual(result["giftStep"]["secondaryOffer"], self.data["giftStep"]["secondaryOffer"])

    def test_manual_coupons_and_dates_survive_automatic_collection(self):
        for key in ("primaryOffer", "secondaryOffer"):
            self.data["giftStep"][key] = {
                "title": "직접 수정", "link": "https://example.com/manual",
                "validFrom": "2026-10-15", "validUntil": "2026-10-20",
                "manualOverride": True}
        result = synchronize(self.data, feed([self.monthly, self.sports]))
        for key in ("primaryOffer", "secondaryOffer"):
            self.assertEqual(result["giftStep"][key], self.data["giftStep"][key])

    def test_automatic_collection_can_be_restored_per_coupon(self):
        self.data["giftStep"]["primaryOffer"]["manualOverride"] = True
        self.data["giftStep"]["secondaryOffer"]["manualOverride"] = False
        result = synchronize(self.data, feed([self.monthly, self.sports]))
        self.assertEqual(result["giftStep"]["primaryOffer"]["title"], "old")
        self.assertEqual(result["giftStep"]["secondaryOffer"]["title"], self.sports["title"])

    def test_list_updates_only_connected_coupons_preserving_switches_and_order(self):
        self.data["giftStep"]["offers"] = [
            {"id": "mine", "source": "manual", "title": "직접 작성"},
            {"id": "sports", "source": "sports", "enabled": False},
            {"id": "monthly", "source": "monthly", "manualOverride": True, "title": "직접 수정"}]
        result = synchronize(self.data, feed([self.monthly, self.sports]))
        offers = result["giftStep"]["offers"]
        self.assertEqual([o["id"] for o in offers], ["mine", "sports", "monthly"])
        self.assertFalse(offers[1]["enabled"])
        self.assertEqual(offers[1]["validUntil"], "2026-10-11")
        self.assertEqual(offers[2]["title"], "직접 수정")
        self.assertEqual(synchronize(result, feed([self.monthly]))["giftStep"]["offers"], offers)

    def test_deleted_coupons_are_not_recreated(self):
        self.data["giftStep"]["offers"] = []
        self.assertEqual(synchronize(self.data, feed([self.monthly, self.sports]))["giftStep"]["offers"], [])

    def test_disabled_collection_preserves_everything_without_requiring_feed(self):
        self.data["settings"] = {"autoCoupons": False}
        self.assertEqual(synchronize(self.data, {}), self.data)

    def test_manual_request_bypasses_global_switch_but_keeps_manual_coupon(self):
        self.data['settings'] = {'autoCoupons': False}
        self.data['giftStep']['offers'] = [
            {'id':'auto', 'source':'monthly'},
            {'id':'protected', 'source':'sports', 'manualOverride':True, 'title':'직접 관리'}]
        with patch.dict(os.environ, {'GITHUB_EVENT_NAME':'workflow_dispatch','FORCE_REFRESH':'true'}):
            result = synchronize(self.data, feed([self.monthly,self.sports]))
        self.assertEqual(result['giftStep']['offers'][0]['title'],self.monthly['title'])
        self.assertEqual(result['giftStep']['offers'][1]['title'],'직접 관리')

    def test_bad_or_ambiguous_candidates_do_not_mutate_data(self):
        before = copy.deepcopy(self.data)
        bad = copy.deepcopy(self.monthly)
        bad["button"]["link_to"] = "javascript:alert(1)"
        for cards in ([self.monthly, self.monthly], [self.monthly, self.sports, self.sports],
                      [bad], [card("[10월] 10만원 구매 시 쿠폰 증정", "알 수 없는 기간")], []):
            with self.subTest(cards=cards), self.assertRaises(ValueError):
                synchronize(self.data, feed(cards))
        self.assertEqual(self.data, before)

    def test_year_rollover_and_month_validation(self):
        self.assertEqual(parse_period("", "2026.12.25 ~ 1.5", date(2026, 12, 20)),
                         ("2026-12-25", "2027-01-05"))
        self.assertEqual(parse_period("[1월]", "1.1 ~ 1.31", date(2026, 12, 20)),
                         ("2027-01-01", "2027-01-31"))
        with self.assertRaises(ValueError):
            parse_period("[11월]", "2026.10.1 ~ 2026.10.31", date(2026, 10, 10))

    def test_newest_public_post_ignores_pinned_order(self):
        source = feed([self.monthly])
        older = {**source["items"][0], "id": 1, "published_at": 1, "pinned": True, "media": []}
        source["items"].insert(0, older)
        self.assertEqual(synchronize(self.data, source)["giftStep"]["couponSource"]["postId"], 123)


if __name__ == "__main__":
    unittest.main()
