import { calculateSaju } from "./lib/ssaju.mjs";

const STEM_EL = { 甲: "목", 乙: "목", 丙: "화", 丁: "화", 戊: "토", 己: "토", 庚: "금", 辛: "금", 壬: "수", 癸: "수" };
const BRANCH_EL = { 寅: "목", 卯: "목", 巳: "화", 午: "화", 辰: "토", 戌: "토", 丑: "토", 未: "토", 申: "금", 酉: "금", 亥: "수", 子: "수" };
const KO = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사", 午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};
const ANIMAL = { 子: "쥐", 丑: "소", 寅: "호랑이", 卯: "토끼", 辰: "용", 巳: "뱀", 午: "말", 未: "양", 申: "원숭이", 酉: "닭", 戌: "개", 亥: "돼지" };
const EL_ORDER = ["목", "화", "토", "금", "수"];
const EL_HANJA = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };
const EL_COLOR_NAME = { 목: "푸른", 화: "붉은", 토: "누런", 금: "흰", 수: "검은" };
const EL_KEY = { 목: "wood", 화: "fire", 토: "earth", 금: "metal", 수: "water" };

const DAY_MASTER = {
  甲: ["큰 나무", "곧게 뻗어 오르는 리더형. 추진력과 원칙이 있고, 한번 정한 방향은 쉽게 꺾이지 않습니다."],
  乙: ["풀과 덩굴", "유연하고 적응력이 뛰어난 생존형. 부드러워 보여도 끈기가 강하고 관계를 잘 엮어냅니다."],
  丙: ["태양", "밝고 열정적인 표현형. 주변을 환하게 만들고 숨김없이 솔직하며 존재감이 큽니다."],
  丁: ["촛불·별빛", "섬세하고 따뜻한 집중형. 한 곳을 오래 비추는 힘이 있고 배려와 통찰이 깊습니다."],
  戊: ["큰 산", "듬직하고 포용력 있는 중재형. 신뢰를 주는 무게감이 있으며 쉽게 흔들리지 않습니다."],
  己: ["논밭의 흙", "실속 있고 세심한 양육형. 사람과 일을 길러내는 재주가 있고 현실 감각이 좋습니다."],
  庚: ["바위·원석", "강직하고 결단력 있는 개척형. 의리와 정의감이 강하며 승부처에서 빛납니다."],
  辛: ["보석", "예리하고 감각적인 완벽주의형. 자기만의 기준이 분명하고 미적 감각이 뛰어납니다."],
  壬: ["큰 바다·강", "스케일 크고 자유로운 지혜형. 아이디어가 넘치고 상황을 넓게 조망합니다."],
  癸: ["비·이슬", "조용하고 총명한 직관형. 스며들 듯 사람을 이해하고 감수성이 풍부합니다."],
};

const TEN_GOD_HINT = {
  비견: "자립·동료", 겁재: "경쟁·승부", 식신: "표현·여유", 상관: "재능·변화", 편재: "활동적 재물",
  정재: "안정적 재물", 편관: "도전·책임", 정관: "명예·규율", 편인: "직관·전문성", 정인: "학문·보호",
};

const STRENGTH_KO = { strong: "신강", weak: "신약", neutral: "중화" };
const PILLARS = [
  ["hour", "시주", "時"],
  ["day", "일주", "日"],
  ["month", "월주", "月"],
  ["year", "연주", "年"],
];

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const elOf = (ch) => STEM_EL[ch] || BRANCH_EL[ch] || "";
const charChip = (ch, cls = "") =>
  `<span class="chip el-${EL_KEY[elOf(ch)] || "none"} ${cls}" title="${esc(KO[ch] || "")} · ${esc(elOf(ch))}">${esc(ch)}</span>`;
const ganzhiChips = (gz) => [...gz].map((c) => charChip(c, "sm")).join("");

const form = $("#saju-form");
const resultEl = $("#result");
const errorEl = $("#form-error");

// ---- form behaviour ---------------------------------------------------
function syncFormState() {
  const lunar = form.calendar.value === "lunar";
  $("#leap-wrap").hidden = !lunar;
  if (!lunar) form.leap.checked = false;
  form.time.disabled = form.unknownTime.checked;
}
form.addEventListener("change", syncFormState);

function readForm() {
  const [y, m, d] = (form.date.value || "").split("-").map(Number);
  const unknown = form.unknownTime.checked;
  const [hh, mm] = unknown ? [12, 0] : (form.time.value || "12:00").split(":").map(Number);
  return {
    name: form.name.value.trim(),
    unknownTime: unknown,
    input: {
      year: y, month: m, day: d, hour: hh, minute: mm,
      gender: form.gender.value,
      calendar: form.calendar.value,
      leap: form.leap.checked,
      applyLocalMeanTime: form.lmt.checked,
      longitude: Number(form.longitude.value),
    },
  };
}

function writeForm(p) {
  form.name.value = p.name || "";
  form.gender.value = p.input.gender;
  form.calendar.value = p.input.calendar;
  form.leap.checked = !!p.input.leap;
  const pad = (n) => String(n).padStart(2, "0");
  form.date.value = `${p.input.year}-${pad(p.input.month)}-${pad(p.input.day)}`;
  form.time.value = `${pad(p.input.hour)}:${pad(p.input.minute)}`;
  form.unknownTime.checked = !!p.unknownTime;
  form.lmt.checked = !!p.input.applyLocalMeanTime;
  if (p.input.longitude) form.longitude.value = String(p.input.longitude);
  syncFormState();
}

// URL hash keeps the result shareable / reload-safe (stays in the browser).
function toHash(p) {
  const i = p.input;
  const q = new URLSearchParams({
    d: `${i.year}-${i.month}-${i.day}`,
    t: p.unknownTime ? "x" : `${i.hour}-${i.minute}`,
    g: i.gender === "남" ? "m" : "f",
    c: i.calendar === "lunar" ? (i.leap ? "ll" : "l") : "s",
  });
  if (p.name) q.set("n", p.name);
  if (i.applyLocalMeanTime) q.set("lng", String(i.longitude));
  return "#" + q.toString();
}

function fromHash() {
  if (!location.hash.startsWith("#d=")) return null;
  const q = new URLSearchParams(location.hash.slice(1));
  const [year, month, day] = (q.get("d") || "").split("-").map(Number);
  if (!year || !month || !day) return null;
  const t = q.get("t");
  const unknownTime = t === "x";
  const [hour, minute] = unknownTime || !t ? [12, 0] : t.split("-").map(Number);
  const c = q.get("c") || "s";
  return {
    name: q.get("n") || "",
    unknownTime,
    input: {
      year, month, day, hour, minute,
      gender: q.get("g") === "m" ? "남" : "여",
      calendar: c.startsWith("l") ? "lunar" : "solar",
      leap: c === "ll",
      applyLocalMeanTime: q.has("lng"),
      longitude: Number(q.get("lng")) || 126.9784,
    },
  };
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const p = readForm();
  if (!p.input.year || p.input.year < 1900 || p.input.year > 2100) {
    errorEl.textContent = "1900년 ~ 2100년 사이의 생년월일을 입력해 주세요.";
    return;
  }
  history.replaceState(null, "", toHash(p));
  run(p, true);
});

function run(p, scroll) {
  errorEl.textContent = "";
  let r;
  try {
    r = calculateSaju(p.input);
  } catch (err) {
    errorEl.textContent = "계산할 수 없는 날짜입니다. 음력/윤달 여부를 확인해 주세요. (" + err.message + ")";
    resultEl.hidden = true;
    return;
  }
  resultEl.innerHTML = render(r, p);
  resultEl.hidden = false;
  bindResult(r);
  if (scroll) resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- rendering --------------------------------------------------------
function render(r, p) {
  return [
    renderSummary(r, p),
    renderPillars(r, p),
    renderElements(r),
    renderDayMaster(r),
    renderRelations(r),
    renderDaeun(r),
    renderSeyun(r),
    renderWolun(r),
    renderManse(r),
    renderExport(),
  ].join("");
}

function renderSummary(r, p) {
  const i = r.input;
  const s = r.solar;
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = p.unknownTime ? "시간 모름" : `${pad(i.hour)}:${pad(i.minute)}`;
  const calStr = i.calendar === "lunar" ? `음력 ${i.year}.${i.month}.${i.day}${i.leap ? " (윤)" : ""} → 양력 ${s.year}.${s.month}.${s.day}` : `양력 ${s.year}.${s.month}.${s.day}`;
  const dm = r.pillarDetails.day;
  const yb = r.pillarDetails.year.branch;
  const adv = r.advanced;
  return `
  <section class="card summary">
    <div class="summary-head">
      <div>
        <h2>${esc(p.name || "나")}의 사주</h2>
        <p class="muted">${esc(calStr)} · ${esc(timeStr)} · ${i.gender === "남" ? "남성" : "여성"} · 만 ${r.currentAge}세</p>
      </div>
      <div class="ilju">
        ${charChip(dm.stem, "lg")}${charChip(dm.branch, "lg")}
        <span class="ilju-label">${esc(r.pillars.day)}(${esc(KO[dm.stem] + KO[dm.branch])}) 일주</span>
      </div>
    </div>
    <ul class="stats">
      <li><b>일간</b><span>${esc(dm.stem)} ${esc(EL_COLOR_NAME[dm.element.stem])} ${esc(dm.element.stem)}(${esc(dm.yinYang.stem)})</span></li>
      <li><b>띠</b><span>${esc(EL_COLOR_NAME[elOf(r.pillarDetails.year.stem)] || "")} ${esc(ANIMAL[yb])}띠</span></li>
      <li><b>강약</b><span>${esc(STRENGTH_KO[adv.dayStrength.strength] || adv.dayStrength.strength)} <small>(${adv.dayStrength.score})</small></span></li>
      <li><b>격국</b><span>${esc(adv.geukguk)}</span></li>
      <li><b>용신</b><span>${adv.yongsin.map((c) => charChip(c, "sm")).join("") || "-"}</span></li>
      <li><b>공망</b><span>${r.gongmang.branches.map((c) => charChip(c, "sm")).join("")}</span></li>
    </ul>
    ${p.unknownTime ? `<p class="note">태어난 시간을 모르는 경우 정오(12시)로 계산합니다. 시주는 참고만 해 주세요.</p>` : ""}
  </section>`;
}

function renderPillars(r, p) {
  const cols = PILLARS.map(([k, label, hanja]) => {
    const d = r.pillarDetails[k];
    const tg = r.tenGods[k];
    const sal = r.sals[k];
    const hidden = ["여기", "중기", "정기"].map((h) => d.hiddenStems[h]).filter(Boolean);
    const dim = k === "hour" && p.unknownTime ? " dim" : "";
    return `
      <div class="pillar${k === "day" ? " me" : ""}${dim}">
        <div class="p-label">${label}<small>${hanja}柱</small></div>
        <div class="p-tg">${k === "day" ? "일간(나)" : esc(tg.stem)}</div>
        <div class="p-char el-${EL_KEY[d.element.stem]}">
          <span class="hz">${esc(d.stem)}</span><span class="ko">${esc(d.stemKo)} · ${esc(d.element.stem)}${d.yinYang.stem === "양" ? "+" : "−"}</span>
        </div>
        <div class="p-char el-${EL_KEY[d.element.branch]}">
          <span class="hz">${esc(d.branch)}</span><span class="ko">${esc(d.branchKo)} · ${esc(d.element.branch)}${d.yinYang.branch === "양" ? "+" : "−"}</span>
        </div>
        <div class="p-tg">${esc(tg.branch)}</div>
        <dl class="p-meta">
          <dt>지장간</dt><dd>${hidden.map((c) => charChip(c, "xs")).join("")}</dd>
          <dt>12운성</dt><dd>${esc(r.stages12.bong[k])}</dd>
          <dt>12신살</dt><dd>${esc(sal.twelveSal || "-")}</dd>
          <dt>특수신살</dt><dd>${sal.specialSals.length ? sal.specialSals.map((s) => `<span class="tag">${esc(s)}</span>`).join("") : "-"}</dd>
        </dl>
      </div>`;
  }).join("");
  return `
  <section class="card">
    <h3>사주 원국 <small>四柱八字</small></h3>
    <div class="pillars">${cols}</div>
    <p class="legend">${EL_ORDER.map((e) => `<span class="dot el-${EL_KEY[e]}"></span>${e}(${EL_HANJA[e]})`).join(" ")}</p>
  </section>`;
}

function renderElements(r) {
  const fe = r.fiveElements;
  const total = EL_ORDER.reduce((a, e) => a + (fe[e] || 0), 0) || 1;
  const max = Math.max(...EL_ORDER.map((e) => fe[e] || 0));
  const bars = EL_ORDER.map((e) => {
    const n = fe[e] || 0;
    const pct = Math.round((n / total) * 100);
    return `
      <div class="el-row">
        <span class="el-name"><span class="hz">${EL_HANJA[e]}</span>${e}</span>
        <div class="bar"><div class="fill el-${EL_KEY[e]}" style="width:${(n / Math.max(max, 1)) * 100}%"></div></div>
        <span class="el-num">${n}<small>개 · ${pct}%</small></span>
      </div>`;
  }).join("");
  const missing = EL_ORDER.filter((e) => !fe[e]);
  const strongest = EL_ORDER.filter((e) => fe[e] === max);
  return `
  <section class="card">
    <h3>오행 분포 <small>五行</small></h3>
    <div class="elements">${bars}</div>
    <p class="muted">
      가장 많은 기운: <b>${strongest.join(", ")}</b>
      ${missing.length ? ` · 없는 기운: <b>${missing.join(", ")}</b>` : " · 다섯 기운이 모두 있습니다"}
    </p>
  </section>`;
}

function renderDayMaster(r) {
  const stem = r.dayStem;
  const [img, desc] = DAY_MASTER[stem] || ["", ""];
  const adv = r.advanced;
  const tgCount = {};
  for (const [k] of PILLARS) {
    const tg = r.tenGods[k];
    if (k !== "day" && tg.stem) tgCount[tg.stem] = (tgCount[tg.stem] || 0) + 1;
    if (tg.branch) tgCount[tg.branch] = (tgCount[tg.branch] || 0) + 1;
  }
  const tgList = Object.entries(tgCount)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `<li><b>${esc(k)}</b> ×${n}<span class="muted"> ${esc(TEN_GOD_HINT[k] || "")}</span></li>`)
    .join("");
  const paras = String(adv.interpretation || "").split(/\n+/).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join("");
  return `
  <section class="card">
    <h3>풀이 <small>解釋</small></h3>
    <div class="dm">
      ${charChip(stem, "xl")}
      <div>
        <h4>${esc(stem)}(${esc(KO[stem])}) 일간 — ${esc(img)}</h4>
        <p>${esc(desc)}</p>
      </div>
    </div>
    <div class="interp">${paras}</div>
    <div class="two-col">
      <div>
        <h4>십성 구성</h4>
        <ul class="tg-list">${tgList}</ul>
      </div>
      <div>
        <h4>길신 · 흉신</h4>
        <p>길신: ${adv.sinsal.gilsin.length ? adv.sinsal.gilsin.map((s) => `<span class="tag good">${esc(s)}</span>`).join("") : "-"}</p>
        <p>흉신: ${adv.sinsal.hyungsin.length ? adv.sinsal.hyungsin.map((s) => `<span class="tag bad">${esc(s)}</span>`).join("") : "-"}</p>
      </div>
    </div>
  </section>`;
}

function renderRelations(r) {
  const items = [];
  for (const s of r.stemRelations) items.push(["천간 " + s.type, s.desc]);
  const br = r.branchRelations;
  for (const key of ["방합", "삼합", "반합", "육합", "충", "형", "파", "해", "원진", "귀문"]) {
    const seen = new Set(Object.values(br[key] || {}));
    for (const v of seen) items.push(["지지 " + key, v]);
  }
  const bad = /충|형|파|해|원진|귀문/;
  const body = items.length
    ? `<ul class="rel">${items.map(([t, d]) => `<li><span class="tag ${bad.test(t) ? "bad" : "good"}">${esc(t)}</span>${esc(d)}</li>`).join("")}</ul>`
    : `<p class="muted">눈에 띄는 합·충·형·파·해가 없습니다.</p>`;
  return `
  <section class="card">
    <h3>합충형파해 <small>關係</small></h3>
    ${body}
  </section>`;
}

function renderDaeun(r) {
  const d = r.daeun;
  const cur = d.current?.ganzhi;
  const cells = d.list.map((x) => `
      <div class="luck${x.ganzhi === cur ? " now" : ""}">
        <div class="l-age">${x.startAge}세<small>${x.startYear}</small></div>
        <div class="l-tg">${esc(x.stemTenGod)}</div>
        <div class="l-gz">${ganzhiChips(x.ganzhi)}</div>
        <div class="l-tg">${esc(x.branchTenGod)}</div>
        <div class="l-st">${esc(x.stage12)}</div>
        ${x.sal?.length ? `<div class="l-sal">${x.sal.map(esc).join(" ")}</div>` : ""}
      </div>`).join("");
  return `
  <section class="card">
    <h3>대운 <small>大運 · 10년 단위의 큰 흐름</small></h3>
    <p class="muted">${d.basis.direction === "forward" ? "순행" : "역행"} · ${d.startAge}세 시작${d.current ? ` · 지금은 <b>${esc(d.current.ganzhi)}</b> 대운 (${d.current.startAge}~${d.current.endAge}세)` : ""}</p>
    <div class="luck-strip">${cells}</div>
  </section>`;
}

function renderSeyun(r) {
  const cells = r.seyun.map((x) => `
      <div class="luck${x.year === r.currentYear ? " now" : ""}">
        <div class="l-age">${x.year}</div>
        <div class="l-tg">${esc(x.tenGodStem)}</div>
        <div class="l-gz">${ganzhiChips(x.ganzhi)}</div>
        <div class="l-tg">${esc(x.tenGodBranch)}</div>
        <div class="l-st">${esc(x.stage12)}</div>
      </div>`).join("");
  return `
  <section class="card">
    <h3>세운 <small>歲運 · 해마다의 운</small></h3>
    <div class="luck-strip">${cells}</div>
  </section>`;
}

function renderWolun(r) {
  const nowMonth = new Date().getMonth() + 1;
  const cells = r.wolun.map((x) => `
      <div class="luck${x.month === nowMonth ? " now" : ""}">
        <div class="l-age">${x.month}월<small>${esc(x.monthName)}</small></div>
        <div class="l-tg">${esc(x.stemTenGod)}</div>
        <div class="l-gz">${ganzhiChips(x.ganzhi)}</div>
        <div class="l-tg">${esc(x.branchTenGod)}</div>
        <div class="l-st">${esc(x.stage12)}</div>
      </div>`).join("");
  return `
  <section class="card">
    <h3>월운 <small>月運 · ${r.currentYear}년 달마다의 운</small></h3>
    <div class="luck-strip">${cells}</div>
  </section>`;
}

function renderManse(r) {
  const c = r.reference.codes;
  const items = [["올해", c.thisYear], ["내년", c.nextYear], ["이번 달", c.thisMonth], ["다음 달", c.nextMonth], ["오늘", c.today], ["내일", c.tomorrow]];
  return `
  <section class="card">
    <h3>오늘의 만세력 <small>萬歲曆 · ${esc(r.reference.now.split(" ")[0])}</small></h3>
    <div class="manse">${items.map(([k, v]) => `<div><span class="muted">${k}</span><div>${ganzhiChips(v)}</div></div>`).join("")}</div>
  </section>`;
}

function renderExport() {
  return `
  <section class="card export">
    <h3>내보내기</h3>
    <p class="muted">ChatGPT·Claude 같은 AI에게 붙여넣고 “이 사주를 해석해줘”라고 물어보세요.</p>
    <div class="btns">
      <button type="button" data-copy="compact">AI용 요약 복사</button>
      <button type="button" data-copy="markdown">마크다운 전체 복사</button>
      <button type="button" data-copy="link">결과 링크 복사</button>
    </div>
    <details><summary>마크다운 원문 보기</summary><pre id="md-out"></pre></details>
  </section>`;
}

function bindResult(r) {
  $("#md-out").textContent = r.toMarkdown();
  resultEl.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const kind = btn.dataset.copy;
      const text = kind === "compact" ? r.toCompact() : kind === "markdown" ? r.toMarkdown() : location.href;
      const label = btn.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "복사됨 ✓";
      } catch {
        btn.textContent = "복사 실패";
      }
      setTimeout(() => (btn.textContent = label), 1500);
    });
  });
}

// ---- boot -------------------------------------------------------------
syncFormState();
const initial = fromHash();
if (initial) {
  writeForm(initial);
  run(initial, false);
}
window.addEventListener("hashchange", () => {
  const p = fromHash();
  if (p) { writeForm(p); run(p, false); }
});
