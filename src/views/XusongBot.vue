<script setup lang="ts">
import { computed, ref, shallowRef, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTournament } from '../composables/useTournament.js'
import SongCard from '../components/SongCard.vue'
import BracketTree from '../components/BracketTree.vue'
import PageIntro from '../components/PageIntro.vue'
import SiteIcon from '../components/SiteIcon.vue'
import { useDialog } from '../composables/useDialog'
import { getFlatSongList } from '../data/xusongSongs/index.js'
import teaCover from '../data/interests/vae/不如吃茶去.jpg'
import breathCover from '../data/interests/vae/呼吸之野.jpg'
import debutCover from '../data/interests/vae/自定义.jpg'

const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')
const albumCovers = [debutCover, teaCover, breathCover]
const songList = getFlatSongList()
const songRows = Array.from({ length: 3 }, (_, row) => songList.filter((_, index) => index % 3 === row))
const {
  round, phase, currentMatch, totalMatches, votedCount, progress,
  hasSkipped, canUndo, totalSongs, champions,
  allRounds, skippedQueue,
  initTournament, vote, skipCurrent, pass, pickRandomSkipped, undo, clearAll,
  loadState,
} = useTournament()

const resumeNotice = ref<'voting' | 'complete' | null>(null)
const bracketRef = ref<HTMLElement | null>(null)
const voteAreaRef = ref<HTMLElement | null>(null)
const exporting = ref(false)
const confirmAction = ref<{ type: 'restart' | 'clear' | 'export' } | null>(null)
const confirmOpen = computed({ get: () => confirmAction.value !== null, set: value => { if (!value) confirmAction.value = null } })
const { dialogRef: confirmDialogRef } = useDialog(confirmOpen)
const userPaused = ref(false)
const reduceMotion = ref(false)
const marqueePaused = computed(() => userPaused.value || reduceMotion.value)
const songFieldRef = shallowRef<HTMLElement | null>(null)
const documentVisible = shallowRef(!document.hidden)
const pageReady = shallowRef(false)
const marqueeRunning = computed(() => !marqueePaused.value && documentVisible.value && pageReady.value)
let motionPreference: MediaQueryList | null = null
let ribbonObserver: IntersectionObserver | null = null
let pageReadyObserver: MutationObserver | null = null
function updateMotionPreference() { reduceMotion.value = motionPreference?.matches ?? false }
function updateDocumentVisibility() { documentVisible.value = !document.hidden }

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotionPreference()
  motionPreference.addEventListener('change', updateMotionPreference)
  document.addEventListener('visibilitychange', updateDocumentVisibility)
  ribbonObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting))
  }, { rootMargin: '80px 0px' })
  songFieldRef.value?.querySelectorAll('.song-ribbon').forEach(ribbon => ribbonObserver?.observe(ribbon))
  const page = songFieldRef.value?.closest<HTMLElement>('.pixel-page')
  const updatePageReady = () => { pageReady.value = !page?.inert }
  updatePageReady()
  if (page?.inert) {
    pageReadyObserver = new MutationObserver(() => {
      updatePageReady()
      if (pageReady.value) { pageReadyObserver?.disconnect(); pageReadyObserver = null }
    })
    pageReadyObserver.observe(page, { attributes: true, attributeFilter: ['inert'] })
  }
  if (loadState()) resumeNotice.value = phase.value === 'complete' ? 'complete' : 'voting'
})
onUnmounted(() => {
  motionPreference?.removeEventListener('change', updateMotionPreference)
  document.removeEventListener('visibilitychange', updateDocumentVisibility)
  ribbonObserver?.disconnect()
  pageReadyObserver?.disconnect()
})
watch(phase, value => { if (value === 'complete') resumeNotice.value = 'complete' })

function handleResume() {
  resumeNotice.value = null
  voteAreaRef.value?.querySelector<HTMLButtonElement>('.song-card')?.focus({ preventScroll: true })
}

function handleNewGame() {
  if (phase.value !== 'idle') { handleRestart(); return }
  resumeNotice.value = null
  initTournament()
}

function play(action: () => void) { resumeNotice.value = null; action() }

function handleRestart() {
  confirmAction.value = { type: 'restart' }
}

function handleClear() {
  confirmAction.value = { type: 'clear' }
}

function handleExport() {
  confirmAction.value = { type: 'export' }
}

function doConfirm() {
  const type = confirmAction.value?.type
  confirmAction.value = null
  if (type === 'restart') {
    resumeNotice.value = null
    initTournament()
  } else if (type === 'clear') {
    resumeNotice.value = null
    clearAll()
  } else if (type === 'export') {
    doExport()
  }
}

function doCancel() {
  confirmAction.value = null
}

async function doExport() {
  if (!bracketRef.value || exporting.value) return
  exporting.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const el = bracketRef.value
    const canvas = await html2canvas(el, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim() || '#0f0f18',
      scale: 2,
      onclone: (document) => {
        document.querySelectorAll('.card-light-layer').forEach(decoration => decoration.remove())
        document.querySelectorAll('html2canvaspseudoelement').forEach(decoration => decoration.remove())
        document.querySelectorAll('[data-card-light]').forEach(card => card.removeAttribute('data-card-light'))
        document.querySelectorAll('details.animated-details').forEach(details => {
          const expanded = document.createElement('div')
          expanded.className = details.className
          expanded.setAttribute('open', '')
          expanded.append(...details.childNodes)
          details.replaceWith(expanded)
        })
      },
    })
    canvas.toBlob((blob) => {
      if (!blob) {
        exporting.value = false
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'xu-song-bracket.png'
      a.click()
      URL.revokeObjectURL(url)
      exporting.value = false
    }, 'image/png')
  } catch {
    exporting.value = false
  }
}

function confirmDesc(type: string) {
  if (type === 'restart') return t('xusongBot.confirmRestartDesc')
  if (type === 'export') return t('xusongBot.confirmExportDesc')
  if (type === 'clear') return t('xusongBot.confirmClearDesc')
  return ''
}
</script>

<template>
  <section class="xusong-page" :class="{ 'is-complete': phase === 'complete' }">
    <div ref="songFieldRef" class="song-field" :class="{ 'is-running': marqueeRunning }" aria-hidden="true">
      <div v-for="(songs, row) in songRows" :key="row" v-memo="[row]" class="song-ribbon" :class="`song-ribbon-${row}`">
        <div class="song-ribbon-track">
          <div v-for="copy in 2" :key="copy" class="song-ribbon-copy">
            <span v-for="song in songs" :key="song.id">{{ song.title }}</span>
          </div>
        </div>
      </div>
    </div>
    <PageIntro
      eyebrow="SOME SONGS STAY WITH US"
      :title="t('xusongBot.title')"
      :description="isEnglish ? 'Some songs become part of your story. Pick the ones you would always come back to.' : '总有一些歌，陪你走过某段日子。一首一首选，留下最偏爱的那首。'"
    >
      <div class="collection-tools">
        <span class="collection-meta"><SiteIcon name="music" :size="16" />{{ t('xusongBot.subtitle', { n: totalSongs }) }}</span>
        <button type="button" class="motion-toggle" :aria-pressed="marqueePaused" :disabled="reduceMotion" @click="userPaused = !userPaused">
          <span aria-hidden="true">{{ marqueePaused ? '▷' : 'Ⅱ' }}</span>{{ reduceMotion ? t('xusongBot.motionReduced') : marqueePaused ? t('xusongBot.motionPlay') : t('xusongBot.motionPause') }}
        </button>
      </div>
    </PageIntro>

    <Transition name="resume-note">
      <div v-if="resumeNotice" class="resume-notice phase-wrap" role="status">
        <p><SiteIcon name="music" :size="16" />{{ resumeNotice === 'complete' ? t('xusongBot.completeNotice') : t('xusongBot.resumeTitle') }}</p>
        <div class="notice-actions">
          <button v-if="resumeNotice === 'voting'" type="button" class="notice-action notice-continue" @click="handleResume">{{ t('xusongBot.resumeContinue') }}</button>
          <button type="button" class="notice-action notice-restart" @click="handleRestart">{{ t('xusongBot.resumeNew') }}</button>
          <button type="button" class="notice-close" :aria-label="t('xusongBot.dismissNotice')" @click="resumeNotice = null"><SiteIcon name="close" :size="16" /></button>
        </div>
      </div>
    </Transition>

    <!-- Voting phase -->
    <div v-if="phase === 'voting'" class="phase-wrap">
      <div class="stats-row">
        <span class="stat-item">{{ t('xusongBot.round', { n: round }) }}</span>
        <span class="stat-item">{{ t('xusongBot.progress', { voted: votedCount, total: totalMatches }) }}</span>
        <span v-if="skippedQueue.length" class="stat-item accent">{{ t('xusongBot.skipped', { n: skippedQueue.length }) }}</span>
      </div>

      <div class="progress-track" role="progressbar" :aria-label="t('xusongBot.progress', { voted: votedCount, total: totalMatches })" :aria-valuenow="votedCount" :aria-valuemax="totalMatches" :aria-valuemin="0">
        <div class="progress-fill" :style="{ transform: `scaleX(${progress / 100})` }"></div>
      </div>

      <div v-if="currentMatch" ref="voteAreaRef" class="vote-area">
        <div class="vote-cards">
          <SongCard
            :song="currentMatch.songA"
            @pick="play(() => vote('A'))"
          />
          <div class="vs-badge">
            <span class="vs-text">VS</span>
          </div>
          <SongCard
            :song="currentMatch.songB"
            @pick="play(() => vote('B'))"
          />
        </div>
      </div>

      <div class="action-bar">
        <button class="bot-btn" :disabled="!canUndo" @click="play(undo)">{{ t('xusongBot.undo') }}</button>
        <button class="bot-btn" :title="t('xusongBot.skipTitle')" @click="play(skipCurrent)">{{ t('xusongBot.skip') }}</button>
        <button class="bot-btn pass-btn" :title="t('xusongBot.passTitle')" @click="play(pass)">{{ t('xusongBot.pass') }}</button>
        <button
          class="bot-btn accent-btn"
          :class="{ 'has-items': hasSkipped }"
          :disabled="!hasSkipped"
          :title="t('xusongBot.randomSkipTitle')"
          @click="play(pickRandomSkipped)"
        >{{ t('xusongBot.randomSkip') }}</button>
      </div>

      <p v-if="hasSkipped" class="skip-desc">{{ t('xusongBot.randomSkipDesc') }}</p>
      <p class="hint-text">{{ t('xusongBot.hint') }}</p>

      <!-- Live bracket -->
      <details v-if="allRounds.length" class="live-bracket-section animated-details" name="xusong-panels">
        <summary class="live-bracket-toggle">
          <span class="bracket-toggle-mark" aria-hidden="true"></span>{{ t('xusongBot.liveBracket', { n: allRounds.length }) }}
        </summary>
        <div class="live-bracket-body">
          <BracketTree :all-rounds="allRounds" />
        </div>
      </details>
    </div>

    <!-- Complete phase -->
    <div v-if="phase === 'complete'" class="phase-wrap complete-phase">
      <div v-if="champions.length" class="champion-card">
        <div class="champion-label">{{ champions.length === 1 ? t('xusongBot.champion') : t('xusongBot.champions') }}</div>
        <div class="champion-list">
          <SongCard
            v-for="c in champions"
            :key="c.id"
            :song="c"
            :outcome="'win'"
          />
        </div>
      </div>

      <div class="action-bar complete-actions">
        <button class="bot-btn primary" @click="handleRestart">{{ t('xusongBot.restart') }}</button>
        <button class="bot-btn" @click="handleExport" :disabled="exporting">
          {{ exporting ? (isEnglish ? 'Exporting…' : '正在导出…') : t('xusongBot.exportImage') }}
        </button>
        <button class="bot-btn danger" @click="handleClear">{{ t('xusongBot.clearAll') }}</button>
      </div>

      <h2 class="bracket-heading">{{ t('xusongBot.bracketTitle') }}</h2>
      <div ref="bracketRef">
        <BracketTree :all-rounds="allRounds" />
      </div>
    </div>

    <!-- Idle phase -->
    <div v-if="phase === 'idle'" class="phase-wrap">
      <div class="idle-card pixel-card">
        <div class="record-collection" aria-hidden="true">
          <div v-for="(cover, index) in albumCovers" :key="cover" class="record-sleeve" :class="`sleeve-${index}`">
            <img :src="cover" alt="" width="180" height="180">
          </div>
          <span class="collection-caption">THE XU SONG COLLECTION</span>
        </div>
        <div class="idle-copy">
          <span class="idle-kicker">{{ isEnglish ? 'YOUR VERY OWN ENCORE' : '关于许嵩，关于偏爱' }}</span>
          <h2 class="idle-text">{{ t('xusongBot.idleText', { n: totalSongs }) }}</h2>
          <p class="idle-invitation">{{ isEnglish ? 'Two songs at a time. Follow your heart, and build a bracket of your favorites.' : '每次遇见两首歌，把一票投给更喜欢的那首，慢慢选出属于你的答案。' }}</p>
          <button class="bot-btn primary start-btn" @click="handleNewGame">{{ t('xusongBot.startVote') }}<SiteIcon name="arrow-right" :size="17" /></button>
        </div>
      </div>
    </div>

    <!-- Confirm dialog -->
    <Teleport to="body">
      <div v-if="confirmAction" class="xusong-confirm-overlay" @click.self="doCancel">
        <div ref="confirmDialogRef" class="xusong-confirm-card" role="dialog" aria-modal="true" aria-labelledby="xusong-confirm-title" aria-describedby="xusong-confirm-description" tabindex="-1">
          <h2 id="xusong-confirm-title" class="xusong-confirm-title">{{ t('xusongBot.confirmTitle') }}</h2>
          <p id="xusong-confirm-description" class="xusong-confirm-desc">{{ confirmDesc(confirmAction.type) }}</p>
          <div class="xusong-confirm-actions">
            <button class="bot-btn" @click="doCancel">{{ t('xusongBot.confirmCancel') }}</button>
            <button class="bot-btn primary" @click="doConfirm">{{ t('xusongBot.confirmYes') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.xusong-page { position: relative; isolation: isolate; padding-bottom: 40px; }
.song-field { position: absolute; z-index: -1; inset: 90px 0 0; overflow: hidden; contain: layout paint; pointer-events: none; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.song-ribbon { position: absolute; left: 0; width: 100%; overflow: hidden; contain: layout paint; color: var(--text-muted); opacity: .24; }
[data-theme="light"] .song-ribbon { opacity: .26; }
.song-ribbon-0 { top: 8%; }
.song-ribbon-1 { top: 43%; }
.song-ribbon-2 { top: 78%; }
.song-ribbon-track { display: flex; width: max-content; transform: translate3d(0, 0, 0); animation: songsDrift 180s linear infinite paused; }
.song-ribbon-1 .song-ribbon-track { animation-duration: 210s; animation-direction: reverse; }
.song-ribbon-2 .song-ribbon-track { animation-duration: 240s; }
.song-ribbon-copy { display: flex; flex: 0 0 auto; align-items: center; gap: 24px; padding-right: 24px; }
.song-ribbon-copy span { font-family: var(--font-display); font-size: 26px; line-height: 1.35; white-space: nowrap; }
.song-field.is-running .song-ribbon.is-in-view .song-ribbon-track { animation-play-state: running; will-change: transform; }
@keyframes songsDrift { to { transform: translate3d(-50%, 0, 0); } }
.collection-tools { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.motion-toggle { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 4px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); font: 12px/1.5 var(--font-body); }
.motion-toggle:hover:not(:disabled) { background: var(--accent-light); color: var(--accent-strong); }
.motion-toggle:disabled { cursor: default; }
.motion-toggle span { font-size: 15px; }
.resume-notice { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; margin-bottom: 22px; padding: 8px 12px 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); }
.resume-notice p { display: flex; align-items: center; gap: 9px; margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.resume-notice p svg { flex-shrink: 0; color: var(--accent); }
.notice-actions { display: flex; flex-shrink: 0; align-items: center; gap: 6px; }
.notice-action, .notice-close { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); font: 13px/1.6 var(--font-body); }
.notice-action { padding: 6px 10px; }
.notice-continue { color: var(--accent-strong); }
.notice-close { width: 44px; padding: 0; }
.notice-action:hover, .notice-close:hover { color: var(--accent-strong); background: var(--accent-light); }
.resume-note-enter-active, .resume-note-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.resume-note-enter-from, .resume-note-leave-to { opacity: 0; transform: translateY(-4px); }
.collection-meta { display: inline-flex; align-items: center; gap: 10px; color: var(--text-muted); font: 12px/1.7 var(--font-mono); }
.phase-wrap { max-width: 920px; margin: 0 auto; }
.complete-phase { max-width: none; }
.stats-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 15px; }
.stat-item { color: var(--text-muted); font: 13px/1.7 var(--font-mono); font-variant-numeric: tabular-nums; }
.stat-item.accent { color: var(--accent-strong); }
.progress-track { width: 100%; height: 3px; margin-bottom: 36px; overflow: hidden; border-radius: 2px; background: var(--border); }
.progress-fill { height: 100%; border-radius: inherit; background: var(--accent); transform-origin: left center; transition: transform var(--duration-normal) var(--ease-out); }
.vote-area { margin-bottom: 30px; }
.vote-cards { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 22px; align-items: stretch; }
.vote-cards :deep(.song-card) { min-height: 160px; padding: 30px; background: var(--bg-card); box-shadow: var(--shadow-sm); }
.vote-cards :deep(.song-card.is-clickable:hover) { background: var(--accent-light); box-shadow: var(--shadow-md); transform: translateY(-3px); }
.vote-cards :deep(.song-title) { font-family: var(--font-display); font-size: 24px; font-weight: 500; line-height: 1.6; white-space: normal; }
.vote-cards :deep(.song-meta) { margin-top: 8px; font-size: 12px; line-height: 1.7; white-space: normal; }
.vs-badge { display: grid; width: 36px; align-self: center; place-items: center; }
.vs-text { color: var(--text-muted); font: italic 19px/1 var(--font-display); }
.action-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 20px; }
.complete-actions { margin-top: 28px; }
.bot-btn { display: inline-flex; min-height: 46px; align-items: center; justify-content: center; gap: 10px; padding: 10px 21px; appearance: none; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text); font: 14px/1.7 var(--font-body); cursor: pointer; transition: background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out); }
.bot-btn:hover:not(:disabled) { background: var(--bg-elevated); border-color: var(--text-muted); }
.bot-btn:focus-visible, .live-bracket-toggle:focus-visible { outline: 2px solid var(--accent-strong); outline-offset: 4px; }
.bot-btn:disabled { opacity: .45; cursor: not-allowed; }
.bot-btn.primary { background: var(--accent-strong); border-color: var(--accent-strong); color: var(--bg-card); }
.bot-btn.primary:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); color: var(--bg-deep); }
.bot-btn.accent-btn.has-items { border-color: var(--accent); color: var(--accent-strong); background: var(--accent-light); }
.bot-btn.danger { border-color: transparent; background: transparent; color: var(--text-muted); }
.bot-btn.danger:hover:not(:disabled) { border-color: var(--accent-strong); color: var(--accent-strong); }
.bot-btn.pass-btn { color: var(--text-muted); }
.skip-desc, .hint-text { max-width: 600px; margin: 0 auto; color: var(--text-muted); font-size: 13px; line-height: 1.8; text-align: center; }
.skip-desc { margin-bottom: 10px; }
.live-bracket-section { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); }
.live-bracket-toggle { display: flex; min-height: 46px; align-items: center; justify-content: space-between; gap: 16px; margin: 0 auto; padding: 10px 18px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-muted); font: 14px/1.7 var(--font-body); cursor: pointer; }
.live-bracket-toggle:hover { border-color: var(--accent); color: var(--accent-strong); }
.live-bracket-toggle { width: fit-content; list-style: none; }
.live-bracket-toggle::-webkit-details-marker { display: none; }
.bracket-toggle-mark { color: var(--accent-strong); font: 19px/1 var(--font-mono); }
.bracket-toggle-mark::before { content: '+'; }
.live-bracket-section[open] .bracket-toggle-mark::before { content: '−'; }
.live-bracket-body { max-height: 420px; overflow-y: auto; margin-top: 24px; }
.idle-card { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 38px; padding: 38px 46px; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-sm); }
.record-collection { position: relative; min-height: 280px; }
.record-sleeve { position: absolute; top: 36px; left: calc(50% - 86px); width: 172px; height: 172px; padding: 5px; border: 1px solid var(--border-strong); border-radius: 5px; background: var(--bg-card); box-shadow: var(--shadow-md); }
.record-sleeve img { display: block; width: 100%; height: 100%; object-fit: cover; }
.sleeve-0 { z-index: 1; transform: translateX(-56px) rotate(-13deg); }
.sleeve-1 { z-index: 3; transform: translateY(15px) rotate(-2deg); }
.sleeve-2 { z-index: 2; transform: translateX(57px) rotate(12deg); }
.collection-caption { position: absolute; right: 0; bottom: 8px; left: 0; color: var(--text-muted); font: 9px/1.7 var(--font-mono); letter-spacing: .14em; text-align: center; }
.idle-kicker { color: var(--accent-strong); font: 11px/1.8 var(--font-mono); letter-spacing: .1em; }
.idle-text { margin: 13px 0 15px; font-family: var(--font-display); font-size: clamp(22px, 2.5vw, 30px); font-weight: 500; line-height: 1.7; text-wrap: balance; }
.idle-invitation { margin: 0 0 27px; color: var(--text-muted); font-size: 14px; line-height: 1.9; }
.start-btn { min-height: 48px; padding-inline: 24px; }
.champion-card { margin-bottom: 36px; text-align: center; }
.champion-label { margin-bottom: 24px; color: var(--accent-strong); font-family: var(--font-display); font-size: 25px; line-height: 1.7; }
.champion-list { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
.champion-list :deep(.song-card) { max-width: 320px; padding: 24px; background: var(--accent-light); }
.bracket-heading { margin: 44px 0 24px; padding-top: 28px; border-top: 1px solid var(--border); color: var(--text); font-family: var(--font-display); font-size: 24px; font-weight: 500; }
.xusong-confirm-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(17, 13, 27, .55); backdrop-filter: blur(6px); }
.xusong-confirm-card { width: 100%; max-width: 410px; padding: 32px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-md); }
.xusong-confirm-title { margin: 0 0 15px; color: var(--text); font-family: var(--font-display); font-size: 24px; font-weight: 500; }
.xusong-confirm-desc { margin: 0 0 26px; color: var(--text-muted); font-size: 15px; line-height: 1.9; }
.xusong-confirm-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; }
@media (max-width: 800px) {
  .idle-card { padding: 30px 26px; gap: 22px; }
  .record-sleeve { width: 148px; height: 148px; left: calc(50% - 74px); top: 50px; }
  .sleeve-0 { transform: translateX(-36px) rotate(-13deg); }
  .sleeve-2 { transform: translateX(37px) rotate(12deg); }
  .vote-cards { gap: 12px; }
  .vote-cards :deep(.song-card) { padding: 23px; }
}
@media (max-width: 640px) {
  .xusong-page { padding-bottom: 20px; }
  .song-field { inset-block-start: 80px; }
  .song-ribbon-copy { gap: 18px; padding-right: 18px; }
  .song-ribbon-copy span { font-size: 19px; line-height: 1.4; }
  .collection-tools { flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; }
  .motion-toggle { font-size: 11px; padding-inline: 4px; }
  .resume-notice { flex-wrap: wrap; gap: 0 10px; padding: 10px 12px 4px; margin-bottom: 16px; }
  .resume-notice p { font-size: 13px; }
  .notice-actions { margin-left: auto; }
  .notice-action { font-size: 12px; }
  .collection-meta { font-size: 11px; gap: 7px; }
  .idle-card { grid-template-columns: 1fr; gap: 10px; padding: 16px 18px 20px; }
  .record-collection { min-height: 112px; }
  .record-sleeve { top: 6px; left: calc(50% - 42px); width: 84px; height: 84px; padding: 3px; }
  .sleeve-0 { transform: translateX(-33px) rotate(-13deg); }
  .sleeve-1 { transform: translateY(5px) rotate(-2deg); }
  .sleeve-2 { transform: translateX(34px) rotate(12deg); }
  .collection-caption { bottom: 0; }
  .idle-copy { text-align: center; }
  .idle-kicker { font-size: 10px; }
  .idle-text { margin: 7px 0 8px; font-size: 21px; line-height: 1.5; }
  .idle-invitation { margin-bottom: 14px; font-size: 14px; line-height: 1.7; }
  .start-btn { min-height: 44px; }
  .vote-area { margin-bottom: 18px; }
  .vote-cards { position: relative; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .vote-cards :deep(.song-card) { min-width: 0; min-height: 124px; padding: 16px 13px; }
  .vote-cards :deep(.song-title) { font-size: 18px; line-height: 1.5; overflow-wrap: anywhere; }
  .vote-cards :deep(.song-meta) { margin-top: 5px; font-size: 11px; line-height: 1.6; overflow-wrap: anywhere; }
  .vs-badge { position: absolute; top: 50%; left: 50%; z-index: 1; width: 27px; height: 27px; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-base); transform: translate(-50%, -50%); pointer-events: none; }
  .vs-text { font-size: 12px; }
  .action-bar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
  .complete-actions { display: flex; }
  .bot-btn { min-height: 44px; padding: 8px 12px; font-size: 13px; }
  .stats-row { justify-content: space-between; gap: 5px 12px; margin-bottom: 10px; }
  .stat-item { font-size: 11px; }
  .progress-track { margin-bottom: 18px; }
  .skip-desc, .hint-text { font-size: 12px; line-height: 1.65; }
  .live-bracket-section { margin-top: 22px; padding-top: 16px; }
  .live-bracket-toggle { min-height: 44px; padding: 8px 12px; font-size: 13px; }
  .live-bracket-body { margin-top: 16px; }
  .champion-card { margin-bottom: 22px; }
  .champion-label { margin-bottom: 16px; font-size: 21px; }
  .champion-list { gap: 12px; }
  .champion-list :deep(.song-card) { padding: 18px; }
  .bracket-heading { margin: 24px 0 16px; padding-top: 18px; font-size: 21px; }
  .xusong-confirm-card { padding: 24px 20px; }
  .xusong-confirm-title { font-size: 21px; }
}
@media (prefers-reduced-motion: reduce) { .song-ribbon-track { animation: none; } .resume-note-enter-active, .resume-note-leave-active { transition: none; } }
</style>
