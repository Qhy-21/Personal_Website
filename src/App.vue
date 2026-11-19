<script setup lang="ts">
import { shallowRef, watch, provide, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PixelHeader from './components/PixelHeader.vue'
import PixelFooter from './components/PixelFooter.vue'
import MatrixRain from './components/MatrixRain.vue'
const { t, locale } = useI18n()
const route = useRoute()
const splashDone = shallowRef(false)
const saved = localStorage.getItem('theme')
const theme = shallowRef(saved === 'light' || saved === 'dark' ? saved : 'light')
const mainRef = shallowRef<HTMLElement | null>(null)
const wiping = shallowRef(false)
const fallbackWipe = shallowRef(false)
const wipeDirection = shallowRef<'tl-br' | 'br-tl'>('tl-br')
const wipeRef = shallowRef<HTMLElement | null>(null)
let revealAnimation: Animation | null = null
let disposed = false
type ThemeTransition = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void }
const transitionDocument = document as Document & {
  startViewTransition?: (update: () => Promise<void>) => ThemeTransition
}
let themeTransition: ThemeTransition | null = null

async function toggleTheme() {
  if (wiping.value) return
  const next = theme.value === 'dark' ? 'light' : 'dark'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    theme.value = next
    return
  }
  wiping.value = true
  wipeDirection.value = next === 'dark' ? 'tl-br' : 'br-tl'
  const origin = next === 'dark' ? '0% 0%' : '100% 100%'
  const radius = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight))
  const clipPath = [`circle(0px at ${origin})`, `circle(${radius}px at ${origin})`]
  const timing = { duration: 600, easing: 'cubic-bezier(.55, 0, .45, 1)', fill: 'forwards' as FillMode }

  try {
    if (transitionDocument.startViewTransition) {
      document.documentElement.setAttribute('data-theme-transition', '')
      themeTransition = transitionDocument.startViewTransition(async () => {
        theme.value = next
        await nextTick()
      })
      await themeTransition.ready
      if (disposed) return
      revealAnimation = document.documentElement.animate({ clipPath }, {
        ...timing, pseudoElement: '::view-transition-new(root)',
      })
      await revealAnimation.finished
      await themeTransition.finished
    } else {
      // Keep the original circular curtain on browsers without page snapshots.
      fallbackWipe.value = true
      await nextTick()
      if (disposed || !wipeRef.value) return
      revealAnimation = wipeRef.value.animate({ clipPath }, timing)
      await revealAnimation.finished
      theme.value = next
      await nextTick()
      revealAnimation = wipeRef.value.animate({ opacity: [1, 0] }, { duration: 100, fill: 'forwards' })
      await revealAnimation.finished
    }
  } catch {
    // An interrupted transition must still leave the requested theme applied.
    if (!disposed) theme.value = next
    themeTransition?.skipTransition()
  } finally {
    revealAnimation?.cancel()
    document.documentElement.removeAttribute('data-theme-transition')
    fallbackWipe.value = false
    wiping.value = false
    revealAnimation = null
    themeTransition = null
  }
}
async function finishSplash() {
  splashDone.value = true
  await nextTick()
  mainRef.value?.focus({ preventScroll: true })
}
watch(locale, value => {
  document.documentElement.lang = value === 'en' ? 'en' : 'zh-CN'
  document.title = value === 'en' ? "QHY's Pixel World" : '羌花吟の个人网站'
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('site.description'))
}, { immediate: true })
watch(theme, value => {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
}, { immediate: true })
watch(() => route.path, async () => {
  await nextTick()
  mainRef.value?.focus({ preventScroll: true })
})
provide('theme', theme)
provide('toggleTheme', toggleTheme)
onUnmounted(() => {
  disposed = true
  revealAnimation?.cancel()
  themeTransition?.skipTransition()
  document.documentElement.removeAttribute('data-theme-transition')
})
</script>
<template>
  <a href="#main-content" class="skip-link">{{ locale === 'en' ? 'Skip to content' : '跳到主要内容' }}</a>
  <MatrixRain v-if="!splashDone" @done="finishSplash" />
  <div class="background-stars" aria-hidden="true"></div>
  <div class="background-grid" aria-hidden="true"></div>
  <div v-if="fallbackWipe" ref="wipeRef" class="theme-wipe" :class="wipeDirection" aria-hidden="true"></div>
  <div class="pixel-page" :inert="!splashDone">
    <PixelHeader />
    <main id="main-content" ref="mainRef" class="site-main" tabindex="-1"><router-view /></main>
    <PixelFooter />
  </div>
</template>

<style>
[data-theme-transition]::view-transition-group(root),
[data-theme-transition]::view-transition-old(root),
[data-theme-transition]::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
[data-theme-transition]::view-transition-old(root) { z-index: 1; }
[data-theme-transition]::view-transition-new(root) { z-index: 2; }
::view-transition { pointer-events: none; }
.theme-wipe { position: fixed; inset: 0; z-index: 1000; pointer-events: none; clip-path: circle(0px at 0% 0%); }
.theme-wipe.tl-br { background: #1b1824; }
.theme-wipe.br-tl { background: #f7f6fb; clip-path: circle(0px at 100% 100%); }
</style>
