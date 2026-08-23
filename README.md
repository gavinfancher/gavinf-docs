# gavinf-docs

Notes and reference documentation for the things I run — homecloud, wishly, and
the Cloudflare/Proxmox/AWS plumbing underneath them. Built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build),
deployed to **[docs.gavinf.com](https://docs.gavinf.com)** on Cloudflare
Workers as `gavinf-docs`.

These are working notes written as reference material: what an API actually
returns, which failure modes are silent, and why a given shortcut is safe in one
place and not another. Anything deployment-specific is a placeholder.

## Sections

| Section | Contents |
|---|---|
| Cloudflare | Workers, zones, the tunnel, and how this site is deployed |
| Proxmox | The hypervisor behind homecloud — API access and conventions |
| AWS | S3-backed Postgres backups: streamed dumps, restore flow |
| Infisical | Secrets management for wishly and homecloud |

## Layout

```
src/
  content/docs/           Markdown — one directory per section
    index.mdx             Splash home page
  content.config.ts       Starlight docs collection
  components/
    Header.astro          Wraps Starlight's header to add the rail
    Rail.astro            Cross-site nav (dash / homecloud / proxmox / docs)
  styles/
    gavinf.css            homecloud palette mapped onto --sl-* variables
    rail.css
astro.config.mjs
wrangler.json             Workers Assets, directory ./dist
```

**The sidebar is generated from the `src/content/docs` tree** — there is no nav
array to maintain. `astro.config.mjs` deliberately sets no `sidebar` key, which
is what makes Starlight walk the filesystem.

Every page needs a quoted `title` in frontmatter; Starlight renders it as the
page heading, so don't repeat it as an `# H1` in the body. Full conventions are
in [Deploying this site](https://docs.gavinf.com/cloudflare/docs-site/).

## Local development

```bash
npm install
npm run dev      # http://localhost:4322
npm run build    # → dist/
```

## Deploy

```bash
npm run deploy   # build + wrangler deploy
```

Or connect the repo under Workers & Pages → gavinf-docs → Settings → Builds
with build `npm run build`, deploy `npx wrangler deploy`, root `/`.

## Neighbours

| Worker | Repo | Host |
|---|---|---|
| `gavinf-docs` | this one | `docs.gavinf.com` |
| `gavinf-dash` | `gavinf-dash` | `gavinf.com`, `auth`, `dash`, `proxmox` |
| `gavinf-homecloud` | `homecloud` | `homecloud.gavinf.com` |

The nav rail in `src/components/Rail.astro` is mirrored as inline markup in
`gavinf-dash`'s `worker.js` and as `PortalRail.tsx` in the homecloud console.
Keep the three in sync.

## License

[MIT](LICENSE).
