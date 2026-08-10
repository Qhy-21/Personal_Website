<script setup>
import { renderMarkdown } from '../../composables/useJournal.js'

const props = defineProps({
  content: { type: String, required: true },
})

const html = renderMarkdown(props.content)
</script>

<template>
  <div class="markdown-body" v-html="html"></div>
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

/* Paragraphs */
.markdown-body :deep(p) {
  margin: 0 0 16px;
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
