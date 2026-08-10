import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  typographer: true,
})

const essayModules = import.meta.glob('../data/essays/*.md', { query: '?raw', import: 'default', eager: true })
const poemModules = import.meta.glob('../data/poems/*.md', { query: '?raw', import: 'default', eager: true })
let essaysIndex = null
let poemsIndex = null

function extractSlug(path, category) {
  const filename = path.split('/').pop()
  return filename.replace('.md', '')
}

function buildContentMap(modules, category) {
  const map = {}
  for (const [path, content] of Object.entries(modules)) {
    map[extractSlug(path, category)] = content
  }
  return map
}

const essayContentMap = buildContentMap(essayModules, 'essays')
const poemContentMap = buildContentMap(poemModules, 'poems')

async function loadIndex(category) {
  if (category === 'essays') {
    if (!essaysIndex) {
      const mod = await import('../data/essays/index.js')
      essaysIndex = mod.default
    }
    return essaysIndex
  }
  if (!poemsIndex) {
    const mod = await import('../data/poems/index.js')
    poemsIndex = mod.default
  }
  return poemsIndex
}

export function loadContent(category, slug) {
  const map = category === 'essays' ? essayContentMap : poemContentMap
  return map[slug] || null
}

export async function listEntries(category) {
  return await loadIndex(category)
}

export function extractToc(mdContent) {
  if (!mdContent) return []
  const tokens = md.parse(mdContent, {})
  const headings = []
  for (const token of tokens) {
    if (token.type === 'heading_open' && (token.tag === 'h2' || token.tag === 'h3')) {
      const contentToken = tokens[tokens.indexOf(token) + 1]
      if (contentToken && contentToken.type === 'inline') {
        const text = contentToken.content || ''
        const id = text
          .toLowerCase()
          .replace(/<[^>]*>/g, '')
          .replace(/[^\w一-鿿\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        headings.push({ id, text, level: token.tag === 'h2' ? 2 : 3 })
      }
    }
  }
  return headings
}

export function renderMarkdown(mdContent) {
  if (!mdContent) return ''
  return md.render(mdContent)
}
