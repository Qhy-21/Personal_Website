<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { loadContent, listEntries, extractToc } from '../composables/useJournal.js'
import TocSidebar from '../components/journal/TocSidebar.vue'
import MarkdownBody from '../components/journal/MarkdownBody.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const category = computed(() => {
  if (route.path.includes('/essays')) return 'essays'
  if (route.path.includes('/poems')) return 'poems'
  return null
})

const slug = computed(() => route.params.slug || null)

const content = ref('')
const headings = ref([])
const tocVisible = ref(true)
const entries = ref([])
const loading = ref(false)

const categoryTitle = computed(() => {
  if (category.value === 'essays') return t('journal.essays')
  if (category.value === 'poems') return t('journal.poems')
  return ''
})

const currentIndex = computed(() => {
  if (!slug.value || entries.value.length === 0) return -1
  return entries.value.findIndex(e => e.slug === slug.value)
})

const prevEntry = computed(() => {
  if (currentIndex.value <= 0) return null
  return entries.value[currentIndex.value - 1]
})

const nextEntry = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= entries.value.length - 1) return null
  return entries.value[currentIndex.value + 1]
})

const entryMeta = computed(() => {
  if (!slug.value) return null
  return entries.value.find(e => e.slug === slug.value) || null
})

const entryTitle = computed(() => {
  if (!entryMeta.value) return ''
  return locale.value === 'en' && entryMeta.value.titleEn
    ? entryMeta.value.titleEn
    : entryMeta.value.title
})

async function load() {
  if (!category.value) return

  loading.value = true
  try {
    entries.value = await listEntries(category.value)

    if (slug.value) {
      const raw = loadContent(category.value, slug.value)
      content.value = raw || ''
      headings.value = extractToc(content.value)
    } else {
      content.value = ''
      headings.value = []
    }
  } finally {
    loading.value = false
  }
}

function goToEntry(e) {
  router.push(`/journal/${category.value}/${e.slug}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(load)
watch(() => route.fullPath, load)
</script>

<template>
  <div class="journal-detail">
    <!-- Back nav -->
    <div class="detail-nav">
      <router-link to="/journal" class="btn btn-ghost btn-sm">&larr; {{ t('journal.backToJournal') }}</router-link>
      <span v-if="categoryTitle" class="detail-breadcrumb">
        <span class="breadcrumb-sep">/</span>
        <router-link :to="`/journal/${category}`" class="breadcrumb-link">{{ categoryTitle }}</router-link>
        <template v-if="entryTitle">
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ entryTitle }}</span>
        </template>
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="detail-loading">
      <p>{{ t('site.loading') }}</p>
    </div>

    <!-- ===== List View (no slug) ===== -->
    <template v-else-if="!slug">
      <h2 class="section-title">{{ categoryTitle }}</h2>

      <div v-if="entries.length === 0" class="detail-empty">
        <p>{{ t('journal.noContent') }}</p>
      </div>

      <div v-else class="entry-list">
        <article
          v-for="entry in entries"
          :key="entry.slug"
          class="entry-card pixel-card"
          @click="goToEntry(entry)"
        >
          <h3 class="entry-title">{{ locale === 'en' && entry.titleEn ? entry.titleEn : entry.title }}</h3>
          <div class="entry-meta">
            <span v-if="entry.date" class="entry-date">{{ entry.date }}</span>
          </div>
          <p v-if="entry.description || entry.descriptionEn" class="entry-desc">
            {{ locale === 'en' && entry.descriptionEn ? entry.descriptionEn : entry.description }}
          </p>
        </article>
      </div>
    </template>

    <!-- ===== Detail View (has slug) ===== -->
    <template v-else>
      <div class="reader-layout">
        <TocSidebar
          :headings="headings"
          :visible="tocVisible"
          :tocTitle="t('journal.toc')"
          @toggle="tocVisible = !tocVisible"
        />

        <div class="reader-main">
          <MarkdownBody :content="content" :category="category" />

          <!-- Prev / Next nav -->
          <nav v-if="prevEntry || nextEntry" class="entry-pager">
            <button
              v-if="prevEntry"
              type="button"
              class="btn btn-ghost btn-sm entry-pager-btn"
              @click="goToEntry(prevEntry)"
            >
              &larr; {{ locale === 'en' && prevEntry.titleEn ? prevEntry.titleEn : prevEntry.title }}
            </button>
            <span v-else class="entry-pager-spacer"></span>
            <button
              v-if="nextEntry"
              type="button"
              class="btn btn-ghost btn-sm entry-pager-btn"
              @click="goToEntry(nextEntry)"
            >
              {{ locale === 'en' && nextEntry.titleEn ? nextEntry.titleEn : nextEntry.title }} &rarr;
            </button>
          </nav>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.journal-detail {
  padding-bottom: 48px;
}

/* Nav */
.detail-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.detail-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.breadcrumb-sep {
  color: var(--border-strong);
}

.breadcrumb-link {
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.breadcrumb-link:hover {
  color: var(--accent);
}

.breadcrumb-current {
  color: var(--accent);
}

.detail-loading {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.detail-empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-muted);
  font-size: 14px;
}

/* List */
.entry-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-card {
  cursor: pointer;
  padding: 24px;
  transition: all var(--duration-normal) var(--ease-out);
}

.entry-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 20px var(--accent-glow);
}

.entry-title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.entry-date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.entry-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

/* Reader */
.reader-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.reader-main {
  flex: 1;
  min-width: 0;
  max-width: 780px;
}

/* Pager */
.entry-pager {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.entry-pager-btn {
  flex: 1;
  max-width: 50%;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-pager-spacer {
  flex: 1;
}

/* Responsive */
@media (max-width: 1023px) {
  .reader-layout {
    gap: 0;
  }

  .reader-main {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .detail-nav {
    margin-bottom: 24px;
  }

  .entry-card {
    padding: 18px;
  }
}
</style>
