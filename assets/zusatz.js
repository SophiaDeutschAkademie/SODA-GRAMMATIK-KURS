/* SODA GRAMMATIK KURS · 추가 연습(Zusatzübungen)
 *
 * zusatz/lektionen/lektion-NN.html 이 함께 쓰는 화면 스크립트입니다.
 * 문항은 각 페이지의 <script type="application/json" id="zx-data">에, 스피드 퀴즈 문항은 assets/zusatz-blitz.js에 있습니다.
 *
 * 다섯 형식
 *   A 짝 맞추기(Was gehört zusammen?) · B 분류하기(Sortiere!) · C 틀린 곳 찾기(Finde den Fehler!)
 *   D 글에서 찾기(Textdetektiv) · E 스피드 퀴즈(Blitzrunde)
 *
 * 답 저장
 *   localStorage 'soda-zus-NN' 하나에 {v:1, t:시각, m:{문항 이름: 상태}}로 저장합니다.
 *   문항 이름은 문항 내용으로 만든 값이라, 문항을 고치거나 더해도 손대지 않은 문항의 답은 그대로 이어집니다.
 *   assets/autosave.js가 이 키를 복제해 두고(답안 백업), 학습 포탈의 sync.js가 서버에 올립니다.
 */
(function () {
  'use strict';

  var dataEl = document.getElementById('zx-data');
  var app = document.getElementById('zx-app');
  if (!dataEl || !app) return;
  var D;
  try { D = JSON.parse(dataEl.textContent); } catch (e) { app.textContent = '문항을 불러오지 못했습니다.'; return; }
  var LES = D.n;
  var KEY = 'soda-zus-' + LES;

  /* ───────── 저장 ───────── */
  var ST = load();
  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) {}
    if (raw) {
      try { var o = JSON.parse(raw); if (o && o.v === 1 && o.m && typeof o.m === 'object') return o; } catch (e) {}
    }
    return { v: 1, t: 0, m: {} };
  }
  var saveTimer = null;
  function saveNow() {
    clearTimeout(saveTimer); saveTimer = null;
    ST.t = Date.now();
    try { window.localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {}
  }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 120); }
  window.addEventListener('pagehide', function () { if (saveTimer) saveNow(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && saveTimer) saveNow(); });

  /* ───────── 도구 ───────── */
  function hash(s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(cls, text) { var b = el('button', cls, text); b.type = 'button'; return b; }
  function add(p) { for (var i = 1; i < arguments.length; i++) if (arguments[i]) p.appendChild(arguments[i]); return p; }
  function chHead(note) {
    var h = el('div', 'chh');
    add(h, el('span', 'chb', '도전'), note ? el('span', 'chm', note) : null);
    return h;
  }
  function solBox() { return el('div', 'zsol'); }
  function solLine(box, strong, rest) {
    var ln = el('span', 'ln');
    if (strong) ln.appendChild(el('b', 'de-t', strong));
    if (rest) ln.appendChild(el('span', 'nt', (strong ? ' — ' : '') + rest));
    box.appendChild(ln);
    return ln;
  }

  /* 문장을 낱말 단추로 나누기. *낱말* = 틀린 곳, [낱말] = 찾을 것 1, {낱말} = 찾을 것 2 */
  var WORD = /[A-Za-zÄÖÜäöüßÀ-ÖØ-öø-ÿ0-9]+(?:['’\-][A-Za-zÄÖÜäöüßÀ-ÖØ-öø-ÿ0-9]+)*/g;
  function tokenize(s) {
    var out = [];
    var re = /\*([^*]+)\*|\[([^\]]+)\]|\{([^}]+)\}/g, last = 0, m;
    function plain(txt) {
      var i = 0, w;
      WORD.lastIndex = 0;
      while ((w = WORD.exec(txt))) {
        if (w.index > i) out.push({ t: txt.slice(i, w.index), p: 1 });
        out.push({ t: w[0], w: 1, m: 0 });
        i = w.index + w[0].length;
      }
      if (i < txt.length) out.push({ t: txt.slice(i), p: 1 });
    }
    while ((m = re.exec(s))) {
      if (m.index > last) plain(s.slice(last, m.index));
      if (m[1] != null) out.push({ t: m[1], w: 1, m: 'e' });
      else if (m[2] != null) out.push({ t: m[2], w: 1, m: 1 });
      else out.push({ t: m[3], w: 1, m: 2 });
      last = re.lastIndex;
    }
    if (last < s.length) plain(s.slice(last));
    var k = 0;
    out.forEach(function (t) { if (t.w) t.i = k++; });
    return out;
  }
  function plainText(s) { return String(s).replace(/\*([^*]+)\*|\[([^\]]+)\]|\{([^}]+)\}/g, function (a, x, y, z) { return x || y || z; }); }
  /* 낱말 단추로 문장 그리기. 띄어쓰기 없이 붙은 낱말과 문장부호(„Du · sei.)는 한 덩어리(.nw)로 묶어 줄이 바뀔 때 떨어지지 않게 한다 */
  function paintTokens(parent, toks, onTap) {
    var map = {}, seg = null;
    function hold() { if (!seg) { seg = el('span', 'nw'); parent.appendChild(seg); } return seg; }
    toks.forEach(function (t) {
      if (t.w) {
        var b = btn('tk', t.t);
        b.setAttribute('data-i', t.i);
        b.addEventListener('click', function () { onTap(t, b); });
        hold().appendChild(b);
        map[t.i] = b;
      } else {
        String(t.t).split(/(\s+)/).forEach(function (pt) {
          if (!pt) return;
          if (/^\s+$/.test(pt)) { seg = null; parent.appendChild(el('span', 'pu', pt)); }
          else hold().appendChild(el('span', 'pu', pt));
        });
      }
    });
    return map;
  }

  /* ───────── 영역 머리 ───────── */
  var SECS = {
    A: { c: 'a', de: 'Was gehört zusammen?', ko: '짝 맞추기', desc: '왼쪽에서 하나, 오른쪽에서 하나를 차례로 눌러 짝을 맞추세요. 맞으면 초록색으로 바뀌고 같은 번호가 붙습니다. 오른쪽을 먼저 눌러도 됩니다.' },
    B: { c: 'b', de: 'Sortiere!', ko: '분류하기', desc: '카드를 하나 누른 뒤 들어갈 칸을 누르세요. 칸에 넣은 카드를 다시 누르면 위로 돌아갑니다. 다 넣었으면 확인을 누르세요. 맞은 카드는 초록색으로 고정되고, 틀린 카드는 빨간색으로 남습니다.' },
    C: { c: 'c', de: 'Finde den Fehler!', ko: '틀린 곳 찾아 고치기', desc: '문장마다 틀린 곳이 한 군데 있습니다. 틀렸다고 생각하는 낱말을 누르세요(어순이 틀린 문장은 자리가 잘못된 낱말 가운데 하나를 누르면 됩니다). 맞게 찾으면 고칠 말을 고르는 칸이 열립니다. 맞는 낱말을 누르면 초록색으로 표시됩니다.' },
    D: { c: 'd', de: 'Textdetektiv', ko: '글에서 찾아 표시하기', desc: '글을 읽으며 문제에서 찾으라는 낱말을 눌러 표시하세요. 다시 누르면 표시가 바뀌거나 지워집니다. 다 찾았으면 확인을 누르세요. 찾아야 할 개수를 문제에 적어 두었습니다.' },
    E: { c: 'e', de: 'Blitzrunde', ko: '60초 스피드 퀴즈', desc: '60초 동안 알맞은 답을 빠르게 고르세요. 틀리면 정답과 이유를 잠깐 보여 주고 다음 문제로 넘어갑니다. 끝나면 틀린 문제를 다시 볼 수 있습니다. 컴퓨터에서는 숫자 키 1·2·3으로도 고를 수 있습니다.' }
  };
  function section(key) {
    var s = SECS[key];
    var sec = el('section', 'sec');
    sec.setAttribute('data-sec', key);
    var hd = el('div', 'sec-hd ' + s.c);
    add(hd, el('span', 'ico', String.fromCharCode(64 + 'ABCDE'.indexOf(key) + 1)));
    var tx = el('div', 'tx');
    add(tx, el('h2', null, s.de), el('div', 'ko', s.ko));
    hd.appendChild(tx);
    add(sec, hd, el('div', 'sec-desc', s.desc));
    var ql = el('div', 'ql');
    sec.appendChild(ql);
    return { sec: sec, list: ql };
  }

  var SOLS = [];  // 모든 해설 상자 (전체 정답 보기)
  function dropSol(s) { var i = SOLS.indexOf(s); if (i >= 0) SOLS.splice(i, 1); }

  /* ───────── A · 짝 맞추기 ───────── */
  function renderMatch(set, list) {
    var pairs = set.p.map(function (p, i) { return { l: p[0], r: p[1], x: p[2] || '', k: hash(p[0] + '\u0001' + p[1]), n: i + 1 }; });
    var extra = (set.d || []).map(function (t) { return { r: t, k: 'x' + hash(t), dx: 1 }; }); // 짝이 없는 오른쪽 카드
    var id = 'A:' + hash(pairs.map(function (p) { return p.k; }).join('.'));
    var card = el('div', 'zc' + (set.ch ? ' ch' : ''));
    var holder = el('div');
    card.appendChild(holder);
    list.appendChild(card);

    function draw() {
      holder.innerHTML = '';
      var done = (ST.m[id] || []).slice();
      if (set.ch) holder.appendChild(chHead(set.ch));
      holder.appendChild(el('div', 'zt', set.t));
      if (set.k || extra.length) holder.appendChild(el('div', 'zk', (set.k ? set.k + ' ' : '') + (extra.length ? '오른쪽에는 짝이 없는 카드도 ' + extra.length + '장 섞여 있습니다.' : '')));
      var grid = el('div', 'mt');
      var aL = 0, aR = 0;
      pairs.forEach(function (p) { aL += p.l.length; aR += p.r.length; });
      aL /= pairs.length; aR /= pairs.length;
      if (aL > 22 && aR < 14) grid.classList.add('wl');
      else if (aR > 22 && aL < 14) grid.classList.add('wr');
      var cl = el('div', 'mt-c mt-l'), cr = el('div', 'mt-c mt-r');
      add(grid, cl, cr);
      holder.appendChild(grid);
      var ctl = el('div', 'zctl');
      var stat = el('span', 'zst');
      var bSol = btn('zb2', '정답 보기'), bRe = btn('zb2', '다시 하기');
      add(ctl, stat, bSol, bRe);
      holder.appendChild(ctl);
      var sol = solBox();
      sol.appendChild(el('span', 'tt', '정답'));
      pairs.forEach(function (p) { solLine(sol, p.l + '  ↔  ' + p.r, p.x); });
      holder.appendChild(sol);
      SOLS.push(sol);

      var selL = null, selR = null, busy = false;
      var L = {}, R = {};
      function item(p, side) {
        var b = btn('mt-i');
        add(b, el('span', 'mt-x de-t', side === 'l' ? p.l : p.r), el('span', 'mt-n', String(p.n)));
        b.addEventListener('click', function () { tap(p, side, b); });
        return b;
      }
      pairs.forEach(function (p) { var b = item(p, 'l'); L[p.k] = b; cl.appendChild(b); });
      shuffle(pairs.concat(extra)).forEach(function (p) { var b = item(p, 'r'); R[p.k] = b; cr.appendChild(b); });

      function mark(k) { L[k].classList.add('ok'); R[k].classList.add('ok'); L[k].disabled = R[k].disabled = true; }
      function dimExtra() { extra.forEach(function (p) { R[p.k].classList.add('dim'); R[p.k].disabled = true; }); }
      done.forEach(function (k) { if (L[k]) mark(k); });
      if (done.length >= pairs.length) dimExtra();
      function status(msg, cls) {
        var n = (ST.m[id] || []).length;
        stat.className = 'zst' + (cls ? ' ' + cls : '');
        if (n >= pairs.length) { stat.className = 'zst ok'; stat.textContent = '완성! ' + pairs.length + '쌍을 모두 맞혔어요.'; return; }
        stat.textContent = msg || ('맞춘 짝 ' + n + ' / ' + pairs.length);
      }
      status();
      if (done.length >= pairs.length) sol.classList.add('s');

      function clearSel() {
        if (selL) selL.b.classList.remove('sel');
        if (selR) selR.b.classList.remove('sel');
        selL = selR = null;
      }
      function tap(p, side, b) {
        if (busy || b.classList.contains('ok')) return;
        var cur = side === 'l' ? selL : selR;
        if (cur && cur.b === b) { b.classList.remove('sel'); if (side === 'l') selL = null; else selR = null; return; }
        if (cur) cur.b.classList.remove('sel');
        b.classList.add('sel');
        if (side === 'l') selL = { p: p, b: b }; else selR = { p: p, b: b };
        if (selL && selR) {
          if (selL.p.k === selR.p.k) {
            var k = selL.p.k;
            clearSel();
            mark(k);
            var arr = ST.m[id] || (ST.m[id] = []);
            if (arr.indexOf(k) < 0) arr.push(k);
            save();
            status();
            if (arr.length >= pairs.length) { sol.classList.add('s'); dimExtra(); }
          } else {
            var a = selL.b, c = selR.b;
            a.classList.add('no'); c.classList.add('no');
            busy = true;
            status('짝이 아니에요. 다시 골라 보세요.', 'no');
            setTimeout(function () { a.classList.remove('no', 'sel'); c.classList.remove('no', 'sel'); selL = selR = null; busy = false; }, 520);
          }
        }
      }
      bSol.addEventListener('click', function () { sol.classList.toggle('s'); });
      bRe.addEventListener('click', function () { delete ST.m[id]; save(); dropSol(sol); draw(); });
    }
    draw();
  }

  /* ───────── B · 분류하기 ───────── */
  function renderSort(set, list) {
    var cards = set.c.map(function (c) { return { t: c[0], b: c[1], x: c[2] || '', k: hash(c[0] + '\u0001' + c[1]) }; });
    var id = 'B:' + hash(set.bins.map(function (b) { return b[0]; }).join('|') + '\u0001' + cards.map(function (c) { return c.k; }).join('.'));
    var card = el('div', 'zc' + (set.ch ? ' ch' : ''));
    var holder = el('div');
    card.appendChild(holder);
    list.appendChild(card);
    var order = shuffle(cards.slice());

    function draw() {
      holder.innerHTML = '';
      var st = ST.m[id] || { p: {}, k: {} };
      if (set.ch) holder.appendChild(chHead(set.ch));
      holder.appendChild(el('div', 'zt', set.t));
      if (set.k) holder.appendChild(el('div', 'zk', set.k));
      var pool = el('div', 'st-pool');
      var bins = el('div', 'st-bins');
      var nb = set.bins.length;
      var maxLen = 0; cards.forEach(function (c) { maxLen = Math.max(maxLen, c.t.length); });
      bins.style.setProperty('--nb', nb);
      /* 핸드폰: 낱말이 짧으면 나란히, 길면 위아래로 */
      var nbm = nb === 2 ? (maxLen <= 14 ? 2 : 1) : nb === 3 ? (maxLen <= 8 ? 3 : 1) : (maxLen <= 12 ? 2 : 1);
      bins.style.setProperty('--nbm', nbm);
      if (nbm === 1) bins.classList.add('stack');
      if (maxLen > 18) bins.classList.add('long');
      holder.appendChild(pool);
      holder.appendChild(bins);
      var binBody = set.bins.map(function (bn, i) {
        var box = el('div', 'st-bin');
        box.setAttribute('role', 'button');
        box.setAttribute('tabindex', '0');
        box.setAttribute('aria-label', bn[0] + (bn[1] ? ' ' + bn[1] : '') + ' 칸');
        var bh = el('div', 'st-bh');
        add(bh, el('b', 'de-t', bn[0]), bn[1] ? el('span', null, bn[1]) : null);
        var bb = el('div', 'st-bb');
        add(box, bh, bb);
        box.addEventListener('click', function (e) { if (e.target.closest('.st-c')) return; drop(i); });
        box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === box) { e.preventDefault(); drop(i); } });
        bins.appendChild(box);
        return bb;
      });
      var ctl = el('div', 'zctl');
      var stat = el('span', 'zst');
      var bChk = btn('zb', '확인'), bSol = btn('zb2', '정답 보기'), bRe = btn('zb2', '다시 하기');
      add(ctl, stat, bChk, bSol, bRe);
      holder.appendChild(ctl);
      var sol = solBox();
      sol.appendChild(el('span', 'tt', '정답'));
      set.bins.forEach(function (bn, i) {
        var names = cards.filter(function (c) { return c.b === i; });
        var ln = el('span', 'ln');
        ln.appendChild(el('b', 'de-t', bn[0] + (bn[1] ? ' (' + bn[1] + ')' : '') + ': '));
        ln.appendChild(el('span', 'de-t', names.map(function (c) { return c.t; }).join(' · ')));
        sol.appendChild(ln);
      });
      if (cards.some(function (c) { return c.x; })) {
        var ul = el('ul', 'st-notes');
        cards.forEach(function (c) {
          if (!c.x) return;
          var li = el('li');
          add(li, el('b', 'de-t', c.t), el('span', 'nt', ' — ' + c.x));
          ul.appendChild(li);
        });
        sol.appendChild(ul);
      }
      if (set.x) solLine(sol, '', set.x);
      holder.appendChild(sol);
      SOLS.push(sol);

      var sel = null, B = {};
      order.forEach(function (c) {
        var b = btn('st-c de-t', c.t);
        B[c.k] = b;
        b.addEventListener('click', function () { tapCard(c, b); });
        if (st.p[c.k] != null && binBody[st.p[c.k]]) {
          binBody[st.p[c.k]].appendChild(b);
          if (st.k[c.k]) { b.classList.add('ok'); }
        } else pool.appendChild(b);
      });
      function lockedAll() { return cards.every(function (c) { return st.k[c.k]; }); }
      function status(msg, cls) {
        if (lockedAll()) { stat.className = 'zst ok'; stat.textContent = '완성! 카드 ' + cards.length + '장을 모두 맞게 넣었어요.'; return; }
        stat.className = 'zst' + (cls ? ' ' + cls : '');
        var placed = cards.filter(function (c) { return st.p[c.k] != null; }).length;
        stat.textContent = msg || ('넣은 카드 ' + placed + ' / ' + cards.length);
      }
      status();
      if (lockedAll()) sol.classList.add('s');
      function persist() { ST.m[id] = st; save(); }
      function setSel(b) {
        if (sel) sel.classList.remove('sel');
        sel = b;
        if (b) b.classList.add('sel');
        bins.classList.toggle('arm', !!b);
      }
      function tapCard(c, b) {
        /* 다른 카드를 고른 채로 칸 안의 카드를 누르면 → 고른 카드를 그 칸에 넣기 */
        if (sel && sel !== b && b.parentNode !== pool) { var bi = -1; binBody.forEach(function (bb, i) { if (bb === b.parentNode) bi = i; }); if (bi >= 0) { drop(bi); return; } }
        if (b.classList.contains('ok')) { status(c.t + (c.x ? ' — ' + c.x : ' — 맞게 넣었어요.'), 'ok'); return; }
        if (b.parentNode === pool) {
          setSel(sel === b ? null : b);
          if (sel) status('넣을 칸을 누르세요.');
          else status();
          return;
        }
        /* 칸에 있던 카드 → 위로 돌려보내기 */
        b.classList.remove('no');
        delete st.p[c.k];
        pool.appendChild(b);
        persist();
        setSel(null);
        status();
      }
      function drop(i) {
        if (!sel) { status('먼저 위에서 카드를 하나 누르세요.'); return; }
        var b = sel, c = null;
        cards.forEach(function (x) { if (B[x.k] === b) c = x; });
        setSel(null);
        if (!c) return;
        b.classList.remove('no');
        binBody[i].appendChild(b);
        st.p[c.k] = i;
        persist();
        status();
      }
      bChk.addEventListener('click', function () {
        var right = 0, wrong = 0, left = 0;
        cards.forEach(function (c) {
          var b = B[c.k];
          if (st.p[c.k] == null) { left++; return; }
          if (st.p[c.k] === c.b) { st.k[c.k] = 1; b.classList.add('ok'); b.classList.remove('no'); right++; }
          else { b.classList.add('no'); wrong++; }
        });
        persist();
        if (lockedAll()) { status(); sol.classList.add('s'); return; }
        var msg = '맞음 ' + right + ' · 틀림 ' + wrong + (left ? ' · 남은 카드 ' + left : '');
        if (wrong) msg += ' — 빨간 카드를 눌러 위로 돌려보낸 뒤 다시 넣어 보세요.';
        status(msg, wrong ? 'no' : '');
      });
      bSol.addEventListener('click', function () { sol.classList.toggle('s'); });
      bRe.addEventListener('click', function () { delete ST.m[id]; save(); dropSol(sol); order = shuffle(cards.slice()); draw(); });
    }
    draw();
  }

  /* ───────── C · 틀린 곳 찾기 ───────── */
  var cNum = 0;
  function renderFehler(item, list) {
    var num = ++cNum;
    var toks = tokenize(item.s);
    var errToks = toks.filter(function (t) { return t.m === 'e'; });
    var right = item.o[0];
    var fixed = item.c || toks.map(function (t) { return t.m === 'e' ? right : t.t; }).join('');
    var id = 'C:' + hash(item.s);
    var card = el('div', 'zc fj' + (item.ch ? ' ch' : ''));
    var row = el('div', 'zr');
    var qn = el('span', 'qn', String(num));
    var main = el('div', 'zm');
    add(row, qn, main);
    card.appendChild(row);
    list.appendChild(card);
    var opts = shuffle(item.o.slice());

    function draw() {
      main.innerHTML = '';
      var st = ST.m[id] || { w: [], f: 0, o: [], d: 0 };
      if (item.ch) main.appendChild(chHead(item.ch));
      var p = el('p', 'fj-s de-t');
      main.appendChild(p);
      var map = paintTokens(p, toks, tap);
      var q = el('div', 'fj-q');
      var oBox = el('div', 'fj-o' + (item.o.some(function (o) { return o.indexOf(' ') > 0 && o.length > 14; }) ? ' blk' : ''));
      main.appendChild(q);
      main.appendChild(oBox);
      var ctl = el('div', 'zctl');
      var stat = el('span', 'zst');
      var bSol = btn('zb2', '정답');
      add(ctl, stat, bSol);
      main.appendChild(ctl);
      var sol = solBox();
      solLine(sol, fixed, item.x);
      main.appendChild(sol);
      SOLS.push(sol);

      function persist() { ST.m[id] = st; save(); }
      function showFound() {
        errToks.forEach(function (t) { map[t.i].classList.add('err'); });
        q.innerHTML = '';
        if (errToks.length === 1) { q.appendChild(el('b', 'de-t', errToks[0].t)); q.appendChild(document.createTextNode(' → 무엇으로 고칠까요?')); }
        else q.textContent = '어떻게 고칠까요?';
        oBox.innerHTML = '';
        opts.forEach(function (o) {
          var b = btn('opt de-t', o);
          if (st.o.indexOf(o) >= 0) { b.classList.add('no'); b.disabled = true; }
          if (st.d && o === right) b.classList.add('ok');
          if (st.d) b.disabled = true;
          b.addEventListener('click', function () { pick(o, b); });
          oBox.appendChild(b);
        });
      }
      function showDone() {
        p.classList.add('done');
        if (errToks.length === 1 && !item.c) {
          var tb = map[errToks[0].i];
          var fx = el('span', 'fx', right);
          tb.parentNode.insertBefore(fx, tb.nextSibling);
        }
        sol.classList.add('s');
        stat.className = 'zst ok';
        stat.textContent = '맞게 고쳤어요!';
      }
      st.w.forEach(function (i) { if (map[i]) map[i].classList.add('fine'); });
      if (st.f) showFound();
      if (st.d) showDone();
      else stat.textContent = '';

      function tap(t, b) {
        if (st.d || st.f && t.m === 'e') return;
        if (t.m === 'e') {
          st.f = 1; persist();
          showFound();
          map[t.i].classList.add('flash');
          stat.className = 'zst ok';
          stat.textContent = '찾았어요! 이제 고칠 말을 고르세요.';
          return;
        }
        if (st.f) return;
        if (st.w.indexOf(t.i) < 0) { st.w.push(t.i); persist(); }
        b.classList.add('fine');
        stat.className = 'zst';
        stat.textContent = '「' + t.t + '」는 맞는 낱말이에요. 다른 곳을 찾아보세요.';
      }
      function pick(o, b) {
        if (st.d) return;
        if (o === right) {
          st.d = 1; persist();
          showFound();
          showDone();
        } else {
          if (st.o.indexOf(o) < 0) st.o.push(o);
          persist();
          b.classList.add('no'); b.disabled = true;
          stat.className = 'zst no';
          stat.textContent = '그 말이 아니에요. 다시 골라 보세요.';
        }
      }
      bSol.addEventListener('click', function () { sol.classList.toggle('s'); });
    }
    draw();
    return draw;
  }

  /* ───────── D · 글에서 찾기 ───────── */
  function renderDetektiv(item, list) {
    var toks = tokenize(item.txt);
    var words = toks.filter(function (t) { return t.w; });
    var cats = item.cats;
    var need = [0, 0, 0];
    words.forEach(function (t) { if (t.m === 1 || t.m === 2) need[t.m]++; });
    var id = 'D:' + hash(item.txt);
    var card = el('div', 'zc' + (item.ch ? ' ch' : ''));
    var holder = el('div');
    card.appendChild(holder);
    list.appendChild(card);

    function draw() {
      holder.innerHTML = '';
      var st = ST.m[id] || { s: {}, k: 0 };
      if (item.ch) holder.appendChild(chHead(item.ch));
      holder.appendChild(el('div', 'zt', item.t));
      if (cats.length === 1) {
        var lg1 = el('div', 'dt-legend');
        var s1 = el('span', 'l1'); s1.appendChild(el('i')); s1.appendChild(document.createTextNode('찾을 것: ' + cats[0] + ' ' + need[1] + '개'));
        lg1.appendChild(s1);
        holder.appendChild(lg1);
      }
      if (cats.length > 1) {
        var lg = el('div', 'dt-legend');
        var l1 = el('span', 'l1'); l1.appendChild(el('i')); l1.appendChild(document.createTextNode('한 번 누르기 = ' + cats[0] + ' (' + need[1] + '개)'));
        var l2 = el('span', 'l2'); l2.appendChild(el('i')); l2.appendChild(document.createTextNode('두 번 누르기 = ' + cats[1] + ' (' + need[2] + '개)'));
        add(lg, l1, l2);
        holder.appendChild(lg);
      }
      var box = el('div', 'dt-t');
      if (item.h) box.appendChild(el('div', 'dt-h', item.h));
      if (item.k) { var kk = el('div', 'zk', item.k); kk.style.margin = '-2px 0 8px'; box.appendChild(kk); }
      holder.appendChild(box);
      var map = {};
      var paras = [[]];
      toks.forEach(function (t) {
        if (t.p && t.t.indexOf('\n') >= 0) {
          var parts = t.t.split('\n');
          parts.forEach(function (pt, i) { if (i > 0) paras.push([]); if (pt) paras[paras.length - 1].push({ t: pt, p: 1 }); });
        } else paras[paras.length - 1].push(t);
      });
      paras.forEach(function (pt) {
        var p = el('p', 'de-t');
        var m = paintTokens(p, pt, tap);
        for (var k in m) map[k] = m[k];
        box.appendChild(p);
      });
      var ctl = el('div', 'zctl');
      var stat = el('span', 'zst');
      var bChk = btn('zb', '확인'), bSol = btn('zb2', '정답 보기'), bRe = btn('zb2', '다시 하기');
      add(ctl, stat, bChk, bSol, bRe);
      holder.appendChild(ctl);
      var sol = solBox();
      sol.appendChild(el('span', 'tt', '정답'));
      [1, 2].forEach(function (c) {
        if (!need[c]) return;
        var ln = el('span', 'ln');
        ln.appendChild(el('b', null, cats[c - 1] + ' (' + need[c] + '개): '));
        ln.appendChild(el('span', 'de-t', words.filter(function (t) { return t.m === c; }).map(function (t) { return t.t; }).join(' · ')));
        sol.appendChild(ln);
      });
      if (item.x) solLine(sol, '', item.x);
      holder.appendChild(sol);
      SOLS.push(sol);

      function persist() { ST.m[id] = st; save(); }
      function paint(t) {
        var b = map[t.i]; if (!b) return;
        var v = st.s[t.i] || 0;
        b.classList.remove('m1', 'm2', 'good', 'bad');
        if (v) b.classList.add('m' + v);
      }
      words.forEach(paint);
      function evaluate(show) {
        var found = 0, wrong = 0, total = need[1] + need[2];
        words.forEach(function (t) {
          var v = st.s[t.i] || 0, b = map[t.i];
          b.classList.remove('good', 'bad');
          if (!v) return;
          if (v === t.m) { found++; if (show) b.classList.add('good'); }
          else { wrong++; if (show) b.classList.add('bad'); }
        });
        return { found: found, wrong: wrong, total: total };
      }
      function status() {
        var n = 0; for (var k in st.s) if (st.s[k]) n++;
        stat.className = 'zst';
        stat.textContent = '표시한 낱말 ' + n + '개';
      }
      function finish() {
        box.classList.add('done');
        stat.className = 'zst ok';
        stat.textContent = '완성! ' + (need[1] + need[2]) + '개를 모두 찾았어요.';
        sol.classList.add('s');
      }
      if (st.k === 2) { evaluate(true); finish(); }
      else if (st.k === 1) { var r0 = evaluate(true); showResult(r0); }
      else status();
      function showResult(r) {
        if (r.found === r.total && !r.wrong) { st.k = 2; persist(); finish(); return; }
        stat.className = 'zst' + (r.wrong ? ' no' : '');
        stat.textContent = '맞게 찾음 ' + r.found + ' / ' + r.total + (r.wrong ? ' · 잘못 표시 ' + r.wrong : '') + (r.found < r.total ? ' — 더 찾아보세요.' : '');
      }
      function tap(t) {
        if (st.k === 2) return;
        var v = st.s[t.i] || 0;
        v = (v + 1) % (cats.length + 1);
        if (v) st.s[t.i] = v; else delete st.s[t.i];
        if (st.k) { st.k = 0; words.forEach(function (w) { var b = map[w.i]; if (b) b.classList.remove('good', 'bad'); }); }
        paint(t);
        persist();
        status();
      }
      bChk.addEventListener('click', function () {
        if (st.k === 2) return;
        st.k = 1; persist();
        showResult(evaluate(true));
      });
      bSol.addEventListener('click', function () {
        var on = !sol.classList.contains('s');
        sol.classList.toggle('s', on);
        words.forEach(function (t) {
          var b = map[t.i]; if (!b) return;
          b.classList.remove('miss1', 'miss2');
          if (on && (t.m === 1 || t.m === 2) && (st.s[t.i] || 0) !== t.m) b.classList.add('miss' + t.m);
        });
      });
      bRe.addEventListener('click', function () { delete ST.m[id]; save(); dropSol(sol); draw(); });
    }
    draw();
  }

  /* ───────── E · 스피드 퀴즈 ───────── */
  var BLITZ = null; // 지금 화면의 스피드 퀴즈 (키보드·화면 전환 처리용)
  document.addEventListener('keydown', function (e) { if (BLITZ) BLITZ.key(e); });
  document.addEventListener('visibilitychange', function () { if (BLITZ) BLITZ.vis(); });

  function renderBlitz(list) {
    var BZ = window.SODA_BLITZ || {};
    var mine = BZ[LES];
    if (!mine || !mine.i || !mine.i.length) return false;
    var nLes = parseInt(LES, 10);
    function norm(it, l, name) { return { q: it[0], o: it[1], x: it[2] || '', ch: !!it[3], l: l, name: name }; }
    var cur = mine.i.map(function (it) { return norm(it, nLes, mine.t); });
    var prev = [];
    Object.keys(BZ).forEach(function (k) {
      var n = parseInt(k, 10);
      if (n < nLes && BZ[k] && BZ[k].i) BZ[k].i.forEach(function (it) { prev.push(norm(it, n, BZ[k].t)); });
    });
    var TIME = 60;
    var card = el('div', 'zc');
    list.appendChild(card);
    function rec() { return ST.m.E || { b0: 0, b1: 0, n: 0 }; }

    var vStart = el('div', 'bz-start'), vPlay = el('div', 'bz-play'), vEnd = el('div', 'bz-end');
    vPlay.hidden = vEnd.hidden = true;
    add(card, vStart, vPlay, vEnd);

    /* 시작 화면 */
    function drawStart() {
      vStart.innerHTML = '';
      vStart.appendChild(el('p', 'bz-intro', '한 라운드는 60초입니다. 고민하지 말고 바로 떠오르는 답을 누르세요. 여러 번 해서 최고 기록을 올려 보세요.'));
      var modes = el('div', 'bz-modes');
      var m0 = btn('bz-m');
      add(m0, el('b', null, '기본 라운드'), el('span', null, '이 과의 문제만 나옵니다.'), el('em', null, '시작 →'));
      var m1 = btn('bz-m ch');
      add(m1, el('b', null, '도전 라운드'), el('span', null, nLes > 1 ? '이 과의 어려운 문제와 1~' + (nLes - 1) + '과 문제가 번갈아 나옵니다.' : '이 과의 규칙을 여러 개 섞은 어려운 문제가 먼저 나옵니다.'), el('em', null, '시작 →'));
      m0.addEventListener('click', function () { play(0); });
      m1.addEventListener('click', function () { play(1); });
      add(modes, m0, m1);
      vStart.appendChild(modes);
      var r = rec();
      var best = el('div', 'bz-best');
      if (r.n) {
        best.appendChild(document.createTextNode('최고 기록 — 기본 '));
        best.appendChild(el('b', null, (r.b0 || 0) + '개'));
        best.appendChild(document.createTextNode(' · 도전 '));
        best.appendChild(el('b', null, (r.b1 || 0) + '개'));
        best.appendChild(document.createTextNode(' (지금까지 ' + r.n + '번)'));
      } else best.textContent = '아직 기록이 없습니다.';
      vStart.appendChild(best);
    }

    var G = null; // 진행 중인 라운드
    function seq(mode) {
      if (mode === 0) {
        var reg = cur.filter(function (x) { return !x.ch; });
        return shuffle(reg.length >= 8 ? reg : cur.slice());
      }
      var hard = shuffle(cur.filter(function (x) { return x.ch; }));
      var rest = shuffle(cur.filter(function (x) { return !x.ch; }));
      var a = hard.concat(rest);
      var mix = shuffle(prev.slice());
      if (!mix.length) return a;
      var out = [], i = 0, j = 0;
      while (i < a.length || j < mix.length) {
        if (i < a.length) out.push(a[i++]);
        if (j < mix.length) out.push(mix[j++]);
      }
      return out;
    }
    var raf = null, timers = [];
    function later(f, ms) { var t = setTimeout(function () { timers.splice(timers.indexOf(t), 1); f(); }, ms); timers.push(t); }
    function stopAll() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
      timers.forEach(clearTimeout); timers = [];
      if (G) G.last = 0;
    }
    function play(mode) {
      stopAll();
      G = { mode: mode, list: seq(mode), pos: 0, right: 0, ans: 0, wrong: [], left: TIME * 1000, last: 0, lock: false, over: false };
      vStart.hidden = vEnd.hidden = true; vPlay.hidden = false;
      vPlay.innerHTML = '';
      var top = el('div', 'bz-top');
      var tEl = el('span', 'bz-time'), sEl = el('span', 'bz-score');
      G.tTxt = document.createTextNode(''); G.sTxt = document.createTextNode('');
      add(tEl, G.tTxt, el('small', null, '남은 시간'));
      add(sEl, G.sTxt, el('small', null, '맞힌 수'));
      G.bar = el('div', 'bz-bar'); G.barI = el('i'); G.bar.appendChild(G.barI);
      add(top, tEl, G.bar, sEl);
      G.tag = el('div', 'bz-tag');
      G.q = el('p', 'bz-q de-t');
      G.o = el('div', 'bz-o');
      G.fb = el('div', 'bz-fb');
      var ctl = el('div', 'zctl');
      var stop = btn('zb2', '그만하기');
      stop.addEventListener('click', function () { end(); });
      add(ctl, el('span', 'zst'), stop);
      add(vPlay, top, G.tag, G.q, G.o, G.fb, ctl);
      paintClock();
      next();
      startTimer();
      try { card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }
    function paintClock() {
      var s = Math.max(0, Math.ceil(G.left / 1000));
      if (G.tTxt.data !== String(s)) G.tTxt.data = String(s);
      if (G.sTxt.data !== String(G.right)) G.sTxt.data = String(G.right);
      G.barI.style.transform = 'scaleX(' + Math.max(0, G.left / (TIME * 1000)).toFixed(4) + ')';
      G.bar.classList.toggle('low', G.left <= 10000);
    }
    function tick(now) {
      raf = null;
      if (!G || G.over) return;
      if (G.last) G.left -= (now - G.last);
      G.last = now;
      paintClock();
      if (G.left <= 0) { end(); return; }
      raf = window.requestAnimationFrame(tick);
    }
    function startTimer() { if (!G || G.over || raf) return; G.last = 0; raf = window.requestAnimationFrame(tick); }
    function qHtml(q, fill) {
      var parts = String(q).split('___');
      G.q.innerHTML = '';
      parts.forEach(function (pt, i) {
        if (i > 0) G.q.appendChild(el('span', 'gap', fill == null ? '?' : fill));
        G.q.appendChild(document.createTextNode(pt));
      });
    }
    function next() {
      if (!G.list.length) { end(); return; }
      if (G.pos >= G.list.length) { G.list = seq(G.mode); G.pos = 0; }
      var it = G.list[G.pos++];
      G.it = it;
      G.lock = false;
      G.tag.innerHTML = '';
      if (G.mode === 1) G.tag.appendChild(el('span', null, it.l === nLes ? (it.ch ? '이 과 · 도전' : '이 과') : it.l + '과 · ' + it.name));
      qHtml(it.q);
      G.o.innerHTML = '';
      var os = shuffle(it.o.map(function (o, i) { return { t: o, ok: i === 0 }; }));
      G.o.style.setProperty('--no', os.length);
      G.btns = os.map(function (o) {
        var b = btn('opt de-t', o.t);
        b.addEventListener('click', function () { answer(o, b); });
        G.o.appendChild(b);
        return { o: o, b: b };
      });
      G.fb.className = 'bz-fb';
      G.fb.textContent = '';
    }
    function answer(o, b) {
      if (!G || G.lock || G.over) return;
      G.lock = true;
      G.ans++;
      var it = G.it;
      G.btns.forEach(function (x) { x.b.disabled = true; if (x.o.ok) x.b.classList.add('ok'); });
      qHtml(it.q, it.o[0]);
      if (o.ok) {
        G.right++;
        G.fb.className = 'bz-fb ok';
        G.fb.textContent = '정답!';
        paintClock();
        later(function () { if (G && !G.over) next(); }, 420);
      } else {
        b.classList.add('no');
        G.wrong.push(it);
        G.fb.className = 'bz-fb no';
        G.fb.innerHTML = '';
        G.fb.appendChild(document.createTextNode('정답: '));
        G.fb.appendChild(el('b', 'de-t', it.o[0]));
        if (it.x) G.fb.appendChild(document.createTextNode(' — ' + it.x));
        later(function () { if (G && !G.over) next(); }, 2000);
      }
    }
    function end() {
      if (!G || G.over) return;
      G.over = true;
      stopAll();
      var r = rec();
      var k = G.mode ? 'b1' : 'b0';
      var isNew = G.right > (r[k] || 0);
      if (isNew) r[k] = G.right;
      r.n = (r.n || 0) + 1;
      ST.m.E = r; save();
      vPlay.hidden = true; vEnd.hidden = false;
      vEnd.innerHTML = '';
      var res = el('div', 'bz-res');
      function cell(v, lab) { var d = el('div'); add(d, el('b', null, v), el('span', null, lab)); return d; }
      var acc = G.ans ? Math.round(G.right * 100 / G.ans) : 0;
      add(res, cell(String(G.right), '맞힌 문제'), cell(String(G.ans), '푼 문제'), cell(acc + '%', '정확도'));
      vEnd.appendChild(el('div', 'zt', (G.mode ? '도전 라운드' : '기본 라운드') + ' 결과'));
      res.style.marginTop = '10px';
      vEnd.appendChild(res);
      if (isNew && G.right > 0) vEnd.appendChild(el('div', 'bz-new', '새 최고 기록이에요!'));
      if (G.wrong.length) {
        var rv = el('div', 'bz-rev');
        rv.appendChild(el('h4', null, '틀린 문제 다시 보기'));
        var ol = el('ol');
        var seen = {};
        G.wrong.forEach(function (it) {
          var key = it.q + '|' + it.o[0];
          if (seen[key]) return; seen[key] = 1;
          var li = el('li', 'de-t');
          var parts = String(it.q).split('___');
          parts.forEach(function (pt, i) { if (i > 0) li.appendChild(el('span', 'a', it.o[0])); li.appendChild(document.createTextNode(pt)); });
          if (String(it.q).indexOf('___') < 0) { li.appendChild(document.createTextNode(' → ')); li.appendChild(el('span', 'a', it.o[0])); }
          if (it.x) li.appendChild(el('span', 'x', (it.l !== nLes ? it.l + '과 · ' : '') + it.x));
          ol.appendChild(li);
        });
        rv.appendChild(ol);
        vEnd.appendChild(rv);
      } else if (G.ans) vEnd.appendChild(el('div', 'bz-new', '틀린 문제가 하나도 없어요!'));
      var ctl = el('div', 'zctl');
      var again = btn('zb', '한 번 더'), home = btn('zb2', '처음 화면으로');
      var mode = G.mode;
      again.addEventListener('click', function () { play(mode); });
      home.addEventListener('click', function () { vEnd.hidden = true; vStart.hidden = false; drawStart(); });
      add(ctl, el('span', 'zst'), again, home);
      vEnd.appendChild(ctl);
    }
    drawStart();
    BLITZ = {
      key: function (e) {
        if (!G || G.over || vPlay.hidden || G.lock || e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target && e.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA') return;
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= G.btns.length) { e.preventDefault(); G.btns[n - 1].b.click(); }
      },
      vis: function () {
        if (!G || G.over || vPlay.hidden) return;
        if (document.hidden) { if (raf) window.cancelAnimationFrame(raf); raf = null; G.last = 0; }
        else startTimer();
      },
      kill: function () { stopAll(); if (G) G.over = true; }
    };
    return true;
  }

  /* ───────── 그리기 ───────── */
  function build() {
    if (BLITZ) { BLITZ.kill(); BLITZ = null; }
    app.innerHTML = '';
    SOLS = [];
    cNum = 0;
    if (D.A && D.A.length) { var a = section('A'); D.A.forEach(function (s) { renderMatch(s, a.list); }); app.appendChild(a.sec); }
    if (D.B && D.B.length) { var b = section('B'); D.B.forEach(function (s) { renderSort(s, b.list); }); app.appendChild(b.sec); }
    if (D.C && D.C.length) { var c = section('C'); D.C.forEach(function (s) { renderFehler(s, c.list); }); app.appendChild(c.sec); }
    if (D.D && D.D.length) { var d = section('D'); D.D.forEach(function (s) { renderDetektiv(s, d.list); }); app.appendChild(d.sec); }
    var e = section('E');
    if (renderBlitz(e.list)) app.appendChild(e.sec);
  }
  build();

  /* 전체 정답 보기 · 전체 답 초기화 */
  var bAll = document.getElementById('zx-all'), bReset = document.getElementById('zx-reset');
  var allOn = false;
  if (bAll) bAll.addEventListener('click', function () {
    allOn = !allOn;
    SOLS.forEach(function (s) { if (document.body.contains(s)) s.classList.toggle('s', allOn); });
    bAll.textContent = allOn ? '전체 정답 숨기기' : '전체 정답 보기';
  });
  if (bReset) bReset.addEventListener('click', function () {
    if (!window.confirm('이 과의 추가 연습 답을 모두 지울까요? (스피드 퀴즈 최고 기록은 남겨 둡니다)')) return;
    var keep = ST.m.E;
    ST.m = {};
    if (keep) ST.m.E = keep;
    saveNow();
    allOn = false;
    if (bAll) bAll.textContent = '전체 정답 보기';
    build();
    window.scrollTo(0, 0);
  });

  /* 확인용: 콘솔에서 __sodaZusatz() */
  window.__sodaZusatz = function () { return { key: KEY, state: JSON.parse(JSON.stringify(ST)) }; };
})();
