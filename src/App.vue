<script setup>
import { ref, watch, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import PixelHeader from './components/PixelHeader.vue'
import PixelFooter from './components/PixelFooter.vue'
import MatrixRain from './components/MatrixRain.vue'

const { locale } = useI18n()
const splashDone = ref(false)

watch(locale, (val) => {
  document.documentElement.lang = val === 'en' ? 'en' : 'zh-CN'
  document.title = val === 'en' ? "QHY's Pixel World" : '羌花吟の个人网站'
}, { immediate: true })

const saved = localStorage.getItem('theme')
const theme = ref(saved === 'light' || saved === 'dark' ? saved : 'light')
const wiping = ref(false)
const wipeDir = ref(null)

function toggleTheme() {
  if (wiping.value) return
  const next = theme.value === 'dark' ? 'light' : 'dark'
  wipeDir.value = next === 'dark' ? 'tl-br' : 'br-tl'
  wiping.value = true

  setTimeout(() => {
    theme.value = next
    setTimeout(() => {
      wiping.value = false
      wipeDir.value = null
    }, 60)
  }, 560)
}

watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
  localStorage.setItem('theme', val)
}, { immediate: true })

provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <MatrixRain @done="splashDone = true" />
  <template v-if="splashDone">
    <div class="background-stars" aria-hidden="true"></div>
    <div class="background-grid" aria-hidden="true"></div>
    <div v-if="wiping" class="theme-wipe" :class="wipeDir" aria-hidden="true"></div>

    <div class="pixel-page">
      <PixelHeader />
      <main>
        <router-view />
      </main>
      <PixelFooter />
    </div>
  </template>
</template>

<style>
.theme-wipe {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.theme-wipe.tl-br {
  background: #0f0f18;
  animation: sweepTLtoBR 0.6s cubic-bezier(0.55, 0, 0.45, 1) forwards;
}

.theme-wipe.br-tl {
  background: #f6f5fa;
  animation: sweepBRtoTL 0.6s cubic-bezier(0.55, 0, 0.45, 1) forwards;
}

@keyframes sweepTLtoBR {
  from { clip-path: circle(0% at 0% 0%); }
  to   { clip-path: circle(141.5% at 0% 0%); }
}

@keyframes sweepBRtoTL {
  from { clip-path: circle(0% at 100% 100%); }
  to   { clip-path: circle(141.5% at 100% 100%); }
}
</style>
