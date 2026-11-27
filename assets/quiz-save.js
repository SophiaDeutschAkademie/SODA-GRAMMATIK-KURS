/* SODA GRAMMATIK 교재(lektionen/lektion-NN.html)의 확인 문제(.qi) 답 저장
 *
 * - 선지를 누르면 고른 선지를 이 브라우저의 localStorage 'soda-gk-quiz:NN'에 저장하고, 다시 열면 같은 선지를 눌러 되살립니다.
 * - 문제마다 문제 글(.qq)로 정한 이름 아래에 저장하므로, 문제를 빼거나 순서를 바꿔도 남은 문제의 답은 그대로 이어집니다.
 * - 한 번 더 눌러 답을 지우면(교재의 원래 동작) 저장한 답도 지웁니다.
 * - 「답 초기화」: 스크롤 보기는 오른쪽 아래 버튼 줄(.fc), 페이지 보기는 Aa 창의 「답 초기화」 줄(pager.js가 window.SODA_QUIZ_RESET을 부름)에서
 *   이 과에서 고른 답을 한 번에 지웁니다(지우기 전에 한 번 묻습니다). 다른 과·연습문제·과제의 답은 건드리지 않습니다.
 * - 학습 포탈에 로그인한 학생은 학습 저장(SODA-LERNPORTAL/sync.js)이 이 값을 서버에 올려 다른 기기에서도 이어집니다.
 * - 각 과 페이지의 </body> 바로 앞, 교재의 문제 스크립트 뒤에서 불러옵니다(페이지 보기(pager.js)가 페이지를 나누기 전에 되살림).
 */
(function () {
  'use strict';
  var m = location.pathname.match(/\/lektionen\/lektion-(\d\d)\.html$/);
  if (!m) return;
  var KEY = 'soda-gk-quiz:' + m[1];
  var items = [].slice.call(document.querySelectorAll('.qi'));
  if (!items.length) return;
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  var seen = {};
  var ids = items.map(function (it) {
    var q = it.querySelector('.qq'), b = 'q' + hash(String(q ? q.textContent : it.textContent).replace(/\s+/g, ' ').trim());
    var n = seen[b] = (seen[b] || 0) + 1;
    return n > 1 ? b + '.' + n : b;
  });
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function store(o) { try { if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) {} }
  function picked(it) {
    if (!it.classList.contains('done')) return -1;
    var os = it.querySelectorAll('.qo'), i;
    for (i = 0; i < os.length; i++) if (os[i].classList.contains('wrong')) return i;
    for (i = 0; i < os.length; i++) if (os[i].getAttribute('data-c') === '1') return i;
    return -1;
  }
  var restoring = false;
  document.addEventListener('click', function (e) {
    if (restoring) return;
    var b = e.target && e.target.closest ? e.target.closest('.qo') : null;
    if (!b) return;
    setTimeout(function () {
      var it = b.closest('.qi'), i = items.indexOf(it);
      if (i < 0) return;
      var o = load(), k = picked(it);
      if (k < 0) delete o[ids[i]]; else o[ids[i]] = k;
      store(o);
    }, 0);
  });
  var saved = load();
  restoring = true;
  try {
    items.forEach(function (it, i) {
      var k = saved[ids[i]], b;
      if (typeof k !== 'number' || it.classList.contains('done')) return;
      b = it.querySelectorAll('.qo')[k];
      if (b) b.click();
    });
  } catch (e) {}
  restoring = false;

  /* 이 과의 답을 모두 지웁니다. 지운 답 개수를 돌려줍니다(취소하면 -1). */
  function resetAll() {
    var done = items.filter(function (it) { return it.classList.contains('done'); });
    if (!done.length) { try { alert('지울 답이 없어요.'); } catch (e) {} return 0; }
    var ok = true;
    try { ok = confirm('이 과에서 고른 답 ' + done.length + '개를 모두 지울까요?\n지운 답은 되돌릴 수 없어요.'); } catch (e) {}
    if (!ok) return -1;
    restoring = true;
    try { done.forEach(function (it) { var b = it.querySelector('.qo'); if (b) b.click(); }); } catch (e) {}
    restoring = false;
    store({});
    return done.length;
  }
  window.SODA_QUIZ_RESET = resetAll;

  /* 스크롤 보기: 오른쪽 아래 글자 크기·인쇄 버튼 줄에 「답 초기화」 */
  var fc = document.querySelector('.fc');
  if (fc && !document.getElementById('qreset')) {
    var rb = document.createElement('button');
    rb.type = 'button'; rb.id = 'qreset'; rb.className = 'fc-btn fc-reset';
    rb.title = '이 과에서 고른 답을 모두 지웁니다';
    rb.innerHTML = '<span style="font-size:15px">↺</span> 답 초기화';
    rb.style.cssText = 'width:auto;padding:0 12px;gap:4px;white-space:nowrap';
    rb.addEventListener('click', function () { resetAll(); });
    fc.insertBefore(rb, fc.firstChild);
  }
})();
