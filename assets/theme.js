/* SODA GRAMMATIK KURS · 다크 모드 스위치
   - 모든 화면 오른쪽 위 같은 자리에 스위치를 둡니다.
   - 선택은 기기에 저장되어 다른 페이지에도 그대로 적용됩니다. 기본값은 다크 모드입니다.
   - 표지·목차, 선택 페이지, 부록은 각 페이지에 직접 만든 다크 색상표를 씁니다.
   - 교재·연습문제·복습·과제는 assets/theme-colors.css(자동 생성 색상표)를 씁니다.
     원래 색의 밝기만 뒤집고 색상은 유지하며, 사진·그림·로고는 원래 색 그대로 둡니다.
   - 인쇄할 때는 언제나 밝은 화면으로 인쇄됩니다. */
(function () {
  'use strict';
  var KEY = 'soda-gk-theme';
  var root = document.documentElement;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var theme = read() === 'light' ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);
  root.classList.add('sd-theme-on');

  var css = ''
    /* 스위치 */
    + '.sd-theme{position:fixed;top:14px;right:14px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 6px 0 12px;'
    + 'border-radius:999px;border:1px solid #DCDFE7;background:rgba(255,255,255,.94);color:#384568;font:700 12.5px/1 "Pretendard Variable",Pretendard,"Noto Sans KR",system-ui,sans-serif;'
    + 'letter-spacing:.02em;cursor:pointer;box-shadow:0 4px 16px rgba(20,24,40,.12);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);-webkit-tap-highlight-color:transparent}'
    + '.sd-theme:focus-visible{outline:3px solid #6F80B8;outline-offset:2px}'
    + '.sd-theme .sd-t{width:40px;height:24px;border-radius:999px;background:#D7DBE6;position:relative;transition:background .2s}'
    + '.sd-theme .sd-k{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s;display:flex;align-items:center;justify-content:center;color:#384568}'
    + '.sd-theme svg{width:12px;height:12px}'
    + '.sd-theme[aria-checked="true"]{background:rgba(28,31,40,.94);border-color:#343947;color:#DDE2F2}'
    + '.sd-theme[aria-checked="true"] .sd-t{background:#5A6A9E}'
    + '.sd-theme[aria-checked="true"] .sd-k{transform:translateX(16px);color:#384568}'
    + '@media print{.sd-theme{display:none!important}}'
    + '@media (max-width:560px){.sd-theme .sd-l{display:none}.sd-theme{padding:0 5px}}'
    + '@media (prefers-reduced-motion:reduce){.sd-theme .sd-t,.sd-theme .sd-k{transition:none}}';

  var st = document.createElement('style');
  st.id = 'sd-theme-style';
  st.textContent = css;
  (document.head || root).appendChild(st);

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';

  function paint(btn) {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-checked', dark ? 'true' : 'false');
    btn.querySelector('.sd-k').innerHTML = dark ? MOON : SUN;
    btn.querySelector('.sd-l').textContent = dark ? '다크' : '라이트';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (!meta.dataset.light) meta.dataset.light = meta.content;
      meta.content = dark ? '#14161C' : meta.dataset.light;
    }
  }

  function mount() {
    if (document.querySelector('.sd-theme')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sd-theme';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-label', '다크 모드');
    btn.title = '다크 모드 켜기 / 끄기';
    btn.innerHTML = '<span class="sd-l"></span><span class="sd-t"><span class="sd-k"></span></span>';
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      save(next);
      paint(btn);
    });
    document.body.appendChild(btn);
    paint(btn);
  }

  /* 다른 탭에서 바꾸면 이 탭도 따라갑니다 */
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    root.setAttribute('data-theme', e.newValue === 'light' ? 'light' : 'dark');
    var b = document.querySelector('.sd-theme'); if (b) paint(b);
  });

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
