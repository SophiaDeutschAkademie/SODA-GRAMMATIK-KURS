/* SODA GRAMMATIK HAUSAUFGABEN · 단어 뜻 팝업
   - 새 단어는 <span class="wd" data-m="뜻">단어</span> 로 표시되어 있고, 마우스를 올리면 뜻이 작게 나타납니다.
   - 밑줄·링크 표시는 없습니다. 터치 화면에서는 단어를 한 번 누르면 나타나고, 다른 곳을 누르면 사라집니다.
   - 인쇄할 때는 나타나지 않습니다. */
(function () {
  'use strict';
  if (window.__wdTip) return;
  window.__wdTip = true;

  var css = ''
    + '.wd{cursor:inherit;-webkit-tap-highlight-color:transparent}'
    + '#wd-tip{position:fixed;left:0;top:0;z-index:2147482000;max-width:min(260px,calc(100vw - 16px));padding:7px 11px;border-radius:9px;'
    + 'background:#1F2433;color:#fff;font:600 13px/1.45 "Pretendard Variable",Pretendard,"Noto Sans KR",Inter,system-ui,sans-serif;letter-spacing:0;text-transform:none;'
    + 'box-shadow:0 8px 24px rgba(15,18,28,.28);pointer-events:none;opacity:0;visibility:hidden;transform:translateY(3px);transition:opacity .12s ease,transform .12s ease,visibility 0s linear .12s;white-space:normal;word-break:keep-all;overflow-wrap:anywhere}'
    + '#wd-tip.on{opacity:1;visibility:visible;transform:none;transition:opacity .12s ease,transform .12s ease,visibility 0s}'
    + 'html[data-theme="dark"] #wd-tip{background:#E7EAF4;color:#1B1F2B;box-shadow:0 8px 24px rgba(0,0,0,.5)}'
    + '@media print{#wd-tip{display:none!important}}'
    + '@media (prefers-reduced-motion:reduce){#wd-tip{transition:none}}';
  var st = document.createElement('style');
  st.id = 'wd-tip-style';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var tip = null, cur = null, hideT = null, showT = null, lastTouch = 0;

  function ensure() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'wd-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    return tip;
  }

  function place(el) {
    var t = ensure();
    var r = el.getBoundingClientRect();
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    t.style.left = '0px'; t.style.top = '0px';
    var w = t.offsetWidth, h = t.offsetHeight;
    var x = r.left + r.width / 2 - w / 2;
    x = Math.max(8, Math.min(x, vw - w - 8));
    var y = r.top - h - 8;
    if (y < 8) y = r.bottom + 8;
    if (y + h > vh - 8) y = Math.max(8, vh - h - 8);
    t.style.left = Math.round(x) + 'px';
    t.style.top = Math.round(y) + 'px';
  }

  function show(el) {
    var m = el.getAttribute('data-m');
    if (!m) return;
    clearTimeout(hideT); clearTimeout(showT);
    var t = ensure();
    cur = el;
    t.textContent = m;
    place(el);
    t.classList.add('on');
    if (el.getAttribute('aria-describedby') !== 'wd-tip') el.setAttribute('aria-describedby', 'wd-tip');
  }

  function hide() {
    clearTimeout(showT); clearTimeout(hideT);
    if (!tip) return;
    tip.classList.remove('on');
    if (cur) cur.removeAttribute('aria-describedby');
    cur = null;
  }

  function wdOf(e) {
    var n = e.target;
    return n && n.closest ? n.closest('.wd') : null;
  }

  document.addEventListener('mouseover', function (e) {
    if (Date.now() - lastTouch < 700) return;     /* 터치 직후에 생기는 가짜 mouseover 무시 */
    var el = wdOf(e);
    if (!el) return;
    clearTimeout(showT);
    showT = setTimeout(function () { show(el); }, 70);
  }, true);

  document.addEventListener('mouseout', function (e) {
    var el = wdOf(e);
    if (!el) return;
    var to = e.relatedTarget;
    if (to && to.closest && to.closest('.wd') === el) return;
    clearTimeout(showT);
    hideT = setTimeout(hide, 40);
  }, true);

  document.addEventListener('touchstart', function (e) {
    lastTouch = Date.now();
    var el = wdOf(e);
    if (!el) { hide(); return; }
    if (cur === el) { hide(); return; }
    show(el);
    hideT = setTimeout(hide, 3200);
  }, { passive: true, capture: true });

  window.addEventListener('scroll', hide, { passive: true, capture: true });
  window.addEventListener('resize', hide);
  window.addEventListener('beforeprint', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();
