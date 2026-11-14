# SODA GRAMMATIK KURS

Sophia Deutsch Akademie의 독일어 문법 학습 웹앱입니다. 표지, 목차, Lektion 01–16의 교재, 연습문제(Übung), 복습(Wiederholung), 과제(Hausaufgabe)로 구성돼요.

목차에서 Lektion을 누르면 교재, 연습문제, 복습, 과제 중 하나를 고르는 페이지(`lektion.html?n=01`)가 열려요.

## 학습 포탈 로그인

이 앱은 소피아 독일어학원 수강생 전용입니다. 모든 페이지가 `<head>` 맨 앞에서 `assets/portal-gate.js`를 불러와, 학습 포탈(SODA-LERNPORTAL)에 로그인했는지 확인합니다.

- 로그인하지 않았으면 학습 포탈 로그인 화면으로 가고, 로그인하면 보던 페이지로 돌아옵니다.
- 한 번의 로그인에서 처음 한 번만 포탈의 학생 파일로 로그인을 확인하고, 그다음 페이지부터는 바로 열립니다.
- 학생이 저장한 답안(localStorage)은 건드리지 않습니다.
- 새 페이지를 추가할 때는 `<head>` 바로 뒤에 `<script src="(상대 경로)assets/portal-gate.js"></script>`를 넣어야 합니다.
- 저장소가 공개라서 파일 자체는 주소를 알면 받을 수 있습니다. 이 확인은 화면에서 막는 장치입니다.

## GitHub Pages로 배포하기

1. Settings → Pages에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 지정하고 Save를 누릅니다.
2. 1~2분 뒤 `https://<계정명>.github.io/<저장소명>/` 주소로 접속됩니다.

`.nojekyll` 파일은 숨김 파일이라 폴더에서 안 보일 수 있어요. 웹에서 올릴 때 빠지지 않았는지 확인하세요.

## 구조

- `index.html` : 표지와 목차 (한 페이지 안에서 전환, 주소 끝에 `#toc`)
- `lektion.html` : Lektion 선택 페이지 (교재 / 연습문제 / 복습 / 과제). 주소 끝에 `?n=01`처럼 번호를 붙여요.
- `lektionen/lektion-01.html … lektion-16.html` : 교재
- `hausaufgaben/lektionen/lektion-01.html … lektion-16.html` : 과제
- `uebungen/lektionen/lektion-01.html … lektion-16.html` : 연습문제 (이전 SODA-GRAMMATIK-UEBUNGEN 저장소에서 옮겨 온 것, 로고와 글꼴은 `assets/`를 함께 써요)
- `wiederholung/lektionen/lektion-01.html … lektion-16.html` : 복습(나레이션 애니메이션)
- `wiederholung/assets/` : 복습 페이지용 글꼴, 이미지, 나레이션 음원 (이전 SODA-GRAMMATIK-WIEDERHOLUNG 저장소에서 옮겨 온 것)
- `hausaufgaben/assets/` : 과제 페이지용 글꼴, 오디오, 스크립트 (이전 SODA-GRAMMATIK-HAUSAUFGABEN 저장소에서 옮겨 온 것)
- `hausaufgaben/assets/wordtip.js` : 과제 페이지의 새 단어 뜻 팝업. 교재·연습문제에 나오지 않은 단어는 `<span class="wd" data-m="뜻">단어</span>` 로 감싸 두었고, 마우스를 올리면(터치 화면에서는 한 번 누르면) 뜻이 작게 나타나요. 밑줄이나 링크 표시는 없어요.
- `hausaufgaben/assets/hw-mobile.css` : 과제 페이지의 핸드폰 배치(화면 폭 640px 이하에서만 적용, 컴퓨터 화면과 인쇄는 그대로). 상단 막대를 한 줄로 줄이고, 말하기 표는 문장마다 위아래로 놓고, 열이 여섯 개 이상인 표는 표 안에서 옆으로 밀어 보게 해요. 컴퓨터에서도 '답안 백업' 버튼을 글씨 크기 버튼 위로 옮겨 서로 가리지 않게 했어요.
- `hausaufgaben/index.html` : 이전 과제 웹앱의 표지·목차(진행률 포함). 목차에서는 연결하지 않고 따로 보관해요.
- `anhang/grammatik-merkheft.html` : 부록 「독일어 문법 암기장」(Lektion 1–16 핵심 35항목, 가리기 모드·인쇄 지원). 목차 맨 끝 '부록' 카드로 연결돼요.
- `assets/theme.js` : 다크 모드 스위치(모든 화면 오른쪽 위). 선택은 기기에 저장되고 기본값은 다크 모드예요. 인쇄는 언제나 밝은 화면으로 나와요.
- `assets/theme-colors.css` : 교재·연습문제·복습·과제의 다크 모드 색상표(자동 생성). 각 페이지의 색은 `var(--k색상코드, 원래색)` 모양이라 라이트 모드는 원래와 똑같고, 사진·그림·로고는 원래 색 그대로예요.
- `assets/pager.js` : 교재를 핸드폰에서 책처럼 한 페이지씩 넘겨 보게 하는 스크립트. 아래 「교재 페이지 넘겨 보기」에 자세히 적었어요.
- `assets/lessons.js` : Lektion 목록(번호, 제목, 독일어 부제, 설명, 아이콘). 목차와 선택 페이지가 함께 써요.
- `assets/` : 로고, Pretendard 폰트 (인터넷 연결 없이도 동작)

## 교재 페이지 넘겨 보기

교재(`lektionen/lektion-01 … 16.html`)는 핸드폰에서 아래로 길게 밀지 않고 한 페이지씩 넘겨 봅니다. 연습문제·복습·과제·부록은 그대로 스크롤로 봅니다.

**지금 상태(2026-11-14): 시험 운영 중입니다(`assets/pager.js`의 `TRIAL = true`).** `?view=page` 주소로 한 번 연 기기에서만 켜지고, 다른 기기에서는 예전과 똑같이 보입니다. 이 절의 나머지는 모두에게 켠 뒤의 동작입니다. `TRIAL`을 `false`로 바꿀 때 이 문단을 지웁니다.

- 화면 폭이 820px 이하이고 높이가 440px 이상이면(핸드폰 세로, 작은 태블릿) 페이지 보기로 열립니다. 핸드폰을 가로로 눕혔을 때와 넓은 화면에서는 스크롤 보기로 열립니다.
- 넘기는 방법은 손가락으로 옆으로 밀기(종이가 손가락을 따라 접힙니다), 화면 좌우 가장자리 누르기, 아래 띠의 ‹ › 버튼, 키보드 ← →, 마우스 휠입니다.
- 아래 띠 가운데의 쪽수를 누르면 그 과의 차례가 열립니다. `Aa`를 누르면 글자 크기, 보기 방식(페이지/스크롤), 인쇄를 고릅니다. 스크롤 보기에서는 오른쪽 아래 책 모양 버튼으로 페이지 보기로 바꿉니다. 고른 보기 방식은 기기에 저장됩니다.
- 페이지는 화면 크기와 글자 크기에 맞춰 열 때마다 나눕니다. 문단은 줄 단위로, 표·그림·퀴즈는 덩어리 단위로 나눕니다. 퀴즈는 풀이가 펼쳐질 자리를 미리 비워 둡니다.
- 한 화면보다 큰 덩어리가 있는 페이지만 그 안에서 위아래로 밀어 봅니다(아래쪽에 화살표가 나타납니다).
- 보던 자리는 과마다 기기에 저장되고, 다시 열면 그 페이지부터 이어집니다. 끝까지 본 과는 처음부터 열립니다.
- 교재 HTML은 고치지 않습니다. 스크롤 보기로 돌아가거나 인쇄할 때는 원래 모양으로 되돌립니다.
- 기기에 저장하는 값(localStorage): `soda-gk-view`(보기 방식, `page` 또는 `scroll`), `soda-gk-pos:lektion-NN`(보던 자리), `soda-gk-pg-hint`(처음 안내를 보여 줬는지).
- 주소 끝에 `?view=page`, `?view=scroll`, `?view=auto`를 붙여 열면 그 기기의 보기 방식을 바꿉니다(예: `lektionen/lektion-01.html?view=scroll`). `auto`는 저장해 둔 선택을 지우고 화면 크기에 따라 정하게 합니다. 학생이 페이지 보기에서 문제를 겪을 때 `?view=scroll` 주소를 보내 주면 됩니다.
- 시험 운영: `assets/pager.js` 맨 위의 `var TRIAL`이 `true`이면, `?view=page` 주소로 한 번 연 기기에서만 켜지고 다른 기기에서는 아무 변화가 없습니다(그 기기에서 끌 때는 `?view=auto`). 모두에게 켤 때 `false`로 바꿉니다.

교재를 쓸 때 나누는 자리를 정하고 싶으면 요소에 아래 표시를 붙입니다.

- `data-pg-keep` : 절대 나누지 않음
- `data-pg-avoid` : 되도록 나누지 않음
- `data-pg-head` : 다음 덩어리와 같은 페이지에 둠(제목처럼)
- `data-pg-break` : 이 앞에서 새 페이지를 시작(`section`이나 그 바로 아래 덩어리에 붙입니다)
- `data-pg-fit` : 자리가 조금 모자라면 나누지 않고 살짝 줄여서 넣음(그림·표는 표시 없이도 그렇게 합니다)
- `data-pg-tap` : 이 요소를 누르는 것은 페이지 넘김으로 쓰지 않음(직접 만든 누르는 요소에)

## Lektion 추가·수정

새 Lektion을 추가하려면 `lektionen`, `hausaufgaben/lektionen`, `uebungen/lektionen`, `wiederholung/lektionen` 폴더에 파일을 넣고 `assets/lessons.js`의 목록에 항목(번호, 제목, 독일어 부제, 설명, 아이콘)을 추가하세요.

교재 파일(`lektionen/lektion-NN.html`)에는 `<head>`의 `theme.js` 다음 줄에 `<script src="../assets/pager.js"></script>`를 넣으세요. 이 줄이 없으면 그 과는 예전처럼 스크롤로만 보입니다.
