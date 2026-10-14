# 카카오 사은 쿠폰 자동 갱신

매시 7분·37분에 최신 공개 소식을 읽고, 변경이 있을 때만 `data.json`을 커밋하고 GitHub Pages에 배포합니다. 별도의 카카오 API 키나 관리자 토큰은 사용하지 않습니다.

## 최초 활성화

1. 변경 파일을 `pageforevent/page` 저장소의 `main` 브랜치에 반영합니다. 로컬 다운로드 폴더에만 있는 워크플로는 실행되지 않습니다.
2. GitHub 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
3. **Actions → Sync Kakao coupons and deploy → Run workflow**를 실행해 첫 갱신과 배포를 확인합니다. 이후에는 예약 실행됩니다.

`main`이 기본 브랜치여야 합니다. 브랜치 보호 정책이 봇의 커밋을 막는 경우 실행 로그에 실패가 표시됩니다. 기존 별도 Pages 배포 워크플로가 있다면 이 워크플로와 중복 배포하지 않도록 정리하세요.

## 쿠폰 선택과 표시

- 첫 카드를 우선 확인하되 `[N월]`, 구매, 쿠폰/상품권, 증정 문구가 있어야 합니다. 첫 카드가 다른 행사라면 전체 카드에서 유일한 월별 쿠폰을 찾습니다.
- 금액과 URL을 고정하지 않으므로 11월 또는 금액 변경에도 카드의 최신 내용을 반영합니다.
- 스포츠/아웃도어는 제목으로 찾습니다. 없으면 두 번째 혜택을 끕니다.
- 각 카드에서 제목, 설명, 버튼 URL, 시작일, 종료일을 저장합니다. 링크는 HTTPS 롯데 모바일 쿠폰 주소인지 검증합니다.
- 기간에 연도가 없으면 소식의 마지막 수정일을 기준으로 해석합니다. 오래된 쿠폰이 다음 해에 다시 유효해지는 것을 방지합니다.
- 방문자 화면은 한국 날짜로 시작 전/종료 후 혜택을 숨기며, 열린 페이지도 매분 표시 상태를 확인합니다. 두 혜택 모두 종료되면 안내 문구를 표시합니다.
- 후보 중복, 해석 불가능한 기간, 수집 실패는 파일을 변경하지 않고 실패로 기록합니다. 기존 데이터의 종료일 필터는 계속 적용됩니다.
- 관리자에서 수정한 사은 혜택의 문구/링크는 다음 자동 갱신에서 카카오 내용으로 덮어씁니다. 다른 단계의 내용은 유지합니다.

## 확인 명령

```sh
python -m unittest discover -s tests -p 'test_*.py'
node tests/test_coupon_visibility.cjs
python scripts/sync_kakao_coupons.py --dry-run
python scripts/sync_kakao_coupons.py
```

수집 경로는 카카오 채널 웹페이지 내부 JSON 경로입니다. 카카오가 구조를 바꾸면 수집기를 수정해야 합니다. GitHub 예약 실행은 지연될 수 있으며, 공개 저장소가 60일 동안 활동이 없으면 예약이 비활성화될 수 있습니다.

배포를 워크플로 안에서 직접 실행하는 이유는 `GITHUB_TOKEN`으로 만든 커밋만으로는 다음 Pages 빌드가 자동 시작되지 않기 때문입니다.

참고: [GitHub 예약 실행](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [GitHub Pages 워크플로](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
