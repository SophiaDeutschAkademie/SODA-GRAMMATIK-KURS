/* SODA GRAMMATIK KURS · 과제 Schritt 6의 말하기 연습 카드
   - 과제(Hausaufgabe) Schritt 6(Sprechen · 말하기) 맨 아래에 말하기 연습 카드를 넣습니다.
   - 말하기 연습은 처음 배우는 학생에게 맞춘 단계별 대화입니다(2026-11): 파트너가 질문 네 개를 하나씩 하고, 학생은 화면의 대답 틀을 보며 대답한 뒤
     마지막에 질문 하나를 합니다. 이 카드는 그 대화 순서(질문·뜻·대답 틀)를 미리 보여 줍니다.
     내용은 말하기 사이트(SODA-Lehrwerk sprechen/)의 A1 Übung 블록과 같습니다. 그쪽을 고치면 아래 DATA도 함께 고칩니다.
   - 말하기 사이트(SODA SPRECHEN)는 연습 기록을 같은 주소(github.io)의 localStorage에 저장합니다. 이 카드는 그 저장 상태를 보여 주고,
     과제 제출 때는 페이지의 buildText가 같은 기록을 답안에 함께 넣습니다.
   - 대화 녹음은 말하기 사이트가 맡습니다(SODA-Lehrwerk sprechen/의 「대화 녹음」). 이 카드는 녹음된다는 안내만 보여 줍니다. */
(function () {
  'use strict';
  var m = location.pathname.match(/lektion-(\d\d)\.html/);
  if (!m) return;
  var NO = m[1], EXAM = 'ueb-a1-' + NO;
  var LINK = 'https://sophiadeutschakademie.github.io/SODA-Lehrwerk/sprechen/#' + EXAM;
  /* t: 제목, g: 이 과의 문법, s: 파트너의 질문 [질문, 뜻, 대답 틀], a: 마지막에 학생이 묻는 질문 [질문, 뜻] */
  var DATA = {"10": {"t": "Lektion 10 · Mein Wochenende", "g": "현재완료 — Ich habe … gesehen. / Ich bin … gefahren.", "s": [["Was hast du am Wochenende gemacht?", "주말에 무엇을 했습니까?", "Ich habe … (과거분사)"], ["Bist du in die Stadt gefahren?", "시내에 갔습니까?", "Ja, ich bin in die Stadt gefahren. / Nein, ich bin zu Hause geblieben."], ["Was hast du gegessen?", "무엇을 먹었습니까?", "Ich habe … gegessen."], ["Hast du gut geschlafen?", "잘 잤습니까?", "Ja, ich habe gut geschlafen. / Nein, ich habe schlecht geschlafen."]], "a": ["Und du? Was hast du am Wochenende gemacht?", "당신은요? 주말에 무엇을 했습니까?"]}, "11": {"t": "Lektion 11 · Früher und gestern", "g": "과거형 — war, hatte, konnte", "s": [["Wo warst du gestern?", "어제 어디에 있었습니까?", "Gestern war ich …"], ["Wie war das Wetter gestern?", "어제 날씨는 어땠습니까?", "Das Wetter war …"], ["Hattest du gestern viel Arbeit?", "어제 일이 많았습니까?", "Ja, ich hatte viel Arbeit. / Nein, ich hatte wenig Arbeit."], ["Konntest du als Kind schwimmen?", "어렸을 때 수영할 수 있었습니까?", "Ja, ich konnte schwimmen. / Nein, ich konnte nicht schwimmen."]], "a": ["Und du? Wo warst du gestern?", "당신은요? 어제 어디에 있었습니까?"]}, "12": {"t": "Lektion 12 · Worauf freust du dich?", "g": "재귀동사 · 비인칭 es — Ich freue mich auf … / Es regnet.", "s": [["Wie ist das Wetter heute?", "오늘 날씨는 어떻습니까?", "Es regnet. / Es ist kalt. / Es ist warm."], ["Wie fühlst du dich heute?", "오늘 기분이 어떻습니까?", "Ich fühle mich …"], ["Wofür interessierst du dich?", "무엇에 관심이 있습니까?", "Ich interessiere mich für …"], ["Worauf freust du dich?", "무엇을 기대하고 있습니까?", "Ich freue mich auf den … / die … / das …"]], "a": ["Und du? Worauf freust du dich?", "당신은요? 무엇을 기대하고 있습니까?"]}, "13": {"t": "Lektion 13 · Warum lernst du Deutsch?", "g": "접속사 · 종속절 — weil …, wenn …, dass …, obwohl … (동사는 끝에)", "s": [["Warum lernst du Deutsch?", "왜 독일어를 배웁니까?", "Ich lerne Deutsch, weil ich … (동사는 끝에)"], ["Was machst du, wenn du Zeit hast?", "시간이 있으면 무엇을 합니까?", "Wenn ich Zeit habe, … ich …"], ["Findest du, dass Deutsch schwer ist?", "독일어가 어렵다고 생각합니까?", "Ja, ich finde, dass Deutsch … ist."], ["Lernst du jeden Tag Deutsch?", "매일 독일어를 공부합니까?", "Ja, ich lerne jeden Tag, obwohl ich … / Nein, weil ich …"]], "a": ["Und du? Warum lernst du Deutsch?", "당신은요? 왜 독일어를 배웁니까?"]}, "14": {"t": "Lektion 14 · Menschen und Dinge beschreiben", "g": "관계문 — Filme, die lustig sind / ein Mensch, der mir hilft", "s": [["Was für Filme magst du?", "어떤 영화를 좋아합니까?", "Ich mag Filme, die … sind."], ["Was ist für dich ein guter Freund?", "당신에게 좋은 친구는 어떤 사람입니까?", "Ein guter Freund ist ein Mensch, der …"], ["Kennst du jemanden, der Deutsch spricht?", "독일어를 하는 사람을 압니까?", "Ja, ich kenne einen Mann, der … / eine Frau, die …"], ["Gibt es in deiner Nähe ein Café, das du magst?", "당신 집 근처에 마음에 드는 카페가 있습니까?", "Ja, es gibt ein Café, das ich mag. / Nein, es gibt kein Café, das ich mag."]], "a": ["Und du? Was für Filme magst du?", "당신은요? 어떤 영화를 좋아합니까?"]}, "15": {"t": "Lektion 15 · Was wird gemacht?", "g": "수동태 — wird verkauft, wird gegessen, wird gesprochen", "s": [["Was wird im Café verkauft?", "카페에서는 무엇을 팝니까?", "Im Café wird … verkauft."], ["Was wird in Korea viel gegessen?", "한국에서는 무엇을 많이 먹습니까?", "In Korea wird viel … gegessen."], ["Welche Sprache wird in Österreich gesprochen?", "오스트리아에서는 어떤 언어를 씁니까?", "In Österreich wird … gesprochen."], ["Wann wird der Supermarkt geöffnet?", "슈퍼마켓은 몇 시에 문을 엽니까?", "Der Supermarkt wird um … Uhr geöffnet."]], "a": ["Und in Polen? Was wird dort viel gegessen?", "그럼 폴란드에서는요? 그곳에서는 무엇을 많이 먹습니까?"]}, "16": {"t": "Lektion 16 · Wenn ich viel Geld hätte …", "g": "접속법 II — ich hätte gern, ich würde gern, wenn ich … hätte", "s": [["Was hättest du gern, Kaffee oder Tee?", "커피와 차 중 무엇으로 하겠습니까?", "Ich hätte gern einen … / ein …"], ["Wo würdest du gern wohnen?", "어디에서 살고 싶습니까?", "Ich würde gern … wohnen."], ["Was würdest du machen, wenn du viel Geld hättest?", "돈이 많다면 무엇을 하겠습니까?", "Wenn ich viel Geld hätte, würde ich … (동사 원형)"], ["Was würdest du machen, wenn du mehr Zeit hättest?", "시간이 더 있다면 무엇을 하겠습니까?", "Wenn ich mehr Zeit hätte, würde ich … (동사 원형)"]], "a": ["Und du? Was würdest du machen, wenn du viel Geld hättest?", "당신은요? 돈이 많다면 무엇을 하겠습니까?"]}, "01": {"t": "Lektion 01 · Im Zimmer", "g": "관사 1격·4격 — einen · eine · ein, den · die · das", "s": [["Was hast du im Zimmer?", "방에 무엇이 있습니까?", "Ich habe einen … / eine … / ein …"], ["Hast du einen Stuhl?", "의자가 있습니까?", "Ja, ich habe einen Stuhl. / Nein."], ["Was siehst du im Zimmer?", "방에서 무엇이 보입니까?", "Ich sehe den … / die … / das …"], ["Was kaufst du für das Zimmer?", "방에 놓을 것으로 무엇을 삽니까?", "Ich kaufe einen … / eine … / ein …"]], "a": ["Und du? Was hast du im Zimmer?", "당신은요? 방에 무엇이 있습니까?"]}, "02": {"t": "Lektion 02 · Wer ist das?", "g": "인칭대명사 3격·4격 — ihn · sie · ihm · ihr · mir", "s": [["Kennst du Anna?", "Anna를 압니까?", "Ja, ich kenne sie."], ["Siehst du Tom oft?", "Tom을 자주 봅니까?", "Ja, ich sehe ihn oft."], ["Hilfst du Tom gern?", "Tom을 기꺼이 도와줍니까?", "Ja, ich helfe ihm gern."], ["Gehört dir die Tasche?", "그 가방은 당신 것입니까?", "Ja, sie gehört mir. / Nein, sie gehört Anna."]], "a": ["Und du? Kennst du Tom?", "당신은요? Tom을 압니까?"]}, "03": {"t": "Lektion 03 · Mein Tag", "g": "현재형 동사변화 — ich lerne, ich esse, ich lese", "s": [["Was machst du heute?", "오늘 무엇을 합니까?", "Ich lerne … / Ich arbeite. / Ich koche."], ["Was isst du gern?", "무엇을 즐겨 먹습니까?", "Ich esse gern …"], ["Liest du gern?", "책 읽기를 좋아합니까?", "Ja, ich lese gern … / Nein, ich lese nicht gern."], ["Schläfst du lange?", "잠을 오래 잡니까?", "Ja, ich schlafe lange. / Nein, ich schlafe nicht lange."]], "a": ["Und du? Was machst du heute?", "당신은요? 오늘 무엇을 합니까?"]}, "04": {"t": "Lektion 04 · Fragen und Zahlen", "g": "어순 · 의문문 · 수사 — Ich bin 25 Jahre alt. / Morgen arbeite ich.", "s": [["Woher kommst du?", "어디에서 왔습니까?", "Ich komme aus …"], ["Wie alt bist du?", "몇 살입니까?", "Ich bin … Jahre alt."], ["Wie viele Geschwister hast du?", "형제자매가 몇 명입니까?", "Ich habe … Geschwister. / Ich habe einen Bruder."], ["Was machst du morgen?", "내일 무엇을 합니까?", "Morgen + 동사 + ich …"]], "a": ["Und du? Woher kommst du?", "당신은요? 어디에서 왔습니까?"]}, "05": {"t": "Lektion 05 · Meine Familie", "g": "소유관사와 kein — meine Familie, mein Hobby, keinen Hund", "s": [["Hast du Geschwister?", "형제자매가 있습니까?", "Ja, ich habe einen Bruder / eine Schwester. / Nein, ich habe keine Geschwister."], ["Wo wohnt deine Familie?", "당신의 가족은 어디에 삽니까?", "Meine Familie wohnt in …"], ["Was ist dein Hobby?", "당신의 취미는 무엇입니까?", "Mein Hobby ist …"], ["Hast du einen Hund?", "개가 있습니까?", "Ja, mein Hund heißt … / Nein, ich habe keinen Hund."]], "a": ["Und du? Hast du Geschwister?", "당신은요? 형제자매가 있습니까?"]}, "06": {"t": "Lektion 06 · Wo ist was?", "g": "전치사와 격 — in der Tasche, mit der U-Bahn, ins Kino", "s": [["Wo ist dein Handy?", "당신의 휴대폰은 어디에 있습니까?", "Mein Handy ist auf dem … / in der …"], ["Wie fährst du in die Stadt?", "시내에 무엇을 타고 갑니까?", "Ich fahre mit dem … / mit der …"], ["Wohin gehst du am Wochenende?", "주말에 어디로 갑니까?", "Am Wochenende gehe ich in den … / ins …"], ["Mit wem gehst du?", "누구와 함께 갑니까?", "Ich gehe mit meinem … / mit meiner … / mit meinen …"]], "a": ["Und du? Wohin gehst du am Wochenende?", "당신은요? 주말에 어디로 갑니까?"]}, "07": {"t": "Lektion 07 · Meine Kleidung", "g": "형용사 어미 — eine schwarze Hose, einen warmen Mantel", "s": [["Was trägst du heute?", "오늘 무엇을 입고 있습니까?", "Ich trage einen …en … / eine …e … / ein …es …"], ["Wie ist deine Jacke?", "당신의 재킷은 어떻습니까?", "Meine Jacke ist …"], ["Kaufst du den roten oder den grünen Pullover?", "빨간 스웨터를 삽니까, 초록 스웨터를 삽니까?", "Ich kaufe den roten / den grünen Pullover."], ["Was brauchst du im Winter?", "겨울에 무엇이 필요합니까?", "Im Winter brauche ich einen …en … / …e …"]], "a": ["Und du? Was trägst du heute?", "당신은요? 오늘 무엇을 입고 있습니까?"]}, "08": {"t": "Lektion 08 · Essen und Trinken im Vergleich", "g": "비교급 · 최상급 — lieber, gesünder als, am liebsten", "s": [["Was trinkst du lieber, Tee oder Kaffee?", "차와 커피 중 무엇을 더 좋아합니까?", "Ich trinke lieber …"], ["Was ist gesünder, ein Apfel oder ein Kuchen?", "사과와 케이크 중 무엇이 더 건강에 좋습니까?", "… ist gesünder als …"], ["Was ist teurer, Kaffee oder Wasser?", "커피와 물 중 무엇이 더 비쌉니까?", "… ist teurer als …"], ["Was isst du am liebsten?", "무엇을 가장 좋아합니까? (먹는 것)", "Ich esse am liebsten …"]], "a": ["Und du? Was isst du am liebsten?", "당신은요? 무엇을 가장 좋아합니까?"]}, "09": {"t": "Lektion 09 · Was kann ich, was muss ich?", "g": "화법조동사 · 분리동사 — Ich kann gut kochen. / Ich stehe um 7 Uhr auf.", "s": [["Was kannst du gut?", "무엇을 잘할 수 있습니까?", "Ich kann gut … (동사 원형)"], ["Was musst du morgen machen?", "내일 무엇을 해야 합니까?", "Morgen muss ich … (동사 원형)"], ["Wann stehst du auf?", "몇 시에 일어납니까?", "Ich stehe um … Uhr auf."], ["Was willst du am Wochenende machen?", "주말에 무엇을 하고 싶습니까?", "Am Wochenende will ich … (동사 원형)"]], "a": ["Und du? Was kannst du gut?", "당신은요? 무엇을 잘할 수 있습니까?"]}};
  var HELP = [['Wie bitte?', '네? 다시 말해 주세요.'], ['Noch einmal, bitte.', '한 번 더 말해 주세요.'], ['Langsam, bitte.', '천천히 말해 주세요.']];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function read() { try { return JSON.parse(localStorage.getItem('soda-sprechen:ueb:' + EXAM) || 'null'); } catch (e) { return null; } }
  function statusText(r) {
    return r ? '저장된 연습 기록: ' + r.attempts + '회' + (r.evaluated ? ' (평가 포함)' : '') + ' · 「과제 제출하기」를 누르면 함께 제출됩니다.' : '아직 저장된 연습 기록이 없습니다.';
  }
  var CSS = '#sprechen-card{margin:28px 0 0;padding:16px 18px;border:1px solid var(--line2);border-radius:14px;background:var(--bg);text-align:left}' +
    '#sprechen-card .sc-eb{font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--muted)}' +
    '#sprechen-card h3{margin:2px 0 0;font-size:18px;letter-spacing:-.01em}' +
    '#sprechen-card .sc-info{margin:10px 0 0;padding:0 0 0 16px;font-size:13.5px;line-height:1.6;color:var(--muted)}' +
    '#sprechen-card .sc-info li+li{margin-top:2px}#sprechen-card .sc-info b{color:var(--err,#c4392e);font-weight:700}' +
    '#sprechen-card .sc-help{margin:12px 0 0;border-top:1px solid var(--line2);padding-top:10px}' +
    '#sprechen-card .sc-help>p{margin:0 0 6px;font-size:14px;font-weight:700}' +
    '#sprechen-card .sc-help>p small{font-weight:400;color:var(--muted);margin-left:6px}' +
    '#sprechen-card .sc-plan{list-style:none;margin:0;padding:0}' +
    '#sprechen-card .sc-plan li{display:grid;grid-template-columns:24px 1fr;gap:8px;padding:6px 0;border-top:1px dashed var(--line2)}' +
    '#sprechen-card .sc-plan li:first-child{border-top:0}' +
    '#sprechen-card .sc-plan .n{width:22px;height:22px;border-radius:50%;border:1px solid var(--line2);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}' +
    '#sprechen-card .sc-plan b{display:block;font-size:15px;line-height:1.45}' +
    '#sprechen-card .sc-plan .ko{display:block;font-size:12.5px;color:var(--muted);line-height:1.45}' +
    '#sprechen-card .sc-plan .fr{display:block;font-size:13.5px;line-height:1.5;margin-top:2px}' +
    '#sprechen-card .sc-plan small{display:block;font-size:11.5px;font-weight:700;color:var(--muted)}' +
    '#sprechen-card .sc-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}' +
    '#sprechen-card .sc-chip{display:inline-block;max-width:100%;padding:3px 9px;border:1px solid var(--line2);border-radius:7px;font-size:14px;line-height:1.45}' +
    '#sprechen-card .sc-chip b{font-weight:700}' +
    '#sprechen-card .sc-chip span{margin-left:5px;font-size:12px;color:var(--muted);word-break:keep-all}' +
    '#sprechen-card .sc-foot{display:flex;align-items:center;justify-content:space-between;gap:8px 14px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--line2)}' +
    '#sprechen-card #sprechen-status{margin:0;font-size:13.5px;font-weight:700}' +
    '@media (max-width:640px){#sprechen-card{padding:14px 12px;margin-top:22px}#sprechen-card h3{font-size:16.5px}#sprechen-card .sc-info{font-size:13px;padding-left:14px}#sprechen-card .sc-plan b{font-size:14.5px}#sprechen-card .sc-chip{font-size:13.5px;padding:3px 8px}#sprechen-card .sc-foot .btn{width:100%;text-align:center}}';
  function style() {
    if (document.getElementById('sprechen-card-css')) return;
    var st = document.createElement('style'); st.id = 'sprechen-card-css'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function build() {
    var d = DATA[NO];
    var plan = d ? '<ol class="sc-plan" lang="de">' + d.s.map(function (x, i) {
      return '<li><span class="n">' + (i + 1) + '</span><div><b>' + esc(x[0]) + '</b><span class="ko">' + esc(x[1]) + '</span><span class="fr">→ ' + esc(x[2]) + '</span></div></li>';
    }).join('') + '<li><span class="n">' + (d.s.length + 1) + '</span><div><small>마지막에 내가 묻기</small><b>' + esc(d.a[0]) + '</b><span class="ko">' + esc(d.a[1]) + '</span></div></li></ol>' : '';
    var chips = '<div class="sc-chips">' + HELP.map(function (x) { return '<span class="sc-chip"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></span>'; }).join('') + '</div>';
    var btn = '<a class="btn go" href="' + LINK + '" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none">말하기 연습 열기</a>';
    return '<div><div class="sc-eb">SPRECHEN · 말하기 연습</div><h3>Lektion ' + NO + ' 말하기 연습 · 단계별 대화</h3></div>' +
      '<ul class="sc-info">' +
      '<li>파트너가 짧은 질문 네 개를 하나씩 하고, 마지막에 내가 질문 하나를 합니다. 연습 화면에 질문과 뜻, 대답 틀, 넣을 단어, 예시 대답이 나옵니다. 짧게 대답해도 됩니다.</li>' +
      '<li>학습 포탈에 로그인했으면 바로 열립니다(아니면 받은 아이디·비밀번호로 로그인). 마이크가 있는 기기에서 하십시오. Lektion마다 2회까지 연습할 수 있고, 더 필요하면 선생님께 말씀해 주십시오.</li>' +
      '<li>대화는 녹음됩니다. 연습이 끝난 화면에서 다시 듣고 WAV 파일로 내려받을 수 있습니다. <b>내려받지 않으면 그 화면을 나가거나 창을 닫을 때 녹음이 자동으로 지워집니다.</b> 녹음은 서버에 저장되지 않고 선생님께 제출되지도 않습니다.</li>' +
      '<li>연습 기록과 평가 결과는 이 과제의 「과제 제출하기」를 누를 때 답안과 함께 제출됩니다.</li>' +
      '</ul>' +
      (d ? '<div class="sc-help"><p>대화 순서<small>' + esc(d.g) + '</small></p>' + plan + '</div>' : '') +
      '<div class="sc-help"><p>못 알아들었을 때</p>' + chips + '</div>' +
      '<div class="sc-foot"><p id="sprechen-status"></p>' + btn + '</div>';
  }
  function ensure() {
    var s6 = document.getElementById('s6');
    var host = s6 || document.querySelector('.footer');
    if (!host || !host.parentNode) return;
    var card = document.getElementById('sprechen-card');
    if (!card || (s6 && card.parentNode !== s6)) {
      if (card) card.remove();
      card = document.createElement('section');
      card.id = 'sprechen-card';
      card.setAttribute('data-noser', '');
      style();
      card.innerHTML = build();
      if (s6) s6.appendChild(card); else host.parentNode.insertBefore(card, host);
    }
    var st = document.getElementById('sprechen-status');
    if (st) { var t = statusText(read()); if (st.textContent !== t) st.textContent = t; }
  }
  setInterval(ensure, 1000);
  window.addEventListener('focus', ensure);
  document.addEventListener('visibilitychange', ensure);
  ensure();
})();
