<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('contact.title') }}</h2>
    <div class="contact-grid">
      <div class="pixel-card">
        <h3>{{ t('contact.findMe') }}</h3>
        <ul class="contact-list">
          <li>
            <span class="ci-icon">✉️</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.email') }}</span>
              <a href="mailto:zhf1830657854@163.com" class="ci-value">zhf1830657854@163.com</a>
            </div>
          </li>
          <li>
            <span class="ci-icon">🌐</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.website') }}</span>
              <a href="https://qhy-alfie.work" target="_blank" class="ci-value">qhy-alfie.work</a>
            </div>
          </li>
          <li>
            <span class="ci-icon">🐙</span>
            <div class="ci-detail">
              <span class="ci-label">GitHub</span>
              <a href="https://github.com/Qhy-21" target="_blank" class="ci-value">github.com/Qhy-21</a>
            </div>
          </li>
          <li>
            <span class="ci-icon">📱</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.phone') }}</span>
              <span class="ci-value">151********</span>
            </div>
          </li>
          <li>
            <span class="ci-icon">📍</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.location') }}</span>
              <span class="ci-value">{{ t('contact.locationValue') }}</span>
            </div>
          </li>
          <li>
            <span class="ci-icon">🎓</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.school') }}</span>
              <span class="ci-value">{{ t('contact.schoolValue') }}</span>
            </div>
          </li>
        </ul>
        <div class="resume-download">
          <a href="/Qhy_introduction.html" target="_blank" class="btn btn-primary btn-resume">{{ t('contact.viewResume') }}</a>
        </div>
      </div>

      <div class="pixel-card future-card">
        <h3>{{ t('contact.messageToFuture') }}</h3>
        <div class="future-content">
          <p>{{ t('contact.msg1') }}</p>
          <p>{{ t('contact.msg2') }}</p>
          <p>{{ t('contact.msg3') }}</p>
        </div>
        <div class="future-deco">
          <span class="pixel-diamond">◆</span>
          <span class="pixel-diamond">◆</span>
          <span class="pixel-diamond">◆</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.contact-list li:last-child {
  margin-bottom: 0;
}

.ci-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.ci-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ci-label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.ci-value {
  color: var(--text);
  word-break: break-all;
}

.resume-download {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.btn-resume {
  width: 100%;
  justify-content: center;
}

/* Future card */
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
</style>
