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
- `assets/lessons.js` : Lektion 목록(번호, 제목, 독일어 부제, 설명, 아이콘). 목차와 선택 페이지가 함께 써요.
- `assets/` : 로고, Pretendard 폰트 (인터넷 연결 없이도 동작)

## Lektion 추가·수정

새 Lektion을 추가하려면 `lektionen`, `hausaufgaben/lektionen`, `uebungen/lektionen`, `wiederholung/lektionen` 폴더에 파일을 넣고 `assets/lessons.js`의 목록에 항목(번호, 제목, 독일어 부제, 설명, 아이콘)을 추가하세요.
