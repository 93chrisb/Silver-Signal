/**
 * Silver Signal — cookie banner + GA4 Consent Mode v2.
 *
 * The page's inline gtag snippet sets every consent signal to "denied" before
 * Google Analytics loads, so nothing is stored until a visitor opts in. This
 * script injects the banner, remembers the choice in localStorage, and only
 * calls consent update -> granted once the visitor clicks Accept.
 */
(function () {
  var KEY = "ss_cookie_pref_v1";
  var COOKIES_URL = "/cookies/";
  var CSS =
    ".ss-cookie{position:fixed;bottom:20px;left:20px;right:20px;max-width:520px;margin:0 auto;z-index:60;background:#FFFFFF;border:1px solid #E0E0EC;border-radius:16px;padding:18px 20px;box-shadow:0 20px 60px rgba(10,10,15,.18);font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Inter','Helvetica Neue',Arial,sans-serif;color:#2C2C36}" +
    ".ss-cookie p{margin:0 0 14px;font-size:13px;line-height:1.5}" +
    ".ss-cookie p a{color:#4D4DFF;border-bottom:1px solid #4D4DFF;text-decoration:none}" +
    ".ss-cookie__row{display:flex;gap:10px;flex-wrap:wrap}" +
    ".ss-cookie__row button{flex:1;padding:11px 14px;font:inherit;font-size:12px;font-weight:500;border:1px solid #C8C8D6;color:#0A0A0F;background:transparent;border-radius:10px;cursor:pointer;transition:border-color .15s ease,color .15s ease}" +
    ".ss-cookie__row button:hover{border-color:#4D4DFF;color:#4D4DFF}" +
    ".ss-cookie__row .accept{background:#4D4DFF;color:#FFFFFF;border-color:#4D4DFF}" +
    ".ss-cookie__row .accept:hover{background:#6363FF;color:#FFFFFF;border-color:#6363FF}";

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function readPref() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function writePref(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {}
  }

  function grantAnalytics() {
    gtag("consent", "update", { analytics_storage: "granted" });
  }

  var pref = readPref();
  if (pref === "accept") {
    grantAnalytics();
    return;
  }
  if (pref === "decline") return;

  function inject() {
    if (document.getElementById("ss-cookie-banner")) return;

    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var banner = document.createElement("div");
    banner.id = "ss-cookie-banner";
    banner.className = "ss-cookie";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookies");
    banner.innerHTML =
      "<p>We use a small number of cookies to understand how this page performs. " +
      "No analytics tracking until you accept. " +
      '<a href="' + COOKIES_URL + '">Learn more</a>.</p>' +
      '<div class="ss-cookie__row">' +
      '<button type="button" class="ss-cookie-decline">Decline</button>' +
      '<button type="button" class="ss-cookie-accept accept">Accept</button>' +
      "</div>";

    document.body.appendChild(banner);

    banner.querySelector(".ss-cookie-accept").addEventListener("click", function () {
      writePref("accept");
      grantAnalytics();
      banner.remove();
    });
    banner.querySelector(".ss-cookie-decline").addEventListener("click", function () {
      writePref("decline");
      banner.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
