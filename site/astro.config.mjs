// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sanity from '@sanity/astro';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID ?? 'lkeuttht',
      dataset: env.PUBLIC_SANITY_DATASET ?? 'trial',
      useCdn: false,
    }),
  ],
  site: 'https://shashank-pr.github.io',
  base: '/vo_two'
});
