<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { watch, inject, shallowRef, onMounted, onUnmounted, type Ref } from 'vue'
import SiteIcon from './SiteIcon.vue'
const route = useRoute()
const { t, locale } = useI18n()
const theme = inject<Ref<string>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
const headerRef = shallowRef<HTMLElement | null>(null)
let headerObserver: ResizeObserver | null = null
const navItems = [
  { path: '/', key: 'home' }, { path: '/skills', key: 'skills' },
  { path: '/projects', key: 'projects' }, { path: '/journal', key: 'journal' },
  { path: '/about', key: 'about' }, { path: '/guestbook', key: 'guestbook' },
  { path: '/xusong-bot', key: 'xusongBot' },
]
function active(path: string) { return path === '/' ? route.path === '/' : route.path === path || route.path.startsWith(path + '/') }
function toggleLang() { locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN' }
watch(locale, value => localStorage.setItem('lang', value))
function compactLabel(key: string) {
  if (locale.value === 'en' && key === 'guestbook') return 'Guest\u200bbook'
  if (locale.value === 'en' && key === 'xusongBot') return 'Xu Song'
  return t('nav.' + key)
}
function updateHeaderOffset() {
  if (!headerRef.value) return
  const { height } = headerRef.value.getBoundingClientRect()
  const top = parseFloat(getComputedStyle(headerRef.value).top) || 0
  document.documentElement.style.setProperty('--header-offset', `${Math.ceil(height + top + 12)}px`)
}
onMounted(() => {
  headerObserver = new ResizeObserver(updateHeaderOffset)
  if (headerRef.value) headerObserver.observe(headerRef.value)
  window.addEventListener('resize', updateHeaderOffset)
  updateHeaderOffset()
})
onUnmounted(() => {
  headerObserver?.disconnect()
  window.removeEventListener('resize', updateHeaderOffset)
  document.documentElement.style.removeProperty('--header-offset')
})
</script>
<template>
  <header ref="headerRef" class="site-header">
    <div class="header-inner">
      <router-link to="/" class="site-logo" :aria-label="t('site.title')">
        <svg class="logo-mark" width="27" height="30" viewBox="0 0 27 30" aria-hidden="true"><path d="M9 0h9v7h9v9h-9v7H9v-7H0V7h9Z" fill="currentColor"/><path d="M18 23h6v7h-6Z" fill="currentColor" opacity=".35"/></svg>
        <span class="logo-copy"><span class="logo-text">{{ locale === 'en' ? 'QHY' : '羌花吟' }}<span class="logo-dot">.</span></span><span class="logo-caption">A LITTLE PIXEL WORLD</span></span>
      </router-link>
      <nav id="site-navigation" class="site-nav" :aria-label="locale === 'en' ? 'Main navigation' : '主导航'">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="{ 'is-active': active(item.path) }" :aria-current="active(item.path) ? 'page' : undefined" :aria-label="t('nav.' + item.key)"><span class="nav-label-full">{{ t('nav.' + item.key) }}</span><span class="nav-label-compact">{{ compactLabel(item.key) }}</span></router-link>
      </nav>
      <div class="header-actions">
        <button type="button" class="theme-toggle icon-button" @click="toggleTheme?.()" :aria-label="locale === 'en' ? (theme === 'dark' ? 'Use light theme' : 'Use dark theme') : (theme === 'dark' ? '切换浅色主题' : '切换深色主题')"><SiteIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" /></button>
        <button type="button" class="lang-toggle" @click="toggleLang" :aria-label="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'"><span :class="{ active: locale === 'zh-CN' }">中</span><span class="lang-divider" aria-hidden="true">/</span><span :class="{ active: locale === 'en' }">EN</span></button>
      </div>
    </div>
  </header>
</template>
<style scoped>
.site-header { position: sticky; top: 16px; z-index: 100; margin-bottom: 32px; }
.header-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 82px; padding: 16px 22px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); box-shadow: var(--shadow-sm); }
.site-logo { display: flex; align-items: center; gap: 12px; flex-shrink: 0; color: var(--text); }
.logo-mark { color: var(--accent); width: 23px; }
.logo-copy { display: flex; flex-direction: column; gap: 5px; }
.logo-text { font-family: var(--font-display); font-size: 22px; font-weight: 600; line-height: 1; letter-spacing: .08em; }
.logo-dot { color: var(--accent); }
.logo-caption { font: 8px/1 var(--font-mono); letter-spacing: .1em; color: var(--text-muted); }
.site-nav { display: flex; align-items: center; gap: 5px; }
.site-nav a { position: relative; display: flex; align-items: center; min-height: 44px; padding: 8px 10px; font-size: 13px; white-space: nowrap; color: var(--text-muted); }
.site-nav a::after { position: absolute; content: ''; bottom: 3px; left: 50%; width: 4px; height: 4px; background: var(--accent); transform: scale(0); transition: transform var(--duration-fast); }
.site-nav a:hover, .site-nav a.is-active { color: var(--accent); }
.site-nav a.is-active::after { transform: scale(1); }
.header-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.theme-toggle { border-color: transparent; }
.lang-toggle { min-height: 44px; display: flex; align-items: center; gap: 7px; padding: 6px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; font: 11px/1 var(--font-mono); color: var(--text-muted); }
.lang-toggle:hover { background: var(--accent-light); }
.lang-toggle .active { color: var(--accent); }
.lang-divider { color: var(--border-strong); }
.nav-label-compact { display: none; }
@media (max-width: 1100px) { .header-inner { gap: 8px; padding-inline: 16px; } .site-nav { gap: 0; } .site-nav a { padding-inline: 8px; font-size: 12px; } .logo-caption { display: none; } }
@media (max-width: 900px) {
  .site-header { top: max(4px, env(safe-area-inset-top)); margin-bottom: 16px; }
  .header-inner { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0; min-height: 0; padding: 4px 8px; }
  .site-logo { gap: 8px; min-height: 44px; width: fit-content; }
  .logo-mark { width: 18px; height: 23px; }
  .logo-text { font-size: 19px; }
  .logo-caption { display: none; }
  .header-actions { justify-self: end; gap: 0; }
  .site-nav { display: grid; grid-row: 2; grid-column: 1 / -1; grid-template-columns: repeat(7, minmax(0, 1fr)); width: 100%; gap: 0; padding-top: 2px; border-top: 1px solid var(--border); }
  .site-nav a { justify-content: center; min-width: 0; min-height: 44px; padding: 6px 1px; font-size: 12px; line-height: 1.35; text-align: center; white-space: normal; overflow-wrap: anywhere; border-radius: 4px; }
  .site-nav a.is-active { background: var(--accent-light); }
  .site-nav a::after { display: none; }
  .nav-label-full { display: none; }
  .nav-label-compact { display: inline; }
  .lang-toggle { gap: 5px; padding-inline: 8px; }
}
@media (max-width: 359px) { .site-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 700px) and (max-width: 980px) and (max-height: 500px) {
  .site-header { top: max(4px, env(safe-area-inset-top)); margin-bottom: 16px; }
  .header-inner { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; min-height: 0; padding: 4px 8px; }
  .site-logo { gap: 7px; min-height: 44px; }
  .logo-text { font-size: 18px; }
  .logo-caption { display: none; }
  .logo-mark { width: 18px; height: 23px; }
  .site-nav { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); grid-row: 1; grid-column: 2; gap: 0; padding: 0; border: 0; }
  .site-nav a { justify-content: center; min-width: 0; min-height: 44px; padding: 6px 1px; font-size: 12px; line-height: 1.35; white-space: normal; overflow-wrap: anywhere; text-align: center; border-radius: 4px; }
  .site-nav a.is-active { background: var(--accent-light); }
  .site-nav a::after { display: none; }
  .nav-label-full { display: none; }
  .nav-label-compact { display: inline; }
}
</style>
