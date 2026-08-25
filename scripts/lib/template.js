const cfg = require("./site-config");

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function navHtml(activePath) {
  return cfg.nav
    .map((item) => {
      const isActive = activePath && item.href.replace(/^\//, "").startsWith(activePath);
      return `<a class="link${isActive ? " is-active" : ""}" href="${item.href}">${esc(item.label)}</a>`;
    })
    .join("\n      ");
}

function header(activePath) {
  return `<header class="topbar">
  <div class="wrap topbar__inner">
    <a href="/#top" class="brand" aria-label="Silver Signal home">
      <span class="mark" aria-hidden="true"></span>
      <span>Silver <em>Signal</em></span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${navHtml(activePath)}
    </nav>
    <div class="topnav-actions">
      <a class="signin" href="/contact/">Contact</a>
      <a class="cta" href="${cfg.calLink}" target="_blank" rel="noopener">Book Audit</a>
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot__top">
      <div>
        <div class="foot__brand">Silver <em>Signal</em></div>
        <div class="foot__tag">RevOps for Personal Injury Law Firms</div>
        <p class="foot__addr">
          ${esc(cfg.address.line1)}<br/>
          ${esc(cfg.address.line2)}<br/>
          ${esc(cfg.address.line3)}
        </p>
      </div>
      <div class="foot__col">
        <h4>Site</h4>
        <ul>
          <li><a href="/#problem">The Gap</a></li>
          <li><a href="/#how">Approach</a></li>
          <li><a href="/#case">Case Study</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a></li>
          <li><a href="${cfg.calLink}" target="_blank" rel="noopener">Book a call</a></li>
          <li><a href="${cfg.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
        </ul>
      </div>
      <div class="foot__col">
        <h4>Legal</h4>
        <ul>
          <li><a href="/#open-privacy">Privacy</a></li>
          <li><a href="/#open-terms">Terms</a></li>
          <li><a href="/#open-cookies">Cookies</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__bottom">
      <span>&copy; <span id="year"></span> Silver Signal Ltd &middot; Registered in England &amp; Wales</span>
      <span>All figures in USD unless stated</span>
    </div>
  </div>
</footer>

<div class="cookie" id="cookie" role="dialog" aria-live="polite" aria-label="Cookies">
  <p>
    We use a small number of cookies to understand how this page performs and improve it
    over time. No tracking until you accept. <a href="/#open-cookies">Learn more</a>.
  </p>
  <div class="cookie__row">
    <button type="button" id="cookie-decline">Decline</button>
    <button type="button" class="accept" id="cookie-accept">Accept</button>
  </div>
</div>`;
}

function baseScripts() {
  return `<script>
var COOKIE_KEY = "ss_cookie_pref_v1";
document.getElementById("year").textContent = new Date().getFullYear();
(function(){
  var banner  = document.getElementById("cookie");
  var accept  = document.getElementById("cookie-accept");
  var decline = document.getElementById("cookie-decline");
  if(!banner) return;
  var pref;
  try { pref = localStorage.getItem(COOKIE_KEY); } catch(e){ pref = null; }
  if(!pref){ setTimeout(function(){ banner.classList.add("is-on"); }, 600); }
  function set(p){
    try { localStorage.setItem(COOKIE_KEY, p); } catch(e){}
    banner.classList.remove("is-on");
    if(p === "accept" && typeof window.gtag === "function"){
      window.gtag("consent","update",{ "analytics_storage":"granted" });
    }
  }
  accept.addEventListener("click", function(){ set("accept"); });
  decline.addEventListener("click", function(){ set("decline"); });
})();
</script>`;
}

/**
 * Renders a full HTML document using the shared shell (head, header, footer,
 * cookie banner). Every generated page (contact, blog index, blog posts)
 * goes through this so SEO tags and schema stay consistent by construction.
 */
function shell({
  title,
  description,
  path, // e.g. "/contact/" — used for canonical + og:url
  activeNav, // "blog" | "contact" | undefined
  ogImage,
  ogType = "website",
  jsonLd = [], // array of objects, each rendered as its own <script type="application/ld+json">
  extraHead = "",
  bodyHtml,
  extraScripts = "",
}) {
  const canonical = `${cfg.siteUrl}${path}`;
  const image = ogImage || cfg.ogImage;
  const jsonLdBlocks = jsonLd
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj, null, 2)}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="theme-color" content="#F4F4F9" />
<link rel="canonical" href="${canonical}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/images/logo.png" sizes="512x512" />

<meta property="og:site_name" content="${esc(cfg.siteName)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="${esc(ogType)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${image}" />

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles/site.css" />
${jsonLdBlocks}
${extraHead}
</head>
<body>
${header(activeNav)}
<main id="top">
${bodyHtml}
</main>
${footer()}
${baseScripts()}
${extraScripts}
</body>
</html>
`;
}

module.exports = { shell, esc, header, footer, cfg };
