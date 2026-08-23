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
      // Explicit groups so the labels read as titles ("AWS", not the "aws"
      // directory name), with autogenerate inside each so pages are still
      // picked up from the filesystem. Only a brand-new top-level section
      // needs a line here.
      sidebar: [
        { label: 'Cloudflare', items: [{ autogenerate: { directory: 'cloudflare' } }] },
        { label: 'Proxmox',    items: [{ autogenerate: { directory: 'proxmox' } }] },
        { label: 'AWS',        items: [{ autogenerate: { directory: 'aws' } }] },
        { label: 'Infisical',  items: [{ autogenerate: { directory: 'infisical' } }] },
        { label: 'Test',       items: [{ autogenerate: { directory: 'test' } }] },
      ],
      // No chain icon beside headings; ids are still emitted, so #anchors
      // and the table of contents keep working.
      markdown: { headingLinks: false },
      pagination: false,
      social: [],
      lastUpdated: false,
    }),
  ],
});
