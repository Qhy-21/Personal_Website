<script setup lang="ts">
import { inject, nextTick, onMounted, onUnmounted, shallowRef, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SiteIcon from './SiteIcon.vue'

const route = useRoute()
const { t, locale } = useI18n()
const theme = inject<Ref<string>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
const headerRef = shallowRef<HTMLElement | null>(null)
const dockRef = shallowRef<HTMLElement | null>(null)
const visited = shallowRef(new Set<string>())
const bouncing = shallowRef<string | null>(null)
const navItems = [
  { path: '/', key: 'home' }, { path: '/skills', key: 'skills' },
  { path: '/projects', key: 'projects' }, { path: '/journal', key: 'journal' },
  { path: '/about', key: 'about' }, { path: '/guestbook', key: 'guestbook' },
  { path: '/xusong-bot', key: 'xusongBot' },
]
const MAX_MAGNIFICATION = 1.85
const INFLUENCE_RADIUS = 140
const DOCK_GAP = 6
let headerObserver: ResizeObserver | null = null
let motionQuery: MediaQueryList | undefined
let pointerQuery: MediaQueryList | undefined
let desktopQuery: MediaQueryList | undefined
let frame = 0
let geometryFrame = 0
let previousFrame = 0
let bounceTimer: ReturnType<typeof setTimeout> | undefined
let pointerX: number | null = null
let focusedIndex: number | null = null
let disposed = false
let availableWidth = 0
let lastOffset = ''
let restCenters: number[] = []
let links: HTMLElement[] = []
let names: HTMLElement[] = []
let labels: HTMLElement[] = []
let labelWidths = navItems.map(() => 0)
let baseWidths = navItems.map(() => 44)
const scales = navItems.map(() => 1)
const writtenWidths = navItems.map(() => -1)
const writtenScales = navItems.map(() => -1)

function active(path: string) {
  return path === '/' ? route.path === '/' : route.path === path || route.path.startsWith(path + '/')
}
function toggleLang() { locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN' }
function compactLabel(key: string) {
  if (locale.value === 'en' && key === 'guestbook') return 'Guest\u200bbook'
  return t('nav.' + key)
}
function magnificationEnabled() {
  return Boolean(desktopQuery?.matches && pointerQuery?.matches && !motionQuery?.matches)
}
function paint(index: number) {
  const width = Math.round((baseWidths[index] + labelWidths[index] * (scales[index] - 1)) * 100) / 100
  const scale = Math.round(scales[index] * 10000) / 10000
  // No repeated writes for resting or unchanged items. Text keeps its original
  // font metrics; only its transform and the surrounding flex slot vary.
  if (width !== writtenWidths[index] && links[index]) {
    links[index].style.setProperty('--dock-width', `${width}px`)
    writtenWidths[index] = width
  }
  if (scale !== writtenScales[index] && names[index]) {
    names[index].style.setProperty('--dock-scale', String(scale))
    writtenScales[index] = scale
  }
}
function updateGeometry() {
  geometryFrame = 0
  if (disposed || !headerRef.value || !dockRef.value) return
  // Batch all layout reads. Rest centers derive from unscaled text widths,
  // never from the animated links, so the pointer cannot feed back into itself.
  const headerRect = headerRef.value.getBoundingClientRect()
  const top = parseFloat(getComputedStyle(headerRef.value).top) || 0
  const stageRect = dockRef.value.getBoundingClientRect()
  const measuredWidths = labels.map(label => label.offsetWidth)
  const offset = `${Math.ceil(headerRect.height + top + 12)}px`
  availableWidth = stageRect.width
  labelWidths = measuredWidths
  baseWidths = measuredWidths.map(width => Math.max(44, width + 16))
  const total = baseWidths.reduce((sum, width) => sum + width, 0) + DOCK_GAP * (navItems.length - 1)
  let left = stageRect.left + (stageRect.width - total) / 2
  restCenters = baseWidths.map(width => { const center = left + width / 2; left += width + DOCK_GAP; return center })
  if (offset !== lastOffset) { document.documentElement.style.setProperty('--header-offset', offset); lastOffset = offset }
  baseWidths.forEach((_, index) => paint(index))
  requestFrame()
}
function scheduleGeometry() {
  if (!geometryFrame && !disposed) geometryFrame = requestAnimationFrame(updateGeometry)
}
function animate(now: number) {
  frame = 0
  const delta = previousFrame ? Math.min(now - previousFrame, 48) : 16.67
  previousFrame = now
  const interpolation = 1 - Math.exp(-delta / 48)
  const position = magnificationEnabled() ? pointerX ?? (focusedIndex === null ? null : restCenters[focusedIndex]) : null
  const targets = restCenters.map(center => {
    const distance = position === null ? INFLUENCE_RADIUS : Math.abs(position - center)
    return distance >= INFLUENCE_RADIUS ? 1 : 1 + (MAX_MAGNIFICATION - 1) * (1 + Math.cos(Math.PI * distance / INFLUENCE_RADIUS)) / 2
  })
  const baseTotal = baseWidths.reduce((sum, width) => sum + width, 0) + DOCK_GAP * (navItems.length - 1)
  const desiredExtra = targets.reduce((sum, target, index) => sum + labelWidths[index] * (target - 1), 0)
  const fit = desiredExtra > 0 ? Math.min(1, Math.max(0, availableWidth - baseTotal) / desiredExtra) : 1
  let moving = false
  targets.forEach((target, index) => {
    target = 1 + (target - 1) * fit
    const difference = target - scales[index]
    if (Math.abs(difference) < .0005) {
      if (scales[index] !== target) { scales[index] = target; paint(index) }
      return
    }
    scales[index] += difference * interpolation
    paint(index)
    if (Math.abs(target - scales[index]) >= .0005) moving = true
  })
  if (moving) frame = requestAnimationFrame(animate)
  else previousFrame = 0
}
function requestFrame() {
  if (!frame && restCenters.length && !disposed) { previousFrame = 0; frame = requestAnimationFrame(animate) }
}
function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !magnificationEnabled() || event.clientX === pointerX) return
  pointerX = event.clientX
  requestFrame()
}
function onPointerLeave() { if (pointerX !== null) { pointerX = null; requestFrame() } }
function onFocus(index: number, event: FocusEvent) {
  if ((event.target as HTMLElement).matches(':focus-visible')) { focusedIndex = index; requestFrame() }
}
function onFocusOut() { if (focusedIndex !== null) { focusedIndex = null; requestFrame() } }
function resetMotion() {
  pointerX = null
  focusedIndex = null
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  previousFrame = 0
  scales.forEach((scale, index) => { if (scale !== 1) { scales[index] = 1; paint(index) } })
  bouncing.value = null
  scheduleGeometry()
}
async function launch(path: string) {
  visited.value = new Set([...visited.value, path])
  clearTimeout(bounceTimer)
  bouncing.value = null
  if (motionQuery?.matches || !desktopQuery?.matches) return
  await nextTick()
  if (disposed) return
  bouncing.value = path
  bounceTimer = setTimeout(() => { bouncing.value = null }, 750)
}
watch(locale, async value => { localStorage.setItem('lang', value); await nextTick(); resetMotion() })
watch(() => route.path, () => {
  const current = navItems.find(item => active(item.path))
  if (current) visited.value = new Set([...visited.value, current.path])
  focusedIndex = null
  requestFrame()
}, { immediate: true })

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  desktopQuery = window.matchMedia('(min-width: 981px)')
  links = [...dockRef.value?.querySelectorAll<HTMLElement>('.dock-link') || []]
  names = [...dockRef.value?.querySelectorAll<HTMLElement>('.dock-name') || []]
  labels = [...dockRef.value?.querySelectorAll<HTMLElement>('.nav-label-full') || []]
  headerObserver = new ResizeObserver(scheduleGeometry)
  if (headerRef.value) headerObserver.observe(headerRef.value)
  if (dockRef.value) headerObserver.observe(dockRef.value)
  window.addEventListener('resize', resetMotion)
  window.addEventListener('blur', resetMotion)
  motionQuery.addEventListener('change', resetMotion)
  pointerQuery.addEventListener('change', resetMotion)
  desktopQuery.addEventListener('change', resetMotion)
  document.fonts.ready.then(scheduleGeometry)
  scheduleGeometry()
})
onUnmounted(() => {
  disposed = true
  headerObserver?.disconnect()
  cancelAnimationFrame(frame)
  cancelAnimationFrame(geometryFrame)
  clearTimeout(bounceTimer)
  window.removeEventListener('resize', resetMotion)
  window.removeEventListener('blur', resetMotion)
  motionQuery?.removeEventListener('change', resetMotion)
  pointerQuery?.removeEventListener('change', resetMotion)
  desktopQuery?.removeEventListener('change', resetMotion)
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
      <div ref="dockRef" class="dock-stage" @pointermove="onPointerMove" @pointerleave="onPointerLeave">
        <nav id="site-navigation" class="site-nav dock-nav" :aria-label="locale === 'en' ? 'Main navigation' : '主导航'">
          <router-link v-for="(item, index) in navItems" :key="item.path" :to="item.path" class="dock-link" :class="{ 'is-active': active(item.path), 'is-running': visited.has(item.path), 'is-bouncing': bouncing === item.path }" :data-dock-key="item.key" :aria-current="active(item.path) ? 'page' : undefined" :aria-label="t('nav.' + item.key)" @click="launch(item.path)" @focus="onFocus(index, $event)" @blur="onFocusOut">
            <span class="dock-name"><span class="nav-label-full">{{ t('nav.' + item.key) }}</span><span class="nav-label-compact">{{ compactLabel(item.key) }}</span></span>
            <span class="dock-running-dot" aria-hidden="true"></span>
          </router-link>
        </nav>
      </div>
      <div class="header-actions">
        <button type="button" class="theme-toggle icon-button" @click="toggleTheme?.()" :aria-label="locale === 'en' ? (theme === 'dark' ? 'Use light theme' : 'Use dark theme') : (theme === 'dark' ? '切换浅色主题' : '切换深色主题')"><SiteIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" /></button>
        <button type="button" class="lang-toggle" @click="toggleLang" :aria-label="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'"><span :class="{ active: locale === 'zh-CN' }">中</span><span class="lang-divider" aria-hidden="true">/</span><span :class="{ active: locale === 'en' }">EN</span></button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header { position: sticky; top: 12px; z-index: 100; margin-bottom: 24px; }
.header-inner { display: grid; grid-template-columns: 150px minmax(0, 1fr) 108px; align-items: center; gap: 14px; min-height: 86px; padding: 8px 18px; border: 1px solid var(--border); border-radius: var(--radius-md); background: color-mix(in srgb, var(--bg-card) 91%, transparent); box-shadow: var(--shadow-sm); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.site-logo { display: flex; align-items: center; gap: 10px; min-height: 44px; color: var(--text); }
.logo-mark { color: var(--accent); width: 22px; flex-shrink: 0; }
.logo-copy { display: flex; flex-direction: column; gap: 7px; }
.logo-text { font: 600 22px/1 var(--font-display); letter-spacing: .08em; }
.logo-dot { color: var(--accent); }
.logo-caption { font: 7px/1.5 var(--font-mono); letter-spacing: .08em; color: var(--text-muted); }
.dock-stage { display: flex; justify-content: center; align-items: center; min-width: 0; height: 62px; }
.dock-nav { display: flex; align-items: center; justify-content: center; gap: 6px; width: max-content; }
.dock-link { position: relative; display: block; flex: 0 0 auto; width: var(--dock-width, auto); min-width: 44px; height: 48px; padding: 0 8px; border-radius: 6px; color: var(--text-muted); text-decoration: none; }
.dock-name { position: absolute; left: 50%; bottom: 13px; width: max-content; max-width: none; font-size: 13px; line-height: 1.5; white-space: nowrap; transform: translateX(-50%) scale(var(--dock-scale, 1)); transform-origin: center bottom; }
.dock-link:hover, .dock-link:focus-visible, .dock-link.is-active { color: var(--accent); }
.dock-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.dock-running-dot { position: absolute; left: calc(50% - 2px); bottom: 5px; width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted); opacity: 0; }
.dock-link.is-running .dock-running-dot { opacity: .55; }
.dock-link.is-active .dock-running-dot { opacity: 1; background: var(--accent); }
.nav-label-compact { display: none; }
.header-actions { display: flex; align-items: center; justify-content: flex-end; min-height: 44px; gap: 2px; }
.theme-toggle { border-color: transparent; }
.lang-toggle { min-height: 44px; display: flex; align-items: center; gap: 5px; padding: 6px; border: 0; border-radius: var(--radius-sm); background: transparent; font: 11px/1 var(--font-mono); color: var(--text-muted); }
.lang-toggle:hover { background: var(--accent-light); }
.lang-toggle .active { color: var(--accent); }
.lang-divider { color: var(--border-strong); }
.dock-link.is-bouncing .dock-name { animation: dock-bounce 240ms cubic-bezier(.3, .05, .5, 1) 3; }
@keyframes dock-bounce { 0%, 100% { translate: 0 0; } 45% { translate: 0 -5px; } 70% { translate: 0 -1px; } }
@media (max-width: 1100px) and (min-width: 981px) { .header-inner { grid-template-columns: 120px minmax(0, 1fr) 98px; gap: 8px; padding-inline: 12px; } .logo-caption { font-size: 6px; } .logo-text { font-size: 20px; } }
@media (max-width: 980px) {
  .site-header { top: max(4px, env(safe-area-inset-top)); margin-bottom: 16px; }
  .header-inner { grid-template-columns: minmax(0, 1fr) auto; gap: 0; min-height: 0; padding: 4px 8px; }
  .site-logo { gap: 8px; min-height: 44px; width: fit-content; }
  .logo-mark { width: 18px; height: 23px; }
  .logo-text { font-size: 19px; }
  .logo-caption { display: none; }
  .header-actions { grid-column: 2; grid-row: 1; }
  .dock-stage { display: block; grid-row: 2; grid-column: 1 / -1; width: 100%; height: auto; padding: 2px 0 0; border-top: 1px solid var(--border); }
  .dock-nav { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); width: 100%; gap: 0; }
  .dock-link { display: flex; align-items: center; justify-content: center; width: auto; min-width: 0; min-height: 44px; height: auto; padding: 6px 1px; border-radius: 4px; }
  .dock-name { position: static; width: auto; max-width: 100%; font-size: 11px; line-height: 1.4; white-space: normal; text-align: center; overflow-wrap: anywhere; transform: none; }
  .dock-link.is-active { background: var(--accent-light); }
  .nav-label-full { display: none; }
  .nav-label-compact { display: inline; }
  .dock-running-dot { bottom: 2px; width: 3px; height: 3px; }
  .dock-link.is-bouncing .dock-name { animation: none; }
}
@media (max-width: 359px) { .dock-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 700px) and (max-width: 980px) and (max-height: 500px) { .header-inner { grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; } .dock-stage { grid-column: 2; grid-row: 1; padding: 0; border: 0; } .header-actions { grid-column: 3; } }
@media (prefers-reduced-motion: reduce) { .dock-link.is-bouncing .dock-name { animation: none; } }
</style>
