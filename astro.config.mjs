// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://selector0073-portfolio.netlify.app',
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://selector0073-portfolio.netlify.app/privacy/',
    }),
  ],
});