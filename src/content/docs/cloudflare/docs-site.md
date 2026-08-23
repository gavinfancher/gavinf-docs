---
title: "Deploying this site"
description: "How this Starlight site is built and deployed to docs.gavinf.com."
---

This site is [Astro](https://astro.build) + [Starlight](https://starlight.astro.build),
served by a Workers Assets Worker named `gavinf-docs` on `docs.gavinf.com`.
There is no server code — `wrangler.json` has no `main`, only an `assets`
directory, so Cloudflare serves the built files directly.

```json
{
  "name": "gavinf-docs",
  "compatibility_date": "2026-08-23",
  "assets": { "directory": "./dist" }
}
```

## Deploying

```bash
npm run build          # astro build -> dist/
npx wrangler deploy    # uploads dist/ as the Worker's assets
```

Wrangler only uploads changed files; unchanged assets are reported as "already
uploaded" and skipped.

## Adding a page

Drop a Markdown file under `src/content/docs/`. **The sidebar is generated from
that tree** — `astro.config.mjs` sets no `sidebar` key, which is what makes
Starlight walk the filesystem itself.

| Path | Becomes |
|---|---|
| `src/content/docs/<section>/index.md` | the section landing page |
| `src/content/docs/<section>/<page>.md` | a child page under it |
| `src/content/docs/index.mdx` | the splash home page |

Every page **must** have a `title` in frontmatter — Starlight will not infer it
from an `# H1`, and the build fails without it. Starlight renders the title as
the page heading, so don't also write an H1 in the body or it appears twice.

Quote frontmatter values. An unquoted `description` containing a colon is
invalid YAML and fails the build with `bad indentation of a mapping entry`.

```yaml
---
title: "Tunnel & DNS"
description: "Zone setup, the tunnel ingress, and Caddy routing."
---
```

Order defaults to alphabetical; `sidebar: { order: 1 }` in frontmatter pins a
page ahead of that.

## Custom domain

A hostname can be a Custom Domain on **exactly one Worker**. Moving
`docs.gavinf.com` between Workers means detaching it first — attaching over a
live binding fails rather than overriding it.

```bash
# list bindings to find the domain id
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/domains" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result[] | {hostname, service, id}'

# detach, then attach
curl -X DELETE \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/domains/$DOMAIN_ID" \
  -H "Authorization: Bearer $CF_API_TOKEN"

curl -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/domains" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environment":"production","hostname":"docs.gavinf.com",
       "service":"gavinf-docs","zone_id":"'"$ZONE_ID"'"}'
```

> Constraint: there is a gap of a few seconds between detach and attach where
> the hostname resolves to nothing. Cut over when nobody is reading.

Cloudflare reuses the same binding id and edge certificate across the move, so
no new cert is issued. Worker **routes** are different — those can be
reassigned atomically with a `PUT`, no gap.

Worker names are constrained to `^[a-z0-9_][a-z0-9-_]*$`, so no uppercase.

## Git-connected builds

Connect the repo in **Workers & Pages → gavinf-docs → Settings → Builds**:

| Setting | Value |
|---|---|
| Repository | `gavinfancher/gavinf-docs` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

The build image has Node preinstalled, which is why a Node-based generator is
the low-friction choice — a Python one such as MkDocs would need its runtime
verified in the build image first.

## Propagation

Cloudflare's asset store is eventually consistent. A freshly deployed path can
404 on first request and 200 moments later. Don't judge a deploy by one curl.
