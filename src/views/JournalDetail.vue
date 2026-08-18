<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { listEntries } from '../composables/useJournal.js'
import { defaultEntries } from '../data/journalConfig.js'
import MarkdownBody from '../components/journal/MarkdownBody.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const category = computed(() => {
  if (route.path.includes('/articles')) return 'articles'
  if (route.path.includes('/essays')) return 'essays'
  if (route.path.includes('/poems')) return 'poems'
  return null
})

const slug = computed(() => route.params.slug || null)

const content = ref('')
const entries = ref([])
const loading = ref(false)
const mobileSidebarOpen = ref(false)

// ===== 随笔模式：全部铺开 + 目录滚动联动 =====
const isEssayMode = computed(() => category.value === 'essays')
const essayRefs = ref([])
const activeEssaySlug = ref('')

// 统一的高亮判断（随笔模式用滚动位置，其他模式用路由 slug）
const activeSlug = computed(() =>
  isEssayMode.value ? activeEssaySlug.value : slug.value
)

function setEssayRef(el, idx) {
  if (el) essayRefs.value[idx] = el
}

const categoryTitle = computed(() => {
  if (category.value === 'articles') return t('journal.articles')
  if (category.value === 'essays') return t('journal.essays')
  if (category.value === 'poems') return t('journal.poems')
  return ''
})

const currentIndex = computed(() => {
  if (!slug.value || entries.value.length === 0) return -1
  return entries.value.findIndex((e) => e.slug === slug.value)
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
  return entries.value.find((e) => e.slug === slug.value) || null
})

const entryTitle = computed(() => {
  if (!entryMeta.value) return ''
  return locale.value === 'en' && entryMeta.value.titleEn
    ? entryMeta.value.titleEn
    : entryMeta.value.title
})

// 随笔不展示上一篇/下一篇（已全部铺开）
const showPager = computed(() => !isEssayMode.value)

// 按 journalConfig 配置解析出目标文章（支持标题/序号），匹配不到回退第一篇
function resolveDefaultEntry(list) {
  const configured = defaultEntries[category.value]
  if (configured !== '' && configured != null) {
    let found = null
    if (typeof configured === 'number') {
      found = list[configured - 1]
    } else {
      const trimmed = String(configured).trim()
      if (/^\d+$/.test(trimmed)) {
        found = list[Number(trimmed) - 1]
      } else {
        found = list.find((e) => e.title === trimmed)
      }
    }
    if (found) return found
  }
  return list[0]
}

async function load() {
  if (!category.value) return
  loading.value = true
  try {
    entries.value = listEntries(category.value)
    if (entries.value.length === 0) {
      content.value = ''
      return
    }

    // 随笔模式：全部铺开，按配置定位到推荐篇（滚动 + 高亮）
    if (isEssayMode.value) {
      const target = resolveDefaultEntry(entries.value)
      activeEssaySlug.value = target.slug
      // 等 DOM 渲染完再滚动到对应随笔
      nextTick(() => {
        const idx = entries.value.findIndex((e) => e.slug === target.slug)
        if (idx >= 0 && essayRefs.value[idx]) {
          essayRefs.value[idx].scrollIntoView({ behavior: 'auto', block: 'start' })
        }
      })
      return
    }

    // 其他模式：单篇展示，无 slug 时按配置跳转
    if (!slug.value) {
      const target = resolveDefaultEntry(entries.value)
      router.replace(`/journal/${category.value}/${target.slug}`)
      return
    }
    const entry = entries.value.find((e) => e.slug === slug.value)
    content.value = entry?.body || ''
  } finally {
    loading.value = false
  }
}

function goToEntry(e) {
  mobileSidebarOpen.value = false
  if (isEssayMode.value) {
    // 随笔模式：平滑滚动到对应随笔
    const idx = entries.value.findIndex((item) => item.slug === e.slug)
    if (idx >= 0 && essayRefs.value[idx]) {
      essayRefs.value[idx].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } else {
    router.push(`/journal/${category.value}/${e.slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ===== 随笔模式：IntersectionObserver 同步目录高亮 =====
let observer = null

function setupEssayObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!isEssayMode.value) return

  nextTick(() => {
    const els = essayRefs.value.filter(Boolean)
    if (!els.length) return

    observer = new IntersectionObserver(
      (obsEntries) => {
        // 选"最靠近视口顶部 120px 线、且已滚过该线"的那一篇
        let bestIdx = -1
        let bestTop = -Infinity
        for (let i = 0; i < essayRefs.value.length; i++) {
          const el = essayRefs.value[i]
          if (!el) continue
          const top = el.getBoundingClientRect().top
          if (top <= 120 && top > bestTop) {
            bestTop = top
            bestIdx = i
          }
        }
        // 若都不在上方，取第一个进入视口的
        if (bestIdx === -1) {
          for (let i = 0; i < essayRefs.value.length; i++) {
            const el = essayRefs.value[i]
            if (!el) continue
            const top = el.getBoundingClientRect().top
            if (top >= 0) {
              bestIdx = i
              break
            }
          }
        }
        if (bestIdx >= 0) {
          activeEssaySlug.value = entries.value[bestIdx].slug
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    )

    els.forEach((el) => observer.observe(el))
  })
}

watch(() => entries.value, setupEssayObserver)

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

onMounted(load)
watch(() => route.fullPath, load)
</script>

<template>
  <div class="journal-detail">
    <!-- Breadcrumb -->
    <div class="detail-nav">
      <router-link to="/journal" class="btn btn-ghost btn-sm">&larr; {{ t('journal.backToJournal') }}</router-link>
      <span v-if="categoryTitle" class="detail-breadcrumb">
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ categoryTitle }}</span>
        <template v-if="entryTitle">
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-entry">{{ entryTitle }}</span>
        </template>
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="detail-loading">
      <p>{{ t('site.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="entries.length === 0" class="detail-empty">
      <p>{{ t('journal.noContent') }}</p>
    </div>

    <!-- ===== Reader Layout ===== -->
    <div v-else class="reader-layout">
      <!-- Left: 全部文章目录 -->
      <aside class="article-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">{{ categoryTitle }}</span>
          <span class="sidebar-count">{{ entries.length }} 篇</span>
        </div>
        <nav class="sidebar-nav">
          <a
            v-for="(entry, idx) in entries"
            :key="entry.slug"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': entry.slug === activeSlug }"
            @click="goToEntry(entry)"
          >
            <span class="sidebar-num">{{ String(idx + 1).padStart(2, '0') }}</span>
            <span class="sidebar-info">
              <span class="sidebar-entry-title">{{
                locale === 'en' && entry.titleEn ? entry.titleEn : entry.title
              }}</span>
              <span v-if="entry.date" class="sidebar-entry-date">{{ entry.date }}</span>
            </span>
          </a>
        </nav>
      </aside>

      <!-- Right: 文章内容 -->
      <div class="reader-main">
        <!-- 随笔模式：全部铺开，序号 + 正文 -->
        <template v-if="isEssayMode">
          <div
            v-for="(entry, idx) in entries"
            :key="entry.slug"
            :ref="(el) => setEssayRef(el, idx)"
            class="essay-block"
          >
            <div class="essay-number">{{ idx + 1 }}</div>
            <MarkdownBody :content="entry.rawBody" category="essays" />
          </div>
        </template>

        <!-- 其他模式：单篇展示 -->
        <template v-else>
          <MarkdownBody :content="content" :category="category" />

          <!-- Prev / Next -->
          <nav v-if="showPager && (prevEntry || nextEntry)" class="entry-pager">
            <button
              v-if="prevEntry"
              type="button"
              class="btn btn-ghost btn-sm entry-pager-btn entry-pager-btn--prev"
              @click="goToEntry(prevEntry)"
            >
              <span class="pager-label">上一篇</span>
              <span class="pager-title">
                &larr; {{ locale === 'en' && prevEntry.titleEn ? prevEntry.titleEn : prevEntry.title }}
              </span>
            </button>
            <span v-else class="entry-pager-spacer"></span>
            <button
              v-if="nextEntry"
              type="button"
              class="btn btn-ghost btn-sm entry-pager-btn entry-pager-btn--next"
              @click="goToEntry(nextEntry)"
            >
              <span class="pager-label">下一篇</span>
              <span class="pager-title">
                {{ locale === 'en' && nextEntry.titleEn ? nextEntry.titleEn : nextEntry.title }} &rarr;
              </span>
            </button>
          </nav>
        </template>
      </div>
    </div>

    <!-- ===== Mobile: FAB + overlay ===== -->
    <div v-if="entries.length > 0" class="sidebar-mobile">
      <button type="button" class="sidebar-fab" @click="mobileSidebarOpen = !mobileSidebarOpen" aria-label="目录">
        <span class="sidebar-fab-icon">&#9776;</span>
      </button>
      <Teleport to="body">
        <Transition name="sidebar-slide">
          <div v-if="mobileSidebarOpen" class="sidebar-overlay" @click.self="mobileSidebarOpen = false">
            <div class="sidebar-panel">
              <div class="sidebar-panel-header">
                <span class="sidebar-panel-title">{{ categoryTitle }}</span>
                <button type="button" class="sidebar-panel-close" @click="mobileSidebarOpen = false">&times;</button>
              </div>
              <nav class="sidebar-panel-nav">
                <a
                  v-for="(entry, idx) in entries"
                  :key="entry.slug"
                  class="sidebar-item"
                  :class="{ 'sidebar-item--active': entry.slug === activeSlug }"
                  @click="goToEntry(entry)"
                >
                  <span class="sidebar-num">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <span class="sidebar-info">
                    <span class="sidebar-entry-title">{{
                      locale === 'en' && entry.titleEn ? entry.titleEn : entry.title
                    }}</span>
                    <span v-if="entry.date" class="sidebar-entry-date">{{ entry.date }}</span>
                  </span>
                </a>
              </nav>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.journal-detail {
  padding-bottom: 48px;
}

/* ===== Breadcrumb ===== */
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

.breadcrumb-current {
  color: var(--text);
}

.breadcrumb-entry {
  color: var(--accent);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== States ===== */
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

/* ===== Reader Layout ===== */
.reader-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* ===== Article Sidebar (Desktop) ===== */
.article-sidebar {
  position: sticky;
  top: 100px;
  width: 240px;
  flex-shrink: 0;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  border-right: 1px solid var(--border);
  padding-right: 16px;
}

.sidebar-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.04em;
}

.sidebar-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* ===== Sidebar Item ===== */
.sidebar-item {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  border-left: 2px solid transparent;
  transition: all var(--duration-fast) var(--ease-out);
  text-decoration: none;
}

.sidebar-item:hover {
  background: rgba(128, 128, 128, 0.05);
}

.sidebar-item--active {
  background: var(--accent-light);
  border-left-color: var(--accent);
}

.sidebar-num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.5;
  flex-shrink: 0;
  padding-top: 2px;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.sidebar-item--active .sidebar-num {
  opacity: 1;
  color: var(--accent);
}

.sidebar-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sidebar-entry-title {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all var(--duration-fast) var(--ease-out);
}

.sidebar-item:hover .sidebar-entry-title {
  color: var(--text);
}

/* 当前正在阅读的文章：加粗高亮 */
.sidebar-item--active .sidebar-entry-title {
  color: var(--accent);
  font-weight: 600;
}

.sidebar-entry-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.6;
}

/* ===== Reader Main ===== */
.reader-main {
  flex: 1;
  min-width: 0;
  max-width: 780px;
}

/* ===== Essay 全部铺开模式 ===== */
.essay-block {
  scroll-margin-top: 100px;
  margin-bottom: 56px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--border);
}
.essay-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.essay-number {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
  opacity: 0.45;
  line-height: 1;
  margin-bottom: 20px;
  letter-spacing: 0.02em;
}

/* ===== Pager ===== */
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
  max-width: 48%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  overflow: hidden;
  padding: 14px 18px;
  transition: all var(--duration-fast) var(--ease-out);
}

.entry-pager-btn--next {
  text-align: right;
  align-items: flex-end;
}

.entry-pager-btn:hover {
  border-color: var(--accent);
  background: var(--accent-light);
  transform: translateY(-2px);
}

.pager-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.pager-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.entry-pager-btn:hover .pager-title {
  color: var(--accent);
}

.entry-pager-spacer {
  flex: 1;
}

/* ===== Mobile FAB + Overlay ===== */
.sidebar-mobile {
  display: none;
}

.sidebar-fab {
  position: fixed;
  bottom: 28px;
  right: 20px;
  z-index: 90;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: var(--bg-card);
  color: var(--accent);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all var(--duration-fast) var(--ease-out);
}

.sidebar-fab:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 28px var(--accent-glow);
  transform: scale(1.05);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(5, 2, 8, 0.4);
  backdrop-filter: blur(12px);
}

.sidebar-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(320px, 80vw);
  background: var(--bg-elevated);
  border-left: 1px solid var(--border-strong);
  padding: 24px 20px;
  overflow-y: auto;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
}

.sidebar-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar-panel-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.sidebar-panel-close {
  appearance: none;
  border: none;
  background: none;
  font-size: 22px;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-out);
}

.sidebar-panel-close:hover {
  color: var(--text);
  background: rgba(128, 128, 128, 0.1);
}

.sidebar-panel-nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* Slide transition */
.sidebar-slide-enter-active { transition: opacity 0.2s ease; }
.sidebar-slide-enter-active .sidebar-panel { transition: transform 0.25s var(--ease-out); }
.sidebar-slide-leave-active { transition: opacity 0.15s ease; }
.sidebar-slide-leave-active .sidebar-panel { transition: transform 0.2s var(--ease-out); }
.sidebar-slide-enter-from { opacity: 0; }
.sidebar-slide-enter-from .sidebar-panel { transform: translateX(100%); }
.sidebar-slide-leave-to { opacity: 0; }
.sidebar-slide-leave-to .sidebar-panel { transform: translateX(100%); }

/* ===== Responsive ===== */
@media (max-width: 1023px) {
  .reader-layout {
    gap: 0;
  }

  .reader-main {
    max-width: none;
  }

  .article-sidebar {
    display: none;
  }

  .sidebar-mobile {
    display: block;
  }

  .entry-pager-btn {
    max-width: 48%;
  }
}

@media (max-width: 768px) {
  .detail-nav {
    margin-bottom: 24px;
  }

  .breadcrumb-entry {
    max-width: 180px;
  }

  .entry-pager {
    flex-direction: column;
  }

  .entry-pager-btn {
    max-width: none;
    width: 100%;
  }

  .entry-pager-btn--next {
    text-align: left;
    align-items: flex-start;
  }
}
</style>
