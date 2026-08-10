<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  interest: { type: Object, default: null },
  locale: { type: String, required: true },
})
const emit = defineEmits(['close'])

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
  if (props.locale === 'en' && descEnMap[id]) return descEnMap[id]
  return descMap[id] || ''
}

function getImages(id) {
  return imageMap[id] || []
}

/* ===== helpers ===== */
function label(item) {
  return props.locale === 'en' && item.textEn ? item.textEn : item.text
}

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

/* ===== state ===== */
const currentPage = ref(0)
const carouselIdx = ref(0)
let carouselTimer = null

const descPages = computed(() => {
  if (!props.interest) return ['']
  const md = getDesc(props.interest.id)
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
  props.interest ? getImages(props.interest.id) : []
)

const hasCarousel = computed(() => images.value.length > 0)
const multiImage = computed(() => images.value.length > 1)

const imgLoaded = ref(new Set())
const slowTimer = ref(null)
const showSlowHint = ref(false)

function onImgLoad(idx) {
  imgLoaded.value = new Set([...imgLoaded.value, idx])
}

function onImgError(idx) {
  imgLoaded.value = new Set([...imgLoaded.value, idx])
}

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

/* ===== touch swipe ===== */
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e) {
  if (!props.interest || !multiImage.value) return
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    e.preventDefault()
    if (dx > 0) {
      gotoImage((carouselIdx.value - 1 + images.value.length) % images.value.length)
    } else {
      gotoImage((carouselIdx.value + 1) % images.value.length)
    }
  }
}

/* ===== init / reset ===== */
watch(() => props.interest, (item) => {
  currentPage.value = 0
  carouselIdx.value = 0
  imgLoaded.value = new Set()
  showSlowHint.value = false
  clearTimeout(slowTimer.value)
  if (item) {
    slowTimer.value = setTimeout(() => {
      const imgs = getImages(item.id)
      if (imgs.length > 0 && imgLoaded.value.size < imgs.length) {
        showSlowHint.value = true
      }
    }, 2000)
    if (getImages(item.id).length > 1) startCarousel()
    else stopCarousel()
  }
})

watch(() => props.interest ? getDesc(props.interest.id) : null, () => {
  currentPage.value = 0
})

onUnmounted(() => {
  stopCarousel()
  clearTimeout(slowTimer.value)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="interest" class="interest-modal" @click.self="emit('close')">
        <div class="interest-modal-inner">
          <button type="button" class="interest-close" @click="emit('close')" aria-label="Close">&times;</button>

          <!-- Carousel -->
          <div v-if="hasCarousel" class="carousel" @touchstart="onTouchStart" @touchend="onTouchEnd">
            <div class="carousel-track">
              <img
                v-for="(img, idx) in images"
                :key="idx"
                :src="img"
                :alt="label(interest)"
                class="carousel-img"
                :class="{ active: idx === carouselIdx }"
                loading="lazy"
                @load="onImgLoad(idx)"
                @error="onImgError(idx)"
              >
            </div>
            <div v-if="showSlowHint && imgLoaded.size < images.length" class="carousel-slow-hint">
              {{ $t('home.interestSlowHint') }}
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

          <h3 class="interest-modal-title">{{ label(interest) }}</h3>

          <div class="interest-modal-body" v-html="descPages[currentPage] || ''"></div>

          <div v-if="hasPages" class="pagination-bar">
            <button type="button" class="page-btn" :disabled="currentPage === 0" @click="goPage(-1)">&laquo;</button>
            <span class="page-label">{{ pageLabel }}</span>
            <button type="button" class="page-btn" :disabled="currentPage >= descPages.length - 1" @click="goPage(1)">&raquo;</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
  background: rgba(128,128,128,0.3); cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}
.carousel-dot.active { background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
.carousel-dot:hover { background: rgba(128,128,128,0.55); }

.carousel-slow-hint {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.85);
  font-size: 11px; text-align: center; white-space: nowrap;
  z-index: 3;
  animation: fadeIn 0.3s var(--ease-out);
}

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

@media (max-width: 768px) {
  .interest-modal-inner { padding: 24px 18px 20px; }
}
</style>
