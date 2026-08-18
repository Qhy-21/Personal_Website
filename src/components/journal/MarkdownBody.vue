<script setup>
import MarkdownIt from 'markdown-it'
import { computed, watch, ref } from 'vue'

const props = defineProps({
  content: { type: String, required: true },
  category: { type: String, default: '' },
})

// 根据分类绑定 body 类名（articles / essays / poems）
const categoryClass = computed(() => {
  if (props.category === 'poems') return 'poem-body'
  if (props.category === 'essays') return 'essay-body'
  if (props.category === 'articles') return 'article-body'
  return ''
})

// 构建带 id 锚点的 md 渲染器
const md = new MarkdownIt({
  html: false,
  breaks: true,
  typographer: true,
})

// 提取文本 -> slug（用于标题锚点）
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w一-鿿\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// 自定义 heading 渲染规则 -> 注入 id（便于 #锚点 跳转）
md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  const inlineToken = tokens[idx + 1]
  const text = inlineToken && inlineToken.type === 'inline' ? inlineToken.content : ''
  const id = slugify(text)
  return `<${token.tag} id="${id}">`
}

const html = ref('')

function render() {
  html.value = props.content ? md.render(props.content) : ''
}

watch(() => props.content, render, { immediate: true })
</script>

<template>
  <div class="markdown-body" :class="categoryClass" v-html="html"></div>
</template>

<style scoped>
.markdown-body {
  font-size: 16px;
  line-height: 1.85;
  color: var(--text-muted);
  word-break: break-word;
}

/* Headings */
.markdown-body :deep(h1) {
  font-family: var(--font-body);
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  line-height: 1.35;
}

.markdown-body :deep(h2) {
  font-family: var(--font-body);
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  margin: 36px 0 16px;
  scroll-margin-top: 100px;
}

.markdown-body :deep(h3) {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 28px 0 12px;
  scroll-margin-top: 100px;
}

.markdown-body :deep(h2:first-child),
.markdown-body :deep(h1:first-child) {
  margin-top: 0;
}

/* Paragraphs —— 默认（文章 / 通用）：首行缩进 2 字符 + 略增行距 */
.markdown-body :deep(p) {
  margin: 0 0 18px;
  text-indent: 2em;
  line-height: 1.95;
}

/* Strong & Em */
.markdown-body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.markdown-body :deep(em) {
  color: var(--accent);
}

/* Inline code */
.markdown-body :deep(code) {
  background: var(--bg-elevated);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  word-break: break-all;
}

/* Code blocks */
.markdown-body :deep(pre) {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  overflow-x: auto;
  margin: 20px 0;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: var(--text);
  padding: 0;
  font-size: 0.85em;
  line-height: 1.7;
}

/* Blockquote */
.markdown-body :deep(blockquote) {
  margin: 20px 0;
  padding: 14px 18px;
  border-left: 3px solid var(--accent);
  background: var(--accent-light);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.markdown-body :deep(blockquote p) {
  margin: 0;
  text-indent: 0;
}

/* Lists */
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.markdown-body :deep(li) {
  margin: 6px 0;
}

/* Links */
.markdown-body :deep(a) {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
  border-bottom: 1px solid transparent;
}

.markdown-body :deep(a:hover) {
  color: var(--accent-strong);
  border-bottom-color: var(--accent-strong);
}

/* Horizontal rule */
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

/* Images */
.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  display: block;
  margin: 20px auto;
}

/* Tables */
.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 0.95em;
}

.markdown-body :deep(th) {
  background: var(--bg-elevated);
  color: var(--text);
  font-weight: 600;
  padding: 10px 14px;
  border: 1px solid var(--border);
  text-align: left;
}

.markdown-body :deep(td) {
  padding: 8px 14px;
  border: 1px solid var(--border);
}

.markdown-body :deep(tr:nth-child(even) td) {
  background: rgba(128, 128, 128, 0.03);
}

/* 诗歌排版：无首行缩进，段间距更宽，行距更舒展 */
.markdown-body.poem-body :deep(p) {
  margin: 0 0 20px;
  text-indent: 0;
  line-height: 2.1;
}

/* 随笔排版：保留首行缩进，行距稍大 */
.markdown-body.essay-body :deep(p) {
  line-height: 2.0;
}

/* 文章排版：与默认一致，明确声明 */
.markdown-body.article-body :deep(p) {
  line-height: 1.95;
}

@media (max-width: 768px) {
  .markdown-body {
    font-size: 15px;
  }

  .markdown-body :deep(h1) {
    font-size: 24px;
  }

  .markdown-body :deep(h2) {
    font-size: 19px;
  }

  .markdown-body :deep(h3) {
    font-size: 16px;
  }

  .markdown-body :deep(pre) {
    padding: 16px;
  }
}
</style>
