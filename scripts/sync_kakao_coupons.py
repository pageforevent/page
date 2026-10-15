"""Synchronize public Kakao channel cards without browser cookies or API keys."""
import argparse
import copy
import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
if __package__:
    from .refresh_policy import scheduled_collection_allowed, forced_refresh
else:
    from refresh_policy import scheduled_collection_allowed, forced_refresh

CHANNEL = "_xlZaqM"
FEED_URL = f"https://pf.kakao.com/rocket-web/web/profiles/{CHANNEL}/posts?includePinnedPost=false"
KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parents[1]


def normalize(text):
    return re.sub(r"\s+", " ", text or "").strip()


def is_monthly(card):
    title = normalize(card.get("title"))
    return bool(re.search(r"\[\s*\d{1,2}\s*월\s*\]", title)
                and "구매" in title and "증정" in title
                and ("쿠폰" in title or "상품권" in title))


def is_sports(card):
    return bool(re.search(r"스포츠\s*/\s*아웃도어", normalize(card.get("title"))))


def parse_period(title, description, reference):
    # Match both 2026.10.09~2026.10.11 and 10.1(목) - 10.31(토).
    token = r"(?:(20\d{2})\s*[.년/-]\s*)?(\d{1,2})\s*[.월/-]\s*(\d{1,2})(?:\s*일)?(?:\s*\([^)]*\))?"
    match = re.search(token + r"\s*(?:~|〜|～|–|—|-)\s*" + token, description)
    month_match = re.search(r"\[\s*(\d{1,2})\s*월\s*\]", title)
    if not match:
        raise ValueError(f"사용기간을 해석할 수 없습니다: {title}")
    y1, m1, d1, y2, m2, d2 = match.groups()
    m1, d1, m2, d2 = map(int, (m1, d1, m2, d2))
    if y1:
        year = int(y1)
    elif y2:
        year = int(y2) - (m2 < m1)
    else:
        # Anchor yearless dates to the source post's last edit, never to each run.
        # This prevents a stale October card becoming valid again next October.
        years = (reference.year - 1, reference.year, reference.year + 1)
        year = min(years, key=lambda y: abs((date(y, m1, d1) - reference).days))
    start = date(year, m1, d1)
    end = date(int(y2) if y2 else year + (m2 < m1), m2, d2)
    if end < start or (end - start).days > 62:
        raise ValueError(f"사용기간이 올바르지 않습니다: {title}")
    if month_match and int(month_match[1]) != start.month:
        raise ValueError(f"제목의 월과 사용기간이 다릅니다: {title}")
    return start.isoformat(), end.isoformat()


def extract_offer(card, reference, previous):
    title = normalize(card.get("title"))
    description = "\n".join(part.get("v", "") for part in card.get("contents", [])
                            if part.get("t") == "text").strip()
    button = card.get("button") or {}
    link = button.get("link_to", "")
    parsed = urlparse(link)
    if (button.get("link_type") != "url" or parsed.scheme != "https"
            or parsed.hostname != "m.lotteshopping.com"
            or not parsed.path.startswith("/cpn/gate/")
            or parsed.username or parsed.password):
        raise ValueError(f"롯데 쿠폰 링크가 아닙니다: {title}")
    start, end = parse_period(title, description, reference)
    return {**(previous or {}), "title": title, "description": description,
            "buttonText": "바로가기", "link": link, "validFrom": start, "validUntil": end}


def synchronize(data, feed):
    if data.get("settings", {}).get("autoCoupons") is False and not forced_refresh():
        return copy.deepcopy(data)
    posts = feed.get("items")
    if not isinstance(posts, list) or not posts:
        raise ValueError("채널 소식 목록이 비어 있거나 형식이 바뀌었습니다.")
    public_posts = [p for p in posts if isinstance(p, dict)
                    and p.get("status") == "published" and not p.get("is_private")]
    if not public_posts:
        raise ValueError("공개 소식을 찾지 못했습니다.")
    post = max(public_posts, key=lambda p: p.get("published_at", 0))
    cards = post.get("media")
    if not isinstance(cards, list) or not all(isinstance(c, dict) for c in cards):
        raise ValueError("최신 소식의 카드 형식이 바뀌었습니다.")
    monthly = [c for c in cards if is_monthly(c)]
    sports = [c for c in cards if is_sports(c)]
    if len(monthly) != 1 or len(sports) > 1:
        raise ValueError("쿠폰을 확실하게 구분하지 못했습니다. 기존 데이터를 유지합니다.")
    # The top card is preferred, but only after title/period/link validation.
    primary = cards[0] if cards and is_monthly(cards[0]) else monthly[0]
    reference_ms = post.get("updated_at") or post.get("published_at")
    if not isinstance(reference_ms, (int, float)) or not str(post.get("id", "")).isdigit():
        raise ValueError("소식 날짜 또는 ID가 올바르지 않습니다.")
    reference = datetime.fromtimestamp(reference_ms / 1000, KST).date()
    result = copy.deepcopy(data)
    gift = result["giftStep"]
    if isinstance(gift.get("offers"), list):
        # Only explicitly connected entries are updated. Deleted entries stay deleted.
        for index, offer in enumerate(gift["offers"]):
            if offer.get("manualOverride"):
                continue
            source = offer.get("source")
            card = primary if source == "monthly" else sports[0] if source == "sports" and sports else None
            if card:
                gift["offers"][index] = extract_offer(card, reference, offer)
    else:
        # Compatibility with deployed content before the list editor migration.
        if not gift.get("primaryOffer", {}).get("manualOverride"):
            gift["primaryOffer"] = extract_offer(primary, reference, gift.get("primaryOffer"))
        if sports and not gift.get("secondaryOffer", {}).get("manualOverride"):
            gift["secondaryOffer"] = extract_offer(sports[0], reference, gift.get("secondaryOffer"))
    # Missing/expired cards stay editable; only the public page filters by dates.
    gift.pop("showSecondOffer", None)
    gift["couponSource"] = {"channel": CHANNEL, "postId": post["id"],
                            "postUrl": f"https://pf.kakao.com/{CHANNEL}/{post['id']}",
                            "updatedAt": reference_ms}
    return result


def fetch_feed():
    request = Request(FEED_URL, headers={"Accept": "application/json",
                                       "User-Agent": "event-guide-coupon-sync/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--data", type=Path, default=ROOT / "data.json")
    args = parser.parse_args()
    data = json.loads(args.data.read_text(encoding="utf-8"))
    if not scheduled_collection_allowed():
        print("서울 시간 자동 갱신 시간 밖: 쿠폰 수집 건너뜀")
        return
    if data.get("settings", {}).get("autoCoupons") is False and not forced_refresh():
        print("관리자 설정: 쿠폰 자동 수집 꺼짐")
        return
    updated = synchronize(data, fetch_feed())
    if data == updated:
        print("쿠폰 변경 없음")
        return
    gift = updated["giftStep"]
    offers = gift.get("offers", [gift.get("primaryOffer"), gift.get("secondaryOffer")])
    for offer in offers:
        if offer:
            print(f"{offer.get('title', '')} ({offer.get('validFrom')} ~ {offer.get('validUntil')})")
    if args.dry_run:
        print("미리보기 완료: 파일을 변경하지 않았습니다.")
    else:
        if not scheduled_collection_allowed():
            print("자동 갱신 시간이 종료되어 쿠폰 변경을 저장하지 않습니다.")
            return
        # Only write after both cards have been validated successfully.
        temporary = args.data.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary.replace(args.data)
        print("data.json 갱신 완료")


if __name__ == "__main__":
    main()
