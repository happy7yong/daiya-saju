
// ===== 작중 관계가 있는 조합 (c: 관계, g: 잘 맞을 때, b: 삐걱일 때) =====
const CHEM_NEW = {
  "eijun|okumura": { c:"2부에서 새로 배터리를 이룬 사이예요. 사와무라의 까다로운 공을 1학년 포수 오쿠무라가 받아 내며 함께 맞춰 가요.", g:"뜨거운 투수와 냉정한 포수, 서로를 다잡아 주는 새 배터리예요.", b:"텐션 높은 사와무라와 쿨한 오쿠무라, 처음엔 온도 차 때문에 자주 부딪혀요." },
  "miyuki|okumura": { c:"오쿠무라는 미유키의 리드를 보며 배우려는 1학년 포수예요. 미유키는 무심한 듯 후배 포수를 키워요.", g:"천재 포수와 그 리드를 흡수하는 후배, 세이도 안방이 이어지는 사이예요.", b:"미유키의 능글맞은 태도가 진지한 오쿠무라에겐 답답하게 느껴질 수 있어요." },
  "okumura|yui": { c:"같은 1학년 포수로 마스크를 두고 경쟁하는 라이벌이에요.", g:"서로가 있어서 더 빨리 크는, 동갑 포수 라이벌이에요.", b:"자리는 하나라서 한쪽이 기회를 잡으면 다른 쪽 속이 타요." },
  "eijun|kanemaru": { c:"같은 학년 동기예요. 카네마루는 사와무라에게 매번 날카롭게 츳코미를 걸면서도 공부까지 챙겨 줘요.", g:"엉뚱한 사와무라와 현실적인 카네마루, 서로 없으면 허전한 동기예요.", b:"사와무라의 엉뚱함에 카네마루의 잔소리가 끝없이 이어져요." },
  "kanemaru|toujou": { c:"같은 학년으로 늘 붙어 다니는 친한 동기예요.", g:"직설적인 카네마루와 차분한 토죠, 서로를 가장 편하게 해 주는 친구예요.", b:"둘 다 남을 챙기느라 정작 자기 고민은 미뤄 두기 쉬워요." },
  "eijun|toujou": { c:"같은 학년 투수로 입학했어요. 토죠는 야수로 전향했지만 사와무라를 차분하게 응원해요.", g:"뜨거운 사와무라 곁의 차분한 토죠, 균형이 잘 맞는 동기예요.", b:"같은 꿈을 꾸던 사이라 서로 미묘하게 마음이 쓰일 수 있어요." },
  "furuya|kanemaru": { c:"같은 학년 동기예요. 마이페이스 후루야도 카네마루의 츳코미는 피해 가지 못해요.", g:"멍한 후루야를 카네마루가 현실로 끌어와 주는 사이예요.", b:"후루야의 무반응에 카네마루 혼자 열을 내기 쉬워요." },
  "haruichi|kanemaru": { c:"같은 학년 내야수 동기예요.", g:"차분한 하루이치와 직설적인 카네마루, 내야에서 서로를 받쳐 줘요.", b:"카네마루의 날 선 말투가 수줍은 하루이치에게 세게 들릴 수 있어요." },
  "kawakami|miyuki": { c:"같은 학년 배터리예요. 미유키는 긴장 잘하는 카와카미를 다독이며 공을 받아요.", g:"흔들리는 투수를 잡아 주는 포수, 서로를 믿는 동기 배터리예요.", b:"미유키의 장난 섞인 말이 긴장한 카와카미에겐 더 큰 부담이 될 수 있어요." },
  "eijun|kawakami": { c:"같은 투수진 동료예요. 카와카미는 불펜에서 사와무라와 함께 마운드를 이어 던져요.", g:"분위기를 띄우는 사와무라와 묵묵히 정리하는 카와카미, 불펜의 좋은 짝이에요.", b:"사와무라의 큰 목소리가 예민한 카와카미를 더 긴장시킬 수 있어요." },
  "kawakami|kuramochi": { c:"같은 학년 동료예요. 쿠라모치는 유격수 자리에서 카와카미의 등을 지켜요.", g:"투수가 맞춰 잡으면 유격수가 처리하는, 믿음직한 앞뒤 사이예요.", b:"쿠라모치의 거친 격려가 카와카미에겐 겁나게 들릴 수 있어요." },
  "mei|miyuki": { c:"중학 시절 메이는 미유키를 이나시로로 불렀지만, 미유키는 세이도를 택했어요. 그 뒤로는 서로 넘어야 할 상대예요.", g:"서로의 실력을 가장 잘 아는, 존중이 깔린 숙적이에요.", b:"선택받지 못한 메이의 자존심 때문에 만나면 늘 신경전이 붙어요." },
  "eijun|mei": { c:"같은 좌완 투수예요. 메이는 사와무라가 넘어야 할 도쿄 최강의 벽이에요.", g:"최강의 벽이 있어서 사와무라가 더 높이 올라가는 라이벌 구도예요.", b:"자신만만한 메이의 도발에 사와무라가 쉽게 흥분해요." },
  "carlos|mei": { c:"이나시로 실업에서 함께 뛰는 팀메이트예요.", g:"마운드의 메이와 외야의 카를로스, 이나시로의 투타 중심이에요.", b:"메이의 왕자님 기질에 카를로스가 맞춰 주느라 바쁠 수 있어요." },
  "raichi|sanada": { c:"야쿠시 고교의 투타 중심이에요. 사나다가 마운드를, 라이치가 타선을 이끌어요.", g:"느긋한 선배와 순수한 괴물 후배, 서로를 편하게 해 주는 팀메이트예요.", b:"사나다의 여유가 야구밖에 모르는 라이치에겐 이해가 안 될 수 있어요." },
  "furuya|raichi": { c:"같은 학년의 괴물 신인 투수와 괴물 신인 타자예요.", g:"강한 공과 강한 스윙, 서로를 만나면 더 강해지는 라이벌이에요.", b:"둘 다 상대를 힘으로만 누르려 해서 승부가 늘 정면충돌이에요." },
  "eijun|raichi": { c:"같은 학년 라이벌이에요. 라이치는 만날 때마다 특유의 배트 스피드로 사와무라를 위기로 몰아넣는 천적이에요.", g:"사와무라의 변화하는 공과 라이치의 본능적인 스윙, 보는 맛이 있는 맞대결이에요.", b:"사와무라가 라이치의 웃음에 말려들면 한 방을 맞기 쉬워요." },
  "eijun|kataoka": { c:"밤늦게 혼자 연습하던 사와무라에게 감독이 직접 투구 폼을 가르쳐 줬어요. 원석의 크기만 보면 후루야 이상일지도 모른다고 평가한 것도 감독님이에요.", g:"투지를 알아봐 주는 감독과 그 믿음에 보답하려는 선수, 서로를 키우는 사이예요.", b:"감독의 무서운 침묵 앞에서 사와무라가 혼자 애가 타기 쉬워요." },
  "furuya|kataoka": { c:"후루야의 첫 공이 구심을 보던 감독의 마스크를 날려 버렸고, 감독은 공 한 개만 보고 1군 합격을 줬어요.", g:"압도적인 재능을 단번에 알아보는 눈과 그 재능, 시원하게 통하는 사이예요.", b:"던지고 싶은 후루야와 팀 전체를 보는 감독, 등판 문제로 생각이 엇갈려요." },
  "chris|kataoka": { c:"어깨 부상 당시 감독은 크리스에게 매니저 전향을 권했지만, 크리스는 선수로 남는 길을 택했어요.", g:"서로의 진심을 말없이 존중하는 어른스러운 사이예요.", b:"둘 다 속내를 쉽게 꺼내지 않아 서로 마음고생을 하기 쉬워요." },
  "kataoka|tetsu": { c:"주장 자리가 맞지 않는 것 같아 고민하던 테츠야는 감독을 찾아갔고, 감독의 격려로 다시 힘을 냈어요.", g:"말수 적은 두 리더가 등으로 팀을 끌고 가는, 믿음이 단단한 사이예요.", b:"둘 다 과묵해서 중요한 말을 마음속에만 담아 두기 쉬워요." },
  "eijun|sanada": { c:"사와무라가 속한 세이도와 사나다의 야쿠시는 도쿄 대회에서 맞붙는 라이벌 학교예요.", g:"느긋한 사나다 앞에서는 시끄러운 사와무라도 웃게 돼요.", b:"사와무라의 열정과 사나다의 여유가 서로를 이해하기 어려워해요." }
};
const CHEM = Object.assign({}, CHEM_OLD, CHEM_NEW);

// ===== 선수 생일 사주 계산 =====
CHARS.forEach(c => {
  const [y, m, d] = c.bday;
  if (y) {
    c.real = computeSaju(y, m, d, 0, 0, false, "next");
    c.ra = analyze(c.real);
    c.rds = c.real.day[0];
  } else { // 출생 연도 미상(카타오카 감독): 성격 일간으로 대신 계산
    c.real = null; c.ra = null; c.rds = c.stem;
  }
});

function score(ds, a) {
  return CHARS.map(c => {
    const parts = [];
    const stemPts = c.stem === ds ? 45 : (c.near[ds] || 0);
    let gPts = 0;
    GROUPS.forEach((g, i) => {
      const v = c.g[g] * (a.ratio[i] - 0.2) * 7;
      gPts += v; parts.push({ g, v, i });
    });
    const sPts = c.s * a.splitIdx * 14;
    return { c, raw: stemPts + gPts + sPts, stemPts, gPts, sPts, parts };
  }).sort((x, y) => y.raw - x.raw);
}
function pct(raw) { return Math.max(12, Math.min(99, Math.round(30 + raw * 0.75))); }

// 두 일간 관계: hap(합) chung(충) same(비화) give(내가 생) get(상대가 생) ctrl(내가 극) hit(상대가 극)
function relation(me, you) {
  const lo = Math.min(me, you), hi = Math.max(me, you);
  if (hi - lo === 5) return "hap";
  if (lo < 4 && hi - lo === 6) return "chung";
  const ue = me >> 1, ye = you >> 1;
  if (ue === ye) return "same";
  if (mod(ue + 1, 5) === ye) return "give";
  if (mod(ye + 1, 5) === ue) return "get";
  if (mod(ue + 2, 5) === ye) return "ctrl";
  return "hit";
}
const REL = {
  hap:   { k:"천간합", d:"서로 끌어당겨 하나로 묶이는 합의 관계예요. 성향은 달라도 처음 만나도 이상하게 편해요.", g:"말하지 않아도 마음이 맞는 찰떡 사이예요.", b:"너무 붙어 다니다 서로의 색을 잃을 수 있어요." },
  chung: { k:"천간충", d:"정면으로 부딪히는 충의 관계예요. 자극이 큰 만큼 불꽃도 잘 튀어요.", g:"서로를 깨우는 라이벌이 될 수 있어요.", b:"사소한 일로도 정면충돌하기 쉬워요." },
  same:  { k:"같은 오행", d:"같은 오행을 가진 동료(비겁) 관계예요. 생각하는 방식이 닮았어요.", g:"척하면 척, 같은 편이 되면 든든한 동료예요.", b:"닮은 만큼 같은 자리를 두고 경쟁하게 돼요." },
  give:  { k:"내가 생해 줌", d:"내 기운이 상대를 살려 주는 관계(식상)예요. 내가 챙겨 주고 키워 주는 쪽이 돼요.", g:"내가 아낌없이 주고, 상대는 그만큼 빛나는 사이예요.", b:"주기만 하다 내가 먼저 지칠 수 있어요." },
  get:   { k:"상대가 생해 줌", d:"상대 기운이 나를 받쳐 주는 관계(인성)예요. 곁에 있으면 힘을 얻어요.", g:"기대고 배울 수 있는 든든한 사이예요.", b:"상대에게 너무 기대 버릴 수 있어요." },
  ctrl:  { k:"내가 극함", d:"내가 상대를 다루는 관계(재성)예요. 내가 주도권을 쥐기 쉬워요.", g:"내가 이끌고 상대가 따라와 주는 효율적인 조합이에요.", b:"상대 입장에선 휘둘린다고 느낄 수 있어요." },
  hit:   { k:"상대가 극함", d:"상대가 나를 다잡는 관계(관성)예요. 긴장되지만 나를 성장시켜요.", g:"상대 덕분에 내가 단단해지는 사이예요.", b:"상대 앞에서 늘 긴장하고 위축될 수 있어요." }
};

// 지지 관계: 육합(합이 1), 충(차이 6), 삼합(4로 나눈 나머지가 같음)
function branchRel(x, y) {
  if (x == null || y == null) return null;
  if (mod(x + y, 12) === 1) return "yukhap";
  if (Math.abs(x - y) === 6) return "chung";
  if (x !== y && x % 4 === y % 4) return "samhap";
  if (x === y) return "same";
  return "none";
}
function compat(ds, a, selfId) {
  return CHARS.filter(c => c.id !== selfId).map(c => compatOne(ds, a, c)).sort((x, y) => y.score - x.score);
}
function compatOne(ds, a, c) {
  const rel = relation(ds, c.rds);
  const relPts = { hap:30, chung:-30, same: a.strengthIdx > 0.15 ? -6 : 10, give:6, get:14, ctrl:-4, hit:-14 }[rel];
  // 내게 없는 오행을 상대가 채워 주면 가산, 둘 다 넘치는 오행이면 감산
  const fillGood = [], fillBad = [];
  if (c.ra) for (let i = 0; i < 5; i++) {
    if (a.el[i] === 0 && c.ra.el[i] >= 2) fillGood.push(i);
    else if (a.el[i] >= 3 && c.ra.el[i] >= 3) fillBad.push(i);
  }
  const fillPts = Math.max(-12, Math.min(16, fillGood.length * 8 - fillBad.length * 6));
  const myP = a._p;
  const dayRel = branchRel(myP ? myP.day[1] : null, c.real ? c.real.day[1] : null);
  const dayPts = dayRel === "yukhap" ? 6 : dayRel === "chung" ? -6 : 0;
  const yearRel = branchRel(myP ? myP.year[1] : null, c.real ? c.real.year[1] : null);
  const yearPts = yearRel === "yukhap" || yearRel === "samhap" ? 4 : yearRel === "chung" ? -4 : 0;
  const s = 50 + relPts + fillPts + dayPts + yearPts;
  return { c, rel, score: Math.max(5, Math.min(99, Math.round(s))),
    parts: { relPts, fillGood, fillBad, fillPts, dayRel, dayPts, yearRel, yearPts } };
}

// ===== 닮은 선수 매칭: 선수의 실제 생일 사주 기준 =====
// 1) 같은 일간 선수가 있으면 그중에서, 2) 없으면 같은 오행 선수 중에서, 3) 그것도 없으면 전체에서 고름
// 그룹 안에서는 십성 구성(±30) + 신강약(±12) + 오행 분포(0~10) + 일지·월지 일치(최대 10)로 비교
// BALANCE는 같은 일간 그룹 안에서 결과가 한 선수에게 쏠리지 않게 하는 작은 보정값 (무작위 생년월일로 보정)
// 출생 연도를 모르는 선수(카타오카 감독)는 매칭에서 제외
const BALANCE = { tetsu:-2.8, kanemaru:0, haruichi:-4.7, eijun:-1.3, yui:-13.4, toujou:-4.6, chris:3.9, sanada:1.5, masuko:4.6, kuramochi:3.5, kawakami:-9.2, isashiki:3.9, raichi:3.5, mei:5.9, ryosuke:1.6, furuya:6.4, carlos:4.3, miyuki:-6, okumura:2.8 };
function scoreReal(ds, a) {
  const norm = v => { const s = Math.hypot(...v) || 1; return v.map(x => x / s); };
  const myEl = norm(a.el), myP = a._p;
  const list = CHARS.filter(c => c.real).map(c => {
    const tier = c.rds === ds ? 2 : (c.rds >> 1) === (ds >> 1) ? 1 : 0;
    const stemPts = [0, 28, 45][tier];
    let diff = 0, shared = -1, sharedI = 0;
    for (let i = 0; i < 5; i++) {
      diff += Math.abs(a.ratio[i] - c.ra.ratio[i]);
      const m = Math.min(a.ratio[i], c.ra.ratio[i]);
      if (m > shared) { shared = m; sharedI = i; }
    }
    const gPts = 30 - diff * 30;
    const sPts = 12 - Math.abs(a.support - c.ra.support) * 30;
    const ce = norm(c.ra.el);
    const elPts = myEl.reduce((s, v, i) => s + v * ce[i], 0) * 10;
    const brPts = myP ? (myP.day[1] === c.real.day[1] ? 6 : 0) + (myP.month[1] === c.real.month[1] ? 4 : 0) : 0;
    // 생일 사주 구성이 완전히 같은 선수(크리스·이사시키)는 내 일지·월지로 결정적으로 갈라 줌
    const tie = myP ? ((myP.day[1] * 7 + myP.month[1] * 5 + c.real.month[1] * 3) % 11) * 0.01 : 0;
    const raw = stemPts + gPts + sPts + elPts + brPts;           // 닮음 % 표시용
    const rank = raw + (BALANCE[c.id] || 0) + tie;               // 그룹 안 순위용
    return { c, tier, raw, rank, stemPts, gPts, sPts, elPts, brPts, sharedI, shared, sameStrength: a.strengthLabel === c.ra.strengthLabel };
  });
  return list.sort((x, y) => (y.tier - x.tier) || (y.rank - x.rank));
}
