// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.gavinf.com',
  integrations: [
    starlight({
      title: 'docs',
      description: 'Documentation for gavinf.com projects, written in Markdown.',
      // Dark-only, matching homecloud/dash — the palette in gavinf.css is
      // declared for both themes, so the toggle is removed rather than hidden.
      customCss: ['./src/styles/gavinf.css', './src/styles/rail.css'],
      components: {
        Header: './src/components/Header.astro',
        ThemeSelect: './src/components/Empty.astro',
      },
      // No `sidebar` key: Starlight then generates the whole nav from the
      // src/content/docs tree. A new page is a new file, and a deleted page
      // can't leave a dangling entry behind.
      pagination: false,
      social: [],
      lastUpdated: false,
    }),
  ],
});
