/* SODA GRAMMATIK 교재(lektionen/lektion-NN.html)의 확인 문제(.qi) 답 저장
 *
 * - 선지를 누르면 고른 선지를 이 브라우저의 localStorage 'soda-gk-quiz:NN'에 저장하고, 다시 열면 같은 선지를 눌러 되살립니다.
 * - 문제마다 문제 글(.qq)로 정한 이름 아래에 저장하므로, 문제를 빼거나 순서를 바꿔도 남은 문제의 답은 그대로 이어집니다.
 * - 한 번 더 눌러 답을 지우면(교재의 원래 동작) 저장한 답도 지웁니다.
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
})();
