
// ===== 언어 =====
const PACKS = { ko: PACK_KO, ja: PACK_JA, en: PACK_EN };
let LANG = "ko";
function pickLang() {
  const h = location.hash.replace("#", "");
  if (PACKS[h]) return h;
  try { const s = localStorage.getItem("daiya-lang"); if (PACKS[s]) return s; } catch (e) {}
  const n = (navigator.language || "ko").slice(0, 2);
  return n === "ja" ? "ja" : n === "en" ? "en" : "ko";
}
const P = () => PACKS[LANG];
const U = () => PACKS[LANG].ui;
// 선수 정보: 한국어는 원본, 그 외는 번역 팩을 덮어씀
const C = c => LANG === "ko" ? c : Object.assign({}, c, PACKS[LANG].chars[c.id]);
function chemOf(key) {
  if (LANG === "ko") return CHEM[key];
  const a = PACKS[LANG].chem[key];
  return a ? { c:a[0], g:a[1], b:a[2] } : null;
}

// ===== 렌더링 =====
const $ = id => document.getElementById(id);
function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" })[ch]); }
const stemName = i => U().stemName(i);
const grpName = g => P().groups[g];
const strLab = l => U().strength[l];
const teamTag = c => `<span class="team ${c.team}">${P().team[c.team]}</span>`;
const mini = c => `<span class="mini" style="background:${c.color}">${c.emoji}</span>`;
function godName(ds, stem) { const g = godOf(ds, stem); return U().gods[g.group][(ds % 2) === (stem % 2) ? 0 : 1]; }

const lab2 = (r, e) => LANG === "ko" ? r + e : LANG === "ja" ? e : r + " " + e;
function pillarHtml(p, ds, cols, other) {
  const u = U();
  return cols.map(([key, pil]) => {
    const lab = u.pil[key];
    if (!pil) return `<div class="pillar"><span class="lab">${lab}</span><div class="cell empty">${u.unknownTime}</div><div class="cell empty">${u.unknownTime}</div></div>`;
    const se = pil[0] >> 1, be = BR_EL[pil[1]];
    const sGod = key === "day" ? (other ? u.self : u.me) : godName(ds, pil[0]);
    const bGod = godName(ds, BR_MAIN[pil[1]]);
    return `<div class="pillar"><span class="lab">${lab}</span>
      <div class="cell${key === "day" ? " me" : ""}"><span class="han e-${EL[se]}">${STEMS[pil[0]]}</span><span class="kor">${lab2(u.stemsR[pil[0]], u.el[se])}</span><span class="god">${sGod}</span></div>
      <div class="cell"><span class="han e-${EL[be]}">${BRANCHES[pil[1]]}</span><span class="kor">${lab2(u.branchesR[pil[1]], u.el[be])}</span><span class="god">${bGod}</span></div></div>`;
  }).join("");
}
function elBars(el) {
  const mx = Math.max(...el, 1), u = U();
  return el.map((v, i) => `<div class="bar"><span>${EL_H[i]} ${LANG === "ja" ? "" : u.el[i]}</span><div class="track"><div class="fill" style="width:${v / mx * 100}%;background:var(--${EL[i]})"></div></div><span class="n">${v}</span></div>`).join("");
}

function applyStatic() {
  const u = U();
  document.documentElement.lang = u.htmlLang;
  document.title = u.title;
  ["eyebrow","h1a","h1b","lede","bd","bt","zi","ziNext","ziSame","nt","hint","go","youAre","tChar","tEp","hBirth","hMine","ohT","sgT","sameT","hOthers","hPairs","chemT","hDex","dexSum"].forEach(k => { const el = $("u-" + k); if (el) el.textContent = u[k]; });
  $("u-pairNote").innerHTML = u.pairNote;
  $("u-cxHint").textContent = u.cx.hint;
  $("u-notes").innerHTML = u.notes.map(n => `<p>${esc(n)}</p>`).join("")
    + `<p>${esc(u.contact)} <a href="https://x.com/Ace_torb" target="_blank" rel="noopener">X @Ace_torb</a></p>`;
  $("intro").hidden = !u.intro;
  if (u.intro) { $("u-introT").textContent = u.introT; $("u-intro").innerHTML = u.intro.map(t => `<p>${t}</p>`).join(""); }
  document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === LANG));
}

let CX = null, CX_PICK = null, CX_SEEN = false, LAST_RESULT = null, SILENT = false;
let LAST = [1997, 8, 21, 9, 40, true, "next", true];
function render(y, m, d, hh, mm, hasTime, ziMode, isSample) {
  LAST = [y, m, d, hh, mm, hasTime, ziMode, isSample];
  const u = U(), pk = P();
  const p = computeSaju(y, m, d, hh, mm, hasTime, ziMode);
  const a = analyze(p); a._p = p;
  const ds = p.day[0];
  const ranked = score(ds, a);
  const top = ranked[0], c = C(top.c);

  $("sampleTag").hidden = !isSample;
  $("sampleTag").textContent = u.sample(y, m, d, hasTime ? String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0") : "");
  $("avEmoji").textContent = c.emoji;
  $("av").style.background = c.color;
  $("avPct").textContent = pct(top.raw) + "%";
  $("av").classList.remove("pop"); void $("av").offsetWidth; $("av").classList.add("pop");
  $("mName").textContent = c.name;
  $("mAlias").innerHTML = teamTag(c) + esc(c.pos);
  $("mTag").textContent = c.tag;
  LAST_RESULT = { id: c.id, name: c.name, stem: stemName(c.stem), type: c.s > 0 ? u.strongType : u.weakType };
  $("copyLink").textContent = u.copyLink;
  if (!isSample && !SILENT) track("result_shown", { char: c.id, day_stem: ds, strength: { 신강:"strong", 신약:"weak", 중화:"balanced" }[a.strengthLabel], has_time: hasTime, lang: LANG });
  CX_SEEN = false;

  const pair = CHARS.filter(x => x.stem === ds).map(C);
  const strongC = pair.find(x => x.s > 0), weakC = pair.find(x => x.s < 0);
  $("split").innerHTML = u.split(esc(stemName(ds)), esc(strongC.name), esc(weakC.name), strLab(a.strengthLabel), Math.round(a.support * 100));

  // 근거
  const rs = [];
  const si = pk.stem[ds];
  const stemTxt = c.stem === ds ? c.why.stem : u.stemFallback(stemName(ds), si.sym, si.kw, strongC.name, weakC.name, c.name);
  rs.push([u.dayKey(stemName(ds)), stemTxt]);
  const bestPart = top.parts.filter(x => x.v > 0 && c.why[x.g]).sort((x, y) => y.v - x.v)[0];
  if (bestPart) rs.push([grpName(bestPart.g) + " " + Math.round(a.ratio[bestPart.i] * 100) + "%", c.why[bestPart.g]]);
  const sKey = c.s > 0 ? "strong" : "weak";
  const okS = c.s > 0 ? a.strengthLabel !== "신약" : a.strengthLabel !== "신강";
  if (c.why[sKey] && top.sPts > 0 && okS) rs.push([a.strengthLabel === "중화" ? (c.s > 0 ? u.midS : u.midW) : strLab(a.strengthLabel), c.why[sKey]]);
  $("reasons").innerHTML = rs.map(r => `<li><span class="k">${esc(r[0])}</span><p>${esc(r[1])}</p></li>`).join("");
  $("tChar").innerHTML = c.traits.map(t => `<li>${esc(t)}</li>`).join("");
  $("tEp").innerHTML = c.eps.map(t => `<li>${esc(t)}</li>`).join("");

  // 선수 생일 사주
  const [by, bm, bdd] = c.bday;
  const rel = relation(ds, c.rds), R = pk.rel[rel];
  const vsHtml = `<div class="vs">
      <div class="side"><div class="lbl">${u.myDay}</div><div class="big e-${EL[ds >> 1]}">${STEMS[ds]}</div><div class="lbl">${esc(stemName(ds))}</div></div>
      <div class="mid">${esc(R.k)}</div>
      <div class="side"><div class="lbl">${esc(c.name)}</div><div class="big e-${EL[c.rds >> 1]}">${STEMS[c.rds]}</div><div class="lbl">${esc(stemName(c.rds))}${c.real ? "" : u.persona}</div></div>
    </div>
    <p>${esc(R.d)}</p>`;
  if (!c.real) {
    $("birth").innerHTML = `<div class="bhead"><b>${esc(c.name)}</b><span>${u.birthHeadNoYear(bm, bdd)}</span></div>
      <p>${u.noYear(bm, bdd, esc(stemName(c.stem)))}</p>${vsHtml}`;
  } else {
    const typeNote = c.rds === c.stem ? u.sameType(esc(stemName(c.rds)))
      : u.diffType(esc(stemName(c.stem)), esc(stemName(c.rds)), esc(pk.stem[c.rds].sym), esc(pk.stem[c.rds].kw));
    const domR = c.ra.ratio.indexOf(Math.max(...c.ra.ratio));
    $("birth").innerHTML = `<div class="bhead"><b>${esc(c.name)}</b><span>${u.birthHead(bm, bdd, by)}</span></div>
      <div class="pillars-scroll"><div class="pillars">${pillarHtml(c.real, c.rds, [["hour", null], ["day", c.real.day], ["month", c.real.month], ["year", c.real.year]], true)}</div></div>
      <p>${typeNote}</p>
      <p>${u.birthStr(strLab(c.ra.strengthLabel), grpName(GROUPS[domR]), pk.gdesc[GROUPS[domR]])}</p>${vsHtml}`;
  }

  // 내 원국
  $("pillars").innerHTML = pillarHtml(p, ds, [["hour", p.hour], ["day", p.day], ["month", p.month], ["year", p.year]]);
  $("ohBars").innerHTML = elBars(a.el);
  $("sgBars").innerHTML = GROUPS.map((g, i) => `<div class="bar" title="${esc(pk.gdesc[g])}"><span>${grpName(g)}</span><div class="track"><div class="fill" style="width:${a.ratio[i] * 100}%;background:var(--accent)"></div></div><span class="n">${Math.round(a.ratio[i] * 100)}%</span></div>`).join("");
  const domI = a.ratio.indexOf(Math.max(...a.ratio));
  $("strength").innerHTML = u.strengthLine(strLab(a.strengthLabel), Math.round(a.support * 100), grpName(GROUPS[domI]), pk.gdesc[GROUPS[domI]]);
  const same = CHARS.filter(x => x.real && x.rds === ds).map(C);
  $("sameDay").innerHTML = same.length
    ? same.map(x => `<span class="chip">${mini(x)}${esc(u.chip(x.name, x.bday[1], x.bday[2]))}</span>`).join("")
    : `<span class="split">${esc(u.noneSame(stemName(ds)))}</span>`;

  // 다음 후보
  $("others").innerHTML = ranked.slice(1, 4).map(r => { const x = C(r.c); return `<div class="other">${mini(x)}<div><div class="nm">${esc(x.name)}</div><div class="sub">${esc(u.otherSub(pct(r.raw), pk.team[x.team], stemName(x.stem), x.s > 0 ? u.strongType : u.weakType))}</div></div></div>`; }).join("");

  // 궁합
  const cs = compat(ds, a, c.id);
  const best = cs[0], worst = cs[cs.length - 1];
  const pairHtml = (r, good) => {
    const x = C(r.c), ch = chemOf([c.id, x.id].sort().join("|")), RR = pk.rel[r.rel];
    const story = ch ? ch.c : u.fallbackStory(RR.d);
    const verdict = ch ? (good ? ch.g : ch.b) : (good ? RR.g : RR.b);
    return `<span class="kind">${good ? u.good : u.bad}</span>
      <div class="who">${mini(x)}
        <div><div class="nm">${esc(x.name)}</div><div class="sub">${teamTag(x)}${esc(u.pairSub(c.name))}</div></div>
        <span class="sc">${u.pts(r.score)}</span></div>
      <p class="story">${esc(story)}</p>
      <p class="split">${esc(u.relLine(x.name, !!x.real, stemName(x.rds), stemName(ds), RR.k))}</p>
      <p class="verdict">${esc(verdict)}</p>`;
  };
  $("pGood").innerHTML = pairHtml(best, true);
  $("pBad").innerHTML = pairHtml(worst, false);
  $("chem").innerHTML = cs.map(r => { const x = C(r.c); return `<button type="button" class="bar pick" data-id="${x.id}"><span>${x.emoji} ${esc(x.name)}</span><div class="track"><div class="fill" style="width:${r.score}%;background:${r.score >= 60 ? "var(--field)" : r.score < 40 ? "var(--fire)" : "var(--earth)"}"></div></div><span class="n">${r.score}</span></button>`; }).join("");
  CX = { ds, a, p, me: c };
  const keep = cs.find(r => r.c.id === CX_PICK);
  renderCx(keep ? keep.c : best.c);

  // 도감
  const rows = [...CHARS].sort((x, y) => (!x.real) - (!y.real) || x.rds - y.rds || x.bday[1] - y.bday[1]).map(C);
  $("dex").innerHTML = `<tr>${u.dexHead.map(h => `<th>${h}</th>`).join("")}</tr>` +
    rows.map(x => `<tr class="${x.real && x.rds === ds ? "hit" : ""}"><td>${x.emoji} ${esc(x.name)}</td><td>${u.dexBirth(x.bday[1], x.bday[2])}</td>` +
      (x.real ? `<td class="han">${STEMS[x.real.day[0]]}${BRANCHES[x.real.day[1]]}</td><td class="e-${EL[x.rds >> 1]}">${esc(stemName(x.rds))}</td><td>${strLab(x.ra.strengthLabel)}</td>` : `<td>—</td><td>${u.dexNoYear}</td><td>—</td>`) +
      `<td>${esc(stemName(x.stem))} ${x.s > 0 ? u.strongType : u.weakType}</td></tr>`).join("");
}

// ===== 궁합 풀이 =====
function renderCx(rc) {
  const u = U(), x = U().cx, pk = P();
  const { ds, a, p, me } = CX;
  const t = C(rc), r = compatOne(ds, a, rc), q = r.parts, R = pk.rel[r.rel];
  CX_PICK = rc.id;
  document.querySelectorAll("#chem .pick").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === rc.id));
  const pts = v => `<span class="pts ${v > 0 ? "up" : v < 0 ? "down" : ""}">${v > 0 ? "+" : ""}${v}</span>`;
  const elList = arr => arr.map(i => (LANG === "en" ? "" : EL_H[i]) + (LANG === "ja" ? "" : (LANG === "en" ? u.el[i] : "(" + u.el[i] + ")"))).join(LANG === "ja" ? "・" : ", ");
  const bLab = b => LANG === "ko" ? BRANCHES[b] + " " + BRANCHES_K[b] : LANG === "ja" ? BRANCHES[b] : u.branchesR[b] + " (" + BRANCHES[b] + ")";
  const zLab = b => LANG === "ko" ? x.zod[b] + x.zodSuf : x.zod[b];
  const items = [];
  items.push([x.kDay, r.parts.relPts, `<b>${esc(stemName(ds))}</b> × <b>${esc(stemName(t.rds))}</b> · ${esc(R.k)}${LANG === "ja" ? "：" : ". "}${esc(R.d)}`]);
  if (t.real) {
    let f = x.fillNone;
    if (q.fillGood.length && q.fillBad.length) f = x.fillBoth(elList(q.fillGood), elList(q.fillBad));
    else if (q.fillGood.length) f = x.fillGood(elList(q.fillGood));
    else if (q.fillBad.length) f = x.fillBad(elList(q.fillBad));
    items.push([x.kFill, q.fillPts, esc(f)]);
    items.push([x.kDayB, q.dayPts, esc(x.br[q.dayRel](bLab(p.day[1]), bLab(t.real.day[1]))) + `<br><span class="sub">${esc(x.dayBNote)}</span>`]);
    items.push([x.kYear, q.yearPts, esc(x.br[q.yearRel](zLab(p.year[1]), zLab(t.real.year[1]))) + `<br><span class="sub">${esc(x.yearNote)}</span>`]);
  } else {
    items.push([x.kFill, null, esc(x.noBranch)]);
  }
  const g1 = godOf(ds, t.rds), g2 = godOf(t.rds, ds);
  const gn1 = u.gods[g1.group][(ds % 2) === (t.rds % 2) ? 0 : 1], gn2 = u.gods[g2.group][(ds % 2) === (t.rds % 2) ? 0 : 1];
  items.push([x.kGod, null, x.godLine(esc(t.name), gn1, esc(x.godDesc[GROUPS[g1.group]]), gn2, esc(x.godDesc[GROUPS[g2.group]]))]);
  const theirs = t.real
    ? `<div class="pillars-scroll"><div class="pillars">${pillarHtml(t.real, t.rds, [["hour", null], ["day", t.real.day], ["month", t.real.month], ["year", t.real.year]], true)}</div></div>`
    : `<p class="split">${esc(x.noReal(t.name))}</p>`;
  $("cpx").innerHTML = `
    <div class="cx-head">${mini(t)}<div><h3>${esc(x.h)}</h3><div class="sub">${esc(x.title("", t.name))}</div></div><div class="cx-score"><b>${r.score}</b><span>${esc(x.total)}</span></div></div>
    <div class="cx-charts">
      <div><h4>${esc(x.mine)}</h4><div class="pillars-scroll"><div class="pillars">${pillarHtml(p, ds, [["hour", p.hour], ["day", p.day], ["month", p.month], ["year", p.year]])}</div></div></div>
      <div><h4>${esc(x.theirs(t.name))}</h4>${theirs}</div>
    </div>
    <ul class="cx-list"><li><span class="k">${esc(x.base)}</span><span class="pts">50</span><p></p></li>${items.map(([k, v, txt]) => `<li><span class="k">${esc(k)}</span>${v == null ? "<span class=\"pts\"></span>" : pts(v)}<p>${txt}</p></li>`).join("")}</ul>
    <p class="verdict">${esc(x.verdict(r.score))}</p>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("#chem .pick"); if (!b || !CX) return;
  const rc = CHARS.find(c => c.id === b.dataset.id); renderCx(rc);
  track("compat_pick", { char: rc.id, lang: LANG });
  $("cpx").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});

function setLang(l) {
  LANG = l;
  try { localStorage.setItem("daiya-lang", l); } catch (e) {}
  if (location.hash.replace("#", "") !== l) { try { history.replaceState(null, "", "#" + l); } catch (e) { location.hash = l; } }
  applyStatic();
  SILENT = true; render(...LAST); SILENT = false; // 언어만 바꾼 건 새 결과로 세지 않음
  track("lang_change", { lang: l });
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
  if (hasTime) { [hh, mm] = $("bt").value.split(":").map(Number); }
  err.hidden = true;
  CX_PICK = null;
  track("submit_birth", { has_time: hasTime, lang: LANG });
  render(+mt[1], +mt[2], +mt[3], hh, mm, hasTime, $("zi").value, false);
  $("result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});

// ===== 공유 =====
function shareUrl() {
  const base = (window.DAIYA_CONFIG && window.DAIYA_CONFIG.siteUrl) || (location.origin + location.pathname);
  return base + "#" + LANG;
}
$("copyLink").addEventListener("click", async () => {
  track("share_click", { channel: "copy", char: LAST_RESULT && LAST_RESULT.id, lang: LANG });
  try { await navigator.clipboard.writeText(shareUrl()); $("copyLink").textContent = U().copied; setTimeout(() => $("copyLink").textContent = U().copyLink, 1600); } catch (e) {}
});

// ===== 탐색 행동 추적 =====
document.querySelector("details.dex").addEventListener("toggle", e => { if (e.target.open) track("dex_open", { lang: LANG }); });
$("u-introT").addEventListener("click", () => track("intro_toggle", { open: !$("intro").open, lang: LANG }));
if ("IntersectionObserver" in window) {
  new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting && !CX_SEEN && $("sampleTag").hidden) { CX_SEEN = true; track("compat_view", { lang: LANG }); }
  }), { threshold: 0.4 }).observe($("cpx"));
}

LANG = pickLang();
applyStatic();
render(...LAST);
