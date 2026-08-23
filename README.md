# mydocs

Notes and reference documentation for the things I run — homecloud, wishly,
and the Cloudflare/Proxmox/AWS plumbing underneath them. Built with
[VitePress](https://vitepress.dev), deployed to
**[docs.gavinf.com](https://docs.gavinf.com)** on Cloudflare Workers.

These are working notes written as reference material: what an API actually
returns, which failure modes are silent, and why a given shortcut is safe in
one place and not another. Anything deployment-specific is a placeholder.

## Sections

| Section | Contents |
|---|---|
| [Proxmox](docs/proxmox/) | VM status API — field-by-field response reference, error semantics |
| [Cloudflare](docs/cloudflare/) | Zones, tunnel ingress, and the Worker fronting every `gavinf.com` site |
| [AWS](docs/aws/) | S3-backed Postgres backups — streamed dumps, restore flow |
| [Infisical](docs/infisical/) | Secrets management for wishly and homecloud |

## Layout

```
docs/
  index.md              Home page
  .vitepress/
    config.mts          Site + sidebar config
    theme/              Custom theme (dark-only, homecloud palette, nav rail)
  proxmox/ cloudflare/ aws/ infisical/
```

Markdown lives at the top of `docs/` — a new page is a new `.md` file plus a
line in the `sidebar` array in `.vitepress/config.mts`.

## Local development

```bash
npm install
npm run dev      # http://localhost:4322
npm run build    # → docs/.vitepress/dist
```

## Deploy

Git-connected Cloudflare Workers build. Push to `main`:

- **Build command:** `npm run build`
- **Output:** `docs/.vitepress/dist` (set in `wrangler.json`)

## License

[MIT](LICENSE).
