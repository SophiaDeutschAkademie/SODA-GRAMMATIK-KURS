/* SODA GRAMMATIK KURS · 과제의 말하기 연습 카드
   - 과제(Hausaufgabe) 페이지 맨 아래, 「과제 제출하기」 위에 말하기 연습 카드를 넣습니다.
   - 말하기 사이트(SODA SPRECHEN)는 연습 기록을 같은 주소(github.io)의 localStorage에 저장합니다. 이 카드는 그 저장 상태를 보여 주고,
     과제 제출 때는 페이지의 buildText가 같은 기록을 답안에 함께 넣습니다. */
(function () {
  'use strict';
  var m = location.pathname.match(/lektion-(\d\d)\.html/);
  if (!m) return;
  var NO = m[1], EXAM = 'ueb-a1-' + NO;
  var LINK = 'https://sophiadeutschakademie.github.io/SODA-Lehrwerk/sprechen/#' + EXAM;
  function read() { try { return JSON.parse(localStorage.getItem('soda-sprechen:ueb:' + EXAM) || 'null'); } catch (e) { return null; } }
  function statusText(r) {
    return r ? '저장된 연습 기록: ' + r.attempts + '회' + (r.evaluated ? ' (평가 포함)' : '') + ' · 「과제 제출하기」를 누르면 함께 제출됩니다.' : '아직 저장된 연습 기록이 없습니다.';
  }
  function ensure() {
    var footer = document.querySelector('.footer');
    if (!footer || !footer.parentNode) return;
    var card = document.getElementById('sprechen-card');
    if (!card) {
      card = document.createElement('section');
      card.id = 'sprechen-card';
      card.setAttribute('style', 'margin:40px 0 0;padding:20px 22px;border:1px solid var(--line2);border-radius:14px;background:var(--bg);text-align:left');
      card.innerHTML =
        '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted);margin-bottom:6px">SPRECHEN · 말하기 연습</div>' +
        '<h3 style="margin:0 0 8px;font-size:20px;letter-spacing:-.01em">Lektion ' + NO + ' 말하기 연습 · 약 2분</h3>' +
        '<p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:var(--muted)">이 Lektion에서 배운 문법으로 말하기 에이전트와 2분 정도 대화합니다. 선생님께 받은 아이디와 비밀번호로 로그인하고, 마이크가 있는 기기에서 하십시오. Lektion마다 최대 2회 연습할 수 있으며, 추가 연습이 필요하면 선생님께 말씀해 주십시오.</p>' +
        '<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:var(--muted)">연습이 끝나면 이 과제로 돌아오십시오. 연습 기록과 평가 결과는 아래 「과제 제출하기」를 누를 때 답안과 함께 선생님께 제출됩니다. 말하기 사이트에서는 따로 보내지 않습니다.</p>' +
        '<p id="sprechen-status" style="margin:0 0 14px;font-size:15px;font-weight:700"></p>' +
        '<a class="btn go" href="' + LINK + '" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none">말하기 연습 열기</a>';
      footer.parentNode.insertBefore(card, footer);
    }
    var st = document.getElementById('sprechen-status');
    if (st) { var t = statusText(read()); if (st.textContent !== t) st.textContent = t; }
  }
  setInterval(ensure, 1000);
  window.addEventListener('focus', ensure);
  document.addEventListener('visibilitychange', ensure);
  ensure();
})();
