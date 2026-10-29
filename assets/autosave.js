/* SODA 답안 자동 저장 — 과제(hausaufgaben)·연습문제(uebungen) 공용
 *
 * 1. 연습문제: 입력·선택·카드 배열을 바꿀 때마다 자동 저장하고, 다시 열면 복원한다.
 * 2. 과제: 기존 저장(localStorage)을 그대로 두고, 같은 내용을 다른 저장소에도 복제해 둔다.
 *    localStorage가 비어 있으면 복제본에서 되살린다.
 * 3. 저장소 이중화: localStorage + sessionStorage + window.name + IndexedDB.
 * 4. 저장 코드: 화면 오른쪽 아래 「답안 백업」에서 복사하고, 붙여넣어 복원한다.
 * 5. Teams·카카오톡 같은 앱 안의 화면에서는 저장이 지워질 수 있다는 안내를 위에 띄운다.
 */
(function () {
  'use strict';
  if (window.__sodaAutosave) return;
  window.__sodaAutosave = 1;

  var m = location.pathname.match(/\/(hausaufgaben|uebungen)\/lektionen\/lektion-(\d\d)\.html/);
  var AREA = m ? m[1] : '';
  var LES = m ? m[2] : '';
  var TRACK = /^(uebung-lektion-\d\d-v\d+|soda-ueb-\d\d)$/;
  var PFX = 'SODABK:';
  var UKEY = LES ? 'soda-ueb-' + LES : '';
  var HRE = LES ? new RegExp('^uebung-lektion-' + LES + '-v(\\d+)$') : null;

  /* ───────── 저장소 ───────── */
  var SP = window.Storage && window.Storage.prototype;
  if (!SP) return;
  var nGet = SP.getItem, nSet = SP.setItem, nRem = SP.removeItem, nClr = SP.clear;
  var LS = null;
  try { LS = window.localStorage; } catch (e) { LS = null; }

  var M = {};            // 복제본(메모리)
  var dirty = {};        // 아직 IndexedDB에 쓰지 않은 키
  var missed = {};       // 앱이 읽으려 했지만 localStorage에 없던 키
  var lastHKey = '';     // 이 과 과제 페이지가 실제로 쓰는 키

  var unloading = false; // 페이지가 닫히는 중
  var frozen = false;    // 저장 코드 복원 직후 새로고침 전까지 쓰기 차단
  function track(k) { return typeof k === 'string' && TRACK.test(k); }
  function isEmptyVal(v) {
    if (v == null || v === '' || v === '{}') return true;
    try {
      var o = JSON.parse(v);
      if (o && typeof o === 'object' && !Array.isArray(o)) {
        return Object.keys(o).every(function (k) { var x = o[k]; return x == null || x === '' || (typeof x === 'object' && !Object.keys(x).length); });
      }
    } catch (e) {}
    return false;
  }
  function merge(o) {
    if (!o || typeof o !== 'object') return;
    for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k) && track(k) && typeof o[k] === 'string') M[k] = o[k]; }
  }
  try { if (window.name && window.name.indexOf(PFX) === 0) merge(JSON.parse(window.name.slice(PFX.length))); } catch (e) {}
  try { var ss = window.sessionStorage.getItem('sodabk'); if (ss) merge(JSON.parse(ss)); } catch (e) {}

  function persistSync() {
    var s = '';
    try { s = JSON.stringify(M); } catch (e) { return; }
    try { if (!window.name || window.name.indexOf(PFX) === 0) window.name = PFX + s; } catch (e) {}
    try { window.sessionStorage.setItem('sodabk', s); } catch (e) {}
  }

  /* IndexedDB */
  var dbp = null;
  function getDb() {
    if (dbp) return dbp;
    dbp = new Promise(function (res) {
      try {
        var r = window.indexedDB.open('sodabk', 1);
        r.onupgradeneeded = function () { try { r.result.createObjectStore('kv'); } catch (e) {} };
        r.onsuccess = function () { res(r.result); };
        r.onerror = r.onblocked = function () { res(null); };
      } catch (e) { res(null); }
    });
    return dbp;
  }
  function idbFlush() {
    var keys = Object.keys(dirty); dirty = {};
    if (!keys.length) return;
    getDb().then(function (db) {
      if (!db) return;
      try {
        var t = db.transaction('kv', 'readwrite'), st = t.objectStore('kv');
        keys.forEach(function (k) { if (M[k] == null) st.delete(k); else st.put(M[k], k); });
      } catch (e) {}
    });
  }
  function idbAll(cb) {
    getDb().then(function (db) {
      if (!db) return cb({});
      var out = {};
      try {
        var t = db.transaction('kv', 'readonly'), st = t.objectStore('kv'), q = st.openCursor();
        q.onsuccess = function () {
          var c = q.result;
          if (c) { out[c.key] = c.value; c.continue(); } else cb(out);
        };
        q.onerror = function () { cb(out); };
      } catch (e) { cb(out); }
    });
  }

  var ptimer = null;
  function flush() { clearTimeout(ptimer); ptimer = null; persistSync(); idbFlush(); }
  function record(k, v) {
    if (v == null) delete M[k]; else M[k] = v;
    dirty[k] = 1;
    if (!ptimer) ptimer = setTimeout(flush, 200);
  }

  /* 이미 localStorage에 있는 답안도 복제본에 반영 */
  if (LS) {
    try {
      for (var i = 0; i < LS.length; i++) {
        var k = LS.key(i);
        if (track(k)) { var v = nGet.call(LS, k); if (v != null && M[k] !== v) { M[k] = v; dirty[k] = 1; } }
      }
      if (Object.keys(dirty).length) ptimer = setTimeout(flush, 200);
    } catch (e) {}
  }

  /* localStorage를 감싸 모든 쓰기를 복제하고, 읽기가 비면 복제본으로 대신 답한다 */
  SP.setItem = function (k, v) {
    if (this === LS) {
      var s = String(k);
      if (track(s)) {
        if (frozen) return;
        /* 앱이 닫히면서 메모리의 빈 상태를 덮어쓰려는 경우: 저장된 답안을 지키기 위해 무시한다 */
        if (unloading && isEmptyVal(String(v)) && M[s] != null && !isEmptyVal(M[s])) return;
        if (HRE && HRE.test(s)) lastHKey = s;
        record(s, String(v));
      }
    }
    return nSet.apply(this, arguments);
  };
  SP.getItem = function (k) {
    var v = nGet.apply(this, arguments);
    if (this === LS) {
      var s = String(k);
      if (track(s)) {
        if (HRE && HRE.test(s)) lastHKey = s;
        if (v === null) {
          if (M[s] != null) { v = M[s]; try { nSet.call(LS, s, v); } catch (e) {} }
          else missed[s] = 1;
        }
      }
    }
    return v;
  };
  SP.removeItem = function (k) {
    if (this === LS && track(String(k))) {
      if (frozen || (unloading && M[String(k)] != null && !isEmptyVal(M[String(k)]))) return;
      record(String(k), null);
    }
    return nRem.apply(this, arguments);
  };
  SP.clear = function () {
    if (this === LS) { Object.keys(M).forEach(function (k) { record(k, null); }); }
    return nClr.apply(this, arguments);
  };

  function put(k, v) {
    if (LS) { try { LS.setItem(k, v); return; } catch (e) {} }
    record(k, v);
  }
  function get(k) {
    var v = null;
    if (LS) { try { v = nGet.call(LS, k); } catch (e) {} }
    return v != null ? v : (M[k] != null ? M[k] : null);
  }

  /* 앱보다 먼저 등록되어, 앱의 닫힘 처리보다 앞서 실행된다 */
  window.addEventListener('beforeunload', function () { unloading = true; });
  window.addEventListener('pagehide', function () { unloading = true; });
  window.addEventListener('pageshow', function () { unloading = false; });
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });

  /* IndexedDB에서 되살리기 (과제 페이지: localStorage가 비어 있었다면 한 번만 다시 불러온다) */
  var idbLoaded = false, onIdb = [];
  idbAll(function (map) {
    for (var k in map) { if (track(k) && M[k] == null && typeof map[k] === 'string') M[k] = map[k]; }
    idbLoaded = true;
    onIdb.forEach(function (f) { try { f(); } catch (e) {} });
    var need = false;
    Object.keys(missed).forEach(function (k) {
      if (/^uebung-lektion-/.test(k) && M[k] != null && lsRaw(k) === null) { try { nSet.call(LS, k, M[k]); need = true; } catch (e) {} }
    });
    if (need) {
      var flag = 'sodabk-r:' + location.pathname;
      try { if (window.sessionStorage.getItem(flag)) return; window.sessionStorage.setItem(flag, '1'); } catch (e) { return; }
      location.reload();
    }
  });
  function lsRaw(k) { try { return nGet.call(LS, k); } catch (e) { return null; } }

  if (!AREA) return; // 과제·연습문제의 각 과 페이지가 아니면 저장소 보호만 한다

  /* ───────── 연습문제 자동 저장 ───────── */
  function qa(s) { return [].slice.call(document.querySelectorAll(s)); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function cls(e) { return e.classList.contains('right') ? 1 : e.classList.contains('wrong') ? 2 : 0; }
  function sig() {
    var s = '';
    qa('.fin,.wa,.so').forEach(function (e) { s += (e.getAttribute('data-a') || '') + '\u0001'; });
    qa('.opt').forEach(function (e) { s += e.dataset.c === '1' ? '1' : '0'; });
    return hash(s);
  }
  function collect() {
    var st = { v: 1, sig: sig(), t: Date.now(), fin: [], wa: [], opt: [], so: [] };
    qa('.fin').forEach(function (e) { st.fin.push([e.value, cls(e)]); });
    qa('.wa').forEach(function (e) { st.wa.push([e.value, cls(e)]); });
    qa('.opt').forEach(function (e) { st.opt.push(e.classList.contains('correct') ? 1 : e.classList.contains('wrong') ? 2 : 0); });
    qa('.so').forEach(function (so) {
      var line = so.querySelector('.so-line'), mk = so.querySelector('.so-mk');
      var ids = line ? [].map.call(line.querySelectorAll('.chip'), function (c) { return +c.dataset.i; }) : [];
      st.so.push([ids, mk ? (mk.classList.contains('right') ? 1 : mk.classList.contains('wrong') ? 2 : 0) : 0]);
    });
    return st;
  }
  function restore(st) {
    if (!st || st.v !== 1 || st.sig !== sig()) return false;
    var fins = qa('.fin'), was = qa('.wa'), opts = qa('.opt'), sos = qa('.so');
    st.fin.forEach(function (p, i) { var e = fins[i]; if (!e) return; e.value = p[0]; if (p[1] && typeof window.checkFin === 'function') window.checkFin(e); });
    st.wa.forEach(function (p, i) { var e = was[i]; if (!e) return; e.value = p[0]; if (p[1] && typeof window.checkWa === 'function') window.checkWa(e); });
    st.opt.forEach(function (s, i) {
      var o = opts[i]; if (!o || !s) return;
      o.classList.add(s === 1 ? 'correct' : 'wrong');
      if (s === 1) { var qc = o.closest('.qc'), h = qc && qc.querySelector('.opt-hint'); if (h) h.classList.add('s'); }
    });
    st.so.forEach(function (p, i) {
      var so = sos[i]; if (!so || !p) return;
      var line = so.querySelector('.so-line');
      (p[0] || []).forEach(function (id) {
        var c = so.querySelector('.chip[data-i="' + id + '"]');
        if (c && c.parentElement !== line) c.click();
      });
      if (p[1]) { var b = so.querySelector('.so-chk'); if (b) b.click(); }
    });
    return true;
  }

  var restoring = true, touched = false, timer = null;
  function saveNow() {
    if (AREA !== 'uebungen' || restoring || !touched) return;
    try { put(UKEY, JSON.stringify(collect())); } catch (e) {}
  }
  function schedule() {
    if (AREA !== 'uebungen' || restoring) return;
    touched = true;
    clearTimeout(timer); timer = setTimeout(saveNow, 250);
  }
  function startUebungen() {
    var done = false;
    function tryRestore() {
      if (done) return;
      var raw = get(UKEY);
      if (!raw) return;
      var st = null; try { st = JSON.parse(raw); } catch (e) {}
      if (restore(st)) done = true;
    }
    restoring = true;
    tryRestore();
    if (!done && !idbLoaded) onIdb.push(function () { if (!touched) { restoring = true; tryRestore(); restoring = false; } });
    restoring = false;
    document.addEventListener('input', schedule, true);
    document.addEventListener('change', schedule, true);
    document.addEventListener('focusout', schedule, true);
    document.addEventListener('click', function () { setTimeout(schedule, 0); }, true);
    window.addEventListener('pagehide', saveNow);
    window.addEventListener('beforeunload', saveNow);
    document.addEventListener('visibilitychange', function () { if (document.hidden) saveNow(); });
  }

  /* ───────── 저장 코드와 안내 화면 ───────── */
  function activeKey() {
    if (AREA === 'uebungen') return UKEY;
    if (lastHKey) return lastHKey;
    var best = '', bv = -1;
    Object.keys(M).forEach(function (k) { var r = HRE && HRE.exec(k); if (r && +r[1] > bv) { bv = +r[1]; best = k; } });
    return best;
  }
  function b64enc(s) { return btoa(unescape(encodeURIComponent(s))); }
  function b64dec(s) { return decodeURIComponent(escape(atob(s))); }
  function makeCode() {
    if (AREA === 'uebungen' && touched) { try { saveNow(); } catch (e) {} }
    var k = activeKey(), v = k ? get(k) : null;
    if (!v) return '';
    var d = {}; d[k] = v;
    return 'SODA1:' + b64enc(JSON.stringify({ a: AREA, l: LES, d: d }));
  }
  function applyCode(txt) {
    txt = String(txt || '').replace(/\s+/g, '');
    if (txt.indexOf('SODA1:') !== 0) return '저장 코드가 아닙니다. SODA1: 로 시작하는 코드를 붙여넣어 주세요.';
    var o; try { o = JSON.parse(b64dec(txt.slice(6))); } catch (e) { return '코드를 읽을 수 없습니다. 복사할 때 일부가 빠지지 않았는지 확인해 주세요.'; }
    if (!o || o.a !== AREA || o.l !== LES || !o.d) return '이 과의 ' + (AREA === 'uebungen' ? '연습문제' : '과제') + ' 코드가 아닙니다.';
    var keys = Object.keys(o.d).filter(function (k) { return track(k) && typeof o.d[k] === 'string'; });
    if (!keys.length) return '복원할 답안이 없습니다.';
    var cur = activeKey();
    if (AREA === 'hausaufgaben' && cur && keys.some(function (k) { return k !== cur; })) {
      return '이 코드는 문제가 바뀌기 전 버전의 답안이라 지금 문제에는 맞지 않습니다.';
    }
    keys.forEach(function (k) { put(k, o.d[k]); });
    flush();
    frozen = true;
    setTimeout(function () { location.reload(); }, 400);
    return '복원했습니다. 화면을 다시 불러옵니다.';
  }

  function css() {
    var st = document.createElement('style');
    st.textContent =
      '.sdbk-btn{position:fixed;right:20px;bottom:28px;z-index:99;height:36px;padding:0 14px;border:1px solid var(--line,var(--kecece6,#ECECE6));border-radius:8px;background:var(--card,var(--kffffff,#fff));color:var(--mute,var(--k8a93a3,#8A93A3));font:600 13px/1 "Noto Sans KR",system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.06)}' +
      '.sdbk-btn:hover,.sdbk-btn:focus-visible{color:var(--ink,var(--k1a1a2e,#1A1A2E));border-color:var(--ink,var(--k1a1a2e,#1A1A2E));outline:none}' +
      '.sdbk-pn{position:fixed;right:20px;bottom:74px;z-index:100;width:min(380px,calc(100vw - 28px));max-height:calc(100vh - 100px);overflow:auto;padding:16px;border:1px solid var(--line,var(--kecece6,#ECECE6));border-radius:12px;background:var(--card,var(--kffffff,#fff));color:var(--ink,var(--k1a1a2e,#1A1A2E));font:14px/1.6 "Noto Sans KR",system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.16)}' +
      '.sdbk-pn[hidden]{display:none}' +
      '.sdbk-pn h4{margin:0 0 6px;font-size:15px;font-weight:700}' +
      '.sdbk-pn p{margin:0 0 10px;color:var(--mute,var(--k8a93a3,#8A93A3));font-size:13px;word-break:keep-all}' +
      '.sdbk-pn label{display:block;margin:12px 0 4px;font-size:12px;font-weight:700;letter-spacing:.3px}' +
      '.sdbk-pn textarea{width:100%;box-sizing:border-box;height:78px;padding:8px;border:1px solid var(--line,var(--kecece6,#ECECE6));border-radius:8px;background:transparent;color:inherit;font:12px/1.4 ui-monospace,Menlo,monospace;resize:vertical}' +
      '.sdbk-pn button{height:34px;margin:6px 6px 0 0;padding:0 14px;border:1px solid var(--ink,var(--k1a1a2e,#1A1A2E));border-radius:8px;background:var(--ink,var(--k1a1a2e,#1A1A2E));color:var(--card,var(--kffffff,#fff));font:600 13px/1 "Noto Sans KR",system-ui,sans-serif;cursor:pointer}' +
      '.sdbk-pn button.sub{background:transparent;color:inherit}' +
      '.sdbk-st{min-height:20px;margin-top:8px;font-size:13px}' +
      '.sdbk-bn{position:relative;display:flex;gap:10px;align-items:flex-start;padding:10px 84px 10px 14px;background:var(--ink,var(--k1a1a2e,#1A1A2E));color:var(--card,var(--kffffff,#fff));font:13px/1.5 "Noto Sans KR",system-ui,sans-serif;word-break:keep-all}' +
      '.sdbk-bn span{flex:1}.sdbk-bn button{flex:none;border:0;background:transparent;color:inherit;font:700 16px/1 system-ui;cursor:pointer;padding:2px 6px}' +
      '@media(max-width:640px){.sdbk-btn{right:14px;bottom:20px}.sdbk-pn{right:14px;bottom:64px}}' +
      '@media print{.sdbk-btn,.sdbk-pn,.sdbk-bn{display:none!important}}';
    document.head.appendChild(st);
  }
  function el(tag, props, kids) {
    var e = document.createElement(tag);
    for (var k in props) { if (k === 'text') e.textContent = props[k]; else e.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function ui() {
    css();
    var kind = AREA === 'uebungen' ? '연습문제' : '과제';
    var btn = el('button', { type: 'button', 'class': 'sdbk-btn', 'data-no-print': '', text: '답안 백업' });
    var out = el('textarea', { readonly: '', 'aria-label': '저장 코드', spellcheck: 'false' });
    var inp = el('textarea', { 'aria-label': '저장 코드 붙여넣기', spellcheck: 'false', placeholder: 'SODA1: 로 시작하는 코드를 붙여넣으세요' });
    var stat = el('div', { 'class': 'sdbk-st', role: 'status' });
    var copy = el('button', { type: 'button', text: '코드 복사' });
    var rest = el('button', { type: 'button', 'class': 'sub', text: '이 코드로 복원' });
    var pn = el('div', { 'class': 'sdbk-pn', hidden: '', 'data-no-print': '' }, [
      el('h4', { text: '답안 백업' }),
      el('p', { text: kind + ' 답안은 입력할 때마다 이 브라우저에 자동 저장됩니다. Teams·카카오톡 같은 앱 안에서 열었다면 저장이 지워질 수 있으니, 아래 코드를 복사해 메모 앱에 보관해 두세요.' }),
      el('label', { text: '저장 코드 (이 과의 ' + kind + ')' }), out, copy,
      el('label', { text: '저장 코드로 복원' }), inp, rest, stat
    ]);
    btn.addEventListener('click', function () {
      if (!pn.hidden) { pn.hidden = true; return; }
      var c = makeCode(); out.value = c;
      stat.textContent = c ? '' : '아직 저장된 답안이 없습니다.';
      pn.hidden = false;
    });
    copy.addEventListener('click', function () {
      var c = out.value; if (!c) { stat.textContent = '복사할 답안이 없습니다.'; return; }
      function fallback() { try { out.focus(); out.select(); document.execCommand('copy'); stat.textContent = '복사했습니다.'; } catch (e) { stat.textContent = '코드를 길게 눌러 직접 복사해 주세요.'; } }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c).then(function () { stat.textContent = '복사했습니다.'; }, fallback); else fallback();
    });
    rest.addEventListener('click', function () { stat.textContent = applyCode(inp.value); });
    document.body.appendChild(btn); document.body.appendChild(pn);

    var ua = navigator.userAgent || '';
    var inApp = /Teams|MicrosoftTeams|KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|; wv\)/i.test(ua) ||
      (/(iPhone|iPad|iPod)/.test(ua) && /AppleWebKit/.test(ua) && !/Safari\//.test(ua));
    var dismissed = false; try { dismissed = !!window.sessionStorage.getItem('sodabk-bn'); } catch (e) {}
    if (inApp && !dismissed) {
      var x = el('button', { type: 'button', 'aria-label': '닫기', text: '×' });
      var bn = el('div', { 'class': 'sdbk-bn', 'data-no-print': '', role: 'note' }, [
        el('span', { text: '앱 안의 화면에서는 답안이 지워질 수 있습니다. 크롬이나 사파리 같은 브라우저로 열어 주세요. 그럴 수 없다면 오른쪽 아래 「답안 백업」에서 저장 코드를 보관해 두세요.' }), x]);
      x.addEventListener('click', function () { bn.remove(); try { window.sessionStorage.setItem('sodabk-bn', '1'); } catch (e) {} });
      document.body.insertBefore(bn, document.body.firstChild);
    }
  }

  function boot() {
    if (AREA === 'uebungen') startUebungen();
    ui();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
