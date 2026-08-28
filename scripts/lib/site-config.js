// Central place for facts that repeat across pages (nav, footer, contact
// details, tracking endpoints). Keeping these in one file means a change
// here (e.g. a new nav link, a new phone number) doesn't need to be hunted
// down across every generated page.
module.exports = {
  siteUrl: "https://silversignal.ai",
  siteName: "Silver Signal",
  defaultTitle: "Silver Signal · Sign more cases. Catch every lead.",
  defaultDescription:
    "Silver Signal helps personal injury law firms catch every inbound lead in under 5 minutes, using Salesforce and AI. Same marketing spend. More signed cases.",
  ogImage: "https://silversignal.ai/images/og-image.png",
  logoImage: "https://silversignal.ai/images/logo.png",
  calLink: "https://cal.com/silver-signal-m0hq3w/30min",
  formspreeEndpoint: "https://formspree.io/f/xkoklypl",
  contactEmail: "hello@silversignal.ai",
  gaMeasurementId: "G-WNGPJLDX7Y",
  linkedin: "https://www.linkedin.com/company/silversignal",
  address: {
    line1: "Silver Signal Ltd",
    line2: "Suite RA01, 195-197 Wood Street",
    line3: "London E17 3NU, United Kingdom",
  },
  nav: [
    { label: "Home", href: "/#top" },
    { label: "Approach", href: "/#how" },
    { label: "Case Study", href: "/#case" },
  ],
};
