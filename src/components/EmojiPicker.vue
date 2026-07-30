<script setup>
import { onMounted, onUnmounted } from 'vue'

let show = false

const emojis = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😋', '😎', '🤩',
  '🥳', '😭', '😤', '😱', '🤗', '🤔', '😴', '🥴', '🤧', '😷',
  '👍', '👎', '👏', '🙌', '💪', '🙏', '🤝', '✌️',
  '❤️', '💔', '🔥', '⭐', '✨', '🎉', '🌸', '🌻',
  '☕', '🍺', '🎵', '💻', '⌨️', '🎮',
]

function insert(emoji) {
  const el = document.querySelector('#wl-edit')
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const before = el.value.substring(0, start)
  const after = el.value.substring(end)
  el.value = before + emoji + after
  el.selectionStart = el.selectionEnd = start + emoji.length
  el.focus()
}

let toggleBtn = null
let panel = null
let stop = null

function build() {
  toggleBtn = document.createElement('button')
  toggleBtn.className = 'emoji-toggle'
  toggleBtn.title = '表情'
  toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    show = !show
    panel.style.display = show ? 'flex' : 'none'
  })

  panel = document.createElement('div')
  panel.className = 'emoji-panel'
  panel.style.cssText = 'display:none;flex-wrap:wrap;gap:4px;padding:0 0 12px'
  for (const e of emojis) {
    const btn = document.createElement('button')
    btn.className = 'emoji-btn'
    btn.textContent = e
    btn.title = e
    btn.addEventListener('click', () => insert(e))
    panel.appendChild(btn)
  }
}

function inject() {
  const footer = document.querySelector('.waline-card .wl-footer')
  if (!footer) { return setTimeout(inject, 200) }
  const bar = footer.querySelector('div')
  const imgLabel = bar?.querySelector('label[title="上传图片"], label[for*="image"]')
  if (!imgLabel) { return setTimeout(inject, 200) }
  bar.insertBefore(toggleBtn, imgLabel)
  footer.after(panel)
}

onMounted(() => {
  build()
  inject()
})

onUnmounted(() => {
  toggleBtn?.remove()
  panel?.remove()
})
</script>

<template>
  <div style="display:none"></div>
</template>

<style>
.waline-card .emoji-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  margin-right: 4px;
  vertical-align: middle;
  transition: all var(--duration-fast) var(--ease-out);
}

.waline-card .emoji-toggle:hover {
  color: var(--accent);
  transform: scale(1.12);
}

.waline-card .emoji-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: all var(--duration-fast) var(--ease-out);
}

.waline-card .emoji-btn:hover {
  border-color: var(--accent);
  background: var(--accent-light);
  transform: scale(1.15);
}

.waline-card .emoji-btn:active {
  transform: scale(0.95);
}
</style>
