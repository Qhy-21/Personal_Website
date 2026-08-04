<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import interestsData from '../data/interests.js'
import InterestModal from '../components/InterestModal.vue'
import VisitorStats from '../components/VisitorStats.vue'
import { AVATAR } from '../constants/assets.js'

const { t, locale } = useI18n()

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

function tagLabel(item) {
  return locale.value === 'en' && item.textEn ? item.textEn : item.text
}

/* ===== visitor counter ===== */
const visitorTotal = ref(null)
const displayCount = ref(0)
const visitorCountries = ref([])
const visitorRecent = ref([])
const visitorOpen = ref(false)
let countAnimFrame = null

function animateCounter(target) {
  if (countAnimFrame) cancelAnimationFrame(countAnimFrame)
  const start = performance.now()
  const duration = 1400
  function tick(now) {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    displayCount.value = Math.round(p === 1 ? target : target * eased)
    if (p < 1) countAnimFrame = requestAnimationFrame(tick)
  }
  countAnimFrame = requestAnimationFrame(tick)
}

async function fetchVisitor() {
  try {
    const res = await fetch('/api/visitor', { cache: 'no-store' })
    if (!res.ok) throw new Error()
    const data = await res.json()
    visitorTotal.value = data.total
    visitorCountries.value = data.countries || []
    visitorRecent.value = data.recent || []
    animateCounter(data.total)
  } catch {
    visitorTotal.value = 529628
    displayCount.value = 529628
  }
}

function toggleVisitor() {
  if (visitorTotal.value == null) return
  visitorOpen.value = !visitorOpen.value
}

/* ===== modals ===== */
const avatarModalOpen = ref(false)
const activeInterest = ref(null)

/* ===== tag dismiss game ===== */
const dismissedTags = ref(new Set())
const qrModalOpen = ref(false)

function dismissAndOpen(item) {
  dismissedTags.value = new Set([...dismissedTags.value, item.id])
  activeInterest.value = item
}

function onInterestClose() {
  const wasLastOne = dismissedTags.value.size >= interestsData.length && !qrModalOpen.value
  activeInterest.value = null
  if (wasLastOne) {
    setTimeout(() => {
      dismissedTags.value = new Set()
      qrModalOpen.value = true
    }, 400)
  }
}

function closeQrModal() {
  qrModalOpen.value = false
}

/* ===== keyboard ===== */
function onKeydown(e) {
  if (e.key === 'Escape') {
    if (qrModalOpen.value) closeQrModal()
    else if (visitorOpen.value) visitorOpen.value = false
    else if (activeInterest.value) onInterestClose()
    else avatarModalOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  fetchVisitor()
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (countAnimFrame) cancelAnimationFrame(countAnimFrame)
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
      <button
        v-if="displayCount > 0"
        class="visitor-count"
        @click="toggleVisitor"
        :title="locale === 'en' ? 'Click to see visitor stats' : '点击查看访客统计'"
      >
        <span class="vc-icon">&#9672;</span>
        {{ locale === 'en' ? `Visitor #${displayCount.toLocaleString()}` : `你是第 ${displayCount.toLocaleString()} 位访客` }}
        <span class="vc-spark">{{ visitorTotal !== null && visitorTotal % 100 < 10 ? '✨' : '' }}</span>
      </button>
    </div>

    <div class="hero-right">
      <div class="pixel-card avatar-card">
        <button type="button" class="avatar-pixel" @click="avatarModalOpen = true"
          :aria-label="t('home.name')"></button>
        <div class="avatar-info">
          <div class="avatar-name">{{ t('home.name') }}</div>
          <div class="avatar-role">{{ t('home.role') }}</div>
          <div class="avatar-status">{{ t('home.status') }}</div>
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
      >{{ tagLabel(item) }}</button>
    </div>
  </section>

  <!-- Avatar Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="avatarModalOpen" class="avatar-modal" @click.self="avatarModalOpen = false">
        <div class="avatar-modal-inner">
          <img :src="AVATAR" alt="Avatar" class="avatar-modal-image">
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Interest Detail Modal -->
  <InterestModal
    :interest="activeInterest"
    :locale="locale"
    @close="onInterestClose"
  />

  <!-- Visitor Stats Modal -->
  <VisitorStats
    :total="visitorOpen ? visitorTotal : null"
    :countries="visitorCountries"
    :recent="visitorRecent"
    :locale="locale"
    @close="visitorOpen = false"
  />

  <!-- QR Code Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="qrModalOpen" class="qr-modal" @click.self="closeQrModal">
        <div class="qr-modal-inner">
          <button type="button" class="qr-close" @click="closeQrModal" aria-label="Close">&times;</button>
          <img src="/wechat-qr.jpg" alt="WeChat QR Code" class="qr-image">
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

.visitor-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  margin: 8px 0 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}
.visitor-count:hover {
  color: var(--accent);
  background: rgba(255, 128, 184, 0.08);
}
.vc-icon {
  font-size: 8px;
  color: var(--accent);
  animation: logoPulse 3s ease-in-out infinite;
}
.vc-spark { font-size: 14px; }

@keyframes logoPulse {
  0%, 100% { text-shadow: 0 0 6px var(--accent-glow); }
  50% { text-shadow: 0 0 16px var(--accent-glow), 0 0 28px var(--accent-glow); }
}

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

.qr-close {
  position: absolute; top: 12px; right: 16px; z-index: 10;
  appearance: none; border: none; background: none;
  font-size: 24px; color: var(--text-muted); cursor: pointer;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-out);
}
.qr-close:hover { color: var(--text); background: rgba(128,128,128,0.1); }

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

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
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
}
</style>
