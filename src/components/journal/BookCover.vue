<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SiteIcon from '../SiteIcon.vue'

const props = defineProps<{
  type: 'articles' | 'essays' | 'poems'
  coverTitle: string
  coverSubtitle?: string
}>()
const { locale } = useI18n()
const editions = { articles: 'STORIES', essays: 'FRAGMENTS', poems: 'POETRY' }
</script>

<template>
  <router-link class="book-wrap" :class="'book-wrap--' + props.type" :to="'/journal/' + props.type">
    <div class="book-3d">
      <div class="book-pages" aria-hidden="true"></div>
      <div class="book-spine" aria-hidden="true"><span>{{ coverTitle }}</span><span class="spine-signature">QHY</span></div>
      <div class="book-cover-face">
        <span class="cover-edition">{{ editions[props.type] }}</span>
        <div class="cover-title-block">
          <h2 class="cover-title">{{ coverTitle }}</h2>
          <p v-if="coverSubtitle" class="cover-sub">{{ coverSubtitle }}</p>
        </div>
        <div class="cover-art" :class="'cover-art--' + props.type" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="cover-footer"><span>{{ locale === 'en' ? 'QHY' : '羌花吟' }}</span><span>{{ locale === 'en' ? 'COLLECTION' : '随写集' }}</span></div>
      </div>
    </div>
    <span class="book-hint-block"><span>{{ locale === 'en' ? 'Open this collection' : '翻开这一本' }}</span><SiteIcon name="arrow-up-right" /></span>
  </router-link>
</template>

<style scoped>
.book-wrap { --cover-bg: #e1e5f0; --cover-ink: #39445d; --spine-color: #647189; --cover-detail: #9da8bf; display: flex; flex-direction: column; width: 100%; max-width: 300px; min-width: 0; margin-inline: auto; gap: 24px; perspective: 1500px; color: var(--text); }
.book-wrap--essays { --cover-bg: #e5deee; --cover-ink: #594466; --spine-color: #7e6b91; --cover-detail: #b2a0c0; }
.book-wrap--poems { --cover-bg: #efdee2; --cover-ink: #754653; --spine-color: #9d6c79; --cover-detail: #ca9ca8; }
.book-3d { position: relative; display: grid; aspect-ratio: .71; width: 100%; transform: rotateY(-12deg) rotateX(2deg); transform-style: preserve-3d; filter: drop-shadow(12px 16px 12px rgb(38 28 57 / .13)); transition: transform 300ms var(--ease-out), filter 300ms var(--ease-out); }
.book-wrap:hover .book-3d, .book-wrap:focus-visible .book-3d { transform: rotateY(-5deg) translateY(-5px); filter: drop-shadow(12px 20px 14px rgb(38 28 57 / .17)); }
.book-wrap:focus-visible { outline: 2px solid var(--accent); outline-offset: 10px; border-radius: 4px; }
.book-pages { position: absolute; inset: 4px 0 4px 26px; border-radius: 2px; background: repeating-linear-gradient(90deg, #ede9e6 0 1px, #fffaf5 1px 3px); border: 1px solid rgb(58 44 63 / .12); }
.book-spine { position: absolute; inset: 0 auto 0 0; width: 28px; background: var(--spine-color); border-radius: 3px 0 0 3px; box-shadow: inset -4px 0 7px rgb(0 0 0 / .12), inset 2px 0 rgb(255 255 255 / .1); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 32px 0 22px; }
.book-spine > span:first-child { writing-mode: vertical-rl; font-family: var(--font-display); font-size: 13px; letter-spacing: .3em; }
.spine-signature { font-family: var(--font-mono); font-size: 8px; letter-spacing: .05em; }
.book-cover-face { position: relative; margin: 0 7px 0 27px; min-width: 0; overflow: hidden; padding: clamp(20px, 2.4vw, 32px) clamp(16px, 2vw, 28px) 24px; background: var(--cover-bg); color: var(--cover-ink); border-radius: 0 3px 3px 0; box-shadow: inset 2px 0 5px rgb(0 0 0 / .05); display: flex; flex-direction: column; }
.book-cover-face::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .1; background-image: repeating-linear-gradient(0deg, transparent 0 2px, var(--cover-ink) 2px 2.3px), repeating-linear-gradient(90deg, transparent 0 3px, var(--cover-ink) 3px 3.3px); }
.cover-edition { position: relative; z-index: 1; font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: .16em; }
.cover-title-block { position: relative; z-index: 1; margin-top: clamp(28px, 4vw, 50px); }
.cover-title { margin: 0 0 12px; font-family: var(--font-display); font-size: clamp(26px, 3vw, 38px); font-weight: 500; letter-spacing: .15em; line-height: 1.3; }
.cover-sub { margin: 0; font-size: 12px; line-height: 1.8; }
.cover-art { position: relative; align-self: flex-end; flex-shrink: 0; margin: 24px 0; width: 108px; height: 108px; color: var(--cover-detail); }
.cover-art span { position: absolute; display: block; border: 1px solid currentColor; }
.cover-art--articles span { inset: 0; border-radius: 50%; }
.cover-art--articles span:nth-child(2) { inset: 14px; }
.cover-art--articles span:nth-child(3) { inset: 28px; }
.cover-art--essays span { width: 76px; height: 76px; transform: rotate(45deg); top: 16px; left: 16px; }
.cover-art--essays span:nth-child(2) { transform: rotate(45deg) translate(10px, 10px); }
.cover-art--essays span:nth-child(3) { transform: rotate(45deg) translate(20px, 20px); }
.cover-art--poems span { width: 42px; height: 100px; border-radius: 100% 0 100% 0; transform: rotate(35deg); left: 30px; top: 0; }
.cover-art--poems span:nth-child(2) { transform: rotate(60deg); left: 46px; top: 8px; }
.cover-art--poems span:nth-child(3) { transform: rotate(10deg); left: 12px; top: 5px; }
.cover-footer { position: relative; z-index: 1; margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; font-family: var(--font-display); font-size: 12px; }
.cover-footer > span:last-child { font-size: 10px; }
.book-hint-block { display: flex; align-items: center; justify-content: space-between; color: var(--text-muted); font-size: 13px; transition: color 180ms ease; }
.book-hint-block :deep(svg) { width: 18px; height: 18px; }
.book-wrap:hover .book-hint-block { color: var(--accent); }
.cover-title, .cover-sub, .cover-edition, .cover-footer { overflow-wrap: anywhere; }
[data-theme="dark"] .book-wrap { --cover-bg: #293449; --cover-ink: #e0e7f3; --spine-color: #4e607b; --cover-detail: #7384a2; }
[data-theme="dark"] .book-wrap--essays { --cover-bg: #392e46; --cover-ink: #ebe1f2; --spine-color: #6f5c83; --cover-detail: #9983ad; }
[data-theme="dark"] .book-wrap--poems { --cover-bg: #492f39; --cover-ink: #f4e0e5; --spine-color: #895767; --cover-detail: #ba8396; }
@media (max-width: 900px) and (min-width: 701px) { .book-cover-face { padding: 20px 14px; } .cover-title { font-size: 27px; } .cover-sub { font-size: 11px; } .cover-art { transform: scale(.75); transform-origin: center right; margin-block: 8px; } .cover-title-block { margin-top: 24px; } }
@media (max-width: 700px) { .book-wrap { max-width: 260px; } .book-cover-face { padding: 28px 24px 24px; } .cover-title { font-size: 36px; } .cover-title-block { margin-top: 40px; } }
@media (prefers-reduced-motion: reduce) { .book-3d, .book-wrap:hover .book-3d, .book-wrap:focus-visible .book-3d { transform: none; transition: none; } }
</style>
