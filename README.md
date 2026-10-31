# 사주로 보는 다이에이 선수와 궁합 찾기 ⚾

생년월일(과 태어난 시각)로 사주를 풀어, 『다이아몬드 에이스(ダイヤのA)』 선수·감독 20명 중 **나와 닮은 선수**를 찾고 선수들의 **공식 생일 사주**로 궁합을 풀어 주는 비공식 팬 테스트예요. 한국어 · 日本語 · English를 지원해요.

## 기능
- **닮은 선수 매칭**: 일간(日干) 10개마다 신강형·신약형 선수 1명씩, 십성 비중과 신강·신약으로 최종 결정
- **생일 사주**: 선수 공식 생일(연·월·일주)로 계산한 실제 사주와 성격 타입 비교
- **궁합 풀이**: 일간 합·충·생극, 오행 보완, 일지·띠(년지) 합·충, 서로의 십성 — 점수 막대에서 선수를 누르면 풀이가 바뀜
- **다국어**: `#ko` `#ja` `#en` 해시로 언어 고정 링크 공유 가능
- **결과 카드 공유**: "내 결과 링크 복사" → 받은 사람에게 친구 결과 카드 + 나도 해 보기 + 친구와의 궁합. 링크에는 생년월일 없이 결과만 담김 (`?r=선수.일간.신강약.닮음%.찰떡배터리.점수[.다음 닮은 선수.% ×3]&c=궁합TOP3(선수.점수 ×3)`)

## 구조
```
index.html            마크업 + 메타 태그(OG/트위터 카드)
css/style.css         스타일 (라이트/다크)
js/config.js          ⚙️ 분석 도구 ID, 배포 주소
js/analytics.js       Clarity/GA4 로더 + track() 이벤트 래퍼
js/saju-engine.js     만세력(절기: 태양 황경), 십성, 신강약 계산
js/characters.js      선수 20명 데이터 (성격 일간·십성 가중치·공식 생일)
js/chemistry-ko.js    작중 관계 기반 궁합 설명 (1부 핵심)
js/compat.js          궁합 점수·풀이 계산, 추가 관계 설명
js/i18n-{ko,ja,en}.js 언어 팩
js/app.js             렌더링, 언어 전환, 공유, 이벤트
assets/og.png         공유 카드 이미지 (1200×630)
```
빌드 도구 없이 정적 파일만으로 동작해요. 로컬 확인: `python3 -m http.server` 후 `http://localhost:8000`

## 배포
**Vercel (추천)**: vercel.com → Add New Project → 이 저장소 Import → Framework `Other` 그대로 Deploy. 이후 `main`에 push하면 자동 배포.
**GitHub Pages**: Settings → Pages → Branch `main` / `/ (root)`.

배포 주소가 정해지면:
1. `index.html`의 `og:url`, `og:image`, `twitter:image`를 **절대 주소**로 바꾸기 (예: `https://daiya-saju.vercel.app/assets/og.png`) — X 카드 미리보기는 상대 경로를 못 읽어요.
2. `js/config.js`의 `siteUrl`에 같은 주소 넣기.

## 분석 (UX 테스트)
`js/config.js`에 ID를 넣으면 켜지고, 비워 두면 아무 스크립트도 불러오지 않아요.
- `clarityId` — Microsoft Clarity: 히트맵, 세션 녹화, 레이지/데드 클릭
- `ga4Id` — Google Analytics 4: 이벤트·퍼널

| 이벤트 | 언제 | 파라미터 |
|---|---|---|
| `submit_birth` | "플레이 볼" 제출 | `has_time`, `lang`, `from_share` |
| `result_shown` | 결과 표시(예시·언어 전환 제외) | `char`, `day_stem`(0~9), `strength`, `has_time`, `lang` |
| `compat_view` | 궁합 풀이가 화면에 40% 이상 보임 | `lang` |
| `compat_pick` | 점수 막대에서 다른 선수 선택 | `char`, `lang` |
| `lang_change` | 언어 전환 | `lang` |
| `dex_open` | 생일 사주 도감 펼침 | `lang` |
| `intro_toggle` | 사주 설명(일/영) 열고 닫음 | `open`, `lang` |
| `share_click` | "내 결과 링크 복사" | `channel`, `char`, `lang` |
| `shared_link_open` | 친구가 보낸 결과 링크로 방문 | `char`, `lang` |
| `friend_try_click` | 친구 카드의 "나도 해 보기" | `lang` |

추천 퍼널: `page_view → submit_birth → result_shown → compat_view → compat_pick → share_click`

> 🔒 **개인정보**: 생년월일·시각은 어떤 분석 도구로도 보내지 않아요. Clarity는 입력 필드를 기본으로 가리지만, 대시보드의 Masking 설정이 `Balanced` 이상인지 확인하세요. `localhost`에서는 이벤트가 콘솔에 `[track]`으로 찍혀요.

## 데이터 출처
- 이름 표기·선수 설명: 나무위키 다이아몬드 에이스 문서 (일본어는 원어, 영어는 나무위키 로마자 순서)
- 생일: 공식 프로필 월·일. 출생 연도는 공식 발표(사와무라·후루야 1990년)와 픽시브 백과사전(크리스·카와카미·메이·라이치·하루이치 등)을 기준으로, 나머지는 작중 학년과 일본 학제(1/1~4/1생은 앞 학년)로 추정. 카타오카 감독은 연도 미상이라 성격 일간으로만 계산
- 원작: 『ダイヤのA』 寺嶋裕二 / 講談社

재미로 보는 비공식 팬 메이드이며, 원작자·출판사·애니메이션 제작사와 관련이 없어요. 캐릭터 이미지는 사용하지 않아요.
