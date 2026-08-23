import { defineConfig } from 'vitepress'
import { generateSidebar } from './sidebar.mts'

export default defineConfig({
  title: 'docs',
  description: 'Documentation for gavinf.com projects, generated from Markdown.',
  cleanUrls: true,
  appearance: 'force-dark',
  themeConfig: {
    // The gavinf rail (Dashboard/homecloud/proxmox/docs) covers top-level
    // cross-site nav — no separate VitePress top nav needed.
    nav: [],
    // Generated from the docs/ tree at build time — see sidebar.mts. Add a
    // page by adding a file; order with frontmatter `order:`.
    sidebar: generateSidebar(),
    // No "On this page" outline — neither the desktop right rail nor its
    // collapsed mobile "On this page ›" form. `outline: false` alone only
    // empties the heading list; `aside: false` removes the container too.
    outline: false,
    aside: false,
  },
})
