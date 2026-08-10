<script setup>
import { useI18n } from 'vue-i18n'
import BookCover from '../components/journal/BookCover.vue'

const { t } = useI18n()
</script>

<template>
  <section class="section journal-landing">
    <h2 class="section-title">{{ t('journal.title') }}</h2>

    <div class="bookshelf">
      <BookCover
        type="essays"
        :coverTitle="t('journal.essays')"
        :coverSubtitle="t('journal.essaysSub')"
      />
      <BookCover
        type="poems"
        :coverTitle="t('journal.poems')"
        :coverSubtitle="t('journal.poemsSub')"
      />
    </div>

    <p class="bookshelf-hint">{{ t('journal.hint') }}</p>
  </section>
</template>

<style scoped>
.journal-landing {
  position: relative;
}

.journal-landing::before {
  content: '\7B46';
  position: absolute;
  top: -30px;
  right: 8px;
  font-size: 140px;
  color: var(--accent);
  opacity: 0.025;
  pointer-events: none;
  font-family: serif;
  line-height: 1;
}

.bookshelf {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 20px 0 8px;
}

.bookshelf-hint {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 24px;
  opacity: 0.45;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}

@media (max-width: 768px) {
  .bookshelf {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .journal-landing::before {
    font-size: 100px;
    top: -20px;
  }
}
</style>
