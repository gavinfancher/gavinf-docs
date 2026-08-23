# Cloudflare

Zones, tunnels, and the Workers that front every `gavinf.com` site.

## In this section

- [Deploying this site](/cloudflare/docs-site) — the `mydocs` Worker, custom domains, Git builds
- [Tunnel & DNS](/cloudflare/tunnel) — zone setup, the tunnel ingress, and Caddy routing

## Sites

Two Workers serve the `gavinf.com` zone.

`gavinf-prod` is one Worker + one Workers Assets bundle, routed by hostname in
`worker.js`:

| Host | Serves |
|---|---|
| `gavinf.com`, `auth.gavinf.com`, `dash.gavinf.com` | portal SPA |
| `homecloud.gavinf.com` | console SPA |
| `proxmox.gavinf.com` | rail shell + passthrough to the tunnel origin |

`mydocs` is a static assets Worker with no script at all:

| Host | Serves |
|---|---|
| `docs.gavinf.com` | this site — see [Deploying this site](/cloudflare/docs-site) |

Docs used to live inside `gavinf-prod` too, built from `homecloud/frontend/docs`.
Splitting them out means the docs deploy on their own and can cover projects
beyond homecloud.
