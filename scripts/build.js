#!/usr/bin/env node
/**
 * Silver Signal site build.
 *
 * There's no framework here — the homepage is a single static index.html.
 * This script is the "very basic CMS": it reads markdown posts out of
 * content/blog/*.md and turns them into static /blog/<slug>/ pages plus a
 * /blog/ index, regenerates /contact/, /privacy/, and /terms/, and rewrites
 * sitemap.xml so it always matches whatever content actually exists. Run `npm run build` after
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
      <a class="btn" href="/contact/">
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
    <h1 class="h-display">Book your free <em>tech audit.</em></h1>
    <p class="lede">Pick any open slot below for a free 30 minute intake audit. No pitch, no obligation &mdash; you'll get a calendar invite immediately.</p>
  </div>
</section>
<section class="section-pad section-pad--tight">
  <div class="wrap">
    <div class="contact__panel contact__panel--wide">
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
  Cal.ns["30min"]("on", {
    action: "bookingSuccessful",
    callback: function () { window.location.href = "/thank-you/"; },
  });
</script>`;

  return shell({
    title: "Contact Silver Signal · Book a Free Tech Audit",
    description: "Book a free 30 minute intake tech audit with Silver Signal. Pick any open slot and get a calendar invite immediately.",
    path: "/contact/",
    activeNav: "contact",
    jsonLd,
    bodyHtml: body,
    extraScripts,
  });
}

// ---------------------------------------------------------------------------
// Thank-you page (post-booking redirect target, kept out of search results)
// ---------------------------------------------------------------------------

function renderThankYouPage() {
  const faqs = [
    {
      q: "What happens next?",
      a: "You'll get a calendar invite by email right away, with a link to reschedule or cancel if you need to. No further action needed on your end before the call.",
    },
    {
      q: "Why does this call actually matter?",
      a: "Speed to lead is one of the biggest revenue levers a PI firm has. Firms that respond in under five minutes convert at meaningfully higher rates than firms that take hours or days, on identical ad spend. Skipping this call doesn't lose you a meeting, it just delays finding out exactly what that gap is costing your firm every month.",
    },
    {
      q: "What will I actually walk away with?",
      a: "A written benchmark of your real lead response time against top-decile PI firms, a specific breakdown of where revenue is leaking in your intake process, and a dollar figure on what closing that gap is worth. Yours to keep, whether or not you ever work with us.",
    },
    {
      q: "What should I bring to the call?",
      a: "Nothing required. It helps if you have a rough sense of your monthly inbound lead volume, average response time, and average case value, but we can pull most of that together live on the call.",
    },
    {
      q: "Who will I be speaking with?",
      a: "Someone from the Silver Signal team who works on intake and RevOps builds, not a salesperson reading from a script. The call is a working session, not a pitch.",
    },
    {
      q: "Is this really free, no obligation?",
      a: "Yes. Thirty minutes, no pitch, no obligation. You get a written audit either way, whether or not you ever work with us.",
    },
    {
      q: "What if I need to reschedule or cancel?",
      a: "Use the reschedule or cancel link in your calendar invite or confirmation email from Cal.com — no need to email us separately.",
    },
  ];

  const body = `<section class="page-hero">
  <div class="wrap">
    <div class="eyebrow"><span class="num">&check;</span><span class="bar" aria-hidden="true"></span><span>Booked</span></div>
    <h1 class="h-display">You're booked. <em>Thanks.</em></h1>
    <p class="lede">Your audit is on the calendar and a confirmation is on its way to your inbox. Here's what to expect before the call.</p>
  </div>
</section>
<section class="section-pad section-pad--tight">
  <div class="wrap">
    <h2 class="faq__title h-section">Before the call.</h2>
    <div class="faq__list">
${faqs
  .map(
    (f) => `      <details class="faq__item">
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`
  )
  .join("\n")}
    </div>
    <div class="contact__fallback" style="margin-top:32px;border-top:0;padding-top:0">
      <p>Need to get in touch before then?</p>
      <a class="btn btn--ghost" href="/">
        <span>Back to homepage</span>
        <span class="arrow" aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </div>
</section>`;

  return shell({
    title: "You're Booked · Silver Signal",
    description: "Your free tech audit with Silver Signal is booked. Here's what to expect before the call.",
    path: "/thank-you/",
    noindex: true,
    bodyHtml: body,
  });
}

// ---------------------------------------------------------------------------
// Legal pages (Privacy, Terms)
// ---------------------------------------------------------------------------

function renderLegalPage({ slug, eyebrowNum, title, description, activeNav, bodyHtml, updated }) {
  const body = `<article class="section-pad post">
  <div class="wrap">
    <div class="eyebrow"><span class="num">${eyebrowNum}</span><span class="bar" aria-hidden="true"></span><span>Legal</span></div>
    <h1 class="h-display">${title}</h1>
    <p class="post__dek">Last updated ${updated}.</p>
    <div class="post__body">
${bodyHtml}
    </div>
  </div>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: `${cfg.siteUrl}/${slug}/`,
      isPartOf: { "@type": "WebSite", name: cfg.siteName, url: cfg.siteUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${cfg.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: title, item: `${cfg.siteUrl}/${slug}/` },
      ],
    },
  ];

  return shell({
    title: `${title} · Silver Signal`,
    description,
    path: `/${slug}/`,
    activeNav,
    jsonLd,
    bodyHtml: body,
  });
}

function renderPrivacyPage(updated) {
  return renderLegalPage({
    slug: "privacy",
    eyebrowNum: "07",
    title: "Privacy Policy",
    description: "How Silver Signal Ltd collects, uses, and protects personal data from this website and our intake audit service.",
    activeNav: "privacy",
    updated,
    bodyHtml: `
    <p>Silver Signal Ltd ("Silver Signal", "we", "us") provides Salesforce and AI intake services to personal injury law firms. This policy explains what personal data we collect through ${cfg.siteUrl}, why we collect it, and the choices you have.</p>

    <h2>Who we are</h2>
    <p>${cfg.address.line1}, ${cfg.address.line2}, ${cfg.address.line3}. Contact us at <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a> for anything relating to this policy or your data.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Booking details</strong> &mdash; when you book an audit call, our scheduling provider (Cal.com) collects your name, email, and any notes you add.</li>
      <li><strong>Contact details</strong> &mdash; if you email us directly or reach out via LinkedIn, we hold whatever you send us.</li>
    </ul>
    <p>This site doesn't run analytics or advertising cookies today. If that changes, we'll update this page and add a consent mechanism before anything is tracked.</p>

    <h2>How we use it</h2>
    <p>To respond to enquiries, schedule and run audit calls, and deliver any service you engage us for. We don't sell personal data, and we don't use it for anything beyond running Silver Signal.</p>

    <h2>Who we share it with</h2>
    <p>A small number of processors that help us run the business: Cal.com (scheduling) and our email provider. Each only receives what it needs to do its job, under its own privacy terms.</p>

    <h2>How long we keep it</h2>
    <p>For as long as it's relevant to our relationship with you, or as required by law &mdash; typically no more than a few years after our last contact, unless you ask us to delete it sooner.</p>

    <h2>Your rights</h2>
    <p>Under UK GDPR you can ask us to access, correct, delete, or export your data, or object to how we use it. Email <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a> and we'll respond within a month. If you're not satisfied, you can complain to the UK Information Commissioner's Office (ico.org.uk).</p>

    <h2>Changes</h2>
    <p>We'll update the date at the top of this page if this policy changes materially.</p>`,
  });
}

function renderTermsPage(updated) {
  return renderLegalPage({
    slug: "terms",
    eyebrowNum: "08",
    title: "Terms of Use",
    description: "The terms that apply when you use the Silver Signal website or book an intake audit call.",
    activeNav: "terms",
    updated,
    bodyHtml: `
    <p>These terms apply when you use ${cfg.siteUrl} or book a call with Silver Signal Ltd ("Silver Signal", "we", "us"). By using the site or booking a call, you accept them.</p>

    <h2>The website</h2>
    <p>Content on this site &mdash; including the revenue leak calculator and any figures it produces &mdash; is illustrative and provided for general information only. It isn't legal, financial, or professional advice, and shouldn't be relied on as a guarantee of results for your firm.</p>

    <h2>Booking an audit</h2>
    <p>The free 30 minute intake audit is a non-binding conversation. Nothing discussed on that call, and nothing on this site, forms a contract for paid services. Any engagement beyond the audit is governed by a separate signed agreement between Silver Signal and your firm, which takes priority over these terms.</p>

    <h2>Third-party services</h2>
    <p>Scheduling is handled by Cal.com, and some pages link out to LinkedIn and other third-party sites. We aren't responsible for the content, availability, or terms of services we don't operate.</p>

    <h2>Intellectual property</h2>
    <p>The Silver Signal name, logo, and site content are owned by Silver Signal Ltd unless stated otherwise. You're welcome to link to the site, but please don't reproduce or republish content without asking us first.</p>

    <h2>Liability</h2>
    <p>The site and its content are provided "as is." To the extent permitted by law, Silver Signal isn't liable for losses arising from your use of the site, including reliance on the revenue leak calculator or any figures it estimates.</p>

    <h2>Governing law</h2>
    <p>These terms are governed by the laws of England and Wales, and any dispute is subject to the exclusive jurisdiction of the courts of England and Wales.</p>

    <h2>Changes</h2>
    <p>We may update these terms from time to time. The date at the top of this page shows when they last changed.</p>

    <h2>Contact</h2>
    <p>Questions about these terms? Email <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>.</p>`,
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
    { loc: `${cfg.siteUrl}/privacy/`, changefreq: "yearly", priority: "0.3" },
    { loc: `${cfg.siteUrl}/terms/`, changefreq: "yearly", priority: "0.3" },
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
  writeFile(path.join(ROOT, "thank-you", "index.html"), renderThankYouPage());

  // Legal
  writeFile(path.join(ROOT, "privacy", "index.html"), renderPrivacyPage(today));
  writeFile(path.join(ROOT, "terms", "index.html"), renderTermsPage(today));

  // Sitemap (always regenerated so it can never drift from what's on disk)
  writeFile(path.join(ROOT, "sitemap.xml"), renderSitemap(posts, today));

  console.log(`\nBuild complete: ${posts.length} blog post(s).`);
}

main();
