<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { listEntries } from '../composables/useJournal.js'
import { defaultEntries } from '../data/journalConfig.js'
import MarkdownBody from '../components/journal/MarkdownBody.vue'
import SiteIcon from '../components/SiteIcon.vue'
import { useDialog } from '../composables/useDialog.ts'

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
const { dialogRef } = useDialog(mobileSidebarOpen)

function entryHref(entry) {
  return `/journal/${category.value}/${entry.slug}`
}

function entryDisplayTitle(entry) {
  if (locale.value !== 'en') return entry.title
  if (entry.titleEn) return entry.titleEn
  const numberedTitle = entry.title.match(/^第(\d+)篇$/)
  return numberedTitle ? `Entry ${numberedTitle[1]}` : entry.title
}

function navigateEntry(event, entry) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  goToEntry(entry)
}

function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

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
  return entryDisplayTitle(entryMeta.value)
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
      essayRefs.value[idx].scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    }
  } else {
    router.push(`/journal/${category.value}/${e.slug}`)
    window.scrollTo({ top: 0, behavior: scrollBehavior() })
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
    <nav class="detail-nav" :aria-label="locale === 'en' ? 'Reading location' : '阅读位置'">
      <router-link to="/journal" class="reader-back"><SiteIcon name="arrow-left" />{{ t('journal.backToJournal') }}</router-link>
      <span v-if="categoryTitle" class="detail-breadcrumb">
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ categoryTitle }}</span>
        <template v-if="entryTitle">
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-entry">{{ entryTitle }}</span>
        </template>
      </span>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="detail-loading">
      <p>{{ t('site.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="entries.length === 0" class="detail-empty">
      <h1>{{ categoryTitle }}</h1>
      <p>{{ t('journal.noContent') }}</p>
    </div>

    <!-- ===== Reader Layout ===== -->
    <div v-else class="reader-layout">
      <!-- Left: 全部文章目录 -->
      <aside class="article-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">{{ categoryTitle }}</span>
          <span class="sidebar-count">{{ entries.length }} {{ locale === 'en' ? 'entries' : '篇' }}</span>
        </div>
        <nav class="sidebar-nav">
          <a
            v-for="(entry, idx) in entries"
            :key="entry.slug"
            :href="entryHref(entry)"
            :aria-current="entry.slug === activeSlug ? 'page' : undefined"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': entry.slug === activeSlug }"
            @click="navigateEntry($event, entry)"
          >
            <span class="sidebar-num">{{ String(idx + 1).padStart(2, '0') }}</span>
            <span class="sidebar-info">
              <span class="sidebar-entry-title">{{
                entryDisplayTitle(entry)
              }}</span>
              <span v-if="entry.date" class="sidebar-entry-date">{{ entry.date }}</span>
            </span>
          </a>
        </nav>
      </aside>

      <!-- Right: 文章内容 -->
      <div class="reader-main">
        <div class="reading-eyebrow"><span>QHY / {{ category === 'poems' ? 'POETRY' : category === 'essays' ? 'FRAGMENTS' : 'STORIES' }}</span><span v-if="entryMeta?.date">{{ entryMeta.date }}</span></div>
        <!-- 随笔模式：全部铺开，序号 + 正文 -->
        <template v-if="isEssayMode">
          <h1 class="essay-collection-title">{{ categoryTitle }}</h1>
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
              <span class="pager-label">{{ locale === 'en' ? 'Previous entry' : '上一篇' }}</span>
              <span class="pager-title">
                &larr; {{ entryDisplayTitle(prevEntry) }}
              </span>
            </button>
            <span v-else class="entry-pager-spacer"></span>
            <button
              v-if="nextEntry"
              type="button"
              class="btn btn-ghost btn-sm entry-pager-btn entry-pager-btn--next"
              @click="goToEntry(nextEntry)"
            >
              <span class="pager-label">{{ locale === 'en' ? 'Next entry' : '下一篇' }}</span>
              <span class="pager-title">
                {{ entryDisplayTitle(nextEntry) }} &rarr;
              </span>
            </button>
          </nav>
        </template>
      </div>
    </div>

    <!-- ===== Mobile: FAB + overlay ===== -->
    <div v-if="entries.length > 0" class="sidebar-mobile">
      <button type="button" class="sidebar-fab" @click="mobileSidebarOpen = !mobileSidebarOpen" :aria-label="t('journal.toc')" :aria-expanded="mobileSidebarOpen" aria-controls="mobile-reading-contents">
        <SiteIcon name="book" /><span>{{ t('journal.toc') }}</span>
      </button>
      <Teleport to="body">
        <Transition name="sidebar-slide">
          <div v-if="mobileSidebarOpen" class="sidebar-overlay" @click.self="mobileSidebarOpen = false">
            <div id="mobile-reading-contents" ref="dialogRef" class="sidebar-panel" role="dialog" aria-modal="true" :aria-label="t('journal.toc')" tabindex="-1">
              <div class="sidebar-panel-header">
                <span class="sidebar-panel-title">{{ categoryTitle }}</span>
                <button type="button" class="sidebar-panel-close" @click="mobileSidebarOpen = false" :aria-label="locale === 'en' ? 'Close contents' : '关闭目录'"><SiteIcon name="close" /></button>
              </div>
              <nav class="sidebar-panel-nav">
                <a
                  v-for="(entry, idx) in entries"
                  :key="entry.slug"
                  :href="entryHref(entry)"
                  :aria-current="entry.slug === activeSlug ? 'page' : undefined"
                  class="sidebar-item"
                  :class="{ 'sidebar-item--active': entry.slug === activeSlug }"
                  @click="navigateEntry($event, entry)"
                >
                  <span class="sidebar-num">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <span class="sidebar-info">
                    <span class="sidebar-entry-title">{{
                      entryDisplayTitle(entry)
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
.journal-detail { padding-bottom: 48px; }
.detail-empty h1 { font: 500 34px/1.5 var(--font-display); color: var(--text); margin: 0 0 20px; }
.detail-nav { display: flex; align-items: center; gap: 20px; margin: 12px 0 40px; flex-wrap: wrap; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
.reader-back { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; color: var(--text); font-size: 14px; }
.reader-back :deep(svg) { width: 18px; height: 18px; }
.reader-back:hover { color: var(--accent); }
.detail-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 13px; color: var(--text-muted); min-width: 0; }
.breadcrumb-sep { color: var(--text-muted); }
.breadcrumb-current { color: var(--text); }
.breadcrumb-entry { color: var(--text-muted); overflow-wrap: anywhere; }
.detail-loading, .detail-empty { text-align: center; padding: 96px 24px; color: var(--text-muted); font-size: 16px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.reader-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: clamp(32px, 5vw, 72px); align-items: flex-start; }
.article-sidebar { position: sticky; top: 112px; max-height: calc(100dvh - 144px); overflow-y: auto; scrollbar-width: thin; padding-right: 12px; }
.sidebar-header { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 16px; padding: 0 10px 16px; border-bottom: 1px solid var(--border); }
.sidebar-title { font-family: var(--font-display); font-size: 20px; font-weight: 500; color: var(--text); }
.sidebar-count { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
.sidebar-nav, .sidebar-panel-nav { display: flex; flex-direction: column; gap: 6px; }
.sidebar-item { display: flex; gap: 12px; padding: 12px 10px; min-height: 48px; border-radius: var(--radius-sm); border-left: 2px solid transparent; transition: color var(--duration-fast) ease, background var(--duration-fast) ease; text-decoration: none; color: var(--text-muted); }
.sidebar-item:hover { background: var(--bg-elevated); color: var(--text); }
.sidebar-item--active { background: var(--accent-light); border-left-color: var(--accent); }
.sidebar-item:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.sidebar-num { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); flex-shrink: 0; padding-top: 3px; font-variant-numeric: tabular-nums; }
.sidebar-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sidebar-entry-title { font-size: 14px; line-height: 1.6; color: inherit; overflow-wrap: anywhere; }
.sidebar-item--active .sidebar-entry-title, .sidebar-item--active .sidebar-num { color: var(--accent); font-weight: 600; }
.sidebar-entry-date { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
.reader-main { min-width: 0; padding: clamp(28px, 4vw, 52px); background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.reading-eyebrow { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 32px; font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; color: var(--text-muted); }
.reader-main :deep(.markdown-body) { font-size: 17px; line-height: 1.95; color: var(--text); }
.reader-main :deep(.markdown-body h1) { font-family: var(--font-display); font-size: clamp(28px, 3vw, 40px); font-weight: 500; color: var(--text); padding-bottom: 24px; margin-bottom: 32px; line-height: 1.5; letter-spacing: .02em; }
.reader-main :deep(.markdown-body h2), .reader-main :deep(.markdown-body h3) { font-family: var(--font-display); color: var(--text); line-height: 1.6; }
.reader-main :deep(.markdown-body p) { line-height: 2; margin-bottom: 24px; }
.reader-main :deep(.poem-body p) { line-height: 2.25; }
.reader-main :deep(.markdown-body a) { text-decoration: underline; text-underline-offset: 4px; }
.reader-main :deep(.markdown-body pre) { max-width: 100%; }
.essay-collection-title { font-family: var(--font-display); font-size: 40px; font-weight: 500; margin: 0 0 48px; line-height: 1.4; }
.essay-block { scroll-margin-top: 8px; margin-bottom: 48px; padding-bottom: 40px; border-bottom: 1px solid var(--border); }
.essay-block:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
.essay-number { font-family: var(--font-mono); font-size: 13px; color: var(--accent); margin-bottom: 20px; font-variant-numeric: tabular-nums; }
.essay-number::before { content: '— '; }
.entry-pager { display: flex; justify-content: space-between; gap: 16px; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); }
.entry-pager-btn { flex: 1; min-width: 0; max-width: 48%; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; text-align: left; padding: 16px; }
.entry-pager-btn--next { text-align: right; align-items: flex-end; }
.entry-pager-btn:hover { background: var(--accent-light); }
.pager-label { font-size: 12px; color: var(--text-muted); }
.pager-title { font-size: 14px; line-height: 1.6; color: var(--text); overflow-wrap: anywhere; }
.entry-pager-spacer { flex: 1; }
.sidebar-mobile { display: none; }
.sidebar-fab { position: fixed; bottom: max(24px, env(safe-area-inset-bottom)); right: 20px; z-index: 90; min-height: 48px; border-radius: 28px; border: 1px solid var(--border-strong); padding: 12px 18px; background: var(--bg-card); color: var(--accent); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: var(--shadow-md); font-family: var(--font-body); font-size: 14px; }
.sidebar-fab :deep(svg), .sidebar-panel-close :deep(svg) { width: 20px; height: 20px; }
.sidebar-fab:hover { border-color: var(--accent); background: var(--bg-elevated); }
.sidebar-overlay { position: fixed; inset: 0; z-index: 200; background: rgb(20 14 31 / .5); backdrop-filter: blur(6px); }
.sidebar-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(360px, 90vw); background: var(--bg-card); border-left: 1px solid var(--border-strong); padding: max(24px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom)); overflow-y: auto; box-shadow: var(--shadow-md); }
.sidebar-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.sidebar-panel-title { font-family: var(--font-display); font-size: 24px; font-weight: 500; color: var(--text); }
.sidebar-panel-close { appearance: none; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-muted); cursor: pointer; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.sidebar-panel-close:hover { color: var(--accent); }
.sidebar-slide-enter-active { transition: opacity 200ms ease; }
.sidebar-slide-enter-active .sidebar-panel { transition: transform 250ms var(--ease-out); }
.sidebar-slide-leave-active { transition: opacity 150ms ease; }
.sidebar-slide-leave-active .sidebar-panel { transition: transform 180ms var(--ease-out); }
.sidebar-slide-enter-from, .sidebar-slide-leave-to { opacity: 0; }
.sidebar-slide-enter-from .sidebar-panel, .sidebar-slide-leave-to .sidebar-panel { transform: translateX(100%); }
@media (max-width: 1023px) {
  .reader-layout { display: block; max-width: 780px; margin-inline: auto; }
  .article-sidebar { display: none; }
  .sidebar-mobile { display: block; }
  .journal-detail { padding-bottom: 72px; }
}
@media (max-width: 600px) {
  .detail-nav { gap: 4px 20px; margin-bottom: 24px; padding-bottom: 16px; }
  .detail-breadcrumb { font-size: 12px; gap: 8px; }
  .reader-main { padding: 28px 20px; }
  .reader-main :deep(.markdown-body) { font-size: 16px; }
  .reader-main :deep(.markdown-body h1) { font-size: 28px; }
  .reading-eyebrow { margin-bottom: 24px; font-size: 10px; }
  .essay-collection-title { font-size: 32px; }
  .entry-pager { flex-direction: column; }
  .entry-pager-btn { max-width: none; width: 100%; }
  .entry-pager-btn--next { text-align: left; align-items: flex-start; }
}
@media (max-width: 640px) {
  .journal-detail { padding-bottom: 60px; }
  .detail-nav { gap: 0 12px; margin: 0 0 14px; padding-bottom: 10px; }
  .reader-back { min-height: 44px; font-size: 13px; }
  .detail-breadcrumb { gap: 6px; font-size: 11px; }
  .reader-main { padding: 18px 14px; }
  .reading-eyebrow { margin-bottom: 16px; gap: 8px; font-size: 9px; }
  .reader-main :deep(.markdown-body) { font-size: 16px; line-height: 1.9; }
  .reader-main :deep(.markdown-body h1) { font-size: 24px; padding-bottom: 16px; margin-bottom: 18px; }
  .reader-main :deep(.markdown-body h2) { font-size: 21px; margin-top: 26px; }
  .reader-main :deep(.markdown-body p) { margin-bottom: 18px; line-height: 1.95; }
  .reader-main :deep(.poem-body p) { line-height: 2.1; }
  .essay-collection-title { font-size: 24px; margin-bottom: 24px; }
  .essay-block { margin-bottom: 28px; padding-bottom: 24px; }
  .essay-number { margin-bottom: 12px; }
  .entry-pager { margin-top: 28px; padding-top: 18px; gap: 12px; }
  .entry-pager-btn { padding: 12px; min-height: 44px; }
  .sidebar-fab { right: 12px; bottom: max(16px, env(safe-area-inset-bottom)); min-height: 44px; padding: 10px 14px; font-size: 13px; }
  .sidebar-panel { padding-inline: 16px; }
  .detail-loading, .detail-empty { padding: 44px 18px; }
  .detail-empty h1 { font-size: 24px; margin-bottom: 14px; }
}
@media (prefers-reduced-motion: reduce) { .sidebar-slide-enter-active, .sidebar-slide-leave-active, .sidebar-slide-enter-active .sidebar-panel, .sidebar-slide-leave-active .sidebar-panel { transition: none; } }
</style>
