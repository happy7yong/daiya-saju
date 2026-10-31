// ===== 다이에이 입학 시뮬레이션 (공용 엔진·선수 데이터·궁합 재사용, 이 파일만 스카우트 전용) =====
const PACKS = { ko: PACK_KO, ja: PACK_JA, en: PACK_EN };
let LANG = "ko";
function pickLang() {
  const h = location.hash.replace("#", "");
  if (PACKS[h]) return h;
  try { const s = localStorage.getItem("daiya-lang"); if (PACKS[s]) return s; } catch (e) {}
  const n = (navigator.language || "ko").slice(0, 2);
  return n === "ja" ? "ja" : n === "en" ? "en" : "ko";
}
const P = () => PACKS[LANG], U = () => PACKS[LANG].ui, S = () => SCOUT[LANG];
const C = c => LANG === "ko" ? c : Object.assign({}, c, PACKS[LANG].chars[c.id]);
const $ = id => document.getElementById(id);
function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[ch]); }
const byId = id => CHARS.find(c => c.id === id);
const mini = c => `<span class="mini" style="background:${c.color}">${c.emoji}</span>`;
const teamTag = t => `<span class="team ${t}">${esc(P().team[t])}</span>`;

// 포지션별 선수 (작중 포지션 기준)
const POS = {
  P:   { ids:["eijun","furuya","mei","sanada","kawakami","amahisa"], partner:"C",  num:[1, 11, 18] },
  C:   { ids:["miyuki","chris","okumura","miyauchi","yui"],          partner:"P",  num:[2, 12, 22] },
  SS:  { ids:["kuramochi","kanemaru"],                               partner:"2B", num:[6, 15, 25] },
  "2B":{ ids:["ryosuke","haruichi"],                                 partner:"SS", num:[4, 14, 24] },
  CL:  { ids:["tetsu","raichi","masuko"],                            partner:"CL", num:[3, 13, 23] },
  CF:  { ids:["isashiki","carlos","shirasu","toujou"],               partner:"CF", num:[8, 17, 27] }
};
const SCHOOLS = ["seido", "inashiro", "yakushi", "ichidai"];
// 1부 기준 나보다 학년이 위인 선수 (입학하는 나는 신입생)
const SENIORS = ["tetsu","chris","masuko","isashiki","ryosuke","miyauchi","miyuki","kuramochi","kawakami","shirasu","sanada","mei","carlos"];

function scout(p) {
  const a = analyze(p); a._p = p;
  const ds = p.day[0], r = a.ratio;
  const domG = r.indexOf(Math.max(...r));
  const tot = a.el.reduce((x, y) => x + y, 0);
  const domEl = a.el.reduce((b, v, i) => v > a.el[b] || (v === a.el[b] && i === BR_EL[p.month[1]]) ? i : b, 0);
  // 포지션: 가장 강한 십성 (비겁이면 화·금 기운이 많을수록 클린업, 아니면 리드오프 중견수)
  const base = ["CL", "P", "C", "SS", "2B"][domG];
  const pos = base === "CL" && (a.el[1] + a.el[3]) / tot < 0.3 ? "CF" : base;
  const lab = a.strengthLabel;
  const num = POS[pos].num[lab === "신강" ? 0 : lab === "중화" ? 1 : 2];
  // 학교 스카우트 관심도
  const raw = {
    seido: 0.25 + r[3] + r[4],
    inashiro: r[0] * 1.3 + (a.support >= 0.55 ? 0.15 : 0),
    yakushi: r[1] + r[2] * 0.5,
    ichidai: r[2] * 0.9 + r[1] * 0.4 + ((domEl === 3 || domEl === 4) ? 0.1 : 0)
  };
  const sum = SCHOOLS.reduce((s, k) => s + raw[k], 0);
  const schools = SCHOOLS.map(k => ({ k, pct: Math.round(raw[k] / sum * 100) })).sort((x, y) => y.pct - x.pct);
  const school = schools[0].k;
  // 궁합 (공용 compatOne)
  const real = CHARS.filter(c => c.real);
  const cs = id => compatOne(ds, a, byId(id));
  // 라이벌: 같은 포지션에서 충 > 같은 오행 > 상대가 극함, 그다음 궁합이 낮을수록
  const rb = { chung:30, same:20, hit:10 };
  const rival = POS[pos].ids.map(cs).sort((x, y) => ((rb[y.rel] || 0) - y.score * 0.2) - ((rb[x.rel] || 0) - x.score * 0.2))[0];
  // 짝꿍: 짝 포지션에서 궁합 최고 (라이벌 제외)
  let pp = POS[POS[pos].partner].ids.filter(id => id !== rival.c.id && byId(id).team === school);
  if (!pp.length) pp = POS[POS[pos].partner].ids.filter(id => id !== rival.c.id);
  const partner = pp.map(cs).sort((x, y) => y.score - x.score)[0];
  // 선배: 나를 생해 주는(인성) 관계 우대, 입학한 학교 선수 우대, 라이벌·짝꿍 제외
  const used = [rival.c.id, partner.c.id];
  let pool = SENIORS.filter(id => !used.includes(id) && byId(id).team === school);
  if (!pool.length) pool = SENIORS.filter(id => !used.includes(id));
  const mentor = pool.map(cs).sort((x, y) => (y.score + (y.rel === "get" ? 15 : 0)) - (x.score + (x.rel === "get" ? 15 : 0)))[0];
  return { p, a, ds, domG, domEl, pos, num, lab, schools, school, rival, partner, mentor };
}

function personCard(title, rc, why) {
  const c = C(rc.c);
  return `<div class="sc-person"><div class="sc-pt">${esc(title)}</div>
    <div class="sc-pm">${mini(c)}<div><div class="nm">${esc(c.name)}</div><div class="sub">${teamTag(c.team)} ${esc(c.pos.replace(new RegExp("^" + P().team[c.team] + "\\s*[·・]\\s*"), ""))}</div></div><span class="sc-pts">${esc(S().pts(rc.score))}</span></div>
    <p>${esc(why)}</p></div>`;
}

let LAST = [1997, 8, 21, 9, 40, true, "next", true];
function render(y, m, d, hh, mm, hasTime, zi, isSample) {
  LAST = [y, m, d, hh, mm, hasTime, zi, isSample];
  const s = S(), u = U(), pk = P();
  const R = scout(computeSaju(y, m, d, hh, mm, hasTime, zi));
  const tag = $("sampleTag");
  tag.hidden = !isSample;
  if (isSample) tag.textContent = s.sample(y, m, d, hasTime ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` : u.unknownTime);
  const schoolName = pk.team[R.school];
  $("scHero").innerHTML = `
    <div class="sc-admit">🏫 <b class="sc-school ${R.school}">${esc(schoolName)}</b> ${esc(s.admit)}</div>
    <div class="sc-uni"><span class="sc-num">${R.num}</span><span class="sc-numl">${esc(s.num(R.num))}</span></div>
    <h3>${esc(s.pos[R.pos])}</h3>
    <p class="sc-chart">${esc(s.myChart(u.stemName(R.ds), u.strength[R.lab], pk.groups[GROUPS[R.domG]]))}</p>
    <p class="key">${esc(s.posWhy[R.pos])}</p>
    <ul class="sc-rows">
      <li><span class="k">${esc(s.roleL)}</span><p><b>${esc(s.role[R.lab][0])}</b> · ${esc(s.role[R.lab][1])}</p></li>
      <li><span class="k">${esc(s.styleL)}</span><p>${esc(s.style[R.domEl])}</p></li>
    </ul>`;
  $("scSchools").innerHTML = R.schools.map((x, i) => `<div class="bar${i === 0 ? " top" : ""}"><span>${teamTag(x.k)}</span><div class="track"><div class="fill" style="width:${x.pct}%"></div></div><span class="n">${x.pct}%</span></div>
    <p class="sc-sw">${esc(s.schoolWhy[x.k])}</p>`).join("");
  const mn = C(R.mentor.c).name, rn = C(R.rival.c).name, pn = C(R.partner.c).name;
  const mWhy = R.mentor.rel === "get" ? s.mentorWhy.get(mn, u.el[R.mentor.c.rds >> 1]) : s.mentorWhy.other(mn);
  const rWhy = (s.rivalWhy[R.rival.rel] || s.rivalWhy.other)(rn);
  $("scPeople").innerHTML = personCard(s.mentorT, R.mentor, mWhy) + personCard(s.rivalT, R.rival, rWhy) + personCard(s.partnerT[R.pos], R.partner, s.partnerWhy(pn));
  $("scCoach").innerHTML = `<div class="sc-ct">${esc(s.coachT)}</div><blockquote>“${esc(s.coach[R.domG])} ${esc(R.school === "seido" ? s.coachTail[R.lab] : s.coachAway(schoolName))}”</blockquote>`;
  if (!isSample && !render.silent) track("scout_result", { school: R.school, pos: R.pos, lang: LANG });
}

function applyStatic() {
  const s = S(), u = U();
  document.documentElement.lang = LANG;
  document.title = s.title;
  ["eyebrow", "h1a", "h1b", "lede", "go", "hSchool", "schoolNote", "hPeople", "back"].forEach(k => { const el = $("s-" + k); if (el) el.textContent = s[k]; });
  ["bd", "bt", "zi", "ziNext", "ziSame", "nt", "hint"].forEach(k => { const el = $("u-" + k); if (el) el.textContent = u[k]; });
  $("s-notes").innerHTML = s.notes.map(n => `<p>${esc(n)}</p>`).join("");
  $("s-back").href = "./#" + LANG;
  document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === LANG));
}
function setLang(l) {
  LANG = l;
  try { localStorage.setItem("daiya-lang", l); } catch (e) {}
  if (location.hash.replace("#", "") !== l) { try { history.replaceState(null, "", "#" + l); } catch (e) { location.hash = l; } }
  applyStatic(); render.silent = true; render(...LAST); render.silent = false;
  track("lang_change", { lang: l, page: "scout" });
}
document.querySelectorAll(".langs button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
window.addEventListener("hashchange", () => { const h = location.hash.replace("#", ""); if (PACKS[h] && h !== LANG) setLang(h); });
$("nt").addEventListener("change", e => { $("bt").disabled = e.target.checked; $("zi").disabled = e.target.checked; });
$("f").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("bd").value, err = $("err");
  const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!mt || +mt[1] < 1900 || +mt[1] > 2100) { err.textContent = U().err; err.hidden = false; return; }
  const hasTime = !$("nt").checked && $("bt").value !== "";
  let hh = 0, mm = 0;
  if (hasTime) [hh, mm] = $("bt").value.split(":").map(Number);
  err.hidden = true;
  track("submit_birth", { has_time: hasTime, lang: LANG, page: "scout" });
  render(+mt[1], +mt[2], +mt[3], hh, mm, hasTime, $("zi").value, false);
  $("scout").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});

LANG = pickLang();
applyStatic();
render(...LAST);
