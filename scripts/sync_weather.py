"""Publish a credential-free Bujeon weather snapshot from KMA public data."""
import json
import math
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode, unquote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
KST = timezone(timedelta(hours=9))
API = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/"
LATITUDE, LONGITUDE = 35.1569988, 129.058582


def kma_grid(latitude, longitude):
    # KMA Lambert conformal conic projection, 5 km grid.
    rad = math.pi / 180
    re, slat1, slat2 = 6371.00877 / 5, 30 * rad, 60 * rad
    sn = math.log(math.cos(slat1) / math.cos(slat2)) / math.log(
        math.tan(math.pi / 4 + slat2 / 2) / math.tan(math.pi / 4 + slat1 / 2))
    sf = math.tan(math.pi / 4 + slat1 / 2) ** sn * math.cos(slat1) / sn
    ro = re * sf / math.tan(math.pi / 4 + 38 * rad / 2) ** sn
    ra = re * sf / math.tan(math.pi / 4 + latitude * rad / 2) ** sn
    theta = (longitude - 126) * rad * sn
    return math.floor(ra * math.sin(theta) + 43 + .5), math.floor(ro - ra * math.cos(theta) + 136 + .5)


def publication_times(now):
    observed = (now - timedelta(minutes=40)).replace(minute=0, second=0, microsecond=0)
    forecast = now - timedelta(minutes=45)
    if forecast.minute < 30:
        forecast -= timedelta(hours=1)
    return observed, forecast.replace(minute=30, second=0, microsecond=0)


def api_items(payload):
    response = payload.get("response", {})
    code = response.get("header", {}).get("resultCode")
    if code != "00":
        raise ValueError(f"기상청 응답 오류 (code={code})")
    items = response.get("body", {}).get("items", {}).get("item")
    if not isinstance(items, list) or not items:
        raise ValueError("기상청 자료 없음")
    return items


def request_items(method, base, key):
    nx, ny = kma_grid(LATITUDE, LONGITUDE)
    params = {"serviceKey": unquote(key), "pageNo": 1, "numOfRows": 1000,
              "dataType": "JSON", "base_date": base.strftime("%Y%m%d"),
              "base_time": base.strftime("%H%M"), "nx": nx, "ny": ny}
    with urlopen(API + method + "?" + urlencode(params), timeout=25) as response:
        return api_items(json.load(response))


def make_snapshot(observations, forecasts, observed, forecast_base, now):
    values = {item["category"]: item.get("obsrValue") for item in observations}
    temperature, wind, pty = float(values["T1H"]), float(values["WSD"]), int(values["PTY"])
    if not (-60 <= temperature <= 60 and 0 <= wind <= 100 and pty in (0, 1, 2, 3, 5, 6, 7)):
        raise ValueError("기상청 실황 값이 올바르지 않습니다.")
    times = sorted({item.get("fcstDate", "") + item.get("fcstTime", "") for item in forecasts})
    target = now.strftime("%Y%m%d%H") + "00"
    candidates = [time for time in times if time >= target]
    if not candidates:
        raise ValueError("현재 시각의 초단기예보 없음")
    forecast_time = candidates[0]
    valid = datetime.strptime(forecast_time, "%Y%m%d%H%M").replace(tzinfo=KST)
    if valid - now > timedelta(hours=1):
        raise ValueError("초단기예보가 현재 시각에서 너무 멉니다.")
    prediction = {item["category"]: item.get("fcstValue") for item in forecasts
                  if item.get("fcstDate", "") + item.get("fcstTime", "") == forecast_time}
    sky = int(prediction["SKY"])
    lightning = float(prediction.get("LGT", 0))
    if sky not in (1, 3, 4) or lightning < 0:
        raise ValueError("하늘 상태를 해석할 수 없습니다.")
    condition = {1: "rain", 5: "rain", 2: "sleet", 6: "sleet", 3: "snow", 7: "snow"}.get(pty)
    if condition == "rain" and lightning > 0:
        condition = "storm"
    condition = condition or {1: "clear", 3: "cloudy", 4: "overcast"}[sky]
    nx, ny = kma_grid(LATITUDE, LONGITUDE)
    return {"location": "부산 부전동", "timezone": "Asia/Seoul", "latitude": LATITUDE,
            "longitude": LONGITUDE, "grid": {"nx": nx, "ny": ny}, "source": "기상청",
            "status": "ready", "condition": condition, "temperature": temperature,
            "windSpeed": wind, "observedAt": observed.isoformat(),
            "forecastBase": forecast_base.isoformat(), "skyForecastAt": valid.isoformat()}


def main():
    key = os.environ.get("KMA_SERVICE_KEY", "").strip()
    if not key:
        print("::warning::KMA_SERVICE_KEY 미등록: 날씨 갱신은 건너뛰고 쿠폰/배포는 계속합니다.")
        return
    try:
        now = datetime.now(KST)
        observed, forecast_base = publication_times(now)
        observations = request_items("getUltraSrtNcst", observed, key)
        forecasts = request_items("getUltraSrtFcst", forecast_base, key)
        updated = make_snapshot(observations, forecasts, observed, forecast_base, now)
        destination = ROOT / "weather.json"
        previous = json.loads(destination.read_text(encoding="utf-8"))
        if updated == previous:
            print("부전동 날씨 변경 없음")
            return
        temporary = destination.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary.replace(destination)
        print(f"부전동 날씨 갱신: {updated['condition']} ({updated['observedAt']})")
    except Exception as error:
        # HTTP exceptions contain the query URL/API key: do not print their message.
        print(f"::error::기상청 날씨 갱신 실패 ({type(error).__name__}). 이전 파일을 유지합니다.")
        sys.exit(1)


if __name__ == "__main__":
    main()
