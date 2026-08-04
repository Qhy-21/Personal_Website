<script setup>
import { useI18n } from 'vue-i18n'
import { AVATAR } from '../constants/assets.js'

const { t } = useI18n()
</script>

<template>

  <!-- 基本信息 + 时间轴 -->
  <section class="section">
    <div class="about-grid-two">
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
            <a href="mailto:zhf1830657854@163.com" class="info-value">zhf1830657854@163.com</a>
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

      <div class="pixel-card">
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

  <!-- 给未来的自己 -->
  <section class="section">
    <div class="pixel-card future-card">
      <h3>{{ t('contact.messageToFuture') }}</h3>
      <div class="future-content">
        <p>{{ t('contact.msg1') }}</p>
        <p>{{ t('contact.msg2') }}</p>
      </div>
      <div class="future-deco">
        <span class="pixel-diamond">&#9670;</span>
        <span class="pixel-diamond">&#9670;</span>
        <span class="pixel-diamond">&#9670;</span>
      </div>
    </div>
  </section>

  <!-- Slogan -->
  <section class="section">
    <div class="slogan-card">
      <p class="slogan-text">{{ t('about.slogan') }}</p>
    </div>
  </section>
</template>

<style scoped>
/* ===== Hero ===== */
.about-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 36px 28px;
}

.about-avatar img {
  width: 112px;
  height: 112px;
  border: 2px solid var(--accent);
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--bg-elevated);
  box-shadow: 0 0 24px var(--accent-glow);
}

.about-hero-name {
  font-family: var(--font-pixel);
  font-size: 16px;
  color: var(--text);
  margin: 0 0 6px;
  letter-spacing: 0.06em;
}

.about-hero-role {
  color: var(--accent);
  font-size: 13px;
  margin: 0 0 8px;
  font-weight: 500;
}

.about-hero-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  white-space: pre-line;
  max-width: 520px;
  margin: 0 auto;
}

/* ===== Two-column grid ===== */
.about-grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* ===== Info list ===== */
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

/* ===== Timeline ===== */
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

/* ===== Future card ===== */
.future-card {
  display: flex;
  flex-direction: column;
}

.future-content p {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
}

.future-content p:last-child {
  margin-bottom: 0;
}

.future-deco {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.pixel-diamond {
  color: var(--accent);
  font-size: 14px;
  animation: diamondFloat 3s ease-in-out infinite;
}

.pixel-diamond:nth-child(2) { animation-delay: 0.5s; }
.pixel-diamond:nth-child(3) { animation-delay: 1s; }

@keyframes diamondFloat {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-6px); }
}

/* ===== Slogan ===== */
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

/* ===== Resume Inline ===== */
.resume-inline {
  font-size: 14px;
}

.resume-header {
  text-align: center;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--accent);
}

.resume-name {
  font-family: var(--font-pixel);
  font-size: 18px;
  color: var(--text);
  margin: 0 0 8px;
}

.resume-subtitle {
  font-size: 12px;
  color: var(--accent);
  margin: 0;
  font-weight: 500;
}

.resume-section-block {
  margin-bottom: 24px;
}

.resume-section-block:last-child {
  margin-bottom: 0;
}

.resume-section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.04em;
}

.resume-section-title::before {
  content: '';
  display: inline-block;
  width: 3px; height: 14px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}

.resume-edu {
  font-size: 14px;
  color: var(--text);
  margin: 0;
  font-weight: 500;
}

/* ===== Internship ===== */
.intern-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.intern-company {
  font-weight: 700;
  color: var(--text);
}

.intern-role {
  color: var(--text-muted);
  font-size: 12px;
}

.intern-time {
  color: var(--text-muted);
  font-size: 11px;
  font-family: var(--font-mono);
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}

.bi-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
}

.bi-icon {
  color: var(--accent);
  font-size: 8px;
  margin-top: 4px;
  flex-shrink: 0;
}

.bi-key {
  color: var(--text-muted);
  font-size: 11px;
  display: block;
}

.bi-value {
  color: var(--text);
  font-size: 12px;
}

.bi-link {
  font-size: 12px;
  color: var(--accent);
  display: block;
}

.tech-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tech-col {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tech-cat {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  min-width: 56px;
  text-align: right;
  flex-shrink: 0;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.r-tag {
  padding: 2px 9px;
  background: rgba(255, 128, 184, 0.07);
  border: 1px solid rgba(255, 128, 184, 0.15);
  border-radius: 12px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.r-project {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border);
}

.r-project:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.rp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.rp-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--text);
}

.rp-tag {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  background: var(--accent-strong);
  flex-shrink: 0;
  white-space: nowrap;
}

.rp-tag.ongoing {
  background: #e8960c;
}

.rp-date {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-bottom: 4px;
}

.rp-tech {
  font-size: 11px;
  color: var(--text-muted);
  margin: 4px 0;
  line-height: 1.5;
}

.rp-tech strong {
  color: var(--text);
  font-weight: 600;
}

.rp-desc {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

.rp-desc li {
  position: relative;
  padding-left: 12px;
  margin-bottom: 3px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

.rp-desc li::before {
  content: '–';
  position: absolute;
  left: 0; top: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.self-eval-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.self-eval-list li {
  position: relative;
  padding-left: 14px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
}

.self-eval-list li::before {
  content: '\203A';
  position: absolute;
  left: 0; top: -1px;
  color: var(--accent-strong);
  font-size: 14px;
  font-weight: 700;
}

.self-eval-list li:last-child {
  margin-bottom: 0;
}

/* ===== Animations ===== */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .about-grid-two {
    grid-template-columns: 1fr;
  }

  .about-hero {
    padding: 24px 18px;
  }

  .about-avatar img {
    width: 80px;
    height: 80px;
  }

  .basic-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
