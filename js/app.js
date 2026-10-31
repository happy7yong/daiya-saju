
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
function pillarHtml(p, ds, cols, other, plain) {
  const u = U();
  return cols.map(([key, pil]) => {
    const lab = u.pil[key];
    if (!pil) return `<div class="pillar"><span class="lab">${lab}</span><div class="cell empty">${u.unknownTime}</div><div class="cell empty">${u.unknownTime}</div></div>`;
    const se = pil[0] >> 1, be = BR_EL[pil[1]];
    const sGod = key === "day" ? (plain ? u.dayOnly : other ? u.self : u.me) : godName(ds, pil[0]);
    const bGod = godName(ds, BR_MAIN[pil[1]]);
    return `<div class="pillar"><span class="lab">${lab}</span>
      <div class="cell${key === "day" ? " me" : ""}"><span class="han e-${EL[se]}">${STEMS[pil[0]]}</span><span class="kor">${lab2(u.stemsR[pil[0]], u.el[se])}</span><span class="god">${sGod}</span></div>
      <div class="cell"><span class="han e-${EL[be]}">${BRANCHES[pil[1]]}</span><span class="kor">${lab2(u.branchesR[pil[1]], u.el[be])}</span><span class="god">${bGod}</span></div></div>`;
  }).join("");
}
// 오행 풀이: 가장 많은 오행 / 없는 오행을 내 일간 기준 십성으로 읽기
const EL_EMO = ["🌳","🔥","⛰️","⚔️","💧"];
function elReadHtml(p, ds, a) {
  const u = U(), x = u.elx, el = a.el, total = el.reduce((s, v) => s + v, 0);
  const gOf = e => (e - (ds >> 1) + 5) % 5;
  const mEl = BR_EL[p.month[1]];   // 동점이면 월지(계절) 기운 우선
  const top = el.reduce((b, v, i) => v > el[b] || (v === el[b] && i === mEl) ? i : b, 0);
  const g = gOf(top), pct = Math.round(el[top] / total * 100);
  let h = `<div class="er"><h5>${EL_EMO[top]} ${esc(x.domT(u.el[top], pct, grpName(GROUPS[g])))}</h5>`
    + `<p>${esc(x.lead(stemName(ds), u.el[top], grpName(GROUPS[g]), g === 0))}</p>`
    + `<p class="key">${esc(x.dom[g])}</p>`
    + (el[top] / total >= 0.5 ? `<p>${esc(x.over[g])}</p>` : "") + `</div>`;
  const miss = el.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  if (!miss.length) return h + (el[top] / total >= 0.375
    ? `<div class="er"><h5>✨ ${esc(x.allT)}</h5><p>${esc(x.allLean(u.el[top]))}</p></div>`
    : `<div class="er"><h5>✨ ${esc(x.allT)}</h5><p class="key">${esc(x.all)}</p></div>`);
  miss.forEach(e => {
    const gm = gOf(e);
    const fill = CHARS.filter(c => c.real).reduce((b, c) => !b || c.ra.el[e] > b.ra.el[e] ? c : b, null);
    h += `<div class="er miss"><h5>${EL_EMO[e]} ${esc(x.missT(u.el[e], grpName(GROUPS[gm])))}</h5>`
      + `<p>${esc(x.miss[gm])}</p>`
      + `<p class="fillp">🤝 ${esc(x.fill(C(fill).name, u.el[e])).replace(esc(C(fill).name), `<b>${esc(C(fill).name)}</b>`)}</p></div>`;
  });
  return h;
}

function elBars(el) {
  const mx = Math.max(...el, 1), u = U();
  return el.map((v, i) => `<div class="bar"><span>${EL_H[i]} ${LANG === "ja" ? "" : u.el[i]}</span><div class="track"><div class="fill" style="width:${v / mx * 100}%;background:var(--${EL[i]})"></div></div><span class="n">${v}</span></div>`).join("");
}

function applyStatic() {
  const u = U();
  document.documentElement.lang = u.htmlLang;
  document.title = u.title;
  ["hMatch","eyebrow","h1a","h1b","lede","bd","bt","zi","ziNext","ziSame","nt","hint","go","youAre","tChar","tEp","hBirth","hMine","ohT","sgT","sameT","hOthers","hPairs","chemT","hDex","dexSum"].forEach(k => { const el = $("u-" + k); if (el) el.textContent = u[k]; });
  $("u-pairNote").innerHTML = u.pairNote;
  $("u-cxHint").textContent = u.cx.hint;
  $("u-notes").innerHTML = u.notes.map(n => `<p>${esc(n)}</p>`).join("");
  $("intro").hidden = !u.intro;
  if (u.intro) { $("u-introT").textContent = u.introT; $("u-intro").innerHTML = u.intro.map(t => `<p>${t}</p>`).join(""); }
  document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === LANG));
}

let CX = null, CX_PICK = null, BEST_ID = null, CX_SEEN = false, LAST_RESULT = null, SILENT = false;
let LAST = [1997, 8, 21, 9, 40, true, "next", true];
function render(y, m, d, hh, mm, hasTime, ziMode, isSample) {
  LAST = [y, m, d, hh, mm, hasTime, ziMode, isSample];
  const u = U(), pk = P();
  const p = computeSaju(y, m, d, hh, mm, hasTime, ziMode);
  const a = analyze(p); a._p = p;
  const ds = p.day[0];
  const ranked = scoreReal(ds, a);
  const top = ranked[0], c = C(top.c);
  let prevPct = pct(top.raw);
  const OTHER_PCT = ranked.slice(1, 4).map(r => (prevPct = Math.min(pct(r.raw), prevPct - 1)));

  $("sampleTag").hidden = !isSample;
  $("sampleTag").textContent = u.sample(y, m, d, hasTime ? String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0") : "");
  $("avEmoji").textContent = c.emoji;
  $("av").style.background = c.color;
  $("avPct").textContent = pct(top.raw) + "%";
  $("av").classList.remove("pop"); void $("av").offsetWidth; $("av").classList.add("pop");
  $("mName").textContent = c.name;
  $("mAlias").innerHTML = teamTag(c) + esc(c.pos);
  $("mTag").textContent = c.tag;
  LAST_RESULT = { id: c.id, name: c.name, stem: stemName(c.rds), type: strLab(c.ra.strengthLabel),
    ds, s: a.strengthLabel === "신강" ? "s" : a.strengthLabel === "신약" ? "w" : "b", pct: pct(top.raw),
    others: ranked.slice(1, 4).map((r, i) => [r.c.id, OTHER_PCT[i]]) };
  $("shareBox").hidden = isSample;
  $("copyLink").textContent = u.shareMine;
  $("shareNote").textContent = "";
  if (!isSample && !SILENT) track("result_shown", { char: c.id, day_stem: ds, strength: { 신강:"strong", 신약:"weak", 중화:"balanced" }[a.strengthLabel], has_time: hasTime, lang: LANG });
  CX_SEEN = false;

  // 나와 같은 일간으로 태어난 선수 안내
  const sameStem = CHARS.filter(x => x.real && x.rds === ds).map(C);
  $("split").innerHTML = sameStem.length
    ? u.splitR(esc(stemName(ds)), sameStem.map(x => `<b>${esc(x.name)}</b>`).join(", "), strLab(a.strengthLabel), Math.round(a.support * 100))
    : `<span class="rare">✨ ${esc(u.rare)}</span>` + (top.tier === 1 ? u.splitSib(esc(stemName(ds)), u.el[ds >> 1], strLab(a.strengthLabel), Math.round(a.support * 100))
    : u.splitNone(esc(stemName(ds)), strLab(a.strengthLabel), Math.round(a.support * 100)));

  // 근거: 일간 → 가장 닮은 십성 → 신강약 (모두 선수의 실제 생일 사주와 비교)
  const rs = [];
  const lead = c.rds === ds ? u.leadSame(stemName(ds))
    : (c.rds >> 1) === (ds >> 1) ? u.leadSib(stemName(ds), stemName(c.rds), u.el[ds >> 1])
    : u.leadOther(stemName(ds), stemName(c.rds));
  rs.push([u.dayKey(stemName(c.rds)), lead + " " + pk.realStem[c.id]]);
  const gi = top.sharedI, gk = GROUPS[gi];
  rs.push([grpName(gk), u.sharedGroup(grpName(gk), pk.gdesc[gk], Math.round(a.ratio[gi] * 100), Math.round(c.ra.ratio[gi] * 100)) + (c.why[gk] ? " " + c.why[gk] : "")]);
  if (top.sameStrength) {
    const sk = c.ra.strengthLabel === "신강" ? "strong" : c.ra.strengthLabel === "신약" ? "weak" : null;
    rs.push([strLab(a.strengthLabel), u.sameStrength(strLab(a.strengthLabel)) + (sk && c.why[sk] ? " " + c.why[sk] : "")]);
  }
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
    const domR = c.ra.ratio.indexOf(Math.max(...c.ra.ratio));
    $("birth").innerHTML = `<div class="bhead"><b>${esc(c.name)}</b><span>${u.birthHead(bm, bdd, by)}</span></div>
      <div class="pillars-scroll"><div class="pillars">${pillarHtml(c.real, c.rds, [["hour", null], ["day", c.real.day], ["month", c.real.month], ["year", c.real.year]], true)}</div></div>
      <p>${u.birthStr(strLab(c.ra.strengthLabel), grpName(GROUPS[domR]), pk.gdesc[GROUPS[domR]])}</p>${vsHtml}`;
  }

  // 내 원국
  $("pillars").innerHTML = pillarHtml(p, ds, [["hour", p.hour], ["day", p.day], ["month", p.month], ["year", p.year]]);
  $("ohBars").innerHTML = elBars(a.el);
  $("sgBars").innerHTML = GROUPS.map((g, i) => `<div class="bar" title="${esc(pk.gdesc[g])}"><span>${grpName(g)}</span><div class="track"><div class="fill" style="width:${a.ratio[i] * 100}%;background:var(--accent)"></div></div><span class="n">${Math.round(a.ratio[i] * 100)}%</span></div>`).join("");
  const domI = a.ratio.indexOf(Math.max(...a.ratio));
  $("strength").innerHTML = u.strengthLine(strLab(a.strengthLabel), Math.round(a.support * 100), grpName(GROUPS[domI]), pk.gdesc[GROUPS[domI]]);
  $("elRead").innerHTML = elReadHtml(p, ds, a);
  const same = CHARS.filter(x => x.real && x.rds === ds).map(C);
  $("sameDay").innerHTML = same.length
    ? same.map(x => `<span class="chip">${mini(x)}${esc(u.chip(x.name, x.bday[1], x.bday[2]))}</span>`).join("")
    : `<span class="split">${esc(u.noneSame(stemName(ds)))}</span>`;

  // 다음 후보
  $("others").innerHTML = ranked.slice(1, 4).map((r, i) => { const x = C(r.c); return `<div class="other">${mini(x)}<div><div class="nm">${esc(x.name)}</div><div class="sub">${esc(u.otherSub(OTHER_PCT[i], pk.team[x.team], stemName(x.rds), strLab(x.ra.strengthLabel)))}</div></div></div>`; }).join("");

  // 궁합
  const cs = compat(ds, a, c.id);
  CX = { ds, a, p, me: c };
  BEST_ID = cs[0].c.id;
  LAST_RESULT.best = cs[0].c.id; LAST_RESULT.bestScore = cs[0].score;
  LAST_RESULT.topCompat = cs.slice(0, 3).map(r => [r.c.id, r.score]);
  renderFriend(ds, a);
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
  // 찰떡 배터리: 닮은 선수 결과와 같은 히어로 형태
  const heroHtml = r => {
    const x = C(r.c), ch = chemOf([c.id, x.id].sort().join("|")), RR = pk.rel[r.rel];
    const story = ch ? ch.c : u.fallbackStory(RR.d);
    const verdict = ch ? ch.g : RR.g;
    return `<span class="kind">${u.good}</span>
      <div class="match">
        <div class="ball"><div class="avatar" style="background:${x.color}"><span>${x.emoji}</span></div><span class="pct">${u.pts(r.score)}</span></div>
        <div class="match-text">
          <span class="you-are">${esc(u.bestIs)}</span>
          <h3>${esc(x.name)}</h3>
          <span class="alias">${teamTag(x)}${esc(x.pos)}</span>
          <p class="tagline">${esc(x.tag)}</p>
        </div>
      </div>
      <p class="story">${esc(story)}</p>
      <p class="split">${esc(u.relLine(x.name, !!x.real, stemName(x.rds), stemName(ds), RR.k))}</p>
      <p class="verdict">${esc(verdict)}</p>
      <div class="cx-in">${cxHtml(r.c)}</div>`;
  };
  $("pGood").innerHTML = heroHtml(best);
  $("pBad").innerHTML = pairHtml(worst, false);
  $("chem").innerHTML = cs.map(r => { const x = C(r.c); return `<button type="button" class="bar pick" data-id="${x.id}"><span>${x.emoji} ${esc(x.name)}</span><div class="track"><div class="fill" style="width:${r.score}%;background:${r.score >= 60 ? "var(--field)" : r.score < 40 ? "var(--fire)" : "var(--earth)"}"></div></div><span class="n">${r.score}</span></button>`; }).join("");
  const keep = cs.find(r => r.c.id === CX_PICK);
  renderCx(keep ? keep.c : best.c);

  // 도감
  const rows = [...CHARS].sort((x, y) => (!x.real) - (!y.real) || x.rds - y.rds || x.bday[1] - y.bday[1]).map(C);
  $("dex").innerHTML = `<tr>${u.dexHead.slice(0, 5).map(h => `<th>${h}</th>`).join("")}</tr>` +
    rows.map(x => `<tr class="${x.real && x.rds === ds ? "hit" : ""}"><td>${x.emoji} ${esc(x.name)}</td><td>${u.dexBirth(x.bday[1], x.bday[2])}</td>` +
      (x.real ? `<td class="han">${STEMS[x.real.day[0]]}${BRANCHES[x.real.day[1]]}</td><td class="e-${EL[x.rds >> 1]}">${esc(stemName(x.rds))}</td><td>${strLab(x.ra.strengthLabel)}</td>` : `<td>—</td><td>${u.dexNoYear}</td><td>—</td>`) +
      `</tr>`).join("");
}

// ===== 궁합 풀이 =====
function markPick(id) {
  document.querySelectorAll("#chem .pick").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === id));
}
// 다른 선수를 골랐을 때: 아래쪽 별도 칸에 풀이 표시 (찰떡 배터리는 위 카드 안에 이미 있음)
function renderCx(rc) {
  CX_PICK = rc.id;
  markPick(rc.id);
  if (rc.id === BEST_ID) { $("cpx").hidden = true; return; }
  $("cpx").hidden = false;
  $("cpx").innerHTML = cxHtml(rc);
}
function cxHtml(rc) {
  const u = U(), x = U().cx, pk = P();
  const { ds, a, p, me } = CX;
  const t = C(rc), r = compatOne(ds, a, rc), q = r.parts, R = pk.rel[r.rel];
  const pts = v => `<span class="pts ${v > 0 ? "up" : v < 0 ? "down" : ""}">${v > 0 ? "+" : ""}${v}</span>`;
  const elList = arr => arr.map(i => (LANG === "en" ? "" : EL_H[i]) + (LANG === "ja" ? "" : (LANG === "en" ? u.el[i] : "(" + u.el[i] + ")"))).join(LANG === "ja" ? "・" : ", ");
  const bLab = b => LANG === "ko" ? BRANCHES[b] + " " + BRANCHES_K[b] : LANG === "ja" ? BRANCHES[b] : u.branchesR[b] + " (" + BRANCHES[b] + ")";
  const zLab = b => LANG === "ko" ? x.zod[b] + x.zodSuf : x.zod[b];
  const items = [];
  items.push([x.kDay, r.parts.relPts, `<b>${esc(stemName(ds))}</b> × <b>${esc(stemName(t.rds))}</b> · ${esc(R.k)}${LANG === "ja" ? "：" : ". "}${esc(R.d)}`]);
  if (t.real) {
    let f = q.fillPts >= 3 ? x.fillSome : x.fillNone;
    if (q.fillGood.length && q.fillBad.length) f = x.fillBoth(elList(q.fillGood), elList(q.fillBad));
    else if (q.fillGood.length) f = x.fillGood(elList(q.fillGood));
    else if (q.fillBad.length) f = x.fillBad(elList(q.fillBad));
    if (q.fillYong.length) f += " " + x.yongNote(elList(q.fillYong), a.support < 0.45);
    items.push([x.kFill, q.fillPts, esc(f) + `<br><span class="sub">${esc(x.yongBase(elList(q.yong), a.support < 0.45))}</span>`]);
    if (q.johu) items.push([x.kJohu, q.johuPts, esc(x.johu[q.johu.season](elList([q.johu.el]), q.johuPts))]);
    items.push([x.kDayB, q.dayPts, esc(x.br[q.dayRel](bLab(p.day[1]), bLab(t.real.day[1]))) + `<br><span class="sub">${esc(x.dayBNote)}</span>`]);
    items.push([x.kYear, q.yearPts, esc(x.br[q.yearRel](zLab(p.year[1]), zLab(t.real.year[1]))) + `<br><span class="sub">${esc(x.yearNote)}</span>`]);
    if (q.hidden) { const sn = i => LANG === "ko" ? STEMS_K[i] : LANG === "ja" ? STEMS[i] : u.stemsR[i];
      items.push([x.kHidden, q.hiddenPts, esc(q.hidden.mine ? x.hiddenMine(sn(ds), x.slot[q.hidden.slot], sn(q.hidden.stem)) : x.hiddenTheirs(sn(t.rds), x.slot[q.hidden.slot], sn(q.hidden.stem)))]); }
    if (q.twin) { const il = LANG === "ko" ? STEMS_K[p.day[0]] + BRANCHES_K[p.day[1]] : LANG === "ja" ? STEMS[p.day[0]] + BRANCHES[p.day[1]] : u.stemsR[p.day[0]] + "-" + u.branchesR[p.day[1]];
      items.push([x.kTwin, q.twinPts, esc(x.twin(il))]); }
  } else {
    items.push([x.kFill, null, esc(x.noBranch)]);
  }
  const g1 = godOf(ds, t.rds), g2 = godOf(t.rds, ds);
  const gn1 = u.gods[g1.group][(ds % 2) === (t.rds % 2) ? 0 : 1], gn2 = u.gods[g2.group][(ds % 2) === (t.rds % 2) ? 0 : 1];
  items.push([x.kGod, null, x.godLine(esc(t.name), gn1, esc(x.godDesc[GROUPS[g1.group]]), gn2, esc(x.godDesc[GROUPS[g2.group]]))]);
  const theirs = t.real
    ? `<div class="pillars-scroll"><div class="pillars">${pillarHtml(t.real, t.rds, [["hour", null], ["day", t.real.day], ["month", t.real.month], ["year", t.real.year]], true, true)}</div></div>`
    : `<p class="split">${esc(x.noReal(t.name))}</p>`;
  return `
    <div class="cx-head"><div><h3>${esc(x.h)}</h3><div class="sub">${esc(x.title("", t.name))}</div></div><div class="cx-score"><b>${r.score}</b><span>${esc(x.total)}</span></div></div>
    <div class="cx-charts">
      <div><h4>${esc(x.mine)}</h4><div class="pillars-scroll"><div class="pillars">${pillarHtml(p, ds, [["hour", p.hour], ["day", p.day], ["month", p.month], ["year", p.year]], false, true)}</div></div></div>
      <div><h4>${esc(x.theirs(t.name))}</h4>${theirs}</div>
    </div>
    <ul class="cx-list"><li><span class="k">${esc(x.base)}</span><span class="pts">50</span><p></p></li>${items.map(([k, v, txt]) => `<li><span class="k">${esc(k)}</span>${v == null ? "<span class=\"pts\"></span>" : pts(v)}<p>${txt}</p></li>`).join("")}</ul>
    <p class="verdict">${esc(x.verdict(r.score))}</p>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("#chem .pick"); if (!b || !CX) return;
  const rc = CHARS.find(c => c.id === b.dataset.id); renderCx(rc);
  track("compat_pick", { char: rc.id, lang: LANG });
  (rc.id === BEST_ID ? $("pGood") : $("cpx")).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
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
  track("submit_birth", { has_time: hasTime, lang: LANG, from_share: !!FRIEND });
  render(+mt[1], +mt[2], +mt[3], hh, mm, hasTime, $("zi").value, false);
  $("mine").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});

// ===== 공유 =====
function shareUrl() {
  const base = (window.DAIYA_CONFIG && window.DAIYA_CONFIG.siteUrl) || (location.origin + location.pathname);
  return base + "#" + LANG;
}

// ===== 탐색 행동 추적 =====
document.querySelector("details.dex").addEventListener("toggle", e => { if (e.target.open) track("dex_open", { lang: LANG }); });
$("u-introT").addEventListener("click", () => track("intro_toggle", { open: !$("intro").open, lang: LANG }));
if ("IntersectionObserver" in window) {
  new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting && !CX_SEEN && $("sampleTag").hidden) { CX_SEEN = true; track("compat_view", { lang: LANG }); }
  }), { threshold: 0.25 }).observe($("pGood"));
}

// ===== 결과 카드 공유 (생년월일은 링크에 넣지 않음) =====
// ?r=<선수id>.<일간0~9>.<s|w|b>.<닮음%>.<찰떡 배터리id>.<점수>[.<다음 닮은 선수id>.<%> ×3]
function parseFriend() {
  try {
    const r = new URLSearchParams(location.search).get("r");
    if (!r) return null;
    const parts = r.split("."), [id, ds, s, p, bid, bs] = parts;
    const ch = CHARS.find(c => c.id === id), bc = CHARS.find(c => c.id === bid);
    const d = +ds, pc = +p, sc = +bs;
    if (!ch || !bc || !(d >= 0 && d <= 9) || !"swb".includes(s) || !(pc >= 0 && pc <= 100) || !(sc >= 0 && sc <= 100)) return null;
    const others = [];
    for (let i = 6; i + 1 < parts.length && others.length < 3; i += 2) {
      const oc = CHARS.find(c => c.id === parts[i]), op = +parts[i + 1];
      if (oc && op >= 0 && op <= 100) others.push([oc, op]);
    }
    // 궁합 TOP3: &c=<id>.<점수> ×3 (없으면 찰떡 배터리 1명만)
    const top = [];
    const cp = (new URLSearchParams(location.search).get("c") || "").split(".");
    for (let i = 0; i + 1 < cp.length && top.length < 3; i += 2) {
      const tc = CHARS.find(c => c.id === cp[i]), ts = +cp[i + 1];
      if (tc && ts >= 0 && ts <= 100) top.push([tc, ts]);
    }
    if (!top.length) top.push([bc, sc]);
    return { ch, ds: d, s, pct: pc, best: bc, bestScore: sc, others, top };
  } catch (e) { return null; }
}
const FRIEND = parseFriend();
function resultUrl() {
  const R = LAST_RESULT;
  const base = (window.DAIYA_CONFIG && window.DAIYA_CONFIG.siteUrl) || (location.origin + location.pathname);
  return base + "?r=" + [R.id, R.ds, R.s, R.pct, R.best, R.bestScore, ...R.others.flat()].join(".")
    + "&c=" + R.topCompat.flat().join(".") + "#" + LANG;
}
function renderFriend(myDs, myA) {
  const box = $("friend");
  if (!FRIEND) { box.hidden = true; return; }
  const u = U(), pk = P(), f = FRIEND, x = C(f.ch), b = C(f.best);
  const strength = u.strength[{ s:"신강", w:"신약", b:"중화" }[f.s]];
  let mine = "";
  if ($("sampleTag").hidden) { // 내가 직접 결과를 냈을 때만 친구와의 궁합 표시
    const rel = relation(myDs, f.ds), R = pk.rel[rel];
    const sc = Math.max(5, Math.min(99, 50 + { hap:30, chung:-30, same:10, give:6, get:14, ctrl:-4, hit:-14 }[rel]));
    mine = `<div class="friend-vs"><b>${esc(u.friendCompat)}</b> <span class="sc">${u.pts(sc)}</span>
      <p>${esc(stemName(myDs))} × ${esc(stemName(f.ds))} · ${esc(R.k)}. ${esc(sc >= 60 ? R.g : R.b)}</p></div>`;
  }
  box.hidden = false;
  box.innerHTML = `<span class="friend-label">${esc(u.friendT)}</span>
    <div class="friend-main">${mini(x)}<div><div class="nm">${esc(x.name)}</div>
      <div class="sub">${esc(stemName(f.ds))} · ${esc(strength)} · ${esc(u.friendPct(f.pct))}</div></div></div>
    <div class="friend-others friend-top"><span>${esc(u.friendTop)}</span>${f.top.map(([tc, ts], i) => { const o = C(tc); return `<span class="chip${i === 0 ? " first" : ""}">${mini(o)}${esc(o.name)} · ${u.pts(ts)}</span>`; }).join("")}</div>
    ${f.others.length ? `<div class="friend-others"><span>${esc(u.hOthers)}</span>${f.others.map(([oc, op]) => { const o = C(oc); return `<span class="chip">${mini(o)}${esc(o.name)} · ${op}%</span>`; }).join("")}</div>` : ""}
    ${mine || `<button type="button" class="go friend-go" id="friendGo">${esc(u.tryMine)}</button>`}`;
  const go = $("friendGo");
  if (go) go.addEventListener("click", () => { $("bd").focus(); $("f").scrollIntoView({ behavior: "smooth", block: "center" }); track("friend_try_click", { lang: LANG }); });
}
$("copyLink").addEventListener("click", async () => {
  if (!LAST_RESULT) return;
  const url = resultUrl();
  track("share_click", { channel: "copy", char: LAST_RESULT.id, lang: LANG });
  try { await navigator.clipboard.writeText(url); $("shareNote").textContent = U().copied; }
  catch (e) { $("shareNote").textContent = url; } // 복사가 막힌 브라우저: 링크를 직접 보여 줌
  setTimeout(() => { if ($("shareNote").textContent === U().copied) $("shareNote").textContent = ""; }, 2500);
});
if (FRIEND) track("shared_link_open", { char: FRIEND.ch.id, lang: pickLang() });

LANG = pickLang();
applyStatic();
render(...LAST);
