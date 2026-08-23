import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'

// Sidebar is derived from the filesystem so a new page never needs a config
// edit — and, more importantly, deleting a page can't leave a dangling entry
// behind (VitePress fails the build on dead links).
//
// Conventions:
//   docs/<section>/index.md   the section itself; its H1 is the section label
//   docs/<section>/<page>.md  a child page under it
//   frontmatter `order: <n>`  pins ahead of the default alphabetical sort
//   frontmatter `title:`      overrides the H1 as the nav label
//
// docs/index.md is the home page and is deliberately not listed.

const DOCS_ROOT = fileURLToPath(new URL('..', import.meta.url))
const IGNORED = new Set(['.vitepress', 'public'])
const LAST = Number.MAX_SAFE_INTEGER

type Meta = { title?: string; order: number }
type Ranked = DefaultTheme.SidebarItem & { order: number }

/** Pull `title`/`order` from frontmatter, falling back to the first H1. */
function readMeta(file: string): Meta {
  const src = fs.readFileSync(file, 'utf-8')
  let title: string | undefined
  let order = LAST

  const frontmatter = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (frontmatter) {
    const t = frontmatter[1].match(/^title:\s*(.+)$/m)
    const o = frontmatter[1].match(/^order:\s*(-?\d+)\s*$/m)
    if (t) title = t[1].trim().replace(/^["']|["']$/g, '')
    if (o) order = Number(o[1])
  }
  if (!title) {
    const body = src.replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
    title = body.match(/^#\s+(.+)$/m)?.[1].trim()
  }
  return { title, order }
}

/** `vm-status` -> `Vm status`. Only used when a file has no H1 and no title. */
const titleize = (slug: string) =>
  slug.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase())

const byOrderThenLabel = (a: Ranked, b: Ranked) =>
  a.order - b.order || String(a.text).localeCompare(String(b.text))

const strip = ({ order, ...item }: Ranked): DefaultTheme.SidebarItem => item

function buildSection(dir: string): Ranked | null {
  const abs = path.join(DOCS_ROOT, dir)

  const children = fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
    .map((e) => {
      const slug = e.name.replace(/\.md$/, '')
      const { title, order } = readMeta(path.join(abs, e.name))
      return { text: title ?? titleize(slug), link: `/${dir}/${slug}`, order }
    })
    .sort(byOrderThenLabel)

  const indexFile = path.join(abs, 'index.md')
  const hasIndex = fs.existsSync(indexFile)
  if (!hasIndex && children.length === 0) return null

  const meta = hasIndex ? readMeta(indexFile) : { title: undefined, order: LAST }
  const section: Ranked = { text: meta.title ?? titleize(dir), order: meta.order }
  if (hasIndex) section.link = `/${dir}/`
  if (children.length) {
    section.collapsed = false
    section.items = children.map(strip)
  }
  return section
}

export function generateSidebar(): DefaultTheme.Sidebar {
  const sections = fs
    .readdirSync(DOCS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !IGNORED.has(e.name))
    .map((e) => buildSection(e.name))
    .filter((s): s is Ranked => s !== null)
    .sort(byOrderThenLabel)
    .map(strip)

  return [{ text: 'Sections', items: sections }]
}
