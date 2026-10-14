import copy
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

    def test_absent_sports_disables_second_offer(self):
        result = synchronize(self.data, feed([self.monthly]))
        self.assertFalse(result["giftStep"]["showSecondOffer"])

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
