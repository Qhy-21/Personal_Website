<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('about.title') }}</h2>

    <div class="about-grid">
      <div class="pixel-card about-intro">
        <div class="about-avatar">
          <img src="/avatar.png" :alt="t('about.name')">
        </div>
        <div class="about-info">
          <h3>{{ t('about.name') }}</h3>
          <p class="about-subtitle">{{ t('about.role') }}</p>
          <p class="about-desc">{{ t('about.desc') }}</p>
        </div>
      </div>

      <div class="pixel-card">
        <h3>{{ t('about.basicInfo') }}</h3>
        <ul class="info-list">
          <li>
            <span class="info-key">{{ t('about.website') }}</span>
            <a href="https://qhy-alfie.work" target="_blank" class="info-value">qhy-alfie.work</a>
          </li>
          <li>
            <span class="info-key">GitHub</span>
            <a href="https://github.com/Qhy-21" target="_blank" class="info-value">github.com/Qhy-21</a>
          </li>
          <li>
            <span class="info-key">{{ t('about.email') }}</span>
            <span class="info-value">zhf1830657854@163.com</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.phone') }}</span>
            <span class="info-value">151********</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.location') }}</span>
            <span class="info-value">{{ t('about.locationValue') }}</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.age') }}</span>
            <span class="info-value">{{ t('about.ageValue') }}</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.school') }}</span>
            <span class="info-value">{{ t('about.schoolValue') }}</span>
          </li>
        </ul>
      </div>

      <div class="pixel-card timeline-card">
        <h3>{{ t('about.timeline') }}</h3>
        <ul class="timeline">
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2023Title') }}</div>
              <div class="time-text">{{ t('about.tl2023Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2024Title') }}</div>
              <div class="time-text">{{ t('about.tl2024Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2025Title') }}</div>
              <div class="time-text">{{ t('about.tl2025Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2026Title') }}</div>
              <div class="time-text">{{ t('about.tl2026Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot is-ongoing"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tlNowTitle') }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="slogan-card">
      <p class="slogan-text">{{ t('about.slogan') }}</p>
    </div>
  </section>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.about-intro {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.about-avatar {
  flex-shrink: 0;
}

.about-avatar img {
  width: 96px;
  height: 96px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--bg-elevated);
}

.about-info {
  flex: 1;
}

.about-subtitle {
  color: var(--accent);
  font-size: 12px;
  margin: 4px 0;
  font-weight: 500;
}

.about-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  white-space: pre-line;
}

/* Info list */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}

.info-list li:last-child {
  border-bottom: none;
}

.info-key {
  color: var(--text-muted);
  font-weight: 500;
  min-width: 90px;
}

.info-value {
  color: var(--text);
  text-align: right;
}

/* Timeline */
.timeline-card {
  grid-column: 1 / -1;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 1px solid var(--border);
}

.timeline li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 16px;
  animation: slideInLeft 0.5s var(--ease-out) backwards;
}

.timeline li:nth-child(1) { animation-delay: 0.05s; }
.timeline li:nth-child(2) { animation-delay: 0.15s; }
.timeline li:nth-child(3) { animation-delay: 0.25s; }
.timeline li:nth-child(4) { animation-delay: 0.35s; }
.timeline li:nth-child(5) { animation-delay: 0.45s; }

.timeline li:last-child {
  margin-bottom: 0;
}

.time-dot {
  position: absolute;
  left: -4.5px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--accent);
}

.time-dot.is-ongoing {
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 6px var(--accent-glow); }
  50% { box-shadow: 0 0 16px var(--accent-glow); }
}

.time-title {
  font-size: 14px;
  font-weight: 600;
}

.time-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.6;
}

/* Slogan */
.slogan-card {
  background: linear-gradient(135deg, rgba(255, 126, 179, 0.06), rgba(255, 79, 139, 0.04));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  text-align: center;
  backdrop-filter: blur(12px);
}

.slogan-text {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 600;
  color: var(--accent);
  margin: 0;
  letter-spacing: 0.04em;
}

@media (max-width: 768px) {
  .about-intro {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .about-avatar img {
    width: 80px;
    height: 80px;
  }
}
</style>
