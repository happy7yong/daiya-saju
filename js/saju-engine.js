// 만세력·십성 계산 엔진

// ===== 기본 데이터 =====
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const STEMS_K = ["갑","을","병","정","무","기","경","신","임","계"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const BRANCHES_K = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const EL = ["wood","fire","earth","metal","water"];
const EL_K = ["목","화","토","금","수"];
const EL_H = ["木","火","土","金","水"];
const BR_EL = [4,2,0,0,2,1,1,2,3,3,2,4];
const BR_MAIN = [9,5,0,1,4,2,3,5,6,7,4,8];
const GROUPS = ["비겁","식상","재성","관성","인성"];
const GOD_NAMES = [["비견","겁재"],["식신","상관"],["편재","정재"],["편관","정관"],["편인","정인"]];
const GROUP_DESC = {
  "비겁": "자기 주관과 독립심, 내 사람 챙기는 의리",
  "식상": "표현력과 재주, 몸으로 보여 주는 퍼포먼스",
  "재성": "현실 감각, 상황을 읽고 실속을 챙기는 힘",
  "관성": "책임감과 규율, 스스로를 다잡는 힘",
  "인성": "배움과 생각, 받아들이고 분석하는 힘"
};
const STEM_INFO = [
  { sym:"큰 나무", kw:"곧고 우직한 리더형으로, 책임감이 강하고 한번 정하면 잘 굽히지 않는" },
  { sym:"꽃과 덩굴", kw:"부드럽고 섬세하지만 끈질긴 생명력으로 결국 꽃을 피우는" },
  { sym:"태양", kw:"밝고 솔직한 분위기 메이커로, 낙천적이라 주변을 환하게 만드는" },
  { sym:"촛불·등불", kw:"따뜻하고 예의 바르며, 조용히 남을 비추고 오래 타는 집념을 지닌" },
  { sym:"큰 산", kw:"묵직하고 듬직한 버팀목으로, 갈등을 가운데서 받아 주는" },
  { sym:"논밭", kw:"다정하고 수용적이며, 무엇이든 품고 길러 내는 실속파인" },
  { sym:"원석·무쇠", kw:"강직하고 화끈한 의리파로, 결단이 빠르고 정을 끝까지 지키는" },
  { sym:"보석·칼날", kw:"예리하고 섬세한 완벽주의자로, 마음에 안 차면 내놓지 않는" },
  { sym:"바다·큰 강", kw:"자유롭고 스케일이 큰 마이페이스로, 틀에 얽매이길 싫어하는" },
  { sym:"이슬비", kw:"영리하고 눈치 빠른 전략가로, 상황을 재빨리 읽어 스며드는" }
];

// ===== 만세력 계산 =====

function jdnOf(y, m, d) {
  const a = Math.floor((14 - m) / 12), y2 = y + 4800 - a, m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}
function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525, r = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * r)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * r) + 0.000289 * Math.sin(3 * M * r);
  const om = 125.04 - 1934.136 * T;
  const lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * r);
  return ((lam % 360) + 360) % 360;
}
function mod(a, n) { return ((a % n) + n) % n; }

function computeSaju(y, m, d, hh, mm, hasTime, ziMode) {
  const minutes = hasTime ? hh * 60 + mm : 12 * 60;
  const jdUT = jdnOf(y, m, d) - 0.5 + (minutes - 9 * 60) / 1440;
  const lam = sunLongitude(jdUT);
  const mIdx = Math.floor(mod(lam - 315, 360) / 30);
  let sy = y;
  if (m <= 2 && mIdx >= 10) sy = y - 1;
  const yS = mod(sy - 4, 10), yB = mod(sy - 4, 12);
  const mS = mod((yS % 5) * 2 + 2 + mIdx, 10), mB = mod(mIdx + 2, 12);
  let jdn = jdnOf(y, m, d);
  if (hasTime && ziMode === "next" && minutes >= 23 * 60 + 30) jdn += 1;
  const dIdx = mod(jdn + 49, 60);
  const dS = dIdx % 10, dB = dIdx % 12;
  let hS = null, hB = null;
  if (hasTime) {
    hB = Math.floor(mod(minutes + 30, 1440) / 120);
    hS = mod((dS % 5) * 2 + hB, 10);
  }
  return { year:[yS,yB], month:[mS,mB], day:[dS,dB], hour: hasTime ? [hS,hB] : null, lam };
}
function godOf(dayStem, stem) {
  const ed = Math.floor(dayStem / 2), es = Math.floor(stem / 2);
  const g = mod(es - ed, 5);
  const same = (dayStem % 2) === (stem % 2);
  return { group: g, name: GOD_NAMES[g][same ? 0 : 1] };
}
function analyze(p) {
  const ds = p.day[0];
  const slots = [
    { key:"hour", w:[1,1] }, { key:"day", w:[0,1.5] }, { key:"month", w:[1,3] }, { key:"year", w:[1,1] }
  ];
  const el = [0,0,0,0,0], grp = [0,0,0,0,0];
  let total = 0;
  slots.forEach(s => {
    const pil = p[s.key]; if (!pil) return;
    el[Math.floor(pil[0] / 2)] += 1; el[BR_EL[pil[1]]] += 1;
    if (s.w[0]) { const g = godOf(ds, pil[0]).group; grp[g] += s.w[0]; total += s.w[0]; }
    const gb = godOf(ds, BR_MAIN[pil[1]]).group; grp[gb] += s.w[1]; total += s.w[1];
  });
  const ratio = grp.map(v => v / total);
  const support = ratio[0] + ratio[4];
  const strengthIdx = Math.max(-1, Math.min(1, (support - 0.45) / 0.25));
  const strengthLabel = support >= 0.55 ? "신강" : support <= 0.38 ? "신약" : "중화";
  // 신강형/신약형 선수를 가르는 지수: 실제 분포의 중앙값(약 0.38) 기준
  const splitIdx = Math.max(-1, Math.min(1, (support - 0.38) / 0.2));
  return { el, grp, ratio, support, strengthIdx, strengthLabel, splitIdx };
}

// 한국어 조사 (받침 유무)
function jo(w, a, b) { const c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c <= 11171 && c % 28) ? a : b; }
