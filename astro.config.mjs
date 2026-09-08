import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Build-time timestamp is stamped onto every sitemap entry. It refreshes on
// every deploy, which is the signal crawlers want: "this URL is worth re-reading".
const lastmod = new Date().toISOString();

export default defineConfig({
  site: 'https://silversignal.ai',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // /thank-you is a post-conversion page. It should not be indexed and it
      // should not be in the sitemap. Anything else deemed private goes here.
      filter: (page) => !/\/thank-you\/?$/.test(page),
      serialize(item) {
        return { ...item, lastmod };
      },
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
