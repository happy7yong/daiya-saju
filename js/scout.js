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
function godName(ds, stem) { const g = godOf(ds, stem); return U().gods[g.group][(ds % 2) === (stem % 2) ? 0 : 1]; }
const lab2 = (r, e) => LANG === "ko" ? r + e : LANG === "ja" ? e : r + " " + e;
function pillarHtml(p, ds, cols) {
  const u = U();
  return cols.map(([key, pil]) => {
    const lab = u.pil[key];
    if (!pil) return `<div class="pillar"><span class="lab">${lab}</span><div class="cell empty">${u.unknownTime}</div><div class="cell empty">${u.unknownTime}</div></div>`;
    const se = pil[0] >> 1, be = BR_EL[pil[1]];
    const sGod = key === "day" ? u.dayOnly : godName(ds, pil[0]);
    return `<div class="pillar"><span class="lab">${lab}</span>
      <div class="cell${key === "day" ? " me" : ""}"><span class="han e-${EL[se]}">${STEMS[pil[0]]}</span><span class="kor">${lab2(u.stemsR[pil[0]], u.el[se])}</span><span class="god">${sGod}</span></div>
      <div class="cell"><span class="han e-${EL[be]}">${BRANCHES[pil[1]]}</span><span class="kor">${lab2(u.branchesR[pil[1]], u.el[be])}</span><span class="god">${godName(ds, BR_MAIN[pil[1]])}</span></div></div>`;
  }).join("");
}
// 선수와의 궁합 상세 풀이 (기존 페이지 궁합 풀이와 같은 계산·문구)
function detailHtml(R, rc) {
  const u = U(), x = u.cx, pk = P(), t = C(rc.c), q = rc.parts, RR = pk.rel[rc.rel], p = R.p, a = R.a, ds = R.ds;
  const pts = v => `<span class="pts ${v > 0 ? "up" : v < 0 ? "down" : ""}">${v > 0 ? "+" : ""}${v}</span>`;
  const elList = arr => arr.map(i => (LANG === "en" ? "" : EL_H[i]) + (LANG === "ja" ? "" : (LANG === "en" ? u.el[i] : "(" + u.el[i] + ")"))).join(LANG === "ja" ? "・" : ", ");
  const bLab = b => LANG === "ko" ? BRANCHES[b] + " " + BRANCHES_K[b] : LANG === "ja" ? BRANCHES[b] : u.branchesR[b] + " (" + BRANCHES[b] + ")";
  const zLab = b => LANG === "ko" ? x.zod[b] + x.zodSuf : x.zod[b];
  const sn = i => u.stemName(i);
  const items = [[x.kDay, q.relPts, `<b>${esc(u.stemName(ds))}</b> × <b>${esc(u.stemName(t.rds))}</b> · ${esc(RR.k)}${LANG === "ja" ? "：" : ". "}${esc(RR.d)}`]];
  let f = q.fillPts >= 3 ? x.fillSome : x.fillNone;
  if (q.fillGood.length && q.fillBad.length) f = x.fillBoth(elList(q.fillGood), elList(q.fillBad));
  else if (q.fillGood.length) f = x.fillGood(elList(q.fillGood));
  else if (q.fillBad.length) f = x.fillBad(elList(q.fillBad));
  if (q.fillYong.length) f += " " + x.yongNote(elList(q.fillYong), a.support < 0.45);
  items.push([x.kFill, q.fillPts, esc(f)]);
  if (q.johu) items.push([x.kJohu, q.johuPts, esc(x.johu[q.johu.season](elList([q.johu.el]), q.johuPts))]);
  items.push([x.kDayB, q.dayPts, esc(x.br[q.dayRel](bLab(p.day[1]), bLab(t.real.day[1])))]);
  items.push([x.kYear, q.yearPts, esc(x.br[q.yearRel](zLab(p.year[1]), zLab(t.real.year[1])))]);
  if (q.hidden) items.push([x.kHidden, q.hiddenPts, esc(q.hidden.mine ? x.hiddenMine(sn(ds), x.slot[q.hidden.slot], sn(q.hidden.stem)) : x.hiddenTheirs(sn(t.rds), x.slot[q.hidden.slot], sn(q.hidden.stem)))]);
  if (q.twin) items.push([x.kTwin, q.twinPts, esc(x.twin(LANG === "ko" ? STEMS_K[p.day[0]] + BRANCHES_K[p.day[1]] : STEMS[p.day[0]] + BRANCHES[p.day[1]]))]);
  const g1 = godOf(ds, t.rds), g2 = godOf(t.rds, ds), par = (ds % 2) === (t.rds % 2) ? 0 : 1;
  items.push([x.kGod, null, x.godLine(esc(t.name), u.gods[g1.group][par], esc(x.godDesc[GROUPS[g1.group]]), u.gods[g2.group][par], esc(x.godDesc[GROUPS[g2.group]]))]);
  return `<details class="sc-more"><summary>${esc(S().more)}</summary>
    <h4>${esc(x.theirs(t.name))}</h4>
    <div class="pillars-scroll"><div class="pillars">${pillarHtml(t.real, t.rds, [["hour", null], ["day", t.real.day], ["month", t.real.month], ["year", t.real.year]])}</div></div>
    <ul class="cx-list"><li><span class="k">${esc(x.base)}</span><span class="pts">50</span><p></p></li>${items.map(([k, v, txt]) => `<li><span class="k">${esc(k)}</span>${v == null ? "<span class=\"pts\"></span>" : pts(v)}<p>${txt}</p></li>`).join("")}</ul>
    <p class="sc-total">${esc(x.total)} <b>${rc.score}</b> · ${esc(x.verdict(rc.score))}</p></details>`;
}
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
// 학교별 에이스 (맞대결 상대)
const ACES = { seido:["eijun","furuya"], inashiro:["mei"], yakushi:["sanada"], ichidai:["amahisa"] };
// 청심료 룸메이트 후보
const ROOM3 = ["tetsu","chris","masuko","isashiki","ryosuke","miyauchi"], ROOM2 = ["miyuki","kuramochi","kawakami","shirasu","watanabe"];
// 나의 무기: 투수는 결정구, 그 외는 타격·플레이 스타일 (가장 많은 오행 기준, 참고 선수)
const WEAPON_REF = { P:["eijun","furuya","sanada","amahisa","mei"], H:["haruichi","raichi","tetsu","kuramochi","miyuki"] };
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
  // 라이벌 학교 에이스: 다른 학교 에이스 중 충 > 합 > 극 관계 우선, 그다음 궁합 점수가 극단적인 쪽
  const aceRb = { chung:30, hap:20, hit:12, ctrl:12 };
  const ace = SCHOOLS.filter(k => k !== school).flatMap(k => ACES[k]).map(cs)
    .sort((x, y) => ((aceRb[y.rel] || 0) + Math.abs(y.score - 50) * 0.3) - ((aceRb[x.rel] || 0) + Math.abs(x.score - 50) * 0.3))[0];
  // 청심료 룸메이트 (세이도 입학 시): 3학년·2학년 각 1명, 선배·라이벌·짝꿍과 겹치지 않게
  const taken = [mentor.c.id, rival.c.id, partner.c.id];
  const pick = ids => { const l = ids.filter(id => !taken.includes(id)); return (l.length ? l : ids).map(cs).sort((x, y) => y.score - x.score)[0]; };
  const room = school === "seido" ? [pick(ROOM3), pick(ROOM2)] : null;
  const weapon = { kind: pos === "P" ? "P" : "H", el: domEl, ref: byId(WEAPON_REF[pos === "P" ? "P" : "H"][domEl]) };
  const sp = { seido: r[3] + r[4], inashiro: r[0], yakushi: r[1] + r[2], ichidai: r[2] + r[1] };
  const why = s => S().schoolReason[s](Math.round(sp[s] * 100), s === "inashiro" ? a.support >= 0.55 : (domEl === 3 || domEl === 4));
  return { ace, room, weapon, why, p, a, ds, domG, domEl, pos, num, lab, schools, school, rival, partner, mentor };
}

function personCard(R, title, rc, why) {
  const c = C(rc.c);
  return `<div class="sc-person"><div class="sc-pt">${esc(title)}</div>
    <div class="sc-pm">${mini(c)}<div><div class="nm">${esc(c.name)}</div><div class="sub">${teamTag(c.team)} ${esc(c.pos.replace(new RegExp("^" + P().team[c.team] + "\\s*[·・]\\s*"), ""))}</div></div><span class="sc-pts">${esc(S().pts(rc.score))}</span></div>
    <p>${esc(why)}</p>${detailHtml(R, rc)}</div>`;
}

let LAST = [1997, 8, 21, 9, 40, true, "next", true], LAST_R = null;
// ===== 결과 공유 (생년월일은 넣지 않고 결과만) =====
function shareUrl(R) {
  const base = location.origin + location.pathname;
  const f = [R.school, R.pos, R.num, { 신강:"s", 중화:"b", 신약:"w" }[R.lab], R.mentor.c.id, R.mentor.score, R.rival.c.id, R.rival.score, R.partner.c.id, R.partner.score, R.ace.c.id, R.ace.score]
    .concat(R.room ? [R.room[0].c.id, R.room[1].c.id] : []);
  return base + "?sc=" + f.join(".") + "#" + LANG;
}
function parseFriend() {
  try {
    const v = new URLSearchParams(location.search).get("sc"); if (!v) return null;
    const a = v.split(".");
    const ok = id => byId(id) ? id : null;
    if (!SCHOOLS.includes(a[0]) || !POS[a[1]]) return null;
    const f = { school:a[0], pos:a[1], num:+a[2], lab:{ s:"신강", b:"중화", w:"신약" }[a[3]] || "중화",
      mentor:[ok(a[4]), +a[5]], rival:[ok(a[6]), +a[7]], partner:[ok(a[8]), +a[9]], ace:[ok(a[10]), +a[11]], room:[ok(a[12]), ok(a[13])].filter(Boolean) };
    if (![f.mentor, f.rival, f.partner, f.ace].every(x => x[0])) return null;
    return f;
  } catch (e) { return null; }
}
const FRIEND = parseFriend();
function renderFriend() {
  const box = $("friend"); if (!FRIEND) { box.hidden = true; return; }
  const s = S(), f = FRIEND, nm = id => esc(C(byId(id)).name);
  const chip = (t, [id, sc]) => `<span class="chip">${mini(C(byId(id)))}${esc(t)} ${nm(id)}${sc ? " · " + esc(s.pts(sc)) : ""}</span>`;
  box.hidden = false;
  box.innerHTML = `<span class="friend-label">${esc(s.friendT)}</span>
    <div class="sc-fhead"><b class="sc-school ${f.school}">${esc(P().team[f.school])}</b> <span class="sc-fnum">#${f.num}</span> <span class="sc-fpos">${esc(s.pos[f.pos])}</span></div>
    <div class="friend-others">${chip(s.mentorT, f.mentor)}${chip(s.rivalT, f.rival)}${chip(s.partnerT[f.pos], f.partner)}${chip(s.aceChip, f.ace)}${f.room.map(id => chip("🛏️", [id, 0])).join("")}</div>
    <button type="button" class="go friend-go" id="friendGo">${esc(s.tryMine)}</button>`;
  $("friendGo").addEventListener("click", () => { $("bd").focus(); $("f").scrollIntoView({ behavior: "smooth", block: "center" }); track("friend_try_click", { lang: LANG, page: "scout" }); });
}
document.addEventListener("click", async e => {
  if (!e.target.closest("#copyLink") || !LAST_R) return;
  const url = shareUrl(LAST_R);
  track("share_click", { channel: "copy", page: "scout", school: LAST_R.school, lang: LANG });
  try { await navigator.clipboard.writeText(url); $("shareNote").textContent = S().copied; } catch (er) { $("shareNote").textContent = url; }
});
document.addEventListener("toggle", e => { if (e.target.classList && e.target.classList.contains("sc-more") && e.target.open) track("scout_detail_open", { lang: LANG }); }, true);
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
    <p class="sc-why"><b>${esc(s.whyL(schoolName))}</b> ${esc(R.why(R.school))}</p>
    <h3>${esc(s.pos[R.pos])}</h3>
    <p class="sc-chart">${esc(s.myChart(u.stemName(R.ds), u.strength[R.lab], pk.groups[GROUPS[R.domG]]))}</p>
    <p class="key">${esc(s.posWhy[R.pos])}</p>
    <ul class="sc-rows">
      <li><span class="k">${esc(s.roleL)}</span><p><b>${esc(s.role[R.lab][0])}</b> · ${esc(s.role[R.lab][1])}</p></li>
      <li><span class="k">${esc(s.styleL)}</span><p>${esc(s.style[R.domEl])}</p></li>
      <li><span class="k">${esc(s.weaponL)}</span><p><b>${esc(s.weapon[R.weapon.kind][R.weapon.el][0])}</b> · ${esc(s.weapon[R.weapon.kind][R.weapon.el][1])} <span class="sc-ref">${esc(s.weaponRef(C(R.weapon.ref).name))}</span></p></li>
    </ul>
    <div class="sc-share"><button type="button" class="go sc-copy" id="copyLink">${esc(s.copy)}</button><span class="sc-note" id="shareNote"></span></div>`;
  $("scSchools").innerHTML = R.schools.map((x, i) => `<div class="bar${i === 0 ? " top" : ""}"><span>${teamTag(x.k)}</span><div class="track"><div class="fill" style="width:${x.pct}%"></div></div><span class="n">${x.pct}%</span></div>
    <p class="sc-sw"><b>${esc(s.schoolWhy[x.k])}</b> · ${esc(R.why(x.k))}</p>`).join("");
  const mn = C(R.mentor.c).name, rn = C(R.rival.c).name, pn = C(R.partner.c).name;
  const mWhy = R.mentor.rel === "get" ? s.mentorWhy.get(mn, u.el[R.mentor.c.rds >> 1]) : s.mentorWhy.other(mn);
  const rWhy = (s.rivalWhy[R.rival.rel] || s.rivalWhy.other)(rn);
  $("scPeople").innerHTML = personCard(R, s.mentorT, R.mentor, mWhy) + personCard(R, s.rivalT, R.rival, rWhy) + personCard(R, s.partnerT[R.pos], R.partner, s.partnerWhy(pn));
  // 라이벌 학교 에이스 맞대결
  const ac = C(R.ace.c), aceWho = R.pos === "P" ? s.aceDuelP : s.aceDuelH;
  $("scAce").innerHTML = `<h2>${esc(s.hAce)}</h2>` + personCard(R, aceWho(pk.team[R.ace.c.team]), R.ace, (s.aceWhy[R.ace.rel] || s.aceWhy.other)(ac.name))
    + `<p class="sc-pred">${esc(s.predL)} <b>${esc(s.pred[R.ace.rel] || s.pred.other)}</b></p>`;
  // 청심료 룸메이트
  $("scRoom").hidden = !R.room;
  if (R.room) $("scRoom").innerHTML = `<h2>${esc(s.hRoom)}</h2><p class="split">${esc(s.roomNote)}</p><div class="sc-people">`
    + R.room.map(rc => personCard(R, s.roomT[rc === R.room[0] ? 0 : 1], rc, s.room[rc.c.id](C(rc.c).name))).join("") + `</div>`;
  LAST_R = R;
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
  applyStatic(); renderFriend(); render.silent = true; render(...LAST); render.silent = false;
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
renderFriend();
if (FRIEND) track("shared_link_open", { lang: LANG, page: "scout", school: FRIEND.school });
render(...LAST);
