<script setup>
import { useI18n } from 'vue-i18n'
import journalsData from '../data/journals.js'

const { t } = useI18n()
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('journal.title') }}</h2>
    <div class="journal-grid">
      <article v-for="(j, i) in journalsData" :key="i" class="pixel-card journal-card"
        :style="{ animationDelay: `${0.08 * (i + 1)}s` }">
        <div class="card-label">{{ j.label }}</div>
        <p class="journal-content">{{ j.content }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.journal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.journal-card {
  position: relative;
  animation: fadeInUp 0.5s var(--ease-out) backwards;
}

.journal-content {
  white-space: pre-line;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-muted);
  font-style: italic;
}
</style>
