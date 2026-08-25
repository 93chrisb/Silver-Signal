#!/usr/bin/env node
/**
 * Silver Signal site build.
 *
 * There's no framework here — the homepage is a single static index.html.
 * This script is the "very basic CMS": it reads markdown posts out of
 * content/blog/*.md and turns them into static /blog/<slug>/ pages plus a
 * /blog/ index, regenerates /contact/, and rewrites sitemap.xml so it always
 * matches whatever content actually exists. Run `npm run build` after
 * adding/editing a post; the GitHub Action in .github/workflows/build.yml
 * does the same thing automatically on every push to main.
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const { shell, cfg } = require("./lib/template");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const BLOG_OUT_DIR = path.join(ROOT, "blog");

marked.setOptions({ headerIds: false, mangle: false });

// ---------------------------------------------------------------------------
// Load + validate blog posts
// ---------------------------------------------------------------------------

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace(/\.md$/, "");
    const required = ["title", "description", "date"];
    const missing = required.filter((k) => !data[k]);
    if (missing.length) {
      throw new Error(`content/blog/${file} is missing required frontmatter: ${missing.join(", ")}`);
    }
    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date, // expected YYYY-MM-DD
      updated: data.updated || data.date,
      author: data.author || "Silver Signal Team",
      image: data.image || cfg.ogImage,
      draft: !!data.draft,
      html: marked.parse(content),
      file,
    };
  });
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function fmtDate(d) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ---------------------------------------------------------------------------
// Blog index page
// ---------------------------------------------------------------------------

function renderBlogIndex(posts) {
  const cards = posts.length
    ? posts
        .map(
          (p) => `      <article class="blog-card">
        <a href="/blog/${p.slug}/" style="display:contents">
          <div class="date">${fmtDate(p.date)}</div>
          <h2>${p.title}</h2>
          <p>${p.description}</p>
          <span class="read">Read the post <span aria-hidden="true">&rarr;</span></span>
        </a>
      </article>`
        )
        .join("\n")
    : `      <div class="blog__empty">No posts published yet. Check back soon.</div>`;

  const body = `<section class="page-hero">
  <div class="wrap">
    <div class="eyebrow"><span class="num">06</span><span class="bar" aria-hidden="true"></span><span>The Blog</span></div>
    <h1 class="h-display">Notes on lead response, <em>intake, and RevOps.</em></h1>
    <p class="lede">Field notes from rebuilding intake and conversion systems for personal injury law firms. No fluff, no filler content.</p>
  </div>
</section>
<section class="section-pad section-pad--tight">
  <div class="wrap">
    <div class="blog__grid">
${cards}
    </div>
  </div>
</section>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Silver Signal Blog",
      description: "Notes on lead response, intake, and revenue operations for personal injury law firms.",
      url: `${cfg.siteUrl}/blog/`,
      publisher: { "@type": "Organization", name: cfg.siteName, logo: { "@type": "ImageObject", url: cfg.logoImage } },
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${cfg.siteUrl}/blog/${p.slug}/`,
        datePublished: p.date,
      })),
    },
  ];

  return shell({
    title: "Blog · Silver Signal",
    description: "Notes on lead response, intake, and revenue operations for personal injury law firms, from the team at Silver Signal.",
    path: "/blog/",
    activeNav: "blog",
    jsonLd,
    bodyHtml: body,
  });
}

function renderPost(post) {
  const body = `<article class="section-pad post">
  <div class="wrap">
    <div class="breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a></div>
    <div class="post__meta">
      <span>${fmtDate(post.date)}</span>
      <span class="dot" aria-hidden="true"></span>
      <span>${post.author}</span>
    </div>
    <h1>${post.title}</h1>
    <p class="post__dek">${post.description}</p>
    <div class="post__body">
${post.html}
    </div>
    <div class="post__cta">
      <div>
        <h3>See what slow response is costing your firm.</h3>
        <p>30 minutes, free, no pitch. You leave with a written audit either way.</p>
      </div>
      <a class="btn" href="${cfg.calLink}" target="_blank" rel="noopener">
        <span>Book Your Free Tech Audit</span>
        <span class="arrow" aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </div>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: post.image,
      datePublished: post.date,
      dateModified: post.updated,
      author: { "@type": "Organization", name: post.author === "Silver Signal Team" ? cfg.siteName : post.author },
      publisher: {
        "@type": "Organization",
        name: cfg.siteName,
        logo: { "@type": "ImageObject", url: cfg.logoImage },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${cfg.siteUrl}/blog/${post.slug}/` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${cfg.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${cfg.siteUrl}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: `${cfg.siteUrl}/blog/${post.slug}/` },
      ],
    },
  ];

  return shell({
    title: `${post.title} · Silver Signal`,
    description: post.description,
    path: `/blog/${post.slug}/`,
    activeNav: "blog",
    ogType: "article",
    ogImage: post.image,
    jsonLd,
    bodyHtml: body,
  });
}

// ---------------------------------------------------------------------------
// Contact page
// ---------------------------------------------------------------------------

function renderContactPage() {
  const calSlug = cfg.calLink.replace(/^https?:\/\/cal\.com\//, "");
  const body = `<section class="page-hero">
  <div class="wrap">
    <div class="eyebrow"><span class="num">06</span><span class="bar" aria-hidden="true"></span><span>Get In Touch</span></div>
    <h1 class="h-display">Book the audit, <em>or just say hello.</em></h1>
    <p class="lede">Pick a slot below for a free 30 minute tech audit, no pitch, no obligation. Or send a line about what's broken and we'll reply inside a business day.</p>
  </div>
</section>
<section class="section-pad section-pad--tight">
  <div class="wrap">
    <div class="contact__grid">
      <div class="contact__panel">
        <h2>Book a 30 minute audit</h2>
        <p class="sub">Pick any open slot. You'll get a calendar invite immediately.</p>
        <div class="cal-embed" id="cal-inline">
          <noscript>
            JavaScript is required to show the live calendar.
            <a href="${cfg.calLink}" target="_blank" rel="noopener">Open the booking page directly &rarr;</a>
          </noscript>
        </div>
        <div class="contact__fallback">
          <p>Booking widget not loading, or prefer a new tab?</p>
          <a class="btn btn--ghost" href="${cfg.calLink}" target="_blank" rel="noopener">
            <span>Open booking page</span>
            <span class="arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>

      <div>
        <div class="contact__panel">
          <h2>Not ready for a call?</h2>
          <p class="sub">One line on what's broken. First thoughts back inside a business day.</p>
          <form class="lead-form" id="lead-form" novalidate>
            <div class="lead-form__field">
              <label for="lead-name">Name</label>
              <input type="text" id="lead-name" name="name" placeholder="Your name" autocomplete="name" required />
            </div>
            <div class="lead-form__field">
              <label for="lead-email">Work email</label>
              <input type="email" id="lead-email" name="email" placeholder="you@firm.com" autocomplete="email" required />
            </div>
            <div class="lead-form__field">
              <label for="lead-msg">In one line, what's broken?</label>
              <textarea id="lead-msg" name="message" rows="3" placeholder="e.g. We spend $20k/mo on Google Ads and sign 4 cases out of 200 leads." required></textarea>
            </div>
            <button type="submit" class="btn lead-form__submit" id="lead-submit">
              <span class="lead-form__label">Send</span>
              <span class="arrow" aria-hidden="true">&rarr;</span>
            </button>
            <div class="lead-form__success" id="lead-success" role="status">
              Thanks. We&rsquo;ll be back in your inbox inside a business day.
            </div>
          </form>
        </div>

        <div class="contact__direct">
          <div class="contact__direct-row">
            <span class="k">Email</span>
            <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>
          </div>
          <div class="contact__direct-row">
            <span class="k">LinkedIn</span>
            <a href="${cfg.linkedin}" target="_blank" rel="noopener">linkedin.com/company/silversignal</a>
          </div>
          <div class="contact__direct-row">
            <span class="k">Address</span>
            <span class="v">${cfg.address.line1}, ${cfg.address.line2}, ${cfg.address.line3}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Silver Signal",
      url: `${cfg.siteUrl}/contact/`,
      mainEntity: {
        "@type": "Organization",
        name: cfg.siteName,
        url: cfg.siteUrl,
        email: cfg.contactEmail,
        sameAs: [cfg.linkedin],
        address: {
          "@type": "PostalAddress",
          streetAddress: cfg.address.line2,
          addressLocality: "London",
          postalCode: "E17 3NU",
          addressCountry: "GB",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${cfg.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Contact", item: `${cfg.siteUrl}/contact/` },
      ],
    },
  ];

  const extraScripts = `<script type="text/javascript">
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", "30min", {origin:"https://cal.com"});
  Cal.ns["30min"]("inline", {
    elementOrSelector: "#cal-inline",
    config: { layout: "month_view" },
    calLink: "${calSlug}",
  });
  Cal.ns["30min"]("ui", { hideEventTypeDetails: false, layout: "month_view" });
</script>
<script>
(function(){
  var form = document.getElementById("lead-form");
  if(!form) return;
  var nameEl    = document.getElementById("lead-name");
  var emailEl   = document.getElementById("lead-email");
  var msgEl     = document.getElementById("lead-msg");
  var submitBtn = document.getElementById("lead-submit");
  var label     = submitBtn.querySelector(".lead-form__label");
  var success   = document.getElementById("lead-success");
  var emailRx   = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  function markValid(el){ el.classList.remove("is-invalid"); }
  function markInvalid(el){ el.classList.add("is-invalid"); }
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name  = (nameEl.value  || "").trim();
    var email = (emailEl.value || "").trim();
    var msg   = (msgEl.value   || "").trim();
    var firstBad = null;
    if(!name){ markInvalid(nameEl); firstBad = firstBad || nameEl; } else markValid(nameEl);
    if(!email || !emailRx.test(email)){ markInvalid(emailEl); firstBad = firstBad || emailEl; } else markValid(emailEl);
    if(!msg){ markInvalid(msgEl); firstBad = firstBad || msgEl; } else markValid(msgEl);
    if(firstBad){ firstBad.focus(); return; }
    var payload = new FormData();
    payload.append("source",  "contact_page");
    payload.append("name",    name);
    payload.append("email",   email);
    payload.append("message", msg);
    payload.append("page",    location.href);
    submitBtn.disabled = true;
    label.textContent = "Sending…";
    fetch("${cfg.formspreeEndpoint}", { method: "POST", headers: { "Accept": "application/json" }, body: payload })
      .then(function(r){
        submitBtn.disabled = false;
        if(r.ok){ label.textContent = "Sent"; success.classList.add("is-on"); form.reset(); }
        else { label.textContent = "Try again"; }
      })
      .catch(function(){
        submitBtn.disabled = false;
        label.textContent = "Try again";
      });
  });
})();
</script>`;

  return shell({
    title: "Contact Silver Signal · Book a Free Tech Audit",
    description: "Book a free 30 minute intake tech audit with Silver Signal, or send a one-line description of what's broken and hear back inside a business day.",
    path: "/contact/",
    activeNav: "contact",
    jsonLd,
    bodyHtml: body,
    extraScripts,
  });
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

function renderSitemap(posts, today) {
  const staticUrls = [
    { loc: `${cfg.siteUrl}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${cfg.siteUrl}/contact/`, changefreq: "monthly", priority: "0.8" },
    { loc: `${cfg.siteUrl}/blog/`, changefreq: "weekly", priority: "0.7" },
  ];
  const postUrls = posts.map((p) => ({
    loc: `${cfg.siteUrl}/blog/${p.slug}/`,
    lastmod: p.updated,
    changefreq: "monthly",
    priority: "0.6",
  }));
  const all = [...staticUrls.map((u) => ({ ...u, lastmod: u.lastmod || today })), ...postUrls];

  const body = all
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// Write out
// ---------------------------------------------------------------------------

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
  console.log("wrote", path.relative(ROOT, filePath));
}

function main() {
  const posts = loadPosts();
  const today = new Date().toISOString().slice(0, 10);

  // Blog
  writeFile(path.join(BLOG_OUT_DIR, "index.html"), renderBlogIndex(posts));
  // Remove stale generated post directories (deleted/renamed markdown files
  // shouldn't leave orphaned HTML behind).
  if (fs.existsSync(BLOG_OUT_DIR)) {
    const currentSlugs = new Set(posts.map((p) => p.slug));
    for (const entry of fs.readdirSync(BLOG_OUT_DIR, { withFileTypes: true })) {
      if (entry.isDirectory() && !currentSlugs.has(entry.name)) {
        fs.rmSync(path.join(BLOG_OUT_DIR, entry.name), { recursive: true, force: true });
        console.log("removed stale", `blog/${entry.name}`);
      }
    }
  }
  posts.forEach((post) => {
    writeFile(path.join(BLOG_OUT_DIR, post.slug, "index.html"), renderPost(post));
  });

  // Contact
  writeFile(path.join(ROOT, "contact", "index.html"), renderContactPage());

  // Sitemap (always regenerated so it can never drift from what's on disk)
  writeFile(path.join(ROOT, "sitemap.xml"), renderSitemap(posts, today));

  console.log(`\nBuild complete: ${posts.length} blog post(s).`);
}

main();
