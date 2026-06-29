<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import interestsData from '../data/interests.js'

const { t, locale } = useI18n()

const colors = [
  '#ff7eb3', '#ff9999', '#ffcc99', '#ffff99',
  '#99ff99', '#99ffff', '#99ccff', '#cc99ff',
  '#ff99cc', '#ff6666', '#ff9966', '#ffcc66',
  '#66ffcc', '#66ccff', '#cc66ff', '#ff66b3',
]

const avatarModalOpen = ref(false)

function onKeydown(e) {
  if (e.key === 'Escape') avatarModalOpen.value = false
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const tagStyles = computed(() =>
  interestsData.map((item, i) => {
    const baseSize = 14 + item.weight * 4
    const j = i * 7
    return {
      fontSize: (baseSize + (j % 6)) + 'px',
      color: colors[i % colors.length],
      transform: `rotate(${(j % 9) - 4}deg)`,
    }
  })
)
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
      <p class="hero-version">{{ t('home.version') }}</p>
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

  <section class="section-dark interest-section">
    <div class="interest-cloud">
      <span v-for="(item, i) in interestsData" :key="item.text" class="cloud-tag"
        :style="tagStyles[i]">
        {{ locale === 'en' && item.textEn ? item.textEn : item.text }}
      </span>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="avatarModalOpen" class="avatar-modal" @click.self="avatarModalOpen = false">
        <div class="avatar-modal-inner">
          <img src="/avatar.png" alt="Avatar" class="avatar-modal-image">
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
  background: linear-gradient(135deg, #ff7eb3, #ffffff);
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

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.hero-version {
  font-size: 11px;
  color: var(--text-muted);
}

.hero-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.avatar-card {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 16px;
  align-items: center;
}

.avatar-pixel {
  appearance: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 88px; height: 88px;
  margin: 0 auto;
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
  font-family: var(--font-mono);
  font-size: 20px;
  color: var(--accent);
  margin: 12px 0 8px;
}

.mood-dots { display: flex; justify-content: center; gap: 8px; }

.dot {
  width: 6px; height: 6px;
  border-radius: 2px;
  background: var(--accent);
  animation: dotBreathe 1.8s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.3s; }
.dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotBreathe {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}

/* Interest Cloud */
.interest-section { margin-top: 16px; }

.interest-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px 32px;
  padding: 32px 20px;
  min-height: 180px;
}

.cloud-tag {
  cursor: default;
  transition: all 0.3s var(--ease-out);
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 128, 184, 0.06);
  border: 1px solid transparent;
}

.cloud-tag:hover {
  transform: scale(1.12);
  border-color: var(--border-hover);
  background: rgba(255, 128, 184, 0.12);
}

/* Avatar Modal */
.avatar-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 2, 8, 0.6);
  backdrop-filter: blur(16px);
}

.avatar-modal-inner {
  max-width: min(420px, 90vw);
  max-height: 80vh;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  padding: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.avatar-modal-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--radius-md);
}

.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    padding: 20px 0 40px;
  }

  .hero-title { font-size: 24px; }
  .avatar-card { grid-template-columns: 1fr; text-align: center; }
  .interest-cloud { gap: 14px 20px; padding: 20px 12px; }
}

@media (max-width: 480px) {
  .hero-actions { flex-direction: column; }
}
</style>
