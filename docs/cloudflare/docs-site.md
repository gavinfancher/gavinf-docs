# Deploying this site

This site is a static VitePress build served by a Workers Assets Worker named
`gavinf-docs`, on `docs.gavinf.com`. No server code — `wrangler.json` has no
`main`, only an `assets` directory, so Cloudflare serves the files directly.

```json
{
  "name": "gavinf-docs",
  "compatibility_date": "2026-08-23",
  "assets": { "directory": "./docs/.vitepress/dist" }
}
```

## Deploying

```bash
npm run build          # vitepress build docs → docs/.vitepress/dist
npx wrangler deploy    # uploads dist/ as the Worker's assets
```

Wrangler only uploads changed files; unchanged assets are reported as "already
uploaded" and skipped. A deploy of this site is a couple of seconds.

The build must pass before deploying. VitePress **fails the build on dead
links** — a `[text](/path)` pointing at a page that no longer exists is a hard
error, not a warning:

```
(!) Found dead link /proxmox/vm-status in file proxmox/index.md
x Build failed
```

Deleting a page therefore means deleting every link to it, including its entry
in the `sidebar` array in `.vitepress/config.mts`. Suppress the check with
`ignoreDeadLinks` in the config only if you actually want dangling links.

## Routes and `index.md`

A directory only answers on its trailing-slash URL if it contains `index.md`.
`docs/test/test.md` builds to `/test/test`, so a link to `/test/` 404s. Name
the file `index.md` and `/test/` resolves.

## Custom domain

A hostname can be a Custom Domain on **exactly one Worker**. `docs.gavinf.com`
previously belonged to `gavinf-prod`, so attaching it to `gavinf-docs` meant
detaching it first — attaching over a live binding fails rather than
overriding it.

```bash
# 1. detach from the old Worker (needs the domain id, from the list call)
curl -X DELETE \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/domains/$DOMAIN_ID" \
  -H "Authorization: Bearer $CF_API_TOKEN"

# 2. attach to the new one
curl -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/domains" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environment":"production","hostname":"docs.gavinf.com",
       "service":"gavinf-docs","zone_id":"'"$ZONE_ID"'"}'
```

List existing bindings to find `$DOMAIN_ID`:

```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/domains" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result[] | {hostname, service, id}'
```

> Constraint: there is a gap of a few seconds between detach and attach where
> the hostname resolves to nothing. Cut over when nobody is reading.

Cloudflare reuses the same domain-binding `id` and edge certificate across the
move, so no new cert has to be issued and the switch propagates in seconds.

### Rolling back

Same two calls with the services swapped — detach from `gavinf-docs`, attach to
`gavinf-prod`. The old site keeps working as long as `gavinf-prod` still has
its `DOCS_HOST` branch and bundles the docs build.

## Git-connected builds

The deploy above is manual, from a laptop. To build on push instead, connect
the repo in **Workers & Pages → gavinf-docs → Settings → Builds**:

| Setting | Value |
|---|---|
| Repository | `gavinfancher/mydocs` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

The build image has Node preinstalled, which is why a Node-based generator is
the low-friction choice here — a Python generator such as MkDocs would need its
runtime verified in the build image first.

## Related

- [Cloudflare](/cloudflare/) — the other Workers on this account
