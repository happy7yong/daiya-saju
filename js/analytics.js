// ===== 분석 도구 로더 & 이벤트 =====
// 개인정보 보호: 생년월일·시각은 절대 보내지 않고, 결과 선수 id·일간·신강약 같은 값만 보내요.
(function () {
  const cfg = window.DAIYA_CONFIG || {};
  // 실제 배포 주소가 아니거나(미리보기·로컬) 자동화 브라우저(캡처 봇)면 분석 도구를 불러오지 않음
  const isBot = navigator.webdriver || /HeadlessChrome|bot|crawler|spider/i.test(navigator.userAgent);
  const enabled = !isBot && (!cfg.analyticsHost || location.hostname === cfg.analyticsHost);

  if (enabled && cfg.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", cfg.clarityId);
  }

  if (enabled && cfg.ga4Id) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4Id);
  }

  // track("result_shown", { char: "eijun", stem: "병화" })
  window.track = function (name, params) {
    params = params || {};
    try {
      if (window.gtag) window.gtag("event", name, params);
      if (window.clarity) {
        window.clarity("event", name);
        Object.keys(params).forEach(k => window.clarity("set", k, String(params[k])));
      }
    } catch (e) { /* 분석 실패가 화면을 깨뜨리지 않게 */ }
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") console.debug("[track]", name, params);
  };
})();
