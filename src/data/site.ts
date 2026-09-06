export const site = {
  name: 'Silver Signal Partners',
  shortName: 'Silver Signal',
  url: 'https://silversignal.ai',
  tagline: 'Salesforce-led revenue systems.',
  description:
    'Salesforce consulting for revenue teams. We fix the CRM your pipeline runs on, then hand it back working.',
  booking: 'https://cal.com/silver-signal-m0hq3w/30min',
  form: 'https://formspree.io/f/xkoklypl',
  linkedin: 'https://www.linkedin.com/company/silversignal',
};

export type Service = {
  slug: string;
  nav: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  shape: string;
  summary: string;
  buyer: string;
};

export const services: Service[] = [
  {
    slug: 'speed-to-lead',
    nav: 'Speed to Lead',
    title: 'Speed to Lead',
    h1: 'Your inbound leads are going cold in a shared inbox.',
    metaTitle: 'Speed to Lead | Salesforce Lead Response Under Five Minutes',
    metaDescription:
      'We rebuild inbound intake in Salesforce so every lead gets a response in under five minutes. Fixed scope, no new headcount.',
    shape: 'Fixed scope · 6–8 weeks',
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
    shape: 'Programme · 3–6 months',
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
    shape: 'Retained · monthly',
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
    shape: 'Fixed scope · 2–6 weeks',
    summary:
      'A time-boxed intervention on a build that has gone wrong. We diagnose it, fix what is blocking you, document what we did, and leave.',
    buyer: 'A project is late, over budget, or was handed over broken.',
  },
];

export const nav = [
  { href: '/', label: 'Home' },
  ...services.map((s) => ({ href: `/services/${s.slug}`, label: s.nav })),
];
