<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { useDialog } from '../composables/useDialog'

type Interest = { id: string; text: string; textEn?: string }
const props = defineProps<{ interest: Interest; locale: string }>()
const emit = defineEmits<{ close: [] }>()
const modalOpen = computed({ get: () => Boolean(props.interest), set: value => { if (!value) emit('close') } })
const { dialogRef } = useDialog(modalOpen)

// Glob keys are a lightweight index. Each loader is called only when its
// interest, language, or current carousel image is actually requested.
const descModules = import.meta.glob<string>('../data/interests/*/desc.md', { query: '?raw', import: 'default' })
const descEnModules = import.meta.glob<string>('../data/interests/*/desc.en.md', { query: '?raw', import: 'default' })
const descUrlModules = import.meta.glob<string>('../data/interests/*/desc*.md', { query: '?url', import: 'default' })
const imageModules = import.meta.glob<string>('../data/interests/*/*.{jpg,jpeg,png,gif,webp}', { import: 'default' })
const description = shallowRef('')
const descriptionLoading = shallowRef(false)
const descriptionError = shallowRef(false)
const currentPage = shallowRef(0)
const carouselIdx = shallowRef(0)
const carouselPlaying = shallowRef(false)
const imageUrl = shallowRef('')
const imageLoading = shallowRef(false)
const imageError = shallowRef(false)
const imageRetry = shallowRef(0)
const showSlowHint = shallowRef(false)
const reducedMotion = shallowRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const images = computed(() => Object.keys(imageModules).filter(path => path.split('/')[3] === props.interest.id))
const hasCarousel = computed(() => images.value.length > 0)
const multiImage = computed(() => images.value.length > 1)
let descriptionVersion = 0
let imageVersion = 0
let disposed = false
let carouselTimer: ReturnType<typeof setTimeout> | undefined
let slowTimer: ReturnType<typeof setTimeout> | undefined
let motionPreference: MediaQueryList | undefined

function label(item: Interest) {
  return props.locale === 'en' && item.textEn ? item.textEn : item.text
}
function renderMarkdown(md: string) {
  if (!md) return ''
  let html = md
  html = html.replace(/^# (.+)$/gm, '<h3 class="imd-h3">$1</h3>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/^> (.+)$/gm, '<blockquote class="imd-blockquote">$1</blockquote>')
  html = '<p>' + html.split(/\n\n+/).join('</p><p>') + '</p>'
  html = html.replace(/\n/g, '<br>')
  return html.replace(/<p>\s*<\/p>/g, '')
}
const descPages = computed(() => {
  const fullHtml = renderMarkdown(description.value)
  if (!fullHtml) return ['']
  const blocks = fullHtml.split(/(?<=<\/p>|<\/h3>|<\/blockquote>)/)
  const pages: string[] = []
  let current = ''
  for (const block of blocks) {
    if (current && current.length + block.length > 420) { pages.push(current); current = block }
    else current += block
  }
  if (current) pages.push(current)
  return pages.length ? pages : ['']
})
const hasPages = computed(() => descPages.value.length > 1)
const pageLabel = computed(() => hasPages.value ? `${currentPage.value + 1} / ${descPages.value.length}` : '')

async function loadDescription() {
  const version = ++descriptionVersion
  const retrying = descriptionError.value
  currentPage.value = 0
  description.value = ''
  descriptionError.value = false
  descriptionLoading.value = true
  const root = '../data/interests/' + props.interest.id + '/'
  const path = props.locale === 'en' && descEnModules[root + 'desc.en.md'] ? root + 'desc.en.md' : root + 'desc.md'
  const loader = props.locale === 'en' && path.endsWith('desc.en.md') ? descEnModules[path] : descModules[path]
  try {
    if (!loader) throw new Error('Missing interest description')
    let content: string
    if (retrying) {
      // A failed dynamic import may stay cached by the browser. The asset URL
      // loader gives an independent, retryable request without reloading Home.
      const urlLoader = descUrlModules[path]
      if (!urlLoader) throw new Error('Missing interest description asset')
      const response = await fetch(await urlLoader(), { cache: 'reload' })
      if (!response.ok) throw new Error('Interest description unavailable')
      content = await response.text()
    } else content = await loader()
    if (!disposed && version === descriptionVersion) description.value = content
  } catch {
    if (!disposed && version === descriptionVersion) descriptionError.value = true
  } finally {
    if (!disposed && version === descriptionVersion) descriptionLoading.value = false
  }
}
function goPage(delta: number) {
  const next = currentPage.value + delta
  if (next >= 0 && next < descPages.value.length) currentPage.value = next
}
function clearCarouselTimer() {
  clearTimeout(carouselTimer)
  carouselTimer = undefined
}
function scheduleCarousel() {
  clearCarouselTimer()
  if (carouselPlaying.value && !imageLoading.value && !imageError.value && !document.hidden && !reducedMotion.value) {
    carouselTimer = setTimeout(() => gotoImage((carouselIdx.value + 1) % images.value.length), 3500)
  }
}
function startCarousel() {
  if (!multiImage.value || reducedMotion.value) return
  carouselPlaying.value = true
  scheduleCarousel()
}
function stopCarousel() {
  clearCarouselTimer()
  carouselPlaying.value = false
}
function gotoImage(index: number) {
  if (index < 0 || index >= images.value.length) return
  clearCarouselTimer()
  if (carouselIdx.value === index) { scheduleCarousel(); return }
  carouselIdx.value = index
}
async function loadCurrentImage() {
  const version = ++imageVersion
  clearCarouselTimer()
  clearTimeout(slowTimer)
  imageUrl.value = ''
  imageError.value = false
  showSlowHint.value = false
  const path = images.value[carouselIdx.value]
  imageLoading.value = Boolean(path)
  if (!path) return
  slowTimer = setTimeout(() => { if (version === imageVersion && imageLoading.value) showSlowHint.value = true }, 2000)
  try {
    const url = await imageModules[path]()
    if (!disposed && version === imageVersion) imageUrl.value = url
  } catch {
    if (!disposed && version === imageVersion) onImgError()
  }
}
function onImgLoad() {
  imageLoading.value = false
  showSlowHint.value = false
  clearTimeout(slowTimer)
  scheduleCarousel()
}
function onImgError() {
  imageLoading.value = false
  imageError.value = true
  showSlowHint.value = false
  clearTimeout(slowTimer)
  stopCarousel()
}
function retryImage() {
  imageRetry.value++
  loadCurrentImage()
}
let touchStartX = 0
let touchStartY = 0
function onTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX
  touchStartY = event.touches[0].clientY
}
function onTouchEnd(event: TouchEvent) {
  if (!multiImage.value) return
  const dx = event.changedTouches[0].clientX - touchStartX
  const dy = event.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    event.preventDefault()
    gotoImage((carouselIdx.value + (dx > 0 ? -1 : 1) + images.value.length) % images.value.length)
  }
}
function onVisibilityChange() {
  if (document.hidden) clearCarouselTimer()
  else scheduleCarousel()
}
function onMotionChange() {
  reducedMotion.value = motionPreference?.matches ?? false
  if (reducedMotion.value) stopCarousel()
}
watch(() => [props.interest.id, props.locale], loadDescription, { immediate: true })
watch(() => props.interest.id, () => {
  stopCarousel()
  carouselIdx.value = 0
  if (multiImage.value && !reducedMotion.value) carouselPlaying.value = true
}, { immediate: true })
watch(() => [props.interest.id, carouselIdx.value], loadCurrentImage, { immediate: true })
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onUnmounted(() => {
  disposed = true
  descriptionVersion++
  imageVersion++
  stopCarousel()
  clearTimeout(slowTimer)
  motionPreference?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="interest" class="interest-modal" @click.self="emit('close')">
        <div ref="dialogRef" class="interest-modal-inner" role="dialog" aria-modal="true" aria-labelledby="interest-title" :aria-busy="descriptionLoading" tabindex="-1">
          <button type="button" class="interest-close" @click="emit('close')" :aria-label="locale === 'en' ? 'Close' : '关闭'">&times;</button>

          <!-- Carousel -->
          <div v-if="hasCarousel" class="carousel" @touchstart="onTouchStart" @touchend="onTouchEnd">
            <div class="carousel-track">
              <img
                v-if="imageUrl && !imageError"
                :key="imageUrl + imageRetry"
                :src="imageUrl"
                :alt="label(interest)"
                class="carousel-img active"
                decoding="async"
                @load="onImgLoad"
                @error="onImgError"
              >
              <div v-if="imageLoading" class="carousel-state" role="status">{{ locale === 'en' ? 'Loading image…' : '正在加载图片…' }}</div>
              <div v-else-if="imageError" class="carousel-state" role="alert"><span>{{ locale === 'en' ? 'This image could not be loaded.' : '这张图片未能加载。' }}</span><button type="button" class="media-retry" @click="retryImage">{{ locale === 'en' ? 'Try again' : '重试' }}</button></div>
            </div>
            <div v-if="showSlowHint && imageLoading" class="carousel-slow-hint">
              {{ $t('home.interestSlowHint') }}
            </div>
            <button v-if="multiImage" type="button" class="carousel-btn carousel-prev"
              @click="gotoImage((carouselIdx - 1 + images.length) % images.length)" :aria-label="locale === 'en' ? 'Previous image' : '上一张图片'">&lsaquo;</button>
            <button v-if="multiImage" type="button" class="carousel-btn carousel-next"
              @click="gotoImage((carouselIdx + 1) % images.length)" :aria-label="locale === 'en' ? 'Next image' : '下一张图片'">&rsaquo;</button>
            <div v-if="multiImage" class="carousel-dots">
              <button v-for="(_, idx) in images" :key="idx" type="button" class="carousel-dot"
                :class="{ active: idx === carouselIdx }" :aria-label="locale === 'en' ? `Show image ${idx + 1}` : `查看第 ${idx + 1} 张图片`" :aria-pressed="idx === carouselIdx" @click="gotoImage(idx)"></button>
            </div>
            <button v-if="multiImage" type="button" class="carousel-play" :disabled="reducedMotion" :aria-pressed="carouselPlaying" @click="carouselPlaying ? stopCarousel() : startCarousel()">{{ reducedMotion ? (locale === 'en' ? 'Slideshow paused: reduced motion' : '已按减少动态效果暂停轮播') : locale === 'en' ? (carouselPlaying ? 'Pause slideshow' : 'Play slideshow') : (carouselPlaying ? '暂停轮播' : '自动轮播') }}</button>
          </div>

          <h2 id="interest-title" class="interest-modal-title">{{ label(interest) }}</h2>

          <p v-if="descriptionLoading" class="interest-load-message" role="status">{{ locale === 'en' ? 'Loading details…' : '正在加载详情…' }}</p>
          <div v-else-if="descriptionError" class="interest-load-message" role="alert"><p>{{ locale === 'en' ? 'The details could not be loaded.' : '详情未能加载。' }}</p><button type="button" class="media-retry" @click="loadDescription">{{ locale === 'en' ? 'Try again' : '重试' }}</button></div>
          <div v-else class="interest-modal-body" v-html="descPages[currentPage] || ''"></div>

          <div v-if="hasPages" class="pagination-bar">
            <button type="button" class="page-btn" :disabled="currentPage === 0" :aria-label="locale === 'en' ? 'Previous page' : '上一页'" @click="goPage(-1)">&laquo;</button>
            <span class="page-label">{{ pageLabel }}</span>
            <button type="button" class="page-btn" :disabled="currentPage >= descPages.length - 1" :aria-label="locale === 'en' ? 'Next page' : '下一页'" @click="goPage(1)">&raquo;</button>
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
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 64px 28px 28px;
  box-shadow: var(--shadow-md);
  outline: none;
}

.interest-close {
  position: absolute; top: 12px; right: 16px; z-index: 10;
  appearance: none; border: none; background: none;
  font-size: 24px; color: var(--text-muted); cursor: pointer;
  width: 44px; height: 44px;
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
.carousel-state { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; padding: 16px 52px; color: var(--text-muted); background: var(--bg-elevated); text-align: center; font-size: 13px; }
.media-retry { min-height: 44px; padding: 8px 16px; color: var(--accent); background: var(--bg-card); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); }
.interest-load-message { color: var(--text-muted); font-size: 14px; line-height: 1.8; }

.carousel-btn {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
  appearance: none; border: none;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(8px);
  color: #fff; font-size: 22px;
  width: 44px; height: 44px; border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.carousel-btn:hover { background: rgba(0,0,0,0.6); }
.carousel-prev { left: 8px; }
.carousel-next { right: 8px; }

.carousel-dots { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 2px; padding: 0 8px; }
.carousel-dot {
  display: grid; place-items: center; width: 28px; height: 32px; padding: 0; border: none;
  background: transparent; cursor: pointer;
}
.carousel-dot::before { display: block; content: ''; width: 4px; height: 4px; border-radius: 4px; background: var(--text-muted); transition: width var(--duration-fast) ease, background var(--duration-fast) ease; }
.carousel-dot.active::before { width: 12px; height: 5px; background: var(--accent); }
.carousel-dot:hover::before { background: var(--accent); }
.carousel-play { display: block; min-height: 44px; margin: 0 auto; padding: 4px 16px; background: transparent; border: 0; color: var(--accent); font-size: 12px; }
.carousel-play:disabled { color: var(--text-muted); cursor: default; }

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
  font-family: var(--font-display); font-size: 25px; font-weight: 500;
  color: var(--text); margin: 0 0 20px; text-align: left;
}

.interest-modal-body {
  font-size: 15px; line-height: 1.85; color: var(--text-muted);
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
  width: 44px; height: 44px; border-radius: var(--radius-sm);
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
  .interest-modal-inner { padding: 64px 20px 24px; }
}
</style>
