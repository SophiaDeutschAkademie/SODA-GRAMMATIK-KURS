# SODA GRAMMATIK KURS

Sophia Deutsch Akademie의 독일어 문법 학습 웹앱입니다. 표지, 목차, Lektion 01–16의 교재, 연습문제(Übung), 복습(Wiederholung), 과제(Hausaufgabe)로 구성돼요.

목차에서 Lektion을 누르면 교재, 연습문제, 복습, 과제 중 하나를 고르는 페이지(`lektion.html?n=01`)가 열려요.

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
- `hausaufgaben/index.html` : 이전 과제 웹앱의 표지·목차(진행률 포함). 목차에서는 연결하지 않고 따로 보관해요.
- `assets/lessons.js` : Lektion 목록(번호, 제목, 독일어 부제, 설명, 아이콘). 목차와 선택 페이지가 함께 써요.
- `assets/` : 로고, Pretendard 폰트 (인터넷 연결 없이도 동작)

## Lektion 추가·수정

새 Lektion을 추가하려면 `lektionen`, `hausaufgaben/lektionen`, `uebungen/lektionen`, `wiederholung/lektionen` 폴더에 파일을 넣고 `assets/lessons.js`의 목록에 항목(번호, 제목, 독일어 부제, 설명, 아이콘)을 추가하세요.
