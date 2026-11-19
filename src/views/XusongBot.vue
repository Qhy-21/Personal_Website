<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTournament } from '../composables/useTournament.js'
import SongCard from '../components/SongCard.vue'
import BracketTree from '../components/BracketTree.vue'
import PageIntro from '../components/PageIntro.vue'
import SiteIcon from '../components/SiteIcon.vue'
import teaCover from '../data/interests/vae/不如吃茶去.jpg'
import breathCover from '../data/interests/vae/呼吸之野.jpg'
import debutCover from '../data/interests/vae/自定义.jpg'

const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')
const albumCovers = [debutCover, teaCover, breathCover]
const {
  round, phase, currentMatch, totalMatches, votedCount, progress,
  hasSkipped, canUndo, totalSongs, champions,
  allRounds, skippedQueue,
  initTournament, vote, skipCurrent, pass, pickRandomSkipped, undo, clearAll,
  loadState, hasSavedState, resumeFromSaved,
} = useTournament()

const showingResume = ref(false)
const bracketRef = ref<HTMLElement | null>(null)
const exporting = ref(false)
const confirmAction = ref<{ type: 'restart' | 'clear' | 'export' } | null>(null)
const showLiveBracket = ref(false)

onMounted(() => {
  if (hasSavedState()) {
    showingResume.value = true
  }
})

function handleResume() {
  loadState()
  resumeFromSaved()
  showingResume.value = false
}

function handleNewGame() {
  clearAll()
  showingResume.value = false
  initTournament()
}

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
    initTournament()
  } else if (type === 'clear') {
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
    <PageIntro
      eyebrow="SOME SONGS STAY WITH US"
      :title="t('xusongBot.title')"
      :description="isEnglish ? 'Some songs become part of your story. Pick the ones you would always come back to.' : '总有一些歌，陪你走过某段日子。一首一首选，留下最偏爱的那首。'"
    >
      <span class="collection-meta"><SiteIcon name="music" :size="16" />{{ t('xusongBot.subtitle', { n: totalSongs }) }}</span>
    </PageIntro>

    <!-- Resume modal -->
    <div v-if="showingResume" class="phase-wrap">
      <div class="pixel-card resume-card">
        <div class="resume-icon"><SiteIcon name="music" :size="28" /></div>
        <h2 class="resume-title">{{ t('xusongBot.resumeTitle') }}</h2>
        <p class="resume-desc">{{ t('xusongBot.resumeDesc') }}</p>
        <div class="resume-actions">
          <button class="bot-btn primary" @click="handleResume">{{ t('xusongBot.resumeContinue') }}</button>
          <button class="bot-btn" @click="handleNewGame">{{ t('xusongBot.resumeNew') }}</button>
        </div>
      </div>
    </div>

    <!-- Voting phase -->
    <div v-if="phase === 'voting' && !showingResume" class="phase-wrap">
      <div class="stats-row">
        <span class="stat-item">{{ t('xusongBot.round', { n: round }) }}</span>
        <span class="stat-item">{{ t('xusongBot.progress', { voted: votedCount, total: totalMatches }) }}</span>
        <span v-if="skippedQueue.length" class="stat-item accent">{{ t('xusongBot.skipped', { n: skippedQueue.length }) }}</span>
      </div>

      <div class="progress-track" role="progressbar" :aria-label="t('xusongBot.progress', { voted: votedCount, total: totalMatches })" :aria-valuenow="votedCount" :aria-valuemax="totalMatches" :aria-valuemin="0">
        <div class="progress-fill" :style="{ transform: `scaleX(${progress / 100})` }"></div>
      </div>

      <div v-if="currentMatch" class="vote-area">
        <div class="vote-cards">
          <SongCard
            :song="currentMatch.songA"
            @pick="vote('A')"
          />
          <div class="vs-badge">
            <span class="vs-text">VS</span>
          </div>
          <SongCard
            :song="currentMatch.songB"
            @pick="vote('B')"
          />
        </div>
      </div>

      <div class="action-bar">
        <button class="bot-btn" :disabled="!canUndo" @click="undo">{{ t('xusongBot.undo') }}</button>
        <button class="bot-btn" :title="t('xusongBot.skipTitle')" @click="skipCurrent">{{ t('xusongBot.skip') }}</button>
        <button class="bot-btn pass-btn" :title="t('xusongBot.passTitle')" @click="pass">{{ t('xusongBot.pass') }}</button>
        <button
          class="bot-btn accent-btn"
          :class="{ 'has-items': hasSkipped }"
          :disabled="!hasSkipped"
          :title="t('xusongBot.randomSkipTitle')"
          @click="pickRandomSkipped"
        >{{ t('xusongBot.randomSkip') }}</button>
      </div>

      <p v-if="hasSkipped" class="skip-desc">{{ t('xusongBot.randomSkipDesc') }}</p>
      <p class="hint-text">{{ t('xusongBot.hint') }}</p>

      <!-- Live bracket -->
      <div v-if="allRounds.length" class="live-bracket-section">
        <button class="live-bracket-toggle" :aria-expanded="showLiveBracket" aria-controls="live-bracket" @click="showLiveBracket = !showLiveBracket">
          <span class="bracket-toggle-mark" aria-hidden="true">{{ showLiveBracket ? '−' : '+' }}</span> {{ t('xusongBot.liveBracket', { n: allRounds.length }) }}
        </button>
        <div v-if="showLiveBracket" id="live-bracket" class="live-bracket-body">
          <BracketTree :all-rounds="allRounds" />
        </div>
      </div>
    </div>

    <!-- Complete phase -->
    <div v-if="phase === 'complete' && !showingResume" class="phase-wrap complete-phase">
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
    <div v-if="phase === 'idle' && !showingResume" class="phase-wrap">
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
        <div class="xusong-confirm-card" role="dialog" aria-modal="true" aria-labelledby="xusong-confirm-title" aria-describedby="xusong-confirm-description">
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
.xusong-page { padding-bottom: 40px; }
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
.bracket-toggle-mark { color: var(--accent-strong); font: 19px/1 var(--font-mono); }
.live-bracket-body { max-height: 420px; overflow-y: auto; margin-top: 24px; }
.resume-card { max-width: 640px; margin: 16px auto 0; padding: 44px; text-align: center; }
.resume-icon { display: inline-grid; width: 60px; height: 60px; place-items: center; margin-bottom: 22px; background: var(--accent-light); border-radius: 50%; color: var(--accent-strong); }
.resume-title { margin: 0 0 13px; color: var(--text); font-family: var(--font-display); font-size: 25px; font-weight: 500; }
.resume-desc { margin: 0 0 28px; color: var(--text-muted); font-size: 15px; line-height: 1.9; }
.resume-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
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
@media (max-width: 600px) {
  .idle-card { grid-template-columns: 1fr; gap: 14px; padding: 22px 24px 32px; }
  .record-collection { min-height: 236px; }
  .record-sleeve { top: 24px; }
  .collection-caption { bottom: 0; }
  .idle-copy { text-align: center; }
  .idle-text { font-size: 24px; }
  .idle-invitation { font-size: 15px; }
  .vote-cards { grid-template-columns: 1fr; gap: 14px; }
  .vote-cards :deep(.song-card) { min-height: 126px; padding: 24px; }
  .vs-badge { width: 100%; }
  .vs-text { font-size: 16px; }
  .action-bar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .complete-actions { display: flex; }
  .bot-btn { padding-inline: 15px; }
  .stats-row { justify-content: center; gap: 6px 18px; }
  .stat-item { font-size: 12px; }
  .progress-track { margin-bottom: 26px; }
  .resume-card { padding: 30px 24px; }
  .resume-title { font-size: 23px; }
  .xusong-confirm-card { padding: 28px 24px; }
}
</style>
