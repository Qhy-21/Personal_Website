<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { watch, inject } from 'vue'

const route = useRoute()
const { t, locale } = useI18n()

const theme = inject('theme')
const toggleTheme = inject('toggleTheme')

function toggleLang() {
  locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
}

watch(locale, (val) => {
  localStorage.setItem('lang', val)
})

const navItems = [
  { path: '/', label: () => t('nav.home') },
  { path: '/about', label: () => t('nav.about') },
  { path: '/skills', label: () => t('nav.skills') },
  { path: '/projects', label: () => t('nav.projects') },
  { path: '/journal', label: () => t('nav.journal') },
  { path: '/contact', label: () => t('nav.contact') },
  { path: '/guestbook', label: () => t('nav.guestbook') },
]
</script>

<template>
  <header class="glass-header">
    <div class="header-inner">
      <div class="site-logo">
        <span class="logo-mark">◆</span>
        <span class="logo-text">{{ t('site.title') }}</span>
      </div>
      <nav class="glass-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="{ 'is-active': route.path === item.path }"
        >
          {{ item.label() }}
        </router-link>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" @click="toggleTheme" :aria-label="theme === 'dark' ? '切换到浅色模式' : 'Switch to dark mode'">
          <span v-if="theme === 'dark'" class="theme-icon">&#9790;</span>
          <span v-else class="theme-icon">&#9788;</span>
        </button>
        <button class="lang-toggle" @click="toggleLang" :aria-label="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'">
          <span class="lang-option" :class="{ active: locale === 'zh-CN' }">中</span>
          <span class="lang-divider">/</span>
          <span class="lang-option" :class="{ active: locale === 'en' }">EN</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.glass-header {
  position: sticky;
  top: 16px;
  z-index: 100;
  margin-bottom: 40px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-normal) var(--ease-out);
}

.header-inner:hover {
  border-color: var(--border-strong);
}

.site-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: var(--font-pixel);
  font-size: 10px;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.logo-mark {
  color: var(--accent-strong);
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { text-shadow: 0 0 6px var(--accent-glow); }
  50% { text-shadow: 0 0 16px var(--accent-glow), 0 0 28px var(--accent-glow); }
}

.logo-text {
  text-shadow: 0 0 8px rgba(255, 126, 179, 0.5);
}

.glass-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 13px;
}

.glass-nav a {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-out);
}

.glass-nav a:hover {
  color: var(--text);
  background: rgba(128, 128, 128, 0.08);
}

.glass-nav a.is-active,
.glass-nav a.router-link-exact-active {
  color: var(--accent);
  background: rgba(255, 126, 179, 0.1);
  box-shadow: inset 0 -1px 0 0 var(--accent);
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.lang-toggle:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  line-height: 1;
}

.theme-toggle:hover {
  border-color: var(--border-strong);
  color: var(--accent);
}

.theme-icon {
  display: block;
  line-height: 1;
}

.lang-option {
  padding: 2px 4px;
  border-radius: 3px;
  transition: all var(--duration-fast) var(--ease-out);
}

.lang-option.active {
  color: var(--accent);
  background: rgba(255, 126, 179, 0.15);
}

.lang-divider {
  color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .header-inner {
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 10px;
  }

  .glass-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    font-size: 11px;
  }

  .glass-nav a {
    padding: 4px 10px;
  }
}
</style>
