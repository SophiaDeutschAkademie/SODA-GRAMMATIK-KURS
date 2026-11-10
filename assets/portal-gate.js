/* SODA GRAMMATIK KURS · 학습 포탈 로그인 확인
   - 모든 페이지의 <head> 맨 앞에서 불러옵니다. 학습 포탈(SODA-LERNPORTAL)에 로그인한 학생만 페이지를 볼 수 있습니다.
   - 포탈 로그인은 같은 사이트(sophiadeutschakademie.github.io)의 localStorage 'soda-portal:session'에 남습니다.
     여기서는 그 안의 학생 파일 키로 포탈의 학생 파일(data/{sid}.bin)이 실제로 열리는지 확인합니다.
     같은 로그인에서 한 번 확인하면 기억해 두고(soda-portal:gate) 다음 페이지부터는 다시 내려받지 않습니다.
   - 로그인이 없거나 확인에 실패하면 포탈 로그인 화면으로 보내고, 로그인한 뒤 원래 페이지로 돌아옵니다.
   - 확인하는 동안에는 화면을 가립니다. 인터넷이 끊겨 확인할 수 없을 때는 이미 로그인한 학생이 공부를 이어 가도록 화면을 엽니다.
   - 학생이 페이지에 저장한 답안(localStorage)은 건드리지 않습니다.
   - 내려받은 파일(file://)로 열 때는 확인하지 않습니다. */
(function () {
  'use strict';
  if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
  var PORTAL = '/SODA-LERNPORTAL/', SKEY = 'soda-portal:session', GKEY = 'soda-portal:gate';
  var root = document.documentElement;
  var hide = document.createElement('style');
  hide.textContent = 'html{visibility:hidden!important}';
  (document.head || root).appendChild(hide);
  function show() { if (hide.parentNode) hide.parentNode.removeChild(hide); }
  function go(relogin) {
    var back = location.pathname + location.search + location.hash;
    location.replace(PORTAL + '?next=' + encodeURIComponent(back) + (relogin ? '&relogin=1' : ''));
  }
  var s = null;
  try { s = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== 1 || !s.sid || !s.k || !(s.exp > Date.now())) { go(false); return; }
  var tag = s.sid + '|' + s.at + '|' + String(s.k).slice(0, 12);
  var ok = null;
  try { ok = localStorage.getItem(GKEY); } catch (e) { ok = null; }
  if (ok === tag) { show(); return; }
  var subtle = window.crypto && window.crypto.subtle;
  if (!subtle || !window.fetch) { show(); return; }
  var key;
  try {
    var bin = atob(s.k), kb = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) kb[i] = bin.charCodeAt(i);
    key = kb;
  } catch (e) { go(true); return; }
  fetch(PORTAL + 'data/' + s.sid + '.bin', { cache: 'no-store' }).then(function (r) {
    if (r.status === 404) throw { gate: 'nofile' };
    if (!r.ok) throw { gate: 'net' };
    return r.arrayBuffer();
  }).then(function (buf) {
    var b = new Uint8Array(buf);
    return subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['decrypt']).then(function (k) {
      return subtle.decrypt({ name: 'AES-GCM', iv: b.slice(16, 28), additionalData: new TextEncoder().encode(s.sid) }, k, b.slice(28));
    });
  }).then(function () {
    try { localStorage.setItem(GKEY, tag); } catch (e) {}
    show();
  }).catch(function (e) {
    if (e && (e.gate === 'net' || e.name === 'TypeError')) { show(); return; }
    go(true);
  });
})();
