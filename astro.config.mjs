import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://silversignal.ai',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
