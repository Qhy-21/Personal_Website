<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { watch, inject, shallowRef, type Ref } from 'vue'
import SiteIcon from './SiteIcon.vue'
const route = useRoute()
const { t, locale } = useI18n()
const theme = inject<Ref<string>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
const mobileOpen = shallowRef(false)
const menuButton = shallowRef<HTMLButtonElement | null>(null)
const navItems = [
  { path: '/', key: 'home' }, { path: '/skills', key: 'skills' },
  { path: '/projects', key: 'projects' }, { path: '/journal', key: 'journal' },
  { path: '/about', key: 'about' }, { path: '/guestbook', key: 'guestbook' },
  { path: '/xusong-bot', key: 'xusongBot' },
]
function active(path: string) { return path === '/' ? route.path === '/' : route.path === path || route.path.startsWith(path + '/') }
function toggleLang() { locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN' }
function closeMenu() { mobileOpen.value = false; menuButton.value?.focus() }
watch(locale, value => localStorage.setItem('lang', value))
watch(() => route.path, () => { mobileOpen.value = false })
</script>
<template>
  <header class="site-header" @keydown.esc="closeMenu">
    <div class="header-inner">
      <router-link to="/" class="site-logo" :aria-label="t('site.title')">
        <svg class="logo-mark" width="27" height="30" viewBox="0 0 27 30" aria-hidden="true"><path d="M9 0h9v7h9v9h-9v7H9v-7H0V7h9Z" fill="currentColor"/><path d="M18 23h6v7h-6Z" fill="currentColor" opacity=".35"/></svg>
        <span class="logo-copy"><span class="logo-text">{{ locale === 'en' ? 'QHY' : '羌花吟' }}<span class="logo-dot">.</span></span><span class="logo-caption">A LITTLE PIXEL WORLD</span></span>
      </router-link>
      <nav id="site-navigation" class="site-nav" :class="{ 'is-open': mobileOpen }" :aria-label="locale === 'en' ? 'Main navigation' : '主导航'">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="{ 'is-active': active(item.path) }" :aria-current="active(item.path) ? 'page' : undefined">{{ t('nav.' + item.key) }}</router-link>
      </nav>
      <div class="header-actions">
        <button type="button" class="theme-toggle icon-button" @click="toggleTheme?.()" :aria-label="locale === 'en' ? (theme === 'dark' ? 'Use light theme' : 'Use dark theme') : (theme === 'dark' ? '切换浅色主题' : '切换深色主题')"><SiteIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" /></button>
        <button type="button" class="lang-toggle" @click="toggleLang" :aria-label="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'"><span :class="{ active: locale === 'zh-CN' }">中</span><span class="lang-divider" aria-hidden="true">/</span><span :class="{ active: locale === 'en' }">EN</span></button>
        <button ref="menuButton" type="button" class="menu-toggle icon-button" @click="mobileOpen = !mobileOpen" :aria-expanded="mobileOpen" aria-controls="site-navigation" :aria-label="locale === 'en' ? 'Toggle navigation' : '展开或收起导航'"><SiteIcon :name="mobileOpen ? 'close' : 'menu'" :size="19" /></button>
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
.menu-toggle { display: none; }
@media (max-width: 900px) { .site-nav.is-open { grid-template-columns: repeat(4, minmax(0, 1fr)); } .site-nav a { min-width: 0; white-space: normal; overflow-wrap: anywhere; text-align: center; } }
@media (max-width: 1100px) { .header-inner { gap: 8px; padding-inline: 16px; } .site-nav { gap: 0; } .site-nav a { padding-inline: 8px; font-size: 12px; } .logo-caption { display: none; } }
@media (max-width: 900px) { .site-header { top: 12px; margin-bottom: 24px; } .header-inner { flex-wrap: wrap; min-height: 72px; padding: 12px 16px; } .menu-toggle { display: inline-flex; } .site-nav { display: none; order: 3; width: 100%; border-top: 1px solid var(--border); padding-top: 12px; grid-template-columns: repeat(4, 1fr); gap: 6px; } .site-nav.is-open { display: grid; } .site-nav a { justify-content: center; font-size: 13px; border-radius: var(--radius-sm); padding: 10px 6px; } .site-nav a.is-active { background: var(--accent-light); } .site-nav a::after { display: none; } .logo-caption { display: block; } }
@media (max-width: 480px) { .logo-caption { font-size: 7px; } .logo-text { font-size: 20px; } .site-logo { gap: 9px; } .header-inner { padding-inline: 12px; } .lang-toggle { gap: 4px; padding-inline: 5px; } .header-actions { gap: 0; } .site-nav.is-open { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
