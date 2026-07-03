<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import interestsData from '../data/interests.js'

const { t, locale } = useI18n()

/* ===== glob auto-discovery ===== */
const descModules = import.meta.glob('../data/interests/*/desc.md', { query: '?raw', import: 'default', eager: true })
const descEnModules = import.meta.glob('../data/interests/*/desc.en.md', { query: '?raw', import: 'default', eager: true })
const imageModules = import.meta.glob('../data/interests/*/*.{jpg,jpeg,png,gif,webp}', { eager: true, import: 'default' })

function extractId(path) {
  return path.split('/')[3]
}

const descMap = {}
for (const [path, content] of Object.entries(descModules)) {
  descMap[extractId(path)] = content
}

const descEnMap = {}
for (const [path, content] of Object.entries(descEnModules)) {
  descEnMap[extractId(path)] = content
}

const imageMap = {}
for (const [path, url] of Object.entries(imageModules)) {
  const id = extractId(path)
  if (!imageMap[id]) imageMap[id] = []
  imageMap[id].push(url)
}

function getDesc(id) {
  if (locale.value === 'en' && descEnMap[id]) return descEnMap[id]
  return descMap[id] || ''
}

function getImages(id) {
  return imageMap[id] || []
}

/* ===== shuffle ===== */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const shuffled = shuffle(interestsData)

/* ===== tag cloud styles ===== */
const colors = [
  '#d44078', '#c73e6b', '#b04ad2', '#8b5cf6',
  '#6d5ac3', '#4a8ad4', '#3b82b6', '#0ea5a0',
  '#089b7a', '#59a043', '#c04a2e', '#d4743c',
  '#d44078', '#b04ad2', '#4a8ad4', '#0ea5a0',
]

const tagStyles = computed(() =>
  shuffled.map((item, i) => {
    const baseSize = 14 + item.weight * 4
    const j = i * 7
    return {
      fontSize: (baseSize + (j % 6)) + 'px',
      color: colors[i % colors.length],
      transform: `rotate(${(j % 9) - 4}deg)`,
      '--tag-delay': `${0.05 * i}s`,
    }
  })
)

function label(item) {
  return locale.value === 'en' && item.textEn ? item.textEn : item.text
}

/* ===== modals ===== */
const avatarModalOpen = ref(false)
const activeId = ref(null)
const currentPage = ref(0)
const carouselIdx = ref(0)
let carouselTimer = null

/* ===== tag dismiss game ===== */
const dismissedTags = ref(new Set())
const qrModalOpen = ref(false)

function dismissAndOpen(item) {
  dismissedTags.value = new Set([...dismissedTags.value, item.id])
  if (dismissedTags.value.size >= interestsData.length) {
    setTimeout(() => {
      dismissedTags.value = new Set()
      qrModalOpen.value = true
    }, 450)
  } else {
    openInterest(item)
  }
}

function closeQrModal() {
  qrModalOpen.value = false
}

const activeInterest = computed(() =>
  interestsData.find((it) => it.id === activeId.value)
)

/* ===== simple markdown → HTML ===== */
function renderMarkdown(md) {
  if (!md) return ''
  let html = md
  html = html.replace(/^# (.+)$/gm, '<h3 class="imd-h3">$1</h3>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/^> (.+)$/gm, '<blockquote class="imd-blockquote">$1</blockquote>')
  html = '<p>' + html.split(/\n\n+/).join('</p><p>') + '</p>'
  html = html.replace(/\n/g, '<br>')
  html = html.replace(/<p>\s*<\/p>/g, '')
  return html
}

const descPages = computed(() => {
  const md = activeInterest.value ? getDesc(activeInterest.value.id) : ''
  const fullHtml = renderMarkdown(md)
  if (!fullHtml) return ['']

  const blocks = fullHtml.split(/(?<=<\/p>|<\/h3>|<\/blockquote>)/)
  const pages = []
  let current = ''
  const LIMIT = 420
  for (const b of blocks) {
    if (current && current.length + b.length > LIMIT) {
      pages.push(current)
      current = b
    } else {
      current += b
    }
  }
  if (current) pages.push(current)
  return pages.length ? pages : ['']
})

const hasPages = computed(() => descPages.value.length > 1)
const pageLabel = computed(() =>
  hasPages.value ? `${currentPage.value + 1} / ${descPages.value.length}` : ''
)

function goPage(delta) {
  const n = currentPage.value + delta
  if (n >= 0 && n < descPages.value.length) {
    currentPage.value = n
  }
}

/* ===== carousel ===== */
const images = computed(() =>
  activeInterest.value ? getImages(activeInterest.value.id) : []
)

const hasCarousel = computed(() => images.value.length > 0)
const multiImage = computed(() => images.value.length > 1)

function startCarousel() {
  stopCarousel()
  if (images.value.length > 1) {
    carouselTimer = setInterval(() => {
      carouselIdx.value = (carouselIdx.value + 1) % images.value.length
    }, 3500)
  }
}

function stopCarousel() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
}

function gotoImage(idx) {
  stopCarousel()
  carouselIdx.value = idx
  startCarousel()
}

/* ===== open / close ===== */
function openInterest(item) {
  activeId.value = item.id
  currentPage.value = 0
  carouselIdx.value = 0
  if (getImages(item.id).length > 1) startCarousel()
}

function closeInterest() {
  activeId.value = null
  stopCarousel()
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    if (qrModalOpen.value) closeQrModal()
    else if (activeId.value) closeInterest()
    else avatarModalOpen.value = false
  }
  if (e.key === 'ArrowLeft' && activeId.value && hasPages.value) {
    e.preventDefault()
    goPage(-1)
  }
  if (e.key === 'ArrowRight' && activeId.value && hasPages.value) {
    e.preventDefault()
    goPage(1)
  }
}

/* ---- reset page & carousel when description language changes ---- */
watch(() => activeId.value ? getDesc(activeId.value) : null, () => {
  currentPage.value = 0
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  stopCarousel()
})
</script>

<template>
  <section class="hero-section">
    <div class="hero-left">
      <div class="hero-badge">{{ t('home.tag') }}</div>
      <h1 class="hero-title">
        {{ t('home.greeting') }}
        <span class="hero-subtitle">{{ t('home.subtitle') }}</span>
      </h1>
      <p class="hero-text">{{ t('home.intro') }}</p>
      <div class="hero-actions">
        <router-link to="/projects" class="btn btn-primary">{{ t('home.viewProjects') }}</router-link>
        <router-link to="/contact" class="btn btn-ghost">{{ t('home.contactMe') }}</router-link>
      </div>
    </div>

    <div class="hero-right">
      <div class="pixel-card avatar-card">
        <button type="button" class="avatar-pixel" @click="avatarModalOpen = true"
          :aria-label="t('home.name')"></button>
        <div class="avatar-info">
          <div class="avatar-name">{{ t('home.name') }}</div>
          <div class="avatar-role">{{ t('home.role') }}</div>
          <div class="avatar-status">{{ t('home.status') }}</div>
          <router-link to="/contact" class="btn btn-sm">{{ t('home.learnMore') }}</router-link>
        </div>
      </div>

      <div class="pixel-card mood-card">
        <div class="card-label">{{ t('home.moodLabel') }}</div>
        <p class="mood-text">{{ t('home.mood') }}</p>
        <div class="mood-dots">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>
    </div>
  </section>

  <!-- Interest Cloud -->
  <section class="section-dark interest-section">
    <div class="interest-cloud">
      <button
        v-for="(item, i) in shuffled"
        :key="item.id"
        type="button"
        class="cloud-tag jelly"
        :class="{ 'tag-gone': dismissedTags.has(item.id) }"
        :style="tagStyles[i]"
        @click="dismissAndOpen(item)"
      >{{ label(item) }}</button>
    </div>
  </section>

  <!-- Avatar Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="avatarModalOpen" class="avatar-modal" @click.self="avatarModalOpen = false">
        <div class="avatar-modal-inner">
          <img src="/avatar.png" alt="Avatar" class="avatar-modal-image">
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Interest Detail Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="activeInterest" class="interest-modal" @click.self="closeInterest">
        <div class="interest-modal-inner">
          <button type="button" class="interest-close" @click="closeInterest" aria-label="Close">&times;</button>

          <!-- Carousel -->
          <div v-if="hasCarousel" class="carousel">
            <div class="carousel-track">
              <img
                v-for="(img, idx) in images"
                :key="idx"
                :src="img"
                :alt="label(activeInterest)"
                class="carousel-img"
                :class="{ active: idx === carouselIdx }"
                loading="lazy"
              >
            </div>
            <button v-if="multiImage" type="button" class="carousel-btn carousel-prev"
              @click="gotoImage((carouselIdx - 1 + images.length) % images.length)" aria-label="Previous">&lsaquo;</button>
            <button v-if="multiImage" type="button" class="carousel-btn carousel-next"
              @click="gotoImage((carouselIdx + 1) % images.length)" aria-label="Next">&rsaquo;</button>
            <div v-if="multiImage" class="carousel-dots">
              <span v-for="(_, idx) in images" :key="idx" class="carousel-dot"
                :class="{ active: idx === carouselIdx }" @click="gotoImage(idx)"></span>
            </div>
          </div>

          <h3 class="interest-modal-title">{{ label(activeInterest) }}</h3>

          <!-- Description with pagination -->
          <div class="interest-modal-body" v-html="descPages[currentPage] || ''"></div>

          <!-- Pagination bar -->
          <div v-if="hasPages" class="pagination-bar">
            <button type="button" class="page-btn" :disabled="currentPage === 0" @click="goPage(-1)">&laquo;</button>
            <span class="page-label">{{ pageLabel }}</span>
            <button type="button" class="page-btn" :disabled="currentPage >= descPages.length - 1" @click="goPage(1)">&raquo;</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- QR Code Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="qrModalOpen" class="qr-modal" @click.self="closeQrModal">
        <div class="qr-modal-inner">
          <button type="button" class="interest-close" @click="closeQrModal" aria-label="Close">&times;</button>
          <img :src="'/wechat-qr.jpg'" alt="WeChat QR Code" class="qr-image">
          <p class="qr-text">{{ locale === 'en' ? "Now you know all about me. Maybe you'd like to be friends?" : '了解完全部，也许你想和我成为朋友。' }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ===== Hero ===== */
.hero-section {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 32px;
  align-items: start;
  padding: 40px 0 64px;
}

.hero-badge {
  display: inline-block;
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.hero-title {
  font-family: var(--font-pixel);
  font-size: 32px;
  line-height: 1.3;
  margin: 16px 0 20px;
  background: linear-gradient(135deg, #d44078, var(--text));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  display: block;
  font-size: 16px;
  font-weight: 400;
  -webkit-text-fill-color: var(--text-muted);
  margin-top: 8px;
}

.hero-text {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 20px;
  white-space: pre-line;
}

.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }

.hero-right { display: flex; flex-direction: column; gap: 16px; }

.avatar-card { display: grid; grid-template-columns: 100px 1fr; gap: 16px; align-items: center; }

.avatar-pixel {
  appearance: none; border: none; padding: 0; cursor: pointer;
  width: 88px; height: 88px; margin: 0 auto;
  background: url("/avatar.png") center/cover no-repeat, var(--bg-elevated);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-out);
}

.avatar-pixel:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent-glow);
  transform: scale(1.05);
}

.avatar-name { font-weight: 600; font-size: 16px; }
.avatar-role { color: var(--accent); font-size: 12px; margin-top: 2px; }
.avatar-status { margin: 10px 0; font-size: 11px; color: var(--text-muted); }

.mood-card { text-align: center; }
.mood-text {
  font-family: var(--font-mono); font-size: 20px;
  color: var(--accent); margin: 12px 0 8px;
}
.mood-dots { display: flex; justify-content: center; gap: 8px; }

.dot {
  width: 6px; height: 6px; border-radius: 2px;
  background: var(--accent);
  animation: dotBreathe 1.8s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.3s; }
.dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotBreathe {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}

/* ===== Interest Cloud ===== */
.interest-section {
  margin-top: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 36px 28px;
}

.interest-cloud {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center;
  gap: 20px 32px; padding: 32px 20px; min-height: 180px;
}

.cloud-tag {
  cursor: pointer; appearance: none;
  border: 1px solid transparent; padding: 4px 12px; border-radius: 20px;
  font-family: inherit; color: inherit;
  background: rgba(255, 128, 184, 0.06);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: tagPopIn 0.5s var(--ease-out) backwards;
  animation-delay: var(--tag-delay);
}

@keyframes tagPopIn {
  from { opacity: 0; transform: scale(0.6) translateY(12px); }
  to { opacity: 1; }
}

/* ---- jelly hover ---- */
.jelly:hover {
  animation: jellyBounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: scale(1.18);
  border-color: var(--accent);
  background: rgba(255, 128, 184, 0.18);
  box-shadow: 0 0 20px var(--accent-glow);
}

@keyframes jellyBounce {
  0%   { transform: scale(1); }
  22%  { transform: scale(1.24) rotate(1.2deg); }
  40%  { transform: scale(0.92) rotate(-0.6deg); }
  58%  { transform: scale(1.07) rotate(0.3deg); }
  76%  { transform: scale(0.97) rotate(-0.1deg); }
  100% { transform: scale(1.18); }
}

/* ---- tag dismiss ---- */
.tag-gone {
  animation: tagPopOut 0.35s var(--ease-out) forwards;
  pointer-events: none;
}

@keyframes tagPopOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.3) translateY(-20px); }
}

/* ===== Avatar Modal ===== */
.avatar-modal {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(5, 2, 8, 0.6);
  backdrop-filter: blur(16px);
}

.avatar-modal-inner {
  max-width: min(420px, 90vw); max-height: 80vh;
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  background: var(--bg-elevated); padding: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.avatar-modal-image {
  display: block; max-width: 100%; max-height: 100%;
  border-radius: var(--radius-md);
}

/* ===== Interest Modal ===== */
.interest-modal {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(5, 2, 8, 0.5);
  backdrop-filter: blur(20px) saturate(140%);
}

.interest-modal-inner {
  position: relative;
  max-width: min(520px, 92vw); width: 100%; max-height: 88vh;
  overflow-y: auto;
  background: var(--bg-elevated);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 32px 28px 28px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
}

.interest-close {
  position: absolute; top: 12px; right: 16px; z-index: 10;
  appearance: none; border: none; background: none;
  font-size: 24px; color: var(--text-muted); cursor: pointer;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-out);
}
.interest-close:hover { color: var(--text); background: rgba(128,128,128,0.1); }

/* ---- carousel ---- */
.carousel {
  position: relative;
  margin-bottom: 20px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-deep);
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 66.67%;
  background: var(--bg-deep);
}

.carousel-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.5s var(--ease-out);
}
.carousel-img.active { opacity: 1; }

.carousel-btn {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
  appearance: none; border: none;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(8px);
  color: #fff; font-size: 22px;
  width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.carousel-btn:hover { background: rgba(0,0,0,0.6); }
.carousel-prev { left: 8px; }
.carousel-next { right: 8px; }

.carousel-dots {
  display: flex; justify-content: center; gap: 8px;
  padding: 10px 0 0;
}
.carousel-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.25); cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.carousel-dot.active { background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
.carousel-dot:hover { background: rgba(255,255,255,0.5); }

/* ---- title & body ---- */
.interest-modal-title {
  font-family: var(--font-pixel); font-size: 14px;
  color: var(--accent); margin: 0 0 16px; text-align: center;
}

.interest-modal-body {
  font-size: 14px; line-height: 1.85; color: var(--text-muted);
  text-align: left; margin: 0;
}

.interest-modal-body :deep(.imd-h3) {
  font-size: 15px; font-weight: 600; color: var(--text);
  margin: 0 0 10px;
}

.interest-modal-body :deep(strong) { color: var(--text); font-weight: 600; }

.interest-modal-body :deep(.imd-blockquote) {
  margin: 12px 0; padding: 8px 14px;
  border-left: 2px solid var(--accent);
  font-style: italic; color: var(--text);
  background: rgba(255,128,184,0.06);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.interest-modal-body :deep(p) { margin: 0 0 10px; }
.interest-modal-body :deep(p:last-child) { margin-bottom: 0; }

/* ---- pagination ---- */
.pagination-bar {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 20px; padding-top: 16px;
  border-top: 1px solid var(--border);
}

.page-btn {
  appearance: none; border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text);
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.page-btn:disabled { opacity: 0.3; cursor: default; }

.page-label {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
  min-width: 48px; text-align: center;
}

/* ===== QR Modal ===== */
.qr-modal {
  position: fixed; inset: 0; z-index: 210;
  display: flex; align-items: center; justify-content: center;
  background: rgba(5, 2, 8, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
}

.qr-modal-inner {
  position: relative;
  max-width: min(360px, 90vw);
  background: rgba(24, 24, 37, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  padding: 36px 28px 28px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(255, 128, 184, 0.08) inset;
  animation: fadeInUp 0.5s var(--ease-out);
}

.qr-image {
  width: 200px; height: 200px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  display: block; margin: 0 auto 20px;
}

.qr-text {
  font-size: 15px; line-height: 1.7;
  color: var(--text-muted); margin: 0;
}

/* ===== transitions ===== */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ===== responsive ===== */
@media (max-width: 768px) {
  .hero-section { grid-template-columns: 1fr; padding: 20px 0 40px; }
  .hero-title { font-size: 24px; }
  .avatar-card { grid-template-columns: 1fr; text-align: center; }
  .interest-cloud { gap: 14px 20px; padding: 20px 12px; }
  .interest-modal-inner { padding: 24px 18px 20px; }
}

@media (max-width: 480px) {
  .hero-actions { flex-direction: column; }
}
</style>
