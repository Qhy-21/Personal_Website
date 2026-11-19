<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BookCover from '../components/journal/BookCover.vue'
import PageIntro from '../components/PageIntro.vue'
import SiteIcon from '../components/SiteIcon.vue'

const { t, locale } = useI18n()
</script>

<template>
  <section class="section journal-landing">
    <PageIntro
      eyebrow="WORDS & OTHER WORLDS"
      :title="locale === 'en' ? 'A place for words.' : '把一些瞬间，留在纸上。'"
      :description="locale === 'en' ? 'Stories, passing thoughts, and poems. A small collection of the things I wanted to keep.' : '文章、随笔与诗歌。那些想过的、经历过的，以及不想忘记的。'"
    >
      <span class="journal-signature">{{ locale === 'en' ? 'Notes by QHY' : '羌花吟的私人书架' }}</span>
    </PageIntro>

    <div class="shelf-heading">
      <span><SiteIcon name="book" />{{ t('journal.title') }}</span>
      <span>{{ t('journal.hint') }}</span>
    </div>
    <div class="bookshelf">
      <BookCover type="articles" :cover-title="t('journal.articles')" :cover-subtitle="t('journal.articlesSub')" />
      <BookCover type="essays" :cover-title="t('journal.essays')" :cover-subtitle="t('journal.essaysSub')" />
      <BookCover type="poems" :cover-title="t('journal.poems')" :cover-subtitle="t('journal.poemsSub')" />
    </div>
    <div class="shelf-colophon">
      <span>QHY · PERSONAL COLLECTION</span>
      <span>{{ locale === 'en' ? 'Still writing, still finding the words.' : '慢慢写，也慢慢生活。' }}</span>
    </div>
  </section>
</template>

<style scoped>
.journal-signature { color: var(--text-muted); font-family: var(--font-display); font-size: 17px; }
.shelf-heading, .shelf-colophon { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: var(--text-muted); font-size: 13px; }
.shelf-heading { padding: 20px 0; border-top: 1px solid var(--border-strong); }
.shelf-heading > span:first-child { display: inline-flex; align-items: center; gap: 10px; color: var(--text); }
.shelf-heading :deep(svg) { width: 18px; height: 18px; }
.bookshelf { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(28px, 5vw, 72px); padding: 44px clamp(20px, 4vw, 56px) 36px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.shelf-colophon { padding-top: 24px; }
.shelf-colophon > span:first-child { font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em; }
@media (max-width: 700px) {
  .bookshelf { grid-template-columns: 1fr; gap: 44px; padding: 36px 32px; }
  .shelf-heading { align-items: flex-start; }
  .shelf-heading > span:last-child { font-size: 12px; text-align: right; }
  .shelf-colophon { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
