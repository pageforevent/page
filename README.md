# EVENT GUIDE

부산 명소 10곳을 픽셀아트로 표현하는 사은 행사 안내 페이지입니다.

## 파일 구성

- index.html, script.js: 안내 페이지와 장소 갤러리
- landmark-art.js, landmark-art.css: 코드 기반 픽셀 풍경과 애니메이션
- environment.js, environment.css: 부산 부전동 기준 시간·계절·날씨
- style.css, concept.css: 화면 배치와 픽셀 UI
- data.json: 행사와 쿠폰 정보
- site-config.js: 공통 설정, 노출 상태, 동시 편집 병합 규칙
- admin-controls.js: 관리자 탭, 쿠폰 목록, 설정과 저장 전 미리보기
- weather.json: 자동 수집된 공개 날씨 자료
- scripts/: 쿠폰·날씨 수집
- tests/: 수집 및 화면 로직 검증
- pixel-preview.html, pixel-season-preview.html: 디자인 비교 화면

## 자동 갱신과 배포

콘텐츠 수동 편집은 `admin.html`의 자체 관리자에서 진행합니다. Pages CMS 설정(`.pages.yml`)은 제거했습니다. 기존 Pages CMS의 GitHub 앱 접근 권한은 GitHub 계정/조직 설정에서 별도로 해제해야 합니다.

관리자는 쿠폰 관리 / 안내 내용 / 화면·운영 설정의 세 탭을 제공합니다. 카드별 사용 여부와 순서, 쿠폰 추가·삭제·순서·기간·사용 여부, 기본 명소, 랜덤·갤러리·인트로·모션·날씨·계절 효과, 행사 일시 중지 안내를 설정할 수 있습니다. 꺼지거나 만료된 항목도 관리자에서 편집할 수 있습니다.

쿠폰은 `giftStep.offers` 목록에 저장합니다. 이전 `primaryOffer`/`secondaryOffer` 형식도 읽을 수 있으며 관리자가 저장할 때 목록으로 변환합니다. 수동 수정은 해당 쿠폰의 수동 수정 보호가 켜져 자동 수집에서 보호됩니다. 자동 수집 연결은 월별/스포츠별 하나씩 지정할 수 있고, 삭제한 쿠폰을 수집기가 재생성하지 않습니다.

미리보기는 저장하지 않은 데이터를 같은 출처 iframe에 전달하므로 실제 사이트를 수정하지 않습니다. 초안 내려받기는 JSON을 저장합니다. 저장 시 최신 파일을 읽어 서로 다른 항목의 변경은 병합하고, 같은 항목의 충돌은 저장을 중단하며 입력을 유지합니다. 입력 중 페이지를 닫으면 브라우저가 확인을 표시합니다.

.github/workflows/sync-coupons.yml이 매일 서울 시간 09:30·10:00·10:30·11:00에 쿠폰·날씨를 갱신합니다. 예약 작업이 지연되어 11:00분을 넘기면 수집과 데이터 저장을 건너뜁니다. main의 사이트 파일 변경 및 수동 실행에서도 GitHub Pages를 배포합니다. 모든 사이트 JavaScript·CSS와 미리보기 파일을 배포 산출물에 포함합니다.

날씨 수집에는 저장소 Actions Secret KMA_SERVICE_KEY가 필요합니다. API 키를 코드나 공개 파일에 넣지 마세요.

상세 설정: [COUPON_SYNC.md](COUPON_SYNC.md), [SCENE_ENVIRONMENT.md](SCENE_ENVIRONMENT.md). 최적화 기록: [PIXEL_PERFORMANCE.md](PIXEL_PERFORMANCE.md).

## 검증

```sh
python -m unittest discover -s tests
node tests/test_coupon_visibility.cjs
node tests/test_admin.cjs
node tests/test_environment.cjs
```

로컬 미리보기는 python -m http.server로 열 수 있습니다. 배포에 필요 없는 design-preview, __pycache__, .pyc, _site, 로컬 비교 체크아웃은 .gitignore로 제외합니다.

## 갱신 요청, 쿠폰 구분과 하단 이미지

쿠폰 관리의 `지금 갱신 요청`은 GitHub workflow_dispatch를 호출합니다. 먼저 변경사항을 저장해야 합니다. 예약 수집을 꺼도 이 수동 요청은 연결된 자동 쿠폰·날씨를 갱신하며, 수동 관리 쿠폰은 유지합니다. 요청 접수는 완료를 뜻하지 않으며 실행 상태 링크에서 확인한 후 최신 내용을 불러옵니다. 세분화 토큰에는 Contents 쓰기와 Actions 쓰기가 필요합니다.

쿠폰 목록의 전체 / 자동 갱신 / 수동 관리 필터로 각각 관리합니다. 자동 쿠폰은 월별·스포츠 수집 연결과 수정 보호 해제 상태이고, 내용을 수정하면 보호가 켜져 수동 관리로 분류됩니다. 자동 갱신 필터의 추가 버튼은 비어 있는 수집 연결을 추가합니다. 손잡이 드래그는 PC와 터치 화면에서 동작하며, 키보드 위·아래 방향키와 기존 순서 버튼도 사용할 수 있습니다. 저장된 전체 목록 순서가 방문자 화면에 적용됩니다.

안내 내용의 `하단 이미지·연결 링크`에서 이미지 섹션을 켜고 끕니다. 이미지 주소는 http/https 또는 media/ 경로를 사용하며, 링크는 선택 사항입니다. 꺼도 이미지·링크·설명은 보존됩니다. 이미지를 직접 업로드하는 기능은 포함하지 않습니다.
