<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PixelHeader from './components/PixelHeader.vue'
import PixelFooter from './components/PixelFooter.vue'

const { locale } = useI18n()

watch(locale, (val) => {
  document.documentElement.lang = val === 'en' ? 'en' : 'zh-CN'
  document.title = val === 'en' ? "QHY's Pixel World" : '羌花吟の个人网站'
}, { immediate: true })
</script>

<template>
  <div class="background-grid" aria-hidden="true"></div>
  <div class="background-stars" aria-hidden="true"></div>

  <div class="pixel-page">
    <PixelHeader />
    <main>
      <router-view />
    </main>
    <PixelFooter />
  </div>
</template>

<style>
</style>
