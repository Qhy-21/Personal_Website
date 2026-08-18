import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  typographer: true,
})

// ===== 从 Vite 加载三个分类的合并 MD 文件 =====
const rawModules = import.meta.glob('../data/**/*.md', { query: '?raw', import: 'default', eager: true })

function getRaw(category) {
  // 路径映射：articles -> articles/articles.md；essays -> essays/essays.md；poems -> poems/poems.md
  const lookup = {
    articles: '../data/articles/articles.md',
    essays: '../data/essays/essays.md',
    poems: '../data/poems/poems.md',
  }
  const key = Object.keys(rawModules).find(k => k.endsWith(lookup[category]?.replace('../data/', '')))
  if (key) return rawModules[key] || ''
  // 备用：按文件名匹配
  for (const k of Object.keys(rawModules)) {
    if (k.includes(`/${category}/${category}.md`)) return rawModules[k] || ''
  }
  return ''
}

// ===== 从「单个 MD 文件」切分成多篇文章 =====
// 支持的分隔格式：### 1.标题  或  ### 1. 标题  或  ## 1.标题
function splitEntries(raw, category) {
  if (!raw) return []

  // 跳过文件头部（第一个分隔符之前的内容视为前言）
  // 匹配：行开头的 ## 或 ###，后面跟数字和点，然后是标题
  const headingRegex = /^(#{2,3})\s+(\d+)\.\s*(.+)?\s*$/gm

  const entries = []
  let match
  let lastIndex = 0

  // 先找到第一个匹配，前面的是文件头
  const firstMatch = headingRegex.exec(raw)
  if (!firstMatch) {
    // 没有找到分隔标题，返回空
    return []
  }

  // 重置 regex
  headingRegex.lastIndex = firstMatch.index
  lastIndex = firstMatch.index

  while ((match = headingRegex.exec(raw)) !== null) {
    const startIdx = lastIndex
    const endIdx = match.index
    const block = raw.slice(startIdx, endIdx).trim()

    const entry = parseEntryBlock(block, category, entries.length)
    if (entry) entries.push(entry)

    lastIndex = endIdx
  }

  // 别忘了最后一篇
  const lastBlock = raw.slice(lastIndex).trim()
  const lastEntry = parseEntryBlock(lastBlock, category, entries.length)
  if (lastEntry) entries.push(lastEntry)

  return entries
}

function parseEntryBlock(block, category, index) {
  if (!block) return null

  // 第一行是标题行：### 1.一个冬夜
  const lines = block.split(/\r?\n/)
  const firstLine = lines[0] || ''

  const headingMatch = firstLine.match(/^(#{2,3})\s+(\d+)\.\s*(.+)?\s*$/)
  if (!headingMatch) return null

  const num = headingMatch[2] || String(index + 1)
  const rawTitle = (headingMatch[3] || `第${num}篇`).trim()

  // 正文 = 标题行之后的全部内容，保留所有空行（空行对 markdown 语法至关重要）
  const bodyLines = lines.slice(1)

  // 日期提取：只检查「最后一个非空行」是否为日期
  let date = ''
  const datePatterns = [
    // 完整日期：2021/12/25、2023.2.4、2021-12-25，允许 —— 前缀和尾部文字（如"晚"）
    { re: /^[—-]*(\d{4})[\/.\-年](\d{1,2})[\/.\-月](\d{1,2})/, fmt: m => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` },
    // 年月：——2023年1月、2023.2
    { re: /^[—-]*(\d{4})[\/.\-年](\d{1,2})[\/.\-月]?$/, fmt: m => `${m[1]}-${m[2].padStart(2, '0')}` },
    // 仅年份：2025
    { re: /^(\d{4})\s*$/, fmt: m => m[1] },
  ]

  for (let i = bodyLines.length - 1; i >= 0; i--) {
    const line = bodyLines[i].trim()
    if (!line) continue // 跳过尾部的空行
    // 找到最后一行非空内容，检查它是不是日期
    for (const { re, fmt } of datePatterns) {
      const m = line.match(re)
      if (m) {
        date = fmt(m)
        bodyLines.splice(i, 1) // 仅移除这一行日期
        break
      }
    }
    break // 只检查最后一个非空行，不做更多处理
  }

  // 拼接正文（保留所有原始空行）
  const content = bodyLines.join('\n').trim()

  // 摘要 = 正文前 60 个非空字符
  const plainText = content.replace(/[#>*_\-`]/g, '').replace(/\s+/g, ' ').trim()
  const description = plainText.slice(0, 60) + (plainText.length > 60 ? '…' : '')

  // slug = 分类名 + 序号（稳定，不会因为标题修改而变化）
  const slug = `${category}-${num.padStart(2, '0')}`

  // 给每篇文章补上一个 H1 标题，用于渲染
  const finalContent = `# ${rawTitle}\n\n${content}\n`

  return {
    slug,
    title: rawTitle,
    titleEn: '',
    date: date || '',
    description,
    descriptionEn: '',
    rawBody: content,
    body: finalContent,
  }
}

// ===== 缓存 =====
const parsedCache = { articles: null, essays: null, poems: null }

function getParsedEntries(category) {
  if (parsedCache[category]) return parsedCache[category]
  const raw = getRaw(category)
  const entries = splitEntries(raw, category)
  parsedCache[category] = entries
  return entries
}

// ===== 公共 API =====

export function listEntries(category) {
  return getParsedEntries(category)
}
