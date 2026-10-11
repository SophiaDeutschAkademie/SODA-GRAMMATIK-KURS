# SODA GRAMMATIK KURS

Sophia Deutsch Akademie의 독일어 문법 학습 웹앱입니다. 표지, 목차(나의 과제 진행률), Lektion 01–16으로 구성돼요.

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소를 만듭니다. (예: `soda-grammatik-kurs`)
2. 이 폴더 안의 파일 전체(`index.html`, `assets`, `lektionen`, `.nojekyll`)를 저장소 맨 위(루트)에 올립니다.
3. 저장소의 Settings → Pages에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 지정하고 Save를 누릅니다.
4. 1~2분 뒤 `https://<계정명>.github.io/<저장소명>/` 주소로 접속됩니다.

`.nojekyll` 파일은 숨김 파일이라 폴더에서 안 보일 수 있어요. 웹에서 올릴 때 빠지지 않았는지 확인하세요.

## 구조

- `index.html` : 표지와 목차 (한 페이지 안에서 전환, 주소 끝에 `#toc`)
- `lektionen/lektion-01.html … lektion-16.html` : 각 Lektion
- `assets/` : 로고, Pretendard 폰트 (인터넷 연결 없이도 동작)

## 진행률 기록

- 각 Lektion의 문제를 풀면 학생 기기의 브라우저(localStorage)에 자동으로 저장돼요.
- 같은 주소(도메인)에서 열어야 목차와 Lektion이 기록을 공유합니다.
- 다른 기기나 다른 브라우저로 옮겨 가면 기록은 따로 시작돼요.
- 목차 맨 아래 `진행 기록 초기화`로 지울 수 있어요.

## Lektion 추가·수정

새 Lektion을 추가하려면 `lektionen` 폴더에 파일을 넣고 `index.html`의 `LESSONS` 목록에 항목(번호, 제목, 독일어 부제, 설명, 문제 수, 아이콘)을 추가하세요.
