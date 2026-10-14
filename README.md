# EVENT GUIDE

부산 명소 10곳을 픽셀아트로 표현하는 사은 행사 안내 페이지입니다.

## 파일 구성

- index.html, script.js: 안내 페이지와 장소 갤러리
- landmark-art.js, landmark-art.css: 코드 기반 픽셀 풍경과 애니메이션
- environment.js, environment.css: 부산 부전동 기준 시간·계절·날씨
- style.css, concept.css: 화면 배치와 픽셀 UI
- data.json: 행사와 쿠폰 정보
- weather.json: 자동 수집된 공개 날씨 자료
- scripts/: 쿠폰·날씨 수집
- tests/: 수집 및 화면 로직 검증
- pixel-preview.html, pixel-season-preview.html: 디자인 비교 화면

## 자동 갱신과 배포

.github/workflows/sync-coupons.yml이 매시 7분과 37분에 쿠폰·날씨를 갱신합니다. main의 사이트 파일 변경 및 수동 실행에서도 GitHub Pages를 배포합니다. 모든 사이트 JavaScript·CSS와 미리보기 파일을 배포 산출물에 포함합니다.

날씨 수집에는 저장소 Actions Secret KMA_SERVICE_KEY가 필요합니다. API 키를 코드나 공개 파일에 넣지 마세요.

상세 설정: [COUPON_SYNC.md](COUPON_SYNC.md), [SCENE_ENVIRONMENT.md](SCENE_ENVIRONMENT.md). 최적화 기록: [PIXEL_PERFORMANCE.md](PIXEL_PERFORMANCE.md).

## 검증

```sh
python -m unittest discover -s tests
node tests/test_coupon_visibility.cjs
node tests/test_environment.cjs
```

로컬 미리보기는 python -m http.server로 열 수 있습니다. 배포에 필요 없는 design-preview, __pycache__, .pyc, _site, 로컬 비교 체크아웃은 .gitignore로 제외합니다.
