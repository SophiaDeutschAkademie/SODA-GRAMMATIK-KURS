/* SODA GRAMMATIK KURS · 교재 페이지 넘김 보기
   - 핸드폰·작은 태블릿(화면 폭 820px 이하)에서는 교재를 아래로 길게 밀지 않고, 책처럼 한 페이지씩 넘겨 봅니다.
     넓은 화면은 지금처럼 스크롤로 보고, 오른쪽 아래 책 모양 버튼으로 페이지 보기로 바꿀 수 있습니다.
   - 손가락으로 옆으로 밀면 종이가 손가락을 따라 접히며 넘어갑니다. 화면 좌우 가장자리를 눌러도 넘어갑니다.
   - 페이지는 화면 크기와 글자 크기에 맞춰 그때그때 나눕니다. 문단은 줄 단위로, 표·그림·퀴즈는 덩어리 단위로 나눕니다.
     한 화면보다 큰 덩어리만 그 페이지 안에서 위아래로 밀어 봅니다.
   - 보던 자리는 기기에 기억해 두었다가 다시 열면 이어서 보여 줍니다(끝까지 본 과는 처음부터).
   - 교재의 내용(HTML)은 바꾸지 않습니다. 인쇄하거나 스크롤 보기로 돌아가면 원래 모양 그대로 되돌립니다.
   - 주소 끝에 ?view=page / ?view=scroll / ?view=auto 를 붙여 열면 그 기기의 보기 방식을 바꿉니다(auto: 화면 크기에 따라 저절로).
   - 새 Lektion을 추가할 때는 <head>의 theme.js 다음 줄에 <script src="../assets/pager.js"></script>를 넣습니다.
   - 교재를 쓸 때 줄 수 있는 표시: data-pg-keep(절대 나누지 않음), data-pg-avoid(되도록 나누지 않음),
     data-pg-head(다음 덩어리와 같은 페이지에), data-pg-break(이 앞에서 새 페이지),
     data-pg-fit(자리가 조금 모자라면 살짝 줄여서 넣음), data-pg-tap(누르는 것을 페이지 넘김으로 쓰지 않음). */
(function () {
  'use strict';
  if (window.__sodaPager) return;
  window.__sodaPager = true;

  var doc = document, root = doc.documentElement;
  var KEY_VIEW = 'soda-gk-view', KEY_POS = 'soda-gk-pos:', KEY_HINT = 'soda-gk-pg-hint';
  var XHTML = 'http://www.w3.org/1999/xhtml';
  var EPS = 0.5;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* 시험 운영 스위치. true로 두면 주소 끝에 ?view=page를 붙여 한 번 연 기기에서만 켜지고,
     그 밖의 기기에서는 이 파일이 아무 일도 하지 않습니다(학생 화면은 예전 그대로). 모두에게 켤 때 false로 둡니다. */
  var TRIAL = false;

  /* 저장소를 쓸 수 없는 브라우저(앱 안의 미리보기 창 등)에서는, 고른 보기 방식을 페이지를 열어 둔 동안만 기억합니다. */
  var canStore = (function () { try { localStorage.setItem('soda-gk-t', '1'); localStorage.removeItem('soda-gk-t'); return true; } catch (e) { return false; } })();
  var PREF = null;
  function getView() { return canStore ? lsGet(KEY_VIEW) : PREF; }
  function setView(v) { PREF = v; if (v) lsSet(KEY_VIEW, v); else lsDel(KEY_VIEW); }
  /* 주소 끝에 ?view=page / ?view=scroll 을 붙여 열면 그 기기의 보기 방식을 그렇게 정해 둡니다. ?view=auto는 정해 둔 것을 지웁니다. */
  var QV = /[?&]view=(page|scroll|auto)(?:&|$)/.exec(location.search || '');
  if (QV) setView(QV[1] === 'auto' ? null : QV[1]);
  if (TRIAL && getView() === null) return;

  var mq = window.matchMedia ? window.matchMedia('(max-width: 820px) and (min-height: 440px)') : null;
  function wantPage() {
    var v = getView();
    if (v === 'page') return true;
    if (v === 'scroll') return false;
    return !TRIAL && !!(mq && mq.matches);
  }
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* 페이지로 볼 예정이면, 나누기 전의 긴 화면이 잠깐 보이지 않게 가려 둡니다. */
  if (wantPage()) root.classList.add('pg-wait');

  /* ───────────── 모양 ───────────── */
  var CSS = ''
    + 'html.pg-wait main,html.pg-wait .fc,html.pg-wait .sd-home{visibility:hidden}'
    + 'html.pg-wait body::before{content:"";position:fixed;left:0;right:0;top:56px;bottom:48px;background:var(--kffffff,#fff)}'
    + 'html.pg-on{--pg-paper:var(--kffffff,#fff);--pg-desk:var(--keceef2,#ECEEF2);--pg-ink:var(--k6e6e73,#6E6E73);--pg-acc:var(--k384568,#384568);--pg-line:var(--ke3e3e8,#E3E3E8);'
    + '--pg-back:#F3F4F7;--pg-back2:#DDE0E8;--pg-top:56px;--pg-bot:48px}'
    + 'html.pg-on[data-theme="dark"]{--pg-back:#2A2B30;--pg-back2:#17181B}'
    + 'html.pg-on,html.pg-on body{height:100%;overflow:hidden;overscroll-behavior:none}'
    + 'html.pg-on body{margin:0;background:var(--pg-desk)}'
    + 'html.pg-on main{position:fixed;left:0;right:0;top:var(--pg-top);bottom:calc(var(--pg-bot) + env(safe-area-inset-bottom,0px));max-width:none;margin:0;padding:0;overflow:hidden}'
    + 'html.pg-on .fc,html.pg-on .sd-home{display:none!important}'
    + 'html.pg-on .prog-wrap{z-index:120}'
    /* 종이 */
    + '.pg-stage{position:absolute;top:0;bottom:0;left:0;right:0;margin:0 auto;overflow:hidden;background:var(--pg-paper);'
    + '--sec-pad:0px;--sec-bg:transparent;--sec-radius:0px;--sec-margin:0px;--hd-bg:transparent;--hd-radius:0px;--hd-pad:0px;--hd-margin:0px;'
    + 'touch-action:pan-y pinch-zoom;-webkit-tap-highlight-color:transparent}'
    + '.pg-leaf{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;visibility:hidden;z-index:1;background:var(--pg-paper);contain:layout paint}'
    + '.pg-leaf.pg-near{visibility:visible}'
    + '.pg-leaf.pg-cur,.pg-leaf.pg-l{visibility:visible;z-index:2}'
    + '.pg-leaf.pg-u{visibility:visible;z-index:3;will-change:transform}'
    + '.pg-leaf.pg-u>.pg-page{will-change:transform}'
    + '.pg-page{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;background:var(--pg-paper)}'
    + '.pg-page.pg-tall{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}'
    + '.pg-body{display:flow-root;box-sizing:border-box;padding:16px 20px 16px}'
    + '.pg-body>:first-child,.pg-body>section>:first-child,.pg-body [data-pg-cont]>:first-child{margin-top:0!important}'
    + '.pg-body>:last-child:not([data-pg-s]),.pg-body>section>:last-child:not([data-pg-s]){margin-bottom:0!important}'
    + '.pg-body>section{border-top:0;margin-top:0}'
    + '.pg-body>*+section{margin-top:30px}'
    + '.pg-body [data-pg-cont]{counter-increment:none!important}'
    + '.pg-body .callout>div{flex:1 1 auto;align-self:stretch;min-width:0}'
    + '.pg-body .gt .gt-tip::after{margin-left:calc(-1*var(--pg-dx,0px))}'
    + '.pg-body .gt .gt-tip.pg-below{bottom:auto;top:calc(100% + 9px)}'
    + '.pg-body .gt .gt-tip.pg-below::after{top:auto;bottom:100%;border-top-color:transparent;border-bottom-color:var(--k2a3350,#2A3350)}'
    + '.pg-body>.sd-nav{margin-top:28px}'
    + '.pg-leaf.pg-m .qe{display:block!important}'
    + '.pg-more{position:absolute;left:0;right:0;bottom:0;height:46px;pointer-events:none;z-index:4;display:none;align-items:flex-end;justify-content:center;padding-bottom:5px;'
    + 'background:linear-gradient(to bottom,rgba(255,255,255,0),var(--pg-paper) 82%);color:var(--pg-ink)}'
    + '.pg-more svg{width:18px;height:18px;opacity:.8}'
    + '.pg-leaf.pg-more-on>.pg-more{display:flex}'
    /* 넘어가는 종이 */
    + '.pg-fx{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:6;visibility:hidden}'
    + '.pg-turning>.pg-fx{visibility:visible}'
    + '.pg-flap,.pg-s1,.pg-s2{position:absolute;top:0;left:0;height:100%;will-change:transform,opacity}'
    + '.pg-flap{width:100px;transform-origin:0 0;background:linear-gradient(to right,var(--pg-back2) 0,var(--pg-back) 7%,var(--pg-back) 46%,var(--pg-back2) 100%);box-shadow:0 0 0 .5px rgba(0,0,0,.08)}'
    + '.pg-s1{width:54px;background:linear-gradient(to right,rgba(0,0,0,.30),rgba(0,0,0,.10) 38%,rgba(0,0,0,0))}'
    + '.pg-s2{width:34px;background:linear-gradient(to left,rgba(0,0,0,.20),rgba(0,0,0,.06) 45%,rgba(0,0,0,0))}'
    /* 위·아래 띠 */
    + '.pg-top,.pg-bar{position:fixed;left:0;right:0;display:none;align-items:center;z-index:90;background:var(--pg-desk);color:var(--pg-ink);'
    + 'font-family:"Pretendard Variable",Pretendard,"Noto Sans KR",system-ui,sans-serif;-webkit-user-select:none;user-select:none}'
    + 'html.pg-on .pg-top,html.pg-on .pg-bar{display:flex}'
    + '.pg-top{top:0;height:var(--pg-top);padding:0 86px 0 20px}'
    + '.pg-run{display:flex;align-items:baseline;gap:9px;min-width:0;white-space:nowrap}'
    + '.pg-run-k{flex:none;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--pg-acc)}'
    + '.pg-run-t{min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:600}'
    + '.pg-bar{bottom:0;height:var(--pg-bot);box-sizing:content-box;padding:0 8px env(safe-area-inset-bottom,0px);justify-content:space-between}'
    + '.pg-b{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:40px;padding:0 8px;border:0;border-radius:10px;background:transparent;color:var(--pg-ink);'
    + 'font:700 14px/1 inherit;font-family:inherit;cursor:pointer;text-decoration:none;-webkit-tap-highlight-color:transparent}'
    + '.pg-b svg{width:20px;height:20px;flex:none}'
    + '.pg-b:active{background:rgba(127,127,127,.18)}'
    + '.pg-b:focus-visible,.pg-ind:focus-visible{outline:2px solid var(--pg-acc);outline-offset:-2px}'
    + '.pg-b[disabled]{opacity:.28;cursor:default}'
    + '.pg-nav{display:flex;align-items:center;gap:2px}'
    + '.pg-ind{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:76px;height:40px;padding:0 8px;border:0;border-radius:10px;background:transparent;color:var(--pg-ink);'
    + 'font:600 13px/1 inherit;font-family:inherit;font-variant-numeric:tabular-nums;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    + '.pg-ind b,.pg-ind span,.pg-ind i{line-height:1}'
    + '.pg-ind b{font-size:15px;font-weight:800;color:var(--pg-acc)}'
    + '.pg-ind i{font-style:normal;opacity:.5}'
    + '.pg-ind:active{background:rgba(127,127,127,.18)}'
    + '@media (min-width:561px){.pg-top{padding-right:132px}}'
    + '@media (min-width:880px){.pg-stage{max-width:760px;box-shadow:0 0 0 1px var(--pg-line)}}'
    /* 펼침 창 */
    + '.pg-scrim{position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;background:rgba(10,12,18,.36);display:none}'
    + '.pg-sheet,.pg-pop{position:fixed;z-index:201;display:none;background:var(--pg-paper);color:var(--text,#1E1E1E);'
    + 'font-family:"Pretendard Variable",Pretendard,"Noto Sans KR",system-ui,sans-serif;box-shadow:0 -6px 30px rgba(10,12,18,.22)}'
    + '.pg-open{display:block}'
    + '.pg-sheet{left:0;right:0;bottom:0;margin:0 auto;max-width:560px;max-height:72%;overflow:auto;-webkit-overflow-scrolling:touch;border-radius:18px 18px 0 0;padding:6px 0 calc(12px + env(safe-area-inset-bottom,0px))}'
    + '.pg-sheet-h{position:sticky;top:-6px;background:var(--pg-paper);padding:16px 20px 10px;font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--pg-ink)}'
    + '.pg-list button{display:flex;align-items:center;gap:12px;width:100%;padding:11px 20px;border:0;background:transparent;color:inherit;font:inherit;font-size:15px;text-align:left;cursor:pointer}'
    + '.pg-list button:active{background:rgba(127,127,127,.14)}'
    + '.pg-list b{flex:none;min-width:30px;height:26px;padding:0 6px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;background:var(--pg-acc);color:var(--pg-paper)}'
    + '.pg-list span{flex:1;min-width:0;font-weight:600;line-height:1.4;word-break:keep-all}'
    + '.pg-list i{flex:none;font-style:normal;font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--pg-ink)}'
    + '.pg-list .on span{color:var(--pg-acc);font-weight:800}'
    + '.pg-pop{right:8px;bottom:calc(var(--pg-bot) + env(safe-area-inset-bottom,0px) + 8px);width:268px;max-width:calc(100% - 16px);border-radius:16px;padding:8px 16px;box-shadow:0 10px 34px rgba(10,12,18,.26)}'
    + '.pg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:52px;font-size:14px;font-weight:600}'
    + '.pg-row+.pg-row{border-top:1px solid var(--pg-line)}'
    + '.pg-row>div{display:flex;gap:6px}'
    + '.pg-row button{min-width:44px;height:36px;padding:0 12px;border:1px solid var(--pg-line);border-radius:9px;background:transparent;color:inherit;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}'
    + '.pg-row button:active{background:rgba(127,127,127,.16)}'
    + '.pg-row button.on{background:var(--pg-acc);border-color:var(--pg-acc);color:var(--pg-paper)}'
    + '.pg-toast{position:fixed;left:50%;bottom:calc(var(--pg-bot,48px) + env(safe-area-inset-bottom,0px) + 14px);transform:translate(-50%,8px);z-index:150;max-width:calc(100% - 32px);padding:10px 16px;border-radius:999px;'
    + 'background:rgba(28,31,40,.92);color:#fff;font:600 13px/1.45 "Pretendard Variable",Pretendard,"Noto Sans KR",system-ui,sans-serif;text-align:center;word-break:keep-all;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}'
    + '.pg-toast.pg-open{display:block;opacity:1;transform:translate(-50%,0)}'
    + '.fc .fc-page{display:inline-flex;align-items:center;justify-content:center;padding:0}'
    + '.fc .fc-page svg{width:17px;height:17px}'
    + '@media print{.pg-top,.pg-bar,.pg-scrim,.pg-sheet,.pg-pop,.pg-toast,.fc-page,.pg-fx,.pg-more{display:none!important}'
    /* 인쇄 직전에 원래 모양으로 되돌리지만, 그 신호를 주지 않는 브라우저에서도 모든 페이지가 이어서 찍히게 */
    + 'html.pg-on,html.pg-on body{height:auto!important;overflow:visible!important}html.pg-on main,.pg-stage,.pg-leaf,.pg-page{position:static!important;height:auto!important;overflow:visible!important;max-width:none!important;contain:none!important;transform:none!important}'
    + '.pg-leaf{visibility:visible!important}}'
    + '@media (prefers-reduced-motion:reduce){.pg-toast{transition:none}}';

  var st = doc.createElement('style');
  st.id = 'sd-pager-style';
  st.textContent = CSS;
  (doc.head || root).appendChild(st);

  var IC_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.2 12 4.5l8 6.7"/><path d="M6.2 9.8V19h4.1v-5h3.4v5h4.1V9.8"/></svg>';
  var IC_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>';
  var IC_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>';
  var IC_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5 12 15.5l6-6"/></svg>';
  var IC_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.4C10 5.1 7.4 4.7 4.5 5.1v13c2.9-.4 5.5 0 7.5 1.3 2-1.3 4.6-1.7 7.5-1.3v-13c-2.9-.4-5.5 0-7.5 1.3zM12 6.4v13"/></svg>';

  /* ───────────── 상태 ───────────── */
  var S = {
    on: false, main: null, stage: null, fx: null, flap: null, s1: null, s2: null,
    leaves: [], cur: 0, undo: [], orig: null, secs: [], marks: [], tips: [], blocks: [], done: false, failed: false,
    kick: '', lesson: '', sizeW: 0, sizeH: 0, printing: false, ready: false
  };
  var P = null;          /* 페이지를 나누는 동안의 상태 */
  var UI = {};
  var canInert = 'inert' in HTMLElement.prototype;

  var mfn = Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.msMatchesSelector;
  function is(el, sel) { return el.nodeType === 1 && mfn.call(el, sel); }
  function cs(el) { return window.getComputedStyle(el); }
  function px(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function mk(tag, cls) { var e = doc.createElement(tag); if (cls) e.className = cls; return e; }

  /* 다음 덩어리와 떨어지면 안 되는 제목들 */
  var SEL_HEAD = 'thead,h1,h2,h3,h4,h5,h6,.sh,.sub-head,.dgm-cap,.trap-head,.sum-title,.sol-title,.co-badge,.aif-colhead,[data-pg-head]';
  /* 되도록 한 페이지에 통째로 두는 덩어리 */
  var SEL_AVOID = '.dgm,.callout,.trap,.bq,.tbl-wrap,table,.lk-intro,.lk-row,[data-pg-avoid]';
  /* 한 페이지에 들어가기만 하면 절대 나누지 않는 덩어리 */
  var SEL_STRICT = '.ex,.aif-card,.trap-ex,.dgm-row,.fg-step,.brand-bar,.brand-foot,tr';
  /* 한 페이지보다 조금 클 때 살짝 줄여서 통째로 넣는 덩어리(그림·표) */
  var SEL_FIT = '.dgm,.tbl-wrap,[data-pg-fit]';
  var MIN_SCALE = 0.8;
  var RE_ATOM = /^(IMG|PICTURE|VIDEO|AUDIO|CANVAS|IFRAME|OBJECT|EMBED|HR|BR|BUTTON|INPUT|SELECT|TEXTAREA|A|NAV)$/;

  function isAtomic(el) {
    if (el.nodeType !== 1 || el.namespaceURI !== XHTML) return true;
    if (RE_ATOM.test(el.tagName)) return true;
    if (el.tagName === 'TR' && cs(el).display === 'table-row') return true;
    return is(el, '.qi,[data-pg-keep]');
  }
  function isHead(el) { return el.__pgHead != null ? el.__pgHead : is(el, SEL_HEAD); }

  /* ───────────── 재기(측정) 도구 ───────────── */
  var _rng = null;
  function rng() { return _rng || (_rng = doc.createRange()); }
  function vrect(el, disp) {
    if (disp === 'contents') { var r = rng(); r.selectNodeContents(el); return r.getBoundingClientRect(); }
    return el.getBoundingClientRect();
  }
  function lineH(s) { var l = parseFloat(s.lineHeight); return isNaN(l) ? px(s.fontSize) * 1.5 : l; }
  function textRect(T) {
    var r = rng(); r.selectNodeContents(T);
    var b = r.getBoundingClientRect();
    return (b.width > 0 || b.height > 0) ? b : null;
  }
  function charRect(T, i) {
    var r = rng(); r.setStart(T, i); r.setEnd(T, i + 1);
    var list = r.getClientRects();
    for (var k = 0; k < list.length; k++) if (list[k].width > 0) return list[k];
    return null;
  }
  /* i 이후에서 처음으로 화면에 그려진 글자 */
  function probe(T, i, hi) {
    for (; i <= hi; i++) { var r = charRect(T, i); if (r) return { r: r, i: i }; }
    return null;
  }
  function lastShown(T) {
    for (var i = T.length - 1; i >= 0; i--) { var r = charRect(T, i); if (r) return r; }
    return null;
  }
  /* [lo,hi]에서 pred가 참이 되는 첫 글자 위치(글자는 줄 순서대로 놓이므로 이분 탐색) */
  function firstWhere(T, lo, hi, pred) {
    var ans = -1;
    while (lo <= hi) {
      var m = (lo + hi) >> 1, p = probe(T, m, hi);
      if (!p) { hi = m - 1; continue; }
      if (pred(p.r)) { ans = p.i; hi = m - 1; } else { lo = p.i + 1; }
    }
    return ans;
  }
  function hasText(el) {
    for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && /\S/.test(c.data)) return true;
    return false;
  }
  /* 글줄로 채워지는 상자인가(글자나 인라인 요소가 바로 들어 있는가) */
  function hasInline(el) {
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { if (/\S/.test(c.data)) return true; }
      else if (c.nodeType === 1) {
        if (c.tagName === 'BR') return true;
        if (cs(c).display.indexOf('inline') === 0) return true;
      }
    }
    return false;
  }
  function isFlexGrid(disp) { return disp.indexOf('flex') >= 0 || disp.indexOf('grid') >= 0; }

  /* 글줄 안의 조각들을 순서대로: 글자 {t}, 줄바꿈 {br}, 상자 {b} */
  function collectInline(n, out) {
    for (var c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { if (/\S/.test(c.data)) out.push({ t: c }); }
      else if (c.nodeType === 1) {
        if (c.tagName === 'BR') { out.push({ br: c }); continue; }
        if (c.namespaceURI !== XHTML || RE_ATOM.test(c.tagName)) { out.push({ b: c }); continue; }
        var d = cs(c).display;
        if (d === 'none') continue;
        if (d === 'inline' || d === 'contents') collectInline(c, out); else out.push({ b: c });
      }
    }
  }

  function cloneShell(el) {
    var c = el.cloneNode(false);
    if (c.id) c.removeAttribute('id');
    c.setAttribute('data-pg-cont', '');
    c.__pgi = el.__pgi;
    return c;
  }

  /* 그림·표가 남은 자리보다 조금 클 때, 나누지 않고 살짝 줄여서 넣습니다. */
  function shrink(el, avail) {
    var r = el.getBoundingClientRect(), h = r.bottom - r.top;
    if (h <= 0 || avail <= 0) return false;
    var k = avail / h;
    if (k >= 1) return true;
    if (k < MIN_SCALE) return false;
    k = Math.floor(k * 1000 - 2) / 1000;
    var st = el.style, old = el.getAttribute('style'), mb = px(cs(el).marginBottom);
    st.transformOrigin = '50% 0';
    st.transform = 'scale(' + k + ')';
    st.marginBottom = (mb - h * (1 - k)) + 'px';
    el.setAttribute('data-pg-s', '');
    if (el.getBoundingClientRect().bottom > r.top + avail + EPS) { unshrink(el, old); return false; }
    S.undo.push({ css: el, old: old });
    return true;
  }
  function unshrink(el, old) {
    /* style 속성을 한 번 또렷이 써 준 뒤에 지워야, 브라우저가 빈 style=""을 남기지 않습니다. */
    el.setAttribute('style', old === null ? '' : old);
    if (old === null) el.removeAttribute('style');
    el.removeAttribute('data-pg-s');
  }
  function canFit(el, h) { return is(el, SEL_FIT) && h * MIN_SCALE <= P.PH; }
  function inFigure(el) { return !!(el.closest && el.closest('.dgm')); }
  /* 그림 안에서, 아래 내용의 이름표 구실을 하는 짧은 한 줄 */
  function isLabelRow(row, next) {
    if (!next || row.els.length !== 1) return false;
    var e = row.els[0].el, h = row.bottom - row.top;
    if (h > 56 || !hasInline(e)) return false;
    return next.bottom - next.top >= h * 1.3;
  }

  /* 이 덩어리를 통째로 다음 페이지로 넘기는 편이 나은가 (blank: 그러면 이 페이지에 남는 빈자리) */
  function preferWhole(el, h, blank) {
    if (h > P.PH * 0.97) return false;
    if (is(el, SEL_STRICT)) return true;
    var d = cs(el).display;
    var text = !isFlexGrid(d) && hasInline(el);
    if (!text && h <= P.small) return true;
    if (is(el, SEL_AVOID) && blank <= P.blank) return true;
    return false;
  }

  /* ───────────── 자르기 ─────────────
     el은 이미 페이지 안에 놓여 있고, 아래쪽이 lim을 넘습니다.
     lim 위에 들어가는 만큼만 el에 남기고, 나머지를 담은 껍데기(복제)를 돌려줍니다. 나눌 수 없으면 null. */
  function cut(el, lim, minFirst) {
    if (isAtomic(el)) return null;
    var s = cs(el), d = s.display;
    if (d === 'none') return null;
    var inner = lim - px(s.paddingBottom) - px(s.borderBottomWidth);
    var fg = isFlexGrid(d);
    if (fg && hasText(el)) return null;
    var inl = !fg && hasInline(el);
    var once = function (lm) { return inl ? cutInline(el, lm, minFirst, s) : cutRows(el, lm, minFirst); };
    var mark = S.undo.length, rem = once(inner), good = inner, tries = 0, over;
    /* 잘라 낸 뒤에도 남은 조각이 넘칠 수 있습니다(상자 안에 갇힌 아래 여백 등). 넘친 만큼 한도를 낮춰 다시 자릅니다. */
    while (rem && tries++ < 3) {
      over = el.getBoundingClientRect().bottom - lim;
      if (over <= EPS) break;
      undoTo(mark);
      rem = once(inner - over - 0.5);
      if (rem) inner = inner - over - 0.5;
      else {
        /* 더 줄여서는 못 나눕니다. 다음 페이지로 통째로 넘길 수 있으면 그렇게 하고(null), 그럴 수 없을 때만 조금 넘치는 대로 둡니다. */
        if (minFirst === 0) rem = once(good);
        break;
      }
      good = inner;
    }
    return rem;
  }

  function cutRows(el, inner, minFirst) {
    var kids = [], c, i, d;
    for (c = el.firstElementChild; c; c = c.nextElementSibling) {
      var k = cs(c); d = k.display;
      if (d === 'none' || d === 'table-column-group' || d === 'table-column') continue;
      if (k.position === 'absolute' || k.position === 'fixed') return null;   /* 겹쳐 놓은 그림은 통째로 */
      kids.push({ el: c, r: vrect(c, d) });
    }
    if (!kids.length) return null;
    /* 화면에 놓인 모양대로 '줄'로 묶습니다(옆으로 나란한 것은 한 줄). */
    var rows = [], row = null;
    for (i = 0; i < kids.length; i++) {
      var r = kids[i].r, h = r.bottom - r.top;
      if (row) {
        var lap = Math.min(row.bottom, r.bottom) - Math.max(row.top, r.top);  /* 위아래로 겹치는 만큼 */
        if (lap > 1 && lap > 0.3 * Math.min(h, row.bottom - row.top)) {
          row.els.push(kids[i]);
          if (r.top < row.top) row.top = r.top;
          if (r.bottom > row.bottom) row.bottom = r.bottom;
          continue;
        }
        if (r.top < row.top - 1) return null;                                 /* 순서와 위치가 다른 배치 */
      }
      row = { els: [kids[i]], top: r.top, bottom: r.bottom };
      rows.push(row);
    }
    var x = -1;
    for (i = 0; i < rows.length; i++) if (rows[i].bottom > inner + EPS) { x = i; break; }
    if (x < 0) return null;
    var keep = x, sub = null, subOf = null, rw = rows[x], cand = null;
    var fig = inFigure(el);
    var headRow = function (q) {
      var hr = rows[q], all = true;
      for (var z = 0; z < hr.els.length; z++) if (!isHead(hr.els[z].el)) { all = false; break; }
      return all || (fig && isLabelRow(hr, rows[q + 1]));
    };
    /* must: 빈 페이지인데 첫 줄부터 넘칩니다. 다음 페이지로 미뤄도 똑같으니 여기서 어떻게든 나눠야 합니다. */
    var lead = 0;
    while (lead < x && headRow(lead)) lead++;
    var must = minFirst === 0 && lead === x;
    if (must || rw.top < inner - 24) {                                        /* 걸친 줄 안에서 더 나눌 수 있는지 */
      if (rw.els.length === 1) cand = rw.els[0];
      else {
        var over = 0;
        for (i = 0; i < rw.els.length; i++) if (rw.els[i].r.bottom > inner + EPS) { over++; cand = rw.els[i]; }
        if (over !== 1) cand = null;
      }
      if (cand && !isAtomic(cand.el) && (must || !preferWhole(cand.el, cand.r.bottom - cand.r.top, inner - cand.r.top))) {
        sub = cut(cand.el, inner, must ? 0 : P.minIn);
        if (sub) { subOf = cand.el; keep = x + 1; }
      }
    }
    if (!sub) {
      while (keep > 0 && headRow(keep - 1)) keep--;                           /* 제목·이름표만 남기고 끊지 않기 */
      if (keep === 0) {
        if (!must) return null;
        keep = x + 1;                                                         /* 넘치는 첫 줄은 그대로 두고 그 뒤를 넘깁니다 */
        if (keep >= rows.length) return null;
      } else if (minFirst > 0 && rows[keep - 1].bottom - rows[0].top < minFirst) return null;
      /* 그림에서 맨 끝 한두 줄만 넘어가게 되면, 바로 앞 묶음(이름표·구분선)부터 함께 넘겨 덩어리를 지킵니다. */
      if (fig && keep > 1 && keep < rows.length && rows[rows.length - 1].bottom - rows[keep].top < P.PH * 0.3) {
        for (i = keep - 1; i >= 1 && i >= keep - 4; i--) {
          var thin = rows[i].els.length === 1 && rows[i].bottom - rows[i].top <= 3;
          if (thin || isLabelRow(rows[i], rows[i + 1])) {
            var k2 = i;
            while (k2 > 0 && headRow(k2 - 1)) k2--;
            if (k2 > 0 && rows[k2 - 1].bottom - rows[0].top >= P.minIn) keep = k2;
            break;
          }
        }
      }
    }
    var shell = cloneShell(el), n, nx;
    n = keep < rows.length ? rows[keep].els[0].el : null;
    if (sub && rw.els.length === 1) n = subOf.nextSibling;
    while (n) { nx = n.nextSibling; shell.appendChild(n); n = nx; }
    if (sub) shell.insertBefore(sub, shell.firstChild);
    S.undo.push({ a: el, b: shell });
    if (el.tagName === 'TABLE') repeatHead(el, shell);
    return shell;
  }

  /* 표가 다음 페이지로 이어질 때 머리줄을 다시 보여 줍니다. */
  function repeatHead(tbl, shell) {
    for (var c = tbl.firstElementChild; c; c = c.nextElementSibling) {
      if ((c.tagName === 'THEAD' || c.tagName === 'COLGROUP') && cs(c).display !== 'none') {
        var k = c.cloneNode(true);
        k.setAttribute('data-pg-rep', '');
        shell.insertBefore(k, shell.firstChild);
        S.undo.push({ rm: k });
      }
    }
  }

  function startBefore(R, n, el) {
    while (!n.previousSibling && n.parentNode !== el) n = n.parentNode;
    R.setStartBefore(n);
  }
  /* 이모지처럼 두 칸으로 저장되는 글자는 그 가운데에서 끊지 않습니다. */
  function snap(T, i) {
    if (i > 0) {
      var c = T.data.charCodeAt(i), p = T.data.charCodeAt(i - 1);
      if (c >= 0xDC00 && c <= 0xDFFF && p >= 0xD800 && p <= 0xDBFF) return i - 1;
    }
    return i;
  }

  function cutInline(el, inner, minFirst, s) {
    var lh = lineH(s), er = el.getBoundingClientRect();
    var ctop = er.top + px(s.paddingTop) + px(s.borderTopWidth);
    var cbot = er.bottom - px(s.paddingBottom) - px(s.borderBottomWidth);
    var items = [];
    collectInline(el, items);
    var i, it, r, ci = -1;
    /* 글줄 상자는 글자 상자보다 위아래로 조금 더 큽니다(줄 간격의 절반씩). 그만큼을 더해서 넘치는지 봅니다. */
    var lead = function (q) { return Math.max(0, (lh - (q.bottom - q.top)) / 2) + 0.5; };
    var below = function (q) { return q.bottom + lead(q) > inner + EPS; };
    var lead0 = 0.5;
    for (i = 0; i < items.length; i++) {
      if (!items[i].t) continue;
      var p1 = probe(items[i].t, 0, Math.min(items[i].t.length - 1, 40));
      if (p1) { lead0 = lead(p1.r); break; }
    }
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (it.br) continue;
      r = it.b ? it.b.getBoundingClientRect() : textRect(it.t);
      if (r && r.bottom + (it.b ? 0 : lead0) > inner + EPS) { it.r = r; ci = i; break; }
    }
    if (ci < 0) return null;
    it = items[ci];
    var T = null, k = -1, ti = ci;
    if (it.t) {
      T = it.t;
      k = firstWhere(T, 0, T.length - 1, below);
      if (k < 0) {                                     /* 어림값 차이: 이 조각은 다 들어가므로 다음 조각 앞에서 끊습니다 */
        for (i = ci + 1; i < items.length && items[i].br; i++) {}
        if (i >= items.length) return null;
        it = items[i]; ti = i;
        if (it.t) { T = it.t; var p2 = probe(T, 0, T.length - 1); if (!p2) return null; k = p2.i; }
        else it.r = it.b.getBoundingClientRect();
      }
    }
    var pos = null, top = 0, sub = null;
    if (it.b) {
      var must = minFirst === 0 && it.r.top - ctop < lh * 0.5;
      var whole = it.b.parentNode !== el || isAtomic(it.b) || (!must && preferWhole(it.b, it.r.bottom - it.r.top, inner - it.r.top));
      if (!whole && (must || it.r.top < inner - 24)) sub = cut(it.b, inner, must ? 0 : P.minIn);
      if (sub) { pos = { after: it.b }; top = inner; }
      else { pos = { before: it.b }; top = it.r.top; }
    } else {
      top = charRect(T, k).top;
      var onLine = function (q) { return (q.top + q.bottom) / 2 >= top - 0.5; };
      var j = firstWhere(T, 0, k, onLine);
      if (j < 0) j = k;
      var f0 = probe(T, 0, j);
      while (f0 && f0.i === j && ti > 0) {             /* 이 줄이 앞 조각에서 시작했는지 거슬러 올라가기 */
        j = 0;
        var pv = items[ti - 1];
        if (!pv.t) break;
        var lr = lastShown(pv.t);
        if (!lr || !onLine(lr)) break;
        T = pv.t; ti--;
        j = firstWhere(T, 0, T.length - 1, onLine);
        if (j < 0) { j = 0; break; }
        f0 = probe(T, 0, j);
      }
      if (f0 && f0.i === j) j = 0;
      pos = { node: T, off: j };
      var hard = j === 0 && (ti === 0 || !items[ti - 1].t);
      if (!hard) {                                     /* 문장 중간보다는 가까운 줄바꿈(<br>) 뒤에서 끊기 */
        for (i = ti; i > 0; i--) {
          var b4 = items[i - 1];
          if (b4.b) break;
          if (!b4.br) continue;
          var nx = items[i], nr = null;
          if (nx.br) break;
          if (nx.t) { var p0 = probe(nx.t, 0, nx.t.length - 1); nr = p0 ? p0.r : null; }
          else nr = nx.b.getBoundingClientRect();
          if (nr && top - nr.top <= 2.3 * lh + 0.5 && nr.top - ctop >= lh * 0.9) {
            pos = nx.t ? { node: nx.t, off: 0 } : { before: nx.b };
            top = nr.top;
          }
          break;
        }
      }
    }
    var first = top - ctop, rest = cbot - top;
    if (first < lh * 0.5 && !sub) return null;
    if (minFirst > 0 && !sub) {
      if (cbot - ctop < 4.5 * lh) return null;        /* 네 줄 이하의 짧은 글은 나누지 않음 */
      if (first < 1.7 * lh || rest < 1.7 * lh) return null;
    }
    var R = doc.createRange();
    if (pos.after) R.setStartAfter(pos.after);
    else if (pos.before) startBefore(R, pos.before, el);
    else if (pos.off === 0) startBefore(R, pos.node, el);
    else R.setStart(pos.node, snap(pos.node, pos.off));
    if (R.startContainer === el && R.startOffset === 0) return null;
    R.setEnd(el, el.childNodes.length);
    var a = R.startContainer, depth = 0, t1 = a.nodeType === 3 ? a : null;
    for (; a && a !== el; a = a.parentNode) if (a.nodeType === 1) depth++;
    var frag = R.extractContents();
    var shell = cloneShell(el);
    shell.appendChild(frag);
    var pairs = [], o = el.lastChild, c = shell.firstChild;
    for (i = 0; i < depth && o && c && o.nodeType === 1 && c.nodeType === 1; i++) {
      if (c.id) c.removeAttribute('id');
      pairs.push([o, c]); o = o.lastChild; c = c.firstChild;
    }
    var u = { a: el, b: shell, pairs: pairs };
    if (t1 && o === t1 && c && c.nodeType === 3) { u.t1 = t1; u.t2 = c; }
    if (sub) shell.insertBefore(sub, shell.firstChild);
    S.undo.push(u);
    return shell;
  }

  /* ───────────── 페이지 채우기 ───────────── */
  function titleFor(it) {
    if (it.kind === 'sec' && it.sec && it.sec.__pgTitle) return (it.sec.__pgTitle.k ? it.sec.__pgTitle.k + ' · ' : '') + it.sec.__pgTitle.t;
    return it.kind === 'review' ? '복습' : it.kind === 'end' ? '' : S.lesson;
  }
  /* 채우는 중인 페이지(pg-m)에서는 퀴즈 풀이를 펼친 높이로 잽니다. 그래야 답을 누른 뒤에도 그 페이지에 다 들어갑니다. */
  function newLeaf() {
    var prev = S.leaves[S.leaves.length - 1];
    if (prev) prev.leaf.classList.remove('pg-m');
    var leaf = mk('div', 'pg-leaf pg-m'), page = mk('div', 'pg-page'), body = mk('div', 'pg-body'), more = mk('div', 'pg-more');
    more.innerHTML = IC_DOWN;
    page.appendChild(body); leaf.appendChild(page); leaf.appendChild(more);
    leaf.__pgn = S.leaves.length;
    if (canInert) leaf.inert = true; else leaf.setAttribute('aria-hidden', 'true');
    S.stage.insertBefore(leaf, S.fx);
    var it = { leaf: leaf, page: page, body: body, sec: P.sec, kind: P.kind, ids: null, title: '' };
    it.title = titleFor(it);
    page.addEventListener('scroll', function () { moreState(it); }, { passive: true });
    S.leaves.push(it);
    return it;
  }
  function nextPage() {
    P.cur = newLeaf(); P.top = P.cur.body; P.placed = []; P.solid = 0;
  }
  /* 흐름 중간의 페이지 바꿈: 열려 있던 section 껍데기를 새 페이지에 이어 줍니다. */
  function breakPage() {
    var old = P.top, sec = P.sec;
    P.cur = newLeaf(); P.placed = []; P.solid = 0;
    if (sec) {
      if (!old.firstElementChild) { P.cur.body.appendChild(old); P.top = old; }
      else {
        var sh = cloneShell(old);
        S.undo.push({ a: old, b: sh });
        P.cur.body.appendChild(sh);
        P.top = sh;
      }
    } else P.top = P.cur.body;
  }

  /* 넓은 화면(601px 이상)에서 쓰는 열 맞춤(.fx-cols·.fx-cardrows)은 폭이 넘치면 풀어야 합니다.
     교재의 스크립트가 하는 일이지만, 높이를 재기 전에 끝나 있어야 하므로 같은 기준으로 여기서 먼저 해 둡니다. */
  function fxFit(el) {
    var list = [], q = el.querySelectorAll('.fx-cols,.fx-cardrows'), i;
    if (is(el, '.fx-cols,.fx-cardrows')) list.push(el);
    for (i = 0; i < q.length; i++) list.push(q[i]);
    for (i = 0; i < list.length; i++) list[i].classList.remove('fx-off');
    for (i = 0; i < list.length; i++) if (list[i].scrollWidth > list[i].clientWidth + 1) list[i].classList.add('fx-off');
  }
  function place(el) {
    var guard = 0;
    while (el && guard++ < 600) {
      P.top.appendChild(el);
      if (P.wide) fxFit(el);
      var lim = P.LIMIT, r = el.getBoundingClientRect();
      if (r.bottom <= lim + EPS) {
        var hd = isHead(el);
        P.placed.push({ el: el, head: hd });
        if (!hd) P.solid++;
        return;
      }
      var h = r.bottom - r.top, rem = null, room = lim - r.top, fit = canFit(el, h);
      if (fit && room >= h * (P.solid > 0 ? 0.93 : MIN_SCALE) && shrink(el, room)) {
        P.placed.push({ el: el, head: false }); P.solid++;
        return;
      }
      if (P.solid > 0) {
        var whole = isAtomic(el) || preferWhole(el, h, room) || (fit && room <= P.PH * 0.62);
        if (!whole) rem = cut(el, lim, P.minTop);
        if (rem) { P.placed.push({ el: el, head: false }); P.solid++; breakPage(); el = rem; continue; }
        /* 통째로 다음 페이지로. 바로 위의 제목도 함께 데려갑니다. */
        P.top.removeChild(el);
        var carry = [], q;
        while (P.placed.length) {
          q = P.placed[P.placed.length - 1];
          if (!q.head || q.el.parentNode !== P.top) break;
          carry.unshift(P.placed.pop().el);
        }
        for (var i = 0; i < carry.length; i++) P.top.removeChild(carry[i]);
        breakPage();
        for (i = 0; i < carry.length; i++) { P.top.appendChild(carry[i]); P.placed.push({ el: carry[i], head: true }); }
        continue;
      }
      /* 빈 페이지(또는 제목만 있는 페이지)인데도 넘칩니다: 여기서 나누거나, 못 나누면 그대로 둡니다(그 페이지만 위아래로 밀어 봄). */
      rem = cut(el, lim, 0);
      /* 나누고도 남은 조각이 넘치면(큰 그림 한 장 등) 살짝 줄여서 맞춥니다. */
      if (is(el, SEL_FIT)) { var r2 = el.getBoundingClientRect(); if (r2.bottom > lim + EPS) shrink(el, lim - r2.top); }
      P.placed.push({ el: el, head: false }); P.solid++;
      if (rem) { breakPage(); el = rem; continue; }
      return;
    }
  }

  function textOf(el) {
    if (!el) return '';
    var c = el.cloneNode(true), junk = c.querySelectorAll('.gt-tip,script,style'), i;
    for (i = 0; i < junk.length; i++) junk[i].parentNode.removeChild(junk[i]);
    return (c.textContent || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  }

  /* 나누기 준비: 첫 페이지를 만들고 종이 크기를 재고, 할 일을 순서대로 적어 둡니다.
     할 일 종류 k — 0: 글자 조각, 1: main 바로 아래 덩어리, 2: section 시작, 3: section 안의 덩어리, 4: section 끝 */
  function setupPagination() {
    var stage = S.stage, i, n, c, kids, bi = 0, tasks = [], nodes = S.orig;
    S.leaves = []; S.undo = []; S.marks = [{ el: null, k: '', t: '표지' }]; S.secs = []; S.blocks = []; S.done = false;
    P = { sec: null, kind: 'title', seenSec: false, afterSec: false, first: null, last: -1, ti: 0 };
    var cur = newLeaf();
    var pr = cur.page.getBoundingClientRect(), bs = cs(cur.body);
    var padT = px(bs.paddingTop), padB = px(bs.paddingBottom);
    var PH = cur.page.clientHeight - padT - padB;
    P.cur = cur; P.top = cur.body; P.placed = []; P.solid = 0;
    P.PH = PH; P.LIMIT = pr.top + padT + PH;
    P.small = PH * 0.36; P.blank = PH * 0.5;
    P.minTop = Math.max(84, PH * 0.17); P.minIn = Math.max(56, PH * 0.12);
    S.sizeW = stage.clientWidth; S.sizeH = stage.clientHeight;
    P.wide = (window.innerWidth || root.clientWidth) >= 601;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n.nodeType !== 1) { tasks.push({ k: 0, n: n }); continue; }
      if (n.tagName !== 'SECTION') { S.blocks[bi] = n; n.__pgi = bi++; tasks.push({ k: 1, n: n }); continue; }
      kids = [];
      for (c = n.firstChild; c; c = c.nextSibling) {
        kids.push(c);
        if (c.nodeType !== 1) continue;
        S.blocks[bi] = c; c.__pgi = bi++;                           /* 자리 기억용 번호 */
        /* 표 바로 위의 범례는 표와 같은 페이지에 */
        if (is(c, '.klegend')) c.__pgHead = !!(c.nextElementSibling && is(c.nextElementSibling, '.tbl-wrap,table'));
      }
      n.__pgKids = kids;
      tasks.push({ k: 2, n: n });
      for (c = 0; c < kids.length; c++) tasks.push({ k: 3, n: kids[c] });
      tasks.push({ k: 4, n: n });
    }
    P.tasks = tasks;
  }

  function runTask(t) {
    var n = t.n, k, kids, room;
    if (t.k === 0) { P.cur.body.appendChild(n); return; }
    if (t.k === 3) {
      if (n.nodeType !== 1) { P.top.appendChild(n); return; }
      if (!P.first) { P.first = n; S.marks[S.marks.length - 1].el = n; }
      if (P.solid > 0 && n.hasAttribute('data-pg-break')) breakPage();
      place(n); P.last = n.__pgi;
      return;
    }
    if (t.k === 4) { P.sec = null; P.top = P.cur.body; P.afterSec = true; return; }
    if (t.k === 2) {
      P.seenSec = true;
      kids = n.__pgKids;
      for (k = 0; k < kids.length; k++) if (kids[k].parentNode === n) n.removeChild(kids[k]);
      S.secs.push(n);
      n.__pgTitle = secInfo(n, kids);
      /* 큰 갈래(오늘 정리·부록·정답)는 새 페이지에서, 나머지는 자리가 넉넉하면 앞 내용에 이어서 시작합니다. */
      var major = (!!n.id && /^(summary|appendix|solutions)$/.test(n.id)) || n.hasAttribute('data-pg-break') || P.kind !== 'sec';
      P.sec = n; P.kind = 'sec';
      if (P.placed.length) {
        room = P.LIMIT - P.placed[P.placed.length - 1].el.getBoundingClientRect().bottom;
        if (major || room < P.PH * 0.42) nextPage();
      } else { P.cur.sec = n; P.cur.kind = 'sec'; P.cur.title = titleFor(P.cur); }
      P.cur.body.appendChild(n); P.top = n; P.first = null;
      S.marks.push({ el: null, k: n.__pgTitle.k, t: n.__pgTitle.t });
      return;
    }
    var brk = n.hasAttribute('data-pg-break');
    if (!P.seenSec && is(n, '.sub-head')) {                         /* 지난 과 복습 퀴즈 */
      brk = true; P.kind = 'review';
      S.marks.push({ el: n, k: '복습', t: textOf(n.querySelector('.sub-title')) || '복습 퀴즈' });
    } else if (P.afterSec) {
      brk = true; P.kind = 'end'; P.afterSec = false;
      S.marks.push({ el: n, k: '', t: '마무리 · 다음 Lektion' });
    }
    if (brk && P.placed.length) nextPage();
    else if (brk) { P.cur.kind = P.kind; P.cur.title = titleFor(P.cur); }
    place(n); P.last = n.__pgi;
  }

  /* stop()이 참이 될 때까지(없으면 끝까지) 나눕니다. 다 나눴으면 true. */
  function runUntil(stop) {
    if (S.done || !P) return true;
    while (P.ti < P.tasks.length) {
      if (stop && stop()) return false;
      runTask(P.tasks[P.ti++]);
    }
    var last = S.leaves[S.leaves.length - 1];
    last.leaf.classList.remove('pg-m');
    if (S.leaves.length > 1 && !last.body.firstElementChild) {      /* 빈 마지막 페이지 지우기 */
      while (last.body.firstChild) S.leaves[S.leaves.length - 2].body.appendChild(last.body.firstChild);
      S.stage.removeChild(last.leaf); S.leaves.pop();
    }
    S.done = true; P = null;
    return true;
  }
  /* 다 채워서 보여 줄 수 있는 페이지 수(나누는 중에는 마지막 한 장이 아직 채우는 중) */
  function avail() { return S.done ? S.leaves.length : Math.max(0, S.leaves.length - 1); }
  /* p번째 페이지까지는 지금 바로 만들어 둡니다. */
  function ensure(p) {
    if (S.done || p < avail()) return;
    runUntil(function () { return avail() > p; });
  }

  /* 나머지 페이지는 화면이 한가할 때 조금씩 나눕니다(첫 페이지를 빨리 보여 주기 위해). */
  var bgT = 0;
  function bgStop() { if (bgT) { clearTimeout(bgT); bgT = 0; } }
  function bgStart() {
    bgStop();
    if (S.on && !S.done) bgT = setTimeout(bgTick, 40);
  }
  function bgTick() {
    bgT = 0;
    if (!S.on || S.done || !P) return;
    if (T.on || (G && G.lock === 1)) { bgT = setTimeout(bgTick, 120); return; }   /* 넘기는 동안은 쉽니다 */
    var t0 = now(), n0 = avail();
    try { runUntil(function () { return now() - t0 > 12; }); }
    catch (err) { fail(err); return; }
    if (S.done || avail() !== n0) { if (S.ready && !T.on) show(S.cur, true); }
    if (!S.done) bgT = setTimeout(bgTick, 16);
  }
  function fail(err) {
    if (window.console && console.error) console.error('[pager]', err);
    S.failed = true; S.on = true;
    exitPage();
  }

  function secInfo(sec, kids) {
    var k = '', t = '', i, c, q;
    for (i = 0; i < kids.length && !t; i++) {
      c = kids[i];
      if (c.nodeType !== 1) continue;
      if (is(c, '.sh')) { k = textOf(c.querySelector('.sl')); t = textOf(c.querySelector('h2')) || textOf(c); }
      else if (is(c, 'h1,h2,h3')) t = textOf(c);
      else { q = c.querySelector('.sum-title,.sol-title,h2,h3'); if (q) t = textOf(q); }
      break;
    }
    if (!t) t = sec.id === 'summary' ? '오늘 정리' : sec.id === 'solutions' ? '정답' : sec.id === 'appendix' ? '부록' : '';
    return { k: k, t: t };
  }

  /* 페이지 안에 다 안 들어가는 덩어리가 있으면 그 페이지만 위아래로 밀 수 있게 */
  function tallState(it) {
    /* 마지막 덩어리의 아래쪽 끝이 종이 아래 여백을 넘는지 봅니다(끝에 붙은 바깥 여백은 세지 않음). */
    var last = it.body.lastElementChild, over = 0;
    if (last && last.tagName === 'SECTION' && last.lastElementChild) last = last.lastElementChild;
    if (last) {
      var pr = it.page.getBoundingClientRect();
      over = last.getBoundingClientRect().bottom - pr.top + it.page.scrollTop - (it.page.clientHeight - px(cs(it.body).paddingBottom));
    }
    var tall = over > 3;
    if (tall !== !!it.tall) {
      it.tall = tall;
      if (tall) it.page.classList.add('pg-tall'); else { it.page.classList.remove('pg-tall'); it.page.scrollTop = 0; }
    }
    moreState(it);
  }
  function moreState(it) {
    var on = !!it.tall && it.page.scrollTop + it.page.clientHeight < it.page.scrollHeight - 6;
    if (on !== !!it.more) { it.more = on; if (on) it.leaf.classList.add('pg-more-on'); else it.leaf.classList.remove('pg-more-on'); }
  }

  /* ───────────── 되돌리기 ───────────── */
  /* 나눈 기록을 뒤에서부터 mark까지 되돌립니다(나눈 조각을 원래 덩어리에 다시 붙임). */
  function undoTo(mark) {
    var j, u, a, b;
    while (S.undo.length > mark) {
      u = S.undo.pop();
      if (u.rm) { if (u.rm.parentNode) u.rm.parentNode.removeChild(u.rm); continue; }
      if (u.css) { unshrink(u.css, u.old); continue; }
      a = u.a; b = u.b;
      while (b.firstChild) a.appendChild(b.firstChild);
      if (b.parentNode) b.parentNode.removeChild(b);
      if (u.pairs) {
        for (j = 0; j < u.pairs.length; j++) {
          var o = u.pairs[j][0], c = u.pairs[j][1];
          while (c.firstChild) o.appendChild(c.firstChild);
          if (c.parentNode) c.parentNode.removeChild(c);
        }
      }
      if (u.t1 && u.t2 && u.t2.parentNode) { u.t1.appendData(u.t2.data); u.t2.parentNode.removeChild(u.t2); }
    }
  }
  function undoAll() {
    var i, j;
    undoTo(0);
    /* 맨 위 두 단계는 원래 순서 그대로 다시 놓아 확실히 맞춥니다. */
    for (i = 0; i < S.secs.length; i++) {
      var kids = S.secs[i].__pgKids;
      if (kids) for (j = 0; j < kids.length; j++) S.secs[i].appendChild(kids[j]);
    }
  }
  /* 모든 페이지를 걷어 내고 원래 덩어리들을 holder에 순서대로 모읍니다. */
  function gather(holder) {
    resetTips();
    undoAll();
    for (var i = 0; i < S.orig.length; i++) holder.appendChild(S.orig[i]);
    for (i = 0; i < S.leaves.length; i++) if (S.leaves[i].leaf.parentNode) S.leaves[i].leaf.parentNode.removeChild(S.leaves[i].leaf);
    S.leaves = [];
  }

  /* ───────────── 자리 기억 ───────────── */
  function posKey() {
    var m = /([^\/]+?)(\.html?)?$/.exec(location.pathname.replace(/\/+$/, ''));
    return KEY_POS + (m ? m[1] : 'lektion');
  }
  /* 한 페이지에 놓인 맨 위 덩어리들의 번호 */
  function leafIds(it) {
    if (it.ids) return it.ids;
    var ids = [], b, e;
    for (b = it.body.firstElementChild; b; b = b.nextElementSibling) {
      if (b.tagName === 'SECTION') { for (e = b.firstElementChild; e; e = e.nextElementSibling) if (e.__pgi != null) ids.push(e.__pgi); }
      else if (b.__pgi != null) ids.push(b.__pgi);
    }
    if (S.done || it !== S.leaves[S.leaves.length - 1]) it.ids = ids;
    return ids;
  }
  function hasId(ids, v) { for (var i = 0; i < ids.length; i++) if (ids[i] === v) return true; return false; }
  /* 자리 = 그 페이지 맨 위 덩어리의 번호 + 그 덩어리가 여러 페이지에 걸칠 때 몇 번째 장인지 */
  function anchorOf(p) {
    var it = S.leaves[p];
    if (!it) return null;
    var ids = leafIds(it);
    if (!ids.length) return null;
    var i = ids[0], a = p, b = p, n = avail();
    while (a > 0 && hasId(leafIds(S.leaves[a - 1]), i)) a--;
    while (b < n - 1 && hasId(leafIds(S.leaves[b + 1]), i)) b++;
    return { i: i, o: p - a, n: b - a + 1 };
  }
  function pageOfAnchor(a) {
    if (!a) return 0;
    var n = avail(), p, first = -1, last = -1, best = 0, ids;
    for (p = 0; p < n; p++) {
      ids = leafIds(S.leaves[p]);
      if (!ids.length) continue;
      if (hasId(ids, a.i)) { if (first < 0) first = p; last = p; }
      else if (first >= 0) break;
      if (ids[0] <= a.i) best = p;                    /* 그 덩어리가 없으면 가장 가까운 앞 덩어리 */
    }
    if (first < 0) return best;
    var len = last - first + 1, k = a.n > 0 ? Math.floor(a.o / a.n * len) : 0;
    return first + Math.max(0, Math.min(len - 1, k));
  }
  /* 기억해 둔 자리가 들어 있는 페이지가 다 만들어졌는가 */
  function reached(a) {
    if (!a) return S.leaves.length >= 2;
    if (P.last <= a.i) return false;
    return !hasId(leafIds(S.leaves[S.leaves.length - 1]), a.i);
  }
  function savePos() {
    if (!S.ready) return;
    if (S.done && S.cur >= S.leaves.length - 1 && S.leaves.length > 1) { lsDel(posKey()); return; }   /* 끝까지 봤으면 다음엔 처음부터 */
    var a = anchorOf(S.cur);
    if (a) lsSet(posKey(), JSON.stringify(a));
  }
  function loadPos() {
    try { var a = JSON.parse(lsGet(posKey()) || 'null'); return a && typeof a.i === 'number' ? a : null; } catch (e) { return null; }
  }

  /* ───────────── 보여 주기 ───────────── */
  function show(p, quiet) {
    var n = avail(), i;
    if (n < 1) return;
    p = Math.max(0, Math.min(n - 1, p));
    var changed = p !== S.cur;
    for (i = 0; i < S.leaves.length; i++) {
      var lf = S.leaves[i].leaf, st = lf.style;
      lf.classList.remove('pg-u'); lf.classList.remove('pg-l');
      if (st.transform) st.transform = '';
      if (S.leaves[i].page.style.transform) S.leaves[i].page.style.transform = '';
      if (i === p) lf.classList.add('pg-cur'); else lf.classList.remove('pg-cur');
      if ((i === p - 1 || i === p + 1) && i < n) lf.classList.add('pg-near'); else lf.classList.remove('pg-near');
      if (canInert) lf.inert = i !== p; else if (i === p) lf.removeAttribute('aria-hidden'); else lf.setAttribute('aria-hidden', 'true');
    }
    S.cur = p;
    if (changed || !quiet) {
      S.leaves[p].page.scrollTop = 0;
      closeTips();
    }
    tallState(S.leaves[p]);
    updateUI();
    savePos();
  }
  /* 교재의 용어 풀이 말풍선은 창을 스크롤하면 닫히도록 되어 있어, 같은 신호를 보내 닫습니다. */
  function closeTips() {
    var a = doc.activeElement;
    if (a && a !== doc.body && S.stage && S.stage.contains(a) && a.blur) a.blur();
    try {
      var ev;
      if (typeof Event === 'function') ev = new Event('scroll'); else { ev = doc.createEvent('Event'); ev.initEvent('scroll', false, false); }
      window.dispatchEvent(ev);
    } catch (e) {}
  }
  /* 1·2과의 용어 풀이 말풍선(CSS로 뜨는 것)이 종이 가장자리에서 잘리지 않게 옆으로 밀거나 아래로 뒤집습니다. */
  function fixTip(g) {
    var tip = g.querySelector ? g.querySelector('.gt-tip') : null;
    if (!tip || !S.stage) return;
    var i, known = false;
    for (i = 0; i < S.tips.length; i++) if (S.tips[i].el === tip) { known = true; break; }
    if (!known) S.tips.push({ el: tip, old: tip.getAttribute('style') });
    tip.style.removeProperty('--pg-dx'); tip.style.marginLeft = ''; tip.classList.remove('pg-below');
    var r = tip.getBoundingClientRect();
    if (!r.width) return;
    var b = S.stage.getBoundingClientRect(), dx = 0;
    if (r.left < b.left + 8) dx = b.left + 8 - r.left; else if (r.right > b.right - 8) dx = b.right - 8 - r.right;
    if (dx) { tip.style.setProperty('--pg-dx', dx + 'px'); tip.style.marginLeft = dx + 'px'; }
    if (r.top < b.top + 4) tip.classList.add('pg-below');
  }
  function onTipEvent(e) {
    var g = e.target && e.target.closest ? e.target.closest('.gt') : null;
    if (g) fixTip(g);
  }
  function resetTips() {
    for (var i = 0; i < S.tips.length; i++) {
      var t = S.tips[i];
      t.el.classList.remove('pg-below');
      t.el.setAttribute('style', t.old === null ? '' : t.old);
      if (t.old === null) t.el.removeAttribute('style');
    }
    S.tips = [];
  }
  function tipOpen() {
    var ids = ['gtip', 'gtt', 'tt'], i, t;
    for (i = 0; i < ids.length; i++) { t = doc.getElementById(ids[i]); if (t && t.style.display === 'block') return true; }
    var a = doc.activeElement;
    return !!(a && is(a, '.gt') && a.querySelector('.gt-tip'));
  }
  function updateUI() {
    var n = S.leaves.length, it = S.leaves[S.cur];
    UI.now.textContent = S.cur + 1; UI.all.textContent = S.done ? n : '…';
    UI.prev.disabled = S.cur <= 0; UI.next.disabled = S.done && S.cur >= n - 1;
    UI.runK.textContent = S.kick; UI.runT.textContent = it ? it.title : '';
    UI.ind.setAttribute('aria-label', (S.done ? n + '페이지 중 ' : '') + (S.cur + 1) + '페이지 · 이 과의 차례 열기');
    var pg = doc.getElementById('prog');
    if (pg) pg.style.width = (S.done ? (n > 1 ? S.cur / (n - 1) * 100 : 100) : 0) + '%';
  }

  /* ───────────── 넘기는 움직임 ─────────────
     f = 접힌 선의 가로 위치(0…W). 위 종이(U)는 0…f만 보이고, 그 오른쪽에 아래 종이(L)가 드러납니다.
     다음 페이지로: f가 W→0, 이전 페이지로: f가 0→W. 모두 transform만 써서 손가락을 놓치지 않게 합니다. */
  var T = { on: false, dir: 0, to: 0, f: 0, W: 0, U: null, L: null, raf: 0, done: null };
  var CURL = 0.62, CURL_MAX = 0.26;

  function beginTurn(dir) {
    var to = S.cur + dir;
    if (to < 0) return false;
    finishTurn();
    if (!S.done && to >= avail()) { try { ensure(to); } catch (err) { fail(err); return false; } }
    if (to >= avail()) return false;
    T.dir = dir; T.to = to; T.W = S.stage.clientWidth;
    T.U = dir > 0 ? S.leaves[S.cur] : S.leaves[to];
    T.L = dir > 0 ? S.leaves[to] : S.leaves[S.cur];
    T.U.page.scrollTop = dir > 0 ? T.U.page.scrollTop : 0;
    if (dir > 0) T.L.page.scrollTop = 0;
    T.U.leaf.classList.add('pg-u'); T.L.leaf.classList.add('pg-l');
    S.stage.classList.add('pg-turning');
    T.on = true; T.f = dir > 0 ? T.W : 0;
    render(T.f);
    return true;
  }
  function render(f) {
    var W = T.W;
    if (f < 0) f = 0; else if (f > W) f = W;
    var wf = Math.min((W - f) * CURL, W * CURL_MAX), e = f - wf;
    var a = Math.min(1, wf / 26) * Math.min(1, (W - f) / 40);
    T.U.leaf.style.transform = 'translate3d(' + (f - W) + 'px,0,0)';
    T.U.page.style.transform = 'translate3d(' + (W - f) + 'px,0,0)';
    S.flap.style.transform = 'translate3d(' + e + 'px,0,0) scaleX(' + (wf / 100) + ')';
    S.s1.style.transform = 'translate3d(' + f + 'px,0,0)';
    S.s1.style.opacity = a;
    S.s2.style.transform = 'translate3d(' + (e - 34) + 'px,0,0)';
    S.s2.style.opacity = a;
  }
  function endTurn(commit) {
    if (T.raf) { cancelAnimationFrame(T.raf); T.raf = 0; }
    if (!T.on) return;
    T.on = false; T.done = null;
    S.stage.classList.remove('pg-turning');
    show(commit ? T.to : S.cur, !commit);
  }
  /* 진행 중인 넘김을 바로 끝냅니다(다음 입력이 밀리지 않게). */
  function finishTurn() {
    if (!T.on) return;
    endTurn(T.done === null ? false : T.done);
  }
  function animateTo(target, ms, commit) {
    T.done = commit;
    if (T.raf) cancelAnimationFrame(T.raf);
    if (reduceMotion || ms <= 0) { endTurn(commit); return; }
    var from = T.f, t0 = 0;
    function step(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / ms;
      if (t >= 1) { T.raf = 0; endTurn(commit); return; }
      var k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      T.f = from + (target - from) * k;
      render(T.f);
      T.raf = requestAnimationFrame(step);
    }
    T.raf = requestAnimationFrame(step);
  }
  function settle(commit, fast) {
    var W = T.W, target = commit ? (T.dir > 0 ? 0 : W) : (T.dir > 0 ? W : 0);
    var dist = Math.abs(target - T.f) / W;
    var ms = Math.max(140, Math.min(380, dist * (fast ? 300 : 420)));
    T.done = commit;
    if (T.raf) cancelAnimationFrame(T.raf);
    if (reduceMotion) { endTurn(commit); return; }
    var from = T.f, t0 = 0;
    function step(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / ms;
      if (t >= 1) { T.raf = 0; endTurn(commit); return; }
      T.f = from + (target - from) * (1 - Math.pow(1 - t, 3));
      render(T.f);
      T.raf = requestAnimationFrame(step);
    }
    T.raf = requestAnimationFrame(step);
  }
  function turn(dir) {
    if (!S.on || !S.ready) return;
    if (T.on) finishTurn();
    if (!beginTurn(dir)) return;
    animateTo(dir > 0 ? 0 : T.W, 460, true);
  }
  function go(p) {
    if (!S.on || !S.ready) return;
    finishTurn();
    try { if (p === Infinity) runUntil(null); else ensure(p); } catch (err) { fail(err); return; }
    show(p === Infinity ? S.leaves.length - 1 : p);
  }

  /* ───────────── 손가락·마우스·키보드 ───────────── */
  var G = null, lastTouch = 0, lastDrag = 0;
  function now() { return Date.now(); }
  function zoomed() { var v = window.visualViewport; return !!(v && v.scale > 1.02); }
  /* 가로로 밀 수 있는 표 안에서 시작한 손짓은 표를 미는 데 씁니다. */
  function xScroller(t) {
    for (; t && t !== S.stage && t.nodeType === 1; t = t.parentNode) {
      if (t.scrollWidth > t.clientWidth + 1) {
        var o = cs(t).overflowX;
        if (o === 'auto' || o === 'scroll') return t;
      }
    }
    return null;
  }
  function onTS(e) {
    if (!S.on || !S.ready) return;
    if (e.touches.length !== 1 || zoomed()) { cancelDrag(); G = null; return; }
    var t = e.touches[0];
    lastTouch = now();
    if (T.on && T.raf) finishTurn();
    G = { x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY, lock: 0, tip: tipOpen(), xs: xScroller(e.target), pts: [], left: S.stage.getBoundingClientRect().left };
  }
  function onTM(e) {
    if (!G) return;
    if (e.touches.length !== 1) { cancelDrag(); G = null; return; }
    var t = e.touches[0], dx = t.clientX - G.x0, dy = t.clientY - G.y0;
    G.x = t.clientX; G.y = t.clientY;
    if (G.lock === 0) {
      var ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax > 9 && ax > ay * 1.15) {
        var dir = dx < 0 ? 1 : -1, xs = G.xs;
        if (xs && ((dir > 0 && xs.scrollLeft + xs.clientWidth < xs.scrollWidth - 1) || (dir < 0 && xs.scrollLeft > 1))) { G.lock = 3; return; }
        if (beginTurn(dir)) { G.lock = 1; G.dir = dir; G.sx = t.clientX - G.left; }
        else G.lock = 2;
      } else if (ay > 9) G.lock = 2;
      else return;
    }
    if (G.lock === 1) {
      if (e.cancelable) e.preventDefault();
      var W = T.W, x = t.clientX - G.left, f;
      if (G.dir > 0) f = W + (x - G.sx) * (W / Math.max(G.sx, W * 0.4));
      else f = (x - G.sx) * (W / Math.max(W - G.sx, W * 0.4));
      T.f = Math.max(0, Math.min(W, f));
      G.pts.push({ t: now(), x: t.clientX });
      if (G.pts.length > 6) G.pts.shift();
      if (!T.raf) T.raf = requestAnimationFrame(function () { T.raf = 0; if (T.on) render(T.f); });
    } else if (G.lock === 2) {
      /* 위아래 손짓: 긴 페이지가 아니면 화면이 출렁이거나 새로고침되지 않게 막습니다. */
      var pg = S.leaves[S.cur];
      if (pg && !pg.tall && e.cancelable) e.preventDefault();
    }
  }
  function onTE() {
    if (!G) return;
    lastTouch = now();
    if (G.lock === 1 && T.on) {
      lastDrag = now();
      if (T.raf) { cancelAnimationFrame(T.raf); T.raf = 0; }
      var p = G.pts, v = 0;
      if (p.length > 1) { var a = p[0], b = p[p.length - 1]; if (b.t > a.t) v = (b.x - a.x) / (b.t - a.t); }
      var moved = G.dir > 0 ? (T.W - T.f) / T.W : T.f / T.W;
      var commit = G.dir > 0 ? (v < -0.28 || (moved > 0.34 && v < 0.12)) : (v > 0.28 || (moved > 0.34 && v > -0.12));
      settle(commit, Math.abs(v) > 0.6);
    } else if (G.lock !== 0) lastDrag = now();
    G = G.lock === 0 ? G : null;
  }
  function cancelDrag() {
    if (G && G.lock === 1 && T.on) { if (T.raf) { cancelAnimationFrame(T.raf); T.raf = 0; } settle(false, true); }
  }
  function onTC() { cancelDrag(); G = null; }

  function interactive(t) {
    for (; t && t !== S.stage && t.nodeType === 1; t = t.parentNode) {
      if (is(t, 'a,button,input,select,textarea,label,summary,audio,video,[role="button"],[tabindex],[onclick],.qo,.gt,.term,[data-pg-tap]')) return true;
      var c = cs(t).cursor;
      if (c === 'pointer' || c === 'help') return true;
    }
    return false;
  }
  /* 화면 좌우 가장자리를 톡 누르면 넘어갑니다(손가락으로 눌렀을 때만). */
  function onClick(e) {
    if (!S.on || !S.ready) return;
    var byTouch = now() - lastTouch < 700, g = G;
    G = null;
    if (byTouch && !(g && g.tip) && now() - lastDrag > 350 && !interactive(e.target)) {
      var sel = window.getSelection ? String(window.getSelection()) : '';
      if (!sel) {
        var r = S.stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
        if (x >= 0.76) { turn(1); return; }
        if (x <= 0.24) { turn(-1); return; }
      }
    }
    /* 퀴즈 풀이가 펼쳐져 페이지가 길어졌으면, 그 페이지를 위아래로 밀 수 있게 하고 풀이가 보이도록 내립니다. */
    var qi = e.target.closest ? e.target.closest('.qi') : null;
    setTimeout(function () {
      var it = S.on ? S.leaves[S.cur] : null;
      if (!it) return;
      tallState(it);
      if (it.tall && qi && it.body.contains(qi)) {
        var a = qi.getBoundingClientRect(), b = it.page.getBoundingClientRect();
        if (a.bottom > b.bottom - 12) it.page.scrollTop += a.bottom - b.bottom + 16;
        moreState(it);
      }
    }, 0);
  }
  function onKey(e) {
    if (!S.on || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    var k = e.key;
    if (UI.open) { if (k === 'Escape' || k === 'Esc') closePanels(); return; }
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey && !(t && t.tagName === 'BUTTON'))) { turn(1); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { turn(-1); e.preventDefault(); }
    else if (k === 'Home') { go(0); e.preventDefault(); }
    else if (k === 'End') { go(Infinity); e.preventDefault(); }
  }
  var wheelAt = 0;
  function onWheel(e) {
    if (!S.on || UI.open || e.ctrlKey) return;
    var pg = S.leaves[S.cur], d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12) return;
    if (pg && pg.tall && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      var p = pg.page;
      if (d > 0 && p.scrollTop + p.clientHeight < p.scrollHeight - 2) return;
      if (d < 0 && p.scrollTop > 2) return;
    }
    e.preventDefault();
    if (now() - wheelAt < 420) return;
    wheelAt = now();
    turn(d > 0 ? 1 : -1);
  }

  /* ───────────── 띠와 펼침 창 ───────────── */
  function buildChrome() {
    var top = mk('div', 'pg-top');
    top.setAttribute('data-no-print', '');
    top.innerHTML = '<span class="pg-run"><b class="pg-run-k"></b><span class="pg-run-t"></span></span>';
    var bar = mk('div', 'pg-bar');
    bar.setAttribute('data-no-print', '');
    bar.innerHTML = '<a class="pg-b pg-home" aria-label="목차로 돌아가기" title="목차로 돌아가기">' + IC_HOME + '</a>'
      + '<div class="pg-nav"><button type="button" class="pg-b pg-prev" aria-label="이전 페이지">' + IC_L + '</button>'
      + '<button type="button" class="pg-ind"><b class="pg-now">1</b><i>/</i><span class="pg-all">1</span></button>'
      + '<button type="button" class="pg-b pg-next" aria-label="다음 페이지">' + IC_R + '</button></div>'
      + '<button type="button" class="pg-b pg-aa" aria-label="보기 설정" title="보기 설정">Aa</button>';
    var scrim = mk('div', 'pg-scrim');
    var sheet = mk('div', 'pg-sheet');
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', '이 과의 차례');
    sheet.innerHTML = '<div class="pg-sheet-h"></div><div class="pg-list"></div>';
    var pop = mk('div', 'pg-pop');
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', '보기 설정');
    pop.innerHTML = '<div class="pg-row"><span>글자 크기</span><div><button type="button" data-a="minus" aria-label="글자 작게">A−</button><button type="button" data-a="plus" aria-label="글자 크게">A+</button></div></div>'
      + '<div class="pg-row"><span>보기 방식</span><div><button type="button" data-a="page" class="on">페이지</button><button type="button" data-a="scroll">스크롤</button></div></div>'
      + '<div class="pg-row"><span>인쇄</span><div><button type="button" data-a="print">인쇄하기</button></div></div>';
    var toast = mk('div', 'pg-toast');
    toast.setAttribute('role', 'status');
    doc.body.appendChild(top); doc.body.appendChild(bar); doc.body.appendChild(scrim);
    doc.body.appendChild(sheet); doc.body.appendChild(pop); doc.body.appendChild(toast);

    UI.top = top; UI.bar = bar; UI.scrim = scrim; UI.sheet = sheet; UI.pop = pop; UI.toast = toast;
    UI.runK = top.querySelector('.pg-run-k'); UI.runT = top.querySelector('.pg-run-t');
    UI.now = bar.querySelector('.pg-now'); UI.all = bar.querySelector('.pg-all');
    UI.prev = bar.querySelector('.pg-prev'); UI.next = bar.querySelector('.pg-next');
    UI.ind = bar.querySelector('.pg-ind'); UI.home = bar.querySelector('.pg-home');
    var old = doc.querySelector('a.sd-home');
    UI.home.setAttribute('href', old ? old.getAttribute('href') : '../index.html#toc');

    UI.prev.addEventListener('click', function () { turn(-1); });
    UI.next.addEventListener('click', function () { turn(1); });
    UI.ind.addEventListener('click', openSheet);
    bar.querySelector('.pg-aa').addEventListener('click', function () { if (UI.open === 'pop') closePanels(); else openPanel('pop'); });
    scrim.addEventListener('click', closePanels);
    sheet.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-p]') : null;
      if (!b) return;
      closePanels(); go(parseInt(b.getAttribute('data-p'), 10) || 0);
    });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-a]') : null;
      if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'minus' || a === 'plus') fontStep(a === 'plus' ? 1 : -1);
      else if (a === 'scroll') { closePanels(); setView('scroll'); exitPage(true); }
      else if (a === 'page') closePanels();
      else if (a === 'print') { closePanels(); var fp = doc.getElementById('fp'); if (fp) fp.click(); else window.print(); }
    });

    /* 스크롤 보기에서 페이지 보기로 바꾸는 버튼(기존 글자 크기 버튼 옆) */
    var fc = doc.querySelector('.fc');
    if (fc) {
      var pb = mk('button', 'fc-btn fc-page');
      pb.type = 'button'; pb.id = 'pgOn';
      pb.setAttribute('aria-label', '페이지로 넘겨 보기'); pb.title = '페이지로 넘겨 보기';
      pb.innerHTML = IC_BOOK;
      pb.addEventListener('click', function () { setView('page'); enterPage('user'); });
      fc.insertBefore(pb, fc.firstChild);
    }
    /* 글자 크기 버튼(A− A+)은 여기서 받아, 지금 보이는 크기에서 1px씩 바꿉니다.
       (교재의 원래 동작은 핸드폰에서 처음 한 번 2px이 뛰거나 A−가 듣지 않는 일이 있어 이쪽으로 통일) */
    doc.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('#fa,#fb') : null;
      if (!t) return;
      e.stopPropagation(); e.preventDefault();
      fontStep(t.id === 'fa' ? 1 : -1);
    }, true);
  }
  function fontStep(d) {
    var main = S.main;
    if (!main) return;
    var cur = Math.round(px(cs(main).fontSize)) || 16;
    var next = Math.max(13, Math.min(24, cur + d));
    if (next === cur) return;
    main.style.fontSize = next + 'px';
    if (S.on) repaginate();
    else { try { window.dispatchEvent(new Event('resize')); } catch (e) {} }   /* 교재의 폭 맞춤 스크립트가 다시 재도록 */
  }
  function openPanel(which) {
    closePanels();
    UI.open = which;
    UI.scrim.classList.add('pg-open');
    (which === 'pop' ? UI.pop : UI.sheet).classList.add('pg-open');
  }
  function closePanels() {
    UI.open = null;
    UI.scrim.classList.remove('pg-open'); UI.pop.classList.remove('pg-open'); UI.sheet.classList.remove('pg-open');
  }
  function openSheet() {
    if (UI.open === 'sheet') { closePanels(); return; }
    /* 차례에는 끝까지의 페이지 번호가 필요하므로, 아직 나누는 중이면 여기서 마저 나눕니다. */
    try { runUntil(null); } catch (err) { fail(err); return; }
    if (S.ready && !T.on) show(S.cur, true);
    var html = '', i, m, host, curMark = 0;
    for (i = 0; i < S.marks.length; i++) {
      m = S.marks[i]; host = m.el;
      while (host && host.__pgn == null) host = host.parentNode;
      m.p = host && host.__pgn < S.leaves.length ? host.__pgn : 0;
      if (m.p <= S.cur) curMark = i;
    }
    for (i = 0; i < S.marks.length; i++) {
      m = S.marks[i];
      html += '<button type="button" data-p="' + m.p + '"' + (i === curMark ? ' class="on" aria-current="true"' : '') + '>'
        + (m.k ? '<b>' + esc(m.k) + '</b>' : '<b style="visibility:hidden"></b>')
        + '<span>' + esc(m.t) + '</span><i>' + (m.p + 1) + '</i></button>';
    }
    UI.sheet.querySelector('.pg-sheet-h').textContent = (S.kick ? S.kick + ' · ' : '') + S.lesson;
    UI.sheet.querySelector('.pg-list').innerHTML = html;
    openPanel('sheet');
    var on = UI.sheet.querySelector('.on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'center' });
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var toastT = 0;
  function toast(msg, ms) {
    if (!UI.toast) return;
    UI.toast.textContent = msg;
    UI.toast.classList.add('pg-open');
    clearTimeout(toastT);
    toastT = setTimeout(function () { UI.toast.classList.remove('pg-open'); }, ms || 3200);
  }

  /* ───────────── 켜기·끄기·다시 나누기 ───────────── */
  function leafIndex(el) {
    while (el && el.__pgn == null) el = el.parentNode;
    return el ? el.__pgn : -1;
  }
  /* 보던 자리가 있는 페이지까지만 먼저 나눠서 보여 주고, 나머지는 뒤에서 이어 나눕니다.
     자리는 요소(el — 스크롤로 보던 화면 맨 위의 것)나 번호(a — 기억해 둔 자리)로 받습니다. */
  function paginateFrom(a, el) {
    setupPagination();
    var p = -1;
    if (el) {
      runUntil(function () { var k = leafIndex(el); return k >= 0 && k < avail(); });
      p = leafIndex(el);
      if (p >= avail()) p = -1;
    }
    if (p < 0) { runUntil(function () { return reached(a); }); p = pageOfAnchor(a); }
    S.ready = true; S.cur = -1;
    show(p);
    bgStart();
  }
  /* 스크롤 보기에서 지금 화면 위쪽에 보이는 요소(페이지 보기로 바꿀 때 같은 자리에서 시작하려고) */
  function topElement() {
    if (!S.main || (window.pageYOffset || 0) < 80) return null;
    var mr = S.main.getBoundingClientRect(), x = mr.left + Math.min(mr.width * 0.3, 160), y, e;
    for (y = 72; y <= 268; y += 28) {
      e = doc.elementFromPoint(x, y);
      if (e && e !== S.main && e.tagName !== 'SECTION' && S.main.contains(e)) return e;
    }
    return null;
  }
  /* 지금 페이지의 맨 위에 놓인(복제가 아닌) 원래 요소 */
  function pageTop(it) {
    var e = it ? it.body.firstElementChild : null;
    while (e) {
      if (e.hasAttribute('data-pg-rep')) { e = e.nextElementSibling; continue; }
      if ((e.tagName === 'SECTION' || e.hasAttribute('data-pg-cont')) && e.firstElementChild) { e = e.firstElementChild; continue; }
      break;
    }
    return e && e.tagName !== 'SECTION' && !e.hasAttribute('data-pg-cont') && e.tagName !== 'BR' ? e : null;
  }
  function jumpScroll(y) {
    var sb = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, y));
    root.style.scrollBehavior = sb;
  }
  /* 스크롤 보기로 볼 때 화면 위쪽의 요소를 기억해 둡니다. 화면을 돌리면 글이 다시 흘러 자리가 바뀌므로, 돌리기 직전의 것을 씁니다. */
  var SP = { el: null, hold: 0, t: 0 };
  var hinted = false;
  function trackScroll() {
    if (S.on || SP.t) return;
    SP.t = setTimeout(function () { SP.t = 0; if (!S.on && now() > SP.hold) SP.el = topElement(); }, 140);
  }
  /* how — 없음: 처음 열 때(지난번 자리에서), 'user': 책 버튼을 눌렀을 때, 'auto': 화면을 돌리거나 창 크기가 바뀌었을 때.
     스크롤로 보던 중이었다면 화면에 보이던 자리에서 시작합니다. */
  function enterPage(how) {
    if (S.on || !S.main || S.failed) return;
    var main = S.main, i;
    try {
      var top = how === 'auto' && SP.el && doc.documentElement.contains(SP.el) ? SP.el : (how ? topElement() : null);
      SP.el = null;
      root.classList.add('pg-on');
      S.orig = [];
      for (var c = main.firstChild; c; c = c.nextSibling) S.orig.push(c);
      var hold = doc.createDocumentFragment();
      for (i = 0; i < S.orig.length; i++) hold.appendChild(S.orig[i]);
      var stage = mk('div', 'pg-stage'), fx = mk('div', 'pg-fx');
      S.flap = mk('div', 'pg-flap'); S.s1 = mk('div', 'pg-s1'); S.s2 = mk('div', 'pg-s2');
      fx.appendChild(S.s1); fx.appendChild(S.s2); fx.appendChild(S.flap);
      stage.appendChild(fx);
      main.appendChild(stage);
      S.stage = stage; S.fx = fx;
      var h1 = null, big = null;
      for (i = 0; i < S.orig.length; i++) if (S.orig[i].nodeType === 1 && is(S.orig[i], 'header')) { h1 = S.orig[i].querySelector('h1'); big = S.orig[i].querySelector('.lk-big'); }
      S.lesson = textOf(h1) || doc.title;
      S.kick = big ? 'Lektion ' + textOf(big) : '';
      stage.addEventListener('touchstart', onTS, { passive: true });
      stage.addEventListener('touchmove', onTM, { passive: false });
      stage.addEventListener('touchend', onTE);
      stage.addEventListener('touchcancel', onTC);
      stage.addEventListener('click', onClick);
      stage.addEventListener('wheel', onWheel, { passive: false });
      stage.addEventListener('focusin', onTipEvent);
      stage.addEventListener('mouseover', onTipEvent);
      S.on = true; S.ready = false; S.cur = 0;
      paginateFrom(how === 'user' ? null : loadPos(), top);
      if (how && (window.pageYOffset || 0) > 0) jumpScroll(0);
      root.classList.remove('pg-wait');
      if (!S.printing) {
        if (!hinted && !lsGet(KEY_HINT)) {
          hinted = true; lsSet(KEY_HINT, '1');
          var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
          toast(coarse ? '옆으로 밀거나 화면 좌우 가장자리를 누르면 페이지가 넘어갑니다' : '방향키(← →)나 마우스 휠, 아래 화살표 버튼으로 페이지를 넘깁니다', 5200);
        }
        else if (S.cur > 0 && !how) toast((S.cur + 1) + '페이지 · 지난번에 보던 곳부터 이어집니다', 2600);
      }
    } catch (err) { fail(err); }
  }
  function exitPage(keep) {
    root.classList.remove('pg-wait');
    if (!S.main) return;
    bgStop();
    try { finishTurn(); } catch (e) {}
    closePanels();
    if (UI.toast) UI.toast.classList.remove('pg-open');
    var place = null, topEl = null;
    try { if (keep === true && S.on && S.ready && S.cur > 0) { place = anchorOf(S.cur); topEl = pageTop(S.leaves[S.cur]); } } catch (e) {}
    if (S.orig) {
      var hold = doc.createDocumentFragment();
      try { gather(hold); } catch (e) { for (var i = 0; i < S.orig.length; i++) hold.appendChild(S.orig[i]); }
      if (S.stage && S.stage.parentNode) S.stage.parentNode.removeChild(S.stage);
      S.main.appendChild(hold);
    }
    P = null;
    S.stage = null; S.orig = null; S.leaves = []; S.on = false; S.ready = false; S.done = false;
    root.classList.remove('pg-on');
    var pg = doc.getElementById('prog');
    if (pg) pg.style.width = '0%';
    try {                                            /* 보던 자리를 화면 위쪽에 맞춥니다 */
      var r = topEl ? topEl.getBoundingClientRect() : null, blk = place ? S.blocks[place.i] : null;
      if (r && (r.width || r.height)) jumpScroll((window.pageYOffset || 0) + r.top - 14);
      else if (blk) { r = blk.getBoundingClientRect(); jumpScroll((window.pageYOffset || 0) + r.top + (place.n > 1 ? r.height * place.o / place.n : 0) - 14); }
      SP.el = topEl || blk; SP.hold = now() + 700;
    } catch (e) {}
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }
  /* 화면 크기나 글자 크기가 바뀌면, 보던 자리를 지킨 채 처음부터 다시 나눕니다. */
  function repaginate() {
    if (!S.on || !S.stage) return;
    try {
      finishTurn();
      bgStop();
      var a = S.ready ? anchorOf(S.cur) : loadPos();
      S.ready = false;
      gather(doc.createDocumentFragment());
      paginateFrom(a);
    } catch (err) { fail(err); }
  }

  var rsT = 0;
  function onResize() {
    clearTimeout(rsT);
    rsT = setTimeout(function () {
      if (S.printing || S.failed) return;
      var want = wantPage();
      if (want && !S.on) { enterPage('auto'); return; }
      if (!want && S.on) { exitPage(true); return; }
      if (S.on && S.stage && (Math.abs(S.stage.clientWidth - S.sizeW) > 1 || Math.abs(S.stage.clientHeight - S.sizeH) > 1)) repaginate();
    }, 160);
  }

  function boot() {
    S.main = doc.querySelector('main');
    if (!S.main) { root.classList.remove('pg-wait'); return; }
    buildChrome();
    doc.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () { SP.hold = now() + 700; onResize(); });
    window.addEventListener('orientationchange', function () { SP.hold = now() + 700; onResize(); });
    window.addEventListener('scroll', trackScroll, { passive: true });
    window.addEventListener('beforeprint', function () { if (S.on) { S.printing = true; exitPage(); } });
    window.addEventListener('afterprint', function () { if (S.printing) { if (wantPage()) enterPage(); S.printing = false; } });
    window.addEventListener('pagehide', savePos);
    /* 손가락으로 누르면 브라우저가 click보다 먼저 가짜 mouseover를 보냅니다. 3·4·5·15·16과의 용어 풀이는
       그 mouseover로 열렸다가 바로 이어지는 click으로 다시 닫혀, 핸드폰에서는 눌러도 뜨지 않았습니다.
       터치 직후의 mouseover는 교재 스크립트에 넘기지 않아, 누르면 열리고 다시 누르면 닫히게 합니다. */
    var touchAt = 0;
    doc.addEventListener('touchend', function () { touchAt = now(); }, true);
    doc.addEventListener('mouseover', function (e) { if (now() - touchAt < 900) e.stopPropagation(); }, true);
    if (!wantPage()) return;
    /* 그림과 글꼴이 다 준비된 뒤에 나눠야 높이가 맞습니다. 너무 오래 걸리면 기다리지 않습니다. */
    var started = false;
    function start() { if (started) return; started = true; enterPage(); if (doc.fonts && doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', function () { if (S.on) onResizeForce(); }); }
    function afterLoad() {
      void S.main.offsetHeight;
      if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) doc.fonts.ready.then(start, start); else start();
      setTimeout(start, 1200);
    }
    if (doc.readyState === 'complete') afterLoad(); else window.addEventListener('load', afterLoad);
    setTimeout(start, 4000);
  }
  var ffT = 0;
  function onResizeForce() { clearTimeout(ffT); ffT = setTimeout(function () { if (S.on && !T.on) repaginate(); }, 120); }

  /* 다른 스크립트에서 쓸 수 있는 작은 창구 */
  window.SodaPager = {
    isOn: function () { return S.on && S.ready; },
    isDone: function () { return S.on && S.ready && S.done; },
    count: function () { return avail(); },
    current: function () { return S.cur; },
    go: function (p) { go(p); },
    turn: function (dir) { turn(dir < 0 ? -1 : 1); },
    finish: function () { if (!S.on) return; try { runUntil(null); if (S.ready && !T.on) show(S.cur, true); } catch (err) { fail(err); } },
    refresh: function () { repaginate(); },
    enter: function () { setView('page'); enterPage('user'); },
    exit: function () { setView('scroll'); exitPage(true); }
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
