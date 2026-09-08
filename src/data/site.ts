export const site = {
  name: 'Silver Signal Partners',
  legalName: 'Silver Signal Ltd',
  shortName: 'Silver Signal',
  url: 'https://silversignal.ai',
  tagline: 'Salesforce-led revenue systems.',
  description:
    'Independent Salesforce consultancy. We fix the CRM your pipeline runs on, then hand it back working.',
  booking: 'https://cal.com/silversignal/audit',
  form: 'https://formspree.io/f/xkoklypl',
  email: 'hello@silversignal.ai',
  linkedin: 'https://www.linkedin.com/company/silversignal',
  ogImage: 'https://silversignal.ai/images/og-image.png',
  gaMeasurementId: 'G-WNGPJLDX7Y',
  address: {
    line1: 'Silver Signal Ltd',
    line2: 'Suite RA01, 195-197 Wood Street',
    line3: 'London E17 3NU, United Kingdom',
  },
};

export type Service = {
  slug: string;
  nav: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  buyer: string;
};

/**
 * Primary Salesforce practice services — the broad catalogue Silver Signal offers.
 * These are the top-level services in the nav and the /services/ index.
 */
export const services: Service[] = [
  {
    slug: 'implementation-development',
    nav: 'Implementation & Development',
    title: 'Implementation & Development',
    h1: 'Salesforce, built to your business rather than to a template.',
    metaTitle: 'Salesforce Implementation & Development | Silver Signal',
    metaDescription:
      'End-to-end Salesforce implementation and custom development. Requirements, configuration, Apex and Lightning components, integration, deployment and adoption.',
    summary:
      'End-to-end delivery. Requirements, design, configuration, custom code, integration, deployment and adoption support, run as one accountable engagement.',
    buyer: 'You are standing up Salesforce for the first time, or building something serious inside an existing org.',
  },
  {
    slug: 'advisory',
    nav: 'Advisory',
    title: 'Salesforce Advisory Services',
    h1: 'A senior second opinion before the money goes out.',
    metaTitle: 'Salesforce Advisory Services | Silver Signal',
    metaDescription:
      'Independent Salesforce advisory. Roadmap review, architecture decisions, vendor and licence selection, contract and statement-of-work review.',
    summary:
      'Independent advisory on the decisions that cost money. Roadmap, architecture, vendor selection, contract and statement-of-work review.',
    buyer: 'You are about to sign something, spend something, or commit to a direction, and nobody senior on your side is checking the technical case.',
  },
  {
    slug: 'managed-services',
    nav: 'Managed Services',
    title: 'Salesforce Managed Services',
    h1: 'Ongoing support without hiring a full admin team.',
    metaTitle: 'Salesforce Managed Services | Silver Signal',
    metaDescription:
      'Retained monthly Salesforce support. Admin, minor development, release management, incident response and quarterly roadmap execution.',
    summary:
      'Retained monthly support. Admin, minor development, release management, incident response and the roadmap execution nobody has time for internally.',
    buyer: 'You have Salesforce running and need consistent help without carrying the cost of a full-time admin team.',
  },
  {
    slug: 'health-check',
    nav: 'Health Check',
    title: 'Salesforce Health Check',
    h1: 'A written diagnosis of the org you inherited.',
    metaTitle: 'Salesforce Health Check | Silver Signal',
    metaDescription:
      'Fixed-scope Salesforce health check. Structured review of configuration, security, data quality, technical debt and adoption, with a prioritised remediation plan.',
    summary:
      'A structured review of the org. Configuration, security, data quality, technical debt and adoption, ending in a written report and a prioritised remediation plan.',
    buyer: 'You inherited a Salesforce build and cannot get a straight answer on how healthy it actually is.',
  },
  {
    slug: 'migration',
    nav: 'Migration',
    title: 'Migration to Salesforce',
    h1: 'From the old CRM to Salesforce, with the data intact.',
    metaTitle: 'Migration to Salesforce | Silver Signal',
    metaDescription:
      'Salesforce migration from HubSpot, Dynamics, Zoho, Pipedrive and legacy systems. Data mapping, cleansing, staged loads, reconciliation and cutover.',
    summary:
      'Migration from your current CRM planned as its own workstream. Mapping, cleansing, staged loads, reconciliation and a cutover you can sign off on.',
    buyer: 'You are moving to Salesforce from another CRM and the data is the part that keeps you up at night.',
  },
  {
    slug: 'quickstart-packages',
    nav: 'Quickstart Packages',
    title: 'Salesforce Quickstart Packages',
    h1: 'Salesforce live in weeks, at a fixed price.',
    metaTitle: 'Salesforce Quickstart Packages | Silver Signal',
    metaDescription:
      'Fixed-scope, fixed-price Salesforce quickstart packages for teams landing on Sales, Service or Marketing Cloud for the first time.',
    summary:
      'Fixed-scope, fixed-price starter packages. Sales, Service or Marketing Cloud stood up in weeks with the essentials configured and your team trained on them.',
    buyer: 'You want Salesforce useful quickly, with a defined scope, a defined price, and no six-month discovery phase.',
  },
  {
    slug: 'ui-ux-design',
    nav: 'UI/UX Design',
    title: 'Salesforce UI/UX Design',
    h1: 'A Salesforce interface people actually want to use.',
    metaTitle: 'Salesforce UI/UX Design | Silver Signal',
    metaDescription:
      'Salesforce interface and workflow design. Page layouts, Lightning App Builder, custom LWC components, user journeys and adoption-focused UX.',
    summary:
      'Interface and workflow design for Salesforce. Page layouts, Lightning components, and the flows a user walks through, redesigned around the work they actually do.',
    buyer: 'Your org is functional but painful to use, and adoption is the metric slipping quietly in the background.',
  },
  {
    slug: 'salesforce-qa',
    nav: 'QA',
    title: 'Salesforce QA',
    h1: 'A release you can ship without holding your breath.',
    metaTitle: 'Salesforce QA | Silver Signal',
    metaDescription:
      'Salesforce quality assurance. Test strategy, manual and automated testing, regression coverage, UAT support and release validation.',
    summary:
      'Test strategy, manual and automated testing, regression coverage and release validation, so the next deploy stops being an act of faith.',
    buyer: 'Every release currently ends in an all-hands smoke test and a Friday you would rather not have.',
  },
  {
    slug: 'training',
    nav: 'Training',
    title: 'Salesforce Training',
    h1: 'The system is only as good as who uses it.',
    metaTitle: 'Salesforce Training | Silver Signal',
    metaDescription:
      'Role-based Salesforce training for admins, developers and end-users. On-site, remote or self-paced, built around your actual workflows.',
    summary:
      'Role-based training for admins, developers and end-users. Built around your actual workflows rather than a generic feature tour.',
    buyer: 'You built the system. Now the people who live in it need to use it well.',
  },
];

/**
 * Specific engagements — outcome-focused packages the team also offers when
 * the problem is well defined enough to name it.
 */
export const engagements: Service[] = [
  {
    slug: 'speed-to-lead',
    nav: 'Speed to Lead',
    title: 'Speed to Lead',
    h1: 'Your inbound leads are going cold in a shared inbox.',
    metaTitle: 'Speed to Lead | Salesforce Lead Response Under Five Minutes',
    metaDescription:
      'We rebuild inbound intake in Salesforce so every lead gets a response in under five minutes. Fixed scope, no new headcount.',
    summary:
      'Every inbound lead answered in under five minutes, routed to a real person, with the whole path from ad click to closed deal recorded in one place.',
    buyer: 'You are spending on demand generation and losing the leads it produces.',
  },
  {
    slug: 'revenue-engine-build',
    nav: 'Revenue Engine Build',
    title: 'Revenue Engine Build',
    h1: 'A CRM your revenue team will actually use.',
    metaTitle: 'Revenue Engine Build | Salesforce Implementation for Revenue Teams',
    metaDescription:
      'Salesforce implementation built around how your revenue team already sells. Sales, Service and Marketing Cloud, integrations, migration and adoption.',
    summary:
      'A full build or rebuild of the system your revenue runs on, designed around how your team already sells rather than how a demo org is configured.',
    buyer: 'You are implementing Salesforce, replacing it, or living with a build that never landed.',
  },
  {
    slug: 'fractional-cto',
    nav: 'Fractional CTO',
    title: 'Fractional CTO',
    h1: 'Technical leadership without the hire.',
    metaTitle: 'Fractional CTO | Part-Time Technical Leadership for Growing Companies',
    metaDescription:
      'Retained fractional CTO for companies that need senior technical judgement on roadmap, architecture and vendors without a full-time hire.',
    summary:
      'Senior technical judgement on retainer. Roadmap, architecture, vendor decisions and the authority to tell you when a project should be stopped.',
    buyer: 'You are making six-figure technology decisions with nobody senior in the room.',
  },
  {
    slug: 'rescue',
    nav: 'Rescue',
    title: 'Rescue',
    h1: 'The implementation stalled. The deadline did not.',
    metaTitle: 'Salesforce Rescue | Fixed-Scope Recovery for Stalled Implementations',
    metaDescription:
      'Fixed-scope intervention for failed or stalled Salesforce implementations. We diagnose, fix, document and leave.',
    summary:
      'A time-boxed intervention on a build that has gone wrong. We diagnose it, fix what is blocking you, document what we did, and leave.',
    buyer: 'A project is late, over budget, or was handed over broken.',
  },
];

export const nav = [
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];
